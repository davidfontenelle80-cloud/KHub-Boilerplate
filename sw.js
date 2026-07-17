/**
 * sw.js — KHub Boilerplate
 * Version: network-first shortcut refresh
 *
 * Responsibilities:
 *  1. Precache the app shell on install
 *  2. Serve app-shell files network-first, with cache as offline fallback
 *  3. Purge old caches on activate
 *  4. skipWaiting on install so shortcuts refresh quickly
 *  5. Broadcast RELOAD_READY to all clients after activation
 *
 * Update-check timing (12-hour interval) is owned by the page (app.js)
 * because the SW can be suspended by the browser at any time.
 * The page calls registration.update() → browser re-fetches sw.js →
 * if content changed, new SW installs → page receives 'updatefound' →
 * shows banner or quietly reloads depending on "safe" state.
 *
 * BUMP THIS VERSION STRING on every deploy that changes HTML, CSS, JS, manifest, or SW behavior.
 */

const CACHE_VERSION = 'khub-boilerplate-v20-pinch-zoom-default-off';

/**
 * All URLs that make up the app shell.
 * Add any new JS/CSS files here when you create them.
 */
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
  './js/app.js',
];

// ── Install ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => {
        self.skipWaiting();
        console.log('[KHub SW] Installed — skipping wait, activating immediately.');
      })
      .catch(err => console.error('[KHub SW] Install failed:', err))
  );
});

// ── Activate ─────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => {
            console.log('[KHub SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
      .then(() => {
        self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(client => client.postMessage({ type: 'RELOAD_READY' }));
        });
      })
  );
});

// Strategy: network-first for app shell, network-only for everything else.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isAppShell = PRECACHE_URLS.some(path => new URL(path, self.location.href).pathname === url.pathname);
  if (!isAppShell) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, cloned));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ── Messages ─────────────────────────────────────────────────
self.addEventListener('message', event => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    console.log('[KHub SW] SKIP_WAITING received — activating new version.');
    self.skipWaiting();
  }
});