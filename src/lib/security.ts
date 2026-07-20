import { z } from "zod";

const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/g;
const DANGEROUS_PROTOCOL = /^\s*(javascript|data|vbscript|file|blob):/i;

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);
const WEB_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

const SAFE_HREF_FALLBACK = "#";
const HASH_HREF_PATTERN = /^#[a-zA-Z0-9_-]+$/;

function parseUrl(raw: unknown): URL | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(CONTROL_CHARS, "").trim();
  if (!cleaned || DANGEROUS_PROTOCOL.test(cleaned)) return null;
  try {
    return new URL(cleaned);
  } catch {
    return null;
  }
}

function hasAllowedProtocol(raw: unknown, allowed: Set<string>): boolean {
  const url = parseUrl(raw);
  return url !== null && allowed.has(url.protocol);
}

export function isSafeHttpUrl(value: unknown): value is string {
  return hasAllowedProtocol(value, HTTP_PROTOCOLS);
}

export function isSafeWebUrl(value: unknown): value is string {
  return hasAllowedProtocol(value, WEB_PROTOCOLS);
}

export function sanitizeHref(
  url: string | null | undefined,
  fallback: string = SAFE_HREF_FALLBACK,
): string {
  if (typeof url !== "string") return fallback;
  const trimmed = url.replace(CONTROL_CHARS, "").trim();
  if (!trimmed) return fallback;
  if (HASH_HREF_PATTERN.test(trimmed)) return trimmed;
  return isSafeWebUrl(trimmed) ? trimmed : fallback;
}

/** Absolute http(s) URL — used for stream + outbound links. */
export const httpUrl = z
  .string()
  .url()
  .refine((v) => /^https?:\/\//i.test(v), "Must be an http(s) URL");
