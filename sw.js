const CACHE_NAME = "castra-shell-v3-cassiopeia-icon";
const APP_SHELL = [
  "./", "./index.html", "./manifest-v3.webmanifest",
  "./favicon-v3.png", "./favicon-v3.ico",
  "./icon-192-v3.png", "./icon-512-v3.png", "./apple-touch-icon-v3.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("castra-shell-") && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request; const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(fetch(request).then(response => {
    if (response && response.ok && (request.mode === "navigate" || APP_SHELL.some(path => url.pathname.endsWith(path.replace(/^\.\//, ""))))) {
      const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
    }
    return response;
  }).catch(() => caches.match(request).then(cached => cached || caches.match("./index.html"))));
});
