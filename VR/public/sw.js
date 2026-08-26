const CACHE = "phi-webxr-v19";
const CORE = [
  "/",
  "/runtime-assets/scene-manifest.json",
  "/runtime-assets/south-park-scene-manifest.json",
  "/runtime-assets/boundaries/south-park-road-volume.json",
  "/audio/phi-vr-narration.mp3",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request)) || (request.mode === "navigate" ? caches.match("/") : undefined);
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const durableAsset = url.pathname.startsWith("/runtime-assets/scenes/")
    || url.pathname.startsWith("/runtime-assets/boundaries/")
    || url.pathname.startsWith("/runtime-assets/instances/")
    || url.pathname.startsWith("/runtime-assets/models/")
    || url.pathname.startsWith("/audio/");
  event.respondWith(durableAsset ? cacheFirst(event.request) : networkFirst(event.request));
});
