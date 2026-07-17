# KHub App Archetypes

Every new KHub app declares one archetype in its README. The archetype sets
the default screen order and first-use state — it is a starting template,
not a straitjacket. Deviate when the app's real workflow demands it, and
say why in the app README.

Read alongside `docs/UX-STANDARDS.md` (modes, navigation, layout, data safety).

---

## Screen hierarchy (all archetypes)

Every screen has:

- **One** clear page title
- **One** primary action
- No more than **two** prominent secondary actions
- Visible context (what am I looking at, which period/record/mode)
- Consistent section spacing from the KHub tokens

Do not give every card, tab, metric, or button equal emphasis.

Dashboards must answer, in order: What is happening now? What needs
attention? What should I do next? How am I progressing? Current and
actionable information appears **before** historical or analytical
information.

---

## 1. Task tracker

For time, habit, ministry, overtime, and progress-tracking apps.
Reference: Ministry Tracker, Overtime Tracker.

**Home-screen order:**

1. Current status
2. Main action
3. Today's progress
4. Quick actions
5. Recent activity
6. Longer-term progress

**First-use state:** set the goal or starting balance, then log the first
entry. Example: "Set your monthly goal and log your first entry."

---

## 2. Calculator

For trade tools, estimators, measurements, and conversion apps.
Reference: Pipe Bending Calculator.

**Screen order:**

1. Calculation type
2. Required inputs
3. Calculate action
4. Primary result
5. Supporting measurements
6. Assumptions or warnings
7. Save, favorite, or reset

**First-use state:** pick the calculation type and see the required inputs.
Example: "Select a bend type and conduit size." Field-use apps prefer
larger controls (see UX-STANDARDS accessibility rules).

---

## 3. Management app

For schedules, contacts, records, planning, and administration.
Reference: Talk Arrangements.

**Screen order:**

1. Page title and context
2. Search and filters
3. Primary action
4. Main table or record list
5. Selected-record details
6. Secondary or bulk actions

**First-use state:** create or import the first container of work.
Example: "Add a service year or import an existing schedule."

---

## 4. Financial dashboard

For balances, goals, projections, accounts, and recurring expenses.
Reference: Finance Tracker.

**Screen order:**

1. Data freshness
2. Current financial position
3. Alerts or important changes
4. Upcoming obligations
5. Goals and projections
6. Detailed account navigation

**First-use state:** add the first account or import existing data.
Example: "Add your first account or import a workbook."

---

## First-use rule (all archetypes)

A generic welcome screen is not onboarding. Every major screen defines:

- Its zero-data state
- The first recommended action
- What the screen becomes once data exists
