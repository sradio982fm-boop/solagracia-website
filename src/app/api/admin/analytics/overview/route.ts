import { NextRequest } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth-guard";
import { jsonResponse } from "@/lib/api-helpers";
import { parseDateRange, getJakartaDay } from "@/lib/analytics-dates";

const TOP_COUNTRIES_LIMIT = 10;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  const { from, to } = parseDateRange(request);
  const supabase = createSupabaseAdmin();

  const [visitorsResult, eventsResult, sessionsResult] = await Promise.all([
    supabase
      .from("visitors")
      .select("id, city, country", { count: "exact" })
      .gte("last_seen_at", from)
      .lte("last_seen_at", to),
    supabase
      .from("events")
      .select("event_type, event_data, occurred_at")
      .gte("occurred_at", from)
      .lte("occurred_at", to),
    supabase
      .from("sessions")
      .select("duration_seconds, page_views", { count: "exact" })
      .gte("started_at", from)
      .lte("started_at", to),
  ]);

  const events = eventsResult.data || [];
  const sessions = sessionsResult.data || [];

  const summary = computeSummary(
    events,
    sessions,
    visitorsResult.count,
    sessionsResult.count,
  );
  const daily = computeDailyBreakdown(events);
  const topSections = computeTopSections(events);
  const topCountries = computeTopCountries(visitorsResult.data || []);

  return jsonResponse({
    period: { from, to },
    summary,
    daily,
    topSections,
    topCountries,
  });
}

interface EventRow {
  event_type: string;
  event_data: string | null;
  occurred_at: string;
}

interface SessionRow {
  duration_seconds: number | null;
  page_views: number | null;
}

function computeSummary(
  events: EventRow[],
  sessions: SessionRow[],
  visitorCount: number | null,
  sessionCount: number | null,
) {
  const streamPlays = events.filter((e) => e.event_type === "sp").length;
  const audioPlays = events.filter((e) => e.event_type === "ap").length;
  const contactForms = events.filter((e) => e.event_type === "cf").length;
  const totalPageViews = sessions.reduce(
    (sum, s) => sum + (s.page_views || 0),
    0,
  );
  const avgSessionDuration = sessions.length
    ? Math.round(
        sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) /
          sessions.length,
      )
    : 0;

  return {
    uniqueVisitors: visitorCount || 0,
    totalSessions: sessionCount || 0,
    totalPageViews,
    streamPlays,
    audioPlays,
    avgSessionDuration,
    contactForms,
  };
}

function computeDailyBreakdown(events: EventRow[]) {
  const dailyMap: Record<string, { streamPlays: number; audioPlays: number }> =
    {};

  for (const event of events) {
    const day = getJakartaDay(event.occurred_at);
    if (!dailyMap[day]) {
      dailyMap[day] = { streamPlays: 0, audioPlays: 0 };
    }
    if (event.event_type === "sp") dailyMap[day].streamPlays++;
    if (event.event_type === "ap") dailyMap[day].audioPlays++;
  }

  return Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, stats]) => ({ day, ...stats }));
}

function computeTopSections(events: EventRow[]) {
  const sectionViews = events.filter((e) => e.event_type === "sv");
  const sectionMap: Record<string, number> = {};

  for (const ev of sectionViews) {
    const section = ev.event_data || "unknown";
    sectionMap[section] = (sectionMap[section] || 0) + 1;
  }

  return Object.entries(sectionMap)
    .sort(([, a], [, b]) => b - a)
    .map(([sectionId, views]) => ({ sectionId, views }));
}

function computeTopCountries(visitors: { country: string | null }[]) {
  const countryMap: Record<string, number> = {};

  for (const v of visitors) {
    if (v.country) countryMap[v.country] = (countryMap[v.country] || 0) + 1;
  }

  return Object.entries(countryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, TOP_COUNTRIES_LIMIT)
    .map(([country, visitorsCount]) => ({ country, visitors: visitorsCount }));
}
