// Bradley Health Service Worker
const CACHE_NAME = 'bradley-health-v1.1.1';
const STATIC_CACHE = 'bradley-health-static-v1.1.1';
const DYNAMIC_CACHE = 'bradley-health-dynamic-v1.1.1';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/favicon.svg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/apple-touch-icon.png',
  '/assets/css/components.css',
  '/assets/css/layout.css',
  '/assets/css/theme.css',
  '/assets/js/firebase-config.js',
  '/assets/js/auth.js',
  '/assets/js/dashboard.js',
  '/assets/js/blood-pressure.js',
  '/assets/js/goals-manager.js',
  '/assets/js/charts.js',
  '/assets/js/medication-manager.js',
  '/assets/js/mood-tracker.js',
  '/assets/js/notifications.js',
  '/assets/js/export.js',
  '/assets/js/profile-manager.js',
  '/assets/js/legal.js',
  '/assets/js/pwa-install.js'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Old caches cleaned up');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('Service Worker: Error during activation:', error);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.origin === self.location.origin) {
    // Same-origin requests
    event.respondWith(handleSameOriginRequest(request));
  } else if (url.hostname.includes('firebase')) {
    // Firebase requests - always go to network
    event.respondWith(handleFirebaseRequest(request));
  } else if (url.hostname.includes('cdn') || url.hostname.includes('unpkg')) {
    // CDN requests - cache and serve
    event.respondWith(handleCDNRequest(request));
  } else {
    // External requests - network first
    event.respondWith(handleExternalRequest(request));
  }
});

// Handle same-origin requests
async function handleSameOriginRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Error handling same-origin request:', error);
    
    // Return offline page if available
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    throw error;
  }
}

// Handle Firebase requests
async function handleFirebaseRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Service Worker: Firebase request failed:', error);
    throw error;
  }
}

// Handle CDN requests
async function handleCDNRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: CDN request failed:', error);
    throw error;
  }
}

// Handle external requests
async function handleExternalRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Service Worker: External request failed:', error);
    throw error;
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');
  
  let notificationData = {
    title: 'Bradley Health',
    body: 'You have a new notification',
    icon: '/assets/favicon.svg',
    badge: '/assets/favicon.svg',
    tag: 'bradley-health-notification',
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Service Worker: Error parsing push data:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
      .catch((error) => {
        console.error('Service Worker: Error showing notification:', error);
      })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  if (event.notification) {
    event.notification.close();
  }

  const urlToOpen = event.notification?.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .catch((error) => {
        console.error('Service Worker: Error handling notification click:', error);
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync offline data when connection is restored
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    if (offlineData.length > 0) {
      console.log('Service Worker: Syncing offline data:', offlineData.length, 'items');
      
      for (const data of offlineData) {
        try {
          await syncDataItem(data);
          await removeOfflineData(data.id);
        } catch (error) {
          console.error('Service Worker: Error syncing data item:', error);
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Error during background sync:', error);
  }
}

// Get offline data from IndexedDB
async function getOfflineData() {
  // This would typically use IndexedDB
  // For now, return empty array
  return [];
}

// Sync individual data item
async function syncDataItem(data) {
  // This would sync data to Firebase
  // Implementation depends on the data type
  console.log('Service Worker: Syncing data item:', data);
}

// Remove synced data from offline storage
async function removeOfflineData(id) {
  // This would remove data from IndexedDB
  console.log('Service Worker: Removing offline data:', id);
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({ version: CACHE_NAME });
    }
  }
});

// Error event
self.addEventListener('error', (event) => {
  console.error('Service Worker: Error:', event.error || 'Unknown error');
});

// Unhandled rejection event
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker: Unhandled rejection:', event.reason || 'Unknown reason');
});

// Periodic background sync (if supported)
if ('periodicSync' in navigator) {
  self.addEventListener('periodicsync', (event) => {
    console.log('Service Worker: Periodic sync event:', event.tag);
    
    if (event.tag === 'health-data-sync') {
      event.waitUntil(syncHealthData());
    }
  });
}

// Sync health data periodically
async function syncHealthData() {
  try {
    console.log('Service Worker: Syncing health data...');
    // Implementation for periodic health data sync
  } catch (error) {
    console.error('Service Worker: Error during periodic sync:', error);
  }
}

// Cache management utilities
async function clearOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      name !== STATIC_CACHE && name !== DYNAMIC_CACHE
    );
    
    return Promise.all(
      oldCaches.map(name => caches.delete(name))
    );
  } catch (error) {
    console.error('Service Worker: Error clearing old caches:', error);
    return [];
  }
}

async function getCacheSize() {
  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Service Worker: Error getting cache size:', error);
    return 0;
  }
}

// Export utilities for use in main thread
self.bradleyHealthSW = {
  clearOldCaches,
  getCacheSize,
  version: CACHE_NAME
}; 