import { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { optionalAssetUrl, optionalHttpUrl } from "@/lib/security";
import { revalidatePath } from "next/cache";

const statusEnum = z.enum(["draft", "published"]);
const MAX_PARTNERS = 24;

const createPartnerSchema = z.object({
  name: z.string().min(1).max(100),
  initials: z.string().min(1).max(4),
  logoUrl: optionalAssetUrl.optional(),
  href: optionalHttpUrl.optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
  status: statusEnum.optional().default("published"),
});

const updatePartnerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  initials: z.string().min(1).max(4).optional(),
  logoUrl: optionalAssetUrl.optional(),
  href: optionalHttpUrl.optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: statusEnum.optional(),
});

function mapPartner(p: Record<string, unknown>) {
  return {
    id: p.id,
    name: p.name,
    initials: p.initials,
    logoUrl: p.logo_url ?? "",
    href: p.href ?? "",
    sortOrder: p.sort_order,
    status: p.status,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .order("sort_order");

  if (error) return errorResponse("Failed to fetch partners", 500);

  return jsonResponse({ partners: (data || []).map((p) => mapPartner(p)) });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = createPartnerSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();

  const { count } = await supabase
    .from("partners")
    .select("id", { count: "exact", head: true });

  if ((count ?? 0) >= MAX_PARTNERS) {
    return errorResponse(
      `Maksimal ${MAX_PARTNERS} partner riwayat. Hapus atau arsipkan yang lama terlebih dahulu.`,
      400,
    );
  }

  const { data, error } = await supabase
    .from("partners")
    .insert({
      name: parsed.data.name,
      initials: parsed.data.initials.toUpperCase(),
      logo_url: parsed.data.logoUrl || null,
      href: parsed.data.href || null,
      sort_order: parsed.data.sortOrder,
      status: parsed.data.status,
    })
    .select()
    .single();

  if (error) return errorResponse("Failed to create partner", 500);

  revalidatePath("/");
  return jsonResponse({ partner: mapPartner(data) }, 201);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = updatePartnerSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();
  const updates: Record<string, unknown> = {};

  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.initials !== undefined) {
    updates.initials = parsed.data.initials.toUpperCase();
  }
  if (parsed.data.logoUrl !== undefined) {
    updates.logo_url = parsed.data.logoUrl || null;
  }
  if (parsed.data.href !== undefined) updates.href = parsed.data.href || null;
  if (parsed.data.sortOrder !== undefined) {
    updates.sort_order = parsed.data.sortOrder;
  }
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;

  const { error } = await supabase
    .from("partners")
    .update(updates)
    .eq("id", parsed.data.id);

  if (error) return errorResponse("Failed to update partner", 500);

  revalidatePath("/");
  return jsonResponse({ updated: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return errorResponse("id is required", 400);

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("partners").delete().eq("id", id);

  if (error) return errorResponse("Failed to delete partner", 500);

  revalidatePath("/");
  return jsonResponse({ deleted: true });
}
