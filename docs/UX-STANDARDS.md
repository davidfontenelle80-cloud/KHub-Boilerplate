# KHub UX Standards

These standards apply to **every KHub app**, regardless of stack. They are read
alongside `CLAUDE.md` and enforced at ship check. Every new app also declares
an archetype — see `docs/APP-ARCHETYPES.md`. When an existing app violates
a rule here, fixing it is a scoped task — do not silently rewrite apps to comply.

---

## 1. Application modes

KHub supports two modes. Declare the mode in the app's README.

### Vanilla mode (default)

Application UI and logic use HTML, CSS, and vanilla JavaScript on the
`window.KHub` namespace. No framework, no build step.

### Framework-hosted mode

A framework application (e.g., React) mounts inside the KHub shell.
Example: Pipe Bending Calculator.

### Ownership in BOTH modes

**KHub owns** (never reimplement these inside the framework):

- PWA manifest and service-worker registration
- Update handling (safe-reload check, update banner)
- Design tokens (color, radius, spacing, shadow, motion)
- Safe-area behavior (`viewport-fit=cover`, env insets)
- Accessibility infrastructure (live regions, focus management, font scaling)
- Error recovery (error boundary)
- Storage, import, export, and backup contracts

**The framework owns:**

- App screen rendering
- Internal component state
- App-specific routing
- Domain-specific UI components

Do not force vanilla patterns onto a framework-hosted app, and do not
duplicate KHub shell responsibilities inside the framework.

---

## 2. Viewport and zoom (required)

Users must always be able to pinch-zoom and scale text.

- **Prohibited:** `user-scalable=no` and any `maximum-scale` value.
  There is no routine exception. If one is ever genuinely required,
  document the reason in the app README.
- **Required viewport tag:**

  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  ```

- **Inputs:** every input, select, and textarea must have a computed
  font-size of **at least 16px**. Below 16px, iOS Safari auto-zooms on
  focus, which reads as a layout bug during data entry.
- Layouts must remain usable at increased browser zoom and at the
  largest `KHub.A11y` font step (130%).

---

## 3. Navigation classification

Classify **every visible control** as exactly one of:

| Class                  | Meaning                             | Examples                                |
| ---------------------- | ----------------------------------- | --------------------------------------- |
| **Destination**        | A place users routinely go          | Home, Accounts, Calendar                |
| **Primary action**     | The main thing users do on a screen | Start timer, Calculate, Add month       |
| **Utility**            | Occasional maintenance tasks        | Import, Export, Settings, Print, Backup |
| **Destructive action** | Removes or resets data              | Reset, Delete all data                  |

### Rules

- Mobile persistent navigation contains **no more than five destinations**.
- Settings, import, export, backup, print, and reset are utilities or
  actions — they do not get navigation slots unless they are genuinely
  daily destinations for that app.
- Destructive actions never receive the same placement or prominence as
  routine actions, and confirmations name the thing being changed
  (see `CLAUDE.md` labeling rule).
- Do not create a top-level tab merely because a feature has its own screen.

### Example (documentation illustration — Finance Tracker)

Finance Tracker's eight equal-level tabs exceed the limit. The compliant
structure is:

- **Primary destinations:** Home · Accounts · Paycheck · Goals · More
- **Under More:** Cards · Excel Import · Notes · Settings · Backup and restore

---

## 4. Data-safety: import and restore contract

KHub apps store financial, scheduling, ministry, and employment records.
One malformed import or accidental reset can destroy months of data.
Every import or restore flow must follow this sequence:

1. Select file.
2. Validate file structure.
3. Show a preview of affected data and record counts.
4. Identify overwrite, merge, duplicate, and conflict behavior.
5. Create a local pre-import recovery snapshot.
6. Require explicit confirmation.
7. Perform the import.
8. Show a success or failure summary.
9. Offer restoration of the pre-import snapshot.

**Hard rule:** existing user data is never overwritten immediately after
file selection. Steps 2–6 always come first.

---

## 5. Offline dependency rule

KHub apps are installable PWAs; the main task must work offline.

- Every runtime dependency (frameworks, icon fonts, web fonts, SDKs,
  spreadsheet libraries) is either self-hosted and precached, or the app
  demonstrably completes its main task without it.
- A cold offline launch after installation must render the app and allow
  its primary task to complete.
- Provide a fallback font stack — missing network fonts must not block the UI.
- When precache contents change, bump `CACHE_VERSION` in `sw.js` and clean
  up old caches in the `activate` handler, or installed users never receive
  the new assets.

---

## 6. Layout modes

Do not force every app into one maximum width. All layouts stay centered
(per the responsive shell rules in README), but the width matches the work:

| Mode         | Max width | Use for                           |
| ------------ | --------- | --------------------------------- |
| **Compact**  | 680px     | Calculators, focused forms        |
| **Standard** | 960px     | Personal trackers, dashboards     |
| **Wide**     | 1360px    | Schedules, tables, administration |

Set the mode via the `--max-width` token — no raw width values in
component CSS. Declare the layout mode in the app README next to the
archetype.

---

## 7. Save and sync status vocabulary

Apps that persist or sync data use this shared vocabulary for user-facing
status, so the same words mean the same thing in every KHub app:

- **Last saved** (with time)
- **Saving…**
- **Saved locally**
- **Syncing…**
- **Sync failed**
- **Offline**
- **Backup available**
- **Restore available**

Status is never communicated by color alone — pair text with the
`.status-chip` component and the `-soft` tokens. Save/sync status updates
announce through a targeted live region, not an `aria-live` on the app root.
