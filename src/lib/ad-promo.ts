import { whatsappHref } from "@/data/partner";
import { isSafeHttpUrl, isSafeRelativePath } from "@/lib/security";
import type { AdCapableSectionId } from "@/types/ads";

export const AD_PROMO_PATH = "/iklan";

const SECTION_LABELS: Record<AdCapableSectionId, string> = {
  tentang: "Tentang",
  program: "Program",
  penyiar: "Penyiar",
};

export type AdPromoSource = {
  from?: string | null;
  id?: string | null;
  sponsor?: string | null;
  label?: string | null;
  line?: string | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Short ref shown on /iklan and in WhatsApp prefill — first 8 of UUID. */
export function formatAdPromoRef(id: string): string {
  return id.slice(0, 8);
}

export function isAdPromoId(value: string | null | undefined): boolean {
  return Boolean(value && UUID_RE.test(value));
}

/** Prefer live CMS fields; keep URL params as fallback fill. */
export function mergeAdPromoSource(
  base: AdPromoSource,
  live: AdPromoSource | null | undefined,
): AdPromoSource {
  if (!live) return base;
  return {
    id: live.id ?? base.id,
    from: live.from ?? base.from,
    sponsor: live.sponsor ?? base.sponsor,
    label: live.label ?? base.label,
    line: live.line ?? base.line,
  };
}

export function isAdCapableSection(
  value: string | null | undefined,
): value is AdCapableSectionId {
  return value === "tentang" || value === "program" || value === "penyiar";
}

/** Public promo path with tracking context for WhatsApp prefill. */
export function buildIklanPath(source: AdPromoSource): string {
  const params = new URLSearchParams();
  if (source.from && isAdCapableSection(source.from)) {
    params.set("from", source.from);
  }
  if (source.id) params.set("id", source.id);
  if (source.sponsor?.trim()) params.set("sponsor", source.sponsor.trim());
  if (source.label?.trim()) params.set("label", source.label.trim());
  if (source.line?.trim()) params.set("line", source.line.trim());
  const qs = params.toString();
  return qs ? `${AD_PROMO_PATH}?${qs}` : AD_PROMO_PATH;
}

export function parseAdPromoSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AdPromoSource {
  const one = (key: string) => {
    const raw = searchParams[key];
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : null;
  };
  return {
    from: one("from"),
    id: one("id"),
    sponsor: one("sponsor"),
    label: one("label"),
    line: one("line"),
  };
}

/** Prefill text for wa.me — includes which slot was clicked. */
export function buildAdWhatsAppMessage(source: AdPromoSource): string {
  const section = isAdCapableSection(source.from)
    ? SECTION_LABELS[source.from]
    : null;
  const sponsor = source.sponsor?.trim() || source.label?.trim() || null;
  const lines = [
    "Halo Solagracia, saya tertarik memasang iklan di frekuensi loft.",
  ];
  if (section) lines.push(`Sumber klik: slot ${section} (homepage).`);
  if (sponsor) lines.push(`Creative: ${sponsor}.`);
  if (source.line?.trim()) lines.push(source.line.trim());
  if (source.id) lines.push(`Ref: ${formatAdPromoRef(source.id)}.`);
  lines.push("Mohon info paket dan ketersediaan slot.");
  return lines.join("\n");
}

export function buildAdWhatsAppHref(
  whatsappNumber: string,
  source: AdPromoSource,
): string {
  return whatsappHref(whatsappNumber, buildAdWhatsAppMessage(source));
}

/**
 * External http(s) partner URLs keep a hard redirect.
 * Hash / relative / empty hrefs open the Solagracia promo page instead.
 */
export function resolveAdClickDestination(ad: {
  id: string;
  section_id: string;
  sponsor: string | null;
  label: string | null;
  line?: string | null;
  href: string | null;
}): string {
  const href = ad.href?.trim() ?? "";
  if (href && isSafeHttpUrl(href)) return href;

  if (href && isSafeRelativePath(href) && href.startsWith(AD_PROMO_PATH)) {
    return href;
  }

  return buildIklanPath({
    from: ad.section_id,
    id: ad.id,
    sponsor: ad.sponsor,
    label: ad.label,
    line: ad.line,
  });
}

export function adSlotRowToPromoSource(row: {
  id: string;
  section_id: string;
  sponsor: string | null;
  label: string | null;
  line?: string | null;
}): AdPromoSource {
  return {
    id: row.id,
    from: row.section_id,
    sponsor: row.sponsor,
    label: row.label,
    line: row.line ?? null,
  };
}
