"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which section id currently owns the viewport center.
 * More reliable than "nearest top" for full-viewport stages
 * (keeps frame/nav chrome in sync on dark sections like #partner).
 */
export function useActiveSection(
  sectionIds: readonly string[],
  fallbackId: string,
): string {
  const [activeId, setActiveId] = useState(fallbackId);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const updateActive = () => {
      const marker = window.innerHeight * 0.45;
      let current = sectionIds[0] ?? fallbackId;

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= marker && rect.bottom > marker) {
          current = el.id;
        }
      }

      const scrolledToEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (scrolledToEnd) {
        current = sectionIds[sectionIds.length - 1] ?? current;
      }

      setActiveId((prev) => (prev === current ? prev : current));
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);

    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [sectionIds, fallbackId]);

  return activeId;
}
