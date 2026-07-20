export type AdSlotVariant = "strip" | "panel" | "inline" | "image";

/** match = inherit section surface; ink = void plate for contrast on light sections */
export type AdSlotTone = "match" | "ink";

/** banner = wide 4:1 strip; portrait = vertical creative (3:4) */
export type AdImageShape = "banner" | "portrait";

/**
 * `image` — whole creative is the asset (sponsor/line optional for a11y).
 * Other variants may include `imageSrc` as a thumb beside/above copy.
 */
export type AdPlaceholder = {
  /** CMS ad slot id — enables click tracking redirect */
  id?: string;
  /** Quiet label — prefer Partner over “Iklan” */
  label?: string;
  sponsor?: string;
  line?: string;
  variant: AdSlotVariant;
  tone?: AdSlotTone;
  href?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Aspect for `variant: "image"` — defaults to banner */
  imageShape?: AdImageShape;
};
