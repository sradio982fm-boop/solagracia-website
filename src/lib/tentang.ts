import type {
  InstagramReel,
  TentangContent,
  TentangCta,
  TentangStat,
} from "@/types/site";
import { tentangContent as fallback } from "@/data/tentang";

/** Admin / CMS shape for Instagram Reel embed. */
export type CmsInstagramReel = {
  href: string;
};

/**
 * Normalize Instagram Reel URLs for embeds.
 * Strips tracking query params; only `/reel/` permalinks are accepted.
 */
export function normalizeInstagramPermalink(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (!/(^|\.)instagram\.com$/i.test(url.hostname)) return "";
    const match = url.pathname.match(/^\/reel\/([^/?#]+)/i);
    if (!match) return "";
    return `https://www.instagram.com/reel/${match[1]}/`;
  } catch {
    return "";
  }
}

/** True when href can be shown as an Instagram Reel embed iframe. */
export function isInstagramEmbeddableUrl(href: string): boolean {
  return Boolean(normalizeInstagramPermalink(href));
}

/** iframe src for Instagram official embed player. */
export function instagramEmbedSrc(href: string): string {
  const permalink = normalizeInstagramPermalink(href);
  if (!permalink) return "";
  return `${permalink}embed`;
}

export function mapCmsReel(
  raw: { href?: string } | null | undefined,
): InstagramReel {
  if (!raw || typeof raw.href !== "string") return fallback.reel;
  return { href: raw.href };
}

export function reelToCms(reel: InstagramReel): CmsInstagramReel {
  return { href: reel.href };
}

/** True when Reel rail should render (valid Instagram Reel URL). */
export function hasVisibleReel(reel: InstagramReel | null | undefined): boolean {
  return isInstagramEmbeddableUrl(reel?.href ?? "");
}

/**
 * Missing key → fallback.
 * Present key with "[]" / empty → [] (respect cleared CMS).
 */
function parseJsonArrayAllowEmpty<T>(
  section: Record<string, string | null>,
  key: string,
  fallbackValue: T[],
): T[] {
  if (!(key in section)) return fallbackValue;
  const raw = section[key];
  if (raw === null || raw === undefined || raw === "") return [];
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function parseJsonObject<T>(
  raw: string | null | undefined,
  fallbackValue: T,
): T {
  if (!raw) return fallbackValue;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallbackValue;
  }
}

export function mapTentangFromConfig(
  section: Record<string, string | null> | undefined,
  frequencyLabel?: string,
): TentangContent {
  if (!section || Object.keys(section).length === 0) {
    return {
      ...fallback,
      ...(frequencyLabel ? { frequencyLabel } : {}),
    };
  }

  const stats = parseJsonArrayAllowEmpty<TentangStat>(
    section,
    "stats",
    fallback.stats,
  ).filter((s) => s?.value && s?.label);

  const ctas = parseJsonArrayAllowEmpty<TentangCta>(
    section,
    "ctas",
    fallback.ctas,
  ).filter((c) => c?.label && c?.href);

  const body = parseJsonArrayAllowEmpty<string>(
    section,
    "body",
    fallback.body,
  ).filter((p) => typeof p === "string" && p.trim());

  // Prefer `instagram_reel`; tolerate legacy `testimonial.href` during transition.
  const reelRaw =
    "instagram_reel" in section
      ? parseJsonObject<CmsInstagramReel | InstagramReel>(
          section.instagram_reel,
          reelToCms(fallback.reel),
        )
      : parseJsonObject<{ href?: string }>(
          section.testimonial,
          reelToCms(fallback.reel),
        );

  return {
    // Present key with "" → respect empty (do not revive fallback copy).
    headline:
      "headline" in section
        ? (section.headline ?? "").trim()
        : fallback.headline,
    headlineAccent:
      "headline_accent" in section
        ? (section.headline_accent ?? "").trim()
        : fallback.headlineAccent,
    body: "body" in section ? body : fallback.body,
    stats: "stats" in section ? stats : fallback.stats,
    ctas: "ctas" in section ? (ctas.length ? ctas : []) : fallback.ctas,
    socialLabel:
      "social_label" in section
        ? (section.social_label ?? "").trim()
        : fallback.socialLabel,
    reel: mapCmsReel(reelRaw),
    ...(frequencyLabel ? { frequencyLabel } : {}),
  };
}
