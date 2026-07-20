import type { MediaPlayerContent } from "@/types/site";

/**
 * Sticky player fallback — working sradio streams (also seeded in DB).
 */
export const mediaPlayerContent: MediaPlayerContent = {
  stationName: "Solagracia",
  showTitle: "Golden State of Mind",
  frequency: "98.2 FM",
  audioSrc: "https://c4.siar.us:8129/stream",
  videoSrc: "https://sradio.siar.us/live/sradio.m3u8",
  videoPoster: "/cover-image.png",
};
