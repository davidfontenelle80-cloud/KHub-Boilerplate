import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function loadSw({
  fetchImpl = async () => {
    throw new Error('offline');
  },
  cacheEntries = {},
} = {}) {
  const handlers = {};
  const deleted = [];
  const entries = new Map(Object.entries(cacheEntries));
  const cache = {
    addAll: async () => {},
    put: async (request, response) => entries.set(request.url || request, response),
  };
  const context = {
    URL,
    Response,
    console: { log() {}, error() {} },
    fetch: fetchImpl,
    caches: {
      open: async () => cache,
      match: async (request) => entries.get(request.url || request),
      keys: async () => ['khub-boilerplate-old', 'other-app-v9'],
      delete: async (key) => {
        deleted.push(key);
        return true;
      },
    },
    self: {
      location: { href: 'https://example.test/app/sw.js', origin: 'https://example.test' },
      addEventListener: (name, fn) => {
        handlers[name] = fn;
      },
      skipWaiting: async () => {},
      clients: { claim: async () => {}, matchAll: async () => [] },
    },
  };
  vm.runInNewContext(fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8'), context);
  return { handlers, deleted, cache };
}

function fetchResponse(handler, request) {
  let responsePromise;
  handler({
    request,
    respondWith(value) {
      responsePromise = value;
    },
  });
  return responsePromise;
}

test('failed navigation receives cached offline document', async () => {
  const offline = new Response('<!doctype html><title>Offline</title>', {
    headers: { 'content-type': 'text/html' },
  });
  const { handlers } = loadSw({ cacheEntries: { 'https://example.test/app/index.html': offline } });
  const result = await fetchResponse(handlers.fetch, {
    method: 'GET',
    mode: 'navigate',
    destination: 'document',
    url: 'https://example.test/app/unknown',
  });
  assert.match(await result.text(), /Offline/);
});

test('failed asset receives only its exact cached response, never HTML', async () => {
  const css = new Response('body{}', { headers: { 'content-type': 'text/css' } });
  const html = new Response('<html>wrong</html>', { headers: { 'content-type': 'text/html' } });
  const url = 'https://example.test/app/css/main.css';
  const { handlers } = loadSw({
    cacheEntries: { [url]: css, 'https://example.test/app/index.html': html },
  });
  const result = await fetchResponse(handlers.fetch, {
    method: 'GET',
    mode: 'cors',
    destination: 'style',
    url,
  });
  assert.equal(await result.text(), 'body{}');

  const missingUrl = 'https://example.test/app/js/app.js';
  const missing = await fetchResponse(handlers.fetch, {
    method: 'GET',
    mode: 'cors',
    destination: 'script',
    url: missingUrl,
  });
  assert.equal(missing.type, 'error');
});

test('activation deletes owned old cache and preserves unrelated cache', async () => {
  const { handlers, deleted } = loadSw();
  let activation;
  handlers.activate({
    waitUntil(value) {
      activation = value;
    },
  });
  await activation;
  assert.deepEqual(deleted, ['khub-boilerplate-old']);
});

test('required precache remains atomic when addAll rejects', async () => {
  const { handlers, cache } = loadSw();
  cache.addAll = async () => {
    throw new Error('missing required asset');
  };
  let installation;
  handlers.install({
    waitUntil(value) {
      installation = value;
    },
  });
  await assert.rejects(installation, /missing required asset/);
});
