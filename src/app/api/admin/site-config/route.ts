import { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { revalidatePath } from "next/cache";

const valueTypeSchema = z.enum(["text", "image", "url", "json"]);

const singleUpdateSchema = z.object({
  section: z.string().min(1).max(50),
  key: z.string().min(1).max(100),
  value: z.string().nullable(),
  valueType: valueTypeSchema.optional().default("text"),
});

const batchUpdateSchema = z.object({
  updates: z.array(singleUpdateSchema).min(1).max(50),
});

type ConfigEntry = { value: string | null; valueType: string };

function groupSiteConfig(
  rows: Array<{
    section: string;
    key: string;
    value: string | null;
    value_type: string;
  }>,
): Record<string, Record<string, ConfigEntry>> {
  const config: Record<string, Record<string, ConfigEntry>> = {};

  for (const row of rows) {
    if (!config[row.section]) config[row.section] = {};
    config[row.section][row.key] = {
      value: row.value,
      valueType: row.value_type,
    };
  }

  return config;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_config")
    .select("section, key, value, value_type")
    .order("section")
    .order("key");

  if (error) return errorResponse("Failed to fetch site config", 500);

  return jsonResponse({ config: groupSiteConfig(data || []) });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const batch = batchUpdateSchema.safeParse(body);
  const single = singleUpdateSchema.safeParse(body);

  const updates = batch.success
    ? batch.data.updates
    : single.success
      ? [single.data]
      : null;

  if (!updates) {
    return errorResponse(
      batch.error?.issues[0]?.message ??
        single.error?.issues[0]?.message ??
        "Invalid body",
      400,
    );
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("site_config").upsert(
    updates.map((u) => ({
      section: u.section,
      key: u.key,
      value: u.value,
      value_type: u.valueType,
    })),
    { onConflict: "section,key" },
  );

  if (error) return errorResponse("Failed to update site config", 500);

  revalidatePath("/");
  return jsonResponse({ updated: updates.length });
}
