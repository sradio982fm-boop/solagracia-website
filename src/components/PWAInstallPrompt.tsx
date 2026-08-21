"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const MINIMIZED_STORAGE_KEY = "solagracia_pwa_install_minimized";
const INSTALLED_STORAGE_KEY = "solagracia_pwa_installed_once";

/**
 * Detects mobile/tablet devices using `pointer: coarse` media query.
 * This reliably identifies touch-primary devices (phones, tablets) and
 * excludes desktops with mouse input.
 */
function isMobileOrTablet(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Shows a small "Install app" prompt when the browser allows PWA installation.
 * Installing the app enables reliable background audio playback on Android.
 *
 * Only displays on mobile/tablet devices. When user clicks "Nanti saja", the
 * prompt minimises into a floating button which can re-open the full prompt.
 */
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(MINIMIZED_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip on desktop — install prompt is only useful for mobile audio playback
    if (!isMobileOrTablet()) return;

    // Already installed (running in standalone mode) — no prompt needed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // If we previously tracked an install but now `beforeinstallprompt`
      // fires again, the user uninstalled the PWA. Reset the minimized
      // state so the full prompt is shown to invite reinstall.
      if (localStorage.getItem(INSTALLED_STORAGE_KEY) === "true") {
        localStorage.removeItem(INSTALLED_STORAGE_KEY);
        localStorage.removeItem(MINIMIZED_STORAGE_KEY);
        setIsMinimized(false);
      }
    };

    const installedHandler = () => {
      // Track that the user has installed the app at least once
      localStorage.setItem(INSTALLED_STORAGE_KEY, "true");
      localStorage.removeItem(MINIMIZED_STORAGE_KEY);
      setDeferredPrompt(null);
      setIsMinimized(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    localStorage.removeItem(MINIMIZED_STORAGE_KEY);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    localStorage.setItem(MINIMIZED_STORAGE_KEY, "true");
    setIsMinimized(true);
  };

  const handleExpand = () => {
    setIsMinimized(false);
  };

  if (!deferredPrompt) return null;

  // Sit above the sticky media player
  const dockBottom =
    "bottom-[calc(var(--section-pad-bottom)+8px)]";

  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={handleExpand}
        aria-label="Install Solagracia App"
        className={`fixed right-4 z-[1000] flex h-12 w-12 items-center justify-center border border-[var(--frame-line)] bg-white text-[var(--bg-void)] transition-colors hover:bg-[var(--text-main)] animate-[hero-rise_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards] ${dockBottom}`}
      >
        <DownloadIcon />
      </button>
    );
  }

  return (
    <div
      className={`fixed right-4 left-4 z-[1000] flex max-w-sm items-start gap-3 border border-[var(--frame-line)] bg-black/92 p-4 text-white backdrop-blur-md animate-[hero-rise_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards] md:left-auto md:right-6 ${dockBottom}`}
      role="dialog"
      aria-label="Install Solagracia App"
    >
      <div className="min-w-0 flex-1">
        <h4 className="mb-1 text-[0.95rem] font-extrabold tracking-[0.04em] text-white uppercase">
          Install Solagracia App
        </h4>
        <p className="text-[0.78rem] leading-snug font-medium text-white/70">
          Pasang ke layar utama untuk pengalaman terbaik dan audio yang tetap
          jalan saat browser ditutup.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex h-10 items-center gap-2 border border-white bg-white px-3 text-[0.72rem] font-extrabold tracking-[0.08em] text-[var(--bg-void)] uppercase transition-colors hover:bg-[var(--text-main)]"
          >
            <DownloadIcon />
            Pasang
          </button>
          <button
            type="button"
            onClick={handleMinimize}
            className="px-2 py-2 text-[0.72rem] font-bold tracking-[0.06em] text-white/55 uppercase transition-colors hover:text-white"
          >
            Nanti saja
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={handleMinimize}
        aria-label="Tutup"
        className="shrink-0 text-white/55 transition-colors hover:text-white"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
      />
      <path
        d="M7 11l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M4 19h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="square"
      />
    </svg>
  );
}
