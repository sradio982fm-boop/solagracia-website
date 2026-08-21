"use client";

import { useEffect } from "react";

const KEEP_ALIVE_INTERVAL_MS = 20_000;

/**
 * Registers the service worker and keeps it alive while the page is open.
 * The SW unlocks PWA installability, which lets users add the site to their
 * home screen. When opened from the home screen (standalone mode), Android
 * Chrome treats audio playback like a native app — bypassing MSE background
 * throttling.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Periodically ping the SW so it doesn't get killed mid-stream.
        // (Service workers can be terminated after ~30s of idle.)
        keepAliveTimer = setInterval(() => {
          registration.active?.postMessage({ type: "KEEP_ALIVE" });
        }, KEEP_ALIVE_INTERVAL_MS);
      } catch {
        // Registration failed — non-fatal, app still works without PWA features
      }
    };

    register();

    return () => {
      if (keepAliveTimer) clearInterval(keepAliveTimer);
    };
  }, []);

  return null;
}
