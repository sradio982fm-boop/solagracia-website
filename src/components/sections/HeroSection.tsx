"use client";

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
import { sanitizeAssetSrc, sanitizeHref } from "@/lib/security";
import { cn } from "@/lib/utils";
import type { HeroContent } from "@/types/site";
import type { OnAirContent, ScheduleShow } from "@/types/schedule";

const HERO_COVER_FALLBACK = "/cover-image.png";

type HeroSectionProps = {
  content: HeroContent;
  onAir: OnAirContent;
  onAirShow: ScheduleShow | null;
  upcomingShows: ScheduleShow[];
};

export function HeroSection({
  content,
  onAir,
  onAirShow,
  upcomingShows,
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

  const { cleanUrl: coverCleanUrl, objectPosition: coverPosition } =
    parseFocalUrl(coverSrc);
  const safeCoverSrc = sanitizeAssetSrc(coverCleanUrl, HERO_COVER_FALLBACK);
  const safeMobileCtaHref = sanitizeHref(mobileCtaHref, "#kontak");

  return (
    <section
      id="home"
      className="relative h-[100dvh] max-h-[100dvh] overflow-hidden bg-[var(--bg-void)] text-white max-md:min-h-0 md:min-h-[640px]"
    >
      <motion.div
        data-hero-cover
        className="absolute inset-0 will-change-transform"
        initial={{ scale: 1.06, opacity: 0.85 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.35, ease: easeOut }}
      >
        <Image
          src={safeCoverSrc}
          alt={coverAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: coverPosition }}
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
          width: "max(100%, calc(100dvh * 1715 / 917))",
          height: "max(100%, calc(100dvw * 917 / 1715))",
        }}
      >
        <div
          className="pointer-events-auto absolute flex flex-col justify-center border border-[var(--frame-line)] bg-black/45 backdrop-blur-[2px]"
          style={{
            left: "14.93%",
            top: "21.81%",
            width: "21.92%",
            height: "59.32%",
            padding: "clamp(1.25rem, 2.2vw, 2rem)",
          }}
        >
          <HeroTitle brand={brand} eyebrow={eyebrow} support={support} />

          <motion.div
            className="mt-7 flex items-center"
            variants={heroCtaStagger}
            initial="hidden"
            animate="show"
          >
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
                className="inline-flex h-11 items-center justify-center gap-2.5 border border-l-0 border-[var(--frame-line)] px-4 text-[13px] font-semibold transition-colors hover:bg-white/10"
              >
                <span aria-hidden className="tracking-[0.15em]">
                  {">>"}
                </span>
                <span>{cta.label}</span>
              </motion.a>
            ))}
          </motion.div>
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

      {/* Mobile fallback */}
      <div className="relative z-10 flex h-full min-h-0 flex-col justify-end px-4 pt-[calc(var(--frame-inset-top)+4.5rem)] pb-[var(--section-pad-bottom)] sm:px-5 md:hidden">
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

        <div className="shrink-0">
          <HeroTitle brand={brand} eyebrow={eyebrow} support={support} />
          <motion.div
            className="mt-4 flex items-center"
            variants={heroCtaStagger}
            initial="hidden"
            animate="show"
          >
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
                  "inline-flex h-11 items-center justify-center gap-2 border border-l-0 border-[var(--frame-line)] px-4 text-sm font-semibold",
                )}
              >
                <span aria-hidden>{">>"}</span>
                <span>{cta.label}</span>
              </motion.a>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="mt-4 min-h-0 max-h-[min(34dvh,280px)] flex-1 overflow-y-auto border border-[var(--frame-line)] bg-black/45 px-3 py-3 backdrop-blur-[2px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: easeOut }}
        >
          <OnAirNow
            content={onAir}
            show={onAirShow}
            upcoming={upcomingShows}
            layout="stack"
          />
        </motion.div>
      </div>
    </section>
  );
}
