"use client";

import { ChromeThemeSync } from "@/components/layout/ChromeThemeSync";
import { LetterRail } from "@/components/layout/LetterRail";
import { NavMenu } from "@/components/layout/NavMenu";
import { SectionNav } from "@/components/layout/SectionNav";
import type { SectionId, SectionSurface } from "@/data/constants";
import type { NavLetter } from "@/types/site";

type SiteNavigationProps = {
  nav: readonly NavLetter[];
  sectionIds: readonly SectionId[];
  surfaces: Record<SectionId, SectionSurface>;
  logoSrc: string;
};

export function SiteNavigation({
  nav,
  sectionIds,
  surfaces,
  logoSrc,
}: SiteNavigationProps) {
  return (
    <>
      <ChromeThemeSync sectionIds={sectionIds} surfaces={surfaces} />
      <NavMenu links={nav} sectionIds={sectionIds} />
      <SectionNav links={nav} sectionIds={sectionIds} />
      <LetterRail links={nav} sectionIds={sectionIds} logoSrc={logoSrc} />
    </>
  );
}
