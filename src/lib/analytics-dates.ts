import { NextRequest } from "next/server";

const DEFAULT_LOOKBACK_DAYS = 7;
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

function toJakarta(iso: string): Date {
  return new Date(new Date(iso).getTime() + JAKARTA_OFFSET_MS);
}

export function getJakartaHour(iso: string): number {
  return toJakarta(iso).getUTCHours();
}

export function getJakartaDay(iso: string): string {
  return toJakarta(iso).toISOString().split("T")[0];
}

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

function toStartOfDay(dateStr: string): string {
  if (isDateOnly(dateStr)) {
    return `${dateStr}T00:00:00.000Z`;
  }
  return dateStr;
}

function toEndOfDay(dateStr: string): string {
  if (isDateOnly(dateStr)) {
    return `${dateStr}T23:59:59.999Z`;
  }
  return dateStr;
}

function isDateOnly(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}
