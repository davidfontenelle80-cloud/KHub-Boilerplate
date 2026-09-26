# Post-Change Sweep

A repeatable method for checking a KHub app after a batch of changes ("sweep the app,
make sure nothing is broken or misaligned"). First run: Ministry Tracker, 2026-09-25,
after 11 same-day commits (organizer, Return Visits, Bible Studies). It found two
functional bugs and two alignment problems that static checks alone would have missed.

The sweep is **read-only until the owner approves fixes**. Report findings first,
with evidence, then fix only what was approved.

---

## 1. Scope

- List the commits since the last known-good state:
  `git log --since=<date> --format='%h %ad %s' --date=short`
- `git diff --stat <last-good> HEAD` to see which files changed and by how much.
- Focus review on changed files, but run the whole-app checks below regardless.

## 2. Static checks (minutes)

| Check                           | Command / method                                                      |
| ------------------------------- | --------------------------------------------------------------------- |
| Syntax of every script          | `for f in js/*.js sw.js; do node --check "$f"; done`                  |
| Encoding (mojibake)             | `node scripts/check-encoding.mjs .`                                   |
| Ship check                      | `node scripts/khub-check.mjs .`                                       |
| Every referenced asset exists   | extract `src`/`href` from `index.html`, confirm each path exists      |
| Every runtime file is precached | compare the page's scripts/styles with `PRECACHE_URLS` in `sw.js`     |
| Dynamically loaded modules      | grep for `createElement('script')`; confirm those files are precached |
| `CACHE_VERSION` bumped          | if any precached file changed since the last deploy                   |

## 3. Read the risky seams

Static checks do not catch logic that spans modules. Read these specifically:

- **Two modules touching the same UI** (tab bars, shared dialogs). Look for a
  private state variable in one module that another module bypasses
  (UX-STANDARDS §8.4).
- **Migrations**: load order, idempotency, done-flag (MIGRATIONS.md).
- **Notification routing**: cold start vs. warm; every `sourceType` has a
  listener; listeners subscribe before the route fires.
- **Moved responsibilities**: when code is removed from one file (for example an
  auto-open), confirm the new owner actually does it.

## 4. Runtime smoke test (device matrix)

Serve the repo locally and drive it with Playwright (Python or Node), with service workers
blocked so you test the files on disk.

Minimum regression matrix:

| Class | Suggested viewport | What it catches |
| --- | --- | --- |
| Phone portrait | 390×844 or 430×932 | bottom nav, sheets, wrapping, safe areas |
| Tablet portrait | 768×1024 | navigation handoff, split layouts, first viewport |
| Tablet landscape | 1024×768 | navigation handoff, map/table sizing, overlays |
| Desktop/laptop | 1280×800 or larger | centered max-width, desktop navigation, dense screens |

Also probe every responsive breakpoint at `breakpoint - 1`, `breakpoint`, and
`breakpoint + 1`. A navigation style may change, but there must never be a width where both
the outgoing and replacement destination controls are hidden.

Use an iPhone-class context (`DPR 3`, `is_mobile`, `has_touch`) for the phone pass.
Tablet passes should include touch behavior and both orientations.

**Seed data before the first load.** Open any other same-origin page (for
example `/README.md`), write `localStorage`, then navigate to `index.html`. If you
load the app first, one-time migrations set their done-flag on empty data and the
seed tests nothing.

Walk and record:

1. Every bottom-nav screen, every sub-tab, every filter.
2. Every sheet/modal in each mode: **new, view, edit** (UX-STANDARDS §8.3).
3. Language toggle (EN/ES) and dark/light, on the busiest screens.
4. Round-trip: create a record through the real form, confirm it is stored and
   shown in the right list.
5. Cross-module paths: switch tabs from module A, leave the screen, come back;
   confirm the view that returns is the one you left.
6. On tablet, confirm primary navigation is visible immediately and does not require scrolling
   or hover to become usable.
7. On the first viewport of each major screen, confirm current context and the primary action or
   primary choices are already visible.

Capture on every step:

- `pageerror` and `console` errors (ignore third-party tile/CDN noise and your
  own helper page's favicon 404).
- Horizontal overflow: `document.documentElement.scrollWidth - innerWidth` must be 0.
- Open sheets: `getBoundingClientRect()` left 0 and right `innerWidth` on phones.
- Short labels: tab/button heights equal across a row (a taller one means a wrap).
- Screenshots of each screen. **Look at them.** Alignment problems (a sheet 38px
  short, one tab laid out differently from its siblings) only show up visually.
- Navigation visibility at every breakpoint probe.
- Fixed controls against safe-area insets in installed-like mobile/tablet dimensions.

Template (Python, adapt selectors to the app):

```python
import json, subprocess, sys, time
from playwright.sync_api import sync_playwright

srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765'], cwd='..')
time.sleep(1)
BASE = 'http://127.0.0.1:8765/<repo>/'
errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page(viewport={'width': 430, 'height': 932}, device_scale_factor=3,
                      is_mobile=True, has_touch=True, service_workers='block')
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: m.type == 'error' and errors.append(m.text))
    page.goto(BASE + 'README.md')                         # same origin, not the app
    page.evaluate("s => localStorage.setItem('<storage-key>', s)", json.dumps(LEGACY_STATE))
    page.goto(BASE + 'index.html'); page.wait_for_timeout(2500)
    for screen in ['home', 'calendar', 'notes', 'reports']:
        page.click(f'.nav-btn[data-screen="{screen}"]'); page.wait_for_timeout(600)
        page.screenshot(path=f'sweep_{screen}.png')
    print('overflow', page.evaluate('document.documentElement.scrollWidth - innerWidth'))
    b.close()
srv.terminate()
print('errors:', errors or 'none')
```


### Map-specific probe

When the changed app contains a map:

- Pan and zoom continuously; no map remount or full marker rebuild should occur.
- Verify no geocoding request fires continuously during the gesture.
- Filter/add/edit one record and confirm only the necessary markers change.
- Open/close a record sheet and return to the map; the user's viewport should remain intentional.
- Rotate tablet/phone dimensions and confirm the existing map resizes instead of going blank.
- Simulate tile/geocoder failure and confirm saved records remain accessible outside the map.

See `MAPS-LOCATION.md`.

### Import-specific probe

When import code or data schema changed, test the matrix in `IMPORT-PIPELINE.md`: reordered
columns, extra columns, aliases, missing optional/required fields, blank rows, duplicates, and the
oldest supported legacy source. Confirm the preview mapping before Apply.

### Installed-PWA probe

A headless browser cannot validate home-screen identity. If the change touches `manifest.json`,
icons, service-worker scope/update behavior, safe-area layout, notifications, or other
standalone-only behavior, perform an actual installed-PWA check on the affected target platform.

Verify icon appearance, launch/splash state, standalone navigation, safe areas, and update from
the previously installed version. Record that evidence in `.ai/ACTIVE_TASK.md`.

## 5. Report before fixing

For each finding: what the person sees, the root cause with file and line, how it
was reproduced, and the proposed fix. Separate **bugs** from **cosmetic/alignment**
and list what passed. Design choices (for example "should this tab match its
siblings?") are the owner's decision; offer options.

## 6. Fix, re-verify, ship

1. Make the approved fixes only.
2. Re-run the same probe that reproduced each bug and show it now passes.
3. Bump `CACHE_VERSION` so installed phones pick up the change.
4. Update the app's `.ai/ACTIVE_TASK.md` with the decision record.
5. Commit to `main` in **one atomic commit** (`GITHUB_COMMIT_MULTIPLE_FILES`,
   `encoding: "utf-8"`). When the files are rebuilt remotely, rebuild them from
   live `main` with the same exact edits and **sha-gate** each file against the
   locally tested version before committing; afterwards compare the returned
   blob SHAs with `git hash-object`.
6. Confirm CI (build, encoding, deploy) is green on the new commit.
7. If the release changed manifest/icons/SW/safe-area/notifications, complete the installed-PWA
   probe before calling the release verified.
8. Tell the owner to close and reopen the installed app once to load the new version.

## 7. Feed lessons back

Each bug class found in a sweep becomes a standard: a rule in UX-STANDARDS, a
`khub-check` rule with a test when a machine can catch it, and a note in the
relevant pattern doc. The 2026-09-25 sweep produced UX-STANDARDS §8, ship-check
rules 6–7, and the order-safe section of MIGRATIONS.md.
