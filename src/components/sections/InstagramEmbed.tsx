"use client";

import { useId } from "react";
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

/** Tall enough for IG Reel player + header chrome inside the iframe. */
const EMBED_MIN_HEIGHT_PX = 560;

/**
 * Official Instagram Reel embed via iframe.
 * Inner IG chrome (buttons, type) is not stylable — only our outer frame is.
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

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="relative overflow-hidden border border-[rgba(12,12,14,0.14)] bg-[color-mix(in_srgb,var(--section-raised)_88%,transparent)]">
        {/* Corner ticks — loft frame language (matches former Tentang rail) */}
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
          className="block w-full max-w-full border-0 bg-[var(--section-raised)]"
          style={{
            minHeight: EMBED_MIN_HEIGHT_PX,
            height: EMBED_MIN_HEIGHT_PX,
          }}
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
