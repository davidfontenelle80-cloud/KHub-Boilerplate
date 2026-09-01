import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { findEncodingIssues, scanText } from '../scripts/check-encoding.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SKIP_DIR = new Set(['.git', 'node_modules', 'icons']);
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

test('repository source is free of double-encoded UTF-8 (mojibake)', () => {
  const report = findEncodingIssues(walk(repoRoot));
  const summary = report
    .map(
      (r) =>
        `${r.file}: ${r.issues.length} (${r.issues[0].codePoint} @ ${r.issues[0].line}:${r.issues[0].col})`
    )
    .join('\n');
  assert.equal(report.length, 0, `Corrupted files found:\n${summary}`);
});

test('scanText detects a C1 mojibake sequence', () => {
  // The calendar emoji (U+1F4C5) double-encoded as Latin-1 becomes the byte
  // run F0 9F 93 85 read as characters. Built from escapes so this source
  // file stays clean UTF-8. 9F/93/85 are C1 control code points.
  const mojibake = String.fromCharCode(0xf0, 0x9f, 0x93, 0x85);
  const issues = scanText(`const icon = "${mojibake}";`);
  assert.ok(issues.length >= 1);
  assert.equal(issues[0].kind, 'mojibake-c1');
});

test('scanText detects the replacement character', () => {
  const issues = scanText('label: "caf\u{fffd}"');
  assert.equal(issues.length, 1);
  assert.equal(issues[0].kind, 'replacement-char');
});

test('scanText passes clean UTF-8 with real emoji and accents', () => {
  assert.deepEqual(scanText('icon: "📅", label: "Conmemoración — café ✓"'), []);
});
