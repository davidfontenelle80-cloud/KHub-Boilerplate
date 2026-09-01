/**
 * i18n.js — KHub Boilerplate
 * EN/ES language toggle. Persists to localStorage.
 *
 * Usage:
 *   data-i18n="key"           — sets element textContent
 *   data-i18n-aria="key"      — sets element aria-label
 *   data-i18n-placeholder="key" — sets input placeholder
 *   KHub.I18n.set('es')       — switch to Spanish
 *   KHub.I18n.t('key')        — get translated string
 *
 * To add a new string: add the key to BOTH en and es blocks.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'khub_lang';

  const strings = {
    en: {
      // Navigation / shell
      welcome: 'Welcome to KHub',
      welcomeSub: 'Your app starts here.',
      getStarted: 'Get Started',
      appName: 'KHub App',

      // Updates
      updateAvailable: 'Update available —',
      refresh: 'Refresh',

      // Errors
      errorTitle: 'Something went wrong',
      dismiss: 'Dismiss',
      tryAgain: 'Try again',
      errorCaught: 'App error caught',
      errorLabel: 'Error label: ',
      errorWhere: 'Where: ',
      errorHelp: 'Send this label and what you tapped before the error.',
      copyError: 'Copy error',
      copiedShort: 'Copied',
      recoveryTitle: 'App repair available',
      recoveryMessage:
        'The app shell did not finish loading. Repair clears only this app’s cached shell and service worker, then reloads.',
      recoveryResourceFailure: 'A required app resource failed to load.',
      recoveryBootTimeout: 'The app did not become ready in time.',
      repairApp: 'Repair app',
      repairConfirm:
        'Repair this app? Its cached shell and service worker will be removed, then the page will reload. Local app data is not deleted.',

      // Auth
      signIn: 'Sign In',
      signOut: 'Sign Out',
      signInPrompt: 'Sign in to continue',
      email: 'Email address',
      password: 'Password',

      // Accessibility labels
      langToggleToES: 'Switch to Spanish',
      langToggleToEN: 'Switch to English',
      themeToggleDark: 'Switch to dark mode',
      themeToggleLight: 'Switch to light mode',

      // Generic UI
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      close: 'Close',
      loading: 'Loading…',
      noData: 'No data yet.',
    },
    es: {
      // Navigation / shell
      welcome: 'Bienvenido a KHub',
      welcomeSub: 'Tu app comienza aquí.',
      getStarted: 'Comenzar',
      appName: 'KHub App',

      // Updates
      updateAvailable: 'Actualización disponible —',
      refresh: 'Actualizar',

      // Errors
      errorTitle: 'Algo salió mal',
      dismiss: 'Cerrar',
      tryAgain: 'Reintentar',
      errorCaught: 'Se detectó un error en la aplicación',
      errorLabel: 'Etiqueta del error: ',
      errorWhere: 'Ubicación: ',
      errorHelp: 'Envíe esta etiqueta y lo que tocó antes del error.',
      copyError: 'Copiar error',
      copiedShort: 'Copiado',
      recoveryTitle: 'Reparación disponible',
      recoveryMessage:
        'La aplicación no terminó de cargar. La reparación borra solo la caché y el service worker de esta aplicación y luego vuelve a cargar.',
      recoveryResourceFailure: 'No se pudo cargar un recurso necesario.',
      recoveryBootTimeout: 'La aplicación no estuvo lista a tiempo.',
      repairApp: 'Reparar aplicación',
      repairConfirm:
        '¿Reparar esta aplicación? Se eliminarán su caché y service worker y luego se recargará. Los datos locales no se borrarán.',

      // Auth
      signIn: 'Iniciar sesión',
      signOut: 'Cerrar sesión',
      signInPrompt: 'Inicia sesión para continuar',
      email: 'Correo electrónico',
      password: 'Contraseña',

      // Accessibility labels
      langToggleToES: 'Cambiar a español',
      langToggleToEN: 'Cambiar a inglés',
      themeToggleDark: 'Cambiar a modo oscuro',
      themeToggleLight: 'Cambiar a modo claro',

      // Generic UI
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      close: 'Cerrar',
      loading: 'Cargando…',
      noData: 'Sin datos aún.',
    },
  };

  let current = localStorage.getItem(STORAGE_KEY) || 'en';

  /**
   * Apply a language to the entire page.
   * Updates textContent, aria-label, and placeholder on all marked elements.
   */
  function applyLang(lang) {
    if (!strings[lang]) {
      console.warn('[KHub.I18n] Unknown lang:', lang);
      return;
    }
    current = lang;

    // Set <html lang=""> for screen readers
    document.documentElement.lang = lang;

    // Text content
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      if (strings[lang][key] !== undefined) el.textContent = strings[lang][key];
    });

    // aria-label
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.dataset.i18nAria;
      if (strings[lang][key] !== undefined) el.setAttribute('aria-label', strings[lang][key]);
    });

    // placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (strings[lang][key] !== undefined) el.placeholder = strings[lang][key];
    });

    // Update lang toggle button
    const btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.textContent = lang === 'en' ? 'ES' : 'EN';
      btn.setAttribute(
        'aria-label',
        lang === 'en' ? strings.en.langToggleToES : strings.es.langToggleToEN
      );
    }

    localStorage.setItem(STORAGE_KEY, lang);

    // Notify other modules
    if (window.KHub?.emit) window.KHub.emit('lang:change', lang);
  }

  function toggle() {
    applyLang(current === 'en' ? 'es' : 'en');
  }

  /** Get a translated string. Falls back to key if missing. */
  function t(key) {
    return strings[current]?.[key] ?? key;
  }

  window.KHub = window.KHub || {};
  window.KHub.I18n = {
    set: applyLang,
    toggle,
    t,
    get current() {
      return current;
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    applyLang(current);
    document.getElementById('lang-toggle')?.addEventListener('click', toggle);
  });
})();
