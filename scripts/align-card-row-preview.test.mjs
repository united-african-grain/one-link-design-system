/**
 * What the app's alignment fixes need (Build Charter section 5: the design system only adds, on the current tokens).
 * CardRow's stacked option (Sid Switch Admin.html screen 2, Setup Home rows) and ImportPreview's per-template options
 * (Alka.html screens 2 and 10, Ryan.html screens 4 and 5). Every addition is opt-in and its default draws what was
 * drawn before. Read from the components' source, like the other component tests.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const COMPONENTS = join(fileURLToPath(new URL('..', import.meta.url)), 'project/components');
const read = (p) => readFileSync(join(COMPONENTS, p), 'utf8');
/** The PREVIEW_CHECKS literal, evaluated. */
const previewChecks = (src) => {
  const m = src.match(/export const PREVIEW_CHECKS = (\{[\s\S]*?\n\});/);
  assert.ok(m, 'ImportPreview exports PREVIEW_CHECKS');
  return Function(`return (${m[1]});`)();
};

describe('[ALIGN] CardRow stacked (Setup Home rows)', () => {
  test('[ALIGN] stacked is off by default and the one-line row is drawn as before', () => {
    const src = read('data/Card.jsx');
    assert.match(src, /export function CardRow\(\{ leading, name, sub, bar, figure, trailing, closed = false, stacked = false, style \}\)/);
    assert.match(src, /\) : \(\n\s*<div style=\{\{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 \}\}>\n\s*<span style=\{\{ \.\.\.textStyle\('body-3', \{ tone: closed \? 'quaternary' : 'primary' \}\), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' \}\}>\{name\}<\/span>\n\s*\{sub \? <span style=\{\{ \.\.\.textStyle\('body-3', \{ tone: 'secondary' \}\), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' \}\}>\{sub\}<\/span> : null\}/,
      'without stacked, name and sub share one line, each cut with an ellipsis');
  });

  test('[ALIGN] stacked puts sub on its own line under name, wrapping, with no ellipsis', () => {
    const src = read('data/Card.jsx');
    const m = src.match(/\{stacked \? \(([\s\S]*?)\) : \(/);
    assert.ok(m, 'a stacked branch');
    const branch = m[1];
    assert.match(branch, /flexDirection: 'column', gap: 2/, 'sub under name');
    assert.doesNotMatch(branch, /ellipsis|nowrap/, 'nothing is cut short');
    assert.equal((branch.match(/overflowWrap: 'anywhere'/g) ?? []).length, 2, 'name and sub both wrap');
    assert.match(branch, /textStyle\('body-3', \{ tone: 'secondary' \}\)/, 'sub keeps its tone: nothing is restyled');
    assert.match(read('data/Card.d.ts'), /stacked\?: boolean;/);
  });
});

describe('[ALIGN] ImportPreview per template (uploads wording)', () => {
  const src = read('records/ImportPreview.jsx');
  const dts = read('records/ImportPreview.d.ts');

  test('[ALIGN] every new prop defaults to today\'s drawing', () => {
    assert.match(src, /importing = false, readyWord = 'Ready', actions = 'beside', statusWord = 'computed', style \}\)/);
    assert.match(dts, /readyWord\?: React\.ReactNode \| \(\(row: ImportRow\) => React\.ReactNode\);/);
    assert.match(dts, /actions\?: 'beside' \| 'inline' \| 'none';/);
    assert.match(dts, /statusWord\?: 'computed' \| 'map';/);
  });

  test('[ALIGN] a tile carries an optional note under its value ("Rows 14 In file")', () => {
    assert.match(src, /<span style=\{textStyle\('heading-3-condensed', \{ tabular: true \}\)\}>\{t\.value\}<\/span>\n\s*\{t\.note \? <span data-tile-note style=\{textStyle\('body-3', \{ tone: 'tertiary' \}\)\}>\{t\.note\}<\/span> : null\}/);
    assert.match(dts, /tiles\?: Array<\{ label: React\.ReactNode; value: React\.ReactNode; note\?: React\.ReactNode \}>;/);
  });

  test('[ALIGN] a clean row reads the template\'s word ("New leg"), given or from the row', () => {
    assert.match(src, /return <StatusMark kind="clean" label=\{typeof readyWord === 'function' \? readyWord\(r\) : readyWord\} size="body-4" \/>;/);
    assert.doesNotMatch(src, /label="Ready"/, 'the word is never hard-coded');
  });

  test('[ALIGN] Discard and Import sit beside the File card by default, in its title row inline, or not at all', () => {
    assert.match(src, /\{actions === 'beside' \? \(\n\s*<div style=\{\{ display: 'flex', gap: 8, marginLeft: 'auto' \}\}>\n\s*\{buttons\}/, 'beside, as before');
    assert.match(src, /const headerRight = actions === 'inline'\n\s*\? <div data-actions="inline"[^\n]*\{statusMark\}<div style=\{\{ display: 'flex', gap: 8 \}\}>\{buttons\}<\/div><\/div>\n\s*: statusMark;/, 'inline after the status');
    assert.equal((src.match(/>Import<\/Button>/g) ?? []).length, 1, 'one Import, so one rule for its disabled state');
    assert.match(src, /disabled=\{errors\.length > 0 \|\| blocked \|\| status !== 'ready'\}>Import<\/Button>/);
  });

  test('[ALIGN] statusWord="map" shows the map\'s word with the computed phrase beside it; the default shows the phrase', () => {
    assert.match(src, /const mapSt = refusal \? UPLOAD_STATUS\.failed : UPLOAD_STATUS\[status\] \|\| UPLOAD_STATUS\.ready;/);
    assert.match(src, /const detail = st === mapSt \? null : st\.word;/);
    assert.match(src, /statusWord === 'map'\n\s*\? <span data-status-word="map"[^\n]*<StatusMark kind=\{mapSt\.kind\} label=\{mapSt\.word\} \/>\{detail \? <span data-status-detail style=\{textStyle\('body-3', \{ tone: 'secondary' \}\)\}>\{detail\}<\/span> : null\}<\/span>\n\s*: <StatusMark kind=\{st\.kind\} label=\{st\.word\} \/>;/);
  });

  test('[ALIGN] a row can carry a free-text note, shown as a warning with its text, and it never stops Import', () => {
    const checks = previewChecks(src);
    assert.deepEqual(checks.note, { kind: 'attention', word: 'note' });
    assert.match(src, /if \(c && r\.check === 'note'\) return <span data-check="note"><StatusMark kind=\{c\.kind\} label=\{r\.cell \? `Cell \$\{r\.cell\}: \$\{r\.note \|\| c\.word\}` : \(r\.note \|\| c\.word\)\}/);
    const blocked = src.match(/export function previewBlocked[\s\S]*?\n\}/)[0];
    assert.doesNotMatch(blocked, /note/, 'a note is a warning, not a stop');
    assert.match(dts, /\| 'sheet-figure-differs' \| 'note'[;\n]/);
    assert.match(dts, /note\?: string;/);
  });
});
