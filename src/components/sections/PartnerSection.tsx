"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { whatsappHref } from "@/data/partner";
import {
  easeOut,
  fadeUpCard,
  hoverLift,
  staggerContainer,
  tapPress,
  viewportOnce,
} from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { PartnerContent, SponsorshipPlan } from "@/types/partner";

type PartnerSectionProps = {
  content: PartnerContent;
};

const viewport = viewportOnce;
const listVariants = staggerContainer(0.07, 0.05);
const cardVariants = fadeUpCard;

/**
 * #partner — viewport-locked partner history + sponsorship plans.
 * Dark smoke surface (chrome stays white). No ad slot.
 */
export function PartnerSection({ content }: PartnerSectionProps) {
  const logos = [...content.partners, ...content.partners];

  return (
    <section
      id="partner"
      data-surface="smoke"
      className="section-surface-smoke section-slide relative flex flex-col border-t px-4 pt-[clamp(28px,4vw,48px)] pb-[var(--section-pad-bottom)] sm:px-6 md:pr-10 md:pl-[calc(var(--rail)+2.5rem)]"
    >
      <PartnerAtmosphere />

      <div className="relative z-[1] mx-auto flex h-full min-h-0 w-full max-w-[1120px] flex-col">
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.55, ease: easeOut }}
          className="shrink-0"
        >
          <p className="m-0 inline-block border border-[rgba(255,255,255,0.28)] px-2.5 py-1 text-[9px] font-semibold tracking-[0.22em] text-[var(--section-muted)] uppercase">
            {content.eyebrow}
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <h2 className="m-0 text-[clamp(1.9rem,4vw,3.1rem)] leading-[0.98] font-extrabold tracking-[-0.03em] text-[var(--section-fg)]">
              {content.title}
            </h2>
            <p className="m-0 max-w-[26rem] text-[0.82rem] leading-relaxed text-[var(--section-muted)]">
              {content.description}
            </p>
          </div>
        </motion.header>

        {/* Partner history carousel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.5, delay: 0.05, ease: easeOut }}
          className="mt-5 shrink-0"
        >
          <div className="mb-2.5 flex items-center gap-3">
            <span className="text-[9px] font-semibold tracking-[0.2em] text-[var(--section-muted)] uppercase">
              {content.historyLabel}
            </span>
            <span
              className="h-px min-w-0 flex-1 border-t border-dotted border-white/25"
              aria-hidden
            />
          </div>

          <div className="partner-logo-marquee relative overflow-hidden border border-[rgba(255,255,255,0.12)] bg-black/35">
            <div className="partner-logo-marquee__track flex w-max items-stretch">
              {logos.map((partner, index) => (
                <div
                  key={`${partner.id}-${index}`}
                  className="flex w-[9.5rem] shrink-0 flex-col items-center justify-center gap-2 border-r border-[rgba(255,255,255,0.1)] px-4 py-3.5 md:w-[11rem] md:py-4"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center border border-[rgba(255,255,255,0.22)] text-[0.72rem] font-extrabold tracking-[0.08em] text-white/85">
                    {partner.initials}
                  </span>
                  <span className="max-w-full truncate text-center text-[10px] font-medium tracking-[0.06em] text-white/55 uppercase">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sponsorship plans */}
        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <div className="mb-3 flex shrink-0 items-center gap-3">
            <span className="text-[9px] font-semibold tracking-[0.2em] text-[var(--section-muted)] uppercase">
              {content.plansLabel}
            </span>
            <span
              className="h-px min-w-0 flex-1 border-t border-dotted border-white/25"
              aria-hidden
            />
          </div>

          <motion.div
            variants={listVariants}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            className="flex min-h-0 flex-1 gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-3.5 md:overflow-visible md:pb-0 md:snap-none lg:gap-4 [&::-webkit-scrollbar]:hidden"
          >
            {content.plans.map((plan) => (
              <motion.div
                key={plan.id}
                variants={cardVariants}
                className="w-[min(86vw,20rem)] shrink-0 snap-center md:w-auto md:min-h-0"
              >
                <PlanCard
                  plan={plan}
                  whatsappNumber={content.whatsappNumber}
                />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-3 flex shrink-0 justify-center">
            <a
              href={content.moreInfoHref}
              className="inline-flex h-10 items-center border border-[rgba(255,255,255,0.35)] px-5 text-[0.68rem] font-semibold tracking-[0.18em] text-white/80 uppercase no-underline transition-colors hover:bg-white/10 hover:text-white"
            >
              {content.moreInfoLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlanCard({
  plan,
  whatsappNumber,
}: {
  plan: SponsorshipPlan;
  whatsappNumber: string;
}) {
  const href = whatsappHref(whatsappNumber, plan.whatsappMessage);

  return (
    <motion.article
      whileHover={hoverLift}
      className={cn(
        "relative flex h-full min-h-[240px] flex-col border px-4 py-4 md:min-h-0 lg:px-5 lg:py-5",
        plan.featured
          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,rgba(10,10,11,0.92))]"
          : "border-[rgba(255,255,255,0.14)] bg-black/40",
      )}
    >
      {plan.featured ? (
        <span
          className="absolute top-0 left-4 h-[2px] w-10 bg-[var(--accent)]"
          aria-hidden
        />
      ) : null}

      <div className="flex items-center gap-2">
        <PlanIcon featured={Boolean(plan.featured)} />
        <h3 className="m-0 text-[0.95rem] font-extrabold tracking-[0.04em] text-white uppercase">
          {plan.name}
        </h3>
      </div>

      <p className="mt-4 m-0 border-b border-[rgba(255,255,255,0.12)] pb-3">
        <span className="text-[0.7rem] font-medium tracking-[0.12em] text-white/50 uppercase">
          IDR
        </span>{" "}
        <span className="text-[clamp(1.5rem,2.4vw,1.9rem)] font-extrabold tracking-[-0.03em] text-white">
          {plan.price}
        </span>
        <span className="text-[0.8rem] font-medium text-white/55">
          {plan.unit}
        </span>
      </p>

      <ul className="mt-3 m-0 flex min-h-0 flex-1 list-none flex-col gap-2 overflow-y-auto p-0">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-[0.78rem] leading-snug text-white/70"
          >
            <CheckIcon featured={Boolean(plan.featured)} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        whileTap={tapPress}
        className={cn(
          "mt-4 inline-flex h-11 shrink-0 items-center justify-center text-[0.7rem] font-bold tracking-[0.16em] uppercase no-underline transition-colors",
          plan.featured
            ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
            : "border border-[rgba(255,255,255,0.35)] text-white hover:bg-white/10",
        )}
      >
        WhatsApp
      </motion.a>
    </motion.article>
  );
}

function PlanIcon({ featured }: { featured: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center border",
        featured
          ? "border-[var(--accent)] text-[var(--accent)]"
          : "border-white/25 text-white/70",
      )}
      aria-hidden
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 4v16M7 9l5-5 5 5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="square"
        />
      </svg>
    </span>
  );
}

