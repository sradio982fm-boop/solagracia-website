import { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

const statusEnum = z.enum(["draft", "published"]);
const MAX_PUBLISHED_PLANS = 3;

const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.string().min(1).max(30),
  unit: z.string().max(30).optional().or(z.literal("")),
  features: z.array(z.string().min(1).max(120)).min(1).max(8),
  isFeatured: z.boolean().optional().default(false),
  whatsappMessage: z.string().max(500).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).optional().default(0),
  status: statusEnum.optional().default("published"),
});

const updatePlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  price: z.string().min(1).max(30).optional(),
  unit: z.string().max(30).optional().or(z.literal("")),
  features: z.array(z.string().min(1).max(120)).min(1).max(8).optional(),
  isFeatured: z.boolean().optional(),
  whatsappMessage: z.string().max(500).optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).optional(),
  status: statusEnum.optional(),
});

function mapPlan(p: Record<string, unknown>) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    unit: p.unit ?? "",
    features: (p.features as string[] | null) ?? [],
    isFeatured: Boolean(p.is_featured),
    whatsappMessage: p.whatsapp_message ?? "",
    sortOrder: p.sort_order,
    status: p.status,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

async function countPublishedPlans(
  supabase: ReturnType<typeof createSupabaseAdmin>,
  excludeId?: string,
): Promise<number> {
  let query = supabase
    .from("sponsorship_plans")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  if (excludeId) query = query.neq("id", excludeId);

  const { count } = await query;
  return count ?? 0;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("sponsorship_plans")
    .select("*")
    .order("sort_order");

  if (error) return errorResponse("Failed to fetch sponsorship plans", 500);

  const publishedCount = (data || []).filter((p) => p.status === "published").length;

  return jsonResponse({
    plans: (data || []).map((p) => mapPlan(p)),
    publishedCount,
    maxPublished: MAX_PUBLISHED_PLANS,
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = createPlanSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();

  if (parsed.data.status === "published") {
    const published = await countPublishedPlans(supabase);
    if (published >= MAX_PUBLISHED_PLANS) {
      return errorResponse(
        "Maksimal 3 paket sponsorship yang dipublikasikan. Arsipkan atau ubah status paket lain terlebih dahulu.",
        400,
      );
    }
  }

  if (parsed.data.isFeatured) {
    await supabase
      .from("sponsorship_plans")
      .update({ is_featured: false })
      .neq("id", "00000000-0000-0000-0000-000000000000");
  }

  const { data, error } = await supabase
    .from("sponsorship_plans")
    .insert({
      name: parsed.data.name,
      price: parsed.data.price,
      unit: parsed.data.unit || null,
      features: parsed.data.features,
      is_featured: parsed.data.isFeatured,
      whatsapp_message: parsed.data.whatsappMessage || null,
      sort_order: parsed.data.sortOrder,
      status: parsed.data.status,
    })
    .select()
    .single();

  if (error) return errorResponse("Failed to create sponsorship plan", 500);

  revalidatePath("/");
  return jsonResponse({ plan: mapPlan(data) }, 201);
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = updatePlanSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();

  if (parsed.data.status === "published") {
    const published = await countPublishedPlans(supabase, parsed.data.id);
    if (published >= MAX_PUBLISHED_PLANS) {
      return errorResponse(
        "Maksimal 3 paket sponsorship yang dipublikasikan. Arsipkan atau ubah status paket lain terlebih dahulu.",
        400,
      );
    }
  }

  if (parsed.data.isFeatured) {
    await supabase
      .from("sponsorship_plans")
      .update({ is_featured: false })
      .neq("id", parsed.data.id);
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.price !== undefined) updates.price = parsed.data.price;
  if (parsed.data.unit !== undefined) updates.unit = parsed.data.unit || null;
  if (parsed.data.features !== undefined) updates.features = parsed.data.features;
  if (parsed.data.isFeatured !== undefined) {
    updates.is_featured = parsed.data.isFeatured;
  }
  if (parsed.data.whatsappMessage !== undefined) {
    updates.whatsapp_message = parsed.data.whatsappMessage || null;
  }
  if (parsed.data.sortOrder !== undefined) updates.sort_order = parsed.data.sortOrder;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;

  const { error } = await supabase
    .from("sponsorship_plans")
    .update(updates)
    .eq("id", parsed.data.id);

  if (error) return errorResponse("Failed to update sponsorship plan", 500);

  revalidatePath("/");
  return jsonResponse({ updated: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return errorResponse("id is required", 400);

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("sponsorship_plans").delete().eq("id", id);

  if (error) return errorResponse("Failed to delete sponsorship plan", 500);

  revalidatePath("/");
  return jsonResponse({ deleted: true });
}
