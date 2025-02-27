const cacheName = 'chordshift-pwa-cache-v1';
let VERSION = "version_00";
const assets = [
  '/chordshift/',
  '/chordshift/manifest.json',
  '/chordshift/app.js',
  '/chordshift/styles.css',
  '/chordshift/images/icon-192x192.png',
  '/chordshift/images/icon-512x512.png',
  '/chordshift/index.html',
];

// Install the service worker and cache assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('Service Worker: Caching files');
      return cache.addAll(assets);
    })
  );
});

// Serve from cache during fetch requests
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cacheResponse) => {
      return cacheResponse || fetch(e.request);
    })
  );
});

// Clear old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((thisCacheName) => {
          if (thisCacheName !== cacheName) {
            console.log('Service Worker: Removing old cache', thisCacheName);
            return caches.delete(thisCacheName);
          }
        })
      );
    })
  );
});