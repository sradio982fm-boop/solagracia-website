"use client";

import { useEffect } from "react";
import {
  SECTION_IDS,
  SECTION_SURFACE,
  isLightSurface,
} from "@/data/constants";
import { useActiveSection } from "@/hooks/useActiveSection";

/**
 * Syncs frame / nav chrome to black on white sections,
 * white on dark/hero sections — via html[data-chrome].
 */
export function ChromeThemeSync() {
  const activeId = useActiveSection(SECTION_IDS, "home");

  useEffect(() => {
    const surface = SECTION_SURFACE[activeId as keyof typeof SECTION_SURFACE] ?? "dark";
    const chrome = isLightSurface(surface) ? "light" : "dark";
    document.documentElement.dataset.chrome = chrome;

    return () => {
      delete document.documentElement.dataset.chrome;
    };
  }, [activeId]);

  return null;
}
