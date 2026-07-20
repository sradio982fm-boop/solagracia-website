"use client";

import { useEffect } from "react";
import {
  type SectionId,
  type SectionSurface,
  isLightSurface,
} from "@/data/constants";
import { useActiveSection } from "@/hooks/useActiveSection";

type ChromeThemeSyncProps = {
  sectionIds: readonly SectionId[];
  surfaces: Record<SectionId, SectionSurface>;
};

/**
 * Syncs frame / nav chrome to black on white sections,
 * white on dark/hero sections — via html[data-chrome].
 */
export function ChromeThemeSync({
  sectionIds,
  surfaces,
}: ChromeThemeSyncProps) {
  const activeId = useActiveSection(sectionIds, "home");

  useEffect(() => {
    const surface = surfaces[activeId as SectionId] ?? "dark";
    const chrome = isLightSurface(surface) ? "light" : "dark";
    document.documentElement.dataset.chrome = chrome;

    return () => {
      delete document.documentElement.dataset.chrome;
    };
  }, [activeId, surfaces]);

  return null;
}
