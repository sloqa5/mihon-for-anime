const CACHE_NAME = "myanime-shell-v1";
const OFFLINE_URLS = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  // Network-first for navigation to keep fresh UI.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/index.html").then((resp) => resp || Response.error())
      )
    );
    return;
  }

  // Cache-first for manifest/icons.
  if (OFFLINE_URLS.includes(new URL(request.url).pathname)) {
    event.respondWith(
      caches.match(request).then((resp) => resp || fetch(request))
    );
  }
});
