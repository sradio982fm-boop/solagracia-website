import type { SectionId } from "@/data/constants";
import type { AdPlaceholder } from "@/types/ads";

/**
 * Curated ad placeholders — quiet slots on tentang / program / penyiar.
 * Hero, partner, and kontak stay ad-free. Swap for real creatives / CMS later.
 *
 * Modes:
 * - text only
 * - image + copy (`imageSrc` on strip/panel/inline)
 * - full image (`variant: "image"`)
 */
export const SECTION_ADS: Partial<Record<SectionId, AdPlaceholder>> = {
  tentang: {
    label: "Partner",
    sponsor: "S Radio 98.2 FM",
    line: "Suara kota. Cerita yang hangat.",
    variant: "image",
    tone: "ink",
    imageSrc: "/cover-image.png",
    imageAlt: "S Radio 98.2 FM — partner Solagracia",
    href: "#",
  },
  program: {
    label: "Partner",
    sponsor: "Golden Hour Cafe",
    line: "Kopi untuk sesi malam yang panjang.",
    variant: "panel",
    imageSrc: "/cover-image.png",
    imageAlt: "Golden Hour Cafe",
    href: "#",
  },
  penyiar: {
    label: "Partner",
    sponsor: "Studio Loft Space",
    line: "Ruang rekam & gathering intim.",
    variant: "panel",
    tone: "ink",
    imageSrc: "/cover-image.png",
    imageAlt: "Studio Loft Space",
    href: "#",
  },
};
