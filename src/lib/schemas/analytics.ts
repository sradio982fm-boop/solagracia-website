import { z } from "zod";
import type { AnalyticsCookie } from "@/lib/analytics-writer";

const MAX_EVENTS_PER_PAYLOAD = 50;
const MAX_EVENT_DATA_LENGTH = 200;
const MAX_UA_LENGTH = 300;
const MAX_REFERRER_LENGTH = 500;
const MAX_UID_LENGTH = 64;
const MAX_SID_LENGTH = 64;
const MAX_EVENT_TYPE_LENGTH = 20;
const MAX_DURATION_SECONDS = 24 * 60 * 60;
const MAX_PAGE_VIEWS = 10_000;
export const MAX_ANALYTICS_PAYLOAD_BYTES = 8 * 1024;

const idPattern = /^[a-zA-Z0-9_-]+$/;

const analyticsEventSchema = z.object({
  t: z.string().regex(idPattern).max(MAX_EVENT_TYPE_LENGTH),
  d: z.string().max(MAX_EVENT_DATA_LENGTH).optional(),
  ts: z.number().int().nonnegative(),
});

export const analyticsPayloadSchema = z.object({
  uid: z.string().regex(idPattern).max(MAX_UID_LENGTH),
  sid: z.string().regex(idPattern).max(MAX_SID_LENGTH),
  ts: z.number().int().nonnegative(),
  dur: z.number().int().nonnegative().max(MAX_DURATION_SECONDS),
  v: z.number().int().nonnegative().max(MAX_PAGE_VIEWS),
  ua: z.string().max(MAX_UA_LENGTH).optional(),
  ref: z.string().max(MAX_REFERRER_LENGTH).optional(),
  ev: z.array(analyticsEventSchema).max(MAX_EVENTS_PER_PAYLOAD).optional(),
});

export type AnalyticsPayload = z.infer<typeof analyticsPayloadSchema>;

export function parseAnalyticsPayload(
  encoded: string | null | undefined,
): AnalyticsCookie | null {
  if (!encoded) return null;
  if (encoded.length > MAX_ANALYTICS_PAYLOAD_BYTES) return null;
  try {
    const decoded = atob(encoded);
    if (decoded.length > MAX_ANALYTICS_PAYLOAD_BYTES) return null;
    const parsed = analyticsPayloadSchema.safeParse(JSON.parse(decoded));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
