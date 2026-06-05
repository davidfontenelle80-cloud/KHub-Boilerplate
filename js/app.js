/**
 * app.js — KHub Boilerplate
 * Bootstrap, shared namespace, event bus, and service worker manager.
 *
 * SW update strategy:
 *  - On every page load: call registration.update() (browser re-fetches sw.js)
 *  - Every 12 hours (tracked via localStorage timestamp): call registration.update() again
 *  - When a new SW enters "waiting" state:
 *      • If page is "safe" (no open modals, no focused inputs, no dirty forms): reload quietly
 *      • Otherwise: show the update banner so the user can choose when to refresh
 *  - When user clicks Refresh on banner: send SKIP_WAITING → SW activates → page reloads
 *  - When SW broadcasts RELOAD_READY (after activation): reload if not already reloading
 */
(function () {
  'use strict';

  // ── Event bus ──────────────────────────────────────────────
  const _listeners = {};

  function on(event, fn)  { (_listeners[event] = _listeners[event] || []).push(fn); }
  function off(event, fn) { _listeners[event] = (_listeners[event] || []).filter(f => f !== fn); }
  function emit(event, data) { (_listeners[event] || []).forEach(fn => { try { fn(data); } catch (e) { console.error('[KHub] Event error:', e); } }); }

  // ── Safe-state detection ───────────────────────────────────
  // "Safe" = no user interaction that would be disrupted by a reload.
  // Extend this list as your app grows (e.g. unsaved form data checks).
  function isSafeToReload() {
    // Any modal open?
    if (document.querySelector('.modal-backdrop')) return false;
    // Any input/textarea/select focused?
    const focused = document.activeElement;
    if (focused && ['INPUT', 'TEXTAREA', 'SELECT'].includes(focused.tagName)) return false;
    // Any form with dirty (unsaved) data?
    const forms = document.querySelectorAll('form');
    for (const form of forms) {
      const inputs = form.querySelectorAll('input, textarea, select');
      for (const input of inputs) {
        if (input.value !== input.defaultValue) return false;
      }
    }
    return true;
  }

  // ── SW manager ────────────────────────────────────────────
  const UPDATE_CHECK_KEY = 'khub_last_update_check';
  const UPDATE_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours

  const SW = {
    registration: null,
    _reloading: false,

    async register() {
      if (!('serviceWorker' in navigator)) {
        console.warn('[KHub.SW] Service workers not supported.');
        return;
      }

      try {
        SW.registration = await navigator.serviceWorker.register('./sw.js', { scope: './' });
        console.log('[KHub.SW] Registered. Scope:', SW.registration.scope);
      } catch (err) {
        console.warn('[KHub.SW] Registration failed:', err);
        return;
      }

      // ── Listen for a newly installing SW ──────────────────
      SW.registration.addEventListener('updatefound', () => {
        const newSW = SW.registration.installing;
        if (!newSW) return;

        console.log('[KHub.SW] New SW installing…');

        newSW.addEventListener('statechange', () => {
          console.log('[KHub.SW] New SW state:', newSW.state);

          // New SW is installed and waiting; an existing SW is in control
          if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[KHub.SW] Update ready. Safe to reload:', isSafeToReload());

            if (isSafeToReload()) {
              // Quiet path: no user interaction in progress — reload silently
              SW._activateAndReload();
            } else {
              // Noisy path: user is doing something — show the banner
              SW._showBanner();
            }
          }
        });
      });

      // ── Listen for messages from the SW ───────────────────
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data?.type === 'RELOAD_READY' && !SW._reloading) {
          console.log('[KHub.SW] SW activated — reloading page.');
          SW._reloading = true;
          location.reload();
        }
      });

      // ── Check for updates on load ─────────────────────────
      SW._checkForUpdate();

      // ── Schedule 12-hour periodic check ──────────────────
      SW._schedulePeriodicCheck();
    },

    // Called on page load — always triggers a SW re-fetch.
    // Also called by the periodic timer.
    _checkForUpdate() {
      if (!SW.registration) return;

      const last  = parseInt(localStorage.getItem(UPDATE_CHECK_KEY) || '0', 10);
      const now   = Date.now();
      const due   = now - last >= UPDATE_INTERVAL_MS;

      // Always check on first load (last === 0) or when interval has passed
      if (last === 0 || due) {
        console.log('[KHub.SW] Checking for updates…');
        SW.registration.update()
          .then(() => localStorage.setItem(UPDATE_CHECK_KEY, String(Date.now())))
          .catch(err => console.warn('[KHub.SW] Update check failed:', err));
      }
    },

    // Re-check every hour; only triggers a real update if 12h have passed.
    _schedulePeriodicCheck() {
      setInterval(() => SW._checkForUpdate(), 60 * 60 * 1000); // check every hour
    },

    _showBanner() {
      const notice = document.getElementById('update-notice');
      if (notice) notice.hidden = false;
    },

    _hideBanner() {
      const notice = document.getElementById('update-notice');
      if (notice) notice.hidden = true;
    },

    // Send SKIP_WAITING → SW activates → broadcasts RELOAD_READY → we reload.
    _activateAndReload() {
      SW._hideBanner();
      if (SW.registration?.waiting) {
        SW.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        // controllerchange fires when new SW takes over
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!SW._reloading) {
            SW._reloading = true;
            location.reload();
          }
        }, { once: true });
      }
    },

    // Public: called when user clicks "Refresh" on the update banner
    applyUpdate() {
      console.log('[KHub.SW] User triggered update.');
      SW._activateAndReload();
    },
  };

  // ── Bootstrap ──────────────────────────────────────────────
  function init() {
    console.log(`[KHub] ${KHub.Config.appName} v${KHub.Config.version} (${KHub.Config.env})`);

    // Register SW
    SW.register();

    // Re-apply saved language (safety pass after all modules loaded)
    KHub.I18n.set(KHub.I18n.current);

    emit('app:ready');
    console.log('[KHub] App ready.');
  }

  // ── Expose on window.KHub ─────────────────────────────────
  window.KHub = window.KHub || {};
  Object.assign(window.KHub, { on, off, emit, SW });

  document.addEventListener('DOMContentLoaded', init);
})();

