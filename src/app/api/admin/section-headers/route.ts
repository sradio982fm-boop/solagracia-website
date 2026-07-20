import { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

const updateSectionHeaderSchema = z.object({
  section: z.string().min(1).max(50),
  eyebrow: z.string().max(200).optional(),
  title: z.string().max(300).optional(),
  titleAccent: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
});

function mapSectionHeader(row: Record<string, unknown>) {
  return {
    id: row.id,
    section: row.section,
    eyebrow: row.eyebrow ?? "",
    title: row.title ?? "",
    titleAccent: row.title_accent ?? "",
    description: row.description ?? "",
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("section_headers")
    .select("*")
    .order("section");

  if (error) return errorResponse("Failed to fetch section headers", 500);

  return jsonResponse({
    headers: (data || []).map((row) => mapSectionHeader(row)),
  });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = updateSectionHeaderSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();

  const { data: existing } = await supabase
    .from("section_headers")
    .select("*")
    .eq("section", parsed.data.section)
    .maybeSingle();

  const payload = {
    section: parsed.data.section,
    eyebrow:
      parsed.data.eyebrow !== undefined
        ? parsed.data.eyebrow || null
        : (existing?.eyebrow ?? null),
    title:
      parsed.data.title !== undefined
        ? parsed.data.title || null
        : (existing?.title ?? null),
    title_accent:
      parsed.data.titleAccent !== undefined
        ? parsed.data.titleAccent || null
        : (existing?.title_accent ?? null),
    description:
      parsed.data.description !== undefined
        ? parsed.data.description || null
        : (existing?.description ?? null),
  };

  const { data, error } = await supabase
    .from("section_headers")
    .upsert(payload, { onConflict: "section" })
    .select()
    .single();

  if (error) return errorResponse("Failed to update section header", 500);

  revalidatePath("/");
  return jsonResponse({ header: mapSectionHeader(data) });
}
