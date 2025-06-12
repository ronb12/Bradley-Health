const CACHE_NAME = 'bradley-health-v1';

// Assets to cache
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'login.html',
    'dashboard.html',
    'blood-pressure.html',
    'medications.html',
    'profile.html',
    'assets/style.css',
    'assets/mobile.css',
    'assets/js/firebase-config.js',
    'assets/js/firebase-init.js',
    'assets/js/blood-pressure-manager.js',
    'assets/js/notification-manager.js',
    'assets/js/export-manager.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(error => {
                console.error('Error in cache.addAll():', error);
                // Try adding one by one
                return caches.open(CACHE_NAME).then(cache => {
                    const addPromises = ASSETS_TO_CACHE.map(url => {
                        return cache.add(url).catch(err => {
                            console.error('Failed to cache:', url, err);
                        });
                    });
                    return Promise.all(addPromises);
                });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Background sync for offline data
self.addEventListener('sync', event => {
    if (event.tag === 'sync-readings') {
        event.waitUntil(syncReadings());
    }
});

async function syncReadings() {
    const db = await openDB();
    const readings = await db.getAll('pendingReadings');
    
    for (const reading of readings) {
        try {
            await syncReading(reading);
            await db.delete('pendingReadings', reading.id);
        } catch (error) {
            console.error('Error syncing reading:', error);
        }
    }
}

async function syncReading(reading) {
    const response = await fetch('api/readings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reading)
    });

    if (!response.ok) {
        throw new Error('Failed to sync reading');
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