function CheckIcon({ featured }: { featured: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        "mt-0.5 shrink-0",
        featured ? "text-[var(--accent)]" : "text-white/55",
      )}
      aria-hidden
    >
      <path
        d="M5 12.5l4.5 4.5L19 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
      />
    </svg>
  );
}

/**
 * Dark sponsorship stage — frequency rings + ember heat, not flat gradient.
 */
function PartnerAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        data-parallax="11"
        className="absolute inset-0 opacity-[0.2] will-change-transform"
      >
        <Image
          src="/cover-image.png"
          alt=""
          fill
          sizes="100vw"
          className="scale-110 object-cover object-[70%_35%] blur-[3px]"
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 0%, rgba(196,92,38,0.28) 0%, transparent 55%),
            radial-gradient(ellipse 45% 40% at 90% 80%, rgba(196,92,38,0.12) 0%, transparent 50%),
            linear-gradient(180deg, rgba(10,10,11,0.75) 0%, rgba(10,10,11,0.92) 40%, rgba(10,10,11,0.97) 100%)
          `,
        }}
      />

      <div className="absolute top-[-20%] left-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full border border-white/[0.05]" />
      <div className="absolute top-[-8%] left-1/2 h-[48vmax] w-[48vmax] -translate-x-1/2 rounded-full border border-[rgba(196,92,38,0.12)]" />

      <svg
        className="absolute bottom-[10%] left-[calc(var(--rail)+1rem)] h-16 w-[min(50%,480px)] opacity-[0.12]"
        viewBox="0 0 480 64"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 32 Q20 8 40 32 T80 32 T120 32 T160 32 T200 32 T240 32 T280 32 T320 32 T360 32 T400 32 T440 32 T480 32"
          stroke="white"
          strokeWidth="1.2"
        />
      </svg>

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.2] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "160px 160px",
        }}
      />

      <p className="absolute right-[4%] top-[18%] text-[clamp(3rem,8vw,6rem)] leading-none font-extrabold tracking-[-0.06em] text-white/[0.04] select-none">
        SPOT
      </p>
    </div>
  );
}
