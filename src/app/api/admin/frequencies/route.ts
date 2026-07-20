import { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { httpUrl, optionalAssetUrl, optionalHttpUrl } from "@/lib/security";
import { revalidatePath } from "next/cache";

const createFrequencySchema = z.object({
  label: z.string().min(1).max(100),
  videoUrl: optionalHttpUrl.optional(),
  audioUrl: httpUrl,
  posterUrl: optionalAssetUrl.optional(),
  stationName: z.string().max(100).optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

const updateFrequencySchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(100).optional(),
  videoUrl: optionalHttpUrl.optional(),
  audioUrl: httpUrl.optional(),
  posterUrl: optionalAssetUrl.optional(),
  stationName: z.string().max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

function mapFrequency(f: Record<string, unknown>) {
  return {
    id: f.id,
    label: f.label,
    videoUrl: f.video_url ?? "",
    audioUrl: f.audio_url ?? "",
    posterUrl: f.poster_url ?? "",
    stationName: f.station_name ?? "",
    sortOrder: f.sort_order,
    isDefault: f.is_default,
    isActive: f.is_active,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("frequencies")
    .select("*")
    .order("sort_order");

  if (error) return errorResponse("Failed to fetch frequencies", 500);

  return jsonResponse({
    frequencies: (data || []).map((f) => mapFrequency(f)),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = createFrequencySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();

  if (parsed.data.isDefault) {
    await supabase
      .from("frequencies")
      .update({ is_default: false })
      .neq("id", "00000000-0000-0000-0000-000000000000");
  }

  const { data, error } = await supabase
    .from("frequencies")
    .insert({
      label: parsed.data.label,
      video_url: parsed.data.videoUrl || null,
      audio_url: parsed.data.audioUrl,
      poster_url: parsed.data.posterUrl || null,
      station_name: parsed.data.stationName || null,
      sort_order: parsed.data.sortOrder,
      is_default: parsed.data.isDefault,
      is_active: parsed.data.isActive,
    })
    .select()
    .single();

  if (error) return errorResponse("Failed to create frequency", 500);

  revalidatePath("/");
  return jsonResponse({ frequency: mapFrequency(data) }, 201);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = updateFrequencySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();

  if (parsed.data.isDefault) {
    await supabase
      .from("frequencies")
      .update({ is_default: false })
      .neq("id", parsed.data.id);
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.label !== undefined) updates.label = parsed.data.label;
  if (parsed.data.videoUrl !== undefined)
    updates.video_url = parsed.data.videoUrl || null;
  if (parsed.data.audioUrl !== undefined) updates.audio_url = parsed.data.audioUrl;
  if (parsed.data.posterUrl !== undefined)
    updates.poster_url = parsed.data.posterUrl || null;
  if (parsed.data.stationName !== undefined)
    updates.station_name = parsed.data.stationName || null;
  if (parsed.data.sortOrder !== undefined) updates.sort_order = parsed.data.sortOrder;
  if (parsed.data.isDefault !== undefined) updates.is_default = parsed.data.isDefault;
  if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive;

  const { error } = await supabase
    .from("frequencies")
    .update(updates)
    .eq("id", parsed.data.id);
  if (error) return errorResponse("Failed to update frequency", 500);

  revalidatePath("/");
  return jsonResponse({ updated: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return errorResponse("id is required", 400);

  const supabase = createSupabaseAdmin();

  const { count } = await supabase
    .from("frequencies")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  if ((count ?? 0) <= 1) {
    return errorResponse("Cannot delete the last active frequency", 400);
  }

  const { error } = await supabase.from("frequencies").delete().eq("id", id);
  if (error) return errorResponse("Failed to delete frequency", 500);

  revalidatePath("/");
  return jsonResponse({ deleted: true });
}
