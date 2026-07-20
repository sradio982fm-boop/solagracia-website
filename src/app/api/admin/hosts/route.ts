import { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { optionalAssetUrl, optionalWebHref } from "@/lib/security";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const statusEnum = z.enum(["draft", "published"]);

const createHostSchema = z.object({
  name: z.string().min(1).max(100),
  photoUrl: optionalAssetUrl.optional(),
  photoAlt: z.string().max(200).optional().or(z.literal("")),
  roleTitle: z.string().min(1).max(100),
  tagline: z.string().min(1).max(200),
  tags: z.array(z.string().max(30)).max(5).optional().default([]),
  displayNumber: z.string().max(20).optional().or(z.literal("")),
  href: optionalWebHref.optional(),
  bio: z.string().max(1000).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).optional().default(0),
  status: statusEnum.optional().default("published"),
});

const updateHostSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  photoUrl: optionalAssetUrl.optional(),
  photoAlt: z.string().max(200).optional().or(z.literal("")),
  roleTitle: z.string().min(1).max(100).optional(),
  tagline: z.string().min(1).max(200).optional(),
  tags: z.array(z.string().max(30)).max(5).optional(),
  displayNumber: z.string().max(20).optional().or(z.literal("")),
  href: optionalWebHref.optional(),
  bio: z.string().max(1000).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).optional(),
  status: statusEnum.optional(),
});

function mapHost(h: Record<string, unknown>) {
  return {
    id: h.id,
    name: h.name,
    slug: h.slug,
    photoUrl: h.photo_url ?? "",
    photoAlt: h.photo_alt ?? "",
    roleTitle: h.role_title ?? "",
    tagline: h.tagline ?? "",
    tags: (h.tags as string[] | null) ?? [],
    displayNumber: h.display_number ?? "",
    href: h.href ?? "",
    bio: h.bio ?? "",
    sortOrder: h.sort_order,
    status: h.status,
    createdAt: h.created_at,
    updatedAt: h.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("hosts")
    .select("*")
    .order("sort_order");

  if (error) return errorResponse("Failed to fetch hosts", 500);

  return jsonResponse({ hosts: (data || []).map((h) => mapHost(h)) });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = createHostSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();
  const slug = slugify(parsed.data.name);

  const { data, error } = await supabase
    .from("hosts")
    .insert({
      name: parsed.data.name,
      slug,
      photo_url: parsed.data.photoUrl || null,
      photo_alt: parsed.data.photoAlt || null,
      role_title: parsed.data.roleTitle,
      tagline: parsed.data.tagline,
      tags: parsed.data.tags,
      display_number: parsed.data.displayNumber || null,
      href: parsed.data.href || null,
      bio: parsed.data.bio || null,
      sort_order: parsed.data.sortOrder,
      status: parsed.data.status,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return errorResponse("Penyiar dengan nama ini sudah ada", 409);
    }
    return errorResponse("Failed to create host", 500);
  }

  revalidatePath("/");
  return jsonResponse({ host: mapHost(data) }, 201);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = updateHostSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();
  const updates: Record<string, unknown> = {};

  if (parsed.data.name !== undefined) {
    updates.name = parsed.data.name;
    updates.slug = slugify(parsed.data.name);
  }
  if (parsed.data.photoUrl !== undefined) {
    updates.photo_url = parsed.data.photoUrl || null;
  }
  if (parsed.data.photoAlt !== undefined) {
    updates.photo_alt = parsed.data.photoAlt || null;
  }
  if (parsed.data.roleTitle !== undefined) {
    updates.role_title = parsed.data.roleTitle;
  }
  if (parsed.data.tagline !== undefined) updates.tagline = parsed.data.tagline;
  if (parsed.data.tags !== undefined) updates.tags = parsed.data.tags;
  if (parsed.data.displayNumber !== undefined) {
    updates.display_number = parsed.data.displayNumber || null;
  }
  if (parsed.data.href !== undefined) updates.href = parsed.data.href || null;
  if (parsed.data.bio !== undefined) updates.bio = parsed.data.bio || null;
  if (parsed.data.sortOrder !== undefined) {
    updates.sort_order = parsed.data.sortOrder;
  }
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;

  const { error } = await supabase
    .from("hosts")
    .update(updates)
    .eq("id", parsed.data.id);

  if (error) return errorResponse("Failed to update host", 500);

  revalidatePath("/");
  return jsonResponse({ updated: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return errorResponse("id is required", 400);

  const supabase = createSupabaseAdmin();

  const { data: shows } = await supabase
    .from("shows")
    .select("id")
    .eq("host_id", id)
    .eq("status", "published")
    .limit(1);

  if (shows?.length) {
    return errorResponse(
      "Tidak bisa menghapus penyiar dengan acara aktif. Pindahkan acara terlebih dahulu.",
      409,
    );
  }

  const { error } = await supabase
    .from("hosts")
    .update({ status: "draft" })
    .eq("id", id);

  if (error) return errorResponse("Failed to archive host", 500);

  revalidatePath("/");
  return jsonResponse({ archived: true });
}
