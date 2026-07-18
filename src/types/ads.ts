export type AdSlotVariant = "strip" | "panel" | "inline" | "image";

/** match = inherit section surface; ink = void plate for contrast on light sections */
export type AdSlotTone = "match" | "ink";

/**
 * `image` — whole creative is the asset (sponsor/line optional for a11y).
 * Other variants may include `imageSrc` as a thumb beside/above copy.
 */
export type AdPlaceholder = {
  /** Quiet label — prefer Partner over “Iklan” */
  label?: string;
  sponsor?: string;
  line?: string;
  variant: AdSlotVariant;
  tone?: AdSlotTone;
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
};
