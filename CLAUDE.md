# Build and Ship Rules for This App

## REPO SCOPE — READ FIRST
This repo is REFERENCE ONLY: the instructions, format, tokens, and starter files for building KHub apps.
- NEVER build, prototype, or store an app inside this repo. Not even "temporarily."
- Every app gets its OWN repository. To start one: create a new repo, copy the boilerplate files into it, then build there.
- No app folders live here. Example: Aurum Voice was moved to its own repo (davidfontenelle80-cloud/aurum-voice).
- If asked to add app code here, stop and point to this rule instead.

This file is read automatically when working in this repo. Honor it on every change.

## UX standards (docs/UX-STANDARDS.md) — binding on every KHub app
- Two supported modes: vanilla, or framework-hosted inside the KHub shell. KHub owns the
  shell (PWA, updates, tokens, safe-area, a11y, error recovery, storage/backup contracts)
  in BOTH modes. Never force vanilla patterns onto a framework-hosted app.
- Viewport: NEVER `user-scalable=no` or any `maximum-scale`. All inputs ≥16px font-size.
- Navigation: classify every control (Destination / Primary action / Utility / Destructive).
  Max five destinations in mobile persistent navigation. Utilities don't get nav slots.
- Imports/restores follow the 9-step contract — never overwrite data right after file selection.
- Offline: runtime dependencies are precached or self-hosted; cold offline launch must
  complete the app's main task; bump `CACHE_VERSION` when precache contents change.
- Every new app declares an archetype (docs/APP-ARCHETYPES.md: task tracker, calculator,
  management, financial dashboard) and a layout mode (compact 680 / standard 960 / wide 1360
  via the --max-width token). Follow the archetype's screen order and first-use state.
- One page title and one primary action per screen; max two prominent secondary actions.
- Save/sync status uses the shared vocabulary in UX-STANDARDS §7, shown as text + chip,
  never color alone, announced via a targeted live region.

## House finish (from KHub-Boilerplate)
- Dark theme by default, light theme on toggle. Both must work.
- All color, radius, spacing, shadow, and motion come from the KHub tokens. No raw values
  in component CSS.
- No sharp corners. Radius comes from the scale: sm 10, md 16, lg 22, xl 28, full.
- Press-scale, spring transitions, glow on the primary action, monospace tabular numbers.
- Status surfaces use the soft wash pattern: soft token background at 15 percent,
  soft border at 40 percent, full-strength accent text. Use the .alert and .status-chip
  components and the -soft tokens. Never solid blocks for warnings.
- Labels are specific. Buttons and fields say what they act on: "Delete March arrangement,"
  not "Delete." Confirmations name the thing being changed.
- Every error shown to the user says exactly what failed: error type, file, line, and message,
  so a screenshot is enough to diagnose it. The boilerplate error boundary does this; never
  replace it with a generic "Something went wrong" without details.

## Before calling any version done, run the ship check
1. Open the app. No console errors. Error boundary present.
2. Open every view, tab, and modal. Each renders real content, not a blank or white screen.
3. Dark and light both render. Language toggle works.
4. Installs as a PWA and serves clean from GitHub Pages.
5. Design conformance: tokens only, unified radii, no mixed sharp and rounded edges,
   components match the KHub library, motion and polish present.
6. App icons are THIS app's own icons. The boilerplate icon set is a placeholder and
   shipping it is a fail. When a build is nearly done, ask David for the icon artwork
   (a photo, drawing, or image works), then generate the full set from it:
   icon-72 / 96 / 128 / 144 / 152 / 192 / 384 / 512 (192 and 512 maskable),
   apple-touch-icon.png, and favicon.svg. The manifest must point at them.
   khub-check warns when icon-192.png is still the placeholder.
7. Fix every fail before shipping. Deliver one clean working build.

## How to run the static part of the check
From the repo root:
```
node scripts/khub-check.mjs .
```
This reports operational and design drift. A clean report is required to ship.
