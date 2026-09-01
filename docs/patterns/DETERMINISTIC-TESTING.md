# Optional Deterministic Real-Source Testing

Calculation-, calendar-, and migration-heavy apps should execute real production source
in tests rather than duplicate formulas. Freeze time explicitly, isolate DOM/storage
adapters, use representative fixtures, and run the suite in CI. Test-only hooks must be
production-inert and documented. Always include boundary dates and browser-like failure
paths that previously regressed.
