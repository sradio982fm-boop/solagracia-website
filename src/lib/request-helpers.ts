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
 * Vercel geo headers (and some stored visitor rows) are percent-encoded
 * (e.g. `Central%20Jakarta`). Safe for already-decoded values.
 */
export function decodeGeoValue(
  value: string | null | undefined,
): string | undefined {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Extracts geolocation from Vercel headers.
 */
export function extractGeo(request: NextRequest) {
  return {
    city: decodeGeoValue(request.headers.get("x-vercel-ip-city")),
    region: decodeGeoValue(request.headers.get("x-vercel-ip-country-region")),
    country: decodeGeoValue(request.headers.get("x-vercel-ip-country")),
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
