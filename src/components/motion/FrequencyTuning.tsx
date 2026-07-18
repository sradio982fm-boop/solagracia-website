"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import {
  ensureGsap,
  prefersReducedMotion,
  ScrollTrigger,
  STATIONS,
} from "@/lib/gsap";

/**
 * Frequency Tuning — page-level GSAP orchestration.
 * Carrier lines, parallax, scrubbed reveals — no section pinning.
 */
export function FrequencyTuning() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const gsap = ensureGsap();
      const reduced = prefersReducedMotion();

      // —— Carrier ember lines on every station ——
      STATIONS.forEach((station) => {
        const section = document.getElementById(station.id);
        if (!section) return;

        let line = section.querySelector<HTMLElement>("[data-carrier-line]");
        if (!line) {
          line = document.createElement("div");
          line.setAttribute("data-carrier-line", "");
          line.className =
            "pointer-events-none absolute top-0 left-0 z-[2] h-px w-full origin-left bg-[var(--accent)]";
          const computed = getComputedStyle(section).position;
          if (computed === "static") {
            section.style.position = "relative";
          }
          section.prepend(line);
        }

        gsap.set(line, { scaleX: reduced ? 1 : 0 });

        if (reduced) return;

        gsap.to(line, {
          scaleX: 1,
          duration: 0.55,
          ease: "expo.out",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // —— Atmosphere parallax (decorative only) ——
      if (!reduced) {
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((layer) => {
          const amount = Number(layer.dataset.parallax || "10");
          const parent = layer.closest("section") ?? layer.parentElement;
          if (!parent) return;

          gsap.to(layer, {
            yPercent: amount,
            ease: "none",
            scrollTrigger: {
              trigger: parent,
              scrub: 0.8,
              start: "top bottom",
              end: "bottom top",
            },
          });
        });
      }

      // —— Generic section tune-ins ——
      if (!reduced) {
        document
          .querySelectorAll<HTMLElement>("[data-tune]")
          .forEach((el) => {
            gsap.from(el, {
              opacity: 0,
              y: 18,
              duration: 0.55,
              ease: "expo.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            });
          });
      }

      // —— Image scale reveals (gpt-taste) ——
      if (!reduced) {
        document
          .querySelectorAll<HTMLElement>("[data-scale-in]")
          .forEach((img) => {
            gsap.fromTo(
              img,
              { scale: 0.9, opacity: 0.55 },
              {
                scale: 1,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: img,
                  start: "top 90%",
                  end: "top 45%",
                  scrub: 0.6,
                },
              },
            );
          });
      }

      // Tentang burn lives in TentangSection (scoped to its layers).

      // —— Kontak switchboard ——
      const channels = document.querySelectorAll<HTMLElement>(
        "#kontak [data-channel]",
      );
      if (channels.length && !reduced) {
        gsap.from(channels, {
          opacity: 0,
          y: 16,
          duration: 0.45,
          stagger: 0.09,
          ease: "expo.out",
          scrollTrigger: {
            trigger: "#kontak",
            start: "top 60%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Hero cover + rail stay on Framer — GSAP opacity/x fights motion values.

      ScrollTrigger.refresh();
    },
    { scope: rootRef },
  );

  return <div ref={rootRef} className="contents" aria-hidden />;
}
