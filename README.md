# KHub-Boilerplate

> Reusable vanilla PWA starter — multi-file, no build step, installable via GitHub Pages.

**Stack:** HTML + CSS + Vanilla JS · No framework · No bundler · No build step  
**Live demo:** https://davidfontenelle80-cloud.github.io/KHub-Boilerplate/  
**Repo:** https://github.com/davidfontenelle80-cloud/KHub-Boilerplate

---

## What's included

| Feature | File(s) |
|---|---|
| PWA shell + manifest | `index.html`, `manifest.json` |
| Service worker (12h update check) | `sw.js`, `js/app.js` |
| Responsive design (phone/tablet/desktop) | `css/responsive.css` |
| EN/ES language toggle | `js/i18n.js` |
| Dark mode (system + manual) | `js/theme.js`, `css/dark-mode.css` |
| Accessibility (WCAG 2.2 AA) | `js/a11y.js`, ARIA in `index.html` |
| Error boundary | `js/error-boundary.js` |
| Reusable auth pattern | `js/auth.js` |
| Firebase folder (inactive) | `firebase/` |
| Optional shared cloud backup/sync | `js/firebase/cloud-backup.js` |
| Dev/prod environment config | `js/config.js`, `.env.dev`, `.env.prod` |
| ESLint + Prettier | `.eslintrc.json`, `.prettierrc` |
| Component library | `js/components/`, `css/components.css` |
| Icon system (8 sizes + SVG favicon) | `icons/` |
| Performance check | `js/perf.js` |
| Full test checklist | `TEST-CHECKLIST.md` |

---

## Folder structure

```
KHub-Boilerplate/
├── index.html              # App shell — ARIA, skip link, load order
├── manifest.json           # PWA manifest — all 8 icon sizes
├── sw.js                   # Service worker — cache + update logic
├── package.json            # Lint + format scripts (no build step)
├── .eslintrc.json          # ESLint rules
├── .prettierrc             # Prettier config
├── .env.dev / .env.prod    # Environment documentation
│
├── icons/                  # Auto-sized PNG icons + SVG favicon
│   └── icon-72..512.png, favicon.svg
│
├── css/
│   ├── main.css            # CSS variables, reset, layout, sr-only
│   ├── dark-mode.css       # Dark theme token overrides (WCAG verified)
│   ├── components.css      # Buttons, modals, cards, inputs, auth chip
│   └── responsive.css      # Mobile-first breakpoints (600 / 960 / 1280)
│
├── js/
│   ├── config.js           # Env detection, feature flags, log helpers
│   ├── i18n.js             # EN/ES strings, data-i18n attributes, toggle
│   ├── theme.js            # Dark/light toggle, OS sync, override tracking
│   ├── a11y.js             # Live region, focus management, font scaling, shortcuts
│   ├── error-boundary.js   # Global error catch, retry UI, i18n messages
│   ├── auth.js             # Auth stub: state, UI controls, modal sign-in
│   ├── perf.js             # Navigation Timing, FCP, LCP, thresholds
│   ├── app.js              # Bootstrap, event bus, SW registration, 12h update timer
│   └── components/
│       ├── button.js       # Button factory
│       ├── modal.js        # Accessible modal (focus trap, Escape, ARIA)
│       ├── card.js         # Card factory
│       └── input.js        # Labeled input with validation
│
└── firebase/
    ├── firebase-config.js  # Config values (commented out — inactive)
    └── firebase-init.js    # Init logic  (commented out — inactive)
```

---

## Quick start

### Fork and rename

1. Click **Use this template** on GitHub (or clone and push to a new repo)
2. Open `js/config.js` — update `appName`, `version`, `repoOwner`, `repoName`
3. Open `manifest.json` — update `name`, `short_name`, `description`
4. Open `index.html` — update `<title>` and `<meta name="description">`
5. Replace `icons/` with your own icons (keep the same filenames and sizes)
6. Delete the **Component Library** demo section from `index.html` and `js/app.js`
7. Enable GitHub Pages (Settings → Pages → Source: `main`, folder: `/`)

### Run locally

No server required for basic use — just open `index.html` in a browser.  
For service worker testing you need HTTPS or localhost:

```bash
# Python (built-in)
python3 -m http.server 3000

# Node (npx)
npx serve .
```

Then open `http://localhost:3000`.

### Lint and format

```bash
npm install          # installs eslint + prettier
npm run lint         # check JS
npm run format       # format all HTML/CSS/JS/JSON/MD
npm run check        # lint + format check together
```

---

## Feature activation

### Auth
1. Open `js/config.js` — set `features.auth: true`
2. Open `js/auth.js` — implement `signIn`, `signOut`, and `onAuthChange` with your provider
3. Call `KHub.Auth.renderControls('#container')` to inject the sign-in UI

