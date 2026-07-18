import type {
  OnAirContent,
  ProgramContent,
  ScheduleShow,
  WeekdayId,
} from "@/types/schedule";

const COVER = "/cover-image.png";

/** Shared daily slate — CMS can diverge per day later */
const weekdayShows: ScheduleShow[] = [
  {
    id: "morning-brew",
    title: "Morning Brew",
    host: "Raka Wijaya",
    tag: "Talk & Music",
    description: "Kopi, headline, dan lagu yang membangunkan kota.",
    startTime: "05:00",
    endTime: "09:00",
    imageSrc: COVER,
    imageAlt: "Morning Brew — Solagracia",
    href: "#program",
  },
  {
    id: "midday-stories",
    title: "Midday Stories",
    host: "Alya Putri",
    tag: "Stories",
    description: "Cerita singkat di sela istirahat siang.",
    startTime: "09:00",
    endTime: "12:00",
    imageSrc: COVER,
    imageAlt: "Midday Stories — Solagracia",
    href: "#program",
  },
  {
    id: "golden-hour",
    title: "Golden Hour",
    host: "Dimas Hartono",
    tag: "Music Mix",
    description: "Seleksi hangat untuk peralihan siang ke sore.",
    startTime: "12:00",
    endTime: "16:00",
    imageSrc: COVER,
    imageAlt: "Golden Hour — Solagracia",
    href: "#program",
  },
  {
    id: "loft-drive",
    title: "Loft Drive",
    host: "Salsa Nabila",
    tag: "Drive Time",
    description: "Teman perjalanan pulang dengan mood loft.",
    startTime: "16:00",
    endTime: "20:00",
    imageSrc: COVER,
    imageAlt: "Loft Drive — Solagracia",
    href: "#program",
  },
  {
    id: "night-signal",
    title: "Night Signal",
    host: "Beni Prakoso",
    tag: "Night Show",
    description: "Frekuensi malam untuk yang masih terjaga.",
    startTime: "20:00",
    endTime: "24:00",
    imageSrc: COVER,
    imageAlt: "Night Signal — Solagracia",
    href: "#program",
  },
  {
    id: "after-hours",
    title: "After Hours",
    host: "Solagracia Desk",
    tag: "Automix",
    description: "Arus tenang sampai fajar.",
    startTime: "00:00",
    endTime: "05:00",
    imageSrc: COVER,
    imageAlt: "After Hours — Solagracia",
    href: "#program",
  },
];

const weekendShows: ScheduleShow[] = [
  {
    id: "weekend-rise",
    title: "Weekend Rise",
    host: "Raka Wijaya",
    tag: "Weekend",
    description: "Pagi akhir pekan yang lebih pelan.",
    startTime: "06:00",
    endTime: "10:00",
    imageSrc: COVER,
    imageAlt: "Weekend Rise — Solagracia",
    href: "#program",
  },
  {
    id: "the-weekend-show",
    title: "The Weekend Show",
    host: "Alya Putri",
    tag: "Weekend Show",
    description: "Obrolan santai dan request spesial.",
    startTime: "10:00",
    endTime: "14:00",
    imageSrc: COVER,
    imageAlt: "The Weekend Show — Solagracia",
    href: "#program",
  },
  {
    id: "vinyl-afternoon",
    title: "Vinyl Afternoon",
    host: "Dimas Hartono",
    tag: "Music Mix",
    description: "Piringan hitam dan kurasi deep cut.",
    startTime: "14:00",
    endTime: "18:00",
    imageSrc: COVER,
    imageAlt: "Vinyl Afternoon — Solagracia",
    href: "#program",
  },
  {
    id: "loft-night",
    title: "Loft Night",
    host: "Salsa Nabila",
    tag: "Night Show",
    description: "Sesi malam dengan atmosfer studio.",
    startTime: "18:00",
    endTime: "22:00",
    imageSrc: COVER,
    imageAlt: "Loft Night — Solagracia",
    href: "#program",
  },
  {
    id: "signal-late",
    title: "Signal Late",
    host: "Beni Prakoso",
    tag: "Late Night",
    description: "Frekuensi pelan sampai tengah malam.",
    startTime: "22:00",
    endTime: "02:00",
    imageSrc: COVER,
    imageAlt: "Signal Late — Solagracia",
    href: "#program",
  },
  {
    id: "dawn-drift",
    title: "Dawn Drift",
    host: "Solagracia Desk",
    tag: "Automix",
    description: "Arus senyap menjelang pagi.",
    startTime: "02:00",
    endTime: "06:00",
    imageSrc: COVER,
    imageAlt: "Dawn Drift — Solagracia",
    href: "#program",
  },
];

function slateFor(day: WeekdayId): ScheduleShow[] {
  return day === "sabtu" || day === "minggu" ? weekendShows : weekdayShows;
}

/**
 * Hero on-air slate — today's shows until CMS wires per-day live feed.
 */
export const scheduleContent: OnAirContent = {
  label: "Lagi On Air",
  upcomingLabel: "Selanjutnya",
  fallbackTitle: "Solagracia Mix",
  shows: weekdayShows,
};

/**
 * Full weekly lineup for #program — replace with CMS later.
 */
export const programContent: ProgramContent = {
  eyebrow: "Lineup Mingguan",
  title: "Jadwal Siaran",
  description:
    "Penyiar Solagracia menemanimu dari pagi sampai tengah malam, tujuh hari seminggu. Pilih hari untuk lihat siapa yang siaran.",
  days: [
    { id: "minggu", label: "Minggu" },
    { id: "senin", label: "Senin" },
    { id: "selasa", label: "Selasa" },
    { id: "rabu", label: "Rabu" },
    { id: "kamis", label: "Kamis" },
    { id: "jumat", label: "Jumat" },
    { id: "sabtu", label: "Sabtu" },
  ],
  byDay: {
    minggu: slateFor("minggu"),
    senin: slateFor("senin"),
    selasa: slateFor("selasa"),
    rabu: slateFor("rabu"),
    kamis: slateFor("kamis"),
    jumat: slateFor("jumat"),
    sabtu: slateFor("sabtu"),
  },
};
