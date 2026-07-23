# SESSION_TEMPLATE.md — How every AI must run a session

> This file defines the **non-negotiable workflow** for any AI (or human) doing work in
> this repo. It exists so that when one worker stops — out of context, out of budget, or
> interrupted — the next worker can pick up exactly where it left off with **zero lost
> context**. `.ai/ACTIVE_TASK.md` is the live memory; this file is how you use it.

---

## The rule in one line

**Read `ACTIVE_TASK.md` first. Update `ACTIVE_TASK.md` last. No exceptions.**

If you do only one thing right, make it this. A session that changes files but leaves
`ACTIVE_TASK.md` stale is a **failed** session, even if the code is perfect.

---

## Required workflow (in order, no steps skipped)

1. **Read `.ai/ACTIVE_TASK.md`.** Understand the objective, current status, last completed
   step, the "must not change" list, and the "next step if interrupted."
2. **Read the project status doc — `PROJECT_STATUS.md`** (and any README/CLAUDE-equivalent
   governance file this project uses).
3. **Verify the repo matches the docs.** Run `git status`, `git log --oneline -5`, and
   confirm `HEAD` vs `origin`. If reality and the docs disagree, **note the discrepancy in
   `ACTIVE_TASK.md`** before doing anything else, then proceed from reality.
4. **Set Status to `IN PROGRESS`** in `ACTIVE_TASK.md` and record who/what you are (worker
   name + model), the started timestamp, and the objective for this session.
5. **Implement** the current task. Stay inside the "files expected to change" set; never
   touch anything on the "files that MUST NOT change" list without escalating to the
   Supervisor first.
6. **Verify.** Run the checks the task calls for and confirm nothing existing broke. Record
   exactly what you verified in `ACTIVE_TASK.md`.
7. **Update `.ai/ACTIVE_TASK.md`**: last completed step, % complete, verification results,
   outstanding assumptions, confidence, next step if interrupted, and the last-updated
   timestamp.
8. **Set the terminal status** to one of:
   - **`COMPLETE`** — the task is fully done *and* the Supervisor has approved it (see below).
   - **`READY FOR REVIEW`** — implementation is finished but the Supervisor has not approved.
     This is the normal terminal state for a worker. **A worker never marks its own work
     `COMPLETE` and never fills in the Supervisor Review section.**
   - **`BLOCKED`** — you cannot proceed. Say precisely what is blocking and what unblocks it.
9. **Stop** when the stop condition in `ACTIVE_TASK.md` is met. Do not keep going past it.

---

## Resuming someone else's (or your own past) session

You have no memory of the previous session. The file does. So:

- Start at step 1 above — **always**. Do not assume you remember the state.
- Trust `ACTIVE_TASK.md` for intent, but trust `git` for reality. Reconcile, note, proceed.
- Do not re-do completed steps. Do not re-open a decision already recorded as made.
- If the previous worker left `BLOCKED`, resolve the named blocker before continuing.

This is the whole point of the standard: **context loss between sessions is prevented by a
file, not by hoping the next model remembers.**

---

## Status vocabulary

| Status             | Meaning                                                              |
| ------------------ | ------------------------------------------------------------------- |
| `NOT STARTED`      | Task is defined but no work has begun.                              |
| `IN PROGRESS`      | A worker is actively working; set this the moment you begin.        |
| `BLOCKED`          | Work cannot continue until a named blocker is resolved.             |
| `READY FOR REVIEW` | Implementation + verification done; awaiting Supervisor approval.   |
| `COMPLETE`         | Done **and** Supervisor-approved. Only reachable after review.      |

---

## Supervisor Review (Supervisor only)

Every `ACTIVE_TASK.md` ends with a **Supervisor Review** section. Its status is one of:

| Review status                | Meaning                                                        |
| ---------------------------- | -------------------------------------------------------------- |
| `NOT REVIEWED`               | Default. Supervisor has not looked at it yet.                  |
| `APPROVED`                   | Supervisor accepts the work as-is.                             |
| `APPROVED WITH OBSERVATIONS` | Accepted, with notes to address later.                         |
| `REQUIRES CHANGES`           | Not accepted; changes listed must be made and re-reviewed.     |
| `BLOCKED`                    | Supervisor has halted the work; reason given.                  |

**Only the Supervisor writes in that section.** Workers implement, test, verify, commit, and
deploy — but they do **not** approve their own work. See `CONTRIBUTING_AI.md` for the full
Supervisor-vs-Worker responsibility split.
