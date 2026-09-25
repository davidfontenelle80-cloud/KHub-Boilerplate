// Ship-check rules added after the 2026-09-25 Ministry Tracker sweep
// (UX-STANDARDS §8): the global [hidden] reset and full-width dialog sheets.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const CHECK = path.resolve('scripts/khub-check.mjs');

function runCheckOn(css) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'khub-ui-'));
  fs.writeFileSync(path.join(dir, 'index.html'), '<!doctype html><title>t</title>');
  fs.writeFileSync(path.join(dir, 'app.css'), css);
  const r = spawnSync(process.execPath, [CHECK, dir], { encoding: 'utf8' });
  fs.rmSync(dir, { recursive: true, force: true });
  return r.stdout;
}

const RESET = '[hidden] { display: none !important; }\n';

test('fails when the global [hidden] reset is missing', () => {
  const out = runCheckOn('.panel { display: flex; }');
  assert.match(out, /Missing global `\[hidden\]/);
});

test('a scoped [hidden] rule does not satisfy the global reset', () => {
  const out = runCheckOn('.sheet [hidden] { display: none !important; }');
  assert.match(out, /Missing global `\[hidden\]/);
});

test('passes the [hidden] rule when the global reset is present', () => {
  const out = runCheckOn(RESET + '.panel { display: flex; }');
  assert.doesNotMatch(out, /Missing global `\[hidden\]/);
});

test('warns when a dialog sheet is width:100% without max-width:100%', () => {
  const out = runCheckOn(RESET + '.rv-dialog { width: 100%; margin: auto 0 0; }');
  assert.match(out, /Dialog\/sheet set to width:100%/);
});

test('no sheet warning once max-width:100% is set', () => {
  const out = runCheckOn(RESET + '.rv-dialog { width: 100%; max-width: 100%; }');
  assert.doesNotMatch(out, /Dialog\/sheet set to width:100%/);
});

test('backdrop rules are ignored by the sheet check', () => {
  const out = runCheckOn(RESET + '.rv-dialog::backdrop { width: 100%; }');
  assert.doesNotMatch(out, /Dialog\/sheet set to width:100%/);
});
