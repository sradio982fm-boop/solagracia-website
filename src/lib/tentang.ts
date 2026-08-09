import type {
  SocialQuotePart,
  SocialTestimonial,
  TentangContent,
  TentangCta,
  TentangStat,
} from "@/types/site";
import { tentangContent as fallback } from "@/data/tentang";

/** Admin / CMS shape for social proof. Prefer `quote` parts; legacy fields still map. */
export type CmsTentangTestimonial = {
  platform: "x" | "threads" | "instagram";
  date: string;
  /** Rich quote parts (Phase 2 editor). */
  quote?: SocialQuotePart[];
  /** Legacy simple fields — used when `quote` absent. */
  quote_text?: string;
  mention?: string;
  link_label?: string;
  link_url?: string;
  authorName: string;
  authorHandle: string;
  authorInitials: string;
  href: string;
};

export function isRichTestimonial(
  raw: CmsTentangTestimonial | SocialTestimonial,
): raw is
  | SocialTestimonial
  | (CmsTentangTestimonial & { quote: SocialQuotePart[] }) {
  return "quote" in raw && Array.isArray(raw.quote) && raw.quote.length > 0;
}

function normalizePlatform(
  platform: string | undefined,
): SocialTestimonial["platform"] {
  if (platform === "threads") return "threads";
  if (platform === "instagram") return "instagram";
  return "x";
}

export function buildQuoteParts(input: {
  quote_text: string;
  mention?: string;
  link_label?: string;
  link_url?: string;
}): SocialQuotePart[] {
  const parts: SocialQuotePart[] = [];
  const text = input.quote_text?.trim();
  if (text) {
    parts.push({
      type: "text",
      value: text.endsWith(" ") ? text : `${text} `,
    });
  }
  if (input.mention?.trim()) {
    parts.push({ type: "mention", value: input.mention.trim() });
  }
  if (input.link_label?.trim() && input.link_url?.trim()) {
    if (parts.length > 0 && parts[parts.length - 1]?.type !== "text") {
      parts.push({ type: "text", value: " " });
    } else if (parts.length > 0) {
      const last = parts[parts.length - 1];
      if (last.type === "text" && !last.value.endsWith(" ")) {
        last.value = `${last.value} `;
      }
    }
    parts.push({
      type: "link",
      value: input.link_label.trim(),
      href: input.link_url.trim(),
    });
  }
  return parts.length ? parts : fallback.testimonial.quote;
}

export function mapCmsTestimonial(
  raw: CmsTentangTestimonial | SocialTestimonial | null | undefined,
): SocialTestimonial {
  if (!raw) return fallback.testimonial;

  if (isRichTestimonial(raw)) {
    return {
      platform: normalizePlatform(raw.platform),
      date: raw.date || fallback.testimonial.date,
      quote: raw.quote.filter((part) => {
        if (part.type === "text" || part.type === "mention") {
          return Boolean(part.value?.trim());
        }
        return Boolean(part.value?.trim() && part.href?.trim());
      }),
      authorName: raw.authorName || fallback.testimonial.authorName,
      authorHandle: raw.authorHandle || fallback.testimonial.authorHandle,
      authorInitials: raw.authorInitials || fallback.testimonial.authorInitials,
      // Explicit empty href hides the card — do not revive fallback URL.
      href: typeof raw.href === "string" ? raw.href : fallback.testimonial.href,
    };
  }

  const cms = raw as CmsTentangTestimonial;
  return {
    platform: normalizePlatform(cms.platform),
    date: cms.date || fallback.testimonial.date,
    quote: buildQuoteParts({
      quote_text: cms.quote_text || "",
      mention: cms.mention,
      link_label: cms.link_label,
      link_url: cms.link_url,
    }),
    authorName: cms.authorName || fallback.testimonial.authorName,
    authorHandle: cms.authorHandle || fallback.testimonial.authorHandle,
    authorInitials: cms.authorInitials || fallback.testimonial.authorInitials,
    href: typeof cms.href === "string" ? cms.href : fallback.testimonial.href,
  };
}

export function testimonialToCms(
  testimonial: SocialTestimonial,
): CmsTentangTestimonial {
  return {
    platform: testimonial.platform,
    date: testimonial.date,
    quote: testimonial.quote,
    authorName: testimonial.authorName,
    authorHandle: testimonial.authorHandle,
    authorInitials: testimonial.authorInitials,
    href: testimonial.href,
  };
}

/** True when social-proof card should render (needs outbound href). */
export function hasVisibleTestimonial(
  testimonial: SocialTestimonial | null | undefined,
): boolean {
  return Boolean(testimonial?.href?.trim());
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

  const testimonialRaw = parseJsonObject<
    CmsTentangTestimonial | SocialTestimonial
  >(section.testimonial, testimonialToCms(fallback.testimonial));

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
    testimonial: mapCmsTestimonial(testimonialRaw),
    ...(frequencyLabel ? { frequencyLabel } : {}),
  };
}
