"use client";

import { useEffect, useRef, useState } from "react";
import {
  ensureGsap,
  prefersReducedMotion,
  ScrollTrigger,
  STATIONS,
} from "@/lib/gsap";

/**
 * Desktop HUD — radio dial needle tracks which GRACIA station you're on.
 * Pure atmosphere; pointer-events none.
 */
export function SignalNeedle() {
  const needleRef = useRef<SVGLineElement>(null);
  const [label, setLabel] = useState<string>(STATIONS[0].label);
  const [hz, setHz] = useState<string>(STATIONS[0].hz);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.matchMedia("(max-width: 1023px)").matches) return;

    ensureGsap();

    const tune = (index: number, station: (typeof STATIONS)[number]) => {
      setLabel(station.label);
      setHz(station.hz);
      if (!needleRef.current) return;
      ensureGsap().to(needleRef.current, {
        rotate: (index / (STATIONS.length - 1)) * 140 - 70,
        duration: 0.55,
        ease: "expo.out",
        transformOrigin: "50% 100%",
      });
    };

    const triggers = STATIONS.map((station, index) => {
      const el = document.getElementById(station.id);
      if (!el) return null;

      return ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onEnter: () => tune(index, station),
        onEnterBack: () => tune(index, station),
      });
    }).filter(Boolean);

    return () => {
      triggers.forEach((t) => t?.kill());
    };
  }, []);

  return (
    <aside
      className="pointer-events-none fixed top-1/2 right-[max(0.75rem,var(--frame-inset))] z-[42] hidden -translate-y-1/2 flex-col items-center gap-2 lg:flex"
      aria-hidden
    >
      <p className="m-0 text-[8px] font-bold tracking-[0.22em] text-[var(--chrome-fg-muted)] uppercase">
        {label}
      </p>
      <svg width="56" height="40" viewBox="0 0 56 40" className="text-[var(--accent)]">
        <path
          d="M6 34 A22 22 0 0 1 50 34"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <line
          ref={needleRef}
          x1="28"
          y1="34"
          x2="28"
          y2="12"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ transformOrigin: "28px 34px" }}
        />
        <circle cx="28" cy="34" r="2.5" fill="currentColor" />
      </svg>
      <p className="m-0 font-mono text-[10px] font-semibold tracking-[0.08em] text-[var(--chrome-fg)] tabular-nums">
        {hz}
      </p>
    </aside>
  );
}
