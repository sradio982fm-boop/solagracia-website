"use client";

import Image from "next/image";
import { SECTION_IDS } from "@/data/constants";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/utils";
import type { NavLetter } from "@/types/site";

type LetterRailProps = {
  links: readonly NavLetter[];
  logoSrc: string;
};

export function LetterRail({ links, logoSrc }: LetterRailProps) {
  const activeId = useActiveSection(SECTION_IDS, "home");

  return (
    <aside
      className="pointer-events-none fixed z-40 hidden w-[var(--rail)] md:block"
      style={{
        top: "var(--frame-inset)",
        left: "var(--frame-inset)",
      }}
      aria-label="Navigasi utama"
    >
      <div className="pointer-events-auto flex w-[var(--rail)] flex-col">
        <a
          href="#home"
          className="relative block h-[var(--rail)] w-[var(--rail)] shrink-0 overflow-hidden border-r border-b border-[var(--frame-line)] bg-transparent transition-[border-color] duration-300 hover:opacity-90"
          aria-label="Solagracia — beranda"
        >
          <Image
            src={logoSrc}
            alt=""
            fill
            sizes="64px"
            className="object-contain p-1.5"
            priority
          />
        </a>

        <nav className="flex flex-col" aria-label="Bagian">
          {links.map((link) => {
            const isActive = link.sectionId === activeId;

            return (
              <div key={link.sectionId} className="group relative shrink-0">
                <a
                  href={link.href}
                  className={cn(
                    "relative flex h-[var(--rail)] w-[var(--rail)] items-center justify-center border-r border-b border-[var(--frame-line)] bg-[var(--chrome-bg-soft)] text-[22px] font-extrabold tracking-wide transition-[color,border-color,background-color] duration-300",
                    isActive
                      ? "bg-[var(--chrome-fg)] text-[var(--chrome-on-active)]"
                      : "text-[var(--chrome-fg-muted)] hover:bg-[var(--chrome-hover)] hover:text-[var(--chrome-fg)]",
                  )}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={link.label}
                >
                  {link.letter}
                </a>

                <span
                  className={cn(
                    "pointer-events-none absolute top-1/2 left-full z-10 flex -translate-y-1/2 items-center gap-2 pl-1 transition-opacity duration-200",
                    isActive
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
                  )}
                  aria-hidden
                >
                  <span className="h-px w-3 bg-[var(--chrome-mark)] transition-colors duration-300" />
                  <span className="text-[9px] font-medium tracking-[0.12em] text-[var(--chrome-fg-muted)] uppercase transition-colors duration-300">
                    {link.label}
                  </span>
                </span>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
