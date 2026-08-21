// Solagracia — Service Worker
// Minimal SW: enables PWA installability and keeps the page treated as a
// "first-class" app by the OS, which permits background audio playback.

const CACHE_VERSION = "solagracia-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;

// Install: take control as soon as possible
self.addEventListener("install", () => {
  self.skipWaiting();
});

// Activate: claim all clients and clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(
            (name) => name.startsWith("solagracia-") && name !== STATIC_CACHE,
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

// Fetch: pass-through for streaming/dynamic content; we don't cache it.
// This matters because HLS streams rely on freshness; caching would break them.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip any streaming / API / dynamic content — pass through to network
  if (
    url.pathname.endsWith(".m3u8") ||
    url.pathname.endsWith(".ts") ||
    url.pathname.endsWith(".aac") ||
    url.pathname.startsWith("/api/") ||
    event.request.method !== "GET"
  ) {
    return; // browser handles it normally
  }

  // For everything else, try network first, fall back to cache (for offline UX)
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);
        return response;
      } catch {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        throw new Error("Network and cache both unavailable");
      }
    })(),
  );
});

// Receive messages from the page (e.g., to keep SW alive while audio plays)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "KEEP_ALIVE") {
    // Touching this handler is enough to extend the SW's lifetime.
    event.source?.postMessage({ type: "ALIVE" });
  }
});
