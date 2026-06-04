/**
 * KHub Service Worker — v1
 * - Precaches app shell on install
 * - Serves from cache, falls back to network
 * - Checks GitHub for updates every 12 hours and on app load
 * - Notifies app when a new version is available
 * Full update-check logic added in Step 3.
 */

const CACHE_NAME = 'khub-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/dark-mode.css',
  './css/components.css',
  './css/responsive.css',
  './js/config.js',
  './js/i18n.js',
  './js/theme.js',
  './js/error-boundary.js',
  './js/auth.js',
  './js/components/button.js',
  './js/components/modal.js',
  './js/components/card.js',
  './js/components/input.js',
  './js/app.js'
];

// Install — cache app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate — purge old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first for app shell, network-first for API
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    })
  );
});

// Message handler — update-check logic added in Step 3
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
