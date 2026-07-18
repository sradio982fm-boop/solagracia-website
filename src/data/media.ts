import type { MediaPlayerContent } from "@/types/site";

/**
 * Sticky player streams — swap for real Solagracia / S Radio endpoints later.
 * Demo sources are public sample media for UI development.
 */
export const mediaPlayerContent: MediaPlayerContent = {
  stationName: "Solagracia",
  showTitle: "Golden State of Mind",
  frequency: "98.2 FM",
  audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  videoSrc:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  videoPoster: "/cover-image.png",
};
