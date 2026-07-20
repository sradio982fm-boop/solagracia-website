import { NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse, errorResponse } from "@/lib/api-helpers";
import { parseDateRange } from "@/lib/analytics-dates";

const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;
const NUMERIC_ID_PATTERN = /^\d+$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENT_TYPE_PATTERN = /^[a-z0-9_]{1,20}$/;
const MAX_DATE_RANGE_MS = 31 * 24 * 60 * 60 * 1000;

interface Cursor {
  timestamp: string;
  id: string;
}

function parseCursor(raw: string | null): Cursor | null {
  if (!raw) return null;
  const [timestamp, id] = raw.split("_");
  if (
    !ISO_TIMESTAMP_PATTERN.test(timestamp) ||
    !NUMERIC_ID_PATTERN.test(id)
  ) {
    return null;
  }
  return { timestamp, id };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(
    500,
    Math.max(1, Number(searchParams.get("limit") || 100)),
  );
  const cursor = parseCursor(searchParams.get("cursor"));
  const rawType = searchParams.get("type");
  const type = rawType && EVENT_TYPE_PATTERN.test(rawType) ? rawType : null;
  const { from, to } = parseDateRange(request);
  const rawVisitorId = searchParams.get("visitorId");
  const visitorId =
    rawVisitorId && UUID_PATTERN.test(rawVisitorId) ? rawVisitorId : null;

  const diff = new Date(to).getTime() - new Date(from).getTime();
  if (diff > MAX_DATE_RANGE_MS) {
    return errorResponse("Date range exceeds maximum of 31 days", 400);
  }

  const supabase = createSupabaseAdmin();

  let query = supabase
    .from("events")
    .select(`
      id, event_type, event_data, occurred_at, session_sid,
      visitor:visitors ( uid, city, country )
    `)
    .order("occurred_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.or(
      `occurred_at.lt.${cursor.timestamp},and(occurred_at.eq.${cursor.timestamp},id.lt.${cursor.id})`,
    );
  }
  if (type) query = query.eq("event_type", type);
  query = query.gte("occurred_at", from);
  query = query.lte("occurred_at", to);
  if (visitorId) query = query.eq("visitor_id", visitorId);

  const { data, error } = await query;
  if (error) return errorResponse("Failed to fetch events", 500);

  const rows = data || [];
  const hasMore = rows.length > limit;
  const events = rows.slice(0, limit).map((e) => {
    const visitorRaw = e.visitor as unknown;
    const visitor = (
      Array.isArray(visitorRaw) ? visitorRaw[0] : visitorRaw
    ) as { uid: string; city: string | null; country: string | null } | null;
    return {
      id: e.id,
      eventType: e.event_type,
      eventData: e.event_data,
      occurredAt: e.occurred_at,
      visitor: visitor
        ? { uid: visitor.uid, city: visitor.city, country: visitor.country }
        : null,
      sessionSid: e.session_sid,
    };
  });

  const lastEvent = events[events.length - 1];
  const nextCursor =
    hasMore && lastEvent ? `${lastEvent.occurredAt}_${lastEvent.id}` : null;

  return jsonResponse({ events, nextCursor, hasMore });
}
