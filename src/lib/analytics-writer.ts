import { createClient } from "@supabase/supabase-js";
import type { VisitorInfo } from "./request-helpers";

export interface AnalyticsCookie {
  uid: string;
  sid: string;
  ts: number;
  dur: number;
  v: number;
  ua?: string;
  ref?: string;
  ev?: { t: string; d?: string; ts: number }[];
}

export async function processAnalytics(
  payload: AnalyticsCookie,
  visitor: VisitorInfo,
  userAgent?: string | null,
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: visitorRow } = await supabase
    .from("visitors")
    .upsert(
      {
        uid: payload.uid,
        ip: maskIp(visitor.ip),
        city: visitor.geo.city || null,
        region: visitor.geo.region || null,
        country: visitor.geo.country || null,
        viewport: payload.ua || null,
        last_seen_at: new Date().toISOString(),
        total_page_views: payload.v || 0,
      },
      { onConflict: "uid" },
    )
    .select("id")
    .single();

  if (!visitorRow) return;

  await supabase.from("sessions").upsert(
    {
      sid: payload.sid,
      visitor_id: visitorRow.id,
      started_at: new Date(payload.ts).toISOString(),
      duration_seconds: payload.dur || 0,
      page_views: payload.v || 0,
      referrer: payload.ref || null,
      user_agent: userAgent || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "sid" },
  );

  if (payload.ev?.length) {
    const events = payload.ev.map((ev) => ({
      session_sid: payload.sid,
      visitor_id: visitorRow.id,
      event_type: ev.t,
      event_data: ev.d || null,
      occurred_at: new Date(ev.ts).toISOString(),
    }));

    await supabase.from("events").insert(events);
  }
}

function maskIp(ip: string): string {
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
  }
  return ip;
}
