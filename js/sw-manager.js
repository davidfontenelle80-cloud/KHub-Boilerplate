/**
 * Unified KHub service-worker lifecycle, update, health, and recovery manager.
 * Apps may call KHub.SW.configure() before DOMContentLoaded to add safe-state
 * or health hooks. This file is the only service-worker registrar.
 */
(function () {
  'use strict';

  const listeners = {};
  const defaults = {
    swUrl: './sw.js',
    scope: './',
    cachePrefix: 'khub-boilerplate-',
    obsoleteCachePrefixes: [],
    updateCheckKey: 'khub-boilerplate:last-sw-update-check',
    updateIntervalMs: 12 * 60 * 60 * 1000,
    pollIntervalMs: 60 * 60 * 1000,
    bootTimeoutMs: 5000,
    updateNoticeId: 'update-notice',
    updateButtonId: 'update-apply',
    appRootSelector: '#main-content',
    isSafeToReload: null,
    isAppHealthy: null,
  };

  let options = { ...defaults, ...(window.KHub?.Config?.pwa || {}) };
  let bootReady = false;
  let bootTimer = null;

  function on(event, fn) {
    (listeners[event] = listeners[event] || []).push(fn);
    return () => off(event, fn);
  }

  function off(event, fn) {
    listeners[event] = (listeners[event] || []).filter((item) => item !== fn);
  }

  function emit(event, data) {
    (listeners[event] || []).forEach((fn) => {
      try {
        fn(data);
      } catch (error) {
        console.error('[KHub] Event listener failed:', error);
      }
    });
  }

  function configure(overrides = {}) {
    options = {
      ...options,
      ...overrides,
      obsoleteCachePrefixes: Array.isArray(overrides.obsoleteCachePrefixes)
        ? [...overrides.obsoleteCachePrefixes]
        : options.obsoleteCachePrefixes,
    };
    return { ...options };
  }

  function defaultSafeState() {
    if (document.querySelector('.modal-backdrop')) return false;

    const focused = document.activeElement;
    if (focused && ['INPUT', 'TEXTAREA', 'SELECT'].includes(focused.tagName)) return false;

    for (const form of document.querySelectorAll('form')) {
      for (const input of form.querySelectorAll('input, textarea, select')) {
        if (input.value !== input.defaultValue) return false;
      }
    }

    return true;
  }

  function isSafeToReload() {
    if (!defaultSafeState()) return false;
    return typeof options.isSafeToReload !== 'function' || options.isSafeToReload() !== false;
  }

  function defaultHealthCheck() {
    const root = document.querySelector(options.appRootSelector);
    return Boolean(root && root.childElementCount > 0);
  }

  function isAppHealthy() {
    return typeof options.isAppHealthy === 'function'
      ? options.isAppHealthy() !== false
      : defaultHealthCheck();
  }

  function t(key, fallback) {
    const translated = window.KHub?.I18n?.t?.(key);
    return translated && translated !== key ? translated : fallback;
  }

  function showRecovery(reason) {
    if (document.getElementById('sw-recovery')) return;

    const panel = document.createElement('section');
    panel.id = 'sw-recovery';
    panel.className = 'sw-recovery';
    panel.setAttribute('role', 'alert');
    panel.setAttribute('aria-live', 'assertive');
    panel.tabIndex = -1;

    const heading = document.createElement('h2');
    heading.textContent = t('recoveryTitle', 'App repair available');
    const message = document.createElement('p');
    message.textContent = t(
      'recoveryMessage',
      'The app shell did not finish loading. Repair clears only this app’s cached shell and service worker, then reloads.'
    );
    const detail = document.createElement('p');
    detail.className = 'sw-recovery-detail';
    detail.textContent = reason;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-danger';
    button.textContent = t('repairApp', 'Repair app');
    button.addEventListener('click', () => SW.repair());

    panel.append(heading, message, detail, button);
    (document.querySelector(options.appRootSelector) || document.body).prepend(panel);
    panel.focus();
    window.KHub?.A11y?.announce?.(heading.textContent + '. ' + message.textContent, 'assertive');
    emit('sw:broken-shell', { reason });
  }

  function startBootWatchdog() {
    window.addEventListener(
      'error',
      (event) => {
        const target = event.target;
        if (target && target !== window && ['SCRIPT', 'LINK'].includes(target.tagName)) {
          showRecovery(t('recoveryResourceFailure', 'A required app resource failed to load.'));
        }
      },
      true
    );

    bootTimer = setTimeout(() => {
      if (!bootReady || !isAppHealthy()) {
        showRecovery(t('recoveryBootTimeout', 'The app did not become ready in time.'));
      }
    }, options.bootTimeoutMs);
  }

  function markAppReady() {
    bootReady = true;
    if (bootTimer) clearTimeout(bootTimer);
    emit('app:ready');
  }

  function ownsCache(key) {
    return (
      key.startsWith(options.cachePrefix) ||
      options.obsoleteCachePrefixes.some((prefix) => key.startsWith(prefix))
    );
  }

  function registrationBelongsToApp(registration) {
    const expected = new URL(options.scope, location.href).href;
    return registration.scope === expected;
  }

  const SW = {
    registration: null,
    _reloading: false,
    _periodicTimer: null,

    configure,
    isSafeToReload,
    isAppHealthy,
    markAppReady,
    ownsCache,
    registrationBelongsToApp,

    async register() {
      if (!('serviceWorker' in navigator)) {
        console.warn('[KHub.SW] Service workers not supported.');
        return null;
      }

      try {
        SW.registration = await navigator.serviceWorker.register(options.swUrl, {
          scope: options.scope,
        });
      } catch (error) {
        console.warn('[KHub.SW] Registration failed:', error);
        emit('sw:registration-error', { error });
        return null;
      }

      SW.registration.addEventListener('updatefound', () => {
        const worker = SW.registration.installing;
        if (!worker) return;
        emit('sw:update-found', { worker });
        worker.addEventListener('statechange', () => {
          if (worker.state !== 'installed' || !navigator.serviceWorker.controller) return;
          emit('sw:update-ready', { safe: isSafeToReload() });
          if (isSafeToReload()) SW.activateAndReload();
          else SW.showUpdateBanner();
        });
      });

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'RELOAD_READY') SW.reloadOnce();
      });

      SW.checkForUpdate();
      SW.schedulePeriodicChecks();
      emit('sw:registered', { registration: SW.registration });
      return SW.registration;
    },

    async checkForUpdate({ force = false } = {}) {
      if (!SW.registration) return false;
      const last = Number.parseInt(localStorage.getItem(options.updateCheckKey) || '0', 10);
      const due = Date.now() - last >= options.updateIntervalMs;
      if (!force && last !== 0 && !due) return false;

      try {
        await SW.registration.update();
        localStorage.setItem(options.updateCheckKey, String(Date.now()));
        emit('sw:update-checked');
        return true;
      } catch (error) {
        console.warn('[KHub.SW] Update check failed:', error);
        emit('sw:update-check-error', { error });
        return false;
      }
    },

    schedulePeriodicChecks() {
      if (SW._periodicTimer) clearInterval(SW._periodicTimer);
      SW._periodicTimer = setInterval(() => SW.checkForUpdate(), options.pollIntervalMs);
    },

    showUpdateBanner() {
      const notice = document.getElementById(options.updateNoticeId);
      if (notice) notice.hidden = false;
    },

    hideUpdateBanner() {
      const notice = document.getElementById(options.updateNoticeId);
      if (notice) notice.hidden = true;
    },

    reloadOnce() {
      if (SW._reloading) return;
      SW._reloading = true;
      location.reload();
    },

    activateAndReload() {
      SW.hideUpdateBanner();
      const waiting = SW.registration?.waiting;
      if (!waiting) return false;
      waiting.postMessage({ type: 'SKIP_WAITING' });
      navigator.serviceWorker.addEventListener('controllerchange', () => SW.reloadOnce(), {
        once: true,
      });
      return true;
    },

    applyUpdate() {
      emit('sw:update-applied');
      return SW.activateAndReload();
    },

    async repair() {
      const approved = window.confirm(
        t(
          'repairConfirm',
          'Repair this app? Its cached shell and service worker will be removed, then the page will reload. Local app data is not deleted.'
        )
      );
      if (!approved) return { repaired: false, reason: 'cancelled' };

      const cacheKeys = 'caches' in window ? await caches.keys() : [];
      const deletedCaches = [];
      for (const key of cacheKeys) {
        if (ownsCache(key) && (await caches.delete(key))) deletedCaches.push(key);
      }

      const registrations = await navigator.serviceWorker.getRegistrations();
      let registrationsRemoved = 0;
      for (const registration of registrations) {
        if (registrationBelongsToApp(registration) && (await registration.unregister())) {
          registrationsRemoved += 1;
        }
      }

      emit('sw:repaired', { deletedCaches: deletedCaches.length, registrationsRemoved });
      const next = new URL(location.href);
      next.searchParams.set('khub-repaired', String(Date.now()));
      location.replace(next.href);
      return { repaired: true, deletedCaches, registrationsRemoved };
    },
  };

  window.KHub = window.KHub || {};
  Object.assign(window.KHub, { on, off, emit, SW });

  document.addEventListener('DOMContentLoaded', () => {
    document
      .getElementById(options.updateButtonId)
      ?.addEventListener('click', () => SW.applyUpdate());
    startBootWatchdog();
    SW.register();
  });
})();
