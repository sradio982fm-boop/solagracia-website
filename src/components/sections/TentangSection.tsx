"use client";

import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AdSlot } from "@/components/ads/AdSlot";
import { InstagramEmbed } from "@/components/sections/InstagramEmbed";
import { DESKTOP_MOTION_QUERY, ensureGsap, prefersReducedMotion } from "@/lib/gsap";
import {
  easeOut,
  fadeUp,
  fadeUpCard,
  staggerContainer,
  viewportOnce,
} from "@/lib/motion";
import { hasVisibleReel } from "@/lib/tentang";
import { sanitizeHref } from "@/lib/security";
import { cn } from "@/lib/utils";
import type { AdPlaceholder } from "@/types/ads";
import type { TentangContent } from "@/types/site";

type TentangSectionProps = {
  content: TentangContent;
  ad?: AdPlaceholder;
};

const columnVariants = staggerContainer(0.09, 0.04);
const railVariants = staggerContainer(0.12, 0.18);
const itemVariants = fadeUp;
const cardVariants = fadeUpCard;
const viewport = viewportOnce;

/** Soft EQ bars — studio meter language, decorative only */
const METER_BARS = [28, 52, 36, 68, 44, 78, 40, 62, 34, 56, 48, 70] as const;

/**
 * #tentang — viewport-locked loft about + Instagram Reel + partner spot.
 * Cool plaster burns into warm bright on scroll (matches Penyiar tone).
 */
function frequencyStamp(label: string): string {
  return label.replace(/\s*FM$/i, "").trim() || label;
}

export function TentangSection({ content, ad }: TentangSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { reel } = content;
  const frequencyLabel = content.frequencyLabel || "98.2 FM";
  const showReel = hasVisibleReel(reel);
  const [entranceMotion, setEntranceMotion] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const mq = window.matchMedia(DESKTOP_MOTION_QUERY);
    const sync = () => setEntranceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const enterHidden = entranceMotion ? "hidden" : false;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const gsap = ensureGsap();
      const mm = gsap.matchMedia();

      mm.add(DESKTOP_MOTION_QUERY, () => {
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
      });
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
      <StudioAtmosphere frequencyLabel={frequencyLabel} />

      {/* Top-aligned stack — copy fills the stage, ad rides directly under it */}
      <div className="relative z-[1] mx-auto flex h-full min-h-0 w-full max-w-[1180px] flex-col justify-start gap-2 pt-1 lg:gap-2 lg:pt-2">
        <div
          className={cn(
            "grid shrink-0 grid-cols-1 gap-6 lg:items-start lg:gap-12",
            showReel
              ? "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]"
              : "lg:grid-cols-1",
          )}
        >
          <motion.div
            className="flex flex-col"
            variants={columnVariants}
            initial={enterHidden}
            whileInView={entranceMotion ? "show" : undefined}
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
              Studio · {frequencyLabel}
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

            {content.stats.length > 0 ? (
              <motion.p
                variants={itemVariants}
                className="mt-4 flex flex-wrap items-baseline gap-x-1 gap-y-1 text-[clamp(1rem,1.5vw,1.15rem)] font-semibold tracking-[-0.01em] text-[var(--section-fg)]"
              >
                {content.stats.map((stat, index) => (
                  <span
                    key={`${stat.value}-${stat.label}-${index}`}
                    className="inline-flex items-baseline gap-1"
                  >
                    <span className="underline decoration-[var(--section-fg)] decoration-1 underline-offset-[5px]">
                      {stat.value} {stat.label}
                    </span>
                    {index < content.stats.length - 1 ? (
                      <span
                        className="mx-1 text-[var(--section-muted)]"
                        aria-hidden
                      >
                        ,
                      </span>
                    ) : null}
                  </span>
                ))}
              </motion.p>
            ) : null}

            <motion.div
              variants={itemVariants}
              className="mt-5 max-w-[38rem] space-y-4 text-[1rem] leading-[1.65] text-[var(--section-muted)] lg:text-[1.08rem]"
            >
              {content.body.map((paragraph, index) => (
                <p key={index} className="m-0">
                  <ParagraphWithBreaks text={paragraph} />
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
                  href={sanitizeHref(cta.href)}
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

          {showReel ? (
            <motion.aside
              className="flex flex-col lg:pt-1"
              aria-label={content.socialLabel}
              variants={railVariants}
              initial={enterHidden}
              whileInView={entranceMotion ? "show" : undefined}
              viewport={viewport}
            >
              <motion.h3
                variants={itemVariants}
                className="m-0 max-w-none text-[1.05rem] font-medium tracking-[-0.01em] text-[var(--section-fg)] lg:text-[1.15rem]"
              >
                {content.socialLabel}
              </motion.h3>

              <motion.div variants={cardVariants} className="mt-4">
                <InstagramEmbed
                  href={reel.href}
                  title="Instagram Reel — S Radio"
                />
              </motion.div>
            </motion.aside>
          ) : null}
        </div>

        {ad ? (
          <motion.div
            initial={entranceMotion ? { opacity: 0, y: 14 } : false}
            whileInView={entranceMotion ? { opacity: 1, y: 0 } : undefined}
            viewport={viewport}
            transition={{ duration: 0.55, ease: easeOut }}
            className="mt-4 w-full shrink-0 pb-2 lg:mt-6"
          >
            <AdSlot ad={ad} compact />
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}

function ParagraphWithBreaks({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={index}>
          {index > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Broadcast loft wash — cool start burns into warm bright plaster.
 * Desktop pointer: GSAP scrubs [data-burn-*] layers. Touch: no extra paint.
 */
function StudioAtmosphere({ frequencyLabel }: { frequencyLabel: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Burn stack is desktop-pointer only — scrubbing full-bleed
          gradients / grain / blur on touch tanks scroll FPS. */}
      <div
        data-parallax="8"
        className="absolute inset-0 hidden opacity-[0.22] desktop-motion:block desktop-motion:will-change-transform"
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
        className="absolute inset-0 hidden desktop-motion:block desktop-motion:will-change-[opacity]"
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
        className="absolute inset-0 hidden desktop-motion:block desktop-motion:will-change-[opacity]"
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

      {/* End: warm bright plaster */}
      <div
        data-burn-warm
        className="absolute inset-0 hidden opacity-0 desktop-motion:block desktop-motion:will-change-[opacity]"
        style={{
          background: `
            radial-gradient(ellipse 50% 45% at 85% 20%, rgba(196,92,38,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 40% 35% at 8% 80%, rgba(12,12,14,0.08) 0%, transparent 50%),
            linear-gradient(165deg, rgba(200,196,186,0.92) 0%, rgba(200,196,186,0.82) 50%, rgba(200,196,186,0.9) 100%)
          `,
        }}
      />

      {/* Blueprint grid */}
      <div
        className="absolute inset-0 hidden opacity-[0.07] desktop-motion:block"
        style={{
          backgroundImage: `
            linear-gradient(rgba(12,12,14,0.9) 1px, transparent 1px),
            linear-gradient(90deg, rgba(12,12,14,0.9) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Film grain — SVG turbulence + multiply is a mobile paint bomb */}
      <div
        className="absolute inset-0 hidden opacity-[0.18] mix-blend-multiply desktop-motion:block"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* Frequency watermark */}
      <p className="absolute top-[12%] right-[6%] hidden text-[clamp(4rem,12vw,9rem)] leading-none font-extrabold tracking-[-0.06em] text-[rgba(12,12,14,0.05)] select-none md:block">
        {frequencyStamp(frequencyLabel)}
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
