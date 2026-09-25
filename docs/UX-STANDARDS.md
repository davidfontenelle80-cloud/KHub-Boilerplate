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

## 2. Viewport and zoom (per-app, owner decision)

KHub apps use responsive layout reflow for phones, tablets, laptops, and
desktops. Pinch zoom is **disabled by default** so accidental gestures do not
distort the installed-app interface.

- **Required default viewport tag:**

  ```html
  <meta
    id="khub-viewport"
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
  />
  ```

- Responsive CSS and breakpoints must remain independent from zoom. Disabling
  pinch zoom must never be used as a substitute for a responsive layout.
- Apps may offer an accessibility option in Settings. Enable it with:

  ```js
  KHub.Config.setPinchZoomEnabled(true);
  ```

  Disable it again with:

  ```js
  KHub.Config.setPinchZoomEnabled(false);
  ```

  The preference is stored per app in `localStorage` and applied at startup.

- Settings copy should clearly explain that enabling pinch zoom can temporarily
  enlarge or shift the interface and that responsive sizing remains automatic.
- **Inputs:** every input, select, and textarea must have a computed font-size
  of **at least 16px**. Below 16px, iOS Safari may auto-zoom on focus even when
  the general interface is designed to remain fixed.
- Layouts must remain usable at the largest `KHub.A11y` font step (130%).
- Zoom behavior is a **per-app owner decision** (David decides). The locked
  default suits installed, phone-first field-use apps; apps where reading-heavy
  content or large-screen/desktop use matters should ship with pinch zoom
  enabled instead.
- **Document each app's zoom choice and the reason in its README.**

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
   Every collection must display exactly one policy in the preview:
   - `replace`: imported collection becomes authoritative.
   - `merge`: combine records using a documented identity key.
   - `preserve-local-fields`: import records while retaining named local-only fields.
   - `reject-on-conflict`: block apply until every conflict is resolved.
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
- Required frameworks, compiled bundles, libraries, icons, and custom fonts are
  same-origin and part of the atomic required-shell precache.
- A cold offline launch **after one successful service-worker installation and
  cache population** must render the app and allow
  its primary task to complete.
- Custom web fonts may be omitted. If used by the offline experience, self-host them,
  use `font-display: swap`, and provide a system fallback stack.
- Record each vendored dependency's exact version, source, license, update procedure,
  and reproducible build inputs in `docs/DEPENDENCY-INVENTORY.md`.
- Network-only dependencies are allowed only when their absence cannot block the
  primary offline task.
- When precache contents change, bump `CACHE_VERSION` in `sw.js` and clean
  up only caches owned by the app's stable unique cache prefix. Historical prefixes
  must be explicitly listed; never delete every origin cache.

Document/navigation failures may use the cached offline document. Failed scripts,
styles, fonts, images, and other assets must receive only their exact cached response
or a network error—never HTML.

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

---

## 8. Forms, sheets, and shared UI state

Learned from the 2026-09-25 Ministry Tracker sweep. Each rule below is a bug
that shipped once; the fix is now the standard.

### 8.1 The `hidden` attribute always wins

A component rule such as `.panel { display: flex }` overrides the browser's
default `[hidden] { display: none }`. JS then sets `el.hidden = true` and the
element stays on screen — in Ministry this showed an empty action panel above
the New Return Visit form.

- The global reset in `css/main.css` contains
  `[hidden] { display: none !important; }`. Keep it in every app.
- Hide and show with the `hidden` attribute, not ad-hoc classes, so this one
  rule covers everything. No per-component `[hidden]` patches.
- `khub-check` **fails** an app without the global rule (a scoped rule like
  `.sheet [hidden]` does not count).

### 8.2 Phone bottom sheets span the full width

Browsers cap `<dialog>` at `max-width: calc(100% - 2em - 6px)`. A sheet set to
`width: 100%` with a bottom-anchored margin therefore stops ~38px short of the
right edge on phones.

```css
@media (max-width: 520px) {
  .app-sheet {
    width: 100%;
    max-width: 100%;
    margin: auto 0 0;
  }
}
```

`khub-check` **warns** on any `dialog`/`sheet` rule with `width: 100%` and no
`max-width: 100%`. Verify at runtime by measuring the open sheet:
`getBoundingClientRect().right === innerWidth`.

### 8.3 Info-first "New" forms

Creating a record is data entry, not action. A "New …" form shows only entry
fields, in this order:

1. Identity (name) — focused on open
2. Contact (phone, then email) — phone marked "Recommended" with a hint that it
   enables Call / Text / WhatsApp after saving
3. Location (address)
4. Schedule (date, time, reminder)
5. Optional details, collapsed
6. Cancel / Save

Actions that need a saved record (Call, Text, Directions, Log, Calendar, Share,
Edit, Delete) never appear in the create form.

- **Save on a new record opens that record's card**, so the actions appear the
  moment the information exists.
- **Save on an edit closes the sheet** and returns to where the person was.
- When one sheet serves new / view / edit modes, switch sections with the
  `hidden` attribute (§8.1) and test all three modes.
- Action buttons whose data is missing stay hidden (no Email button without an
  email); show one "Add phone number to enable Call, Text and WhatsApp" prompt
  instead of dead buttons.

### 8.4 One owner per piece of UI state

When two modules drive the same control (for example a tab bar), exactly one of
them owns the state. Never keep a private "current tab" variable in one module
while another module changes the tabs directly — the copies drift, and the
next re-activation restores the stale value. In Ministry, returning to Notes
jumped back to Return Visits after a notification tap for this reason.

- Either route every change through the owner's `activate()` function, or
- read the state from the DOM (the element with `.is-active` /
  `aria-selected="true"`), which every writer already updates.

### 8.5 Sibling tabs share components

Tabs that sit side by side (Notes / Return Visits / Bible Studies) use the same
header component and the same filter control: title, one-line description,
primary action (below the title on phones), then one segmented filter bar.
Build siblings from shared classes, not per-module look-alikes; a new sibling
adds a variant (for example a 3-column bar) rather than a new style.

### 8.6 Labels fit in every language

Short labels (tabs, segmented filters, chips, buttons) must fit on one line in
every shipped language at 390px width. Spanish runs ~30% longer than English.
Prefer a shorter translation for the control ("Estudios") and keep the full
term in the section heading ("Estudios bíblicos"). Check with the language
toggle on a phone viewport as part of the ship check.
