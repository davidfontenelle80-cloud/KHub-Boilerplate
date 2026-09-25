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

- **Worker:** Claude acting for Supervisor **David Fontenelle**
- **Model:** Claude Opus 5.5
- **Session started:** 2026-09-25 EDT
- **Supervisor:** David Fontenelle
- **Previous task:** Encoding guard — APPROVED 2026-09-01 (commits `de0e9b8`, `065c20d`).
  Repo matched that record at session start.

## Status

- **Status:** READY FOR REVIEW
- **% complete:** 100% of implementation
- **Confidence:** 95%

## Objective & task

- **Current objective:** Turn the lessons from the 2026-09-25 Ministry Tracker post-change
  sweep into KHub standards, so every app inherits them — including how the sweep itself
  was done.
- **Current task:** Standards docs, ship-check rules with tests, and the starter CSS reset.
  Approved by David 2026-09-25 as proposed: boilerplate only (no roll-out to suite apps
  yet); rule 6 (`[hidden]` reset) FAILS, rule 7 (short dialog sheet) WARNS.
- **Last completed step:** All files written, formatted, and verified (below).

## Background (why)

A sweep of 11 same-day Ministry Tracker commits found, and David approved fixes for:

1. Phone bottom sheets 38px short on the right — `<dialog>` UA `max-width` cap with
   `width:100%` (Ministry v93).
2. Notes tab jumping back to Return Visits — two modules each tracking the active tab (v93).
3. Spanish tab label wrapping (v93).
4. Return Visits header built differently from its sibling tabs (v93).
5. New Return Visit showing the empty action panel (Directions/Call/Log/Share…) above the
   Name/Phone/Address form — `.rv-visit-view{display:flex}` overriding `[hidden]`; plus
   David's requested flow: info first, actions after save, new record opens its card (v94).

Ministry commits: `b81eb72` (v93), `180aa7c` (v94).

## Files changed this session

- `css/main.css` — global `[hidden] { display: none !important; }` in the reset; removed the
  now-redundant `.update-notice[hidden]` / `.error-boundary[hidden]` one-offs.
- `css/components.css` — removed the same two redundant one-offs.
- `scripts/khub-check.mjs` — rule 6: FAIL without a GLOBAL `[hidden]` reset (a scoped
  `.x [hidden]` does not count); rule 7: WARN on a `dialog`/`sheet` rule with `width:100%`
  and no `max-width:100%` (backdrops ignored).
- `tests/ship-check-ui.test.mjs` — 6 tests for rules 6 and 7 (new file).
- `docs/UX-STANDARDS.md` — new §8 "Forms, sheets, and shared UI state": 8.1 hidden wins,
  8.2 full-width phone sheets, 8.3 info-first "New" forms, 8.4 one owner per UI state,
  8.5 sibling tabs share components, 8.6 labels fit in every language.
- `docs/APP-ARCHETYPES.md` — Management archetype: create-flow rule (refs §8.3).
- `docs/patterns/MIGRATIONS.md` — "Order-safe one-time migrations" section.
- `docs/patterns/POST-CHANGE-SWEEP.md` — the repeatable sweep method (scope, static checks,
  risky seams, headless phone smoke test with seed-before-first-load, report-before-fix,
  fix/re-verify/ship with sha-gated atomic commit, feed lessons back) (new file).
- `CLAUDE.md` — §8 summary in the binding UX list; sweep reference; ship-check steps 2–3
  extended (sheet modes + full width; no label wrap in either language).
- `TEST-CHECKLIST.md` — new "Forms, sheets, and shared UI state" section.
- `.ai/ACTIVE_TASK.md` — this tracker.

## Files that MUST NOT change

- Demo app JS, `index.html`, `sw.js`, `manifest.json`, `icons/**`, `firebase/**`
  (the only CSS change is the reset rule and removal of its four duplicates).

## Verification completed

- [x] `node --test tests/*.test.mjs` — 23/23 pass (17 existing + 6 new).
- [x] `node scripts/khub-check.mjs .` — PASS WITH WARNINGS (only the expected
      placeholder-icon warning; new rules pass on the boilerplate).
- [x] Rules validated on real history: Ministry `04973d5` (pre-fix) → rule 6 FAIL +
      rule 7 WARN `.rv-dialog`; Ministry `180aa7c` (fixed) → rule 7 clear, rule 6 still
      FAIL (Ministry only has the dialog-scoped `[hidden]` rule, not the global one).
- [x] Boilerplate loaded headless at 430px: update notice, error boundary and bottom nav
      stay hidden (`display:none`); no page errors.
- [x] `node scripts/check-encoding.mjs .` — clean (73 files).
- [x] Prettier clean on every file touched, except `css/main.css`, which was already
      unformatted on `main` and was left unreformatted to keep this diff minimal.

## Known pre-existing issues (not caused by this change)

- `npm run format:check` fails on `main` (20 files unformatted before this session).
- ESLint reports a parse error on `scripts/khub-check.mjs` (config lacks `sourceType:
module` for `.mjs`); `npm run lint` does not cover `scripts/`.

## Next step if interrupted

Implementation is complete. Awaiting Supervisor review. Optional follow-up (not approved
yet): roll the global `[hidden]` reset into the suite apps — Ministry would currently fail
rule 6.

## Stop condition

Stop once the docs, ship-check rules, tests and CSS reset are committed, checks pass, and
this tracker matches the repo. **Reached.**

## Last updated

- **2026-09-25 EDT** by Claude

---

## Supervisor Review

> **Only the Supervisor (David) edits this section. Workers never self-approve.**

- **Review status:** PENDING
- **Reviewed by:**
- **Reviewed at:**
- **Observations / required changes:**
