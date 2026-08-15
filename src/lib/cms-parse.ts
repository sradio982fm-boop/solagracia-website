/**
 * CMS parsers — missing key uses fallback; explicit empty/null stays empty.
 */

export type SiteConfigSection = Record<string, { value: string | null }>;

export function textAllowEmpty(
  section: Record<string, string | null> | undefined,
  key: string,
  fallbackValue: string,
): string {
  if (!section || !(key in section)) return fallbackValue;
  const value = section[key];
  if (value === null || value === undefined) return "";
  return value;
}

export function parseJsonArrayAllowEmpty<T>(
  section: Record<string, string | null> | undefined,
  key: string,
  fallbackValue: T[],
): T[] {
  if (!section || !(key in section)) return fallbackValue;
  const raw = section[key];
  if (raw === null || raw === undefined || raw === "") return [];
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function parseJsonObjectAllowEmpty<T extends Record<string, unknown>>(
  section: Record<string, string | null> | undefined,
  key: string,
  fallbackValue: T,
): T {
  if (!section || !(key in section)) return fallbackValue;
  const raw = section[key];
  if (raw === null || raw === undefined || raw === "") {
    return Object.fromEntries(
      Object.keys(fallbackValue).map((field) => [
        field,
        typeof fallbackValue[field] === "string" ? "" : fallbackValue[field],
      ]),
    ) as T;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<T>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return fallbackValue;
    }
    return { ...fallbackValue, ...parsed };
  } catch {
    return fallbackValue;
  }
}

const FALSE_TOKENS = new Set(["false", "0", "no", "off"]);

export function boolAllowEmpty(
  section: Record<string, string | null> | undefined,
  key: string,
  fallbackValue: boolean,
): boolean {
  if (!section || !(key in section)) return fallbackValue;
  const raw = section[key];
  if (raw === null || raw === undefined || raw === "") return fallbackValue;
  return !FALSE_TOKENS.has(raw.trim().toLowerCase());
}

/** Admin load: missing key → fallback; saved false-like → false. */
export function configBool(
  section: SiteConfigSection | undefined,
  key: string,
  fallbackValue: boolean,
): boolean {
  const entry = section?.[key];
  if (entry === undefined) return fallbackValue;
  const raw = entry.value;
  if (raw === null || raw === undefined || raw === "") return fallbackValue;
  return !FALSE_TOKENS.has(raw.trim().toLowerCase());
}

/** Admin load: missing key → fallback; saved empty/null → "". */
export function configText(
  section: SiteConfigSection | undefined,
  key: string,
  fallbackValue: string,
): string {
  const entry = section?.[key];
  if (entry === undefined) return fallbackValue;
  return entry.value ?? "";
}

export function configJsonArray<T>(
  section: SiteConfigSection | undefined,
  key: string,
  fallbackValue: T[],
): T[] {
  const entry = section?.[key];
  if (entry === undefined) return fallbackValue;
  const raw = entry.value;
  if (raw === null || raw === undefined || raw === "") return [];
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function headerField(
  header:
    | {
        eyebrow?: string;
        title?: string;
        titleAccent?: string;
        description?: string;
      }
    | undefined,
  key: "eyebrow" | "title" | "titleAccent" | "description",
  fallbackValue: string,
): string {
  if (!header) return fallbackValue;
  return header[key] ?? "";
}
