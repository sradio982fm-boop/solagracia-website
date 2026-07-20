import { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const statusEnum = z.enum(["draft", "published"]);
const optionalHostId = z.string().uuid().optional().or(z.literal(null));

const createShowSchema = z.object({
  title: z.string().min(1).max(200),
  hostId: optionalHostId,
  description: z.string().max(500).optional().or(z.literal("")),
  coverUrl: z.string().optional().or(z.literal("")),
  tag: z.string().max(50).optional().or(z.literal("")),
  status: statusEnum.optional().default("published"),
});

const updateShowSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  hostId: optionalHostId,
  description: z.string().max(500).optional().or(z.literal("")),
  coverUrl: z.string().optional().or(z.literal("")),
  tag: z.string().max(50).optional().or(z.literal("")),
  status: statusEnum.optional(),
});

function mapShow(s: Record<string, unknown>) {
  const hostRaw = s.host as unknown;
  const host = (Array.isArray(hostRaw) ? hostRaw[0] : hostRaw) as
    | { id: string; name: string }
    | null
    | undefined;

  return {
    id: s.id,
    title: s.title,
    slug: s.slug,
    description: s.description ?? "",
    coverUrl: s.cover_url ?? "",
    tag: s.tag ?? "",
    status: s.status,
    host: host ? { id: host.id, name: host.name } : null,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("shows")
    .select(
      `
      id, title, slug, description, cover_url, tag, status, created_at, updated_at,
      host:hosts ( id, name )
    `,
    )
    .order("title");

  if (error) return errorResponse("Failed to fetch shows", 500);

  return jsonResponse({ shows: (data || []).map((s) => mapShow(s)) });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = createShowSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();
  const slug = slugify(parsed.data.title);

  const { data, error } = await supabase
    .from("shows")
    .insert({
      title: parsed.data.title,
      slug,
      host_id: parsed.data.hostId ?? null,
      description: parsed.data.description || null,
      cover_url: parsed.data.coverUrl || null,
      tag: parsed.data.tag || null,
      status: parsed.data.status,
    })
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return errorResponse("Acara dengan judul ini sudah ada", 409);
    }
    return errorResponse("Failed to create show", 500);
  }

  revalidatePath("/");
  return jsonResponse({ id: data.id, slug: data.slug }, 201);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = updateShowSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();
  const updates: Record<string, unknown> = {};

  if (parsed.data.title !== undefined) {
    updates.title = parsed.data.title;
    updates.slug = slugify(parsed.data.title);
  }
  if (parsed.data.hostId !== undefined) {
    updates.host_id = parsed.data.hostId ?? null;
  }
  if (parsed.data.description !== undefined) {
    updates.description = parsed.data.description || null;
  }
  if (parsed.data.coverUrl !== undefined) {
    updates.cover_url = parsed.data.coverUrl || null;
  }
  if (parsed.data.tag !== undefined) updates.tag = parsed.data.tag || null;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;

  const { error } = await supabase
    .from("shows")
    .update(updates)
    .eq("id", parsed.data.id);

  if (error) return errorResponse("Failed to update show", 500);

  revalidatePath("/");
  return jsonResponse({ updated: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return errorResponse("id is required", 400);

  const supabase = createSupabaseAdmin();

  const { data: slots } = await supabase
    .from("schedule_slots")
    .select("id")
    .eq("show_id", id)
    .limit(1);

  if (slots?.length) {
    return errorResponse(
      "Tidak bisa menghapus acara yang masih punya slot jadwal. Hapus slot jadwal terlebih dahulu.",
      409,
    );
  }

  const { error } = await supabase
    .from("shows")
    .update({ status: "draft" })
    .eq("id", id);

  if (error) return errorResponse("Failed to delete show", 500);

  revalidatePath("/");
  return jsonResponse({ archived: true });
}
