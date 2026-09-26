# Optional Import-Heavy Application Scaffold

Use this staged pipeline when imports are a major app feature:

`parse → identify source shape → map fields → validate/reconcile → preview policies and counts → recovery snapshot → explicit apply → result summary → rollback`

Parsing and preview must not mutate live state. Separate blocking validation errors from
warnings; warnings may be acknowledged only when application policy explicitly permits
it. Show each collection's `replace`, `merge`, `preserve-local-fields`, or
`reject-on-conflict` policy before confirmation. Apply atomically where the storage layer
supports it and retain the snapshot until the result is accepted.

---

## Header-driven mapping

Spreadsheet imports must recognize data by meaning, not by a hard-coded cell address.

For every imported collection:

1. Discover candidate sheets/tables.
2. Normalize headers deterministically: trim, collapse repeated whitespace, compare
   case-insensitively, and strip harmless punctuation only when the adapter documents it.
3. Map source columns to canonical fields using this precedence:
   - exact canonical header,
   - documented alias,
   - explicitly versioned legacy adapter,
   - user-confirmed manual mapping.
4. Never silently fuzzy-match an ambiguous header.
5. Show the resolved mapping in the preview before Apply.

Example:

| Source header | Canonical field | Result |
| --- | --- | --- |
| Account | accountName | exact |
| Current Balance | balance | alias |
| Due | dueDate | alias |
| Notes From Old File | — | skipped with warning |

A reordered workbook must import the same data. Adding an unrelated column must not shift the
meaning of any other column.

---

## Required, optional, unknown, and duplicate data

- Missing **required** fields block the import.
- Missing **optional** fields produce a warning and use the documented default.
- Unknown columns are ignored or preserved only when the adapter explicitly supports them;
  they are never allowed to shift positional parsing.
- Blank rows are skipped.
- Duplicate detection uses the collection's documented identity key, not row number.
- Re-importing the same source must be deterministic and follow the declared merge/replace policy.

If a workbook contains several plausible sheets, do not guess silently. Select by a documented
sheet signature or ask the user to choose.

---

## Legacy workbook adapters

A legacy format may use fixed ranges internally, but only inside a named, versioned adapter with
a positive signature that proves the format is the one expected.

Bad pattern:

`Accounts always start at B7 and credit cards always start at H12.`

Acceptable pattern:

`legacyBudgetV6` first verifies the known sheet names/header signature, then reads the legacy
ranges. If the signature is absent, the adapter does not run.

Do not spread legacy row/column checks throughout application logic.

---

## Preview requirements

Before confirmation, show:

- source file and detected source type/version,
- sheet/table chosen for each collection,
- source-column → canonical-field mapping,
- imported/skipped/error record counts,
- conflict and duplicate counts,
- policy for each collection,
- fields that will be preserved locally,
- warnings for unknown/ignored columns.

The user should be able to tell *why* the importer believes a column is "balance" before any
live state changes.

---

## Import verification matrix

Test at least these source variations:

- columns in the expected order,
- same columns reordered,
- extra unrelated columns,
- a documented alias instead of the canonical header,
- missing optional column,
- missing required column,
- extra/renamed sheet,
- blank rows between records,
- duplicate records,
- the oldest still-supported legacy format.

For financial imports, verify each account/card collection independently. A successful import of
one collection must not hide a failure to discover another.
