import { NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { parseDateRange } from "@/lib/analytics-dates";
import { decodeGeoValue } from "@/lib/request-helpers";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") || 50)),
  );
  const cursor = searchParams.get("cursor");
  const country = searchParams.get("country");
  const { from, to } = parseDateRange(request);

  const supabase = createSupabaseAdmin();

  let query = supabase
    .from("visitors")
    .select("*")
    .order("last_seen_at", { ascending: false })
    .limit(limit + 1);

  if (cursor) query = query.lt("last_seen_at", cursor);
  if (country) query = query.eq("country", country);
  query = query.gte("last_seen_at", from);
  query = query.lte("last_seen_at", to);

  const { data, error } = await query;
  if (error) return errorResponse("Failed to fetch visitors", 500);

  const rows = data || [];
  const hasMore = rows.length > limit;
  const visitors = rows.slice(0, limit).map((v) => ({
    id: v.id,
    uid: v.uid,
    ip: v.ip,
    city: decodeGeoValue(v.city) ?? null,
    region: decodeGeoValue(v.region) ?? null,
    country: decodeGeoValue(v.country) ?? null,
    viewport: v.viewport,
    firstSeen: v.first_seen,
    lastSeen: v.last_seen_at,
    totalSessions: v.total_sessions,
    totalPageViews: v.total_page_views,
  }));

  const nextCursor = hasMore ? visitors[visitors.length - 1]?.lastSeen : null;

  return jsonResponse({ visitors, nextCursor, hasMore });
}
