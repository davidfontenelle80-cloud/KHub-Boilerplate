# KHub Build Gates

Use these gates for every new KHub app and every major feature expansion. The goal is to
catch shell, data, device, and integration problems before additional features make them
more expensive to fix.

A gate is not a calendar milestone. It is a quality condition. Do not move forward while
a required item in the current gate is failing.

---

## Gate 0 — Define the app before coding

Record these decisions in the app README before implementation:

- App archetype and layout mode.
- Phone/tablet/desktop priority.
- Zoom policy and why.
- Primary task and first-use state.
- Local storage key and data ownership.
- Whether the app needs cloud sync, imports, maps/location, notifications, or none of them.
- Offline requirement for the primary task.
- Primary destinations and mobile navigation plan.
- Expected import sources and legacy formats, if any.

If one of these is unknown, mark it explicitly as unresolved instead of allowing the code
to make the decision accidentally.

---

## Gate 1 — Shell first

Before domain features:

- Responsive shell works on phone, tablet, and desktop.
- Destination navigation is always discoverable at every breakpoint.
- Safe-area insets do not cover fixed controls.
- Dark/light, EN/ES, accessibility, error recovery, and service-worker update flow work.
- App identity is customized: title, manifest, theme colors, icons, and repository metadata.
- Installed standalone mode is usable before any feature-specific full-screen surfaces exist.

Do not build a large feature on top of a shell that still has navigation, viewport, or PWA
problems.

---

## Gate 2 — Data contract

Define the data before building several screens around it:

- Canonical record shape and stable identity key.
- Required vs optional fields.
- Storage adapter and version/schema metadata.
- Migration strategy if legacy data exists.
- Import mapping rules if spreadsheets/files are supported.
- Backup/export shape.
- Cloud sync conflict policy if sync is enabled.
- Recovery behavior for failed imports, migrations, and sync.

Rendering code must not become the migration layer. Legacy-field handling belongs in one
bounded adapter or migration path.

---

## Gate 3 — Core workflow

Implement only the shortest complete user journey first:

- Zero-data state.
- Create/import first record.
- View/edit the record.
- Complete the app's main task.
- Persist and reload.
- Exercise the same flow offline when offline operation is required.
- Verify error, empty, loading, and permission-denied states.

Do not add secondary analytics, convenience actions, or deep customization until the core
workflow survives this gate.

---

## Gate 4 — Device stabilization

Run the core workflow on:

- Phone portrait.
- Tablet portrait.
- Tablet landscape.
- Desktop/laptop.
- Installed PWA where the app is intended to be installed.

Also test each responsive breakpoint at one pixel below, at, and one pixel above the
breakpoint. A navigation system may change form, but there must never be a width where both
the old and replacement navigation are hidden.

The first viewport must show the current context and the primary action or primary choices
without requiring a "magic scroll" before controls appear.

---

## Gate 5 — Optional services

Only after Gates 1–4 are stable, add optional platform services:

- Cloud sync/backup.
- Spreadsheet/file import.
- Maps/location.
- Push/local reminders.
- External links or third-party runtime integrations.

Each service follows its own KHub contract. Adding a service must not make the primary task
depend on network availability unless the product is explicitly server-authoritative.

---

## Gate 6 — Release

Before calling a build done:

1. Run the static ship check.
2. Run the Post-Change Sweep.
3. Exercise the release device matrix.
4. Verify cold offline launch after cache population.
5. Verify update-from-prior-version behavior with existing data.
6. Verify installed icon/splash/standalone identity on target platforms when those files changed.
7. Re-run import/migration/sync tests when their schemas changed.
8. Record what was verified in `.ai/ACTIVE_TASK.md`.

A build is not released because the feature works on the developer's desktop. It is released
when the entire user path survives the relevant devices and persistence states.

---

## Feature-freeze rule

When a gate fails, stop adding features that depend on it. Fix the failed layer first.

Examples:

- Tablet navigation broken → do not add another destination.
- Import mapping unstable → do not add another workbook-driven feature.
- Map re-renders during gestures → do not add clustering or more marker types.
- Migration not idempotent → do not add another schema change.

This rule is intentionally strict because layered patches create the most expensive KHub bugs.

---

## Platform-promotion rule

If a bug is in a KHub-owned responsibility or appears in more than one app, treat it as a
platform lesson:

1. Fix the affected app.
2. Add or revise the KHub standard.
3. Add a repeatable test/checklist item.
4. Add a machine check when it can be detected reliably without false positives.
5. Roll the standard into other apps only as an explicitly scoped task.

Do not copy the same patch into several apps and call that standardization.
