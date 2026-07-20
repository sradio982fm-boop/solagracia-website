import type { NextRequest } from "next/server";

export interface VisitorInfo {
  ip: string;
  geo: {
    city?: string;
    region?: string;
    country?: string;
  };
}

/**
 * Client IP from Vercel/proxy headers — best-effort for rate limiting.
 */
export function extractClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

/**
 * Extracts geolocation from Vercel headers.
 */
export function extractGeo(request: NextRequest) {
  return {
    city: request.headers.get("x-vercel-ip-city") || undefined,
    region: request.headers.get("x-vercel-ip-country-region") || undefined,
    country: request.headers.get("x-vercel-ip-country") || undefined,
  };
}

/**
 * Extracts full visitor info (IP + geo) from a request.
 */
export function extractVisitorInfo(request: NextRequest): VisitorInfo {
  return {
    ip: extractClientIp(request),
    geo: extractGeo(request),
  };
}

/**
 * Parses a query param as a clamped integer.
 */
export function parseIntParam(
  value: string | null,
  defaultValue: number,
  min: number,
  max: number,
): number {
  const parsed = Number(value || defaultValue);
  return Math.min(max, Math.max(min, parsed));
}
