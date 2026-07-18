"use client";

import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { motion } from "framer-motion";
import { AdSlot } from "@/components/ads/AdSlot";
import { SECTION_ADS } from "@/data/ads";
import { ensureGsap, prefersReducedMotion } from "@/lib/gsap";
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
 * Cool plaster burns into warm bright on scroll (matches Penyiar tone).
 */
export function TentangSection({ content }: TentangSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const ad = SECTION_ADS.tentang;
  const { testimonial } = content;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const gsap = ensureGsap();
      const cool = section.querySelector<HTMLElement>("[data-burn-cool]");
      const ember = section.querySelector<HTMLElement>("[data-burn-ember]");
      const warm = section.querySelector<HTMLElement>("[data-burn-warm]");
      if (!cool || !ember || !warm) return;

      if (prefersReducedMotion()) {
        gsap.set(cool, { opacity: 0 });
        gsap.set(ember, { opacity: 0 });
        gsap.set(warm, { opacity: 1 });
        return;
      }

      gsap.set(cool, { opacity: 1 });
      gsap.set(ember, { opacity: 0 });
      gsap.set(warm, { opacity: 0 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 22%",
            scrub: 1.15,
          },
        })
        .to(ember, { opacity: 0.92, ease: "none", duration: 0.35 }, 0)
        .to(cool, { opacity: 0, ease: "none", duration: 0.5 }, 0.12)
        .to(warm, { opacity: 1, ease: "none", duration: 0.55 }, 0.22)
        .to(ember, { opacity: 0.08, ease: "none", duration: 0.4 }, 0.55);
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="tentang"
      data-surface="white"
      className="section-surface-white section-slide relative flex flex-col border-t px-4 pt-[clamp(32px,4.5vw,56px)] pb-[var(--section-pad-bottom)] sm:px-6 md:pr-10 md:pl-[calc(var(--rail)+2.5rem)]"
    >
      <StudioAtmosphere />

      {/* Top-aligned stack — copy fills the stage, ad rides directly under it */}
      <div className="relative z-[1] mx-auto flex h-full min-h-0 w-full max-w-[1180px] flex-col justify-start gap-2 pt-1 lg:gap-2 lg:pt-2">
        <div className="grid shrink-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12">
          <motion.div
            className="flex flex-col"
            variants={columnVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            <motion.p
              variants={itemVariants}
              className="m-0 flex items-center gap-3 text-[0.68rem] font-semibold tracking-[0.22em] text-[var(--section-muted)] uppercase"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)] opacity-40" />
                <span className="relative h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              Studio · 98.2 FM
            </motion.p>

            <motion.h2
              variants={itemVariants}
              className="mt-5 m-0 max-w-[18ch] text-[clamp(2.35rem,5vw,4rem)] leading-[1.0] font-extrabold tracking-[-0.035em] text-[var(--section-fg)]"
            >
              <span>{content.headline}</span>{" "}
              <span className="font-semibold tracking-[-0.03em] text-[var(--section-muted)]">
                {content.headlineAccent}
              </span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mt-4 flex flex-wrap items-baseline gap-x-1 gap-y-1 text-[clamp(1rem,1.5vw,1.15rem)] font-semibold tracking-[-0.01em] text-[var(--section-fg)]"
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

            <motion.div
              variants={itemVariants}
              className="mt-5 max-w-[38rem] space-y-4 text-[1rem] leading-[1.65] text-[var(--section-muted)] lg:text-[1.08rem]"
            >
              {content.body.map((paragraph, index) => (
                <p key={index} className="m-0">
                  {paragraph}
                </p>
              ))}
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="mt-5 flex flex-col items-stretch gap-0 sm:flex-row sm:flex-wrap sm:items-center"
            >
              {content.ctas.map((cta, index) => (
                <motion.a
                  key={cta.label}
                  href={cta.href}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: easeOut }}
                  className={cn(
                    "inline-flex h-11 items-center justify-center border border-[rgba(12,12,14,0.5)] px-5 text-[0.72rem] font-semibold tracking-[0.16em] text-[var(--section-fg)] uppercase no-underline transition-colors hover:bg-[rgba(12,12,14,0.05)] sm:h-11",
                    index > 0 && "border-t-0 sm:border-t sm:border-l-0",
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
            className="flex flex-col lg:pt-1"
            aria-label={content.socialLabel}
            variants={railVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            <motion.h3
              variants={itemVariants}
              className="m-0 max-w-[20ch] text-[1.05rem] font-medium tracking-[-0.01em] text-[var(--section-fg)] lg:text-[1.15rem]"
            >
              {content.socialLabel}
            </motion.h3>

            <motion.blockquote
              cite={testimonial.href}
              variants={cardVariants}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className="relative mt-4 m-0 overflow-hidden border border-[rgba(12,12,14,0.14)] bg-[color-mix(in_srgb,var(--section-raised)_88%,transparent)] px-5 py-5 backdrop-blur-[2px] sm:px-6 sm:py-6"
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

              <p className="mt-4 m-0 text-[1rem] leading-[1.5] font-semibold tracking-[-0.015em] text-[var(--section-fg)] lg:text-[1.05rem]">
                {testimonial.quote.map((part, index) => (
                  <QuotePart key={`${part.type}-${index}`} part={part} />
                ))}
              </p>

              <footer className="mt-4 flex items-center gap-2.5 border-t border-[rgba(12,12,14,0.1)] pt-4">
                <span
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(12,12,14,0.12)] bg-[rgba(12,12,14,0.04)] text-[0.65rem] font-bold tracking-[0.06em] text-[var(--section-fg)]"
                  aria-hidden
                >
                  {testimonial.authorInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <cite className="block truncate text-[0.9rem] font-bold not-italic tracking-[-0.01em] text-[var(--section-fg)]">
                    {testimonial.authorName}
                  </cite>
                  <a
                    href={testimonial.href}
                    className="mt-0.5 block truncate text-[0.78rem] text-[var(--section-muted)] no-underline transition-colors hover:text-[var(--accent)]"
                  >
                    {testimonial.authorHandle}
                  </a>
                </div>
                <a
                  href={testimonial.href}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-[rgba(12,12,14,0.2)] text-[var(--section-fg)] transition-colors hover:bg-[rgba(12,12,14,0.05)]"
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
            className="-mt-2 w-full shrink-0"
          >
            <AdSlot ad={ad} />
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Broadcast loft wash — cool start burns into warm bright plaster (Penyiar tone).
 * GSAP scrubs [data-burn-*] layers on scroll; see FrequencyTuning.
 */
function StudioAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Soft studio photo plane */}
      <div
        data-parallax="8"
        className="absolute inset-0 opacity-[0.22] will-change-transform"
      >
        <Image
          src="/cover-image.png"
          alt=""
          fill
          sizes="100vw"
          className="scale-105 object-cover object-[70%_30%] blur-[2px]"
        />
      </div>

      {/* Start: cool concrete (current Tentang) */}
      <div
        data-burn-cool
        className="absolute inset-0 will-change-[opacity]"
        style={{
          background: `
            linear-gradient(
              115deg,
              rgba(230, 231, 234, 0.96) 0%,
              rgba(230, 231, 234, 0.82) 42%,
              rgba(230, 231, 234, 0.92) 100%
            )
          `,
        }}
      />

      {/* Mid: ember burn flare */}
      <div
        data-burn-ember
        className="absolute inset-0 will-change-[opacity]"
        style={{
          opacity: 0,
          background: `
            radial-gradient(
              ellipse 70% 55% at 78% 22%,
              rgba(196, 92, 38, 0.55) 0%,
              rgba(196, 92, 38, 0.18) 38%,
              transparent 68%
            ),
            radial-gradient(
              ellipse 55% 50% at 18% 78%,
              rgba(160, 60, 20, 0.28) 0%,
              transparent 60%
            ),
            linear-gradient(
              160deg,
              rgba(40, 22, 14, 0.35) 0%,
              rgba(196, 92, 38, 0.22) 48%,
              rgba(40, 22, 14, 0.2) 100%
            )
          `,
        }}
      />

      {/* End: warm bright plaster (matches Penyiar / other light sections) */}
      <div
        data-burn-warm
        className="absolute inset-0 will-change-[opacity]"
        style={{
          opacity: 0,
          background: `
            radial-gradient(ellipse 50% 45% at 85% 20%, rgba(196,92,38,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 8% 80%, rgba(12,12,14,0.08) 0%, transparent 50%),
            linear-gradient(165deg, rgba(200,196,186,0.92) 0%, rgba(200,196,186,0.82) 50%, rgba(200,196,186,0.9) 100%)
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
