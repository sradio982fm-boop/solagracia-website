import type { SectionId } from "@/data/constants";
import type { AdPlaceholder } from "@/types/ads";

/**
 * Static `/public/ads` creatives — used when no live CMS ad exists for a section.
 * Clicks open `/iklan` promo with WhatsApp CTA (section context in query).
 */
export const SECTION_ADS: Partial<Record<SectionId, AdPlaceholder>> = {
  tentang: {
    sectionId: "tentang",
    label: "Partner",
    variant: "image",
    tone: "ink",
    imageShape: "banner",
    imageSrc: "/ads/about-section-ad.webp",
    imageAlt:
      "Space iklan ini bisa jadi milik kamu — jangkau audiens luas bersama S Radio",
    href: "/iklan?from=tentang&label=Partner",
  },
  program: {
    sectionId: "program",
    label: "Partner",
    sponsor: "Space Iklan",
    line: "Sewakan sekarang — jangkau lebih banyak audiens bersama kami.",
    variant: "panel",
    imageSrc: "/ads/program-section-ad.webp",
    imageAlt: "Space iklan program — brand Anda didengar banyak orang",
    href: "/iklan?from=program&sponsor=Space+Iklan&label=Partner",
  },
  penyiar: {
    sectionId: "penyiar",
    label: "Partner",
    sponsor: "Space Iklan",
    line: "Jangkau lebih banyak audiens bersama kami.",
    variant: "panel",
    tone: "ink",
    imageSrc: "/ads/penyiar-section-ad.webp",
    imageAlt: "Space iklan penyiar — your brand, your impact",
    href: "/iklan?from=penyiar&sponsor=Space+Iklan&label=Partner",
  },
};
