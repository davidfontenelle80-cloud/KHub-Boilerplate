/**
 * error-boundary.js — KHub Boilerplate
 * Catches uncaught JS errors and unhandled promise rejections.
 * Shows a user-facing message without crashing the whole app.
 * Call KHub.ErrorBoundary.show('message') manually if needed.
 */
(function () {
  'use strict';

  function show(message) {
    const el = document.getElementById('error-boundary');
    const msg = document.getElementById('error-message');
    if (!el || !msg) return;
    msg.textContent = message || KHub.I18n?.t('errorTitle') || 'Something went wrong.';
    el.hidden = false;
    el.focus();
  }

  function dismiss() {
    const el = document.getElementById('error-boundary');
    if (el) el.hidden = true;
  }

  window.addEventListener('error', event => {
    console.error('[KHub] Uncaught error:', event.error);
    show(KHub?.Config?.isDev ? event.message : null);
  });

  window.addEventListener('unhandledrejection', event => {
    console.error('[KHub] Unhandled rejection:', event.reason);
    show(KHub?.Config?.isDev ? String(event.reason) : null);
  });

  window.KHub = window.KHub || {};
  window.KHub.ErrorBoundary = { show, dismiss };
})();