// ── Component demo wiring (remove in production apps) ─────
document.addEventListener('DOMContentLoaded', () => {
  // Cards
  const cardContainer = document.getElementById('card-demo');
  if (cardContainer) {
    cardContainer.appendChild(KHub.Components.Card.create({
      title: 'Basic Card',
      body:  'This is a reusable card component. Drop any content here.',
    }));
    cardContainer.appendChild(KHub.Components.Card.create({
      title:  'Card with Footer',
      body:   'Cards support optional footer content.',
      footer: '<button class="btn btn-sm btn-primary">Action</button>',
    }));
  }

  // Inputs
  const inputContainer = document.getElementById('input-demo');
  if (inputContainer) {
    inputContainer.appendChild(KHub.Components.Input.create({
      id:          'demo-text',
      label:       'Text input',
      placeholder: 'Type something…',
      hint:        'This is a helper hint.',
    }));
    inputContainer.appendChild(KHub.Components.Input.create({
      id:       'demo-email',
      label:    'Email (required)',
      type:     'email',
      required: true,
      validate: v => v && !v.includes('@') ? 'Enter a valid email address.' : '',
    }));
    inputContainer.appendChild(KHub.Components.Input.create({
      id:       'demo-password',
      label:    'Password',
      type:     'password',
      required: true,
      validate: v => v && v.length < 8 ? 'Password must be at least 8 characters.' : '',
    }));
  }

  // Modal demo
  const openBtn = document.getElementById('open-modal-btn');
  const heroBtn = document.getElementById('demo-modal-btn');
  const modalHandler = () => KHub.Components.Modal.open({
    title:        'Demo Modal',
    body:         '<p>This modal traps focus, closes on Escape, and returns focus on close.</p>',
    confirmLabel: 'Got it',
    cancelLabel:  'Close',
    onConfirm:    () => console.log('[KHub] Modal confirmed.'),
  });
  openBtn?.addEventListener('click', modalHandler);
  heroBtn?.addEventListener('click', modalHandler);

  // Error boundary demo (dev only)
  const errGroup = document.getElementById('error-demo-group');
  if (errGroup && KHub.Config.isDev) {
    errGroup.hidden = false;
    document.getElementById('trigger-error-btn')
      ?.addEventListener('click', () => { throw new Error('Test error from demo button.'); });
  }
});
