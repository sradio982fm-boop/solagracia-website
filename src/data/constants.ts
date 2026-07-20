import type { NavLetter } from "@/types/site";

/**
 * Letter-rail navigation — GRACIA brand letters map 1:1 to page sections.
 */
export const LETTER_NAV: readonly NavLetter[] = [
  {
    letter: "G",
    label: "Home",
    menuLabel: "Home",
    href: "#home",
    sectionId: "home",
  },
  {
    letter: "R",
    label: "Tentang",
    menuLabel: "Tentang Kami",
    href: "#tentang",
    sectionId: "tentang",
  },
  {
    letter: "A",
    label: "Program",
    menuLabel: "Jadwal Siaran",
    href: "#program",
    sectionId: "program",
  },
  {
    letter: "C",
    label: "Penyiar",
    menuLabel: "Daftar Penyiar",
    href: "#penyiar",
    sectionId: "penyiar",
  },
  {
    letter: "I",
    label: "Partner",
    menuLabel: "Partner Kami",
    href: "#partner",
    sectionId: "partner",
  },
  {
    letter: "A",
    label: "Kontak",
    menuLabel: "Kontak Kami",
    href: "#kontak",
    sectionId: "kontak",
  },
] as const;

export type CoreSectionId = (typeof LETTER_NAV)[number]["sectionId"];

export type SectionId = CoreSectionId;

export const SECTION_IDS: readonly SectionId[] = LETTER_NAV.map(
  (link) => link.sectionId,
);

/**
 * Alternating page surfaces after hero.
 * Tentang Kami is white; then smoke (void dark) → white → smoke → white.
 */
export type SectionSurface = "dark" | "smoke" | "white";

export const SECTION_SURFACE: Record<SectionId, SectionSurface> = {
  home: "dark",
  tentang: "white",
  program: "smoke",
  penyiar: "white",
  partner: "smoke",
  kontak: "white",
};

/** Only pure white sections flip frame/nav to black */
export function isLightSurface(surface: SectionSurface): boolean {
  return surface === "white";
}

/** Left rail width — keep in sync with LetterRail + section offsets */
export const RAIL_WIDTH_PX = 64;
