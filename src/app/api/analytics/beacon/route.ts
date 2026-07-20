import { NextRequest } from "next/server";
import { processAnalytics } from "@/lib/analytics-writer";
import { extractVisitorInfo, extractClientIp } from "@/lib/request-helpers";
import {
  MAX_ANALYTICS_PAYLOAD_BYTES,
  parseAnalyticsPayload,
} from "@/lib/schemas/analytics";

export const runtime = "nodejs";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_HITS = 20;
const MAX_USER_AGENT_LENGTH = 500;
const BEACON_RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();
const NO_CONTENT_RESPONSE = new Response(null, { status: 204 });

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = BEACON_RATE_LIMIT.get(ip);
  if (!entry || now > entry.resetAt) {
    BEACON_RATE_LIMIT.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX_HITS;
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NO_CONTENT_RESPONSE;
  }

  const ip = extractClientIp(request);
  if (isRateLimited(ip)) {
    return NO_CONTENT_RESPONSE;
  }

  try {
    const body = await request.text();
    if (!body || body.length > MAX_ANALYTICS_PAYLOAD_BYTES) {
      return NO_CONTENT_RESPONSE;
    }

    const payload = parseAnalyticsPayload(body);
    if (!payload) return NO_CONTENT_RESPONSE;

    const visitor = extractVisitorInfo(request);
    const userAgent =
      request.headers.get("user-agent")?.slice(0, MAX_USER_AGENT_LENGTH) ||
      null;
    await processAnalytics(payload, visitor, userAgent);
  } catch (err) {
    console.error("analytics beacon error", err);
  }

  return NO_CONTENT_RESPONSE;
}
