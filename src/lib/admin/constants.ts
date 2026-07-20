/** Day labels for schedule (0 = Minggu, 6 = Sabtu) — matches `Date.getDay()` / `day_of_week` */
export const DAY_LABELS = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

export const FIELD_LIMITS = {
  TITLE_MAX: 200,
  DESCRIPTION_MAX: 500,
  BIO_MAX: 1000,
  TAG_MAX_COUNT: 5,
  TAG_ITEM_MAX: 30,
  NAME_MAX: 100,
  ROLE_MAX: 100,
  TAGLINE_MAX: 200,
  DISPLAY_NUMBER_MAX: 20,
  SHOW_TAG_MAX: 50,
} as const;

export const SCHEDULE_HOURS = {
  MIN_START: 0,
  MAX_START: 23.75,
  MIN_END: 0.25,
  MAX_END: 24,
  STEP: 0.25,
} as const;
