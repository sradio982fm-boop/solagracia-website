import type { ScheduleShow, WeekdayId } from "@/types/schedule";

const WEEKDAY_BY_JS_DAY: WeekdayId[] = [
  "minggu",
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
];

/** Map `Date.getDay()` → Solagracia weekday id */
export function getWeekdayId(now: Date = new Date()): WeekdayId {
  return WEEKDAY_BY_JS_DAY[now.getDay()] ?? "senin";
}

/** Convert "HH:mm" → minutes from midnight (`24:00` → end of day). */
export function timeToMinutes(time: string): number {
  const [hoursRaw, minutesRaw] = time.split(":").map(Number);
  const hours = hoursRaw ?? 0;
  const minutes = minutesRaw ?? 0;
  if (hours >= 24) return 24 * 60;
  return hours * 60 + minutes;
}

/**
 * Pick the show whose window contains `now`.
 * Overnight slots (e.g. 22:00–02:00) are supported.
 */
export function getOnAirShow(
  shows: readonly ScheduleShow[],
  now: Date = new Date(),
): ScheduleShow | null {
  if (shows.length === 0) return null;

  const current = now.getHours() * 60 + now.getMinutes();

  for (const show of shows) {
    const start = timeToMinutes(show.startTime);
    const end = timeToMinutes(show.endTime);

    if (end > start) {
      if (current >= start && current < end) return show;
      continue;
    }

    // Crosses midnight
    if (current >= start || current < end) return show;
  }

  return null;
}

/**
 * Next shows after the live slot (skips whatever is on air now).
 * Wraps to the start of the slate when the day is nearly done.
 */
export function getUpcomingShows(
  shows: readonly ScheduleShow[],
  limit = 3,
  now: Date = new Date(),
): ScheduleShow[] {
  if (shows.length === 0 || limit <= 0) return [];

  const onAir = getOnAirShow(shows, now);
  const current = now.getHours() * 60 + now.getMinutes();
  const sorted = [...shows].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  const upcoming = sorted.filter(
    (show) => timeToMinutes(show.startTime) > current,
  );
  const wrapped = [...upcoming, ...sorted];

  const unique: ScheduleShow[] = [];
  for (const show of wrapped) {
    if (onAir && show.id === onAir.id) continue;
    if (unique.some((item) => item.id === show.id)) continue;
    unique.push(show);
    if (unique.length >= limit) break;
  }

  return unique;
}

export function formatShowWindow(show: ScheduleShow): string {
  return `${show.startTime} – ${show.endTime}`;
}
