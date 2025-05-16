const CACHE_NAME = 'bradley-health-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/style.css',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/firebase-messaging-sw.js',
  '/js/firebase-init.js',
  '/blood-pressure.html',
  '/roll-tracker.html'
];

// Install: Cache essential files
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate: Cleanup old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // Claim control
});

// Fetch: Serve from cache or fall back
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only return if status is OK
        return response.ok ? response : caches.match(event.request);
      })
      .catch(() => {
        return caches.match(event.request).then(res => {
          return res || new Response('⚠️ You are offline and this file is not cached.', {
            status: 503,
            statusText: 'Offline'
          });
        });
      })
  );
});
