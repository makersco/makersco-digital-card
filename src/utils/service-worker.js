// Cache version: v1 — increment to force cache refresh
const CACHE_NAME = 'makersco-card-v1';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

const ALL_CACHE_ASSETS = [...CORE_ASSETS, ...CDN_ASSETS];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ALL_CACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  const isCDN = url.origin !== self.location.origin;
  const isCoreAsset = CORE_ASSETS.some((asset) => url.pathname === asset || url.pathname.endsWith(asset));

  if (isCDN || isCoreAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
    );
  } else {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || (request.mode === 'navigate' ? caches.match('/index.html') : new Response('Offline', { status: 503 }));
        });
      })
    );
  }
});