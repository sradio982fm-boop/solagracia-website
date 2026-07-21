"use client";

import { cn } from "@/lib/utils";

type AdPromoLoadingShellProps = {
  className?: string;
  /** Shorter copy when overlaying the current page mid-click */
  compact?: boolean;
};

/**
 * Loft loading stage for /iklan — void field, accent carrier, blueprint corners.
 * Shared by route `loading.tsx` and AdSlot click transition.
 */
export function AdPromoLoadingShell({
  className,
  compact = false,
}: AdPromoLoadingShellProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[var(--bg-void)] text-[var(--text-main)]",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(196,92,38,0.18),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,11,0.2)_0%,transparent_40%,rgba(10,10,11,0.65)_100%)]"
        aria-hidden
      />

      <div className="relative z-[1] w-full max-w-[22rem] px-6">
        <div className="relative border border-[var(--frame-line)] bg-black/40 px-5 py-7 backdrop-blur-[3px]">
          <span
            className="pointer-events-none absolute top-0 left-0 h-2.5 w-2.5 border-t border-l border-[color-mix(in_srgb,var(--accent)_70%,white)]"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute top-0 right-0 h-2.5 w-2.5 border-t border-r border-[color-mix(in_srgb,var(--accent)_70%,white)]"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-[color-mix(in_srgb,var(--accent)_70%,white)]"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute right-0 bottom-0 h-2.5 w-2.5 border-r border-b border-[color-mix(in_srgb,var(--accent)_70%,white)]"
            aria-hidden
          />

          <p className="m-0 text-[10px] font-semibold tracking-[0.22em] text-[var(--text-dim)] uppercase">
            Open promotion
          </p>

          <div
            className="mt-4 h-px w-full origin-left bg-[var(--accent)]"
            style={{ animation: "ad-promo-carrier 1.1s ease-out infinite alternate" }}
            aria-hidden
          />

          <p
            className={cn(
              "mt-5 m-0 font-extrabold tracking-[-0.03em] text-[var(--text-main)]",
              compact ? "text-[1.35rem] leading-tight" : "text-[1.55rem] leading-[1.05]",
            )}
          >
            Menyiapkan
            <span className="block text-[var(--accent)]">space iklan…</span>
          </p>

          <p className="mt-3 m-0 text-[0.8rem] leading-relaxed text-[var(--text-dim)]">
            {compact
              ? "Sedang membuka frekuensi loft."
              : "Sedang membuka frekuensi loft — sebentar lagi."}
          </p>

          <div className="mt-5 flex items-end gap-[3px]" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-[2px] origin-bottom bg-[var(--accent)]"
                style={{
                  height: 8 + (i % 3) * 5,
                  animation: `player-eq 0.75s ${i * 0.1}s ease-in-out infinite alternate`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
