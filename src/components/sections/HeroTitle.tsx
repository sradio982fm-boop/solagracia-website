"use client";

import { motion } from "framer-motion";

type HeroTitleProps = {
  brand: string;
  eyebrow: string;
  support: string;
};

const easeOut = [0.16, 1, 0.3, 1] as const;

/**
 * Hero brand cluster — staggered letter rise + follow-through on support.
 * Skewed slate mark behind the title leading edge (Savoir Faire accent).
 */
export function HeroTitle({ brand, eyebrow, support }: HeroTitleProps) {
  return (
    <>
      <motion.p
        className="text-[10px] font-medium tracking-[0.32em] text-white/70 uppercase md:text-[11px]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeOut }}
      >
        {eyebrow}
      </motion.p>

      <motion.h1
        className="relative mt-3 w-fit text-[clamp(2.1rem,3.6vw,3.75rem)] leading-[0.92] font-extrabold tracking-[-0.02em]"
        aria-label={brand}
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.045, delayChildren: 0.12 },
          },
        }}
      >
        <motion.span
          className="pointer-events-none absolute top-[6%] left-[-0.08em] z-0 h-[88%] w-[1.65em] origin-left bg-[#5c6370]/90"
          aria-hidden
          initial={{ opacity: 0, scaleX: 0.35, x: -10, skewX: -18 }}
          animate={{ opacity: 1, scaleX: 1, x: 0, skewX: -18 }}
          transition={{ duration: 0.7, delay: 0.05, ease: easeOut }}
        />

        {brand.split("").map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            className="relative z-10 inline-block"
            variants={{
              hidden: { opacity: 0, y: 28, scaleY: 0.92 },
              show: {
                opacity: 1,
                y: 0,
                scaleY: 1,
                transition: {
                  duration: 0.55,
                  ease: easeOut,
                },
              },
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        className="mt-4 max-w-[18rem] text-[13px] leading-relaxed text-white/70 md:text-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55, ease: easeOut }}
      >
        {support}
      </motion.p>
    </>
  );
}
