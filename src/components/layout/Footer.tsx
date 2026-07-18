"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  easeOut,
  fadeUpSoft,
  hoverLift,
  staggerContainer,
  tapPress,
  viewportLoose,
} from "@/lib/motion";
import type { FooterContent } from "@/types/site";

type FooterProps = {
  content: FooterContent;
};

/**
 * Site footer — brand + socials + nav.
 * Address / hotlines / hours live in #kontak.
 */
export function Footer({ content }: FooterProps) {
  const year = new Date().getFullYear();
  const copyright = content.copyrightText.replace("{year}", String(year));
  const titleLines = content.brandTitle.split("\n");

  return (
    <footer
      className="relative overflow-hidden border-t border-[var(--line-soft)] bg-[var(--bg-void)] px-[clamp(20px,5vw,72px)] pt-[clamp(48px,7vw,88px)] pb-[calc(var(--section-pad-bottom)+12px)] text-[var(--text-main)]"
      role="contentinfo"
    >
      <div className="relative z-[1] mx-auto max-w-[1200px] md:pl-[calc(var(--rail))]">
        <motion.div
          variants={staggerContainer(0.1, 0.02)}
          initial="hidden"
          whileInView="show"
          viewport={viewportLoose}
          className="grid grid-cols-1 gap-[clamp(32px,4vw,56px)] border-b border-[var(--line-soft)] pb-[clamp(40px,6vw,72px)] lg:grid-cols-[1.4fr_1fr_1fr]"
        >
          <motion.div variants={fadeUpSoft} className="flex max-w-[360px] flex-col gap-5">
            <h2 className="m-0 text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[0.92] font-extrabold tracking-[-0.03em] uppercase">
              {titleLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < titleLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </h2>
            <p className="m-0 max-w-[20rem] text-[0.9rem] leading-relaxed text-[var(--text-dim)]">
              {content.brandDescription}
            </p>
            <div className="flex flex-wrap items-center gap-0">
              <motion.a
                href={content.listenHref}
                whileHover={hoverLift}
                whileTap={tapPress}
                className="inline-flex h-11 items-center gap-2.5 border border-[var(--line)] px-4 text-[0.72rem] font-semibold tracking-[0.18em] text-[var(--text-main)] uppercase no-underline transition-colors hover:bg-white/10"
              >
                <PlayIcon />
                Dengarkan
              </motion.a>
              <motion.a
                href={content.contactHref}
                whileHover={hoverLift}
                whileTap={tapPress}
                className="inline-flex h-11 items-center border border-l-0 border-[var(--line)] px-4 text-[0.72rem] font-semibold tracking-[0.18em] text-[var(--text-dim)] uppercase no-underline transition-colors hover:bg-white/10 hover:text-[var(--text-main)]"
              >
                {content.contactLabel}
              </motion.a>
            </div>
          </motion.div>

          <motion.div variants={fadeUpSoft}>
            <FooterHeading>Ikuti</FooterHeading>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {content.socialLinks.map((link) => (
                <li key={link.label}>
                  <FooterTextLink href={link.href} external>
                    {link.label}
                  </FooterTextLink>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUpSoft}>
            <FooterHeading>Jelajahi</FooterHeading>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {content.exploreLinks.map((link) => (
                <li key={link.label}>
                  <FooterTextLink href={link.href}>{link.label}</FooterTextLink>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportLoose}
          transition={{ duration: 0.55, delay: 0.1, ease: easeOut }}
          className="grid grid-cols-1 items-center gap-[clamp(20px,3vw,40px)] py-6 sm:grid-cols-[auto_1fr_auto]"
        >
          <span className="inline-flex items-baseline gap-1.5 uppercase tracking-[0.06em]">
            <span className="text-[0.95rem] font-extrabold text-[var(--text-main)]">
              SOLAGRACIA
            </span>
            <span className="text-[0.95rem] font-extrabold text-transparent italic [-webkit-text-stroke:1px_rgba(244,244,246,0.55)]">
              ·S RADIO
            </span>
          </span>

          <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-[clamp(14px,2.4vw,28px)] p-0">
            {content.legalLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-[0.72rem] font-semibold tracking-[0.16em] text-[var(--text-dim)] uppercase no-underline transition-colors hover:text-[var(--text-main)]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <span
            className="text-right text-[0.68rem] font-medium tracking-[0.12em] text-[var(--text-dim)] uppercase tabular-nums"
            suppressHydrationWarning
          >
            {copyright}
          </span>
        </motion.div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="relative mb-5 pl-4 text-[0.72rem] font-semibold tracking-[0.22em] text-[var(--text-main)] uppercase before:absolute before:top-1/2 before:left-0 before:h-px before:w-2.5 before:-translate-y-1/2 before:bg-[var(--line)]">
      {children}
    </h3>
  );
}

function FooterTextLink({
  href,
  children,
  external = false,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : undefined)}
      className="inline-flex items-center gap-2 text-[0.88rem] text-[var(--text-dim)] no-underline transition-colors hover:text-[var(--text-main)]"
    >
      {children}
    </a>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5L8 5.5Z" />
    </svg>
  );
}
