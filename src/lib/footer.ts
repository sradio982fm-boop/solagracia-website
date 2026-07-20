import { footerContent as fallback } from "@/data/footer";
import { marqueeItems as fallbackMarquee } from "@/data/marquee";
import { ensurePrivacyLegalLink } from "@/lib/legal";
import type { FooterContent, FooterLink } from "@/types/site";

function parseJsonArray<T>(raw: string | null | undefined, fallbackValue: T[]): T[] {
  if (!raw) return fallbackValue;
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) && parsed.length ? parsed : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function mapFooterFromConfig(
  section: Record<string, string | null> | undefined,
  options?: {
    socialLinks?: FooterLink[];
    exploreLinks?: FooterLink[];
  },
): FooterContent {
  const base: FooterContent = {
    ...fallback,
    ...(options?.socialLinks?.length ? { socialLinks: options.socialLinks } : {}),
    ...(options?.exploreLinks?.length
      ? { exploreLinks: options.exploreLinks }
      : {}),
  };

  if (!section || Object.keys(section).length === 0) return base;

  const legalLinks = ensurePrivacyLegalLink(
    parseJsonArray<FooterLink>(
      section.legal_links,
      fallback.legalLinks,
    ).filter((l) => l?.label && l?.href),
  );

  return {
    ...base,
    brandTitle: section.brand_title?.replace(/\\n/g, "\n") || base.brandTitle,
    brandDescription:
      section.brand_description?.trim() || base.brandDescription,
    copyrightText: section.copyright_text?.trim() || base.copyrightText,
    listenHref: section.listen_href?.trim() || base.listenHref,
    listenLabel: section.listen_label?.trim() || base.listenLabel,
    contactHref: section.contact_href?.trim() || base.contactHref,
    contactLabel: section.contact_label?.trim() || base.contactLabel,
    columnIkuti: section.column_ikuti?.trim() || base.columnIkuti,
    columnJelajahi: section.column_jelajahi?.trim() || base.columnJelajahi,
    wordmark: section.wordmark?.trim() || base.wordmark,
    wordmarkSub: section.wordmark_sub?.trim() || base.wordmarkSub,
    legalLinks: legalLinks.length ? legalLinks : base.legalLinks,
  };
}

export function mapMarqueeFromConfig(
  section: Record<string, string | null> | undefined,
): string[] {
  if (!section?.items) return [...fallbackMarquee];
  try {
    const parsed = JSON.parse(section.items) as string[];
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.filter((item) => typeof item === "string" && item.trim());
    }
  } catch {
    /* fallback */
  }
  return [...fallbackMarquee];
}
