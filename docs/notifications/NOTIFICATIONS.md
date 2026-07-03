# KHub Push Notification System

**Reference implementation: Ministry Tracker v64** — the first KHub app with working closed-app reminders on installed PWAs. This doc explains how the whole system works and exactly how to clone it into a new KHub app. The proven source files are in `reference/` verbatim; do not edit them there — copy them into the new app and rename per the checklist below.

Verified working end to end: real browser subscription, scheduled delivery via cron, closed-app notification on installed PWA, tap-to-open routing to the right screen.

---

## Architecture at a glance

```
+--------------- App (GitHub Pages PWA) ---------------+
|  js/push-config.js   public config (worker URL,      |
|                      VAPID public key, app name)     |
|  js/push.js          window.MinistryPush API:        |
|                      subscribe / syncReminder /      |
|                      clearReminder / sendTestPush /  |
|                      diagnose                        |
|  js/app.js           feature glue: pending-sync      |
|                      resume, reminder UI, test push  |
|  sw.js               'push' -> showNotification,     |
|                      'notificationclick' -> focus/   |
|                      open + route message            |
|  js/sw-register.js   pending-notification-route      |
|                      handling (URL params +          |
|                      sessionStorage + retry loop)    |
+---------------+---------------------------------------+
                | HTTPS JSON (CORS locked to app origin)
+---------------v-------- Cloudflare Worker ------------+
|  worker.js     /api/health, /api/subscribe,           |
|                /api/reminders (POST/DELETE),          |
|                /api/test-push, cron scheduled handler |
|  KV PUSH_STORE subscriptions + reminders +            |
|                per-minute due buckets                 |
|  Secrets       VAPID_PRIVATE_KEY (wrangler secret)    |
+---------------+---------------------------------------+
                | Web Push protocol (VAPID JWT +
                | aes128gcm payload encryption)
        Browser push service (FCM / APNs / Mozilla)
                |
        Device shows notification even with app closed
```

There is no Firebase in the push path. The Worker signs its own VAPID JWTs and encrypts payloads itself (`aes128gcm`) — no third-party push library, no server, no cost beyond the free Cloudflare tier.

---

## The moving parts

### Client

| File | Responsibility |
|---|---|
| `js/push-config.js` | Public-only config object on `window`. Worker URL + VAPID **public** key + app name. Safe to commit. |
| `js/push.js` | Self-contained IIFE, no dependencies. Exposes `window.MinistryPush` (rename per app). Handles permission prompt (with 45s timeout guard), browser subscription creation, stale-key detection and re-subscribe, POSTing subscription/reminders to the Worker, `keepalive` fetches, and a one-shot retry on network aborts. All failures resolve to `{ ok:false, handled:true, ... }` so callers never need try/catch. |
| `sw.js` | Two listeners: `push` (parse payload, `showNotification` with icon/badge/tag/data) and `notificationclick` (focus an existing app window and postMessage a route, or open a new window with route params in the URL). |
| `js/sw-register.js` | On load, reads a pending notification route from URL params (`?screen=...&sourceType=...&sourceId=...`) or sessionStorage, then retries `applyNotificationRoute()` up to 20x until the app's `switchScreen` exists. This is what makes cold-start tap-through land on the right screen. |
| `js/app.js` glue | Before syncing a reminder, write a pending flag to localStorage (`mtPendingReminderSync`); clear it on success. `resumePendingReminderSync()` runs on load and re-syncs if a previous sync was interrupted by an SW-update reload. |

### Worker (`cloudflare/<app>-push/`)

| File | Responsibility |
|---|---|
| `worker.js` | Router + crypto + storage. Signs VAPID JWTs with WebCrypto (ES256, DER-to-raw signature normalization), encrypts payloads per RFC 8291 (`aes128gcm`), stores everything in KV, and processes due reminders each minute from the cron trigger. |
| `wrangler.toml` | Worker name, KV binding `PUSH_STORE`, cron `* * * * *`, public vars (`ALLOWED_ORIGIN`, `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT`). |

