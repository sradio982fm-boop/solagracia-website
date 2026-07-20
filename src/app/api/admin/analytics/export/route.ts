import { NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { errorResponse } from "@/lib/api-helpers";
import { parseDateRange } from "@/lib/analytics-dates";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_EXPORT_DAYS = 31;
const MAX_EXPORT_ROWS = 5000;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");
  const rawFrom = searchParams.get("from");
  const rawTo = searchParams.get("to");

  if (!type || !rawFrom || !rawTo) {
    return errorResponse("Missing required parameter: from, to, type", 400);
  }

  if (!["visitors", "events", "sessions"].includes(type)) {
    return errorResponse("Invalid type. Use: visitors, events, sessions", 400);
  }

  const fromDate = new Date(rawFrom);
  const toDate = new Date(rawTo);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return errorResponse("Invalid date range", 400);
  }

  const daysDiff =
    (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > MAX_EXPORT_DAYS) {
    return errorResponse(`Date range exceeds maximum of ${MAX_EXPORT_DAYS} days`, 400);
  }

  // Expand date-only (and midnight ISO) bounds so the end day is fully included.
  const { from, to } = parseDateRange(request);

  const supabase = createSupabaseAdmin();

  let rows: Record<string, unknown>[] = [];
  let headers: string[] = [];

  if (type === "events") {
    headers = [
      "Timestamp",
      "Event Type",
      "Event Data",
      "Session SID",
      "Visitor ID",
    ];
    const { data } = await supabase
      .from("events")
      .select("occurred_at, event_type, event_data, session_sid, visitor_id")
      .gte("occurred_at", from)
      .lte("occurred_at", to)
      .order("occurred_at", { ascending: false })
      .limit(MAX_EXPORT_ROWS);
    rows = data || [];
  } else if (type === "visitors") {
    headers = [
      "UID",
      "IP",
      "City",
      "Region",
      "Country",
      "Viewport",
      "First Seen",
      "Last Seen",
      "Sessions",
      "Page Views",
    ];
    const { data } = await supabase
      .from("visitors")
      .select(
        "uid, ip, city, region, country, viewport, first_seen, last_seen_at, total_sessions, total_page_views",
      )
      .gte("last_seen_at", from)
      .lte("last_seen_at", to)
      .order("last_seen_at", { ascending: false })
      .limit(MAX_EXPORT_ROWS);
    rows = data || [];
  } else {
    headers = ["SID", "Started At", "Duration (s)", "Page Views", "Referrer"];
    const { data } = await supabase
      .from("sessions")
      .select("sid, started_at, duration_seconds, page_views, referrer")
      .gte("started_at", from)
      .lte("started_at", to)
      .order("started_at", { ascending: false })
      .limit(MAX_EXPORT_ROWS);
    rows = data || [];
  }

  // Cells starting with these characters are interpreted as formulas by
  // Excel/Sheets — prefix so user-controlled fields stay plain text.
  const FORMULA_TRIGGERS = /^[=+\-@\t\r]/;

  function escapeCsvCell(value: unknown): string {
    const raw = String(value ?? "");
    const safe = FORMULA_TRIGGERS.test(raw) ? `'${raw}` : raw;
    return `"${safe.replace(/"/g, '""')}"`;
  }

  const csvLines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => Object.values(row).map(escapeCsvCell).join(",")),
  ];
  const csv = csvLines.join("\n");

  const filename = `solagracia-${type}-${rawFrom}-to-${rawTo}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
