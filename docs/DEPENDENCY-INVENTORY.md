# Runtime Dependency Inventory

Keep this file aligned with `index.html`, CSS font sources, `manifest.json`, and
`sw.js` whenever an app is generated or dependencies change.

| Dependency             | Exact version     | Source          | License         | Required offline? | Local/precache path                         | Rebuild/update procedure                       |
| ---------------------- | ----------------- | --------------- | --------------- | ----------------- | ------------------------------------------- | ---------------------------------------------- |
| KHub application shell | repository commit | this repository | project license | yes               | HTML/CSS/JS/icon entries in `PRECACHE_URLS` | run tests and ship check; bump `CACHE_VERSION` |

System/browser APIs need no vendored artifact. Add one row for every framework,
compiled bundle, library, icon pack, or custom font. Do not use an unlocked `npx`
command as the only build record; check in a package manifest/lockfile and deterministic
build command when an app has a build step.
