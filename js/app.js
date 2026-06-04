/**
 * app.js — KHub Boilerplate
 * Bootstrap, shared namespace, event bus, service worker registration.
 * This runs last — all other modules are already loaded.
 */
(function () {
  'use strict';

  // ── Event bus ──────────────────────────────────────────────
  const _listeners = {};

  function on(event, fn)   { (_listeners[event] = _listeners[event] || []).push(fn); }
  function off(event, fn)  { _listeners[event] = (_listeners[event] || []).filter(f => f !== fn); }
  function emit(event, data) { (_listeners[event] || []).forEach(fn => fn(data)); }

  // ── Service worker registration ────────────────────────────
  const SW = {
    registration: null,

    async register() {
      if (!('serviceWorker' in navigator)) return;
      try {
        SW.registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
        console.log('[KHub.SW] Registered:', SW.registration.scope);

        // Listen for waiting SW (new version ready)
        SW.registration.addEventListener('updatefound', () => {
          const newSW = SW.registration.installing;
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              SW._showUpdateNotice();
            }
          });
        });

        // Check for update on load
        SW.registration.update();

      } catch (err) {
        console.warn('[KHub.SW] Registration failed:', err);
      }
    },

    _showUpdateNotice() {
      const notice = document.getElementById('update-notice');
      if (notice) notice.hidden = false;
    },

    applyUpdate() {
      if (SW.registration?.waiting) {
        SW.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
    },
  };

  // ── Bootstrap ──────────────────────────────────────────────
  function init() {
    console.log(`[KHub] ${KHub.Config.appName} v${KHub.Config.version} (${KHub.Config.env})`);

    // Register service worker
    SW.register();

    // Apply saved lang (I18n already ran, this is a safety re-apply)
    KHub.I18n.set(KHub.I18n.current);

    emit('app:ready');
  }

  // ── Expose on window.KHub ──────────────────────────────────
  window.KHub = window.KHub || {};
  Object.assign(window.KHub, { on, off, emit, SW });

  document.addEventListener('DOMContentLoaded', init);
})();
