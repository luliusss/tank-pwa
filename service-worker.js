const CACHE_NAME = "tankplaner-v2";

const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// INSTALL: Cache aufbauen
self.addEventListener("install", event => {
  self.skipWaiting(); // sofort aktiv
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

// ACTIVATE: alte Caches löschen
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim(); // sofort neue Version nutzen
});

// FETCH: Network first (wichtig für deine API!)
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // ❌ API NICHT cachen (sonst alte Preise!)
  if (url.hostname.includes("tankerkoenig")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // ✔ App Dateien cachen
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