### Firebase
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Open `firebase/firebase-config.js` — uncomment and fill in your project values
3. Open `firebase/firebase-init.js` — uncomment the init block
4. Add the Firebase SDK `<script>` tags to `index.html`
5. Set `features.firebase: true` in `js/config.js`

---

## JS namespace

All modules attach to `window.KHub`. Load order matters (config first, app last):

```
config → i18n → theme → error-boundary → auth → a11y
→ components/* → perf → app
```

| Namespace | What it does |
|---|---|
| `KHub.Config` | env, version, feature flags, log helpers |
| `KHub.I18n` | `set(lang)`, `toggle()`, `t(key)` |
| `KHub.Theme` | `toggle()`, `apply(theme)`, `reset()` |
| `KHub.A11y` | `announce()`, `focusMain()`, `addShortcut()`, font sizing |
| `KHub.ErrorBoundary` | `show(msg, retryFn?)`, `dismiss()` |
| `KHub.Auth` | `signIn()`, `signOut()`, `renderControls()`, `onAuthChange()` |
| `KHub.CloudBackup` | `save()`, `restore()`, `restoreLatestIfNewer()`, `autoSave()` |
| `KHub.Components.Button` | `create({label, variant, onClick})` |
| `KHub.Components.Modal` | `open({title, body, onConfirm})`, `close()` |
| `KHub.Components.Card` | `create({title, body, footer})` |
| `KHub.Components.Input` | `create({id, label, type, validate})` |
| `KHub.Perf` | `report()`, `getMetrics()`, `onSlowLoad(fn)` |
| `KHub.SW` | `applyUpdate()` |
| `KHub.on/off/emit` | App-wide event bus |

---

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Alt + D` | Toggle dark/light mode |
| `Alt + L` | Toggle EN/ES language |
| `Alt + H` | Jump to main content |
| `Tab` | Navigate interactive elements |
| `Escape` | Close open modal |

---

## Accessibility (WCAG 2.2 AA)

- **Contrast:** All text meets 4.5:1 minimum. Light and dark token values documented in `css/dark-mode.css`.
- **Skip link:** Visible on focus — jumps to `#main-content`.
- **Screen reader live regions:** Update notice, error boundary, auth state change, and `KHub.A11y.announce()` all use `aria-live`.
- **Focus trap:** Modal traps Tab/Shift+Tab. Focus returns to trigger on close.
- **Keyboard navigation:** All interactive elements reachable by Tab. Custom `focus-visible` ring at 3px.
- **Touch targets:** All buttons and inputs meet 44×44px minimum.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` collapses all transitions.
- **Dynamic text:** `KHub.A11y.increaseFontSize()` / `decreaseFontSize()` — 4 steps (85%–130%).

---

## Centered responsive shell

The boilerplate must stay centered on every viewport: phone, tablet, laptop, and desktop.

- `#main-content.app-main` uses `width: min(100%, var(--max-width))` and `margin: 0 auto`.
- Generated apps that use an app root should wrap it in `main#main-content` and give `#app` `width: min(100%, 860px)` plus `margin-inline: auto`.
- Do not ship literal generated line-break text like `` `n`` or `` 
`` in HTML.
- IDs must be unique. Duplicate progress dots, tabs, modals, and inputs are a ship-check failure.
- CSS load order is `dark-mode.css`, `components.css`, `responsive.css`, then the app CSS.
## Service worker update flow

```
Page loads
  └── registration.update() called (re-fetches sw.js from GitHub)
  └── localStorage timestamp checked — if 12h passed, update() runs again

New sw.js detected
  └── new SW installs → state: "installed"
  └── isSafeToReload() check
        ├── SAFE   (no modal, no focused input, no dirty form)
        │     └── SKIP_WAITING → controllerchange → location.reload()
        └── UNSAFE
              └── Update banner shown → user clicks Refresh
                    └── SKIP_WAITING → controllerchange → location.reload()
```

---

## Deploy to GitHub Pages

```bash
# 1. Enable Pages in repo Settings → Pages → Source: main, folder: /
# 2. Push any change — Pages deploys automatically
git add . && git commit -m "deploy" && git push origin main
```

The service worker sets `start_url: "./"` and uses a relative scope — works at any sub-path (e.g., `username.github.io/repo-name/`).

---

## Making a new app from this boilerplate

1. Fork / clone
2. Update identity fields (`config.js`, `manifest.json`, `index.html`)
3. Replace icons
4. Remove demo section
5. Build your app's views/modules in `js/`
6. Add new JS files to `PRECACHE_URLS` in `sw.js` and bump `CACHE_VERSION`
7. Run `npm run check` before every push
8. Enable GitHub Pages

---

## License

MIT — free to use, fork, and modify.
