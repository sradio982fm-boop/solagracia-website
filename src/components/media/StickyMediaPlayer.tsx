"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { trackAnalyticsEvent } from "@/components/AnalyticsTracker";
import { useHlsPlayer } from "@/hooks/useHlsPlayer";
import { parseFocalUrl } from "@/lib/focal-point";
import { sanitizeAssetSrc, sanitizeHttpHref } from "@/lib/security";
import { cn } from "@/lib/utils";
import type { FrequencyOption, MediaPlayerContent } from "@/types/site";

type StickyMediaPlayerProps = {
  content: MediaPlayerContent;
  /** When 2+ options, shows a frequency switcher on the bar. */
  frequencies?: FrequencyOption[];
};

type PlayerMode = "audio" | "video-mini" | "video-max";

const easeOut = [0.16, 1, 0.3, 1] as const;
const DEFAULT_VOLUME = 0.8;
const PLAYER_BRAND_TITLE = "SOLAGRACIA DIGITAL RADIO";

/**
 * Sticky radio bar — audio by default; arrow expands a docked video popup
 * (mini ↔ maximized). Expanding video pauses audio; closing returns to audio.
 * HLS (.m3u8) video uses hls.js; Icecast audio uses native <audio>.
 * Multiple active frequencies can be switched from the bar.
 */
