"use client";

import { motion } from "framer-motion";
import { easeOut } from "@/lib/motion";

type HeroSocialRailProps = {
  tagline?: string;
};

/**
 * Far-right micro rail — vertical tagline only (socials live under the title).
 */
export function HeroSocialRail({ tagline }: HeroSocialRailProps) {
  if (!tagline) return null;

  return (
    <aside
      className="pointer-events-none absolute z-10 hidden md:block"
      style={{
        top: "calc(var(--frame-inset) + 3.5rem)",
        bottom: "calc(var(--frame-inset) + 5.5rem)",
        right: "calc(var(--frame-inset) + min(32%, 24rem) + 10px)",
        width: "2.25rem",
      }}
      aria-hidden
    >
      <div className="flex h-full flex-col items-center justify-end">
        <motion.p
          className="m-0 text-[10px] font-medium tracking-[0.28em] text-white/45 uppercase"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: easeOut }}
        >
          {tagline}
        </motion.p>
      </div>
    </aside>
  );
}
