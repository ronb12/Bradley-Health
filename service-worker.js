const CACHE_NAME = 'bradley-health-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/dashboard.html',
    '/blood-pressure.html',
    '/medications.html',
    '/mood-tracker.html',
    '/profile.html',
    '/offline.html',
    '/assets/style.css',
    '/assets/mobile.css',
    '/assets/mobile.js',
    '/assets/shared.js',
    '/assets/blood-pressure.js',
    '/assets/icons/icon-72x72.png',
    '/assets/icons/icon-96x96.png',
    '/assets/icons/icon-128x128.png',
    '/assets/icons/icon-144x144.png',
    '/assets/icons/icon-152x152.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-384x384.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/bp-96x96.png',
    '/assets/icons/meds-96x96.png',
    '/assets/icons/mood-96x96.png',
    '/assets/screenshots/dashboard.png',
    '/assets/screenshots/blood-pressure.png',
    '/assets/screenshots/medications.png',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Handle navigation requests
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(OFFLINE_URL);
                })
        );
        return;
    }

    // Handle API requests
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return new Response(
                        JSON.stringify({ error: 'You are offline' }),
                        {
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );
                })
        );
        return;
    }

    // Handle static assets
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

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // If the network request fails and it's an image, return a placeholder
                        if (event.request.destination === 'image') {
                            return caches.match('/assets/icons/placeholder.png');
                        }
                    });
            })
    );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-health-data') {
        event.waitUntil(syncHealthData());
    }
});

// Push notification handling
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/assets/icons/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/icons/close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Bradley Health', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/dashboard.html')
        );
    }
});

// Helper function to sync health data
async function syncHealthData() {
    const db = await openDB();
    const offlineData = await db.getAll('offlineHealthData');

    for (const data of offlineData) {
        try {
            await fetch('/api/health-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            await db.delete('offlineHealthData', data.id);
        } catch (error) {
            console.error('Failed to sync health data:', error);
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
