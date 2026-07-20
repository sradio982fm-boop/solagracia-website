import type { SectionId } from "@/data/constants";
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
  starts_at: string | null;
  ends_at: string | null;
  click_count: number;
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
  startsAt: string | null;
  endsAt: string | null;
  clickCount: number;
  createdAt?: string;
  updatedAt?: string;
};

/** True when now is within [starts_at, ends_at]; null bounds are open-ended. */
export function isAdScheduledActive(
  row: Pick<AdSlotRow, "starts_at" | "ends_at">,
  now: Date = new Date(),
): boolean {
  if (row.starts_at && new Date(row.starts_at) > now) return false;
  if (row.ends_at && new Date(row.ends_at) < now) return false;
  return true;
}

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
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    clickCount: (row.click_count as number) ?? 0,
    createdAt: row.created_at as string | undefined,
    updatedAt: row.updated_at as string | undefined,
  };
}

export function adSlotToPlaceholder(slot: AdSlot): AdPlaceholder {
  return {
    id: slot.id,
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
 * Build public section ads map from CMS rows only.
 * No static SECTION_ADS injection — missing/hidden/draft = no ad plate.
 */
export function buildSectionAdsFromRows(
  rows: AdSlotRow[],
): Partial<Record<SectionId, AdPlaceholder>> {
  const result: Partial<Record<SectionId, AdPlaceholder>> = {};

  for (const sectionId of AD_CAPABLE_SECTIONS) {
    const live = rows
      .filter(
        (row) =>
          row.section_id === sectionId &&
          row.status === "published" &&
          row.is_visible &&
          isAdScheduledActive(row),
      )
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
