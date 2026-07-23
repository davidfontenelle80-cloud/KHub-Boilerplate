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

- **Worker (WHO started it):** Claude Code (AI worker) acting for Supervisor **David Fontenelle**
- **Model:** claude-opus-4-8 (Claude Opus 4.8)
- **Session started:** 2026-07-23 09:47 EDT
- **Supervisor:** David Fontenelle (the only person who approves — see Supervisor Review below)

## Status

- **Status:** READY FOR REVIEW
- **% complete:** 100% of implementation (awaiting Supervisor approval — a worker never self-approves)
- **Confidence:** 95%

## Objective & task

- **Current objective:** Establish the **AI Session Continuity Standard** in this
  boilerplate — governance/documentation only, no app code — and package it as a
  portable, project-agnostic starter kit that all future KHub projects adopt.
- **Current task:** Author the standard's files, wire them into existing governance
  (`README.md`, `CLAUDE.md`), and ship a self-contained starter kit plus an adoption note.
- **Last completed step:** Created every governance file, the portable starter kit under
  `_ai-session-continuity-standard/`, and the adoption note `docs/AI-SESSION-CONTINUITY-STANDARD.md`;
  verified internal links and consistency; committed and pushed to `origin/main`.

## Files expected to change (this session)

- `.ai/ACTIVE_TASK.md` (this file — new)
- `.ai/SESSION_TEMPLATE.md` (new)
- `CONTRIBUTING_AI.md` (new)
- `README.md` (add "AI Session Continuity Standard" governance section)
- `CLAUDE.md` (add pointer so every worker is routed to the standard)
- `docs/AI-SESSION-CONTINUITY-STANDARD.md` (new — adoption note)
- `_ai-session-continuity-standard/**` (new — portable starter kit)

## Files that MUST NOT change

- Any application source: `js/**`, `css/**`, `index.html`, `sw.js`, `manifest.json`,
  `icons/**`, `firebase/**`, `scripts/**`, `package.json`, `.env.*`, lint/format configs.
- Existing docs' technical content: `docs/UX-STANDARDS.md`, `docs/APP-ARCHETYPES.md`,
  `docs/notifications/**`, `docs/firebase/**`, `SECURITY_FIREBASE.md`, `TEST-CHECKLIST.md`.
  (This is a **reference-only** repo — governance is additive; no app/business logic here.)

## Next step if interrupted

Implementation is complete and pushed. The only remaining step is **Supervisor review**
by David. If resuming as a worker: re-read this file top to bottom, run
`git status` (expect clean) and `git log --oneline -1` (expect the continuity-standard
commit), confirm `HEAD == origin/main`, and do **not** re-implement — wait for the
Supervisor Review section below to be filled in.

## Stop condition

Stop once all continuity-standard files exist, links/consistency are verified, the docs
commit is pushed, the working tree is clean, and `HEAD == origin/main`. Then hand off to
the Supervisor. **Reached.**

## Verification completed

- [x] All new internal links resolve (relative paths checked against tracked files).
- [x] No existing governance rule contradicted; additions only.
- [x] No app code, UI, or business logic added (reference-only rule honored).
- [x] Responsibility split (Supervisor vs Worker) stated once and not duplicated.
- [x] `git status` clean; `HEAD == origin/main` after push.

## Outstanding assumptions

1. `PROJECT_STATUS.md` is the conventional per-project status file the workflow points to.
   This reference repo has no app to track, so `README.md` + `CLAUDE.md` serve that role
   here; the starter kit ships a `PROJECT_STATUS.md` template for real projects.
2. Terminal worker status is **READY FOR REVIEW** (not COMPLETE) because governance
   requires Supervisor approval and workers never self-approve.

## Last updated

- **2026-07-23 09:47 EDT** by Claude Code (claude-opus-4-8)

---

## Supervisor Review

> **Only the Supervisor (David) edits this section. Workers never self-approve.**

- **Review status:** NOT REVIEWED
  <!-- One of: NOT REVIEWED / APPROVED / APPROVED WITH OBSERVATIONS / REQUIRES CHANGES / BLOCKED -->
- **Reviewed by:**
- **Reviewed at:**
- **Observations / required changes:**
