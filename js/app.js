/**
 * KHub application bootstrap and component demonstrations.
 * Service-worker registration/update/recovery lives only in sw-manager.js.
 */
(function () {
  'use strict';

  function init() {
    console.log(`[KHub] ${KHub.Config.appName} v${KHub.Config.version} (${KHub.Config.env})`);
    KHub.I18n.set(KHub.I18n.current);
    wireComponentDemos();
    KHub.SW.markAppReady();
  }

  function wireComponentDemos() {
    const cardContainer = document.getElementById('card-demo');
    if (cardContainer) {
      cardContainer.appendChild(
        KHub.Components.Card.create({
          title: 'Basic Card',
          body: 'This is a reusable card component. Drop any content here.',
        })
      );
      cardContainer.appendChild(
        KHub.Components.Card.create({
          title: 'Card with Footer',
          body: 'Cards support optional footer content.',
          footer: '<button class="btn btn-sm btn-primary">Action</button>',
        })
      );
    }

    const inputContainer = document.getElementById('input-demo');
    if (inputContainer) {
      inputContainer.appendChild(
        KHub.Components.Input.create({
          id: 'demo-text',
          label: 'Text input',
          placeholder: 'Type something…',
          hint: 'This is a helper hint.',
        })
      );
      inputContainer.appendChild(
        KHub.Components.Input.create({
          id: 'demo-email',
          label: 'Email (required)',
          type: 'email',
          required: true,
          validate: (value) =>
            value && !value.includes('@') ? 'Enter a valid email address.' : '',
        })
      );
      inputContainer.appendChild(
        KHub.Components.Input.create({
          id: 'demo-password',
          label: 'Password',
          type: 'password',
          required: true,
          validate: (value) =>
            value && value.length < 8 ? 'Password must be at least 8 characters.' : '',
        })
      );
    }

    const modalHandler = () => {
      const body = document.createElement('p');
      body.textContent = 'This modal traps focus, closes on Escape, and returns focus on close.';
      KHub.Components.Modal.open({
        title: 'Demo Modal',
        body,
        confirmLabel: 'Got it',
        cancelLabel: 'Close',
        onConfirm: () => console.log('[KHub] Modal confirmed.'),
      });
    };

    document.getElementById('open-modal-btn')?.addEventListener('click', modalHandler);
    document.getElementById('demo-modal-btn')?.addEventListener('click', modalHandler);

    const errGroup = document.getElementById('error-demo-group');
    if (errGroup && KHub.Config.isDev) {
      errGroup.hidden = false;
      document.getElementById('trigger-error-btn')?.addEventListener('click', () => {
        throw new Error('Test error from demo button.');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();

// Minimal data-portability example. Import-heavy apps must implement the full
// preview/snapshot/policy/apply/rollback contract in docs/UX-STANDARDS.md.
(function () {
  'use strict';

  const SNAPSHOT_KEY = 'khub-boilerplate:pre-import-snapshot';
  const COLLECTION_POLICIES = Object.freeze({
    preferences: 'replace',
  });

  function currentState() {
    return {
      preferences: {
        theme: localStorage.getItem('khub_theme'),
        lang: localStorage.getItem('khub_lang'),
      },
    };
  }

  function exportState() {
    const blob = new Blob([JSON.stringify(currentState(), null, 2)], { type: 'application/json' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'khub-state.json';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  function previewImport(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Unable to read import file.'));
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('Import root must be an object.');
          }
          const preferences = parsed.preferences || parsed;
          const next = {
            theme: typeof preferences.theme === 'string' ? preferences.theme : null,
            lang: typeof preferences.lang === 'string' ? preferences.lang : null,
          };
          resolve({
            valid: true,
            collections: [
              { name: 'preferences', policy: COLLECTION_POLICIES.preferences, recordCount: 2 },
            ],
            next,
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }

  function applyImport(preview) {
    if (!preview?.valid || !preview.next)
      throw new Error('Apply requires a validated import preview.');
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(currentState()));
    if (preview.next.theme) localStorage.setItem('khub_theme', preview.next.theme);
    if (preview.next.lang) localStorage.setItem('khub_lang', preview.next.lang);
    return { applied: true, policies: COLLECTION_POLICIES };
  }

  function rollbackImport() {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return false;
    const snapshot = JSON.parse(raw);
    const preferences = snapshot.preferences || {};
    if (preferences.theme === null || preferences.theme === undefined)
      localStorage.removeItem('khub_theme');
    else localStorage.setItem('khub_theme', preferences.theme);
    if (preferences.lang === null || preferences.lang === undefined)
      localStorage.removeItem('khub_lang');
    else localStorage.setItem('khub_lang', preferences.lang);
    return true;
  }

  window.KHub = window.KHub || {};
  window.KHub.State = {
    exportState,
    previewImport,
    applyImport,
    rollbackImport,
    policies: COLLECTION_POLICIES,
  };
})();