### KV data model

| Key | Value |
|---|---|
| `subscription:<id>` | `{ subscription, userAgent, ... }` — `<id>` derived from the endpoint hash |
| `reminder:<subscriptionId>:<sourceType>:<sourceId>` | `{ title, body, fireAt, url, sentAt?, lastError? }` |
| `due:<YYYY-MM-DDTHH:MM>` | list of reminder keys due that minute (bucket index so cron never scans all keys) |

### Worker API

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Config sanity check |
| `POST /api/subscribe` | Store/refresh a browser PushSubscription, returns `subscriptionId` |
| `POST /api/reminders` | Upsert a reminder (`sourceType` + `sourceId` = natural key, so editing a note just overwrites its reminder) |
| `DELETE /api/reminders/:sourceType/:sourceId?subscriptionId=` | Clear a reminder |
| `POST /api/test-push` | Immediate test notification |
| cron (every minute) | `processDueReminders()` — send due pushes, mark `sentAt`, delete dead subscriptions on 404/410, record `lastError` for retries |

---

## End-to-end flows

**Subscribe** — `subscribe()` checks support, asks Notification permission (racing a 45s timeout so an unanswered prompt cannot hang the flow), waits for `serviceWorker.ready`, reuses the existing PushSubscription if its `applicationServerKey` matches the current VAPID public key — otherwise unsubscribes and re-subscribes (this is what fixes "rotated VAPID key" breakage) — POSTs to `/api/subscribe`, and stores the returned `subscriptionId` in localStorage.

**Schedule a reminder** — feature code calls `syncReminder(sourceType, sourceId, title, body, fireAtISO)`. It subscribes first (idempotent), then POSTs the reminder. The Worker writes the reminder record and adds its key to the due-minute bucket.

**Delivery** — the cron fires every minute, reads the current (and adjacent) due buckets, and for each entry: load subscription, sign a VAPID JWT for the endpoint origin, encrypt the payload, POST to the push service. Success stamps `sentAt`; 404/410 deletes the dead subscription and reminder; other errors stamp `lastError` and stay for the next pass.

**Tap-through** — device shows the notification (SW `push` handler). On tap, `notificationclick` looks for an open app window: if found, postMessage a `NOTIFICATION_CLICK_ROUTE` and focus it; if not, `openWindow` with `?screen=...&sourceType=...&sourceId=...#notification`. `sw-register.js` picks the route up either way and retries until the app is ready to switch screens.

**Clear** — deleting/completing the source item calls `clearReminder(sourceType, sourceId)` which issues `DELETE /api/reminders/...`.

---

## Clone checklist for a new app

Copy from `reference/`: `push.js`, `push-config.js` into `js/`; `worker.js`, `wrangler.toml` into `cloudflare/<app>-push/`; paste `sw-push-handlers.js` contents into the app's `sw.js`.

