# Optional Bounded Migration Registry

Existing deployed apps may use a versioned registry. New apps without legacy data do
not need runtime migration machinery.

Each migration declares source and target versions, validates input, creates a recovery
snapshot, is idempotent, and either commits the fully validated result or leaves the
prior state untouched. Keep migrations bounded; document when obsolete paths can be
retired. Never scatter legacy field checks throughout rendering code.
