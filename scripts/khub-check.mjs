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
const fails = [], warns = [];
const FAIL = (m) => fails.push(m);
const WARN = (m) => warns.push(m);

// ---- gather files ----
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const stat = fs.statSync(target);
const files = stat.isDirectory() ? walk(target) : [target];
const byExt = (x) => files.filter((f) => f.toLowerCase().endsWith(x));
const read = (f) => fs.readFileSync(f, 'utf8');
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

const htmls = byExt('.html'), csses = byExt('.css'), jses = byExt('.js').concat(byExt('.mjs'));
const allHtml = htmls.map(read).join('\n');
// inline <style> blocks count as CSS (single-file apps live here)
const inlineCss = (allHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/g) || [])
  .map((s) => s.replace(/<\/?style[^>]*>/g, '')).join('\n');
const allCss = csses.map(read).join('\n') + '\n' + inlineCss;
const allJs = jses.map(read).join('\n');
// inline <script> blocks count as JS
const inlineJs = (allHtml.match(/<script>([\s\S]*?)<\/script>/g) || [])
  .map((s) => s.replace(/<\/?script>/g, '')).join('\n');
const jsBody = allJs + '\n' + inlineJs;

// ---- 1. JS syntax ----
for (const f of jses) {
  try { execSync(`node --check "${f}"`, { stdio: 'pipe' }); }
  catch (e) { FAIL(`JS syntax error in ${f}: ${String(e.stderr || e).split('\n')[0]}`); }
}
(allHtml.match(/<script>([\s\S]*?)<\/script>/g) || []).forEach((blk, i) => {
  const code = blk.replace(/<\/?script>/g, '');
  try { new Function(code); } catch (e) { FAIL(`Inline <script> #${i + 1} syntax error: ${e.message}`); }
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

// ---- 3. design conformance (scan non-theme CSS rules) ----
const css = stripComments(allCss);
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
    if (hasSharp) FAIL(`Sharp corner in "${sel}" -> ${r.trim()} (use a radius token, no corners 6px or under).`);
    else WARN(`Hard-coded radius in "${sel}" -> ${r.trim()} (prefer var(--radius-*)).`);
  }
}
// press-scale present somewhere
if (!/:active[^{]*\{[^}]*scale\(/.test(css) && !/transform:\s*scale\(/.test(css))
  WARN('No press-scale (:active scale) found. Polish is required.');
// tabular numbers for stats
if (!/tabular-nums|font-variant-numeric/.test(css))
  WARN('No tabular numbers (font-variant-numeric) found.');

// ---- report ----
const line = '-'.repeat(56);
console.log(line);
console.log('KHUB SHIP CHECK  ·  ' + target);
console.log(line);
console.log(`HTML ${htmls.length} | CSS ${csses.length} | JS ${jses.length}`);
console.log('');
if (fails.length) { console.log(`FAIL (${fails.length}) — must fix before ship:`); fails.forEach((f) => console.log('  x ' + f)); console.log(''); }
if (warns.length) { console.log(`WARN (${warns.length}) — should fix:`); warns.forEach((w) => console.log('  ! ' + w)); console.log(''); }
console.log('Agent still verifies at runtime: every view, tab, and modal opens and');
console.log('renders real content; dark and light both work; installs as a PWA.');
console.log(line);
console.log(fails.length ? 'RESULT: FAIL' : (warns.length ? 'RESULT: PASS WITH WARNINGS' : 'RESULT: PASS'));
process.exit(fails.length ? 1 : 0);
