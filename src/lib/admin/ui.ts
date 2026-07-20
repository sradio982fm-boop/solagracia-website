import type { CSSProperties } from "react";

/**
 * Solagracia admin tokens — soft stone neutrals (no pure black/white).
 * Ink for type & controls; hairline borders; warm-off surfaces.
 */
export const ADMIN_INK = "#1f1e1c";
export const ADMIN_INK_MUTED = "#5c5a56";
export const ADMIN_BORDER = "#d0cec9";
export const ADMIN_BORDER_STRONG = "#a8a59e";
export const ADMIN_SURFACE = "#fafaf8";
export const ADMIN_PAGE_BG = "#f2f1ee";
export const ADMIN_MUTED_BG = "#eeece8";
export const ADMIN_HOVER_BG = "#f0eeea";
export const ADMIN_FOCUS_RING = `0 0 0 2px ${ADMIN_SURFACE}, 0 0 0 4px ${ADMIN_INK}`;
export const ADMIN_TRANSITION = "150ms ease";

/** @deprecated use ADMIN_INK — kept for any older imports */
export const ADMIN_BLACK = ADMIN_INK;

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
