# Service Worker Safety and Shipping Guide

Give every app a stable unique `CACHE_PREFIX` in `sw.js` and matching PWA values in
`js/config.js`. Activation and explicit repair may delete only that prefix plus explicit
historical prefixes owned by the same app. Never delete every origin cache.

Use one `CACHE_VERSION` per complete required shell. Changes to shell files require a
version bump. Required assets use atomic `cache.addAll`; a failed install must leave the
prior worker active.

- Intercept only same-origin GET requests.
- Failed navigation/documents may use cached `index.html`.
- Failed scripts, styles, fonts, images, and other assets receive only an exact cached
  response or an error—never HTML.
- Do not use blanket `ignoreSearch` or partial required-shell installation.
- Keep one `sw-manager.js`; apps parameterize hooks instead of registering another SW.
- Reload immediately only when generic checks and the app hook report a safe state.
- Broken-shell repair is accessible, confirmed by the user, and removes only app-owned
  caches and the configured app-scope registration. It does not erase app data.

Maintain `docs/DEPENDENCY-INVENTORY.md`. Required runtimes/assets are same-origin and
precached. Cold-offline means after one successful SW installation/cache population.

Before commit, test document and asset failures separately, unrelated-cache survival,
atomic install rejection, safe/unsafe updates, `SKIP_WAITING`/`RELOAD_READY`, health
detection, scoped repair, and dependency/precache consistency. After an authorized deploy,
inspect the published SW version/scope and controlled page, then repeat cold-offline and
failed-asset checks. A successful HTML response alone is not deployment proof.

Common regressions: orphan workers, HTML returned for JS, broad cache deletion, duplicate
registrars, partial shell activation, stale versions, CDN-only critical assets, and repair
that unregisters another app.
