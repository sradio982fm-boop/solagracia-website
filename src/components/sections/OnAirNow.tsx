"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  easeOut,
  fadeUpSoft,
  hoverLift,
  staggerContainer,
  tapPress,
} from "@/lib/motion";
import { formatShowWindow } from "@/lib/schedule";
import { cn } from "@/lib/utils";
import type { OnAirContent, ScheduleShow } from "@/types/schedule";

type OnAirNowProps = {
  content: OnAirContent;
  show: ScheduleShow | null;
  upcoming: ScheduleShow[];
  className?: string;
  /** Full schedule rail vs stacked mobile */
  layout?: "rail" | "stack";
};

/**
 * Schedule panel — featured live show + upcoming list.
 * Structure inspired by broadcast schedule UIs; surfaces follow Solagracia DNA.
 */
export function OnAirNow({
  content,
  show,
  upcoming,
  className,
  layout = "rail",
}: OnAirNowProps) {
  const title = show?.title ?? content.fallbackTitle;
  const host = show?.host ?? "Solagracia";
  const windowLabel = show ? formatShowWindow(show) : "—";
  const imageSrc = show?.imageSrc ?? "/cover-image.png";
  const href = show?.href ?? "#program";

  return (
    <motion.div
      className={cn(
        "flex min-h-0 flex-col",
        layout === "rail" && "h-full",
        className,
      )}
      variants={staggerContainer(0.08, 0.12)}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUpSoft}>
        <ScheduleHeading label={content.label} live />
      </motion.div>

      <motion.a
        href={href}
        variants={fadeUpSoft}
        whileHover={{ scale: 1.01 }}
        whileTap={tapPress}
        transition={{ duration: 0.35, ease: easeOut }}
        className={cn(
          "group relative mt-3 flex flex-col items-center justify-center overflow-hidden border border-[var(--frame-line)] no-underline",
          layout === "rail"
            ? "min-h-0 flex-[1.15] px-4 py-6"
            : "aspect-[16/10] px-4 py-5",
        )}
      >
        <span className="pointer-events-none absolute inset-0">
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="24rem"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
          <span
            className="absolute inset-0 bg-[linear-gradient(160deg,rgba(8,10,16,0.55)_0%,rgba(8,10,16,0.72)_45%,rgba(196,92,38,0.35)_100%)]"
            aria-hidden
          />
          <span
            className="absolute -top-8 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full border border-white/15"
            aria-hidden
          />
          <span
            className="absolute -top-2 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full border border-white/10"
            aria-hidden
          />
        </span>

        <span className="relative z-[1] flex max-w-[16rem] flex-col items-center text-center">
          <span className="text-[10px] font-semibold tracking-[0.28em] text-white/70 uppercase">
            Solagracia
          </span>
          <span className="mt-3 text-[11px] font-medium tracking-[0.2em] text-white/55 uppercase">
            {host}
          </span>
          <span className="mt-1.5 text-[clamp(1.2rem,2vw,1.55rem)] leading-tight font-extrabold tracking-[-0.02em] text-white">
            {title}
          </span>
          <span className="mt-4 text-[12px] font-medium tracking-[0.04em] text-white/85 tabular-nums">
            {windowLabel}
          </span>
        </span>
      </motion.a>

      <motion.div variants={fadeUpSoft}>
        <ScheduleHeading
          label={content.upcomingLabel}
          className={layout === "rail" ? "mt-5" : "mt-6"}
        />
      </motion.div>

      <motion.ul
        variants={staggerContainer(0.06, 0)}
        className={cn(
          "mt-3 m-0 flex list-none flex-col gap-2.5 p-0",
          layout === "rail" && "min-h-0 flex-1 overflow-y-auto pr-0.5",
        )}
      >
        {upcoming.map((item) => (
          <motion.li key={item.id} variants={fadeUpSoft}>
            <motion.a
              href={item.href ?? "#program"}
              whileHover={hoverLift}
              whileTap={tapPress}
              className="group grid grid-cols-[56px_1fr] items-center gap-3 border border-[var(--frame-line)] bg-black/35 px-2.5 py-2.5 no-underline transition-colors hover:bg-black/50 sm:grid-cols-[64px_1fr]"
            >
              <span className="relative aspect-square overflow-hidden bg-white/10">
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </span>
              <span className="min-w-0 py-0.5 pr-1">
                <span className="block truncate text-[13px] font-bold tracking-tight text-white">
                  {item.title}
                </span>
                <span className="mt-0.5 block truncate text-[10px] tracking-[0.12em] text-white/45 uppercase">
                  {item.host}
                </span>
                <span className="mt-1 block text-[11px] text-white/70 tabular-nums">
                  {formatShowWindow(item)}
                </span>
              </span>
            </motion.a>
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

function ScheduleHeading({
  label,
  live = false,
  className,
}: {
  label: string;
  live?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="inline-flex shrink-0 items-center gap-2 bg-white px-2.5 py-1.5 text-[9px] font-bold tracking-[0.18em] text-[#0c0c0e] uppercase">
        {live ? (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)] opacity-60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          </span>
        ) : null}
        {label}
      </span>
      <span
        className="h-px min-w-0 flex-1 border-t border-dotted border-white/35"
        aria-hidden
      />
    </div>
  );
}
