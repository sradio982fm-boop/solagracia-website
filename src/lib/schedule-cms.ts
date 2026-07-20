import { formatHour } from "@/lib/admin/format";
import type {
  OnAirContent,
  ProgramContent,
  ScheduleShow,
  WeekdayId,
} from "@/types/schedule";
import { programContent as fallbackProgram } from "@/data/schedule";
import { scheduleContent as fallbackOnAir } from "@/data/schedule";

const WEEKDAY_IDS: WeekdayId[] = [
  "minggu",
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
];

export type SlotRow = {
  id: string;
  day_of_week: number;
  start_hour: number;
  end_hour: number;
  sort_order: number;
  shows: {
    id: string;
    title: string;
    description: string | null;
    cover_url: string | null;
    tag: string | null;
    hosts: { name: string } | null;
  } | null;
};

export function mapSlotToScheduleShow(slot: SlotRow): ScheduleShow | null {
  const show = slot.shows;
  if (!show) return null;

  const endHour = slot.end_hour >= 24 ? 24 : slot.end_hour;

  return {
    id: `${show.id}-${slot.id}`,
    title: show.title,
    host: show.hosts?.name || "Solagracia Desk",
    startTime: formatHour(slot.start_hour),
    endTime: formatHour(endHour),
    imageSrc: show.cover_url || "/cover-image.png",
    imageAlt: `${show.title} — Solagracia`,
    tag: show.tag || undefined,
    description: show.description || undefined,
    href: "#program",
  };
}

export function buildProgramFromSlots(
  slots: SlotRow[],
  header?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    frequencyLabel?: string;
  },
): ProgramContent {
  const byDay = Object.fromEntries(
    WEEKDAY_IDS.map((id) => [id, [] as ScheduleShow[]]),
  ) as Record<WeekdayId, ScheduleShow[]>;

  for (const slot of slots) {
    const day = WEEKDAY_IDS[slot.day_of_week];
    if (!day) continue;
    const mapped = mapSlotToScheduleShow(slot);
    if (mapped) byDay[day].push(mapped);
  }

  for (const day of WEEKDAY_IDS) {
    byDay[day].sort(
      (a, b) => a.startTime.localeCompare(b.startTime),
    );
  }

  const hasAny = WEEKDAY_IDS.some((day) => byDay[day].length > 0);
  if (!hasAny) {
    return {
      ...fallbackProgram,
      ...(header?.eyebrow ? { eyebrow: header.eyebrow } : {}),
      ...(header?.title ? { title: header.title } : {}),
      ...(header?.description ? { description: header.description } : {}),
      ...(header?.frequencyLabel
        ? { frequencyLabel: header.frequencyLabel }
        : {}),
    };
  }

  return {
    eyebrow: header?.eyebrow || fallbackProgram.eyebrow,
    title: header?.title || fallbackProgram.title,
    description: header?.description || fallbackProgram.description,
    frequencyLabel: header?.frequencyLabel,
    days: fallbackProgram.days,
    byDay,
  };
}

export function buildOnAirFromSlots(
  slots: SlotRow[],
  labels?: {
    label?: string;
    upcomingLabel?: string;
    fallbackTitle?: string;
  },
): OnAirContent {
  const todaySlots = slots
    .slice()
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order || a.start_hour - b.start_hour,
    );
  const shows = todaySlots
    .map(mapSlotToScheduleShow)
    .filter((s): s is ScheduleShow => Boolean(s));

  return {
    label: labels?.label || fallbackOnAir.label,
    upcomingLabel: labels?.upcomingLabel || fallbackOnAir.upcomingLabel,
    fallbackTitle: labels?.fallbackTitle || fallbackOnAir.fallbackTitle,
    shows: shows.length ? shows : fallbackOnAir.shows,
  };
}
