# AI Session Continuity Standard

> **Status: REQUIRED for all current and future KHub projects.**
> This is the official KHub standard for keeping AI (and human) work continuous across
> sessions. It is owned by the Supervisor (David) and adopted by every project via the
> portable starter kit in this repo.

---

## Why this exists

AI workers have **no memory between sessions**. A session can end mid-task at any moment —
context window fills, a usage limit hits, a run is interrupted. Without a written source of
truth, the next worker starts blind: it re-derives context, repeats finished work, or worse,
contradicts a decision already made. That is how projects drift and break.

The standard fixes this with **one live file per project — `.ai/ACTIVE_TASK.md`** — that is
the **first file every worker reads and the last file every worker updates.** Because the
memory lives in the repo, not in any model, work survives the death of any single session.

---

## What the standard is

| Piece                       | Path                              | Role                                                           |
| --------------------------- | --------------------------------- | -------------------------------------------------------------- |
| Live working memory         | `.ai/ACTIVE_TASK.md`              | The single source of truth for what's happening right now.     |
| Session workflow            | `.ai/SESSION_TEMPLATE.md`         | Exactly how every worker must use `ACTIVE_TASK.md`.            |
| AI contributor rules        | `CONTRIBUTING_AI.md`              | The five non-negotiables + Supervisor/Worker responsibility.  |
| README governance section   | `README.md` (§ AI Session …)      | Makes the standard part of the documented workflow.           |
| Adoption note (this file)   | `docs/AI-SESSION-CONTINUITY-STANDARD.md` | Declares the standard required and points to the kit.  |
| **Portable starter kit**    | `_ai-session-continuity-standard/` | Blank, project-agnostic templates to install anywhere.       |

### The core workflow

```
read ACTIVE_TASK.md → read PROJECT_STATUS.md → verify repo matches docs
→ set IN PROGRESS → implement → verify → update ACTIVE_TASK.md
→ mark COMPLETE / BLOCKED / READY FOR REVIEW → stop
```

### Supervisor vs Worker

- **Workers** (AI sessions, humans doing implementation) own: implementation, testing,
  verification, commits, deployment. They mark work `READY FOR REVIEW` — never `COMPLETE`,
  and never self-approve.
- **Supervisor** (David) owns: architecture, sequencing, planning, approvals, roadmap,
  governance. Only the Supervisor writes the **Supervisor Review** section of
  `ACTIVE_TASK.md`.

Full detail: `CONTRIBUTING_AI.md` and `.ai/SESSION_TEMPLATE.md`.

---

## Adopt it in a new project

Every new KHub project **must** adopt this standard. It takes about a minute:

1. Copy the portable starter kit from `_ai-session-continuity-standard/` into the new repo
   (see that folder's `README.md` for the exact file list and steps).
2. Fill in the project's identity and first task in `.ai/ACTIVE_TASK.md`.
3. Paste the README + `CLAUDE.md` governance snippets from the kit.
4. Follow the workflow from session one.

The starter kit is self-contained and project-agnostic — nothing in it is specific to this
boilerplate, so it drops cleanly into any repo (KHub or otherwise).

---

## Relationship to existing KHub governance

This standard is **additive**. It does not change any build, ship, UX, or Firebase rule in
`CLAUDE.md`, `docs/UX-STANDARDS.md`, `docs/APP-ARCHETYPES.md`, or `SECURITY_FIREBASE.md`. It
sits alongside them and governs **how work is tracked across sessions**, not what the apps do.
