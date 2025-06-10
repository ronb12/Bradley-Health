const CACHE_NAME = 'bradley-health-v1';
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/dashboard.html',
    '/blood-pressure.html',
    '/medications.html',
    '/mood-tracker.html',
    '/roll-tracker.html',
    '/daily-summary.html',
    '/offline.html',
    '/assets/style.css',
    '/assets/shared.js',
    '/assets/favicon-16x16.png',
    '/assets/favicon-32x32.png',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
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
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event - handle offline support
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Handle API requests
    if (event.request.url.includes('/api/')) {
        event.respondWith(handleApiRequest(event.request));
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
                        // Cache successful responses
                        if (response && response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Handle API requests with offline support
async function handleApiRequest(request) {
    try {
        // Try network first
        const response = await fetch(request);
        return response;
    } catch (error) {
        // If offline, try to get from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // If no cache, queue for sync
        if (request.method === 'POST' || request.method === 'PUT') {
            await queueRequest(request);
            return new Response('Queued for sync', {
                status: 202,
                statusText: 'Accepted'
            });
        }

        throw error;
    }
}

// Queue requests for background sync
async function queueRequest(request) {
    const db = await openDB();
    const transaction = db.transaction(['syncQueue'], 'readwrite');
    const store = transaction.objectStore('syncQueue');
    
    const requestData = {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers),
        body: await request.clone().text(),
        timestamp: Date.now()
    };
    
    await store.add(requestData);
}

// Open IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BradleyHealthDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('syncQueue')) {
                db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

// Handle background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-health-data') {
        event.waitUntil(syncHealthData());
    }
});

// Sync health data
async function syncHealthData() {
    const db = await openDB();
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const requests = await store.getAll();

    for (const request of requests) {
        try {
            const response = await fetch(request.url, {
                method: request.method,
                headers: new Headers(request.headers),
                body: request.body
            });

            if (response.ok) {
                // Remove from queue if successful
                const deleteTransaction = db.transaction(['syncQueue'], 'readwrite');
                const deleteStore = deleteTransaction.objectStore('syncQueue');
                await deleteStore.delete(request.id);
            }
        } catch (error) {
            console.error('Sync failed:', error);
        }
    }
}

// Handle push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/assets/favicon-32x32.png',
        badge: '/assets/favicon-16x16.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Bradley Health', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/dashboard.html')
        );
    }
});
