import { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { AD_CAPABLE_SECTIONS, mapAdSlot } from "@/lib/ads";
import { revalidatePath } from "next/cache";

const statusEnum = z.enum(["draft", "published"]);
const variantEnum = z.enum(["strip", "panel", "inline", "image"]);
const toneEnum = z.enum(["match", "ink"]);
const imageShapeEnum = z.enum(["banner", "portrait"]);
const sectionEnum = z.enum(AD_CAPABLE_SECTIONS);

const createAdSchema = z.object({
  sectionId: sectionEnum,
  label: z.string().max(50).optional().or(z.literal("")),
  sponsor: z.string().max(100).optional().or(z.literal("")),
  line: z.string().max(200).optional().or(z.literal("")),
  variant: variantEnum,
  tone: toneEnum.optional().or(z.literal("")),
  href: z.string().max(500).optional().or(z.literal("")),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  imageAlt: z.string().max(200).optional().or(z.literal("")),
  imageShape: imageShapeEnum.optional().or(z.literal("")),
  isVisible: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
  status: statusEnum.optional().default("published"),
});

const updateAdSchema = z.object({
  id: z.string().uuid(),
  sectionId: sectionEnum.optional(),
  label: z.string().max(50).optional().or(z.literal("")),
  sponsor: z.string().max(100).optional().or(z.literal("")),
  line: z.string().max(200).optional().or(z.literal("")),
  variant: variantEnum.optional(),
  tone: toneEnum.optional().or(z.literal("")),
  href: z.string().max(500).optional().or(z.literal("")),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  imageAlt: z.string().max(200).optional().or(z.literal("")),
  imageShape: imageShapeEnum.optional().or(z.literal("")),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  status: statusEnum.optional(),
});

function toDbFields(data: {
  sectionId?: string;
  label?: string;
  sponsor?: string;
  line?: string;
  variant?: string;
  tone?: string;
  href?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageShape?: string;
  isVisible?: boolean;
  sortOrder?: number;
  status?: string;
}): Record<string, unknown> {
  const updates: Record<string, unknown> = {};
  if (data.sectionId !== undefined) updates.section_id = data.sectionId;
  if (data.label !== undefined) updates.label = data.label || null;
  if (data.sponsor !== undefined) updates.sponsor = data.sponsor || null;
  if (data.line !== undefined) updates.line = data.line || null;
  if (data.variant !== undefined) updates.variant = data.variant;
  if (data.tone !== undefined) updates.tone = data.tone || null;
  if (data.href !== undefined) updates.href = data.href || null;
  if (data.imageUrl !== undefined) updates.image_url = data.imageUrl || null;
  if (data.imageAlt !== undefined) updates.image_alt = data.imageAlt || null;
  if (data.imageShape !== undefined) updates.image_shape = data.imageShape || null;
  if (data.isVisible !== undefined) updates.is_visible = data.isVisible;
  if (data.sortOrder !== undefined) updates.sort_order = data.sortOrder;
  if (data.status !== undefined) updates.status = data.status;
  return updates;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("ad_slots")
    .select("*")
    .order("section_id")
    .order("sort_order");

  if (error) return errorResponse("Failed to fetch ads", 500);

  return jsonResponse({ ads: (data || []).map((row) => mapAdSlot(row)) });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = createAdSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("ad_slots")
    .insert(toDbFields(parsed.data))
    .select()
    .single();

  if (error) return errorResponse("Failed to create ad slot", 500);

  revalidatePath("/");
  return jsonResponse({ ad: mapAdSlot(data) }, 201);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = updateAdSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const { id, ...fields } = parsed.data;
  const updates = toDbFields(fields);
  if (Object.keys(updates).length === 0) {
    return errorResponse("No fields to update", 400);
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("ad_slots").update(updates).eq("id", id);
  if (error) return errorResponse("Failed to update ad slot", 500);

  revalidatePath("/");
  return jsonResponse({ updated: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return errorResponse("id is required", 400);

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("ad_slots").delete().eq("id", id);
  if (error) return errorResponse("Failed to delete ad slot", 500);

  revalidatePath("/");
  return jsonResponse({ deleted: true });
}
