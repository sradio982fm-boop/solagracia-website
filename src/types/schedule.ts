/**
 * Broadcast schedule — later sourced from CMS / API.
 * Times are local 24h "HH:mm".
 */
export type ScheduleShow = {
  id: string;
  title: string;
  host: string;
  startTime: string;
  endTime: string;
  imageSrc: string;
  imageAlt: string;
  /** Small corner tag — e.g. MUSIC MIX */
  tag?: string;
  description?: string;
  href?: string;
};

export type WeekdayId =
  | "minggu"
  | "senin"
  | "selasa"
  | "rabu"
  | "kamis"
  | "jumat"
  | "sabtu";

export type WeekdayOption = {
  id: WeekdayId;
  label: string;
};

export type OnAirContent = {
  /** Featured live slot header — e.g. "Lagi On Air" */
  label: string;
  /** Upcoming list header */
  upcomingLabel: string;
  /** Fallback when no slot matches the clock */
  fallbackTitle: string;
  shows: ScheduleShow[];
};

export type ProgramContent = {
  eyebrow: string;
  title: string;
  description: string;
  /** Brand frequency SoT — e.g. `98.2 FM` */
  frequencyLabel?: string;
  days: WeekdayOption[];
  byDay: Record<WeekdayId, ScheduleShow[]>;
};
