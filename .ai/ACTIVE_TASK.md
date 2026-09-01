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

- **Worker:** Claude (Cowork) acting for Supervisor **David Fontenelle**
- **Model:** Claude Opus 4.8
- **Session started:** 2026-09-01 EDT
- **Supervisor:** David Fontenelle

## Status

- **Status:** APPROVED
- **% complete:** 100% of implementation; CI will exercise it on the next push/PR
- **Confidence:** 95%

## Objective & task

- **Current objective:** Prevent the double-encoded-UTF-8 (mojibake) class of bug from ever reaching a KHub app again, and give every app a build-time guard against it.
- **Current task:** Add a zero-dependency encoding guard to the boilerplate, wire it into the npm `check` and test suite, and add a GitHub Actions workflow. This is infra/tooling only — no demo app code touched.
- **Last completed step:** Added `scripts/check-encoding.mjs`, `tests/encoding.test.mjs`, `.github/workflows/encoding-check.yml`, and a `check:encoding` npm script folded into `check`. Verified clean on the whole repo (71 files) and all 17 tests pass.

## Background (why)

On 2026-09-01, `Talk-Arrangements-Public/js/app.js` was found to be double-encoded UTF-8: original UTF-8 bytes had been decoded as Latin-1 and re-saved, corrupting event-type emoji, box-drawing comment dividers, check/warning glyphs, and Spanish accents. It surfaced as garbled orange text in the running app. A sweep of the suite found the same corruption in `note-clip` (`js/notes.js`, `settings.js`, `theme.js`) and one `ministry-tracker-` docs file. All were fixed. This guard exists so the regression is caught mechanically, not by eye.

## Files changed this session

- `scripts/check-encoding.mjs` — reusable, dependency-free scanner that flags C1 control code points (U+0080–U+009F) and U+FFFD, the reliable signatures of double-encoded UTF-8. Runs as `node scripts/check-encoding.mjs .`
- `tests/encoding.test.mjs` — asserts the repo is clean and that the scanner detects mojibake and the replacement character (samples built from escapes so this file stays clean).
- `.github/workflows/encoding-check.yml` — CI that runs the scanner on push/PR/dispatch, on bare node (no install), so it drops into any app repo.
- `package.json` — added `check:encoding` and folded it into `check`.
- `.ai/ACTIVE_TASK.md` — this tracker update.

## Files that MUST NOT change

- Application demo source: `js/**`, `css/**`, `index.html`, `sw.js`, `manifest.json`, `icons/**`, `firebase/**`
- Existing governance, templates, UX standards, and the `khub-check.mjs` ship check

## Next step if interrupted

Implementation is committed. Confirm the encoding-check workflow runs green on the next push. The same guard (`scripts/check-encoding.mjs` + `.github/workflows/encoding-check.yml`) is being rolled out to the suite apps (Talk-Arrangements-Public, note-clip, ministry-tracker-, Overtime-Tracker-).

## Stop condition

Stop once the guard script, its test, the CI workflow, and the npm wiring are committed, the repo scan is clean, and this tracker matches the repo. **Reached.**

## Verification completed

- [x] `node scripts/check-encoding.mjs .` reports clean on the full repo.
- [x] `node --test tests/*.test.mjs` passes (17/17), including the new encoding tests.
- [x] Scanner flags C1 control code points and U+FFFD; ignores legit emoji/accents.
- [x] Guard runs with zero dependencies (works in app repos without package.json).
- [x] No demo app source changed.

## Last updated

- **2026-09-01 EDT** by Claude (Cowork)

---

## Supervisor Review

> **Only the Supervisor (David) edits this section. Workers never self-approve.**

- **Review status:** APPROVED
- **Reviewed by:** David Fontenelle (Supervisor)
- **Reviewed at:** 2026-09-01 EDT
- **Observations / required changes:** Approved. Zero-dependency encoding guard, its test, the CI workflow, and npm wiring are in; encoding regressions now fail the build. Same guard rolled out to all four suite apps. No demo app source touched.
