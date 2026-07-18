"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/lib/motion";

type HeroTitleProps = {
  brand: string;
  eyebrow: string;
  support: string;
};

/** Hero brand cluster — staggered letter rise + follow-through on support. */
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
        {brand.split("").map((char, index) => (
          <motion.span
            key={`${char}-${index}`}
            className="relative inline-block"
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
