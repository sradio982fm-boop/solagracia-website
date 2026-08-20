"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { HeroSocialIcons } from "@/components/sections/HeroSocialIcons";
import { HeroSocialRail } from "@/components/sections/HeroSocialRail";
import { HeroTitle } from "@/components/sections/HeroTitle";
import { OnAirNow } from "@/components/sections/OnAirNow";
import {
  easeOut,
  heroCtaItem,
  heroCtaStagger,
  hoverLift,
  tapPress,
} from "@/lib/motion";
import { parseFocalUrl } from "@/lib/focal-point";
import { sanitizeAssetSrc, sanitizeHref, isSafeHttpUrl } from "@/lib/security";
import { cn } from "@/lib/utils";
import type { HeroContent } from "@/types/site";
import type { OnAirContent, ScheduleShow } from "@/types/schedule";

const HERO_COVER_FALLBACK = "/cover-image.png";

type HeroSectionProps = {
  content: HeroContent;
  onAir: OnAirContent;
  onAirShow: ScheduleShow | null;
  upcomingShows: ScheduleShow[];
  parentSiteUrl?: string;
  parentSiteLabel?: string;
};

export function HeroSection({
  content,
  onAir,
  onAirShow,
  upcomingShows,
  parentSiteUrl,
  parentSiteLabel,
}: HeroSectionProps) {
  const {
    brand,
    eyebrow,
    support,
    coverSrc,
    coverAlt,
    ctas,
    mobileCtaLabel,
    mobileCtaHref,
    socialLinks,
    verticalTagline,
  } = content;

  const { cleanUrl: coverCleanUrl, focus: coverFocus } = parseFocalUrl(coverSrc);
  const safeCoverSrc = sanitizeAssetSrc(coverCleanUrl, HERO_COVER_FALLBACK);
  const safeCoverAlt = coverAlt.trim() || brand.trim() || "Solagracia";
  const safeMobileCtaHref = sanitizeHref(mobileCtaHref, "#kontak");
  const showMobileCta = Boolean(mobileCtaLabel.trim());
  const parentHref =
    parentSiteUrl && isSafeHttpUrl(parentSiteUrl)
      ? sanitizeHref(parentSiteUrl)
      : "";
  // Label default only when outbound CTA is shown.
  const parentLabel = parentSiteLabel?.trim() || "S Radio 98.2FM Streaming";
  // Portrait mobile crop ≠ desktop 16:9 framing — keep phone centered;
  // honor CMS focus from md up where the admin preview matches.
  const coverPositionDesktop = `${coverFocus.x}% ${coverFocus.y}%`;

  const ctaRow = (mobile: boolean) => (
    <motion.div
      className={cn(
        "flex flex-col",
        mobile ? "mt-5 gap-3" : "mt-7 gap-3",
      )}
      variants={heroCtaStagger}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-wrap items-center">
        <motion.div variants={heroCtaItem}>
          <HeroSocialIcons links={socialLinks} joined />
        </motion.div>
        {ctas.map((cta) => (
          <motion.a
            key={cta.label}
            href={sanitizeHref(cta.href)}
            variants={heroCtaItem}
            whileHover={hoverLift}
            whileTap={tapPress}
            className={cn(
              "inline-flex h-11 items-center justify-center border border-l-0 border-[var(--frame-line)] px-4 font-semibold transition-colors hover:bg-white/10",
              mobile ? "text-sm" : "text-[13px]",
            )}
          >
            <span>{cta.label}</span>
          </motion.a>
        ))}
      </div>

      {parentHref ? (
        <motion.a
          href={parentHref}
          target="_blank"
          rel="noopener noreferrer"
          variants={heroCtaItem}
          whileHover={hoverLift}
          whileTap={tapPress}
          aria-label={`${parentLabel} (buka situs induk)`}
          className={cn(
            "inline-flex h-11 w-full items-center justify-center gap-2.5 border border-white bg-white px-4 font-semibold text-[var(--bg-void)] transition-colors hover:bg-[var(--text-main)]",
            mobile ? "min-h-11 text-sm" : "text-[13px]",
          )}
        >
          <span aria-hidden className="inline-flex shrink-0 text-[var(--bg-void)]/70">
            <ExternalLinkIcon />
          </span>
          <span>{parentLabel}</span>
        </motion.a>
      ) : null}
    </motion.div>
  );

  return (
    <>
      <section
        id="home"
        className="relative h-[100svh] max-h-[100svh] overflow-hidden bg-[var(--bg-void)] text-white max-md:min-h-0 md:min-h-[640px]"
      >
        <motion.div
          data-hero-cover
          className="absolute top-0 left-0 h-[100svh] w-full"
          initial={{ scale: 1.06, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.35, ease: easeOut }}
        >
          <Image
            src={safeCoverSrc}
            alt={safeCoverAlt}
            fill
            priority
            loading="eager"
            sizes="100vw"
            className="object-cover object-center md:[object-position:var(--hero-cover-focus)]"
            style={
              {
                "--hero-cover-focus": coverPositionDesktop,
              } as CSSProperties
            }
          />
          <div
            className="absolute inset-0 bg-[rgba(8,10,16,0.08)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,16,0.2)_0%,transparent_32%,transparent_62%,rgba(8,10,16,0.4)_100%)]"
            aria-hidden
          />
        </motion.div>

        <div
          className="pointer-events-none absolute top-1/2 left-1/2 z-[11] hidden -translate-x-1/2 -translate-y-1/2 md:block"
          style={{
            width: "max(100%, calc(100svh * 1715 / 917))",
            height: "max(100%, calc(100dvw * 917 / 1715))",
          }}
        >
          <div
            className="pointer-events-auto absolute flex flex-col justify-center border border-[var(--frame-line)] bg-black/45 backdrop-blur-[2px]"
            style={{
              left: "14.93%",
              top: "21.81%",
              /* Wider than original 21.92% so "Digital Radio" stays one line */
              width: "26.5%",
              height: "59.32%",
              padding: "clamp(1.25rem, 2.2vw, 2rem)",
            }}
          >
            <HeroTitle brand={brand} eyebrow={eyebrow} support={support} />
            {ctaRow(false)}
          </div>
        </div>

        <HeroSocialRail tagline={verticalTagline} />

        <motion.div
          data-hero-rail
          className="pointer-events-none absolute z-10 hidden md:block will-change-transform"
          style={{
            top: "var(--frame-inset)",
            bottom: "var(--frame-inset)",
            right: "var(--frame-inset)",
            width: "min(32%, 24rem)",
          }}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.25, ease: easeOut }}
        >
          <div className="pointer-events-auto flex h-full min-h-0 flex-col border-l border-[var(--frame-line)] bg-black/30 px-4 py-5 backdrop-blur-[2px] lg:px-5 lg:py-6">
            <OnAirNow
              content={onAir}
              show={onAirShow}
              upcoming={upcomingShows}
              layout="rail"
            />
          </div>
        </motion.div>

        {/* Mobile first viewport — cover + title only (On Air below fold) */}
        <div className="relative z-10 flex h-full min-h-0 flex-col justify-end px-4 pt-[calc(var(--frame-inset-top)+4.5rem)] pb-[calc(var(--section-pad-bottom)+0.5rem)] sm:px-5 md:hidden">
          {showMobileCta ? (
            <motion.div
              className="mb-auto flex justify-end pr-12"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: easeOut }}
            >
              <a
                href={safeMobileCtaHref}
                className="inline-flex h-11 items-center border border-[var(--frame-line)] px-4 text-[11px] font-semibold tracking-[0.2em] uppercase"
              >
                {mobileCtaLabel}
              </a>
            </motion.div>
          ) : null}

          <div className="shrink-0">
            <HeroTitle brand={brand} eyebrow={eyebrow} support={support} />
            {ctaRow(true)}
          </div>
        </div>
      </section>

      {/* Mobile schedule — next page under the full-bleed hero */}
      <section
        aria-label="Jadwal on air"
        className="relative border-t border-[var(--frame-line)] bg-[var(--bg-void)] px-4 py-5 text-white sm:px-5 md:hidden"
      >
        <div className="border border-[var(--frame-line)] bg-black/45 px-3 py-3 backdrop-blur-[2px]">
          <OnAirNow
            content={onAir}
            show={onAirShow}
            upcoming={upcomingShows}
            layout="stack"
          />
        </div>
      </section>
    </>
  );
}

/** Outbound parent-site mark (square + exit arrow). */
function ExternalLinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 5h5v5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M19 5 11 13"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
      />
      <path
        d="M19 13.5V18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
