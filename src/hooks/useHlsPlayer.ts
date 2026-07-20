"use client";

import { useEffect, useRef, useCallback } from "react";
import Hls from "hls.js";

interface UseHlsPlayerOptions {
  url: string;
  autoPlay?: boolean;
  muted?: boolean;
  mediaSessionTitle?: string;
  /** Keep audio playing in background on mobile (default: false) */
  backgroundPlayback?: boolean;
}

const RESUME_RETRY_DELAYS_MS = [100, 400, 1000];
const DIRECT_RECONNECT_DELAY_MS = 2000;

interface AudioContextWithFallback extends Window {
  webkitAudioContext?: typeof AudioContext;
}

/**
 * HLS sources are m3u8 playlists. Anything else (Shoutcast/Icecast ICY streams,
 * progressive MP3/AAC) is treated as a direct source the <audio> element can
 * play natively via a plain `src` assignment.
 */
function isHlsSource(url: string): boolean {
  return /\.m3u8(\?|$)/i.test(url);
}

/**
 * Appends a cache-busting param so a reconnect opens a fresh ICY connection
 * instead of resuming a stale/closed one.
 */
function withCacheBuster(url: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_=${Date.now()}`;
}

export function useHlsPlayer(
  mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement | null>,
  options: UseHlsPlayerOptions
) {
  const hlsRef = useRef<Hls | null>(null);
  const isPlayingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const directCleanupRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    if (directCleanupRef.current) {
      directCleanupRef.current();
      directCleanupRef.current = null;
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const el = mediaRef.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
  }, [mediaRef]);

  /**
   * Routes the audio element through Web Audio API. This creates an active
   * audio session which Android Chrome treats with higher priority, often
   * preventing MSE background-throttling on subsequent background cycles.
   *
   * Must be called from a user gesture. Safe to call multiple times — the
   * source node is only created once per element (it's not allowed to recreate).
   */
  const ensureAudioGraph = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;

    try {
      if (!audioContextRef.current) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as AudioContextWithFallback).webkitAudioContext;
        if (!Ctx) return;
        audioContextRef.current = new Ctx();
      }

      const ctx = audioContextRef.current;

      if (!mediaSourceNodeRef.current) {
        // createMediaElementSource can only be called ONCE per element
        mediaSourceNodeRef.current = ctx.createMediaElementSource(el);
        mediaSourceNodeRef.current.connect(ctx.destination);
      }

      if (ctx.state === "suspended") {
        // Must be triggered from a user gesture; safe to call here since
        // start() is only invoked on user interaction.
        ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext unsupported or already attached — ignore
    }
  }, [mediaRef]);

  /**
   * Plays a direct (non-HLS) stream and auto-reconnects if the connection
   * drops — e.g. the Shoutcast encoder restarts or the source goes briefly
   * offline. Reconnect attempts continue until the user stops playback.
   */
  const startDirectStream = useCallback(
    (el: HTMLVideoElement | HTMLAudioElement) => {
      let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
          reconnectTimer = null;
        }
        el.removeEventListener("error", handleDrop);
        el.removeEventListener("ended", handleDrop);
      };

      const connect = (cacheBust: boolean) => {
        el.src = cacheBust ? withCacheBuster(options.url) : options.url;
        el.muted = options.muted ?? false;
        el.load();
        el.play().catch(() => {});
      };

      function handleDrop() {
        if (!isPlayingRef.current) return;
        if (reconnectTimer) return;
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          if (!isPlayingRef.current) return;
          connect(true);
        }, DIRECT_RECONNECT_DELAY_MS);
      }

      el.addEventListener("error", handleDrop);
      el.addEventListener("ended", handleDrop);
      directCleanupRef.current = cleanup;

      connect(false);
    },
    [options.url, options.muted]
  );

  const start = useCallback(() => {
    const el = mediaRef.current;
    if (!el) return;

    isPlayingRef.current = true;

    const directStream = !isHlsSource(options.url);

    // Set up Web Audio graph BEFORE attaching source so the audio session is
    // established before MSE buffering begins.
    //
    // Skip for direct streams: routing a cross-origin source (Shoutcast/Icecast
    // without CORS) through createMediaElementSource taints the node and outputs
    // silence. Progressive streams also don't suffer the MSE background
    // throttling this graph works around, so it isn't needed there.
    if (options.backgroundPlayback && !directStream) {
      ensureAudioGraph();
    }

    if (directStream) {
      // Direct stream (Shoutcast/Icecast ICY or progressive MP3/AAC). The
      // <audio> element plays these natively — no MSE/hls.js needed.
      startDirectStream(el);
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        // Live stream tuning — keep latency low and recover quickly
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 10,
      });
      hls.loadSource(options.url);
      hls.attachMedia(el);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        el.muted = options.muted ?? false;
        el.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        // Try to recover instead of immediately stopping
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          stop();
        }
      });
      hlsRef.current = hls;
    } else if (el.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari/iOS) — use direct src assignment
      el.src = options.url;
      el.addEventListener(
        "loadedmetadata",
        () => {
          el.muted = options.muted ?? false;
          el.play().catch(() => {});
        },
        { once: true }
      );
    }

    // Set up Media Session API for background playback on mobile
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: options.mediaSessionTitle || "S Radio 98.2 FM",
        artist: "Live Stream",
        album: "S Radio",
      });
      navigator.mediaSession.setActionHandler("play", () => {
        el.play().catch(() => {});
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        el.pause();
      });
    }
  }, [
    mediaRef,
    options.url,
    options.muted,
    options.mediaSessionTitle,
    options.backgroundPlayback,
    stop,
    ensureAudioGraph,
    startDirectStream,
  ]);

  // Background playback recovery for Android Chrome (MSE throttling)
  useEffect(() => {
    if (!options.backgroundPlayback) return;

    const pendingTimers = new Set<ReturnType<typeof setTimeout>>();

    const clearPendingTimers = () => {
      pendingTimers.forEach((t) => clearTimeout(t));
      pendingTimers.clear();
    };

    const tryResume = () => {
      const el = mediaRef.current;
      if (!el || !isPlayingRef.current) return;

      // Resume AudioContext if suspended (happens on background)
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      if (el.paused) {
        el.play().catch(() => {});
      }
    };

    const tryHardRecover = () => {
      // If simple play() failed, rebuild the HLS pipeline from a fresh
      // live edge. This is the heavy hammer that always works since it
      // creates a new MSE buffer that Chrome hasn't throttled yet.
      const el = mediaRef.current;
      if (!el || !isPlayingRef.current) return;
      if (!el.paused) return;

      const hls = hlsRef.current;
      if (hls) {
        try {
          hls.stopLoad();
          hls.startLoad(-1);
          el.play().catch(() => {});
        } catch {
          // Fall through to full rebuild
        }
      }
    };

    const handleVisibilityChange = () => {
      const el = mediaRef.current;
      if (!el || !isPlayingRef.current) return;

      if (!document.hidden) {
        // Returned to foreground — cancel pending timers, try clean resume,
        // and schedule retries with increasing delays in case the first
        // play() doesn't take effect.
        clearPendingTimers();

        tryResume();

        RESUME_RETRY_DELAYS_MS.forEach((delay, idx) => {
          const timer = setTimeout(() => {
            pendingTimers.delete(timer);
            const elNow = mediaRef.current;
            if (!elNow || !isPlayingRef.current) return;
            if (!elNow.paused) return;

            if (idx < RESUME_RETRY_DELAYS_MS.length - 1) {
              tryResume();
            } else {
              // Last retry — escalate to hard recover (rebuild HLS pipeline)
              tryHardRecover();
            }
          }, delay);
          pendingTimers.add(timer);
        });
      }
    };

    const handlePause = () => {
      const el = mediaRef.current;
      if (!el || !isPlayingRef.current) return;
      if (!document.hidden) return;

      // Browser-initiated pause in background — try once to resume.
      // We don't aggressively retry to avoid the play-pause loop;
      // the visibility-change handler will recover on foreground return.
      const timer = setTimeout(() => {
        pendingTimers.delete(timer);
        if (isPlayingRef.current && el.paused && document.hidden) {
          tryResume();
        }
      }, 150);
      pendingTimers.add(timer);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    const el = mediaRef.current;
    el?.addEventListener("pause", handlePause);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      el?.removeEventListener("pause", handlePause);
      clearPendingTimers();
    };
  }, [options.backgroundPlayback, mediaRef]);

  useEffect(() => {
    return () => {
      if (directCleanupRef.current) {
        directCleanupRef.current();
        directCleanupRef.current = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
        mediaSourceNodeRef.current = null;
      }
    };
  }, []);

  return { start, stop };
}
