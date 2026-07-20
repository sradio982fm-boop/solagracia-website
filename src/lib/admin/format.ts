/** Formats decimal hour to "HH:MM" (supports 15-minute steps). */
export function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour % 1) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Formats an ISO date string to Indonesian locale short format. */
export function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Converts "HH:mm" string to decimal hour. */
export function timeToHour(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) + (m ?? 0) / 60;
}

/** Converts decimal hour to "HH:mm" string. */
export function hourToTime(hour: number): string {
  return formatHour(hour);
}
