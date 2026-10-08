/**
 * Three gaps the One Link app found (Build Charter section 5: the design system only adds, on the current tokens).
 * ImportPreview tells rows apart by sheet and row, because a load register has one tab per supplier and its row
 * numbers repeat (UAG-182, app PR #191). ImportPreview's Result words for a load register's rows, mirrored from the
 * app's OL_PREVIEW_CHECKS (#191). RecordHighlights draws a field's value as the blue reference link, as the map draws
 * an exception's Linked record (alignment fix 5d, app PR #187). Read from the components' source, like the other
 * component tests; the pure functions are evaluated and called.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const COMPONENTS = join(ROOT, 'project/components');
const read = (p) => readFileSync(join(COMPONENTS, p), 'utf8');
/** An exported literal, evaluated. */
const literal = (src, name) => {
  const m = src.match(new RegExp(`export const ${name} = (\\{[\\s\\S]*?\\n\\});`));
  assert.ok(m, `the source exports ${name}`);
  return Function(`return (${m[1]});`)();
};
/** An exported plain function (no JSX), ready to call. */
const plain = (src, name) => {
  const m = src.match(new RegExp(`export function ${name}\\([\\s\\S]*?\\n\\}`));
  assert.ok(m, `the source exports ${name}`);
  return Function(`${m[0].replace(/^export /, '')}\nreturn ${name};`)();
};

describe('[UAG-182] ImportPreview tells rows apart by sheet and row', () => {
  const src = read('records/ImportPreview.jsx');
  const previewRowKey = plain(src, 'previewRowKey');

  test('[UAG-182] two sheets sharing row numbers give every row its own key', () => {
    const rows = [
      { sheet: 'Lakeview Farms Ltd', row: 2 }, { sheet: 'Lakeview Farms Ltd', row: 3 },
      { sheet: 'Cameron Estates', row: 2 }, { sheet: 'Cameron Estates', row: 3 },
    ];
    const keys = rows.map(previewRowKey);
    assert.equal(new Set(keys).size, rows.length, `no two rows share a key: ${keys.join(', ')}`);
    assert.equal(previewRowKey({ sheet: 'Lakeview Farms Ltd', row: 3 }), 'Lakeview Farms Ltd!3');
  });

  test('[UAG-182] a single-sheet file is still told apart by row number alone', () => {
    assert.equal(previewRowKey({ row: 3 }), '3');
    assert.equal(previewRowKey({ row: 3, sheet: '' }), '3', 'an empty sheet is no sheet');
    assert.deepEqual([{ row: 2 }, { row: 3 }, { row: 9 }].map(previewRowKey), ['2', '3', '9']);
  });

  test('[UAG-182] the row table is keyed by previewRowKey, and DataTable takes a key function', () => {
    assert.match(src, /<DataTable columns=\{table\} rows=\{rows\} rowKey=\{previewRowKey\} \/>/);
    assert.doesNotMatch(src, /rowKey="row"/, 'never by row number alone');
    const table = read('data/DataTable.jsx');
    assert.match(table, /const keyOf = \(r, i\) => \{ const k = typeof rowKey === 'function' \? rowKey\(r\) : r\[rowKey\]; return k != null \? k : i; \};/);
    assert.match(table, /<React\.Fragment key=\{keyOf\(r, i\)\}>/);
    assert.match(table, /rowKey = 'id'/, 'a field name, by default id, as before');
    assert.match(read('records/ImportPreview.d.ts'), /sheet\?: string;/);
    assert.match(read('data/DataTable.d.ts'), /rowKey\?: string \| \(\(row: Row\) => string \| number\);/);
  });
});

describe('[UAG-182] ImportPreview: the load register\'s Result words, as the app has them (#191)', () => {
  const src = read('records/ImportPreview.jsx');
  const checks = literal(src, 'PREVIEW_CHECKS');
  const previewBlocked = plain(src, 'previewBlocked');
  const WORDS = {
    'skipped-before-cutover': { kind: 'flat', word: 'skipped, before cutover date' },
    'purchase-side-only': { kind: 'neutral', word: 'purchase side only' },
    carried: { kind: 'clean', word: 'carried at the cutover date, unverified' },
  };

  test('[UAG-182] each word sits on a mark the system already has', () => {
    const marks = read('feedback/StatusMark.jsx');
    for (const [check, want] of Object.entries(WORDS)) {
      assert.deepEqual(checks[check], want, check);
      assert.match(marks, new RegExp(`\\b${want.kind}: \\{ icon:`), `${want.kind} is an existing StatusMark kind`);
    }
  });

  test('[UAG-182] each reads its cell and word, and none stops Import', () => {
    assert.match(src, /if \(c\) return <span data-check=\{r\.check\}><StatusMark kind=\{c\.kind\} label=\{`Cell \$\{r\.cell\}: \$\{c\.word\}`\}/);
    for (const check of Object.keys(WORDS)) {
      assert.equal(previewBlocked({ rows: [{ row: 2 }, { row: 3, check, cell: 'A3' }] }), false, `${check} never stops Import`);
    }
    const dts = read('records/ImportPreview.d.ts');
    for (const check of Object.keys(WORDS)) assert.ok(dts.includes(`'${check}'`), `${check} is typed`);
  });
});

describe('[5d] RecordHighlights: a field can be a link (an exception\'s Linked record)', () => {
  const src = read('records/RecordHighlights.jsx');
  const dts = read('records/RecordHighlights.d.ts');
  const table = read('data/DataTable.jsx');

  test('[5d] a field with a link draws its value as the blue reference link, and says which field opened', () => {
    assert.match(src, /import \{ RefCell \} from '\.\.\/data\/DataTable\.jsx';/, 'the system\'s own reference link, no new look');
    assert.match(src, /\{f\.link && f\.value != null && f\.value !== '' \? <span data-highlight-link><RefCell href=\{f\.link\} onOpen=\{\(\) => onLink && onLink\(f\)\}>\{f\.value\}<\/RefCell><\/span> : f\.value\}/);
    assert.match(src, /tab = 'Details', onTab, onLink, style \}\)/);
    assert.match(dts, /link\?: string;/);
    assert.match(dts, /onLink\?: \(field: HighlightField\) => void;/);
  });

  test('[5d] the link is keyboard reachable: a real anchor with an href, never taken out of the tab order', () => {
    const ref = table.match(/export function RefCell\([^\n]*/)[0];
    assert.match(ref, /<a href=\{href\}/);
    assert.match(ref, /onClick=\{\(e\) => \{ e\.preventDefault\(\); if \(onOpen\) onOpen\(\); \}\}/, 'Enter on a focused anchor fires click, so it opens');
    assert.match(ref, /textStyle\('body-3', \{ strong: true, tone: 'brand' \}\)/, 'the brand reference look, unchanged');
    assert.doesNotMatch(ref, /tabIndex/);
  });

  test('[5d] the Exceptions screen and the weighbridge card draw the Linked record through link', () => {
    const kit = readFileSync(join(ROOT, 'project/ui_kits/one_link/Exceptions.jsx'), 'utf8');
    assert.match(kit, /\{ label: 'Linked record', value: 'WBT10001599', link: '#' \}/);
    const card = read('records/weighbridge.card.html');
    assert.match(card, /\{label:'Linked record',value:'WBT10001599',link:'#'\}/);
  });
});
