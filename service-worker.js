const CACHE_NAME = 'bradley-health-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/style.css',
  '/assets/mobile.css',
  '/assets/shared.js',
  '/assets/js/notifications.js',
  '/assets/js/blood-pressure.js',
  '/assets/js/theme.js',
  '/assets/js/share.js',
  '/assets/icons/icon.svg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the fetched resource
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-readings') {
    event.waitUntil(syncReadings());
  }
});

async function syncReadings() {
  const db = await openDB();
  const readings = await db.getAll('pendingReadings');
  
  for (const reading of readings) {
    try {
      await fetch('/api/readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reading)
      });
      await db.delete('pendingReadings', reading.id);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// Helper function to open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BradleyHealth', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('offlineHealthData')) {
                db.createObjectStore('offlineHealthData', { keyPath: 'id' });
            }
        };
    });
}
