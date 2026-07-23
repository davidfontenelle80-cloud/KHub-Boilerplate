# AI Session Continuity Standard — Portable Starter Kit

A self-contained, **project-agnostic** kit that installs the **AI Session Continuity
Standard** into any repository. Nothing here is specific to the KHub-Boilerplate — copy it
into any project (KHub or otherwise) and follow the workflow.

## Why this standard exists

AI workers have **no memory between sessions**. A session can end mid-task at any moment —
context fills, a usage limit hits, a run is interrupted. Without a written source of truth,
the next worker starts blind and repeats or contradicts prior work. This standard fixes that
with **one live file per project — `.ai/ACTIVE_TASK.md`** — that every worker reads first and
updates last, so work survives the end of any single session.

## What's in this kit

```
_ai-session-continuity-standard/
├── README.md                         # ← you are here (how to install)
├── .ai/
│   ├── ACTIVE_TASK.md                # blank live-memory template (placeholders)
│   └── SESSION_TEMPLATE.md           # the required session workflow
├── CONTRIBUTING_AI.md                # AI contributor rules (placeholders)
├── PROJECT_STATUS.md                 # project-wide status template
└── snippets/
    ├── README-governance-snippet.md  # paste into the project README
    └── CLAUDE-governance-snippet.md  # paste into CLAUDE.md / AGENTS.md
```

## How to install this in a new project

1. **Copy the files** into the new repo's root, preserving structure:
   - `.ai/ACTIVE_TASK.md`
   - `.ai/SESSION_TEMPLATE.md`
   - `CONTRIBUTING_AI.md`
   - `PROJECT_STATUS.md`

   > These four (three files + the `.ai/` folder) are the **required** payload every project
   > must copy to adopt the standard.

2. **Paste the governance snippets:**
   - `snippets/README-governance-snippet.md` → into the project's `README.md` (near the top).
   - `snippets/CLAUDE-governance-snippet.md` → into the project's `CLAUDE.md` (or `AGENTS.md`).

   Then delete the `snippets/` folder from the target repo — it's install-time only.

3. **Fill in the placeholders:**
   - In `.ai/ACTIVE_TASK.md`: Session ID (worker + model), started timestamp, objective,
     current task, and the file lists.
   - In `CONTRIBUTING_AI.md` and the README snippet: replace `<SUPERVISOR NAME>` with the
     project's Supervisor.
   - In `PROJECT_STATUS.md`: describe the project, stack, and roadmap.

4. **Follow the workflow from session one** (see `.ai/SESSION_TEMPLATE.md`):

   ```
   read ACTIVE_TASK.md → read PROJECT_STATUS.md → verify repo matches docs
   → set IN PROGRESS → implement → verify → update ACTIVE_TASK.md
   → mark COMPLETE / BLOCKED / READY FOR REVIEW → stop
   ```

## The exact list to copy (required)

| Copy this | To here (new repo) |
| --------- | ------------------ |
| `.ai/ACTIVE_TASK.md`       | `.ai/ACTIVE_TASK.md`       |
| `.ai/SESSION_TEMPLATE.md`  | `.ai/SESSION_TEMPLATE.md`  |
| `CONTRIBUTING_AI.md`       | `CONTRIBUTING_AI.md`       |
| `PROJECT_STATUS.md`        | `PROJECT_STATUS.md`        |
| `snippets/README-governance-snippet.md` | merge into `README.md` |
| `snippets/CLAUDE-governance-snippet.md` | merge into `CLAUDE.md` / `AGENTS.md` |

That's it. One live file, read first and written last, is what keeps work continuous across
every session and every worker.
