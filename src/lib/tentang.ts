import type {
  InstagramReel,
  TentangContent,
  TentangCta,
  TentangStat,
} from "@/types/site";
import { tentangContent as fallback } from "@/data/tentang";
import {
  parseJsonArrayAllowEmpty,
  parseJsonObjectAllowEmpty,
  textAllowEmpty,
} from "@/lib/cms-parse";

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

  const reelKey =
    "instagram_reel" in section
      ? "instagram_reel"
      : "testimonial" in section
        ? "testimonial"
        : null;
  const reelRaw = reelKey
    ? parseJsonObjectAllowEmpty<CmsInstagramReel>(
        section,
        reelKey,
        reelToCms(fallback.reel),
      )
    : reelToCms(fallback.reel);

  return {
    headline: textAllowEmpty(section, "headline", fallback.headline),
    headlineAccent: textAllowEmpty(
      section,
      "headline_accent",
      fallback.headlineAccent,
    ),
    body,
    stats,
    ctas,
    socialLabel: textAllowEmpty(section, "social_label", fallback.socialLabel),
    reel: mapCmsReel(reelRaw),
    ...(frequencyLabel ? { frequencyLabel } : {}),
  };
}
