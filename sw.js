/**
 * KHub service worker.
 *
 * Keep CACHE_PREFIX unique to the generated app. Required shell installation is
 * atomic: a missing required asset aborts the new worker and leaves the prior
 * complete worker in control.
 */

const CACHE_PREFIX = 'khub-boilerplate-';
const CACHE_VERSION = `${CACHE_PREFIX}v21-consolidated-infrastructure`;

// Historical prefixes owned by this app only. Add a prefix here when an existing
// deployed app is renamed; never add another app's prefix.
const OBSOLETE_CACHE_PREFIXES = [];

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
  './js/firebase/cloud-backup.js',
  './js/a11y.js',
  './js/components/button.js',
  './js/components/modal.js',
  './js/components/card.js',
  './js/components/input.js',
  './js/perf.js',
  './js/sw-manager.js',
  './js/app.js',
  './icons/favicon.svg',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
];

const OFFLINE_DOCUMENT_URLS = ['./index.html', './'];

function pathFor(value) {
  return new URL(value, self.location.href).pathname;
}

function isOwnedCache(key) {
  return (
    key.startsWith(CACHE_PREFIX) || OBSOLETE_CACHE_PREFIXES.some((prefix) => key.startsWith(prefix))
  );
}

function isPrecachedPath(url) {
  return PRECACHE_URLS.some((path) => pathFor(path) === url.pathname);
}

function isDocumentRequest(request) {
  return request.mode === 'navigate' || request.destination === 'document';
}

async function cacheSuccessfulResponse(request, response) {
  if (response && response.status === 200 && response.type === 'basic') {
    const cache = await caches.open(CACHE_VERSION);
    await cache.put(request, response.clone());
  }
  return response;
}

async function cachedOfflineDocument(request) {
  const exact = await caches.match(request);
  if (exact) return exact;

  for (const path of OFFLINE_DOCUMENT_URLS) {
    const fallback = await caches.match(new URL(path, self.location.href).href);
    if (fallback) return fallback;
  }

  return Response.error();
}

async function handleDocumentRequest(request) {
  try {
    return await cacheSuccessfulResponse(request, await fetch(request));
  } catch (_) {
    return cachedOfflineDocument(request);
  }
}

async function handleAssetRequest(request) {
  try {
    return await cacheSuccessfulResponse(request, await fetch(request));
  } catch (_) {
    // Exact-request fallback only. Never return index.html for an asset.
    return (await caches.match(request)) || Response.error();
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[KHub SW] Atomic shell install failed:', error);
        throw error;
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION && isOwnedCache(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'RELOAD_READY' }));
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isDocumentRequest(request)) {
    event.respondWith(handleDocumentRequest(request));
    return;
  }

  if (isPrecachedPath(url)) {
    event.respondWith(handleAssetRequest(request));
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
