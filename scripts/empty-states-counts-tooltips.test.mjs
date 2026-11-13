// Card 1.6 (UAG-265): empty lists, counts, tooltips and cut-off tables. Four defaults the web app and the phone take
// from here (fix list 99 and 129, agreed 4 Nov 2026 17:21; C-NewGRN row 8; ClerkHome row 11):
//   - an empty list is not good news: EmptyState is neutral by default, the green check only when asked for;
//   - a status kind the mark does not know is neutral, never the green check, and its word is never cut;
//   - a count says what it counts, or goes; a KPI figure and a table's first column show whole;
//   - nothing to judge yet: the Reconcile card and the running sum draw no verdict until there is something to judge.
// Also the port-backs of batch 1 changes the web app made first: kwacha as K in MarginCell (card 1.1) and "As at" on the
// counterparty overview (card 1.3).
//
//   npm test

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const COMPONENTS = join(ROOT, 'project/components');
const read = (p) => readFileSync(p, 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const stub = (name) => Object.defineProperty(function () { return null; }, 'name', { value: name });

function loadComponent(file, names, deps = {}) {
  const src = read(join(COMPONENTS, file)).replace(/^import[^\n]*$/gm, '').replace(/^export\s+/gm, '');
  const code = transformSync(src, { loader: 'jsx', jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment' }).code;
  const R = { createElement: (type, props, ...children) => ({ type: typeof type === 'function' ? type.name : type, props: props || {}, children: children.flat() }), Fragment: 'Fragment' };
  const all = { React: R, textStyle: (variant, o = {}) => ({ font: variant, color: o.color }), useInteraction: () => ({ hover: false, down: false, focusVisible: false, handlers: {} }),
    useState: (v) => [typeof v === 'function' ? v() : v, () => {}], useRef: () => ({ current: null }), useElementWidth: () => 0,
    NotSet: stub('NotSet'), Icon: stub('Icon'), Button: stub('Button'), Dot: stub('Dot'), MetaParts: stub('MetaParts'), Card: stub('Card'),
    StatusMark: stub('StatusMark'), ShareBar: stub('ShareBar'), Restricted: stub('Restricted'), RefCell: stub('RefCell'), RecordHighlights: stub('RecordHighlights'), ...deps };
  return Function(...Object.keys(all), `${code}\nreturn { ${names.join(', ')} };`)(...Object.values(all));
}
const tree = (n) => (n && typeof n === 'object' ? [n, ...(n.children || []).flatMap(tree)] : []);
const said = (n) => tree(n).flatMap((x) => (x.children || []).filter((c) => typeof c === 'string')).join(' ');

describe('[1.6] EmptyState: an empty list is not good news', () => {
  const { EmptyState } = loadComponent('feedback/EmptyState.jsx', ['EmptyState']);
  const icon = (el) => tree(el).find((n) => n.type === 'Icon');

  test('[1.6] the default empty state is neutral: a grey inbox, never the green check (fix list 129, U4)', () => {
    const el = EmptyState({ title: 'No contracts to display.' });
    assert.equal(icon(el).props.name, 'inbox');
    assert.equal(icon(el).props.color, 'var(--content-tertiary)');
    assert.notEqual(icon(el).props.name, 'circle-check');
  });

  test('[1.6] the green check is drawn only when the caller asks for done and good', () => {
    const el = EmptyState({ tone: 'success', icon: 'circle-check', title: 'Every open contract is covered.' });
    assert.equal(icon(el).props.color, 'var(--success-strong)');
    assert.equal(icon(el).props.name, 'circle-check');
  });
});

describe('[1.6] StatusMark: an unknown kind is neutral, and the word is never cut', () => {
  const { StatusMark, STATUS_KINDS } = loadComponent('feedback/StatusMark.jsx', ['StatusMark', 'STATUS_KINDS']);

  test('[1.6] a kind the mark does not know is drawn neutral, not as the green check', () => {
    const el = StatusMark({ kind: 'cancelled', label: 'Cancelled' });
    assert.equal(tree(el).find((n) => n.type === 'Icon').props.name, STATUS_KINDS.neutral.icon);
    assert.equal(el.props.style.color, STATUS_KINDS.neutral.color);
    assert.match(said(el), /Cancelled/);
  });

  test('[1.6] the word wraps whole: no nowrap, no ellipsis, no hidden overflow', () => {
    const el = StatusMark({ kind: 'attention', label: 'Proof missing for delivery note DN-2026-000412' });
    for (const n of tree(el)) {
      const s = (n.props && n.props.style) || {};
      assert.notEqual(s.whiteSpace, 'nowrap', n.type);
      assert.notEqual(s.textOverflow, 'ellipsis', n.type);
      assert.notEqual(s.overflow, 'hidden', n.type);
    }
  });
});

describe('[1.6] Count: a count says what it counts, or goes', () => {
  test('[1.6] the note no longer keeps a bare 0 on an empty list, and names the rule', () => {
    const doc = read(join(COMPONENTS, 'data/Count.jsx')) + read(join(COMPONENTS, 'data/Count.prompt.md'));
    assert.doesNotMatch(doc, /keeps (its title and )?its count, 0/);
    assert.match(doc, /says what it counts, or goes/);
    assert.match(doc, /never a bare number beside a page title/);
  });
});

describe('[1.6] KpiTile and DataTable: a number shows whole', () => {
  test('[1.6] a KPI figure is never cut with an ellipsis: a long one wraps', () => {
    const { KpiTile } = loadComponent('data/KpiTile.jsx', ['KpiTile']);
    const el = KpiTile({ label: 'Total exposure', value: 'USD 1,234,567,890.00' });
    const value = tree(el).find((n) => n.props && 'data-value' in n.props);
    assert.ok(value, 'the figure is drawn');
    assert.notEqual(value.props.style.textOverflow, 'ellipsis');
    assert.notEqual(value.props.style.whiteSpace, 'nowrap');
    assert.equal(value.props.style.overflowWrap, 'anywhere');
  });

  test('[1.6] a scrolling table does not pull itself past the card it sits in, so the first column is whole (ClerkHome row 11)', () => {
    const { DataTable } = loadComponent('data/DataTable.jsx', ['DataTable'], { useElementWidth: () => 320 });
    const t = DataTable({ rows: [{ id: 'a', item: 'GRN-2026-002083' }], columns: [{ key: 'item', label: 'Item' }], minWidth: 1240 });
    const scroller = tree(t).find((n) => n.props && n.props['data-table-scroll']);
    assert.ok(scroller, 'the table scrolls at this width');
    assert.equal(scroller.props.style.overflowX, 'auto');
    assert.equal(scroller.props.style.margin, undefined, 'no negative margin: nothing is drawn past the card');
    assert.match(said(t), /GRN-2026-002083/);
  });
});

describe('[1.6] Nothing to judge yet: no verdict until there is something to judge (C-NewGRN row 8)', () => {
  test('[1.6] the Reconcile card with outcome none draws its rows and no closing line', () => {
    const { ReconcileCard, RECONCILE_NOTHING_YET } = loadComponent('records/ReconcileCard.jsx', ['ReconcileCard', 'RECONCILE_NOTHING_YET']);
    assert.equal(RECONCILE_NOTHING_YET, 'none');
    const rows = [{ label: 'Ticket net', value: '24.500 t' }, { label: 'Lines total', value: 'none yet' }];
    const none = ReconcileCard({ rows, outcome: 'none' });
    assert.equal(tree(none).filter((n) => n.type === 'StatusMark').length, 0, 'no verdict, no icon');
    assert.match(said(none), /none yet/);
    const judged = ReconcileCard({ rows, outcome: 'beyond' });
    assert.equal(tree(judged).find((n) => n.type === 'StatusMark').props.label, 'Beyond tolerance', 'a judged card is drawn as before');
  });

  test('[1.6] the running sum reads none yet while nothing is added, with no verdict and no difference', () => {
    const { RunningSum, runningSumState } = loadComponent('records/RunningSum.jsx', ['RunningSum', 'runningSumState']);
    assert.equal(runningSumState('0', '24.500', '0.080'), 'none');
    assert.equal(runningSumState('24.420', '24.500', '0.080'), 'within');
    const el = RunningSum({ total: '0.000', target: '24.500', tolerance: '0.080' });
    assert.equal(el.props['data-running-sum'], 'none');
    assert.match(said(el), /none yet/);
    assert.doesNotMatch(said(el), /Beyond tolerance|Difference/);
    assert.equal(tree(el).filter((n) => n.type === 'StatusMark').length, 0);
  });
});

describe('[1.6] No tooltip repeats a heading (fix list 99)', () => {
  test('[1.6] no component puts its title on an element as a title attribute', () => {
    // Icon's own title names an icon that has no words (kept, as the icon button's tooltip is): not a heading.
    const files = walk(COMPONENTS).filter((p) => p.endsWith('.jsx') && !p.endsWith('core/Icon.jsx'));
    for (const f of files) {
      const src = read(f);
      assert.doesNotMatch(src, /<[a-z][a-z0-9]*\b[^>]*\stitle=\{title\}/, `${f} draws its title as a tooltip`);
    }
  });
});

describe('[1.6] Port-backs from the web app (cards 1.1 and 1.3)', () => {
  test('[1.6] MarginCell writes kwacha as K with no space and other currencies as code and a space (card 1.1)', () => {
    const { marginWords } = loadComponent('data/MarginCell.jsx', ['marginWords']);
    assert.equal(marginWords('320.00', { currency: 'ZMW' }), 'K320.00');
    assert.equal(marginWords('-800.00', { currency: 'ZMW', unit: 'per t' }), '−K800.00 per t');
    assert.equal(marginWords('11.95', { currency: 'USD', unit: 'per t' }), 'USD 11.95 per t');
    assert.equal(marginWords('-800.00', { currency: 'USD' }), 'USD −800.00');
    assert.equal(marginWords('-800.00'), '−800.00');
    assert.doesNotMatch(marginWords('320.00', { currency: 'ZMW' }), /ZMW/);
  });

  test('[1.6] the counterparty overview says As at, never As of (card 1.3)', () => {
    const src = read(join(COMPONENTS, 'records/CounterpartyOverview.jsx'));
    assert.match(src, />As at \{figure\.asOf\}</);
    assert.doesNotMatch(src, />As of /);
  });
});
