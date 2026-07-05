// BridGenta Portfolio — Service Worker
const CACHE_NAME = "bridgenta-portfolio-v14";
const OFFLINE_URL = "offline.html";

const PRECACHE_ASSETS = [
  "/",
  "index.html",
  "projects.html",
  "about.html",
  "contact.html",
  "project-aeocortex.html",
  "project-bridgenta.html",
  "project-luminapraxisds.html",
  "project-rootedrealitygarden.html",
  "project-starcleaners.html",
  "styles.css",
  "script.js",
  "manifest.json",
  OFFLINE_URL,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Bypass service worker for TinaCMS admin dashboard and local APIs
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/admin") || url.port === "4001") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return cached;
        });

      return cached || network;
    })
  );
});
