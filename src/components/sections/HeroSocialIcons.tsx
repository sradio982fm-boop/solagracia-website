"use client";

import { motion } from "framer-motion";
import { hoverIcon, tapPress } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { SocialLink } from "@/types/site";

type HeroSocialIconsProps = {
  links: readonly SocialLink[];
  /** Join borders with a following sibling control (e.g. Tentang CTA) */
  joined?: boolean;
  className?: string;
};

/**
 * Square social marks — TikTok, Instagram, WhatsApp under hero title.
 */
export function HeroSocialIcons({
  links,
  joined = false,
  className,
}: HeroSocialIconsProps) {
  return (
    <ul
      className={cn("m-0 flex list-none items-center p-0", className)}
      aria-label="Sosial media"
    >
      {links.map((link, index) => (
        <li key={link.label}>
          <motion.a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            whileHover="hover"
            whileTap={tapPress}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center border border-[var(--frame-line)] text-white/85 transition-colors hover:bg-white/10 hover:text-white",
              joined && index > 0 && "border-l-0",
            )}
          >
            <motion.span
              className="inline-flex"
              variants={{ hover: hoverIcon }}
            >
              <SocialIcon icon={link.icon} />
            </motion.span>
          </motion.a>
        </li>
      ))}
    </ul>
  );
}

export function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
  if (icon === "tiktok") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.6 5.82A4.84 4.84 0 0 1 14.3 3h-2.68v12.4a2.52 2.52 0 1 1-1.78-2.41V10.2a5.17 5.17 0 1 0 4.46 5.12V8.86a7.46 7.46 0 0 0 4.3 1.37V7.55a4.85 4.85 0 0 1-2.1-1.73Z" />
      </svg>
    );
  }

  if (icon === "instagram") {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="12" r="3.75" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.15 6.41 2.15 11.85c0 1.74.46 3.44 1.33 4.94L2 22l5.36-1.4a9.9 9.9 0 0 0 4.68 1.19h.01c5.46 0 9.89-4.41 9.89-9.85 0-2.63-1.03-5.1-2.89-6.96Zm-7 15.16h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.18.83.85-3.1-.2-.32a8.16 8.16 0 0 1-1.26-4.35c0-4.52 3.7-8.2 8.25-8.2a8.18 8.18 0 0 1 5.81 2.4 8.1 8.1 0 0 1 2.41 5.8c0 4.52-3.7 8.2-8.24 8.2Zm4.52-6.14c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74 1.57.68 2.18.74 2.96.62.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}
