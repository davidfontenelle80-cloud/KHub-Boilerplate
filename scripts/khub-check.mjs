#!/usr/bin/env node
/* KHub ship check (static)
   Usage: node khub-check.mjs <path-to-app-dir-or-html-file>
   Reports operational gaps and design drift. Exit 1 if any FAIL.
   Runtime checks (every view renders, PWA installs) are done by the agent,
   not here. This catches the things a machine can catch reliably. */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const target = process.argv[2] || '.';
const fails = [],
  warns = [];
const FAIL = (m) => fails.push(m);
const WARN = (m) => warns.push(m);

// ---- gather files ----
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const stat = fs.statSync(target);
const files = stat.isDirectory() ? walk(target) : [target];
const byExt = (x) => files.filter((f) => f.toLowerCase().endsWith(x));
const read = (f) => fs.readFileSync(f, 'utf8');
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const htmls = byExt('.html'),
  csses = byExt('.css'),
  jses = byExt('.js').concat(byExt('.mjs'));
const allHtml = htmls.map(read).join('\n');
// inline <style> blocks count as CSS (single-file apps live here)
const inlineCss = (allHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [])
  .map((s) => s.replace(/<\/?style[^>]*>/g, ''))
  .join('\n');
const allCss = csses.map(read).join('\n') + '\n' + inlineCss;
const allJs = jses.map(read).join('\n');
// inline <script> blocks count as JS
const inlineJs = (allHtml.match(/<script>([\s\S]*?)<\/script>/g) || [])
  .map((s) => s.replace(/<\/?script>/g, ''))
  .join('\n');
const jsBody = allJs + '\n' + inlineJs;
const css = stripComments(allCss);

// ---- 0. markup hygiene ----
if (/[`][rn]/.test(allHtml)) {
  FAIL(
    'Literal generated line-break text found in HTML (`n or `r`n). Replace it with real newlines.'
  );
}
const idCounts = new Map();
for (const hit of allHtml.matchAll(/\bid=["']([^"']+)["']/g)) {
  idCounts.set(hit[1], (idCounts.get(hit[1]) || 0) + 1);
}
const duplicateIds = [...idCounts.entries()]
  .filter(([, count]) => count > 1)
  .map(([id, count]) => `${id} (${count})`);
if (duplicateIds.length) {
  FAIL(`Duplicate HTML id values found: ${duplicateIds.join(', ')}.`);
}
if (
  /<link[^>]+css\/dark-mode\.css[\s\S]*<link[^>]+css\/components\.css[\s\S]*<link[^>]+css\/responsive\.css[\s\S]*<link[^>]+css\/(?:main|styles)\.css/.test(
    allHtml
  ) === false &&
  /<link[^>]+css\/(?:dark-mode|components|responsive)\.css/.test(allHtml)
) {
  FAIL(
    'KHub CSS files must load in order: dark-mode.css, components.css, responsive.css, then app main.css/styles.css.'
  );
}

