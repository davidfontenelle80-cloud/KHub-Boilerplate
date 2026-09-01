/**
 * config.js — KHub Boilerplate
 * Environment detection and feature flags.
 *
 * No build step — dev vs prod is detected at runtime from location.hostname.
 * Dev  = localhost / 127.0.0.1 / file:// protocol
 * Prod = everything else (GitHub Pages, Netlify, custom domain, etc.)
 *
 * Feature flags:
 *   auth     — enables KHub.Auth sign-in/out (implement provider in auth.js)
 *   firebase — enables Firebase SDK (configure in firebase/firebase-config.js)
 *
 * Pinch zoom is disabled by default for the installed-app experience. Apps may
 * expose a Settings toggle that calls KHub.Config.setPinchZoomEnabled(true).
 * The preference is persisted in localStorage for that app.
 *
 * To fork this boilerplate for a new app, update:
 *   appName, version, repoOwner, repoName
 */
(function () {
  'use strict';

  const hostname = location.hostname;
  const isDev =
    hostname === 'localhost' || hostname === '127.0.0.1' || location.protocol === 'file:';
  const pinchZoomStorageKey = 'khub-allow-pinch-zoom';

  function readPinchZoomPreference() {
    try {
      return localStorage.getItem(pinchZoomStorageKey) === 'true';
    } catch (_) {
      return false;
    }
  }

  function applyViewport(allowPinchZoom) {
    const viewport =
      document.getElementById('khub-viewport') || document.querySelector('meta[name="viewport"]');

    if (!viewport) return;

    viewport.setAttribute(
      'content',
      allowPinchZoom
        ? 'width=device-width, initial-scale=1.0, viewport-fit=cover'
        : 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  }

  window.KHub = window.KHub || {};
  window.KHub.Config = {
    // ── Identity ──────────────────────────────────────────
    appName: 'KHub App',
    version: '1.0.0',
    repoOwner: 'davidfontenelle80-cloud',
    repoName: 'KHub-Boilerplate',

    // ── PWA identity (must be unique per generated app) ───
    pwa: {
      cachePrefix: 'khub-boilerplate-',
      obsoleteCachePrefixes: [],
      updateCheckKey: 'khub-boilerplate:last-sw-update-check',
      swUrl: './sw.js',
      scope: './',
    },

    // ── Environment ───────────────────────────────────────
    env: isDev ? 'development' : 'production',
    isDev,
    isProd: !isDev,

    // ── Interaction defaults ──────────────────────────────
    allowPinchZoom: readPinchZoomPreference(),
    setPinchZoomEnabled(enabled) {
      const allow = Boolean(enabled);
      this.allowPinchZoom = allow;

      try {
        localStorage.setItem(pinchZoomStorageKey, String(allow));
      } catch (_) {
        // Storage can be unavailable in private or restricted browser modes.
      }

      applyViewport(allow);
      return allow;
    },

    // ── Feature flags ─────────────────────────────────────
    // Set to true to activate. See individual module files for setup steps.
    features: {
      auth: false, // -> js/auth.js
      firebase: false, // -> firebase/firebase-config.js
    },

    // ── Logging ───────────────────────────────────────────
    // Use KHub.Config.log() instead of console.log() so logs are
    // automatically silenced in production.
    log(...args) {
      if (isDev) console.log('[KHub]', ...args);
    },
    warn(...args) {
      if (isDev) console.warn('[KHub]', ...args);
    },
  };

  applyViewport(window.KHub.Config.allowPinchZoom);

  if (isDev) {
    console.log(`[KHub] Dev mode — v${window.KHub.Config.version}`);
  }
})();
