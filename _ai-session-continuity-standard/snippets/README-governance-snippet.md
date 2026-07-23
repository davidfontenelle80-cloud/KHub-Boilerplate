<!--
  PASTE THIS INTO THE NEW PROJECT'S README.md (near the top, after the intro).
  Replace <SUPERVISOR NAME> with the project's Supervisor. Delete this comment.
-->

## AI Session Continuity Standard (required workflow)

This project follows the **AI Session Continuity Standard** so that work never gets lost when
an AI session ends (context runs out, a usage limit hits, or a run is interrupted). One live
file is the **first thing every worker reads and the last thing every worker updates**:

| File                          | Role                                                              |
| ----------------------------- | ----------------------------------------------------------------- |
| `.ai/ACTIVE_TASK.md`          | Live working memory — the single source of truth, right now.      |
| `.ai/SESSION_TEMPLATE.md`     | Exactly how every worker must use `ACTIVE_TASK.md`.               |
| `CONTRIBUTING_AI.md`          | The five non-negotiables + Supervisor/Worker responsibility split.|
| `PROJECT_STATUS.md`           | Project-wide status & orientation.                                |

**Workflow (no step optional):**

```
read ACTIVE_TASK.md → read PROJECT_STATUS.md → verify repo matches docs
→ set IN PROGRESS → implement → verify → update ACTIVE_TASK.md
→ mark COMPLETE / BLOCKED / READY FOR REVIEW → stop
```

**Why it matters:** an AI worker has no memory between sessions. Because the state lives in
`.ai/ACTIVE_TASK.md` in the repo, the *next* worker resumes exactly where the last one
stopped — no re-derived context, no repeated work, no contradicted decisions.

**Supervisor vs Worker:** **Workers** (AI sessions + humans implementing) own implementation,
testing, verification, commits, and deployment — they mark work `READY FOR REVIEW` and
**never self-approve**. The **Supervisor** (`<SUPERVISOR NAME>`) owns architecture,
sequencing, planning, approvals, roadmap, and governance, and is the only one who writes the
**Supervisor Review** section of `ACTIVE_TASK.md`.
