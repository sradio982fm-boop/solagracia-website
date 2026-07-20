import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { cachedResponse, errorResponse } from "@/lib/api-helpers";

const SCHEDULE_SELECT = `
  start_hour,
  end_hour,
  show:shows!inner (
    title,
    cover_url,
    tag,
    status,
    host:hosts (
      name,
      photo_url
    )
  )
`;

type ScheduleRow = {
  start_hour: number;
  end_hour: number;
  show: unknown;
};

type NowPlayingShow = {
  title: string;
  hostName: string;
  hostPhoto: string;
  startHour: number;
  endHour: number;
  coverUrl?: string;
  tag?: string;
};

function getWibTime(): { dayOfWeek: number; hour: number } {
  const wib = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return {
    dayOfWeek: wib.getUTCDay(),
    hour:
      wib.getUTCHours() +
      wib.getUTCMinutes() / 60 +
      wib.getUTCSeconds() / 3600,
  };
}

/** Mirrors getOnAirShow logic using decimal hours instead of HH:mm. */
function isOnAir(startHour: number, endHour: number, hour: number): boolean {
  if (endHour > startHour) {
    return hour >= startHour && hour < endHour;
  }
  return hour >= startHour || hour < endHour;
}

function unwrapShow(entry: ScheduleRow) {
  const showRaw = entry.show;
  const show = (Array.isArray(showRaw) ? showRaw[0] : showRaw) as
    | {
        title: string;
        cover_url: string | null;
        tag: string | null;
        host: unknown;
      }
    | null
    | undefined;
  const hostRaw = show?.host;
  const host = (Array.isArray(hostRaw) ? hostRaw[0] : hostRaw) as
    | { name: string; photo_url: string | null }
    | null
    | undefined;

  return { show, host };
}

function formatShow(entry: ScheduleRow | undefined): NowPlayingShow | null {
  if (!entry) return null;

  const { show, host } = unwrapShow(entry);
  const startHour = Number(entry.start_hour);
  const endHour = Number(entry.end_hour);

  const formatted: NowPlayingShow = {
    title: show?.title || "",
    hostName: host?.name || "",
    hostPhoto: host?.photo_url || "",
    startHour,
    endHour,
  };

  if (show?.cover_url) formatted.coverUrl = show.cover_url;
  if (show?.tag) formatted.tag = show.tag;

  return formatted;
}

function findCurrent(
  entries: ScheduleRow[],
  hour: number,
): ScheduleRow | undefined {
  return entries.find((entry) =>
    isOnAir(Number(entry.start_hour), Number(entry.end_hour), hour),
  );
}

function findNextShow(
  todayEntries: ScheduleRow[],
  hour: number,
  current: ScheduleRow | undefined,
): ScheduleRow | undefined {
  const sorted = [...todayEntries].sort(
    (a, b) => Number(a.start_hour) - Number(b.start_hour),
  );

  if (current) {
    const startHour = Number(current.start_hour);
    const endHour = Number(current.end_hour);

    if (endHour <= startHour && hour < endHour) {
      const afterOvernight = sorted.find((e) => Number(e.start_hour) >= endHour);
      if (afterOvernight) return afterOvernight;
    }

    const currentIndex = sorted.indexOf(current);
    if (currentIndex >= 0 && currentIndex < sorted.length - 1) {
      return sorted[currentIndex + 1];
    }
  }

  const upcoming = sorted.find((e) => Number(e.start_hour) > hour);
  if (upcoming) return upcoming;

  return sorted.find((e) => e !== current) ?? sorted[0];
}

async function fetchDaySlots(
  dayOfWeek: number,
): Promise<ScheduleRow[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from("schedule_slots")
    .select(SCHEDULE_SELECT)
    .eq("day_of_week", dayOfWeek)
    .eq("shows.status", "published")
    .order("start_hour");

  if (error) throw error;
  return (data || []) as ScheduleRow[];
}

export async function GET() {
  try {
    const { dayOfWeek, hour } = getWibTime();
    const yesterday = (dayOfWeek + 6) % 7;

    const [todayEntries, yesterdayEntries] = await Promise.all([
      fetchDaySlots(dayOfWeek),
      fetchDaySlots(yesterday),
    ]);

    const spilloverEntries = yesterdayEntries.filter(
      (entry) => Number(entry.end_hour) < Number(entry.start_hour),
    );

    const current =
      findCurrent(spilloverEntries, hour) ??
      findCurrent(todayEntries, hour);

    const next = findNextShow(todayEntries, hour, current);

    return cachedResponse(
      {
        isLive: !!current,
        show: formatShow(current),
        nextShow: formatShow(next),
      },
      60,
      300,
    );
  } catch {
    return errorResponse("Failed to fetch now-playing", 500);
  }
}
