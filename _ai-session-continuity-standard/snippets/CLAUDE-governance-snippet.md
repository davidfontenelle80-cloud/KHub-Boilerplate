<!--
  PASTE THIS INTO THE NEW PROJECT'S CLAUDE.md (or AGENTS.md — whatever file the AI reads
  automatically), near the top so it is seen before any work. Delete this comment.
-->

## AI Session Continuity Standard — READ BEFORE YOU TOUCH ANYTHING

Before any other work in this repo, follow the **AI Session Continuity Standard**:

1. Read `.ai/ACTIVE_TASK.md` FIRST — it is the live source of truth for what's in progress.
2. Read `.ai/SESSION_TEMPLATE.md` for the required workflow and `CONTRIBUTING_AI.md` for the rules.
3. Update `.ai/ACTIVE_TASK.md` as you work and LAST before you stop — never leave it stale.

Workflow: `read ACTIVE_TASK.md → read PROJECT_STATUS.md → verify repo matches docs → set IN
PROGRESS → implement → verify → update ACTIVE_TASK.md → mark COMPLETE / BLOCKED / READY FOR
REVIEW → stop`. Workers implement/test/verify/commit/deploy and mark `READY FOR REVIEW` —
they never self-approve. Only the Supervisor fills the Supervisor Review section.
