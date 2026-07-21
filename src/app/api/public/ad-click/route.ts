import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resolveAdClickDestination } from "@/lib/ad-promo";
import { errorResponse } from "@/lib/api-helpers";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const idSchema = z.string().uuid();

type AdClickRow = {
  id: string;
  section_id: string;
  sponsor: string | null;
  label: string | null;
  line: string | null;
  href: string | null;
  click_count: number;
};

async function handleAdClick(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return errorResponse("id is required", 400);

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return errorResponse("Invalid ad id", 400);

  const supabase = createSupabaseAdmin();
  const { data: ad, error } = await supabase
    .from("ad_slots")
    .select("id, section_id, sponsor, label, line, href, click_count")
    .eq("id", parsed.data)
    .eq("status", "published")
    .maybeSingle();

  if (error) return errorResponse("Failed to track click", 500);
  if (!ad) return errorResponse("Ad not found or not clickable", 404);

  const row = ad as AdClickRow;

  const { error: updateError } = await supabase
    .from("ad_slots")
    .update({ click_count: (row.click_count ?? 0) + 1 })
    .eq("id", row.id);

  if (updateError) {
    console.error("[ad-click] click_count update failed", updateError);
  }

  const destination = resolveAdClickDestination(row);
  const absolute = new URL(destination, request.nextUrl.origin);
  return NextResponse.redirect(absolute, 302);
}

export async function GET(request: NextRequest) {
  return handleAdClick(request);
}

export async function POST(request: NextRequest) {
  return handleAdClick(request);
}
