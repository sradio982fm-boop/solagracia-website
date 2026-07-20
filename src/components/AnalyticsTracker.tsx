"use client";

import { useEffect, useRef, useCallback } from "react";

const STORAGE_KEY_UID = "sg_uid";
const STORAGE_KEY_SID = "sg_sid";
const STORAGE_KEY_SID_TS = "sg_sid_ts";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const FLUSH_INTERVAL_MS = 10_000;
const BEACON_ENDPOINT = "/api/analytics/beacon";

interface AnalyticsEvent {
  t: string;
  d?: string;
  ts: number;
}

interface AnalyticsPayload {
  uid: string;
  sid: string;
  ts: number;
  dur: number;
  v: number;
  ua?: string;
  ref?: string;
  ev?: AnalyticsEvent[];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

function getOrCreateUid(): string {
  if (typeof window === "undefined") return "";
  let uid = localStorage.getItem(STORAGE_KEY_UID);
  if (!uid) {
    uid = generateId();
    localStorage.setItem(STORAGE_KEY_UID, uid);
  }
  return uid;
}

function getOrCreateSession(): { sid: string; ts: number } {
  const now = Date.now();
  const existingSid = sessionStorage.getItem(STORAGE_KEY_SID);
  const existingTs = sessionStorage.getItem(STORAGE_KEY_SID_TS);

  if (existingSid && existingTs) {
    const startedAt = parseInt(existingTs, 10);
    if (now - startedAt < SESSION_TIMEOUT_MS) {
      return { sid: existingSid, ts: startedAt };
    }
  }

  const sid = generateId();
  sessionStorage.setItem(STORAGE_KEY_SID, sid);
  sessionStorage.setItem(STORAGE_KEY_SID_TS, String(now));
  return { sid, ts: now };
}

const MOBILE_MAX_WIDTH = 768;
const TABLET_MAX_WIDTH = 1024;

function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const width = window.innerWidth;
  if (width < MOBILE_MAX_WIDTH) return "mobile";
  if (width < TABLET_MAX_WIDTH) return "tablet";
  return "desktop";
}

function sendBeacon(payload: AnalyticsPayload): void {
  const encoded = btoa(JSON.stringify(payload));

  if (navigator.sendBeacon) {
    navigator.sendBeacon(BEACON_ENDPOINT, encoded);
  } else {
    fetch(BEACON_ENDPOINT, {
      method: "POST",
      body: encoded,
      keepalive: true,
    }).catch(() => {});
  }
}

export function AnalyticsTracker() {
  const eventsRef = useRef<AnalyticsEvent[]>([]);
  const pageViewsRef = useRef(0);
  const sessionStartRef = useRef(0);
  const uidRef = useRef("");
  const sidRef = useRef("");
  const flushedRef = useRef(false);

  const flush = useCallback(() => {
    if (!uidRef.current || !sidRef.current) return;

    const now = Date.now();
    const duration = Math.round((now - sessionStartRef.current) / 1000);

    const payload: AnalyticsPayload = {
      uid: uidRef.current,
      sid: sidRef.current,
      ts: sessionStartRef.current,
      dur: duration,
      v: pageViewsRef.current,
      ua: getDeviceType(),
      ref: document.referrer || undefined,
      ev: eventsRef.current.length > 0 ? [...eventsRef.current] : undefined,
    };

    sendBeacon(payload);
    eventsRef.current = [];
  }, []);

  const trackEvent = useCallback((type: string, data?: string) => {
    eventsRef.current.push({
      t: type,
      d: data,
      ts: Date.now(),
    });
  }, []);

  useEffect(() => {
    uidRef.current = getOrCreateUid();
    const session = getOrCreateSession();
    sidRef.current = session.sid;
    sessionStartRef.current = session.ts;

    // Public site only — never record admin paths as "sections".
    if (window.location.pathname.startsWith("/admin")) {
      return;
    }

    pageViewsRef.current = 1;
    trackEvent(
      "sv",
      window.location.hash?.replace("#", "") || "home",
    );

    const initialFlushTimeout = setTimeout(() => {
      flush();
    }, 3000);

    const intervalId = setInterval(() => {
      if (eventsRef.current.length > 0) {
        flush();
      }
    }, FLUSH_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleBeforeUnload = () => {
      if (!flushedRef.current) {
        flushedRef.current = true;
        flush();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    (window as unknown as Record<string, unknown>).__sgTrackEvent = trackEvent;

    return () => {
      clearTimeout(initialFlushTimeout);
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      delete (window as unknown as Record<string, unknown>).__sgTrackEvent;
    };
  }, [flush, trackEvent]);

  return null;
}

export function trackAnalyticsEvent(type: string, data?: string): void {
  const fn = (window as unknown as Record<string, unknown>)?.__sgTrackEvent;
  if (typeof fn === "function") {
    (fn as (type: string, data?: string) => void)(type, data);
  }
}
