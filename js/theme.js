/**
 * theme.js — KHub Boilerplate
 * Dark mode toggle. Persists to localStorage.
 * Respects prefers-color-scheme on first load.
 * Sets data-theme="light"|"dark" on <html>.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'khub_theme';

  function getPreferred() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  function toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    apply(current === 'dark' ? 'light' : 'dark');
  }

  // Apply immediately (before DOMContentLoaded) to avoid flash
  apply(getPreferred());

  window.KHub = window.KHub || {};
  window.KHub.Theme = { apply, toggle, get current() { return document.documentElement.getAttribute('data-theme'); } };

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', toggle);
  });
})();
