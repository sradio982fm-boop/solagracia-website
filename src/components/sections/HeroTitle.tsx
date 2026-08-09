"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { easeOut } from "@/lib/motion";

type HeroTitleProps = {
  brand: string;
  eyebrow: string;
  support: string;
};

/**
 * Split CMS brand into display lines.
 * Prefer explicit newlines; otherwise split on " - " / " – " once.
 */
export function splitBrandLines(brand: string): string[] {
  const normalized = brand.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const byNewline = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (byNewline.length > 1) return byNewline;

  const dashSplit = normalized.split(/\s+[–-]\s+/);
  if (dashSplit.length === 2) {
    return dashSplit.map((line) => line.trim()).filter(Boolean);
  }

  return [normalized];
}

/** Hero brand cluster — line/word rise (no mid-word wrap). */
export function HeroTitle({ brand, eyebrow, support }: HeroTitleProps) {
  const lines = splitBrandLines(brand);
  const supportText = support.trim();
  const eyebrowText = eyebrow.trim();
  const ariaLabel = lines.join(" — ") || brand;

  return (
    <>
      {eyebrowText ? (
        <motion.p
          className="text-[11px] font-semibold tracking-[0.32em] text-white/80 uppercase md:text-[12px]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeOut }}
        >
          {eyebrowText}
        </motion.p>
      ) : null}

      <motion.h1
        className="relative mt-3 w-full max-w-[18ch] text-[clamp(2.35rem,7.5vw,3.9rem)] leading-[1.08] font-extrabold tracking-[-0.015em] md:max-w-none md:text-[clamp(2.15rem,2.85vw,3.35rem)] md:leading-[1.08]"
        aria-label={ariaLabel}
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.055, delayChildren: 0.1 },
          },
        }}
      >
        {lines.map((line, lineIndex) => (
          <span
            key={`line-${lineIndex}`}
            className="block whitespace-nowrap"
          >
            {line.split(/(\s+)/).map((token, tokenIndex) => {
              if (/^\s+$/.test(token)) {
                return <Fragment key={`sp-${lineIndex}-${tokenIndex}`}> </Fragment>;
              }
              return (
                <motion.span
                  key={`w-${lineIndex}-${tokenIndex}-${token}`}
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 22, scaleY: 0.94 },
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
                  {token}
                </motion.span>
              );
            })}
          </span>
        ))}
      </motion.h1>

      {supportText ? (
        <motion.p
          className="mt-4 max-w-[18rem] text-[13px] leading-relaxed text-white/70 md:text-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55, ease: easeOut }}
        >
          {supportText}
        </motion.p>
      ) : null}
    </>
  );
}
