# CONTRIBUTING_AI.md — Rules for AI contributors

> Read this **after** `.ai/ACTIVE_TASK.md` and `.ai/SESSION_TEMPLATE.md` and **before** you
> change anything. These rules are binding on every AI worker in this repo and in every
> project that adopts the **AI Session Continuity Standard**.

---

## The five non-negotiables

1. **Read `.ai/ACTIVE_TASK.md` before you write any code or docs.** It is the first thing
   you do in a session, every session. No exceptions.
2. **Update `.ai/ACTIVE_TASK.md` before you make changes** — set Status to `IN PROGRESS`
   and record who you are (worker + model), the objective, and the started timestamp — and
   **again as you go** so it always reflects reality.
3. **Update `.ai/ACTIVE_TASK.md` before you end the session** — last completed step,
   verification results, next step if interrupted, confidence, and the terminal status.
4. **Never leave `ACTIVE_TASK.md` stale.** If the file and the repo disagree, that is a bug
   you fix immediately. A stale continuity file defeats the entire standard.
5. **Never claim completion without updating `ACTIVE_TASK.md`,** and never mark work
   `COMPLETE` yourself — that word is reserved for Supervisor-approved work. Your terminal
   status as a worker is normally `READY FOR REVIEW` (or `BLOCKED`).

If you are about to stop and any of the above is undone, you are **not** done. Finish them.

---

## Supervisor vs Worker — who owns what

The standard splits responsibility cleanly. Do not blur the line.

| Area                                   | Owner          |
| -------------------------------------- | -------------- |
| Architecture & system design           | **Supervisor** |
| Task sequencing & planning             | **Supervisor** |
| Approvals & sign-off                   | **Supervisor** |
| Roadmap & prioritization               | **Supervisor** |
| Governance & standards                 | **Supervisor** |
| Implementation (writing the code/docs) | **Worker**     |
| Testing                                | **Worker**     |
| Verification (running the checks)      | **Worker**     |
| Commits                                | **Worker**     |
| Deployment                             | **Worker**     |

**Supervisor:** David Fontenelle. **Workers:** AI sessions (e.g. Claude Code) and any human
doing implementation work under David's direction.

- Workers implement, test, verify, commit, and deploy — then hand off for review.
- Workers **never self-approve**. The Supervisor Review section of `ACTIVE_TASK.md` is the
  Supervisor's alone.
- If a task requires an architecture, sequencing, roadmap, or governance decision, that is
  the Supervisor's call — surface it, don't invent it.

---

## Scope discipline (this repo specifically)

This is the **KHub-Boilerplate**, a **reference-only** repo (see `CLAUDE.md` → "REPO SCOPE").

- **No app code, UI, or business logic** lives here — not even temporarily. Every app gets
  its own repository.
- Contributions here are **governance, standards, tokens, and starter files** only.
- Respect the "files that MUST NOT change" list in `ACTIVE_TASK.md`. To touch anything on
  it, escalate to the Supervisor first.

---

## Session workflow (summary)

The full workflow lives in `.ai/SESSION_TEMPLATE.md`. In brief:

```
read ACTIVE_TASK.md → read PROJECT_STATUS.md (here: README.md + CLAUDE.md)
→ verify repo matches docs → set IN PROGRESS → implement → verify
→ update ACTIVE_TASK.md → mark COMPLETE / BLOCKED / READY FOR REVIEW → stop
```

No step is optional. When in doubt, update `ACTIVE_TASK.md` and ask the Supervisor.
