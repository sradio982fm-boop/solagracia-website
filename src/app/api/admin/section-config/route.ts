import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { requireAdmin } from "@/lib/auth-guard";
import {
  ALL_SECTION_KEYS,
  PINNED_SECTION,
  mapSectionConfigRow,
  type PublicSectionKey,
} from "@/lib/section-config";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const sectionKeySchema = z.enum(ALL_SECTION_KEYS);
const surfaceSchema = z.enum(["dark", "smoke", "white"]);

const updateItemSchema = z.object({
  section: sectionKeySchema,
  isVisible: z.boolean().optional(),
  letter: z.string().min(1).max(1).optional(),
  navLabel: z.string().min(1).max(50).optional(),
  menuLabel: z.string().min(1).max(80).optional(),
  surface: surfaceSchema.optional(),
  sortOrder: z.number().int().min(0).max(20).optional(),
});

const reorderSchema = z.object({
  order: z.array(sectionKeySchema).min(1).max(ALL_SECTION_KEYS.length),
});

const batchUpdateSchema = z.object({
  updates: z.array(updateItemSchema).min(1).max(ALL_SECTION_KEYS.length),
});

function mapRow(row: Record<string, unknown>) {
  return mapSectionConfigRow({
    id: String(row.id),
    section: String(row.section),
    is_visible: Boolean(row.is_visible),
    sort_order: Number(row.sort_order),
    letter: (row.letter as string | null) ?? null,
    nav_label: (row.nav_label as string | null) ?? null,
    menu_label: (row.menu_label as string | null) ?? null,
    surface: (row.surface as string | null) ?? null,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  });
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("section_config")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return errorResponse("Failed to fetch section config", 500);

  return jsonResponse({
    sections: (data || []).map((row) => mapRow(row as Record<string, unknown>)),
  });
}

async function applyReorder(order: PublicSectionKey[]) {
  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();

  const pinnedUpdate = await supabase
    .from("section_config")
    .update({ sort_order: 0, updated_at: now })
    .eq("section", PINNED_SECTION);

  if (pinnedUpdate.error) {
    return errorResponse("Failed to pin home section", 500);
  }

  const reorderable = order.filter((section) => section !== PINNED_SECTION);
  const results = await Promise.all(
    reorderable.map((section, index) =>
      supabase
        .from("section_config")
        .update({ sort_order: index + 1, updated_at: now })
        .eq("section", section),
    ),
  );

  const failed = results.find((result) => result.error);
  if (failed?.error) {
    return errorResponse("Failed to reorder sections", 500);
  }

  revalidatePath("/");
  return jsonResponse({ reordered: true, order: [PINNED_SECTION, ...reorderable] });
}

async function applyUpdates(
  updates: Array<z.infer<typeof updateItemSchema>>,
) {
  const supabase = createSupabaseAdmin();
  const now = new Date().toISOString();

  for (const update of updates) {
    const payload: Record<string, unknown> = { updated_at: now };

    if (update.isVisible !== undefined) payload.is_visible = update.isVisible;
    if (update.letter !== undefined) payload.letter = update.letter;
    if (update.navLabel !== undefined) payload.nav_label = update.navLabel;
    if (update.menuLabel !== undefined) payload.menu_label = update.menuLabel;
    if (update.surface !== undefined) payload.surface = update.surface;
    if (update.sortOrder !== undefined) payload.sort_order = update.sortOrder;

    const { error } = await supabase
      .from("section_config")
      .update(payload)
      .eq("section", update.section);

    if (error) {
      return errorResponse(`Failed to update section "${update.section}"`, 500);
    }
  }

  revalidatePath("/");
  return jsonResponse({ updated: updates.length });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body) return errorResponse("Invalid body", 400);

  const reorder = reorderSchema.safeParse(body);
  if (reorder.success) {
    return applyReorder(reorder.data.order);
  }

  const batch = batchUpdateSchema.safeParse(body);
  if (batch.success) {
    return applyUpdates(batch.data.updates);
  }

  const single = updateItemSchema.safeParse(body);
  if (single.success) {
    return applyUpdates([single.data]);
  }

  return errorResponse(
    reorder.error?.issues[0]?.message ??
      batch.error?.issues[0]?.message ??
      single.error?.issues[0]?.message ??
      "Invalid body",
    400,
  );
}