export function StickyMediaPlayer({
  content,
  frequencies = [],
}: StickyMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [selectedId, setSelectedId] = useState(() => {
    const match = frequencies.find(
      (f) => f.label === content.frequency || f.isDefault,
    );
    return match?.id || frequencies[0]?.id || "default";
  });

  const selected =
    frequencies.find((f) => f.id === selectedId) ||
    frequencies.find((f) => f.isDefault) ||
    frequencies[0];

  const stationName = selected?.stationName || content.stationName;
  const showTitle = content.showTitle;
  const audioSrc = sanitizeHttpHref(
    selected?.audioSrc || content.audioSrc,
    "",
  );
  const showVideo = selected?.showVideo ?? true;
  const videoSrc = showVideo
    ? sanitizeHttpHref(selected?.videoSrc || content.videoSrc, "")
    : "";
  const videoPoster = sanitizeAssetSrc(
    parseFocalUrl(selected?.videoPoster || content.videoPoster).cleanUrl,
  );
  const videoAvailable = showVideo && Boolean(videoSrc);
  const canSwitch = frequencies.length > 1;

  const [mode, setMode] = useState<PlayerMode>("audio");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  const videoOpen = videoAvailable && mode !== "audio";
  const videoMaximized = videoOpen && mode === "video-max";

  const { start: startVideo, stop: stopVideo } = useHlsPlayer(videoRef, {
    url: videoSrc,
    muted,
    mediaSessionTitle: `${stationName} · Live`,
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => {
      setAudioPlaying(true);
      trackAnalyticsEvent("ap", "audio");
    };
    const onPause = () => setAudioPlaying(false);
    const onError = () => setAudioError(true);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = muted;
    }
    if (video) {
      video.volume = volume;
      video.muted = muted;
    }
  }, [volume, muted, videoOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoOpen) return;

    const onPlay = () => {
      setVideoPlaying(true);
      trackAnalyticsEvent("sp", "video");
    };
    const onPause = () => setVideoPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    startVideo();

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      stopVideo();
    };
  }, [videoOpen, startVideo, stopVideo, videoSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.load();
    setAudioPlaying(false);
    setAudioError(false);
  }, [audioSrc]);

  const switchFrequency = (id: string) => {
    if (id === selectedId) return;
    const audio = audioRef.current;
    if (audio && !audio.paused) audio.pause();
    stopVideo();
    setVideoPlaying(false);
    setMode("audio");
    setSelectedId(id);
    trackAnalyticsEvent("cf", id);
  };

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio || videoOpen) return;

    if (audio.paused) {
      try {
        await audio.play();
        setAudioError(false);
      } catch {
        setAudioError(true);
      }
      return;
    }

    audio.pause();
  };

  const openVideo = () => {
    const audio = audioRef.current;
    if (audio && !audio.paused) audio.pause();
    setMode("video-mini");
  };

  const closeVideo = () => {
    stopVideo();
    setVideoPlaying(false);
    setMode("audio");
  };

  const toggleVideoShelf = () => {
    if (!videoAvailable) return;
    if (mode === "audio") {
      openVideo();
      return;
    }
    closeVideo();
  };

  const toggleVideoPlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        /* ignore */
      }
      return;
    }

    video.pause();
  };

  const toggleMute = () => {
    setMuted((prev) => {
      if (prev && volume === 0) setVolume(DEFAULT_VOLUME);
      return !prev;
    });
  };

  const onVolumeChange = (value: number) => {
    setVolume(value);
    setMuted(value === 0);
  };

  return (
    <>
      <audio ref={audioRef} src={audioSrc || undefined} preload="none" />

      <div className="pointer-events-none fixed right-3 bottom-[calc(var(--frame-inset-bottom)+8px)] left-3 z-[45] flex justify-center md:right-[calc(var(--frame-inset)+8.5rem)] md:left-[calc(var(--frame-inset)+var(--rail)+12px)]">
        <div className="pointer-events-auto relative w-full max-w-4xl">
          {/*
            Single video instance — docks on the bar (mini) or expands (max).
            Keeping one <video> avoids remount glitches on minimize/maximize.
          */}
          <AnimatePresence>
            {videoOpen && videoAvailable ? (
              <motion.div
                key="video-shell"
                className={cn(
                  videoMaximized
                    ? "fixed inset-[var(--frame-inset)] z-[46] flex items-center justify-center p-4 md:p-8"
                    : "absolute right-0 bottom-full z-10 mb-3 w-[min(30rem,100%)] origin-bottom-right overflow-hidden md:w-[min(42rem,100%)]",
                )}
                initial={{ opacity: 0, y: videoMaximized ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: videoMaximized ? 0 : 8 }}
                transition={{ duration: 0.3, ease: easeOut }}
              >
                {videoMaximized ? (
                  <button
                    type="button"
                    className="absolute inset-0 bg-black/80"
                    aria-label="Kecilkan video"
                    onClick={() => setMode("video-mini")}
                  />
                ) : null}

                <div
                  className={cn(
                    "relative overflow-hidden border border-[var(--frame-line)] bg-black",
                    videoMaximized
                      ? "aspect-video w-full max-w-5xl shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
                      : "aspect-video w-full shadow-[0_12px_40px_rgba(0,0,0,0.5)]",
                  )}
                >
                  <video
                    ref={videoRef}
                    poster={videoPoster || undefined}
                    className="h-full w-full object-cover"
                    playsInline
                    controls={false}
                  />

                  <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 bg-gradient-to-b from-black/80 via-black/35 to-transparent px-3 py-2.5">
                    <p className="min-w-0 truncate text-[10px] font-semibold tracking-[0.14em] text-white/75 uppercase">
                      Live video · {stationName}
                    </p>
                    <button
                      type="button"
                      onClick={closeVideo}
                      className={cn(
                        "flex shrink-0 items-center justify-center border border-white/25 bg-black/55 text-white transition-colors hover:bg-white/15",
                        videoMaximized
                          ? "h-8 gap-1.5 px-2.5"
                          : "h-8 w-8",
                      )}
                      aria-label="Tutup video"
                    >
                      <CloseIcon />
                      {videoMaximized ? (
                        <span className="text-[9px] font-semibold tracking-[0.12em] uppercase">
                          Tutup
                        </span>
                      ) : null}
                    </button>
                  </div>

                  {videoMaximized ? (
                    <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-3 py-3">
                      <button
                        type="button"
                        onClick={() => void toggleVideoPlayback()}
                        className="flex h-9 shrink-0 items-center gap-1.5 border border-white/25 bg-black/55 px-2.5 text-white transition-colors hover:bg-white/15"
                        aria-label={
                          videoPlaying ? "Jeda video" : "Putar video"
                        }
                      >
                        {videoPlaying ? <PauseIcon /> : <PlayIcon />}
                        <span className="text-[9px] font-semibold tracking-[0.12em] uppercase">
                          {videoPlaying ? "Jeda" : "Putar"}
                        </span>
                      </button>
                      <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-white/80">
                        {showTitle}
                      </p>
                      <button
                        type="button"
                        onClick={() => setMode("video-mini")}
                        className="flex h-9 shrink-0 items-center gap-1.5 border border-white/25 bg-black/55 px-2.5 text-white transition-colors hover:bg-white/15"
                        aria-label="Kecilkan ke mini player"
                      >
                        <MinimizeIcon />
                        <span className="text-[9px] font-semibold tracking-[0.12em] uppercase">
                          Kecilkan
                        </span>
                      </button>
                    </div>
                  ) : (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/55 to-transparent px-4 pt-12 pb-4">
                      <p className="mb-3 truncate text-[15px] leading-tight font-semibold tracking-tight text-white md:text-[16px]">
                        {showTitle}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => void toggleVideoPlayback()}
                          className="flex h-10 items-center gap-2 border border-white/25 bg-black/55 px-3 text-white transition-colors hover:bg-white/15"
                          aria-label={
                            videoPlaying ? "Jeda video" : "Putar video"
                          }
                        >
                          {videoPlaying ? <PauseIcon /> : <PlayIcon />}
                          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
                            {videoPlaying ? "Jeda" : "Putar"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMode("video-max")}
                          className="flex h-12 items-center gap-2.5 border border-white/35 bg-white/15 px-4 text-white transition-colors hover:bg-white/25"
                          aria-label="Perbesar video"
                        >
                          <MaximizeIcon />
                          <span className="text-[12px] font-bold tracking-[0.14em] uppercase">
                            Perbesar
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="relative z-10 flex h-[var(--player-height)] items-stretch border-2 border-[var(--frame-line)] bg-black/92 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
            <button
              type="button"
              onClick={() => void toggleAudio()}
              disabled={videoOpen}
              className={cn(
                "flex h-full w-14 shrink-0 items-center justify-center border-r-2 border-[var(--frame-line)] transition-colors md:w-16",
                videoOpen
                  ? "cursor-not-allowed text-white/30"
                  : "text-white hover:bg-white/10",
              )}
              aria-label={audioPlaying ? "Jeda siaran" : "Putar siaran"}
            >
              {audioPlaying && !videoOpen ? <PauseIcon /> : <PlayIcon />}
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-3 px-3.5 md:gap-4 md:px-5">
              <span
                className={cn(
                  "shrink-0 px-2 py-1 text-[10px] font-bold tracking-[0.18em] uppercase md:text-[11px]",
                  audioPlaying && !videoOpen
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--frame-line)] text-white/70",
                )}
              >
                On Air
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-extrabold tracking-[0.08em] text-white uppercase md:text-[15px]">
                  {PLAYER_BRAND_TITLE}
                </p>
                <p className="truncate text-[12px] text-white/65 md:text-[13px]">
                  {videoOpen
                    ? "Mode video — audio dijeda"
                    : audioError
                      ? "Stream tidak tersedia"
                      : showTitle}
                </p>
                {canSwitch ? (
                  <div
                    className="mt-1 flex max-w-full gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    role="group"
                    aria-label="Pilih frekuensi"
                  >
                    {frequencies.map((freq) => {
                      const active = freq.id === selectedId;
                      return (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() => switchFrequency(freq.id)}
                          className={cn(
                            "shrink-0 border px-1.5 py-0.5 text-[8px] font-bold tracking-[0.12em] uppercase transition-colors",
                            active
                              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                              : "border-white/25 text-white/55 hover:border-white/50 hover:text-white",
                          )}
                          aria-pressed={active}
                        >
                          {freq.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              {audioPlaying && !videoOpen ? <Equalizer /> : null}

              <div className="hidden items-center gap-2.5 sm:flex">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex h-10 w-10 items-center justify-center text-white/80 transition-colors hover:text-white"
                  aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
                >
                  {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
                </button>
                <label className="flex w-24 items-center md:w-28">
                  <span className="sr-only">Volume</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={muted ? 0 : volume}
                    onChange={(event) =>
                      onVolumeChange(Number(event.target.value))
                    }
                    className="player-volume h-1.5 w-full cursor-pointer appearance-none bg-white/25 accent-[var(--accent)]"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={toggleMute}
                className="flex h-10 w-10 items-center justify-center text-white/80 transition-colors hover:text-white sm:hidden"
                aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
              >
                {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
              </button>
            </div>

            {videoAvailable ? (
              <button
                type="button"
                onClick={toggleVideoShelf}
                className="flex h-full shrink-0 flex-col items-center justify-center gap-1 border-l-2 border-[var(--frame-line)] px-3.5 text-white transition-colors hover:bg-white/10 md:min-w-[5.5rem] md:flex-row md:gap-2 md:px-4"
                aria-label={
                  videoOpen
                    ? "Tutup video, kembali ke audio"
                    : "Buka video studio"
                }
                aria-pressed={videoOpen}
              >
                <ChevronIcon direction={videoOpen ? "down" : "up"} />
                <span className="text-[10px] font-bold tracking-[0.14em] uppercase md:text-[11px]">
                  {videoOpen ? "Tutup" : "Video"}
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

function Equalizer() {
  return (
    <span className="hidden items-end gap-[3px] lg:flex" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[3px] origin-bottom bg-[var(--accent)]"
          style={{
            height: 14 + (i % 3) * 5,
            animation: `player-eq 0.8s ${i * 0.12}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </span>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5L8 5.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 5h3.5v14H7V5Zm6.5 0H17v14h-3.5V5Z" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={direction === "down" ? "rotate-180" : undefined}
    >
      <path
        d="M6 14l6-6 6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
      />
    </svg>
  );
}

function MaximizeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
      />
    </svg>
  );
}

/** Inward corners — collapse maximized video back to mini */
function MinimizeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 9V4H4M15 9V4h5M9 15v5H4M15 15v5h5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="square"
      />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10v4h3.5L12 18V6L7.5 10H4Z" fill="currentColor" />
      <path
        d="M15.5 9.5a3.5 3.5 0 0 1 0 5M17.8 7a6.5 6.5 0 0 1 0 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10v4h3.5L12 18V6L7.5 10H4Z" fill="currentColor" />
      <path
        d="M16 9l5 6M21 9l-5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="square"
      />
    </svg>
  );
}
