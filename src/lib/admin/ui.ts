import type { CSSProperties } from "react";

/**
 * Solagracia admin palette (light surfaces, no yellow).
 * Source: #6BA259 / #A3DD83 / #38817A
 */
export const ADMIN_PRIMARY = "#6BA259";
export const ADMIN_PRIMARY_LIGHT = "#A3DD83";
export const ADMIN_HIGHLIGHT = "#e5f2dc";
export const ADMIN_TEAL = "#38817A";

/** Readable body/heading ink derived from teal */
export const ADMIN_INK = "#1f3d3a";
export const ADMIN_INK_MUTED = "#5a726e";

/** Soft green-tinted chrome — keep backgrounds light */
export const ADMIN_BORDER = "#c5d6d1";
export const ADMIN_BORDER_STRONG = "#38817A";
export const ADMIN_SURFACE = "#ffffff";
export const ADMIN_PAGE_BG = "#f4f7f0";
export const ADMIN_MUTED_BG = "#eef6e8";
export const ADMIN_HOVER_BG = "#e5f2dc";
export const ADMIN_FOCUS_RING = `0 0 0 2px ${ADMIN_SURFACE}, 0 0 0 4px ${ADMIN_PRIMARY}`;
export const ADMIN_TRANSITION = "150ms ease";

/** @deprecated use ADMIN_INK — kept for any older imports */
export const ADMIN_BLACK = ADMIN_INK;

/**
 * Mantine 10-step scale for primary / legacy `color="dark"` remaps.
 * Index 5 ≈ filled buttons; 7–9 ≈ strong accents / ink.
 */
export const ADMIN_COLOR_SCALE = [
  "#f7f9f2",
  "#eef6e8",
  "#d9edd0",
  "#A3DD83",
  "#86c96a",
  "#6BA259",
  "#558f48",
  "#38817A",
  "#2f6b66",
  "#1f3d3a",
] as const;

export function adminSurfaceStyle(extra?: CSSProperties): CSSProperties {
  return {
    borderColor: ADMIN_BORDER,
    background: ADMIN_SURFACE,
    transition: `border-color ${ADMIN_TRANSITION}, box-shadow ${ADMIN_TRANSITION}, background ${ADMIN_TRANSITION}`,
    ...extra,
  };
}

export function adminInteractiveSurfaceStyle(
  extra?: CSSProperties,
): CSSProperties {
  return adminSurfaceStyle({
    cursor: "pointer",
    ...extra,
  });
}
