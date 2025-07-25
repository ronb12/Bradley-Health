self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('bradley-health-cache').then(cache => {
      return cache.addAll([
        'index.html',
        'bp-tracker.html',
        'roll-tracker.html',
        'assets/style.css',
        'js/bp.js',
        'js/roll.js'
      ]);
    })
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});