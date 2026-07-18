import type { Transition, Variants } from "framer-motion";

/**
 * Shared Solagracia motion language — slow-in/out, stagger, staging.
 * Keep intensity editorial (DESIGN dials ~5), not decorative noise.
 */

export const easeOut = [0.16, 1, 0.3, 1] as const;
export const easeInOut = [0.42, 0, 0.58, 1] as const;

export const duration = {
  fast: 0.2,
  normal: 0.35,
  reveal: 0.6,
  slow: 0.75,
} as const;

export const transitionOut: Transition = {
  duration: duration.reveal,
  ease: easeOut,
};

export const viewportOnce = {
  once: true,
  margin: "-10% 0px -6% 0px",
  amount: 0.2,
} as const;

export const viewportLoose = {
  once: true,
  margin: "-8% 0px",
  amount: 0.15,
} as const;

/** Header / block fade-up (pose-to-pose) */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: transitionOut,
  },
};

/** Slightly softer rise for nested copy */
export const fadeUpSoft: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

/** Card enter with subtle scale (appeal, not bounce) */
export const fadeUpCard: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.slow, ease: easeOut },
  },
};

export function staggerContainer(
  staggerChildren = 0.08,
  delayChildren = 0.04,
): Variants {
  return {
    hidden: {},
    show: {
      transition: { staggerChildren, delayChildren },
    },
  };
}

/** Secondary action — hover lift */
export const hoverLift = {
  y: -3,
  transition: { duration: duration.fast, ease: easeOut },
};

/** Secondary action — press */
export const tapPress = {
  scale: 0.98,
  transition: { duration: 0.12, ease: easeOut },
};

/** Icon / mark wiggle on hover (secondary action) */
export const hoverIcon = {
  rotate: [0, -8, 8, 0],
  transition: { duration: 0.35, ease: easeOut },
};

export const heroCtaStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.62 },
  },
};

export const heroCtaItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};
