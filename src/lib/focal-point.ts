/**
 * Focal point encoding for images.
 *
 * The focus is stored directly inside the image URL as a fragment, e.g.
 * `https://.../photo.webp#focus=50,25`. This keeps the data travelling with the
 * existing URL columns — no DB schema, API, or type changes — and is ignored by
 * the network layer (URL fragments are never sent in the image request).
 *
 * Values are percentages (0–100) matching CSS `object-position`, so a single
 * focal point works for any container aspect ratio.
 */

export interface FocalPoint {
  x: number;
  y: number;
}

const DEFAULT_POSITION = "50% 50%";
const CENTER: FocalPoint = { x: 50, y: 50 };
const FOCUS_PATTERN = /#focus=(-?[\d.]+),(-?[\d.]+)$/;

function clamp(value: number): number {
  if (Number.isNaN(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

export interface ParsedFocalUrl {
  /** Image URL with any focus fragment stripped — safe for `<img src>`. */
  cleanUrl: string;
  /** CSS `object-position` value, defaulting to centre. */
  objectPosition: string;
  /** The parsed focal point, or centre when none was encoded. */
  focus: FocalPoint;
}

export function parseFocalUrl(url: string | null | undefined): ParsedFocalUrl {
  if (!url) {
    return { cleanUrl: "", objectPosition: DEFAULT_POSITION, focus: CENTER };
  }

  const match = url.match(FOCUS_PATTERN);
  if (!match) {
    return { cleanUrl: url, objectPosition: DEFAULT_POSITION, focus: CENTER };
  }

  const x = clamp(parseFloat(match[1]));
  const y = clamp(parseFloat(match[2]));
  return {
    cleanUrl: url.replace(FOCUS_PATTERN, ""),
    objectPosition: `${x}% ${y}%`,
    focus: { x, y },
  };
}

/**
 * Encodes a focal point onto a URL. A centred focus omits the fragment so URLs
 * stay clean and match the default behaviour.
 */
export function buildFocalUrl(url: string, focus: FocalPoint): string {
  const { cleanUrl } = parseFocalUrl(url);
  const x = clamp(focus.x);
  const y = clamp(focus.y);
  if (round(x) === 50 && round(y) === 50) return cleanUrl;
  return `${cleanUrl}#focus=${round(x)},${round(y)}`;
}
