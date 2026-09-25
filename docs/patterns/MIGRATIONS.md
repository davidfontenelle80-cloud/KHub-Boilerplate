# Optional Bounded Migration Registry

Existing deployed apps may use a versioned registry. New apps without legacy data do
not need runtime migration machinery.

Each migration declares source and target versions, validates input, creates a recovery
snapshot, is idempotent, and either commits the fully validated result or leaves the
prior state untouched. Keep migrations bounded; document when obsolete paths can be
retired. Never scatter legacy field checks throughout rendering code.

## Order-safe one-time migrations

Learned from the Ministry Tracker organizer migration (2026-09-25), where old Bible
Study notes had to become Bible Study records while another module was already
normalizing the same notes.

- **Snapshot the persisted source first.** Read the original data straight from
  storage when the migration file loads, before any module can normalize and save
  over the legacy fields it needs.
- **Guard with a done-flag in state** (for example `organizerMigrationV1: true`) and
  make the body idempotent: stable derived IDs (`bs-migrated-<oldId>`), skip records
  that already exist, and remove the old copies by original ID.
- **Do not rely on script order for dynamically injected scripts.** A script
  appended with `async = false` runs in order only relative to other injected
  scripts, not relative to parser-inserted `<script>` tags. Wait for the state you
  need (poll for `state`/`saveState`) instead of assuming it is there.
- **Clean up side effects** of the old shape (for example cancel reminders that were
  scheduled under the old record type).
- **Test with legacy data seeded before first load.** Seeding after the app has
  loaded once tests nothing, because the done-flag is already set. See
  `POST-CHANGE-SWEEP.md`.