// ---- 1. JS syntax ----
// Files loaded as <script type="text/babel"> are JSX, transpiled in the browser
// by Babel standalone. node --check cannot parse JSX, so skip those files here.
// The agent still verifies them at runtime (app loads, no console errors).
const babelSrcs = (allHtml.match(/<script[^>]+>/g) || [])
  .filter((t) => /type=["']text\/babel["']/.test(t))
  .map((t) => (t.match(/src=["']([^"']+)["']/) || [])[1])
  .filter(Boolean)
  .map((s) => s.replace(/^\.\//, '').replace(/\\/g, '/'));
const isBabelFile = (f) => babelSrcs.some((s) => f.replace(/\\/g, '/').endsWith(s));
for (const f of jses) {
  if (isBabelFile(f)) continue;
  try {
    execSync(`"${process.execPath}" --check "${f}"`, { stdio: 'pipe' });
  } catch (e) {
    FAIL(`JS syntax error in ${f}: ${String(e.stderr || e).split('\n')[0]}`);
  }
}
(allHtml.match(/<script>([\s\S]*?)<\/script>/g) || []).forEach((blk, i) => {
  const code = blk.replace(/<\/?script>/g, '');
  try {
    new Function(code);
  } catch (e) {
    FAIL(`Inline <script> #${i + 1} syntax error: ${e.message}`);
  }
});

// ---- 2. operational scaffolding ----
if (!/name=["']theme-color["']/.test(allHtml)) FAIL('No <meta name="theme-color"> in HTML.');
if (!/(window\.onerror|addEventListener\(\s*['"]error['"])/.test(jsBody))
  FAIL('No global error handler (window.onerror or addEventListener("error")).');
if (!/\[data-theme/.test(allCss) && !/data-theme/.test(jsBody) && !/data-theme/.test(allHtml))
  FAIL('No dark/light theme handling found ([data-theme]).');
if (!/@media[^{]*768/.test(allCss)) WARN('No 768px (tablet) breakpoint found.');
if (!/@media[^{]*1200/.test(allCss)) WARN('No 1200px (desktop) breakpoint found.');
if (/localStorage/.test(jsBody) && !/(export|import|backup|restore)/i.test(jsBody))
  WARN('Uses localStorage but no export/import/backup found.');
if (
  !/#main-content\s*\{[^}]*justify-content\s*:\s*center/.test(css) &&
  !/main-content/.test(allHtml)
)
  WARN(
    'No centered main app shell found. Use main#main-content to center #app across desktop, laptop, tablet, and phone.'
  );
if (
  /#app\s*\{[^}]*align-items\s*:\s*center/.test(css) &&
  !/#app\s*\{[^}]*margin-inline\s*:\s*auto/.test(css)
)
  WARN(
    '#app centers children but the app root itself is not clearly centered. Add width:min(100%, 860px) and margin-inline:auto.'
  );

// ---- 3. design conformance (scan non-theme CSS rules) ----
// split into rule blocks: selector { body }
const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
let m;
const allowedRadiusVar = /var\(--radius-(sm|md|lg|xl|full)\)/;
while ((m = ruleRe.exec(css)) !== null) {
  const sel = m[1].trim();
  const body = m[2];
  // skip token / theme territory and keyframes
  if (/:root|\[data-theme|@/.test(sel)) continue;

  // raw color literals where a token should be used
  const colorHits = body.match(/#[0-9a-fA-F]{3,8}\b|(?:rgb|rgba|hsl|hsla)\(/g);
  if (colorHits) {
    // allow #fff/#000 only inside box-shadow? no—still prefer tokens. report all.
    FAIL(`Raw color in "${sel}" -> use a token var instead: ${[...new Set(colorHits)].join(', ')}`);
  }
  // border-radius literals
  const radii = body.match(/border-radius:\s*([^;]+);?/g) || [];
  for (const r of radii) {
    if (allowedRadiusVar.test(r)) continue;
    const px = [...r.matchAll(/(\d+(?:\.\d+)?)px/g)].map((x) => parseFloat(x[1]));
    if (px.length === 0) continue; // inherit, %, keywords are fine
    const hasSharp = px.some((v) => v <= 6);
    if (hasSharp)
      FAIL(
        `Sharp corner in "${sel}" -> ${r.trim()} (use a radius token, no corners 6px or under).`
      );
    else WARN(`Hard-coded radius in "${sel}" -> ${r.trim()} (prefer var(--radius-*)).`);
  }
}
// app icon must not be the boilerplate placeholder
import { createHash } from 'crypto';
const PLACEHOLDER_ICON_MD5 = 'c7cf40c4537e729c719b5e08574033c5';
const icon192 = files.find((f) => f.replace(/\\/g, '/').endsWith('icons/icon-192.png'));
if (icon192) {
  const hash = createHash('md5').update(fs.readFileSync(icon192)).digest('hex');
  if (hash === PLACEHOLDER_ICON_MD5 && !path.resolve(target).includes('KHub-Boilerplate'))
    WARN(
      "icons/icon-192.png is still the boilerplate placeholder. Ask David for this app's icon artwork and generate the full set before ship."
    );
}

// press-scale present somewhere
if (!/:active[^{]*\{[^}]*scale\(/.test(css) && !/transform:\s*scale\(/.test(css))
  WARN('No press-scale (:active scale) found. Polish is required.');
// tabular numbers for stats
if (!/tabular-nums|font-variant-numeric/.test(css))
  WARN('No tabular numbers (font-variant-numeric) found.');

// ---- 4. service worker actually registered ----
// ministry-tracker and next-dollar shipped orphan sw.js files (Jun 2026):
// versioned SW present, never registered, so no offline cache and every
// CACHE_VERSION bump was a no-op. Catch that statically.
const swFile = files.find((f) => path.basename(f) === 'sw.js');
if (
  swFile &&
  !/navigator\.serviceWorker\.register|serviceWorker\s*\.\s*register\s*\(/.test(
    jsBody + '\n' + allHtml
  )
)
  FAIL(
    'sw.js exists but nothing registers it (navigator.serviceWorker.register). Orphan SW: no offline cache, version bumps do nothing.'
  );

// ---- 4b. offline dependency/precache consistency ----
if (swFile && stat.isDirectory()) {
  const swSource = read(swFile);
  const precached = new Set([...swSource.matchAll(/['"]\.\/([^'"]+)['"]/g)].map((hit) => hit[1]));
  const required = new Set();
  for (const html of htmls) {
    const source = read(html);
    for (const hit of source.matchAll(/<(?:script|link)\b[^>]+(?:src|href)=["']([^"']+)["']/g)) {
      const value = hit[1].replace(/^\.\//, '');
      if (!/^(?:https?:|data:|#)/.test(value)) required.add(value);
    }
  }
  for (const cssFile of csses) {
    for (const hit of read(cssFile).matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
      const value = hit[1];
      if (/\.(?:woff2?|ttf|otf)$/i.test(value)) {
        required.add(
          path.relative(target, path.resolve(path.dirname(cssFile), value)).replace(/\\/g, '/')
        );
      }
    }
  }
  const manifestFile = files.find((f) => path.basename(f) === 'manifest.json');
  if (manifestFile) {
    try {
      for (const icon of JSON.parse(read(manifestFile)).icons || [])
        required.add(String(icon.src).replace(/^\.\//, ''));
    } catch (_) {
      FAIL('manifest.json is not valid JSON.');
    }
  }
  const missing = [...required].filter((item) => item && !precached.has(item));
  if (missing.length)
    FAIL(`Runtime dependencies missing from atomic precache: ${missing.join(', ')}.`);
  if (!/const\s+CACHE_PREFIX\s*=/.test(swSource) || !/isOwnedCache/.test(swSource))
    FAIL('Service worker lacks an app-owned cache prefix/cleanup guard.');
  if (!files.some((f) => f.replace(/\\/g, '/').endsWith('docs/DEPENDENCY-INVENTORY.md')))
    WARN('No docs/DEPENDENCY-INVENTORY.md found for runtime/version/license provenance.');
}

// ---- 5. mobile input zoom (16px iOS rule) ----
// Inputs under 16px make iPhone Safari zoom on focus and stay zoomed.
const inputSelRe = /(^|[\s,>])(input|select|textarea)\b/;
const smallInputs = [];
const zoomRuleRe = /([^{}]+)\{([^{}]*)\}/g;
let zm;
while ((zm = zoomRuleRe.exec(css)) !== null) {
  const sel = zm[1].trim();
  if (/:root|@/.test(sel) || !inputSelRe.test(sel)) continue;
  const fs = zm[2].match(/font-size:\s*(\d+(?:\.\d+)?)(px|rem)/);
  if (!fs) continue;
  const pxv = fs[2] === 'rem' ? parseFloat(fs[1]) * 16 : parseFloat(fs[1]);
  if (pxv < 16) smallInputs.push(`"${sel.slice(0, 48)}" -> ${fs[0].trim()}`);
}
const hasMobileInputOverride =
  /@media[^{]*max-width[\s\S]{0,600}?(input|select|textarea)[^{]*\{[^}]*font-size:\s*16px/.test(
    allCss
  );
if (smallInputs.length && !hasMobileInputOverride)
  WARN(
    `Inputs under 16px zoom iPhone Safari on focus: ${smallInputs.slice(0, 3).join('; ')}${smallInputs.length > 3 ? ' (+' + (smallInputs.length - 3) + ' more)' : ''}. Add a 16px override under 680px.`
  );

// ---- report ----
const line = '-'.repeat(56);
console.log(line);
console.log('KHUB SHIP CHECK  ·  ' + target);
console.log(line);
console.log(`HTML ${htmls.length} | CSS ${csses.length} | JS ${jses.length}`);
console.log('');
if (fails.length) {
  console.log(`FAIL (${fails.length}) — must fix before ship:`);
  fails.forEach((f) => console.log('  x ' + f));
  console.log('');
}
if (warns.length) {
  console.log(`WARN (${warns.length}) — should fix:`);
  warns.forEach((w) => console.log('  ! ' + w));
  console.log('');
}
console.log('Agent still verifies at runtime: every view, tab, and modal opens and');
console.log('renders real content; dark and light both work; installs as a PWA.');
console.log(line);
console.log(
  fails.length ? 'RESULT: FAIL' : warns.length ? 'RESULT: PASS WITH WARNINGS' : 'RESULT: PASS'
);
process.exit(fails.length ? 1 : 0);
