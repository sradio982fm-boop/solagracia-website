import type { NextRequest } from "next/server";

/**
 * API security helpers (Edge-safe — Web Crypto only).
 *
 * - `SG_API_KEY` never ships to the browser.
 * - Login sets httpOnly `sg_gate` = HMAC(userId, exp) signed with that key.
 * - `/api/admin/*` requires Bearer JWT **and** (valid gate cookie OR `x-api-key`).
 */

export const GATE_COOKIE = "sg_gate";

const GATE_MAX_AGE_SEC = 7 * 24 * 60 * 60;

function getApiKey(): string | null {
  const key = process.env.SG_API_KEY?.trim();
  return key && key.length >= 32 ? key : null;
}

/** True when SG_API_KEY is configured (production should always set this). */
export function isApiKeyConfigured(): boolean {
  return Boolean(getApiKey());
}

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hmacSha256(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return toBase64Url(sig);
}

/** Constant-time string compare (length leak avoided when lengths differ). */
export function timingSafeEqualString(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;
  for (let i = 0; i < len; i++) {
    const ca = a.charCodeAt(i) || 0;
    const cb = b.charCodeAt(i) || 0;
    mismatch |= ca ^ cb;
  }
  return mismatch === 0;
}

/** Signed gate token stored in httpOnly cookie after admin login. */
export async function createApiGateToken(userId: string): Promise<string | null> {
  const secret = getApiKey();
  if (!secret || !userId) return null;

  const exp = Math.floor(Date.now() / 1000) + GATE_MAX_AGE_SEC;
  const body = `${userId}.${exp}`;
  const sig = await hmacSha256(secret, body);
  return `${body}.${sig}`;
}

export async function verifyApiGateToken(
  token: string | undefined | null,
): Promise<boolean> {
  const secret = getApiKey();
  if (!secret || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [userId, expStr, sig] = parts;
  if (!userId || !expStr || !sig) return false;

  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = await hmacSha256(secret, `${userId}.${expStr}`);
  return timingSafeEqualString(sig, expected);
}

/** Machine / automation access via `x-api-key: <SG_API_KEY>`. */
export function hasValidApiKeyHeader(request: NextRequest): boolean {
  const secret = getApiKey();
  if (!secret) return false;
  const header = request.headers.get("x-api-key")?.trim() ?? "";
  if (!header) return false;
  return timingSafeEqualString(header, secret);
}

type RateBucket = { count: number; resetAt: number };

const rateBuckets = new Map<string, RateBucket>();

/**
 * In-memory sliding window limiter (per-instance).
 * Returns true when the caller should be rejected (429).
 */
export function isRateLimited(
  key: string,
  maxHits: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = rateBuckets.get(key);

  if (!entry || now > entry.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count += 1;
  return entry.count > maxHits;
}

/** Best-effort prune to keep the map from growing forever. */
export function pruneRateBuckets(maxEntries = 5_000): void {
  if (rateBuckets.size <= maxEntries) return;
  const now = Date.now();
  for (const [key, entry] of rateBuckets) {
    if (now > entry.resetAt) rateBuckets.delete(key);
  }
}
