import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function runBrowserFile(relative, extras = {}) {
  const windowEvents = {};
  const window = {
    KHub: {},
    addEventListener(name, fn) {
      windowEvents[name] = fn;
    },
    confirm: () => true,
    ...extras.window,
  };
  window.window = window;
  const document = {
    activeElement: null,
    addEventListener() {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
      style: {},
      children: [],
      setAttribute() {},
      appendChild(child) {
        this.children.push(child);
      },
      append(...children) {
        this.children.push(...children);
      },
      remove() {},
      addEventListener() {},
      querySelectorAll: () => [],
      focus() {},
    }),
    body: { appendChild() {}, prepend() {} },
    ...extras.document,
  };
  const context = {
    window,
    document,
    navigator: { serviceWorker: {}, clipboard: null, ...extras.navigator },
    location: extras.location || { href: 'https://example.test/app/', reload() {}, replace() {} },
    localStorage: extras.localStorage || { getItem: () => null, setItem() {} },
    caches: extras.caches,
    URL,
    console,
    setTimeout: () => 1,
    clearTimeout() {},
    setInterval: () => 1,
    clearInterval() {},
  };
  vm.runInNewContext(fs.readFileSync(new URL(relative, import.meta.url), 'utf8'), context);
  context.windowEvents = windowEvents;
  return context;
}

test('IndexedDB recovery matcher accepts only the approved signature', () => {
  const { window } = runBrowserFile('../js/error-boundary.js');
  const matcher = window.KHub.ErrorBoundary.isRecoverableIndexedDbTransactionError;
  assert.equal(
    matcher('Attempt to get records from database without an in-progress transaction'),
    true
  );
  assert.equal(matcher('IndexedDB transaction failed because the database is corrupt'), false);
  assert.equal(matcher('QuotaExceededError: storage full'), false);
});

test('SW manager cache and registration ownership are app scoped', () => {
  const { window } = runBrowserFile('../js/sw-manager.js');
  window.KHub.SW.configure({
    cachePrefix: 'my-app-',
    obsoleteCachePrefixes: ['old-my-app-'],
    scope: './',
  });
  assert.equal(window.KHub.SW.ownsCache('my-app-v2'), true);
  assert.equal(window.KHub.SW.ownsCache('old-my-app-v1'), true);
  assert.equal(window.KHub.SW.ownsCache('other-app-v4'), false);
  assert.equal(
    window.KHub.SW.registrationBelongsToApp({ scope: 'https://example.test/app/' }),
    true
  );
  assert.equal(
    window.KHub.SW.registrationBelongsToApp({ scope: 'https://example.test/other/' }),
    false
  );
});

test('SW manager supports safe activation and unsafe update banner', () => {
  const notice = { hidden: true };
  const messages = [];
  const { window } = runBrowserFile('../js/sw-manager.js', {
    document: { getElementById: (id) => (id === 'update-notice' ? notice : null) },
    navigator: { serviceWorker: { addEventListener() {} } },
  });
  window.KHub.SW.registration = { waiting: { postMessage: (message) => messages.push(message) } };
  assert.equal(window.KHub.SW.isSafeToReload(), true);
  assert.equal(window.KHub.SW.activateAndReload(), true);
  assert.equal(JSON.stringify(messages), JSON.stringify([{ type: 'SKIP_WAITING' }]));
  window.KHub.SW.showUpdateBanner();
  assert.equal(notice.hidden, false);
});

test('explicit repair deletes only owned caches and matching registration', async () => {
  const deleted = [];
  const unregistered = [];
  let replaced = '';
  const registrations = [
    {
      scope: 'https://example.test/app/',
      unregister: async () => {
        unregistered.push('app');
        return true;
      },
    },
    {
      scope: 'https://example.test/other/',
      unregister: async () => {
        unregistered.push('other');
        return true;
      },
    },
  ];
  const { window } = runBrowserFile('../js/sw-manager.js', {
    window: { caches: {} },
    caches: {
      keys: async () => ['my-app-v1', 'other-v1'],
      delete: async (key) => {
        deleted.push(key);
        return true;
      },
    },
    navigator: {
      serviceWorker: { getRegistrations: async () => registrations, addEventListener() {} },
    },
    location: {
      href: 'https://example.test/app/',
      reload() {},
      replace(value) {
        replaced = value;
      },
    },
  });
  window.KHub.SW.configure({ cachePrefix: 'my-app-', scope: './' });
  const result = await window.KHub.SW.repair();
  assert.deepEqual(deleted, ['my-app-v1']);
  assert.deepEqual(unregistered, ['app']);
  assert.equal(result.repaired, true);
  assert.match(replaced, /khub-repaired=/);
});

test('shared components use safe text construction and persistent error association', () => {
  const modal = fs.readFileSync(new URL('../js/components/modal.js', import.meta.url), 'utf8');
  const input = fs.readFileSync(new URL('../js/components/input.js', import.meta.url), 'utf8');
  assert.match(modal, /heading\.textContent|element\('h2'.*String\(title\)/);
  assert.match(modal, /trustedHtml.*NOT sanitized|Trusted developer markup only; not sanitized/);
  assert.doesNotMatch(input, /labelEl\.innerHTML/);
  assert.match(input, /aria-describedby/);
  assert.match(input, /`\$\{id\}-error`/);
});

test('app.js contains no service-worker registration', () => {
  const source = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /serviceWorker\.register/);
});
