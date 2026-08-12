"use client";

import { useId, type CSSProperties } from "react";
import {
  instagramEmbedSrc,
  normalizeInstagramPermalink,
} from "@/lib/tentang";
import { sanitizeHref } from "@/lib/security";
import { cn } from "@/lib/utils";

type InstagramEmbedProps = {
  href: string;
  title?: string;
  className?: string;
};

/** Desktop: full IG chrome (header + reel + actions). */
const DESKTOP_HEIGHT_PX = 640;
/**
 * Mobile: crop IG like/comment/share row — half-cut icons look broken,
 * and “Buka di Instagram” already covers outbound intent.
 */
const MOBILE_IFRAME_HEIGHT_PX = 620;
const MOBILE_FOOTER_CROP_PX = 92;
const MOBILE_VISIBLE_HEIGHT_PX = MOBILE_IFRAME_HEIGHT_PX - MOBILE_FOOTER_CROP_PX;

/**
 * Official Instagram Reel embed via iframe.
 * Inner IG chrome is not stylable — we frame it to match site DNA.
 * Requires CSP `frame-src` to allow https://www.instagram.com.
 */
export function InstagramEmbed({
  href,
  title = "Instagram Reel",
  className,
}: InstagramEmbedProps) {
  const titleId = useId();
  const permalink = normalizeInstagramPermalink(href);
  const src = instagramEmbedSrc(href);
  if (!permalink || !src) return null;

  const safePermalink = sanitizeHref(permalink);

  const frameVars = {
    ["--ig-mobile-visible"]: `${MOBILE_VISIBLE_HEIGHT_PX}px`,
    ["--ig-mobile-iframe"]: `${MOBILE_IFRAME_HEIGHT_PX}px`,
    ["--ig-mobile-crop"]: `${MOBILE_FOOTER_CROP_PX}px`,
    ["--ig-desktop-height"]: `${DESKTOP_HEIGHT_PX}px`,
  } as CSSProperties;

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className="relative overflow-hidden border border-[rgba(12,12,14,0.14)] bg-[color-mix(in_srgb,var(--section-raised)_88%,transparent)] max-md:h-[var(--ig-mobile-visible)] md:h-[var(--ig-desktop-height)]"
        style={frameVars}
      >
        {/* Corner ticks — loft frame language */}
        <span
          className="pointer-events-none absolute top-0 left-0 z-[1] h-2 w-2 border-t border-l border-[rgba(12,12,14,0.45)]"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute top-0 right-0 z-[1] h-2 w-2 border-t border-r border-[rgba(12,12,14,0.45)]"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute bottom-0 left-0 z-[1] h-2 w-2 border-b border-l border-[rgba(12,12,14,0.45)]"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute right-0 bottom-0 z-[1] h-2 w-2 border-r border-b border-[rgba(12,12,14,0.45)]"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute top-0 left-5 z-[1] h-[2px] w-7 bg-[var(--accent)]"
          aria-hidden
        />

        <iframe
          title={title}
          src={src}
          className={cn(
            "pointer-events-auto block w-full max-w-full border-0 bg-[var(--section-raised)]",
            "max-md:mb-[calc(-1*var(--ig-mobile-crop))] max-md:h-[var(--ig-mobile-iframe)]",
            "md:mb-0 md:h-[var(--ig-desktop-height)]",
          )}
          style={frameVars}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          scrolling="no"
          aria-describedby={titleId}
        />
      </div>

      <p id={titleId} className="sr-only">
        Instagram Reel embed — buka di Instagram untuk interaksi penuh
      </p>

      <a
        href={safePermalink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex h-11 w-full items-center justify-center border border-[rgba(12,12,14,0.5)] px-5 text-[0.72rem] font-semibold tracking-[0.16em] text-[var(--section-fg)] uppercase no-underline transition-colors hover:bg-[rgba(12,12,14,0.05)]"
      >
        Buka di Instagram
        <span className="ml-2 opacity-50" aria-hidden>
          →
        </span>
      </a>
    </div>
  );
}
