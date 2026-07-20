"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useHlsPlayer } from "@/hooks/useHlsPlayer";
import { cn } from "@/lib/utils";
import type { MediaPlayerContent } from "@/types/site";

type StickyMediaPlayerProps = {
  content: MediaPlayerContent;
};

type PlayerMode = "audio" | "video-mini" | "video-max";

const easeOut = [0.16, 1, 0.3, 1] as const;
const DEFAULT_VOLUME = 0.8;

/**
 * Sticky radio bar — audio by default; arrow expands a docked video popup
 * (mini ↔ maximized). Expanding video pauses audio; closing returns to audio.
 * HLS (.m3u8) video uses hls.js; Icecast audio uses native <audio>.
 */
export function StickyMediaPlayer({ content }: StickyMediaPlayerProps) {
  const {
    stationName,
    showTitle,
    frequency,
    audioSrc,
    videoSrc,
    videoPoster,
  } = content;

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [mode, setMode] = useState<PlayerMode>("audio");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);

  const videoOpen = mode !== "audio";
  const videoMaximized = mode === "video-max";

  const { start: startVideo, stop: stopVideo } = useHlsPlayer(videoRef, {
    url: videoSrc,
    muted,
    mediaSessionTitle: `${stationName} · Live`,
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setAudioPlaying(true);
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

    const onPlay = () => setVideoPlaying(true);
    const onPause = () => setVideoPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    startVideo();

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      stopVideo();
    };
  }, [videoOpen, startVideo, stopVideo]);

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
      <audio ref={audioRef} src={audioSrc} preload="none" />

      <div className="pointer-events-none fixed right-3 bottom-[calc(var(--frame-inset-bottom)+8px)] left-3 z-[45] flex justify-center md:right-[calc(var(--frame-inset)+8.5rem)] md:left-[calc(var(--frame-inset)+var(--rail)+12px)]">
        <div className="pointer-events-auto relative w-full max-w-3xl">
          {/*
            Single video instance — docks on the bar (mini) or expands (max).
            Keeping one <video> avoids remount glitches on minimize/maximize.
          */}
          <AnimatePresence>
            {videoOpen ? (
              <motion.div
                key="video-shell"
                className={cn(
                  videoMaximized
                    ? "fixed inset-[var(--frame-inset)] z-[46] flex items-center justify-center p-4 md:p-8"
                    : "absolute right-0 bottom-full z-10 max-h-[min(40dvh,16rem)] w-[min(20rem,100%)] origin-bottom-right overflow-hidden",
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
                      : "aspect-video w-full border-b-0 shadow-[0_-12px_40px_rgba(0,0,0,0.45)]",
                  )}
                >
                  <video
                    ref={videoRef}
                    poster={videoPoster}
                    className="h-full w-full object-cover"
                    playsInline
                    controls={false}
                  />

                  <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 bg-gradient-to-b from-black/75 to-transparent px-2.5 py-2">
                    <p className="min-w-0 truncate text-[10px] font-semibold tracking-[0.14em] text-white/80 uppercase">
                      Live video · {stationName}
                    </p>
                    <button
                      type="button"
                      onClick={closeVideo}
                      className="flex h-7 shrink-0 items-center gap-1.5 border border-white/25 bg-black/50 px-2 text-white transition-colors hover:bg-white/15"
                      aria-label="Tutup video"
                    >
                      <CloseIcon />
                      <span className="text-[9px] font-semibold tracking-[0.12em] uppercase">
                        Tutup
                      </span>
                    </button>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/85 to-transparent px-2.5 py-2.5">
                    <button
                      type="button"
                      onClick={() => void toggleVideoPlayback()}
                      className="flex h-8 shrink-0 items-center gap-1.5 border border-white/25 bg-black/50 px-2 text-white transition-colors hover:bg-white/15"
                      aria-label={videoPlaying ? "Jeda video" : "Putar video"}
                    >
                      {videoPlaying ? <PauseIcon /> : <PlayIcon />}
                      <span className="text-[9px] font-semibold tracking-[0.12em] uppercase">
                        {videoPlaying ? "Jeda" : "Putar"}
                      </span>
                    </button>
                    <p className="min-w-0 flex-1 truncate text-[11px] text-white/70">
                      {showTitle}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setMode(videoMaximized ? "video-mini" : "video-max")
                      }
                      className="flex h-8 shrink-0 items-center gap-1.5 border border-white/25 bg-black/50 px-2 text-white transition-colors hover:bg-white/15"
                      aria-label={
                        videoMaximized
                          ? "Kecilkan ke mini player"
                          : "Perbesar video"
                      }
                    >
                      {videoMaximized ? <MinimizeIcon /> : <MaximizeIcon />}
                      <span className="text-[9px] font-semibold tracking-[0.12em] uppercase">
                        {videoMaximized ? "Kecilkan" : "Perbesar"}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="relative z-10 flex h-[var(--player-height)] items-stretch border border-[var(--frame-line)] bg-black/85 backdrop-blur-md">
            <button
              type="button"
              onClick={() => void toggleAudio()}
              disabled={videoOpen}
              className={cn(
                "flex h-full w-12 shrink-0 items-center justify-center border-r border-[var(--frame-line)] transition-colors",
                videoOpen
                  ? "cursor-not-allowed text-white/30"
                  : "text-white hover:bg-white/10",
              )}
              aria-label={audioPlaying ? "Jeda siaran" : "Putar siaran"}
            >
              {audioPlaying && !videoOpen ? <PauseIcon /> : <PlayIcon />}
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 md:gap-3 md:px-4">
              <span
                className={cn(
                  "shrink-0 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.18em] uppercase",
                  audioPlaying && !videoOpen
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--frame-line)] text-white/55",
                )}
              >
                On Air
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold tracking-tight md:text-[13px]">
                  {stationName}
                  <span className="text-white/40"> · </span>
                  {frequency}
                </p>
                <p className="truncate text-[11px] text-white/55">
                  {videoOpen
                    ? "Mode video — audio dijeda"
                    : audioError
                      ? "Stream tidak tersedia"
                      : showTitle}
                </p>
              </div>

              {audioPlaying && !videoOpen ? <Equalizer /> : null}

              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="flex h-8 w-8 items-center justify-center text-white/70 transition-colors hover:text-white"
                  aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
                >
                  {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
                </button>
                <label className="flex w-20 items-center md:w-24">
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
                    className="player-volume h-1 w-full cursor-pointer appearance-none bg-white/20 accent-[var(--accent)]"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={toggleMute}
                className="flex h-8 w-8 items-center justify-center text-white/70 transition-colors hover:text-white sm:hidden"
                aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
              >
                {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
              </button>
            </div>

            <button
              type="button"
              onClick={toggleVideoShelf}
              className="flex h-full shrink-0 flex-col items-center justify-center gap-0.5 border-l border-[var(--frame-line)] px-2.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white md:min-w-[4.75rem] md:flex-row md:gap-1.5 md:px-3"
              aria-label={
                videoOpen ? "Tutup video, kembali ke audio" : "Buka video studio"
              }
              aria-pressed={videoOpen}
            >
              <ChevronIcon direction={videoOpen ? "down" : "up"} />
              <span className="text-[9px] font-semibold tracking-[0.12em] uppercase">
                {videoOpen ? "Tutup" : "Video"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Equalizer() {
  return (
    <span className="hidden items-end gap-[2px] lg:flex" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[2px] origin-bottom bg-[var(--accent)]"
          style={{
            height: 10 + (i % 3) * 4,
            animation: `player-eq 0.8s ${i * 0.12}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </span>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5L8 5.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 5h3.5v14H7V5Zm6.5 0H17v14h-3.5V5Z" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      width="14"
      height="14"
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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 4H4v5M15 4h5v5M4 15v5h5M20 15v5h-5"
        stroke="currentColor"
        strokeWidth="1.7"
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
