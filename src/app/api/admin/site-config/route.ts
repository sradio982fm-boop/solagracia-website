import { NextRequest } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { isSafeAssetUrl, isSafeNavHref } from "@/lib/security";
import { revalidatePath } from "next/cache";

const valueTypeSchema = z.enum(["text", "image", "url", "json"]);

// Any config key that ends with these suffixes is treated as a URL and must
// resolve to a safe scheme. Prevents `javascript:` payloads reaching the DB.
const URL_KEY_SUFFIXES = ["_url", "url", "_href", "href"] as const;

function isUrlKey(key: string): boolean {
  const normalized = key.toLowerCase();
  return URL_KEY_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
}

function isSafeConfigUrl(value: string, valueType: string): boolean {
  if (valueType === "image") return isSafeAssetUrl(value);
  // Nav hrefs: hash (#partner), same-origin path, http(s)/mailto/tel
  if (valueType === "url") return isSafeNavHref(value);
  return isSafeNavHref(value) || isSafeAssetUrl(value);
}

const singleUpdateSchema = z.object({
  section: z.string().min(1).max(50),
  key: z.string().min(1).max(100),
  value: z.string().nullable(),
  valueType: valueTypeSchema.optional(),
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

/**
 * Edit-only: updates existing `(section, key)` rows. Never inserts.
 * Missing keys are reported so admins can't accidentally create orphans.
 */
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

  for (const { section, key, value, valueType } of updates) {
    if (
      value &&
      (valueType === "url" || valueType === "image" || isUrlKey(key)) &&
      !isSafeConfigUrl(value, valueType ?? "url")
    ) {
      return errorResponse(
        `Field "${section}.${key}" must be a safe hash, path, or http(s)/mailto/tel URL`,
        400,
      );
    }
  }

  const supabase = createSupabaseAdmin();
  const failed: Array<{ section: string; key: string; reason: string }> = [];
  let updated = 0;

  for (const { section, key, value, valueType } of updates) {
    const payload: Record<string, unknown> = {
      value,
      updated_at: new Date().toISOString(),
    };
    if (valueType !== undefined) payload.value_type = valueType;

    const { data, error } = await supabase
      .from("site_config")
      .update(payload)
      .eq("section", section)
      .eq("key", key)
      .select("id");

    if (error) {
      failed.push({ section, key, reason: error.message });
      continue;
    }

    if (!data?.length) {
      failed.push({
        section,
        key,
        reason: "Config key not found — edit only, no insert",
      });
      continue;
    }

    updated += 1;
  }

  revalidatePath("/");

  if (failed.length === updates.length) {
    return errorResponse(
      failed[0]?.reason ?? "Config keys not found — edit only, no insert",
      404,
    );
  }

  if (failed.length > 0) {
    return jsonResponse(
      {
        updated,
        failed,
        message: `Updated ${updated}/${updates.length}, ${failed.length} failed`,
      },
      207,
    );
  }

  return jsonResponse({ updated, message: "Site config updated" });
}
