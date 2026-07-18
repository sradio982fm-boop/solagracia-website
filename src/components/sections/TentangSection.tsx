"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AdSlot } from "@/components/ads/AdSlot";
import { SECTION_ADS } from "@/data/ads";
import {
  easeOut,
  fadeUp,
  fadeUpCard,
  staggerContainer,
  viewportOnce,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SocialQuotePart, TentangContent } from "@/types/site";

type TentangSectionProps = {
  content: TentangContent;
};

const columnVariants = staggerContainer(0.09, 0.04);
const railVariants = staggerContainer(0.12, 0.18);
const itemVariants = fadeUp;
const cardVariants = fadeUpCard;
const viewport = viewportOnce;

/** Soft EQ bars — studio meter language, decorative only */
const METER_BARS = [28, 52, 36, 68, 44, 78, 40, 62, 34, 56, 48, 70] as const;

/**
 * #tentang — viewport-locked loft about + social proof + partner spot.
 * Listen lives in the sticky player; CTAs point deeper into the site.
 */
export function TentangSection({ content }: TentangSectionProps) {
  const ad = SECTION_ADS.tentang;
  const { testimonial } = content;

  return (
    <section
      id="tentang"
      data-surface="white"
      className="section-surface-white relative flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden border-t px-6 pt-[clamp(28px,4vw,48px)] pb-[calc(var(--player-height)+var(--frame-inset)+14px)] md:pr-10 md:pl-[calc(var(--rail)+2.5rem)]"
    >
      <StudioAtmosphere />

      <div className="relative z-[1] mx-auto flex h-full min-h-0 w-full max-w-[1120px] flex-col">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch lg:gap-8">
          <motion.div
            className="flex min-h-0 flex-col justify-center"
            variants={columnVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            <motion.p
              variants={itemVariants}
              className="m-0 flex items-center gap-3 text-[0.62rem] font-semibold tracking-[0.22em] text-[var(--section-muted)] uppercase"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)] opacity-40" />
                <span className="relative h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              Studio · 98.2 FM
            </motion.p>

            <motion.h2
              variants={itemVariants}
              className="mt-3 m-0 max-w-[14ch] text-[clamp(1.85rem,3.8vw,3.25rem)] leading-[1.02] font-extrabold tracking-[-0.035em]"
            >
              <span className="text-[var(--section-fg)]">{content.headline}</span>{" "}
              <span className="text-[var(--accent)]">{content.headlineAccent}</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mt-3 flex flex-wrap items-baseline gap-x-1 gap-y-1 text-[clamp(0.9rem,1.35vw,1.05rem)] font-semibold tracking-[-0.01em] text-[var(--section-fg)]"
            >
              {content.stats.map((stat, index) => (
                <span key={stat.label} className="inline-flex items-baseline gap-1">
                  <span className="underline decoration-[var(--section-fg)] decoration-1 underline-offset-[5px]">
                    {stat.value} {stat.label}
                  </span>
                  {index < content.stats.length - 1 ? (
                    <span className="mx-1 text-[var(--section-muted)]" aria-hidden>
                      ,
                    </span>
                  ) : null}
                </span>
              ))}
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="mt-3 max-w-[34rem] line-clamp-3 text-[0.84rem] leading-[1.55] text-[var(--section-muted)] lg:line-clamp-4"
            >
              {content.body}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-5 flex flex-wrap items-center gap-0"
            >
              {content.ctas.map((cta, index) => (
                <motion.a
                  key={cta.label}
                  href={cta.href}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: easeOut }}
                  className={cn(
                    "inline-flex h-10 items-center justify-center border border-[rgba(12,12,14,0.5)] px-4 text-[0.68rem] font-semibold tracking-[0.16em] text-[var(--section-fg)] uppercase no-underline transition-colors hover:bg-[rgba(12,12,14,0.05)]",
                    index > 0 && "border-l-0",
                  )}
                >
                  {cta.label}
                  <span className="ml-2 opacity-50" aria-hidden>
                    →
                  </span>
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          <motion.aside
            className="flex min-h-0 max-h-[38%] flex-col justify-center lg:max-h-none"
            aria-label={content.socialLabel}
            variants={railVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            <motion.h3
              variants={itemVariants}
              className="m-0 max-w-[18ch] text-[0.95rem] font-medium tracking-[-0.01em] text-[var(--section-fg)]"
            >
              {content.socialLabel}
            </motion.h3>

            <motion.blockquote
              cite={testimonial.href}
              variants={cardVariants}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className="relative mt-3 m-0 min-h-0 overflow-hidden border border-[rgba(12,12,14,0.14)] bg-[color-mix(in_srgb,var(--section-raised)_88%,transparent)] px-4 py-4 backdrop-blur-[2px] sm:px-5 sm:py-5"
            >
              <span
                className="pointer-events-none absolute top-0 left-0 h-2 w-2 border-t border-l border-[rgba(12,12,14,0.45)]"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute top-0 right-0 h-2 w-2 border-t border-r border-[rgba(12,12,14,0.45)]"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute bottom-0 left-0 h-2 w-2 border-b border-l border-[rgba(12,12,14,0.45)]"
                aria-hidden
              />
              <span
                className="pointer-events-none absolute right-0 bottom-0 h-2 w-2 border-r border-b border-[rgba(12,12,14,0.45)]"
                aria-hidden
              />

              <span
                className="absolute top-0 left-5 h-[2px] w-7 bg-[var(--accent)]"
                aria-hidden
              />

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--section-fg)] text-[var(--bg-white)]"
                    aria-hidden
                  >
                    {testimonial.platform === "x" ? <XIcon /> : <ThreadsIcon />}
                  </span>
                  <span className="text-[0.6rem] font-semibold tracking-[0.16em] text-[var(--section-muted)] uppercase">
                    {testimonial.platform === "x" ? "Post di X" : "Post di Threads"}
                  </span>
                </div>
                <span className="text-[0.58rem] font-medium tracking-[0.14em] text-[var(--section-muted)] uppercase tabular-nums">
                  {testimonial.date}
                </span>
              </div>

              <p className="mt-3 m-0 line-clamp-4 text-[0.92rem] leading-[1.45] font-semibold tracking-[-0.015em] text-[var(--section-fg)]">
                {testimonial.quote.map((part, index) => (
                  <QuotePart key={`${part.type}-${index}`} part={part} />
                ))}
              </p>

              <footer className="mt-3 flex items-center gap-2.5 border-t border-[rgba(12,12,14,0.1)] pt-3">
                <span
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(12,12,14,0.12)] bg-[rgba(12,12,14,0.04)] text-[0.62rem] font-bold tracking-[0.06em] text-[var(--section-fg)]"
                  aria-hidden
                >
                  {testimonial.authorInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <cite className="block truncate text-[0.82rem] font-bold not-italic tracking-[-0.01em] text-[var(--section-fg)]">
                    {testimonial.authorName}
                  </cite>
                  <a
                    href={testimonial.href}
                    className="mt-0.5 block truncate text-[0.72rem] text-[var(--section-muted)] no-underline transition-colors hover:text-[var(--accent)]"
                  >
                    {testimonial.authorHandle}
                  </a>
                </div>
                <a
                  href={testimonial.href}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-[rgba(12,12,14,0.2)] text-[var(--section-fg)] transition-colors hover:bg-[rgba(12,12,14,0.05)]"
                  aria-label="Buka postingan"
                >
                  <ArrowIcon />
                </a>
              </footer>
            </motion.blockquote>
          </motion.aside>
        </div>

        {ad ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.55, ease: easeOut }}
            className="mt-3 w-full shrink-0 lg:mt-4"
          >
            <AdSlot ad={ad} compact />
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Broadcast loft wash — photo warmth + grain + meter + frequency watermark.
 * Keeps UI cool; atmosphere comes from the studio image.
 */
function StudioAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Soft studio photo plane */}
      <div className="absolute inset-0 opacity-[0.22]">
        <Image
          src="/cover-image.png"
          alt=""
          fill
          sizes="100vw"
          className="scale-105 object-cover object-[70%_30%] blur-[2px]"
        />
      </div>

      {/* Plaster veil — keep type readable, cool loft DNA */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              115deg,
              rgba(200, 196, 186, 0.94) 0%,
              rgba(200, 196, 186, 0.78) 42%,
              rgba(200, 196, 186, 0.88) 100%
            )
          `,
        }}
      />

      {/* Warm spill from mic/gold side of cover */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 55% 50% at 88% 18%,
              rgba(196, 92, 38, 0.14) 0%,
              transparent 62%
            ),
            radial-gradient(
              ellipse 40% 45% at 12% 88%,
              rgba(12, 12, 14, 0.1) 0%,
              transparent 70%
            )
          `,
        }}
      />

      {/* Blueprint grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(12,12,14,0.9) 1px, transparent 1px),
            linear-gradient(90deg, rgba(12,12,14,0.9) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* Frequency watermark */}
      <p className="absolute top-[12%] right-[6%] hidden text-[clamp(4rem,12vw,9rem)] leading-none font-extrabold tracking-[-0.06em] text-[rgba(12,12,14,0.05)] select-none md:block">
        98.2
      </p>

      {/* Level meters — lower right, studio desk cue */}
      <div className="absolute right-[8%] bottom-[18%] hidden h-14 items-end gap-[3px] opacity-40 md:flex">
        {METER_BARS.map((height, index) => (
          <span
            key={index}
            className="w-[3px] bg-[rgba(12,12,14,0.55)]"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function QuotePart({ part }: { part: SocialQuotePart }) {
  if (part.type === "mention") {
    return <span className="text-[var(--accent)]">{part.value}</span>;
  }

  if (part.type === "link") {
    return (
      <a
        href={part.href}
        className="text-[var(--accent)] underline decoration-[color-mix(in_srgb,var(--accent)_45%,transparent)] underline-offset-[3px] transition-opacity hover:opacity-80"
      >
        {part.value}
      </a>
    );
  }

  return <>{part.value}</>;
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ThreadsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C7.03 2 3.5 5.58 3.5 10.5c0 3.4 1.86 5.95 4.7 7.05-.1-.82-.18-2.08.04-2.98.2-.82 1.26-5.2 1.26-5.2s-.32-.64-.32-1.58c0-1.48.86-2.58 1.92-2.58.9 0 1.34.68 1.34 1.5 0 .9-.58 2.26-.88 3.52-.25 1.06.54 1.92 1.58 1.92 1.9 0 3.18-2.44 3.18-5.34 0-2.2-1.48-3.84-4.16-3.84-3.04 0-4.92 2.24-4.92 4.76 0 .86.25 1.48.64 1.96.18.2.2.36.14.56-.05.18-.16.62-.2.8-.07.24-.28.32-.5.24-1.4-.58-2.04-2.12-2.04-3.86 0-2.86 2.42-6.3 7.22-6.3 3.86 0 6.4 2.78 6.4 5.76 0 3.94-2.18 6.88-5.4 6.88-1.08 0-2.1-.58-2.46-1.24l-.66 2.52c-.24.94-.72 1.88-1.14 2.6 1.02.3 2.1.46 3.22.46 4.97 0 9-3.58 9-9.5C21.5 5.58 17.97 2 12 2z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 17L17 7M17 7H9M17 7v8"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
      />
    </svg>
  );
}
