import { z } from "zod";

const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/g;
const DANGEROUS_PROTOCOL = /^\s*(javascript|data|vbscript|file|blob):/i;

const HTTP_PROTOCOLS = new Set(["http:", "https:"]);
const WEB_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

const SAFE_HREF_FALLBACK = "#";
const HASH_HREF_PATTERN = /^#[a-zA-Z0-9_-]+$/;
/** Same-origin path — rejects protocol-relative `//evil.com`. */
const RELATIVE_PATH_PATTERN = /^\/(?!\/)[^\s]*$/;

const YOUTUBE_HOSTNAMES = new Set([
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "m.youtube.com",
]);

/**
 * Parses a URL after stripping control characters. Returns null on failure.
 * Rejects dangerous protocols before attempting to parse.
 */
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

function stripControl(raw: string): string {
  return raw.replace(CONTROL_CHARS, "").trim();
}

function hasAllowedProtocol(raw: unknown, allowed: Set<string>): boolean {
  const url = parseUrl(raw);
  return url !== null && allowed.has(url.protocol);
}

/** True when `value` is a syntactically valid http(s) URL. */
export function isSafeHttpUrl(value: unknown): value is string {
  return hasAllowedProtocol(value, HTTP_PROTOCOLS);
}

/** True when `value` is http(s), mailto:, or tel:. */
export function isSafeWebUrl(value: unknown): value is string {
  return hasAllowedProtocol(value, WEB_PROTOCOLS);
}

/** Same-origin relative path (`/foo`), not protocol-relative. */
export function isSafeRelativePath(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = stripControl(value);
  return Boolean(trimmed) && RELATIVE_PATH_PATTERN.test(trimmed);
}

/** http(s) or same-origin relative — for image/media `src`. */
export function isSafeAssetUrl(value: unknown): value is string {
  return isSafeHttpUrl(value) || isSafeRelativePath(value);
}

/**
 * Hash anchors (`#kontak`), same-origin paths, or http(s)/mailto/tel.
 * Rejects `javascript:` and other dangerous schemes.
 */
export function isSafeNavHref(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = stripControl(value);
  if (!trimmed) return false;
  return (
    HASH_HREF_PATTERN.test(trimmed) ||
    isSafeRelativePath(trimmed) ||
    isSafeWebUrl(trimmed)
  );
}

/**
 * Returns the URL if it uses a safe navigation protocol/path, otherwise a fallback.
 * Use at render time for any href that came from the DB or an external feed.
 * Allows hash anchors (`#kontak`), same-origin paths, and http(s)/mailto/tel.
 */
export function sanitizeHref(
  url: string | null | undefined,
  fallback: string = SAFE_HREF_FALLBACK,
): string {
  if (typeof url !== "string") return fallback;
  const trimmed = stripControl(url);
  if (!trimmed) return fallback;
  return isSafeNavHref(trimmed) ? trimmed : fallback;
}

/** Only returns http(s) URLs, otherwise the fallback. */
export function sanitizeHttpHref(
  url: string | null | undefined,
  fallback: string = SAFE_HREF_FALLBACK,
): string {
  if (typeof url !== "string") return fallback;
  const trimmed = stripControl(url);
  if (!trimmed) return fallback;
  return isSafeHttpUrl(trimmed) ? trimmed : fallback;
}

/**
 * Image / media `src` — http(s) or same-origin relative path.
 * Strips dangerous protocols that could be stored in CMS image fields.
 */
export function sanitizeAssetSrc(
  url: string | null | undefined,
  fallback: string = "",
): string {
  if (typeof url !== "string") return fallback;
  const trimmed = stripControl(url);
  if (!trimmed) return fallback;
  if (isSafeRelativePath(trimmed)) return trimmed;
  return isSafeHttpUrl(trimmed) ? trimmed : fallback;
}

/**
 * Extracts a YouTube video ID from a URL. Returns null if the URL is not
 * a recognised YouTube link. Used to build safe iframe embed URLs.
 */
export function extractYoutubeVideoId(
  url: string | null | undefined,
): string | null {
  const parsed = parseUrl(url);
  if (!parsed) return null;
  if (!YOUTUBE_HOSTNAMES.has(parsed.hostname)) return null;

  if (parsed.hostname === "youtu.be") {
    const id = parsed.pathname.slice(1).split("/")[0];
    return isValidVideoId(id) ? id : null;
  }

  const vParam = parsed.searchParams.get("v");
  if (vParam && isValidVideoId(vParam)) return vParam;

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (
    (segments[0] === "embed" || segments[0] === "shorts") &&
    isValidVideoId(segments[1])
  ) {
    return segments[1];
  }

  return null;
}

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;
function isValidVideoId(id: string | undefined): id is string {
  return typeof id === "string" && YOUTUBE_ID_PATTERN.test(id);
}

/** Zod schema for admin-editable http(s) URL fields. */
export const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(isSafeHttpUrl, { message: "URL must use http or https" });

/** Optional http(s) — empty string allowed for clearing a field. */
export const optionalHttpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === "" || isSafeHttpUrl(v), {
    message: "URL must use http or https",
  });

/** Optional image URL — http(s) or same-origin path. */
export const optionalAssetUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === "" || isSafeAssetUrl(v), {
    message: "Must be an http(s) URL or a same-origin path",
  });

/**
 * Optional navigation href — hash, relative path, or http(s)/mailto/tel.
 * Rejects `javascript:` and other dangerous schemes at write time.
 */
export const optionalWebHref = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => !v || isSafeNavHref(v), {
    message: "Invalid or unsafe URL",
  });

/**
 * Strict allowlist-based HTML sanitizer for admin-authored rich text.
 * Strategy: fully escape all HTML, then re-enable a tiny set of formatting
 * tags with no attributes. This makes attribute-based XSS (onerror, style,
 * href, src, srcset, etc.) impossible by construction.
 *
 * Combined with CSP, this is the primary defense against injected
 * gambling/malware scripts stored via compromised CMS content.
 */
const ALLOWED_TAGS = ["b", "strong", "i", "em", "u", "br", "span"] as const;
const ALLOWED_TAGS_PATTERN = new RegExp(
  `&lt;(\\/?)(${ALLOWED_TAGS.join("|")})\\s*\\/?&gt;`,
  "gi",
);

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";
  const escaped = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  return escaped.replace(ALLOWED_TAGS_PATTERN, (_full, close, tag) => {
    const name = String(tag).toLowerCase();
    if (name === "br") return "<br />";
    return close ? `</${name}>` : `<${name}>`;
  });
}
