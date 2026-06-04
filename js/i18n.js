/**
 * i18n.js — KHub Boilerplate
 * EN/ES language toggle. Persists to localStorage.
 * Usage: add data-i18n="key" to any element.
 * Call KHub.I18n.set('es') or KHub.I18n.set('en').
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'khub_lang';

  const strings = {
    en: {
      welcome:        'Welcome to KHub',
      welcomeSub:     'Your app starts here.',
      getStarted:     'Get Started',
      updateAvailable:'Update available — ',
      refresh:        'Refresh',
      errorTitle:     'Something went wrong',
      dismiss:        'Dismiss',
      signIn:         'Sign In',
      signOut:        'Sign Out',
    },
    es: {
      welcome:        'Bienvenido a KHub',
      welcomeSub:     'Tu app comienza aquí.',
      getStarted:     'Comenzar',
      updateAvailable:'Actualización disponible — ',
      refresh:        'Actualizar',
      errorTitle:     'Algo salió mal',
      dismiss:        'Cerrar',
      signIn:         'Iniciar sesión',
      signOut:        'Cerrar sesión',
    },
  };

  let current = localStorage.getItem(STORAGE_KEY) || 'en';

  function applyLang(lang) {
    current = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (strings[lang] && strings[lang][key]) {
        el.textContent = strings[lang][key];
      }
    });
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'en' ? 'ES' : 'EN';
    localStorage.setItem(STORAGE_KEY, lang);
  }

  function toggle() {
    applyLang(current === 'en' ? 'es' : 'en');
  }

  function t(key) {
    return (strings[current] && strings[current][key]) || key;
  }

  window.KHub = window.KHub || {};
  window.KHub.I18n = { set: applyLang, toggle, t, get current() { return current; } };

  // Wire toggle button
  document.addEventListener('DOMContentLoaded', () => {
    applyLang(current);
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', toggle);
  });
})();
