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

- **Worker:** ChatGPT GPT-5.6 Sol acting for Supervisor **David Fontenelle**
- **Session started:** 2026-09-26 EDT
- **Supervisor:** David Fontenelle
- **Branch:** `standards/weekly-build-lessons-2026-09-26`
- **Previous task:** 2026-09-25 Ministry Tracker standards pass is still recorded as
  `READY FOR REVIEW` on `main`. This new task is a direct Supervisor-requested follow-up;
  it does not imply approval of that prior review item.

## Status

- **Status:** READY FOR REVIEW
- **% complete:** 100% of implementation
- **Confidence:** 95%

## Objective & task

- **Current objective:** Fold the remaining lessons from this week's KHub app builds into the
  boilerplate instructions so future apps inherit the fixes before implementation rather than
  discovering them after deployment.
- **Current task:** Standards/documentation only. Add the reusable rules that are still missing:
  build/stabilization gates, responsive tablet navigation, map/location lifecycle and performance,
  resilient spreadsheet schema mapping, local-first sync behavior, installed-PWA visual identity
  verification, and a broader release/device regression matrix.
- **Last completed step:** Standards edits are complete, branch consistency verified, and PR #1
  opened against `main` for Supervisor review.

## Background (why)

This week's app work exposed recurring issues that belong in the platform standard rather than
in one app:

1. Tablet navigation can disappear or become inaccessible when a phone bottom-nav is hidden
   before a tablet/desktop replacement is visible.
2. Map screens become sluggish when the map or all markers are rebuilt during pan/zoom or when
   geocoding runs on every interaction.
3. Rural use cases need a saved pin even when no useful street address exists; raw coordinates
   are implementation data, not normal user-facing content.
4. Spreadsheet imports must adapt to column headers/aliases and sheet names rather than fixed
   row/column positions.
5. Cloud-enabled apps should remain local-first: user saves should complete locally and sync
   separately with visible status and deterministic conflict rules.
6. Installed icons can technically pass manifest checks yet render differently on iOS/Android;
   actual installed visual identity must be verified.
7. A phone-only smoke test is insufficient for apps used on iPad/tablet and desktop.
8. Feature growth should pause at defined stabilization gates so shell/data/device problems are
   fixed before more product features are layered on top.

## Files expected to change

- `docs/UX-STANDARDS.md`
- `docs/patterns/IMPORT-PIPELINE.md`
- `docs/patterns/POST-CHANGE-SWEEP.md`
- `docs/patterns/BUILD-GATES.md` (new)
- `docs/patterns/MAPS-LOCATION.md` (new)
- `TEST-CHECKLIST.md`
- `CLAUDE.md`
- `README.md`
- `.ai/ACTIVE_TASK.md`

## Files that MUST NOT change

- Demo/runtime app code: `index.html`, `js/**`, `css/**`, `sw.js`, `manifest.json`
- `icons/**`, `firebase/**`, environment files, package files, test code, and ship-check code
  unless a later Supervisor instruction explicitly expands scope.

## Verification completed

- [x] Re-fetched every changed Markdown file from the branch after writes.
- [x] Confirmed new pattern docs and referenced standards files exist on the branch.
- [x] Confirmed binding markers appear in UX standards, CLAUDE rules, README, and test checklist.
- [x] Compared `main` to the branch: 9 changed files, all documentation/governance only.
- [x] No runtime JS/CSS, `sw.js`, `manifest.json`, icons, Firebase, packages, test code, or ship-check code changed.
- [x] PR #1 opened: `Harden KHub standards from weekly build lessons`.
- [x] New standards cover build gates, tablet navigation, map lifecycle/performance,
      resilient header-driven imports, local-first sync, installed-PWA identity, and the
      broader device regression matrix.

## Known pre-existing issues

- `npm run format:check` already fails on `main` because multiple files are unformatted.
- ESLint configuration does not fully cover `.mjs` scripts.
- These are out of scope for this documentation-only task.

## Next step if interrupted

Implementation is complete. Await Supervisor review of PR #1. If changes are requested, make
only those scoped revisions on this branch, re-run the same consistency checks, and return to
`READY FOR REVIEW`.

## Stop condition

Stop after the focused standards changes are committed on the branch, verified for consistency,
a PR is opened against `main`, and this tracker is updated to `READY FOR REVIEW`. **Reached.**

## Last updated

- **2026-09-26 EDT** by ChatGPT GPT-5.6 Sol

---

## Supervisor Review

> **Only the Supervisor (David) edits this section. Workers never self-approve.**

- **Review status:** PENDING
- **Reviewed by:**
- **Reviewed at:**
- **Observations / required changes:**
