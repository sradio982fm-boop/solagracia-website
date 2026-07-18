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
    variant: "image",
    tone: "ink",
    /** 4:1 — deliver at 1600×400 or 2000×500 */
    imageShape: "banner",
    imageSrc: "/ads/about-section-ad.webp",
    imageAlt:
      "Space iklan ini bisa jadi milik kamu — jangkau audiens luas bersama S Radio",
    href: "#kontak",
  },
  program: {
    label: "Partner",
    sponsor: "Space Iklan",
    line: "Sewakan sekarang — jangkau lebih banyak audiens bersama kami.",
    variant: "panel",
    imageSrc: "/ads/program-section-ad.webp",
    imageAlt: "Space iklan program — brand Anda didengar banyak orang",
    href: "#kontak",
  },
  penyiar: {
    label: "Partner",
    sponsor: "Space Iklan",
    line: "Jangkau lebih banyak audiens bersama kami.",
    variant: "panel",
    tone: "ink",
    imageSrc: "/ads/penyiar-section-ad.webp",
    imageAlt: "Space iklan penyiar — your brand, your impact",
    href: "#kontak",
  },
};
