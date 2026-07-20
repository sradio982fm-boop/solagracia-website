/** Formats decimal hour to "HH:MM" (supports 15-minute steps). */
export function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour % 1) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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
