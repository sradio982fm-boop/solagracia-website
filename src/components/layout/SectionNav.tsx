"use client";

import type { SectionId } from "@/data/constants";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/utils";
import type { NavLetter } from "@/types/site";

type SectionNavProps = {
  links: readonly NavLetter[];
  sectionIds: readonly SectionId[];
};

/**
 * Prev / next section controls — labeled for clarity, parked above the
 * sticky radio player so the player never shoves them aside.
 */
export function SectionNav({ links, sectionIds }: SectionNavProps) {
  const activeId = useActiveSection(sectionIds, "home");
  const index = Math.max(
    0,
    sectionIds.findIndex((id) => id === activeId),
  );

  const prev = index > 0 ? links[index - 1] : null;
  const next = index < links.length - 1 ? links[index + 1] : null;

  return (
    <div
      className="pointer-events-none fixed z-[44] hidden md:block"
      style={{
        right: "var(--frame-inset)",
        bottom: "calc(var(--frame-inset) + var(--player-height) + 16px)",
      }}
    >
      <div className="pointer-events-auto flex flex-col border-2 border-[var(--frame-line)] bg-[var(--chrome-bg)] shadow-[0_8px_24px_rgba(12,12,14,0.08)] transition-[border-color,background-color,color] duration-300">
        <a
          href={prev?.href ?? "#home"}
          aria-disabled={!prev}
          className={cn(
            "flex min-w-[7.5rem] items-center gap-2 border-b-2 border-[var(--frame-line)] px-2.5 py-2.5 text-[10px] font-bold tracking-[0.12em] uppercase transition-colors duration-300",
            prev
              ? "text-[var(--chrome-fg)] hover:bg-[var(--chrome-hover)]"
              : "pointer-events-none cursor-not-allowed text-[var(--chrome-fg-faint)]",
          )}
          aria-label={
            prev
              ? `Bagian sebelumnya: ${prev.menuLabel}`
              : "Sudah di bagian pertama"
          }
        >
          <Chevron direction="up" />
          <span>Sebelumnya</span>
        </a>
        <a
          href={next?.href ?? "#kontak"}
          aria-disabled={!next}
          className={cn(
            "flex min-w-[7.5rem] items-center gap-2 px-2.5 py-2.5 text-[10px] font-bold tracking-[0.12em] uppercase transition-colors duration-300",
            next
              ? "text-[var(--chrome-fg)] hover:bg-[var(--chrome-hover)]"
              : "pointer-events-none cursor-not-allowed text-[var(--chrome-fg-faint)]",
          )}
          aria-label={
            next
              ? `Bagian berikutnya: ${next.menuLabel}`
              : "Sudah di bagian terakhir"
          }
        >
          <Chevron direction="down" />
          <span>Berikutnya</span>
        </a>
      </div>
    </div>
  );
}

function Chevron({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={direction === "up" ? "rotate-180" : undefined}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}
