# ACTIVE_TASK.md — Live Working Memory

> Read this file first and update it last. The repository is the source of truth
> if it differs from this record. See `.ai/SESSION_TEMPLATE.md`.

## Session / worker identity

- **Worker:** Codex acting for Supervisor **David Fontenelle**
- **Model:** GPT-6
- **Session started:** 2026-09-29 EDT
- **Supervisor:** David Fontenelle
- **Previous task:** Ministry UI sweep standards — READY FOR REVIEW, commit `4b8112a`.
  Repo matched that record at the start of this task; no uncommitted changes.

## Status

- **Status:** READY FOR REVIEW
- **% complete:** 100% of the requested documentation change
- **Confidence:** 95% for the documented boundary; no connector implementation or live security test yet

## Objective & task

David requested a KHub boilerplate rule that AI updates stay in each signed-in
account's lane. This is a standards-only change in the reference repository.
It does not enable remote actions in any app.

## Last completed step

Added an optional AI action contract and explicit UID isolation guidance for
server writes, previews, push notifications, and calendar event links. Verified
and committed on branch `docs/ai-owner-isolation` for Supervisor review.

## Files changed this session

- `SECURITY_FIREBASE.md` — owner/app/action isolation, privileged-server boundary,
  calendar and notification isolation, and two-account tampering tests.
- `docs/AI-ACTION-CONTRACT.md` — optional preview/commit contract and acceptance tests.
- `README.md` — entry point to the contract.
- `.ai/ACTIVE_TASK.md` — current handoff record.

## Files that MUST NOT change

Demo app JS, `index.html`, `sw.js`, `manifest.json`, `icons/**`, and `firebase/**`
from the previous task remain untouched.

## Verification completed

- `git diff --check` — pass.
- `node scripts/check-encoding.mjs .` — pass, 74 files.
- `node scripts/khub-check.mjs .` — pass with existing placeholder-icon warning.
- README's relative link resolves to the new doc.
- No runtime or cross-account integration test was claimed; this change is documentation only.

## Next step if interrupted

David reviews the account-isolation standard. Then build and test the Ministry
owner-scoped connector on a separate app branch, including two-account denial,
calendar provider authorization, and real-device readback. Only after app audits
promote proven implementation helpers into KHub.

## Stop condition

Documentation committed, checks recorded, and this tracker accurate; reached.

## Last updated

- **2026-09-29 EDT** by Codex

---

## Supervisor Review

> **Only the Supervisor (David) edits this section. Workers never self-approve.**

- **Review status:** PENDING
- **Reviewed by:**
- **Reviewed at:**
- **Observations / required changes:**
