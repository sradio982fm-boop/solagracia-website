"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { parseFocalUrl } from "@/lib/focal-point";
import { hoverLift, tapPress } from "@/lib/motion";
import { sanitizeAssetSrc, sanitizeHref } from "@/lib/security";
import { cn } from "@/lib/utils";
import type { AdPlaceholder } from "@/types/ads";

type AdSlotProps = {
  ad: AdPlaceholder;
  className?: string;
  /** Shorter full-image plate for viewport-locked sections */
  compact?: boolean;
};

/**
 * Quiet sponsored plate — blueprint frame language.
 * Supports text-only, image+copy, or full-bleed image creatives.
 */
export function AdSlot({ ad, className, compact = false }: AdSlotProps) {
  const label = ad.label ?? "Partner";
  const ink = ad.tone === "ink";
  const { cleanUrl: adCleanUrl, objectPosition: adPosition } = parseFocalUrl(
    ad.imageSrc,
  );
  const safeImageSrc = sanitizeAssetSrc(adCleanUrl);
  const isFullImage = ad.variant === "image" && Boolean(safeImageSrc);
  const isPortrait = ad.imageShape === "portrait";
  const hasThumb = Boolean(safeImageSrc) && !isFullImage;
  const hasCaption = Boolean(ad.sponsor || ad.line);
  const title = ad.sponsor ?? ad.imageAlt ?? label;
  const safeAdHref = sanitizeHref(ad.href, "");
  const linkHref =
    safeAdHref && ad.id
      ? `/api/public/ad-click?id=${ad.id}`
      : safeAdHref || undefined;

  const plateClass = cn(
    "group relative block overflow-hidden transition-colors",
    ink
      ? "border border-[rgba(255,255,255,0.18)] bg-[var(--bg-void)] text-[var(--text-main)] hover:border-[rgba(255,255,255,0.32)]"
      : cn(
          "border text-[var(--section-fg)]",
          "border-[color:color-mix(in_srgb,var(--section-fg)_16%,transparent)]",
          "hover:border-[color:color-mix(in_srgb,var(--section-fg)_32%,transparent)]",
        ),
    isFullImage && "p-0",
    !isFullImage && ad.variant === "strip" && "px-5 py-6 md:px-8 md:py-7",
    !isFullImage && ad.variant === "panel" && "w-full px-5 py-8 md:px-6 md:py-10",
    !isFullImage &&
      ad.variant === "inline" &&
      "flex items-center gap-4 px-4 py-4 md:gap-5 md:px-5",
  );

  const corner = ink
    ? "border-[rgba(255,255,255,0.4)]"
    : "border-[color:color-mix(in_srgb,var(--section-fg)_40%,transparent)]";

  const muted = ink ? "text-[var(--text-dim)]" : "text-[var(--section-muted)]";
  const hoverFg = ink
    ? "group-hover:text-[var(--text-main)]"
    : "group-hover:text-[var(--section-fg)]";

  const corners = (
    <>
      <span
        className={cn(
          "pointer-events-none absolute top-0 left-0 z-[1] h-2 w-2 border-t border-l",
          corner,
        )}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute top-0 right-0 z-[1] h-2 w-2 border-t border-r",
          corner,
        )}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute bottom-0 left-0 z-[1] h-2 w-2 border-b border-l",
          corner,
        )}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute right-0 bottom-0 z-[1] h-2 w-2 border-r border-b",
          corner,
        )}
        aria-hidden
      />
    </>
  );

  const body = isFullImage ? (
    <>
      {corners}
      <span
        className={cn(
          "relative block w-full",
          isPortrait &&
            compact &&
            "h-[min(36dvh,17rem)]",
          isPortrait && !compact && "aspect-[3/4]",
          !isPortrait && "aspect-[4/1]",
        )}
      >
        <Image
          src={safeImageSrc}
          alt={ad.imageAlt ?? title}
          fill
          sizes={
            isPortrait
              ? "(max-width: 1280px) 100vw, 200px"
              : "(max-width: 768px) 100vw, min(1120px, 100vw)"
          }
          className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
          style={{ objectPosition: adPosition }}
        />
        {hasCaption ? (
          <>
            <span
              className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
              aria-hidden
            />
            <span
              className={cn(
                "absolute right-0 bottom-0 left-0",
                compact ? "p-3 md:p-3.5" : "p-4 md:p-5",
              )}
            >
              {ad.sponsor ? (
                <span
                  className={cn(
                    "block font-bold tracking-tight text-white",
                    compact
                      ? "text-[12px] md:text-[13px]"
                      : "text-[13px] md:text-[15px]",
                  )}
                >
                  {ad.sponsor}
                </span>
              ) : null}
              {ad.line ? (
                <span
                  className={cn(
                    "mt-0.5 block text-white/70",
                    compact
                      ? "text-[10px] md:text-[11px]"
                      : "text-[11px] md:text-[12px]",
                  )}
                >
                  {ad.line}
                </span>
              ) : null}
            </span>
          </>
        ) : null}
      </span>
    </>
  ) : (
    <>
      {corners}

      {hasThumb ? (
        <span
          className={cn(
            "relative shrink-0 overflow-hidden bg-[rgba(12,12,14,0.06)]",
            ad.variant === "inline" && "h-14 w-14 md:h-16 md:w-16",
            ad.variant === "strip" && "mb-4 block aspect-[16/7] w-full",
            ad.variant === "panel" &&
              "ad-panel-thumb mb-5 block aspect-[3/4] w-full",
          )}
        >
          <Image
            src={safeImageSrc}
            alt={ad.imageAlt ?? title}
            fill
            sizes={ad.variant === "inline" ? "64px" : "280px"}
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            style={{ objectPosition: adPosition }}
          />
        </span>
      ) : null}

      {(ad.sponsor || ad.line) && (
        <div
          className={cn(
            ad.variant === "inline" && "min-w-0 flex-1",
            hasThumb && ad.variant === "strip" && "mt-0",
          )}
        >
          {ad.sponsor ? (
            <p
              className={cn(
                "font-bold tracking-tight",
                ad.variant === "panel"
                  ? "text-xl md:text-2xl"
                  : "text-[15px] md:text-base",
              )}
            >
              {ad.sponsor}
            </p>
          ) : null}
          {ad.line ? (
            <p
              className={cn(
                ad.sponsor && "mt-1",
                muted,
                ad.variant === "panel"
                  ? "text-sm leading-relaxed"
                  : "text-[12px] leading-snug md:text-[13px]",
              )}
            >
              {ad.line}
            </p>
          ) : null}
        </div>
      )}

      {ad.href && !isFullImage ? (
        <span
          className={cn(
            "text-[10px] font-semibold tracking-[0.18em] uppercase transition-colors",
            muted,
            hoverFg,
            ad.variant === "inline" && "shrink-0",
            ad.variant !== "inline" && "mt-4 inline-block",
          )}
        >
          Selengkapnya
        </span>
      ) : null}
    </>
  );

  return (
    <aside
      className={cn("ad-slot w-full", className)}
      aria-label={`${label}: ${title}`}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          isFullImage ? "mb-1.5" : "mb-2",
        )}
      >
        <span
          className={cn(
            "text-[9px] font-semibold tracking-[0.28em] uppercase",
            ink ? "text-[var(--text-dim)]" : "text-[var(--section-muted)]",
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "h-px flex-1 opacity-25",
            ink ? "bg-[var(--text-main)]" : "bg-[var(--section-fg)]",
          )}
          aria-hidden
        />
        {ink ? (
          <span
            className="text-[9px] font-semibold tracking-[0.2em] text-[var(--accent)] uppercase"
            aria-hidden
          >
            Spot
          </span>
        ) : null}
      </div>

      {linkHref ? (
        <motion.a
          href={linkHref}
          rel="sponsored noopener noreferrer"
          whileHover={hoverLift}
          whileTap={tapPress}
          className={plateClass}
        >
          {body}
        </motion.a>
      ) : (
        <motion.div whileHover={hoverLift} className={plateClass}>
          {body}
        </motion.div>
      )}
    </aside>
  );
}
