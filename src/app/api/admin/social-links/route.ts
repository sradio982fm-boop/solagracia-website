import { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { httpUrl } from "@/lib/security";
import { revalidatePath } from "next/cache";

const createSchema = z.object({
  platform: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  url: httpUrl,
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  platform: z.string().min(1).max(50).optional(),
  label: z.string().min(1).max(100).optional(),
  url: httpUrl.optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

function mapRow(l: Record<string, unknown>) {
  return {
    id: l.id,
    platform: l.platform,
    label: l.label,
    url: l.url,
    sortOrder: l.sort_order,
    isActive: l.is_active,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .order("sort_order");

  if (error) return errorResponse("Failed to fetch social links", 500);
  return jsonResponse({ links: (data || []).map(mapRow) });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid", 400);
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("social_links")
    .insert({
      platform: parsed.data.platform,
      label: parsed.data.label,
      url: parsed.data.url,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive,
    })
    .select()
    .single();

  if (error) return errorResponse("Failed to create social link", 500);
  revalidatePath("/");
  return jsonResponse({ link: mapRow(data) }, 201);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid", 400);
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.platform !== undefined) updates.platform = parsed.data.platform;
  if (parsed.data.label !== undefined) updates.label = parsed.data.label;
  if (parsed.data.url !== undefined) updates.url = parsed.data.url;
  if (parsed.data.sortOrder !== undefined) updates.sort_order = parsed.data.sortOrder;
  if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive;

  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from("social_links")
    .update(updates)
    .eq("id", parsed.data.id);

  if (error) return errorResponse("Failed to update social link", 500);
  revalidatePath("/");
  return jsonResponse({ updated: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return errorResponse("id is required", 400);

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) return errorResponse("Failed to delete social link", 500);

  revalidatePath("/");
  return jsonResponse({ deleted: true });
}
