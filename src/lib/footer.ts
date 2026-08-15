import { footerContent as fallback } from "@/data/footer";
import { marqueeItems as fallbackMarquee } from "@/data/marquee";
import { parseJsonArrayAllowEmpty, textAllowEmpty } from "@/lib/cms-parse";
import { applyPrivacyFooterLink } from "@/lib/legal";
import type { FooterContent, FooterLink } from "@/types/site";

export function mapFooterFromConfig(
  section: Record<string, string | null> | undefined,
  options?: {
    socialLinks?: FooterLink[];
    exploreLinks?: FooterLink[];
    showPrivacyLink?: boolean;
  },
): FooterContent {
  const showPrivacyLink = options?.showPrivacyLink ?? true;
  const base: FooterContent = {
    ...fallback,
    ...(options?.socialLinks?.length ? { socialLinks: options.socialLinks } : {}),
    ...(options?.exploreLinks?.length
      ? { exploreLinks: options.exploreLinks }
      : {}),
  };

  if (!section || Object.keys(section).length === 0) {
    return {
      ...base,
      legalLinks: applyPrivacyFooterLink(base.legalLinks, showPrivacyLink),
    };
  }

  const parsedLegal = parseJsonArrayAllowEmpty<FooterLink>(
    section,
    "legal_links",
    fallback.legalLinks,
  ).filter((l) => l?.label && l?.href);

  const legalLinks =
    "legal_links" in section && parsedLegal.length === 0
      ? []
      : applyPrivacyFooterLink(parsedLegal, showPrivacyLink);

  return {
    ...base,
    brandTitle: textAllowEmpty(section, "brand_title", base.brandTitle).replace(
      /\\n/g,
      "\n",
    ),
    brandDescription: textAllowEmpty(
      section,
      "brand_description",
      base.brandDescription,
    ),
    copyrightText: textAllowEmpty(
      section,
      "copyright_text",
      base.copyrightText,
    ),
    listenHref: textAllowEmpty(section, "listen_href", base.listenHref),
    listenLabel: textAllowEmpty(section, "listen_label", base.listenLabel),
    contactHref: textAllowEmpty(section, "contact_href", base.contactHref),
    contactLabel: textAllowEmpty(section, "contact_label", base.contactLabel),
    columnIkuti: textAllowEmpty(section, "column_ikuti", base.columnIkuti),
    columnJelajahi: textAllowEmpty(
      section,
      "column_jelajahi",
      base.columnJelajahi,
    ),
    wordmark: textAllowEmpty(section, "wordmark", base.wordmark),
    wordmarkSub: textAllowEmpty(section, "wordmark_sub", base.wordmarkSub),
    legalLinks,
  };
}

export function mapMarqueeFromConfig(
  section: Record<string, string | null> | undefined,
): string[] {
  if (!section || !("items" in section)) return [...fallbackMarquee];
  const raw = section.items;
  if (raw === null || raw === undefined || raw === "") return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) return [...fallbackMarquee];
    return parsed.filter((item) => typeof item === "string" && item.trim());
  } catch {
    return [...fallbackMarquee];
  }
}
