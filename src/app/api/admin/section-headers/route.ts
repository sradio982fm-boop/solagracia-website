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

/**
 * Edit-only: updates an existing section header by `section`. Never inserts.
 */
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = updateSectionHeaderSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? "Invalid body", 400);
  }

  const supabase = createSupabaseAdmin();

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (parsed.data.eyebrow !== undefined) {
    payload.eyebrow = parsed.data.eyebrow || null;
  }
  if (parsed.data.title !== undefined) {
    payload.title = parsed.data.title || null;
  }
  if (parsed.data.titleAccent !== undefined) {
    payload.title_accent = parsed.data.titleAccent || null;
  }
  if (parsed.data.description !== undefined) {
    payload.description = parsed.data.description || null;
  }

  if (Object.keys(payload).length === 1) {
    return errorResponse("No fields to update", 400);
  }

  const { data, error } = await supabase
    .from("section_headers")
    .update(payload)
    .eq("section", parsed.data.section)
    .select()
    .maybeSingle();

  if (error) return errorResponse("Failed to update section header", 500);
  if (!data) {
    return errorResponse(
      `Section header "${parsed.data.section}" not found — edit only, no insert`,
      404,
    );
  }

  revalidatePath("/");
  return jsonResponse({ header: mapSectionHeader(data) });
}
