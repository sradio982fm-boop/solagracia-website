import type { SectionId } from "@/data/constants";
import { SECTION_ADS } from "@/data/ads";
import type {
  AdImageShape,
  AdPlaceholder,
  AdSlotTone,
  AdSlotVariant,
} from "@/types/ads";

/** Sections that may carry a quiet partner ad plate (MVP allowlist). */
export const AD_CAPABLE_SECTIONS = ["tentang", "program", "penyiar"] as const;

export type AdCapableSectionId = (typeof AD_CAPABLE_SECTIONS)[number];

export type AdSlotRow = {
  id: string;
  section_id: string;
  label: string | null;
  sponsor: string | null;
  line: string | null;
  variant: AdSlotVariant;
  tone: AdSlotTone | null;
  href: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_shape: AdImageShape | null;
  is_visible: boolean;
  sort_order: number;
  status: "draft" | "published";
  created_at?: string;
  updated_at?: string;
};

export type AdSlot = {
  id: string;
  sectionId: AdCapableSectionId;
  label: string;
  sponsor: string;
  line: string;
  variant: AdSlotVariant;
  tone: AdSlotTone | "";
  href: string;
  imageUrl: string;
  imageAlt: string;
  imageShape: AdImageShape | "";
  isVisible: boolean;
  sortOrder: number;
  status: "draft" | "published";
  createdAt?: string;
  updatedAt?: string;
};

export function mapAdSlot(row: Record<string, unknown>): AdSlot {
  return {
    id: row.id as string,
    sectionId: row.section_id as AdCapableSectionId,
    label: (row.label as string | null) ?? "",
    sponsor: (row.sponsor as string | null) ?? "",
    line: (row.line as string | null) ?? "",
    variant: row.variant as AdSlotVariant,
    tone: (row.tone as AdSlotTone | null) ?? "",
    href: (row.href as string | null) ?? "",
    imageUrl: (row.image_url as string | null) ?? "",
    imageAlt: (row.image_alt as string | null) ?? "",
    imageShape: (row.image_shape as AdImageShape | null) ?? "",
    isVisible: Boolean(row.is_visible),
    sortOrder: (row.sort_order as number) ?? 0,
    status: row.status as "draft" | "published",
    createdAt: row.created_at as string | undefined,
    updatedAt: row.updated_at as string | undefined,
  };
}

export function adSlotToPlaceholder(slot: AdSlot): AdPlaceholder {
  return {
    ...(slot.label ? { label: slot.label } : {}),
    ...(slot.sponsor ? { sponsor: slot.sponsor } : {}),
    ...(slot.line ? { line: slot.line } : {}),
    variant: slot.variant,
    ...(slot.tone ? { tone: slot.tone } : {}),
    ...(slot.href ? { href: slot.href } : {}),
    ...(slot.imageUrl ? { imageSrc: slot.imageUrl } : {}),
    ...(slot.imageAlt ? { imageAlt: slot.imageAlt } : {}),
    ...(slot.imageShape ? { imageShape: slot.imageShape } : {}),
  };
}

export function rowToPlaceholder(row: AdSlotRow): AdPlaceholder {
  return adSlotToPlaceholder(mapAdSlot(row as unknown as Record<string, unknown>));
}

/**
 * Build public section ads map.
 * CMS rows take precedence when published + visible; hidden/draft CMS rows suppress fallback.
 */
export function buildSectionAdsFromRows(
  rows: AdSlotRow[],
): Partial<Record<SectionId, AdPlaceholder>> {
  const result: Partial<Record<SectionId, AdPlaceholder>> = {};

  for (const sectionId of AD_CAPABLE_SECTIONS) {
    const sectionRows = rows.filter((row) => row.section_id === sectionId);

    if (sectionRows.length === 0) {
      const fallback = SECTION_ADS[sectionId];
      if (fallback) result[sectionId] = fallback;
      continue;
    }

    const live = sectionRows
      .filter((row) => row.status === "published" && row.is_visible)
      .sort((a, b) => a.sort_order - b.sort_order)[0];

    if (live) {
      result[sectionId] = rowToPlaceholder(live);
    }
  }

  return result;
}

export const AD_SECTION_LABELS: Record<AdCapableSectionId, string> = {
  tentang: "Tentang",
  program: "Program",
  penyiar: "Penyiar",
};

export const AD_VARIANT_OPTIONS: { value: AdSlotVariant; label: string }[] = [
  { value: "image", label: "Full image" },
  { value: "panel", label: "Panel + copy" },
  { value: "strip", label: "Strip + copy" },
  { value: "inline", label: "Inline thumb" },
];