**1. Generate a fresh VAPID keypair per app** (never reuse Ministry Tracker's):

```bash
npx web-push generate-vapid-keys
```

Public key goes in `push-config.js` and `wrangler.toml [vars]`. Private key goes only in `wrangler secret put VAPID_PRIVATE_KEY`. Never in the repo.

**2. Rename in the client files** (find/replace, case-sensitive):

| Ministry Tracker value | Replace with |
|---|---|
| `MINISTRY_TRACKER_PUSH_CONFIG` | `<APP>_PUSH_CONFIG` |
| `MinistryPush` / `MinistryPushDebug` | `<App>Push` / `<App>PushDebug` |
| `[MinistryPush]` log prefix | `[<App>Push]` |
| `ministryPushSubscriptionId` (localStorage) | `<app>PushSubscriptionId` |
| `mtPendingReminderSync` (localStorage) | `<app>PendingReminderSync` |
| `app: 'ministry-tracker'` (API body) | `app: '<app-slug>'` |
| `'ministry-note'` default sourceType | the app's own sourceType |
| `'/ministry-tracker-/'` URL path (sw.js + worker.js payloads) | `'/<repo-name>/'` |
| `screen: 'notes'` route target (sw.js + sw-register.js) | the app's target screen |
| `'Ministry Tracker'` display strings | app display name |

**3. Cloudflare setup** (one time per app):

1. `wrangler.toml`: set `name = "<app>-push"`, your `account_id`, `ALLOWED_ORIGIN = "https://davidfontenelle80-cloud.github.io"`, `VAPID_PUBLIC_KEY`, `VAPID_SUBJECT = "mailto:..."`.
2. Create KV namespace `<app>-push-store`, bind as `PUSH_STORE`, put its id in `wrangler.toml`.
3. `wrangler secret put VAPID_PRIVATE_KEY`.
4. Keep cron `* * * * *`.
5. `wrangler deploy` from the worker folder.
6. Put the deployed `*.workers.dev` URL in `push-config.js`.

**4. Wire the app side:**

- Add `./js/push-config.js` and `./js/push.js` to `PRECACHE_URLS` in sw.js and load both `<script>`s before `app.js`.
- In the feature that owns reminders: call `syncReminder` on save, `clearReminder` on delete/complete, write/clear the pending-sync localStorage flag around the sync, and call your `resumePendingReminderSync()` equivalent on load.
- Give Settings a "Send test notification" button wired to `sendTestPush()` and a diagnostics readout wired to `diagnose()` — these two made every field problem debuggable from the phone.

**5. Verify before calling it done** (the Stage-I gate that caught real bugs):

1. `GET /api/health` returns ok.
2. Real device subscribe — `subscription:` key appears in KV.
3. Test push arrives with app **open**.
4. Test push arrives with app **closed** (installed PWA).
5. Scheduled reminder fires at the chosen minute with the app closed.
6. Tapping the notification opens the app on the right screen, both warm and cold start.
7. Unsubscribed/reinstalled device gets cleaned up (404/410 path) instead of erroring forever.

---

## Hard-won gotchas (all hit for real in Ministry Tracker)

- **SW-update race**: a service-worker update can reload the page mid-sync and abort the fetch ("Load failed"). Fixes baked in: `keepalive: true` on all Worker fetches, a one-shot 3s retry on network aborts in `syncReminder`, and the localStorage pending-sync flag + resume-on-load. Keep all three.
- **Stale subscriptions after key rotation**: an old PushSubscription created with a different VAPID key fails silently. `subscribe()` compares the existing subscription's `applicationServerKey` against the configured public key and re-subscribes when they differ.
- **iOS**: closed-app push only works for an installed PWA (Add to Home Screen, iOS 16.4+), and the permission prompt must come from a user gesture. Never auto-prompt on load.
- **Permission prompt can hang**: some browsers keep `requestPermission()` pending forever if dismissed; the 45s `Promise.race` timeout keeps the UI honest.
- **Cron granularity**: delivery is minute-resolution by design. The due-bucket index (`due:<minute>`) keeps the cron O(due) instead of O(all reminders).
- **DER vs raw ECDSA signatures**: WebCrypto returns raw P-256 signatures on some runtimes and DER on others; `normalizeEcdsaSignature()` in worker.js handles both. Don't remove it.
- **CORS**: `ALLOWED_ORIGIN` is a single origin string. GitHub Pages project sites share the origin `https://<user>.github.io`, so one value covers all apps — the per-app separation is the `app` field and the URL path.

## Security rules

Commit-safe: Worker public URL, VAPID public key, app identifiers. Never commit: VAPID private key, Cloudflare API token, GitHub tokens, real subscription dumps. The private key lives only in Cloudflare secrets.

---

*Source of truth: `github.com/davidfontenelle80-cloud/ministry-tracker-` (js/push.js, js/push-config.js, sw.js, js/sw-register.js, cloudflare/ministry-tracker-push/). Files in `reference/` are verbatim copies from v64.*
