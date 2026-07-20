"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdSlot } from "@/components/ads/AdSlot";
import { SmartImage } from "@/components/SmartImage";
import {
  easeOut,
  fadeUpCard,
  hoverLift,
  staggerContainer,
  tapPress,
  viewportLoose,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatShowWindow } from "@/lib/schedule";
import type { AdPlaceholder } from "@/types/ads";
import type { ProgramContent, ScheduleShow, WeekdayId } from "@/types/schedule";

type ProgramSectionProps = {
  content: ProgramContent;
  /** WIB weekday from the server page — keeps SSR + hydrate in sync */
  initialDay: WeekdayId;
  ad?: AdPlaceholder;
};

const viewport = viewportLoose;
const listVariants = staggerContainer(0.06, 0.08);
const cardVariants = fadeUpCard;

/**
 * #program — weekly lineup grid with day picker + radio-soul atmosphere.
 */
function frequencyStamp(label: string): string {
  return label.replace(/\s*FM$/i, "").trim() || label;
}

export function ProgramSection({ content, initialDay, ad }: ProgramSectionProps) {
  const [activeDay, setActiveDay] = useState<WeekdayId>(initialDay);

  const shows = content.byDay[activeDay] ?? [];
  const frequencyLabel = content.frequencyLabel || "98.2 FM";
  const brandStamp = `Solagracia · ${frequencyLabel}`;

  return (
    <section
      id="program"
      data-surface="smoke"
      className={cn(
        "section-surface-smoke relative flex min-h-[100dvh] flex-col overflow-x-hidden border-t px-4 pt-[clamp(36px,6vw,72px)] pb-[var(--section-pad-bottom)] sm:px-6 md:pr-10 md:pl-[calc(var(--rail)+2.5rem)]",
        /* Tall / 2K: center capped stage — FHD 1080p untouched */
        "[@media(min-height:1200px)]:justify-center",
      )}
    >
      <RadioSoulAtmosphere frequencyLabel={frequencyLabel} />

      {/*
        Tall / 2K: keep show grid + vertical ad near FHD proportions
        (avoid stretched cards + tiny partner column).
      */}
      <div
        className={cn(
          "relative z-[1] mx-auto flex w-full max-w-[1120px] flex-1 flex-col",
          "[@media(min-height:1200px)]:flex-none",
          "[@media(min-height:1200px)]:max-h-[min(62rem,calc(100dvh-var(--section-pad-bottom)-3.5rem))]",
          "min-[2400px]:max-w-[1240px]",
        )}
      >
        <motion.header
          data-program-head
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.65, ease: easeOut }}
        >
          <p className="m-0 inline-block border border-[rgba(255,255,255,0.28)] px-2.5 py-1.5 text-[9px] font-semibold tracking-[0.22em] text-[var(--section-muted)] uppercase">
            {content.eyebrow}
          </p>
          <h2 className="mt-5 m-0 flex items-center gap-3 text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[0.95] font-extrabold tracking-[-0.035em] text-[var(--section-fg)] italic">
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)] not-italic"
              aria-hidden
            />
            {content.title}
          </h2>
          <p className="mt-5 m-0 max-w-[36rem] text-[0.95rem] leading-relaxed text-[var(--section-muted)] not-italic">
            {content.description}
          </p>
        </motion.header>

        <motion.div
          role="tablist"
          aria-label="Pilih hari"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.55, delay: 0.08, ease: easeOut }}
          className="mt-10 flex gap-0 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {content.days.map((day, index) => {
            const active = day.id === activeDay;
            return (
              <motion.button
                key={day.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveDay(day.id)}
                whileTap={tapPress}
                className={cn(
                  "relative shrink-0 border border-[rgba(255,255,255,0.28)] px-3.5 py-3 text-[0.68rem] font-semibold tracking-[0.14em] uppercase transition-colors sm:px-4",
                  index > 0 && "border-l-0",
                  active
                    ? "border-[var(--accent)] text-white"
                    : "bg-transparent text-[var(--section-muted)] hover:bg-white/[0.06] hover:text-[var(--section-fg)]",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="program-day-pill"
                    className="absolute inset-0 bg-[var(--accent)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    aria-hidden
                  />
                ) : null}
                <span className="relative z-[1]">{day.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Ad rides the left column; show slate stays a 3-up grid */}
        <div
          className={cn(
            "mt-8 grid min-h-0 flex-1 grid-cols-1 items-stretch gap-6 xl:grid-cols-[minmax(10rem,12.5rem)_minmax(0,1fr)] xl:gap-7",
            "[@media(min-height:1200px)]:flex-none",
            "min-[2400px]:xl:grid-cols-[minmax(12rem,15rem)_minmax(0,1fr)]",
          )}
        >
          {ad ? (
            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.55, ease: easeOut }}
              className="order-2 flex xl:order-1 xl:sticky xl:top-[calc(var(--frame-inset)+1.25rem)] xl:self-start"
            >
              <AdSlot ad={ad} className="w-full max-w-none md:max-w-none" />
            </motion.aside>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              variants={listVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              className={cn(
                "order-1 grid h-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:order-2",
                "[@media(min-height:1200px)]:h-auto",
              )}
            >
              {shows.map((show) => (
                <motion.div
                  key={`${activeDay}-${show.id}`}
                  variants={cardVariants}
                  className="min-h-0"
                >
                  <ShowCard show={show} brandStamp={brandStamp} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function ShowCard({
  show,
  brandStamp,
}: {
  show: ScheduleShow;
  brandStamp: string;
}) {
  return (
    <motion.a
      data-show-card
      href={show.href ?? "#program"}
      whileHover={hoverLift}
      whileTap={tapPress}
      className={cn(
        "group relative block h-full min-h-[200px] overflow-hidden border border-[rgba(255,255,255,0.16)] no-underline aspect-[4/3] lg:aspect-auto lg:min-h-[220px]",
        /* Tall / 2K: lock card ratio so the grid doesn’t stretch into noodles */
        "[@media(min-height:1200px)]:aspect-[4/3] [@media(min-height:1200px)]:h-auto [@media(min-height:1200px)]:min-h-0",
      )}
    >
      <span data-scale-in className="absolute inset-0 block will-change-transform">
        <SmartImage
          src={show.imageSrc}
          alt={show.imageAlt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />
      </span>
      <span
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,16,0.35)_0%,rgba(8,10,16,0.55)_40%,rgba(8,10,16,0.88)_100%)]"
        aria-hidden
      />

      {show.tag ? (
        <span className="absolute top-3 left-3 z-[1] bg-white px-2 py-1 text-[9px] font-bold tracking-[0.14em] text-[#0c0c0e] uppercase">
          {show.tag}
        </span>
      ) : null}

      <span className="absolute inset-x-0 top-[18%] z-[1] flex flex-col items-center px-4 text-center">
        <span className="text-[9px] font-semibold tracking-[0.24em] text-white/55 uppercase">
          {brandStamp}
        </span>
        <span className="mt-2 text-[clamp(1.35rem,2.4vw,1.75rem)] leading-[1.05] font-extrabold tracking-[-0.02em] text-white">
          {show.title}
        </span>
        {show.description ? (
          <span className="mt-2 max-w-[18rem] text-[11px] leading-snug text-white/55">
            {show.description}
          </span>
        ) : (
          <span className="mt-2 text-[11px] text-white/50">{show.host}</span>
        )}
      </span>

      <span className="absolute right-3 bottom-3 z-[1] bg-[var(--accent)] px-2.5 py-1.5 text-[11px] font-bold tracking-[0.04em] text-white tabular-nums">
        {formatShowWindow(show)}
      </span>
    </motion.a>
  );
}

/**
 * Dark studio frequency field — waves, rings, meters, grain.
 * Warmth from ember wash + cover photo, not flat void.
 */
function RadioSoulAtmosphere({
  frequencyLabel,
}: {
  frequencyLabel: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        data-parallax="12"
        className="absolute inset-0 opacity-[0.18] will-change-transform"
      >
        <Image
          src="/cover-image.png"
          alt=""
          fill
          sizes="100vw"
          className="scale-110 object-cover object-[60%_40%] blur-[3px]"
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 80% 10%, rgba(196,92,38,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 10% 90%, rgba(196,92,38,0.08) 0%, transparent 50%),
            linear-gradient(180deg, rgba(10,10,11,0.82) 0%, rgba(10,10,11,0.92) 45%, rgba(10,10,11,0.96) 100%)
          `,
        }}
      />

      {/* Broadcast rings */}
      <div className="absolute top-[-10%] right-[-8%] h-[55vmax] w-[55vmax] rounded-full border border-white/[0.06]" />
      <div className="absolute top-[-4%] right-[-2%] h-[40vmax] w-[40vmax] rounded-full border border-white/[0.05]" />
      <div className="absolute top-[4%] right-[6%] h-[28vmax] w-[28vmax] rounded-full border border-[rgba(196,92,38,0.12)]" />

      {/* Frequency waveform */}
      <svg
        className="absolute bottom-[8%] left-[var(--rail)] h-24 w-[min(70%,720px)] opacity-[0.14]"
        viewBox="0 0 720 96"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 48 Q30 12 60 48 T120 48 T180 48 T240 48 T300 48 T360 48 T420 48 T480 48 T540 48 T600 48 T660 48 T720 48"
          stroke="white"
          strokeWidth="1.25"
        />
        <path
          d="M0 48 Q30 72 60 48 T120 48 T180 48 T240 48 T300 48 T360 48 T420 48 T480 48 T540 48 T600 48 T660 48 T720 48"
          stroke="rgba(196,92,38,0.9)"
          strokeWidth="1"
        />
      </svg>

      {/* Level meters */}
      <div className="absolute top-[22%] left-[calc(var(--rail)+1.5rem)] hidden h-16 items-end gap-[3px] opacity-25 md:flex">
        {[22, 36, 26, 46, 30, 42, 24, 50, 28, 38, 26, 44].map((h, i) => (
          <span
            key={i}
            className="w-[3px] bg-white"
            style={{ height: h }}
          />
        ))}
      </div>

      {/* Blueprint grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.22] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "160px 160px",
        }}
      />

      <p className="absolute right-[4%] bottom-[12%] hidden text-[clamp(3.5rem,10vw,7.5rem)] leading-none font-extrabold tracking-[-0.06em] text-white/[0.04] select-none lg:block">
        {frequencyStamp(frequencyLabel)}
      </p>
    </div>
  );
}
