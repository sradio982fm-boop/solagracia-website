import { NextRequest } from "next/server";

const DEFAULT_LOOKBACK_DAYS = 7;

/** Indonesia Western Time (WIB / Asia/Jakarta) is a fixed UTC+7 offset, no DST. */
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Shifts a UTC timestamp into Jakarta wall-clock time. */
function toJakarta(iso: string): Date {
  return new Date(new Date(iso).getTime() + JAKARTA_OFFSET_MS);
}

/**
 * Returns the hour of day (0–23) in Jakarta time (WIB, UTC+7).
 * Uses UTC math so the result is independent of the server's timezone.
 */
export function getJakartaHour(iso: string): number {
  return toJakarta(iso).getUTCHours();
}

/**
 * Returns the calendar day (YYYY-MM-DD) in Jakarta time (WIB, UTC+7).
 * Uses UTC math so the result is independent of the server's timezone.
 */
export function getJakartaDay(iso: string): string {
  return toJakarta(iso).toISOString().split("T")[0];
}

/**
 * Parses `from` and `to` query params from analytics requests.
 *
 * Accepts plain date strings (YYYY-MM-DD) or full ISO timestamps.
 * - `from` is normalized to start of that calendar day (00:00:00.000Z)
 * - `to` is normalized to end of that calendar day (23:59:59.999Z)
 *
 * Selecting "May 1 – May 27" therefore includes every record on both
 * boundary days, even when event hours/minutes fall later in the day.
 * DatePicker values that arrive as midnight ISO (e.g. `2026-07-20T00:00:00.000Z`)
 * are treated as calendar days and expanded the same way.
 */
export function parseDateRange(request: NextRequest): { from: string; to: string } {
  const searchParams = request.nextUrl.searchParams;
  const rawFrom = searchParams.get("from");
  const rawTo = searchParams.get("to");

  const to = rawTo ? toEndOfDay(rawTo) : new Date().toISOString();
  const from = rawFrom
    ? toStartOfDay(rawFrom)
    : new Date(
        Date.now() - DEFAULT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString();

  return { from, to };
}

/** Normalizes to 00:00:00.000Z of the given calendar date */
function toStartOfDay(dateStr: string): string {
  const day = extractDateOnly(dateStr);
  if (day) return `${day}T00:00:00.000Z`;
  return dateStr;
}

/** Normalizes to 23:59:59.999Z of the given calendar date */
function toEndOfDay(dateStr: string): string {
  const day = extractDateOnly(dateStr);
  if (day) return `${day}T23:59:59.999Z`;
  return dateStr;
}

/** YYYY-MM-DD, or leading calendar date from an ISO / datetime string */
function extractDateOnly(dateStr: string): string | null {
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  return match?.[1] ?? null;
}
