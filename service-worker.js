const CACHE_NAME = 'bradley-health-cache-v1';
const FILES_TO_CACHE = [
  'index.html',
  'manifest.json',
  'assets/style.css',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/favicon-32x32.png',
  'assets/favicon-16x16.png',
  'assets/apple-touch-icon.png',
  'firebase-init.js',
  'blood-pressure.html',
  'roll-tracker.html',
  'daily-summary.html',
  'mood-tracker.html',
  'medications.html'
];

// Install: Cache essential files
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    }).catch(err => {
      console.error('❌ Failed to cache during install:', err);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
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
  self.clients.claim();
});

// Fetch: Serve from cache or fallback
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Handle favicon requests
  if (event.request.url.includes('favicon.ico')) {
    event.respondWith(
      caches.match('assets/favicon-32x32.png')
        .then(response => response || new Response('', { status: 404 }))
    );
    return;
  }

  // Handle Firebase SDK requests
  if (event.request.url.includes('firebasejs')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If fetch fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For all other requests
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(response => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If both cache and network fail, return offline page
            if (event.request.mode === 'navigate') {
              return caches.match('index.html');
            }
            return new Response('⚠️ You are offline and this file is not cached.', {
              status: 503,
              statusText: 'Offline',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});
