import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { errorResponse } from "@/lib/api-helpers";
import { isSafeHttpUrl } from "@/lib/security";

const idSchema = z.string().uuid();

async function handleAdClick(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return errorResponse("id is required", 400);

  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return errorResponse("Invalid ad id", 400);

  const supabase = createSupabaseAdmin();
  const { data: href, error } = await supabase.rpc("increment_ad_click", {
    p_id: parsed.data,
  });

  if (error) return errorResponse("Failed to track click", 500);
  if (!href || typeof href !== "string" || !isSafeHttpUrl(href)) {
    return errorResponse("Ad not found or not clickable", 404);
  }

  return NextResponse.redirect(href, 302);
}

export async function GET(request: NextRequest) {
  return handleAdClick(request);
}

export async function POST(request: NextRequest) {
  return handleAdClick(request);
}
