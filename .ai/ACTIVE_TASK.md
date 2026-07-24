# ACTIVE_TASK.md — Live Working Memory

> **This is the single source of truth for what is happening in this repo right now.**
> It is the **FIRST** file every AI worker reads at the start of a session and the
> **LAST** file every AI worker updates before stopping. Never leave it stale.
> If this file and the repo disagree, the repo is reality — reconcile and note it here.
>
> New here? Read `.ai/SESSION_TEMPLATE.md` for the required workflow, then
> `CONTRIBUTING_AI.md` for the rules. Do not skip either.

---

## Session / worker identity

- **Worker:** ChatGPT acting for Supervisor **David Fontenelle**
- **Model:** GPT-5.6 Thinking
- **Session started:** 2026-07-24 EDT
- **Supervisor:** David Fontenelle

## Status

- **Status:** READY FOR REVIEW
- **% complete:** 100% of implementation; real-device verification remains a deployment approval gate
- **Confidence:** 90%

## Objective & task

- **Current objective:** Make a device-specific push-notification ON/OFF control mandatory and reusable for future notification-enabled KHub apps.
- **Current task:** Add the generic reference module and the implementation/verification standard without modifying the active boilerplate demo application.
- **Last completed step:** Added `docs/notifications/reference/push-toggle.js` and its required integration guide. The pattern unsubscribes only the current browser/device, clears only its local subscription ID, creates a fresh subscription when turned back on, and preserves separate Test and Diagnostics actions.

## Files changed this session

- `docs/notifications/reference/push-toggle.js` — reusable configurable ON/OFF module
- `docs/notifications/reference/README.md` — required behavior, integration steps, status codes, and real-device verification gate
- `.ai/ACTIVE_TASK.md` — tracker reconciliation

## Files that MUST NOT change

- Application demo source: `js/**`, `css/**`, `index.html`, `sw.js`, `manifest.json`, `icons/**`, `firebase/**`
- Existing notification transport reference files and Cloudflare Worker implementation
- Unrelated governance, templates, and UX standards

## Previous approved stage

- AI Session Continuity Standard governance package: **APPROVED** by Supervisor for the next authorized stage.

## Next step if interrupted

Implementation is committed. Verify the two new reference files and confirm the repository head contains the tracker update. Do not add another notification architecture or modify the demo app. The next meaningful action is to validate the corresponding Ministry Tracker implementation on real iPhone/iPad devices, then revise the reference only if that real-device test exposes a defect.

## Stop condition

Stop once the reusable module, required integration instructions, standard status codes, device-isolation rule, and verification matrix are committed and this tracker matches the repo. **Reached.**

## Verification completed

- [x] OFF targets only the current browser PushSubscription.
- [x] ON first removes any stale browser subscription and then calls the configured app push API's `subscribe()`.
- [x] Local storage key is configurable per app.
- [x] Test notification remains a separate action.
- [x] Diagnostics remain available through an app callback or `diagnose()` fallback.
- [x] Stable status codes document permission/subscription state.
- [x] English and Spanish labels are included.
- [x] No secrets, VAPID keys, Worker URLs, or production subscription data were added.
- [x] No KHub demo application source was changed.

## Outstanding assumptions / deployment gate

1. Each generated app must configure `KHUB_PUSH_TOGGLE_CONFIG` with its own API name, card ID, and localStorage key.
2. Each app must copy the module into `js/`, load it after configuring it, add it to the service-worker precache, and bump the cache version.
3. Live approval requires a real-device matrix proving that toggling one device does not affect another device using the same account.
4. Server-side stale records may remain until the push provider returns 404/410 unless an app adds an explicit server unsubscribe endpoint; they cannot continue delivering after the browser subscription is invalidated.

## Last updated

- **2026-07-24 EDT** by ChatGPT (GPT-5.6 Thinking)

---

## Supervisor Review

> **Only the Supervisor (David) edits this section. Workers never self-approve.**

- **Review status:** NOT REVIEWED
- **Reviewed by:**
- **Reviewed at:**
- **Observations / required changes:**
