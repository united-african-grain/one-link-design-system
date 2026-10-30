// Invoice preparation and settlement screens, M7.DS.02 (UAG-200): the Invoice preparation and settlement kit (the
// invoice preparation run and its list, Record invoiced and Record payment, the receivables pipeline, GL cost
// categories, stock cost, a supplier prepayment, statements due, the settlement proposal and settlement batches), the
// trade board's money states, and the IndicativeFigure, GapBar, NettingSides and MoneyDocument components. The screens
// are rendered against a stand-in React that records the tree and runs the kit's own functions, so what a reader meets
// is checked as drawn. The card's design system contract tests (src/app/ds/**) belong to the app port; each named rule
// is proven here with this repo's own tests, under the same [M7.DS.02] names.
//
//   npm test            (after npm run build, for the published-site check)

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KITS = join(ROOT, 'project/ui_kits');
const KIT = join(KITS, 'settlement');
const ONE_LINK = join(KITS, 'one_link');
const COMPONENTS = join(ROOT, 'project/components');
const read = (p) => readFileSync(p, 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const topLevel = (src) => [...src.matchAll(/^(?:export\s+)?(?:function|const|let)\s+([A-Za-z_]\w*)/gm)].map((m) => m[1]);
const literal = (src, name) => {
  const m = src.match(new RegExp(`(?:export )?const ${name} = (\\{[\\s\\S]*?\\n\\}|\\[[^\\n]*\\]);`));
  assert.ok(m, `the source has ${name}`);
  return Function(`return (${m[1]});`)();
};
function readmeRows(md) {
  const rows = {};
  for (const line of md.split('\n')) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length !== 3 || cells[0] === 'Screen' || /^-+$/.test(cells[0])) continue;
    rows[cells[0]] = { file: cells[1].replace(/`/g, ''), states: cells[2].split('·').map((s) => s.trim()).filter(Boolean) };
  }
  return rows;
}

const NEW = { indicative: 'data/IndicativeFigure.jsx', gap: 'data/GapBar.jsx', netting: 'records/NettingSides.jsx', document: 'records/MoneyDocument.jsx' };
const SRC = {
  invoicing: read(join(KIT, 'Invoicing.jsx')), costs: read(join(KIT, 'Costs.jsx')), settlement: read(join(KIT, 'Settlement.jsx')), board: read(join(ONE_LINK, 'SettlementStates.jsx')),
  ...Object.fromEntries(Object.entries(NEW).map(([k, f]) => [k, read(join(COMPONENTS, f))])),
};
const INVOICING = literal(SRC.invoicing, 'ST_INVOICING_STATES');
const COSTS = literal(SRC.costs, 'ST_COST_STATES');
const SETTLE = literal(SRC.settlement, 'ST_SETTLE_STATES');
const BOARD = literal(SRC.board, 'ST_TRADEBOARD_STATES');
const BANNED = JSON.parse(read(join(ROOT, 'project/guidelines/banned-words.json')));

/* ------------------------------------------------------------------ A stand-in React that runs kit screens */

const el = (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity) });
const React = { createElement: el, Fragment: 'Fragment' };
const stub = (name) => Object.defineProperty(function () { return null; }, 'name', { value: name });
const STUBS = new Map();
const stubFor = (name) => { if (!STUBS.has(name)) STUBS.set(name, stub(name)); return STUBS.get(name); };

function loadKit(files, deps = {}) {
  const src = files.map((f) => read(f).replace(/^import[^\n]*$/gm, '').replace(/^export\s+/gm, '')).join('\n');
  const code = transformSync(src, { loader: 'jsx', jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment' }).code;
  const names = [...new Set(files.flatMap((f) => topLevel(read(f))))];
  const base = { React, useState: (v) => [typeof v === 'function' ? v() : v, () => {}], useEffect: () => {}, useMemo: (f) => f(), useRef: () => ({ current: null }),
    useMinWidth: () => true, useCompact: () => false, textStyle: () => ({}), kpiTiles: (t = []) => t.filter(Boolean).slice(0, 4),
    Sections: stubFor('Sections'), WithRail: stubFor('WithRail'), WithPanel: stubFor('WithPanel'), ...deps };
  const scope = new Proxy(base, {
    has: (t, k) => typeof k === 'string' && (k in t || !(k in globalThis)),
    get: (t, k) => (k in t ? t[k] : typeof k === 'string' && /^[A-Z]/.test(k) && !/^[A-Z_]+$/.test(k) ? stubFor(k) : undefined),
  });
  return Function('scope', `with (scope) {\n${code}\nreturn { ${names.join(', ')} };\n}`)(scope);
}

function render(node, kit) {
  if (node == null || typeof node === 'boolean') return null;
  if (Array.isArray(node)) return node.map((n) => render(n, kit));
  if (typeof node !== 'object' || !('type' in node)) return node;
  if (typeof node.type === 'function' && STUBS.get(node.type.name) !== node.type && Object.values(kit).includes(node.type)) {
    return render(node.type({ ...node.props, children: node.children.length > 1 ? node.children : node.children[0] }), kit);
  }
  const typeName = typeof node.type === 'function' ? node.type.name : node.type;
  const props = {};
  for (const [k, v] of Object.entries(node.props)) props[k] = k === 'style' || typeof v === 'function' ? v : renderValue(v, kit);
  return { type: typeName, props, children: node.children.map((c) => render(c, kit)) };
}
function renderValue(v, kit) {
  if (v && typeof v === 'object' && 'type' in v && 'props' in v) return render(v, kit);
  if (Array.isArray(v)) return v.map((x) => renderValue(x, kit));
  if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, typeof x === 'function' ? x : renderValue(x, kit)]));
  return v;
}
const isNode = (v) => v && typeof v === 'object' && !Array.isArray(v) && 'type' in v && 'props' in v;
const inProps = (v) => (isNode(v) ? [v] : Array.isArray(v) ? v.flatMap(inProps) : v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype ? Object.values(v).flatMap(inProps) : []);
const nodes = (n) => (isNode(n) ? [n, ...(n.children || []).flatMap(nodes), ...Object.entries(n.props || {}).filter(([k]) => k !== 'style').flatMap(([, v]) => inProps(v)).flatMap(nodes)] : Array.isArray(n) ? n.flatMap(nodes) : []);
const PROP_TEXT = ['hint', 'defaultValue', 'defaultReason', 'defaultOffset', 'counterparty', 'reference', 'generated', 'full', 'label', 'title', 'aria-label', 'placeholder', 'caption', 'value', 'subject', 'context', 'name', 'subtitle', 'kind', 'objects', 'link', 'reason', 'meta', 'note', 'error'];

/** Every word a reader meets in a rendered tree: text, the text props of stand-ins, and the cells a DataTable draws. */
function wordsOf(tree, kit) {
  const out = [];
  const walkValue = (v, key) => {
    if (v == null || typeof v === 'boolean') return;
    if (typeof v === 'string' || typeof v === 'number') { if (key !== 'kind' || /\s/.test(String(v))) out.push(String(v)); return; }
    if (Array.isArray(v)) { v.forEach((x) => walkValue(x, key)); return; }
    if (typeof v === 'object' && 'type' in v && 'props' in v) { walkNode(render(v, kit)); return; }
    if (typeof v === 'object') for (const [k, x] of Object.entries(v)) if (k !== 'style' && typeof x !== 'function') walkValue(x, k);
  };
  const walkNode = (n) => {
    for (const m of nodes(n)) {
      const own = (m.children || []).filter((c) => typeof c === 'string' || typeof c === 'number').join('');
      if (own) out.push(own);
      const p = m.props || {};
      for (const k of PROP_TEXT) if (k in p) walkValue(p[k], k);
      for (const k of ['fields', 'components', 'total', 'basis', 'items', 'headerRight', 'right', 'status', 'actions', 'footer', 'tabs', 'cells', 'file', 'tiles', 'options', 'checkpoints']) if (k in p) walkValue(p[k], k);
      if (m.type === 'DataTable' || m.type === 'ImportPreview') {
        for (const c of p.columns || []) walkValue(c.label, 'label');
        for (const r of p.rows || []) for (const c of p.columns || []) walkValue(c.render ? c.render(r, 0) : r[c.key], c.key);
      }
    }
  };
  walkNode(tree);
  return out.map((s) => s.trim()).filter(Boolean);
}

const ds = loadKit([join(COMPONENTS, 'records/RunningSum.jsx'), ...Object.values(NEW).map((f) => join(COMPONENTS, f))]);
const DEPS = Object.fromEntries(Object.entries(ds));
const SHELL_PARTS = Object.fromEntries(['Sections', 'WithRail', 'WithPanel', 'PageHead', 'FigureStrip', 'ScrollRow', 'SectionLabel', 'Page'].map((n) => [n, stubFor(n)]));
// The new components render for real inside the screens, so a test reads what they draw.
const kit = loadKit([...['Home.jsx', 'TradingStates.jsx', 'TradeBoard.jsx', 'SettlementStates.jsx'].map((f) => join(ONE_LINK, f)), ...['Invoicing.jsx', 'Costs.jsx', 'Settlement.jsx'].map((f) => join(KIT, f)),
  ...Object.values(NEW).map((f) => join(COMPONENTS, f))], { ...SHELL_PARTS, ...DEPS });
const draw = (screen, state) => render(el(kit[screen], { state, onOpen: () => {} }), kit);
const drawEl = (C, props = {}) => render(el(C, props), kit);
const words = (screen, state) => wordsOf(draw(screen, state), kit);
const findAll = (tree, type) => nodes(tree).filter((n) => n.type === type);
const tables = (tree) => findAll(tree, 'DataTable');
const tableWith = (tree, label) => tables(tree).find((t) => t.props.columns.some((c) => c.label === label));
const labels = (t) => t.props.columns.map((c) => c.label);
const cell = (t, row, key) => { const c = t.props.columns.find((x) => x.key === key); return c.render ? c.render(row, 0) : row[key]; };
const textOf = (v) => { if (v == null) return ''; const r = typeof v === 'object' ? render(v, kit) : v; return typeof r === 'string' || typeof r === 'number' ? String(r) : wordsOf(r, kit).join(' '); };
const buttons = (tree) => [...findAll(tree, 'Button'), ...findAll(tree, 'PressButton')];
const button = (tree, label) => buttons(tree).find((b) => b.children.join('') === label);
const fieldsOf = (tree) => findAll(tree, 'RecordHighlights')[0].props.fields;
const fieldValue = (tree, label) => { const f = fieldsOf(tree).find((x) => textOf(x.label) === label); return f ? f.value : undefined; };

const WEB = { ...INVOICING, ...COSTS, ...SETTLE };
const ALL = [...Object.entries(WEB).flatMap(([s, list]) => list.map((st) => [s, st])), ...BOARD.map((st) => ['TradeBoard', st])];

/* ------------------------------------------------------------------ Composition */

const tokens = new Set(walk(join(ROOT, 'project/tokens')).filter((p) => p.endsWith('.css')).flatMap((p) => [...read(p).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])));
const loader = read(join(COMPONENTS, '_loader.js'));
const dsFiles = JSON.parse(loader.match(/var FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
const published = new Set(dsFiles.flatMap((f) => topLevel(read(join(COMPONENTS, f)))));
const kitNames = new Set([ONE_LINK, KIT].flatMap((d) => readdirSync(d).filter((n) => n.endsWith('.jsx')).flatMap((n) => topLevel(read(join(d, n))))));
function compositionProblems(src) {
  const components = new Set([...published, ...kitNames, 'React']);
  const problems = [];
  for (const m of src.matchAll(/(^|[\s{;'"`])(--[a-z0-9-]+)['"]?\s*:/g)) problems.push(`defines token ${m[2]}`);
  for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) if (!tokens.has(m[1])) problems.push(`uses unknown token ${m[1]}`);
  for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g)) problems.push(`literal colour ${m[0]}`);
  for (const m of src.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) if (!components.has(m[1])) problems.push(`unknown component <${m[1]}>`);
  return problems;
}
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* ------------------------------------------------------------------ AC 1: the kit lists the screens */

describe('[M7.DS.02] the Invoice preparation and settlement kit', () => {
  test('[M7.DS.02] the design system site has an "Invoice preparation and settlement" kit that lists screens (f), (g), (h), (j), (k), (l), (m), (n), (t) and (u) with their files and states, each opening by ?screen=&state= (AC 1)', () => {
    const index = read(join(KIT, 'index.html'));
    assert.match(index, /@dsCard group="One Link"[^>]*name="Invoice preparation and settlement"/, 'the kit is a card on the site');
    for (const f of ['Invoicing.jsx', 'Costs.jsx', 'Settlement.jsx', '../one_link/SettlementStates.jsx', '../one_link/TradeBoard.jsx']) assert.ok(index.includes(`'${f}'`), f);
    assert.match(index, /const STATES = \{ \.\.\.K\.ST_INVOICING_STATES, \.\.\.K\.ST_COST_STATES, \.\.\.K\.ST_SETTLE_STATES, TradeBoard: K\.ST_TRADEBOARD_STATES \}/);
    assert.match(index, /params\.get\('screen'\)/);
    const order = literal(index.replace(/const ORDER = (\[[^\n]*\]);/, 'const ORDER = $1;'), 'ORDER');
    assert.deepEqual([...order].sort(), [...Object.keys(WEB), 'TradeBoard'].sort(), 'every screen is in the screen control');
    const rows = readmeRows(read(join(KIT, 'README.md')));
    for (const [file, states] of [['Invoicing.jsx', INVOICING], ['Costs.jsx', COSTS], ['Settlement.jsx', SETTLE]]) for (const [s, list] of Object.entries(states)) assert.deepEqual(rows[s], { file, states: list }, s);
    assert.deepEqual(rows.TradeBoard, { file: '../one_link/SettlementStates.jsx', states: BOARD });
    // (f) run, (g) dialogs, (h) pipeline, (j) categories, (k) stock cost, (l) statements due, (m) prepayment, (n) proposal, (t) batches, (u) withdrawn.
    assert.ok(INVOICING.InvoicePrepRun.includes('Withdrawn'), '(u)');
    for (const st of ['Record invoiced', 'Record payment']) assert.ok(INVOICING.ContractReceivables.includes(st), `(g) ${st}`);
    for (const s of ['SettlementPipeline', 'CostCategories', 'StockCost', 'StatementsDue', 'SupplierPrepayment', 'SettlementProposal', 'SettlementBatches']) assert.ok(WEB[s], s);
    for (const st of ['Pending approval', 'Approved', 'Paid', 'Reverse', 'Reversed', 'Net less with a reason', 'Incomplete', 'Out of date', 'Nothing to net']) assert.ok(SETTLE.SettlementProposal.includes(st), `(n) ${st}`);
    for (const st of ['Incomplete', 'Out of date', 'Nothing to net', 'Nothing to settle']) assert.ok(SETTLE.SettlementBatches.includes(st), `(t) ${st}`);
    assert.match(read(join(ROOT, 'README.md')), /ui_kits\/settlement\//, 'the repo README links the kit');
  });

  test('[M7.DS.02] every screen and named state renders, including withdrawn, incomplete, out of date, nothing to net, nothing to settle and paid (AC 1, 3)', () => {
    for (const [s, st] of ALL) {
      const tree = draw(s, st);
      if (st === 'Loading') assert.ok(findAll(tree, 'CardSkeleton').length > 0, `${s} ${st}: a skeleton, no text`);
      else assert.ok(words(s, st).length > 3, `${s} ${st} draws something`);
    }
    assert.equal(textOf(findAll(draw('InvoicePrepRun', 'Withdrawn'), 'RecordHighlights')[0].props.status), 'Withdrawn');
    assert.match(words('InvoicePrepRun', 'Withdrawn').join(' | '), /Withdrawn by N\. Phiri on 01 Oct 2026, 10:05: Riverbend Milling disputes/);
    assert.equal(buttons(draw('InvoicePrepRun', 'Withdrawn')).filter((b) => ['Mark prepared', 'Withdraw', 'Export', 'Exclude line'].includes(b.children.join(''))).length, 0, 'a withdrawn run has no actions');
    const batches = tableWith(draw('SettlementBatches', 'Batches'), 'Batch');
    assert.deepEqual(batches.props.rows.map((r) => findAll(render(cell(batches, r, 'status'), kit), 'StatusMark')[0].props.label), ['Draft', 'Pending approval', 'Approved', 'Rejected', 'Paid'], '(t) the five statuses');
    assert.match(words('SettlementBatches', 'Incomplete').join(' | '), /STB-0032 is incomplete: no exchange rate for 30 Sep 2026/);
    assert.match(words('SettlementBatches', 'Out of date').join(' | '), /STB-0031 is out of date/);
    const nn = tableWith(draw('SettlementBatches', 'Nothing to net'), 'Batch');
    assert.match(wordsOf(render(nn.props.expand(nn.props.rows.find((r) => r.id === nn.props.expanded[0])), kit), kit).join(' | '), /STL-0143 \| Cameron Estates \| 9,030\.40 \| 0\.00 \| 9,030\.40 \| Nothing to net/);
    assert.match(words('SettlementBatches', 'Nothing to settle').join(' | '), /No settlement batches to display\.[\s\S]*Nothing to settle/);
    assert.equal(textOf(findAll(draw('SettlementProposal', 'Paid'), 'RecordHighlights')[0].props.status), 'Paid');
    assert.match(words('SettlementProposal', 'Incomplete').join(' | '), /Submit for approval is not allowed|Incomplete: no exchange rate for 27 Sep 2026/);
    assert.equal(button(draw('SettlementProposal', 'Incomplete'), 'Submit for approval').props.disabled, true, 'an incomplete proposal cannot be submitted');
    assert.equal(button(draw('SettlementProposal', 'Out of date'), 'Submit for approval').props.disabled, true, 'nor an out of date one');
    assert.equal(findAll(draw('SettlementProposal', 'Nothing to net'), 'NettingSides').length + findAll(draw('SettlementProposal', 'Nothing to net'), 'Card').length > 0, true);
    assert.match(words('SettlementProposal', 'Nothing to net').join(' | '), /Nothing to net[\s\S]*Net to pay the farmer \| USD 30,560\.40/);
  });

  test('[M7.DS.02] each screen composes only published components and tokens: no token defined, no literal colour, no bespoke component (AC 3)', () => {
    for (const [name, src] of Object.entries(SRC)) assert.deepEqual(compositionProblems(code(src)), [], name);
    for (const f of Object.values(NEW)) assert.ok(dsFiles.includes(f), `${f} is published through the loader`);
    for (const src of [SRC.invoicing, SRC.costs, SRC.settlement, SRC.board]) {
      const c = code(src);
      assert.doesNotMatch(c, /RestrictedCell|name="lock"|icon="lock"/, 'the Restricted component, never a hand-drawn lock or the older cell');
      assert.doesNotMatch(c, /Spinner|@keyframes|animation:|boxShadow|fontFamily|fontWeight|textTransform/, 'no bespoke styling: no shadow, font or uppercase of its own');
    }
  });

  test('[M7.DS.02] both 1440 and 390 are drawn: a dialog becomes a sheet on a phone, and every wide table scrolls inside its own container (AC 3)', () => {
    for (const src of [SRC.invoicing, SRC.costs, SRC.settlement]) assert.match(src, /useStSheet\(\)/);
    assert.match(SRC.invoicing, /export function useStSheet\(\) \{ return !useMinWidth\(768\); \}/);
    for (const [s, st] of ALL) for (const t of tables(draw(s, st))) assert.ok(t.props.minWidth > 0 || t.props.minWidth === undefined, `${s} ${st}`);
    for (const [s, st, title] of [['InvoicePrepRun', 'Exclude line', 'Exclude line'], ['ContractReceivables', 'Record invoiced', 'Record invoiced, SYN4845'], ['SettlementProposal', 'Record payment', 'Record payment, STL-0142']]) {
      const d = [...findAll(draw(s, st), 'Dialog'), ...findAll(draw(s, st), 'ReasonDialog')].find((x) => textOf(x.props.title) === title);
      assert.ok(d && 'sheet' in d.props, `${s} ${st}: the dialog takes sheet`);
    }
  });

  test('[M7.DS.02] every working button draws its working state', () => {
    const busy = (s, st, label) => buttons(draw(s, st)).some((b) => b.children.join('') === label && b.props.loading === true);
    for (const [s, st, label] of [['InvoicePrepRuns', 'Starting', 'Start run'], ['InvoicePrepRun', 'Submitting', 'Submit for approval'], ['InvoicePrepRun', 'Marking prepared', 'Mark prepared'], ['InvoicePrepRun', 'Exporting', 'Export'],
      ['ContractReceivables', 'Recording invoice', 'Record invoiced'], ['ContractReceivables', 'Recording payment', 'Record payment'], ['CostCategories', 'Saving code', 'Save'], ['StockCost', 'Exporting', 'Export'],
      ['SupplierPrepayment', 'Reversing', 'Reverse'], ['SettlementProposal', 'Submitting', 'Submit for approval'], ['SettlementProposal', 'Recording payment', 'Record payment']]) {
      assert.equal(busy(s, st, label), true, `${s} ${st}: ${label}`);
    }
    for (const [s, st] of [['CostCategories', 'Saving change'], ['SupplierPrepayment', 'Reversing']]) assert.equal(findAll(draw(s, st), 'ReasonDialog')[0].props.busy, true, `${s} ${st}`);
  });
});

/* ------------------------------------------------------------------ (f), (u) the invoice preparation run */

describe('[M7.DS.02] the invoice preparation run (AC 1f, 1u)', () => {
  test('[M7.DS.02] the run shows its period, contracts, lines with the reference chain, excluded lines, loads awaiting destination weight, costs for reference and export', () => {
    const tree = draw('InvoicePrepRun', 'Waiting for review');
    assert.deepEqual(fieldsOf(tree).map((f) => textOf(f.label)), ['Period', 'Contracts', 'Loads prepared', 'Loads blocked', 'Amount', 'Prepared by', 'Waiting for']);
    const lines = tableWith(tree, 'Load');
    assert.deepEqual(labels(lines), ['Contract', 'Load', 'Basis', 'Weight (t)', 'Price (USD/t)', 'Amount (USD)', 'Status', '']);
    const blocked = lines.props.rows.find((r) => r.id === 'KAL-11');
    assert.equal(textOf(cell(lines, blocked, 'status')), 'Blocked: no mill offload', 'blocked, not missing');
    assert.deepEqual([blocked.weight, blocked.amount], ['', ''], 'a blocked load is in no total');
    const total = lines.props.rows.find((r) => r.total);
    assert.deepEqual([total.weight, total.amount], ['134.970', '37,973.79'], 'the total is the ready lines only');
    assert.equal(findAll(render(cell(lines, blocked, 'id'), kit), 'RefCell').length, 1, 'a blocked load is a link');
    assert.ok(findAll(render(cell(lines, blocked, 'action'), kit), 'Button').some((b) => b.children.join('') === 'Record offload'));
    assert.match(textOf(cell(lines, lines.props.rows[0], 'basis')), /Delivered, offloaded weight/);
    assert.match(textOf(cell(lines, lines.props.rows.find((r) => r.id === 'FD-0139'), 'basis')), /Collected, collected weight, grade 1/);
    const chain = findAll(draw('InvoicePrepRun', 'Reference chain'), 'Dialog')[0];
    assert.match(wordsOf(chain, kit).join(' | '), /Reference chain[\s\S]*Delivery note \| DN 3342[\s\S]*Goods received note \| GRN10000418[\s\S]*Weighbridge ticket \| WBT 7781/);
    const out = tableWith(draw('InvoicePrepRun', 'Line excluded'), 'Load');
    const ex = out.props.rows.find((r) => r.id === 'ZBS-03');
    assert.match(textOf(cell(out, ex, 'status')), /Excluded[\s\S]*Shortage claim SC-0007 is open with Crest Milling/, 'an excluded line stays with its reason');
    assert.equal(out.props.rows.find((r) => r.total).amount, '28,389.51', 'and leaves the total');
    assert.equal(textOf(findAll(draw('InvoicePrepRun', 'Exclude line'), 'ReasonDialog')[0].props.confirmLabel), 'Exclude line');
    assert.deepEqual(tableWith(draw('InvoicePrepRun', 'Awaiting destination weight'), 'Load').props.rows.map((r) => r.id), ['KAL-11'], 'the awaiting destination weight view');
    assert.match(words('InvoicePrepRun', 'Waiting for review').join(' | '), /Contract costs[\s\S]*For reference: not in any line or amount[\s\S]*Transport/);
    assert.equal(button(draw('InvoicePrepRun', 'Waiting for review'), 'Export').props.disabled, true, 'export waits until the run is prepared');
    assert.equal(button(draw('InvoicePrepRun', 'Prepared'), 'Export').props.disabled, false);
    assert.equal(findAll(draw('InvoicePrepRun', 'Export preview'), 'MoneyDocument').length + findAll(draw('InvoicePrepRun', 'Export preview'), 'Card').length > 0, true);
    assert.equal(textOf(findAll(draw('InvoicePrepRun', 'Withdraw'), 'ReasonDialog')[0].props.confirmLabel), 'Withdraw', 'withdrawing takes a reason');
  });

  test('[M7.DS.02] the operations lead builds and submits the run; Finance reviews, marks it prepared, exports or withdraws it', () => {
    assert.ok(button(draw('InvoicePrepRun', 'Lines prepared'), 'Submit for approval'), 'Submit for approval (UX-33), never Submit for review');
    assert.ok(!button(draw('InvoicePrepRun', 'Lines prepared'), 'Mark prepared'));
    assert.ok(button(draw('InvoicePrepRun', 'Waiting for review'), 'Mark prepared'));
    assert.equal(textOf(fieldValue(draw('InvoicePrepRun', 'Waiting for review'), 'Waiting for')), 'N. Phiri');
    assert.equal(textOf(findAll(draw('InvoicePrepRun', 'Prepared'), 'RecordHighlights')[0].props.status), 'Prepared');
    assert.doesNotMatch(SRC.invoicing, /Submit for review|Export CSV|Lock run/);
  });
});

/* ------------------------------------------------------------------ AC 4: indicative */

describe('[M7.DS.02] an indicative figure (AC 4)', () => {
  test('[M7.DS.02] an indicative figure cannot render without its "Indicative, not a valuation" label', () => {
    assert.equal(ds.INDICATIVE_LABEL, 'Indicative, not a valuation');
    for (const props of [{ value: 'USD 504.90 per t' }, { value: '504.90', label: null, name: 'Weighted average cost' }, { value: '504.90', name: '' }, { restricted: true }, { notSet: true }]) {
      const said = wordsOf(drawEl(kit.IndicativeFigure, props), kit).join(' | ');
      assert.match(said, /Indicative, not a valuation/, JSON.stringify(props));
      assert.match(said, /^Indicative/, `${JSON.stringify(props)}: the name starts with Indicative`);
    }
    const inline = drawEl(kit.IndicativeFigure, { variant: 'inline', value: '504.90', label: '' });
    assert.ok(nodes(inline).some((n) => n.props && n.props['aria-label'] === 'Indicative, not a valuation' && n.children.join('') === 'Indicative'), 'a table cell keeps the word and the label');
    assert.equal(ds.indicativeName('Weighted average cost'), 'Indicative weighted average cost');
    assert.ok(!/label/.test(read(join(COMPONENTS, 'data/IndicativeFigure.d.ts')).match(/interface IndicativeFigureProps \{[\s\S]*?\}/)[0].replace(/\/\*\*[\s\S]*?\*\//g, '')), 'there is no label prop to switch it off');
  });

  test('[M7.DS.02] Calculation details name the purchase contract cost of the lot as the basis, the cost categories it leaves out and the exchange rate with its date', () => {
    const c = ds.indicativeCalc({ name: 'Weighted average cost', value: 'USD 504.90 per t', leavesOut: ['Transport', 'Clearing Docs'], rate: 'ZMW 25.00 per USD', rateDate: '20 Sep 2026' });
    const basis = Object.fromEntries(c.basis.map((r) => [r.label, textOf(r.value)]));
    assert.match(basis.Basis, /purchase contract cost of each lot/);
    assert.equal(basis['Leaves out'], 'Transport, Clearing Docs');
    assert.equal(basis['Exchange rate'], 'ZMW 25.00 per USD');
    assert.equal(basis['Rate as at'], '20 Sep 2026');
    assert.equal(basis.Label, 'Indicative, not a valuation');
    assert.equal(c.name, 'Indicative weighted average cost');
    const noRate = ds.indicativeCalc({ value: 'x' });
    assert.equal(noRate.basis.find((r) => r.label === 'Exchange rate').value.type, kit.NotSet || noRate.basis.find((r) => r.label === 'Exchange rate').value.type, 'no rate is Not set');
    assert.equal(render(noRate.basis.find((r) => r.label === 'Exchange rate').value, kit).type, 'NotSet');
    // On the kit: stock cost's weighted average is an IndicativeFigure and its Calculation details carry this basis.
    const tree = draw('StockCost', 'Calculation details');
    const calc = findAll(tree, 'CalculationDetails')[0].props;
    const kb = Object.fromEntries(calc.basis.map((r) => [r.label, textOf(r.value)]));
    assert.match(kb.Basis, /purchase contract cost of each lot/);
    assert.match(kb['Leaves out'], /^Transport, Transport to be Recovered, .*Commissions$/);
    assert.deepEqual([kb['Exchange rate'], kb['Rate as at']], ['ZMW 25.00 per USD', '20 Sep 2026']);
    assert.match(textOf(calc.name), /^Indicative weighted average cost/);
    const holdings = tableWith(tree, 'Weighted average cost (USD/t)');
    assert.equal(holdings.props.columns.find((c) => c.key === 'average').render(holdings.props.rows[0]).type, kit.IndicativeFigure, 'each weighted average is an IndicativeFigure');
    assert.match(words('StockCost', 'Holdings').join(' | '), /Indicative, not a valuation/);
    const lots = tableWith(render(holdings.props.expand(holdings.props.rows[0]), kit), 'Rate as at');
    assert.deepEqual(holdings.props.expanded, ['h1'], 'Lots and Calculation details open the wheat holding');
    assert.ok(['Agreed a tonne', 'Rate', 'Rate as at', 'Cost (USD/t)', 'Cost (USD)'].every((l) => labels(lots).includes(l)), 'each converted lot shows its rate and as-at date');
    for (const src of [SRC.costs, SRC.indicative]) assert.doesNotMatch(code(src).replace(/not a valuation/g, ''), /[Vv]aluation|[Mm]onth-end value/, 'no field is named a valuation');
  });
});

/* ------------------------------------------------------------------ AC 5: invoice-ready data and Record invoiced */

describe('[M7.DS.02] invoice-ready data (AC 5)', () => {
  test('[M7.DS.02] the invoice-ready document header reads "not a tax invoice" and exposes no number, issue or send action', () => {
    const doc = drawEl(kit.MoneyDocument, { kind: 'invoice-ready', reference: 'IPR-0009', fields: [['Period', 'September 2026']], columns: [{ key: 'a', label: 'Load' }], rows: [{ id: '1', a: 'KAL-07' }] });
    const header = nodes(doc).find((n) => n.props && 'data-document-header' in n.props);
    const footer = nodes(doc).find((n) => n.props && 'data-document-footer' in n.props);
    assert.match(wordsOf(header, kit).join(' | '), /Invoice-ready data \| Not a tax invoice/);
    assert.match(wordsOf(footer, kit).join(' | '), /Not a tax invoice/);
    assert.equal(buttons(doc).length, 0, 'no action on the document');
    assert.doesNotMatch(read(join(COMPONENTS, 'records/MoneyDocument.d.ts')), /actions|onIssue|onSend|number\?:/, 'no slot for an action or a number');
    const preview = draw('InvoicePrepRun', 'Export preview');
    assert.equal(findAll(preview, 'MoneyDocument').length === 0 ? nodes(preview).filter((n) => n.props && n.props['data-money-document'] === 'invoice-ready').length : 1, 1, 'the export preview is the invoice-ready document');
    const banner = findAll(draw('InvoicePrepRun', 'Prepared'), 'Banner')[0];
    assert.deepEqual([textOf(banner.props.title), /^Not a tax invoice\./.test(wordsOf(banner, kit)[0])], ['Invoice-ready data', true], 'a prepared run says Invoice-ready data: Not a tax invoice');
    for (const [s, st] of ALL) {
      for (const b of buttons(draw(s, st))) assert.doesNotMatch(b.children.join(''), /^(Issue|Send|Fiscalise|Generate|Raise|Invoice)\b|invoice number/i, `${s} ${st}: ${b.children.join('')}`);
      assert.doesNotMatch(words(s, st).join(' | '), /[Ii]nvoice number|Invoice No\b|[Ff]iscalis/, `${s} ${st}`);
    }
  });

  test('[M7.DS.02] the record-invoiced dialog\'s reference field is free text with no generator', () => {
    const d = findAll(draw('ContractReceivables', 'Record invoiced'), 'Dialog')[0];
    const field = findAll(d, 'Field').find((f) => textOf(f.props.label) === 'UAG invoice reference');
    assert.ok(field, 'labelled UAG invoice reference');
    const input = findAll(field, 'Input')[0];
    assert.deepEqual([input.props.type, input.props.defaultValue, input.props.placeholder, input.props.readOnly, input.props.disabled], ['text', '', undefined, undefined, false], 'free text, empty, no suggestion');
    assert.equal(findAll(field, 'Select').length + findAll(field, 'Button').length, 0, 'no picker and no generate button');
    assert.doesNotMatch(code(SRC.invoicing), /next(Invoice|Number|Ref)|generate(Invoice|Number|Ref)|sequence\(|INV-\d|suggest/i, 'nothing generates, suggests or sequences a number');
    assert.ok(INVOICING.ContractReceivables.includes('Amount differs'));
    assert.ok(findAll(findAll(draw('ContractReceivables', 'Amount differs'), 'Dialog')[0], 'Field').some((f) => textOf(f.props.label) === 'Reason'), 'a different amount needs a reason');
  });

  test('[M7.DS.02] Record payment uses the day\'s exchange rate and, with none, asks for it (Map D-40)', () => {
    assert.match(wordsOf(findAll(draw('ContractReceivables', 'Record payment'), 'Dialog')[0], kit).join(' | '), /Exchange rate \| ZMW 25\.00 per USD \| Rate for \| 05 Oct 2026/);
    const none = wordsOf(findAll(draw('ContractReceivables', 'No rate for the day'), 'Dialog')[0], kit).join(' | ');
    assert.match(none, /No exchange rate USD\/ZMW for 30 Oct 2026[\s\S]*Rate \(ZMW per USD\)[\s\S]*Source/);
  });
});

/* ------------------------------------------------------------------ AC 6: the settlement statement and partial netting */

describe('[M7.DS.02] the settlement proposal and statement (AC 1n, 6)', () => {
  test('[M7.DS.02] the settlement statement header never renders "payment instruction" and has no bank field', () => {
    const tree = draw('SettlementProposal', 'Settlement statement');
    const doc = nodes(tree).find((n) => n.props && n.props['data-money-document'] === 'settlement-statement');
    assert.ok(doc, 'the Statement tab is the settlement statement');
    const header = nodes(doc).find((n) => n.props && 'data-document-header' in n.props);
    assert.match(wordsOf(header, kit).join(' | '), /^Settlement statement/);
    for (const [s, st] of ALL) assert.doesNotMatch(words(s, st).join(' | '), /payment instruction/i, `${s} ${st}`);
    for (const src of [...Object.values(SRC), read(join(KIT, 'README.md')), read(join(KIT, 'index.html')), read(join(COMPONENTS, 'records/settlement.card.html'))]) assert.doesNotMatch(src, /payment instruction/i);
    const withBank = drawEl(kit.MoneyDocument, { kind: 'settlement-statement', fields: [['Currency', 'USD'], ['Bank account', '0012 3345'], ['Branch code', '0401'], ['IBAN', 'x'], ['Swift', 'y']] });
    assert.doesNotMatch(wordsOf(withBank, kit).join(' | '), /Bank|Branch|IBAN|Swift|0012 3345/, 'a bank field passed in is dropped');
    for (const [s, st] of SETTLE.SettlementProposal.map((x) => ['SettlementProposal', x])) for (const f of findAll(draw(s, st), 'Field')) assert.doesNotMatch(textOf(f.props.label), ds.BANK_FIELD, `${st}: no bank detail field`);
  });

  test('[M7.DS.02] a partial-netting confirmation cannot confirm without a reason', () => {
    assert.equal(ds.canConfirmPartial({ offset: '19,570.00', full: '23,760.00', reason: '' }), false);
    assert.equal(ds.canConfirmPartial({ offset: '19,570.00', full: '23,760.00', reason: 'too short' }), false);
    assert.equal(ds.canConfirmPartial({ offset: '23,760.00', full: '23,760.00', reason: 'Seed carries to next season' }), false, 'the full offset is not a partial netting');
    assert.equal(ds.canConfirmPartial({ offset: '', full: '23,760.00', reason: 'Seed carries to next season' }), false);
    assert.equal(ds.canConfirmPartial({ offset: '19,570.00', full: '23,760.00', reason: 'Seed carries to next season' }), true);
    const empty = findAll(draw('SettlementProposal', 'Net less'), 'Dialog')[0];
    assert.equal(textOf(empty.props.title), 'Net less, with a reason');
    assert.equal(findAll(render(empty.props.footer, kit), 'Button').find((b) => b.children.join('') === 'Confirm').props.disabled, true, 'Confirm is disabled with no reason');
    const filled = findAll(draw('SettlementProposal', 'Net less with a reason'), 'Dialog')[0];
    assert.equal(findAll(render(filled.props.footer, kit), 'Button').find((b) => b.children.join('') === 'Confirm').props.disabled, false, 'and enabled with one');
    assert.match(textOf(fieldValue(draw('SettlementProposal', 'Netted less'), 'Reason for netting less')), /Seed DN 3321 carries to the next season/, 'the reason stays on the proposal');
  });

  test('[M7.DS.02] the proposal shows both sides in netting order, the exchange rate with its date, and Pending approval, Approved, Paid and a reversal', () => {
    const n = ds.nettingOf({ payable: kit.ST_PAYABLE, owed: kit.ST_OWED });
    assert.deepEqual([n.grain, n.debts, n.offset, n.net, n.stillOwed], ['30,560.40', '23,760.00', '23,760.00', '6,800.40', '0.00']);
    assert.equal(n.lines[0].kind, 'prepayment', 'the prepayment nets first (RL-NET-ORDER)');
    assert.deepEqual(n.lines.map((l) => l.order), [1, 2, 3, 4]);
    const p = ds.nettingOf({ payable: kit.ST_PAYABLE, owed: kit.ST_OWED, partial: '19,570.00' });
    assert.deepEqual([p.offset, p.net, p.stillOwed, p.partial, p.lines[3].recovered], ['19,570.00', '10,990.40', '4,190.00', true, '0.00']);
    const tree = draw('SettlementProposal', 'Proposal');
    assert.match(wordsOf(tree, kit).join(' | '), /Owed to the farmer for grain[\s\S]*Owed by the farmer[\s\S]*Order[\s\S]*Grain payable \| USD 30,560\.40 \| Offset \| USD 23,760\.00 \| Net to pay the farmer \| USD 6,800\.40/);
    assert.deepEqual(['Exchange rate', 'Rate date'].map((l) => textOf(fieldValue(tree, l))), ['ZMW 25.00 per USD', '27 Sep 2026']);
    const st = (x) => textOf(findAll(draw('SettlementProposal', x), 'RecordHighlights')[0].props.status);
    assert.deepEqual(['Proposal', 'Pending approval', 'Approved', 'Paid', 'Reversed'].map(st), ['Draft', 'Pending approval', 'Approved', 'Paid', 'Reversed']);
    assert.ok(button(draw('SettlementProposal', 'Approver view'), 'Approve') && button(draw('SettlementProposal', 'Approver view'), 'Reject'));
    assert.ok(button(draw('SettlementProposal', 'Paid'), 'Reverse'));
    assert.equal(textOf(findAll(draw('SettlementProposal', 'Reverse'), 'ReasonDialog')[0].props.confirmLabel), 'Reverse', 'a reversal takes a reason');
    assert.deepEqual(Object.values(ds.SETTLEMENT_STATUS).map((s) => s.word), ['Draft', 'Pending approval', 'Approved', 'Rejected', 'Paid', 'Reversed']);
  });
});

/* ------------------------------------------------------------------ (h) the gap bar */

describe('[M7.DS.02] the receivables pipeline (AC 1h)', () => {
  test('[M7.DS.02] a gap bar renders both gaps from the same row without a stored figure', () => {
    const row = { collected: '4,812.40', invoiced: '3,460.00', paid: '2,888.46', toInvoice: '999.99', toPay: '999.99' };
    assert.deepEqual(ds.gapsOf(row), { toInvoice: '1,352.40', toPay: '571.54' }, 'collected less invoiced, invoiced less paid; the stored gap fields are ignored');
    assert.deepEqual(ds.gapsOf({ collected: '500.000', invoiced: '400.000', paid: '350.000' }), { toInvoice: '100.00', toPay: '50.00' }, 'M7.SET.04 AC 1');
    assert.deepEqual(ds.gapsOf({ collected: '100.00', invoiced: '120.00', paid: '130.00' }), { toInvoice: '0.00', toPay: '0.00' }, 'never below zero');
    const bar = drawEl(kit.GapBar, { row });
    const said = (k) => wordsOf(nodes(bar).find((n) => n.props && n.props['data-gap'] === k), kit).join(' ');
    assert.equal(said('to-invoice'), 'Gap to invoice 1,352.40 t');
    assert.equal(said('to-pay'), 'Gap to pay 571.54 t');
    assert.doesNotMatch(wordsOf(bar, kit).join(' '), /999/);
    const t = tableWith(draw('SettlementPipeline', 'By contract'), 'Contract');
    assert.ok(['Awaiting destination weight (t)', 'Collected (t)', 'Invoiced (t)', 'Paid (t)', 'Gap to invoice (t)', 'Gap to pay (t)', 'Gaps', 'Gap to invoice (USD)', 'Gap to pay (USD)'].every((l) => labels(t).includes(l)), 'both gaps side by side on the same row');
    for (const r of t.props.rows) {
      assert.equal(textOf(cell(t, r, 'toInvoice')), ds.gapsOf(r).toInvoice, `${r.id}: from the row`);
      assert.equal(textOf(cell(t, r, 'toPay')), ds.gapsOf(r).toPay);
      assert.equal(cell(t, r, 'bar').props.row, r, 'the bar reads the same row');
      assert.equal(textOf(cell(t, r, 'payValue')), kit.stGapValue(ds.gapsOf(r).toPay, r.price), 'the value is the gap at the contract price');
    }
    assert.equal(textOf(cell(t, t.props.rows[0], 'invoiceValue')), '384,622.56');
    assert.ok(!kit.ST_CONTRACTS.some((c) => 'toInvoice' in c || 'toPay' in c), 'no gap is stored in the data');
    assert.deepEqual(tableWith(draw('SettlementPipeline', 'Gap to pay'), 'Contract').props.rows.map((r) => r.id), ['SYN4845', 'SYN4852']);
  });
});

/* ------------------------------------------------------------------ (j), (k), (l), (m) */

describe('[M7.DS.02] costs, statements due and the supplier prepayment (AC 1j, 1k, 1l, 1m)', () => {
  test('[M7.DS.02] GL cost categories list the twelve categories with codes, and the applicability matrix by trade pattern; nothing posts', () => {
    const tree = draw('CostCategories', 'Categories');
    assert.equal(tableWith(tree, 'Account code').props.rows.length, 12);
    const matrix = tableWith(tree, 'Back-to-back');
    assert.deepEqual(labels(matrix), ['Category', 'Back-to-back', 'Financing', 'Import', 'Long']);
    const pre = matrix.props.rows.find((r) => r.id === 'prefinance');
    assert.equal(textOf(cell(matrix, pre, 'Back-to-back')), 'Not applicable', 'back-to-back leaves out Prepayments on Prefinance (CFG-GL-MATRIX)');
    assert.match(words('CostCategories', 'Categories').join(' | '), /Nothing is posted to a ledger/);
    assert.equal(textOf(findAll(draw('CostCategories', 'Change where it applies'), 'ReasonDialog')[0].props.title), '', 'the high-impact confirmation keeps its own title');
  });

  test('[M7.DS.02] stock cost withholds a holding with no purchase price, never a zero, and a reader without the contract tier gets no cost', () => {
    const t = tableWith(draw('StockCost', 'Cost withheld'), 'Weighted average cost (USD/t)');
    const maize = t.props.rows.find((r) => r.id === 'h3');
    assert.equal(textOf(cell(t, maize, 'average')), 'No purchase price for a lot on hand');
    assert.equal(textOf(cell(t, maize, 'cost')), '');
    const view = draw('StockCost', 'Without the contract tier');
    assert.ok(!tables(view).some((x) => labels(x).some((l) => /USD|Agreed|Rate/.test(l))), 'the cost columns are left out');
    assert.ok(findAll(view, 'Restricted').length > 0, 'the shared field is the lock');
  });

  test('[M7.DS.02] the statements-due queue and the supplier prepayment with its tonnage equivalence', () => {
    const due = tableWith(draw('StatementsDue', 'Due'), 'Farmer');
    assert.deepEqual(labels(due), ['Farmer', 'Contract type', 'Cadence', 'Period', 'Due on', 'Settlement', 'Status', ''], 'the queue by cadence (M7.SET.08), with no money');
    assert.deepEqual(due.props.rows.map((r) => textOf(cell(due, r, 'status'))), ['Overdue', 'Overdue', 'Due', 'Due']);
    assert.deepEqual([...new Set(due.props.rows.map((r) => r.cadence))], ['Weekly', 'Fortnightly', 'Monthly']);
    assert.match(textOf(cell(due, due.props.rows[1], 'farmer')), /the most frequent applies/, 'the mixed-cadence reason is shown');
    assert.match(words('StatementsDue', 'Nothing due').join(' | '), /No statements due to display\./);
    const p = draw('SupplierPrepayment', 'Open');
    assert.deepEqual(['Amount', 'Price', 'Tonnage equivalence', 'Delivered against it', 'Remaining'].map((l) => textOf(fieldValue(p, l))), ['ZMW 340,000.00', 'ZMW 6,800.00 per t', '50.000 t', '12.500 t', '37.500 t']);
    const r = draw('SupplierPrepayment', 'Without the farmer account tier');
    assert.deepEqual(['Amount', 'Tonnage equivalence'].map((l) => fieldValue(r, l).type), ['Restricted', 'Restricted']);
  });
});

/* ------------------------------------------------------------------ Money and the price tiers */

describe('[M7.DS.02] money carries the price tiers (business rules, UX-09, UX-10)', () => {
  test('[M7.DS.02] a reader without the tier sees no price, value or amount: the column is left out, or the Restricted lock on a shared field, never a zero', () => {
    const run = draw('InvoicePrepRun', 'Without the sell tier');
    assert.deepEqual(labels(tableWith(run, 'Load')), ['Contract', 'Load', 'Basis', 'Weight (t)', 'Status', '']);
    assert.equal(fieldValue(run, 'Amount').type, 'Restricted');
    assert.doesNotMatch(words('InvoicePrepRun', 'Without the sell tier').join(' | '), /USD|9,675\.29|Contract costs/);
    assert.ok(!labels(tableWith(draw('ContractReceivables', 'Without the sell tier'), 'Invoice')).some((l) => /USD/.test(l)));
    assert.ok(!labels(tableWith(draw('SettlementPipeline', 'Without the sell tier'), 'Contract')).some((l) => /USD/.test(l)), 'tonnes stay, value goes (M7.SET.04 AC 8)');
    const s = draw('SettlementProposal', 'Without the farmer account tier');
    assert.deepEqual(['Grain payable', 'Net to pay the farmer'].map((l) => fieldValue(s, l).type), ['Restricted', 'Restricted']);
    assert.equal(findAll(s, 'NettingSides').length, 0);
    assert.doesNotMatch(wordsOf(s, kit).join(' | '), /30,560|6,800|USD/);
  });
});

/* ------------------------------------------------------------------ AC 2: the trade board */

describe('[M7.DS.02] the trade board (AC 2)', () => {
  test('[M7.DS.02] TradeBoard shows cost tags, a supplier prepayment with its equivalence, import trucks with loaded, offloaded and difference, and payments with outstanding', () => {
    const tags = draw('TradeBoard', 'Cost tags');
    const board = tableWith(tags, 'Trade');
    assert.ok(labels(board).includes('Costs'));
    assert.equal(textOf(cell(board, board.props.rows[0], 'costs')), 'Transport, Clearing Docs, Commissions', 'each trade carries its cost tags');
    const section = (st) => { const t = tableWith(draw('TradeBoard', st), 'Trade'); const open = t.props.expanded[0]; return wordsOf(render(t.props.expand(t.props.rows.find((r) => r.id === open)), kit), kit).join(' | '); };
    assert.match(section('Cost tags'), /Costs \| Category[\s\S]*Transport[\s\S]*Clearing Docs[\s\S]*Commissions/);
    assert.match(section('Supplier prepayment'), /Supplier prepayment[\s\S]*Tonnage equivalence \| 50\.000 t[\s\S]*Remaining \| 37\.500 t/);
    const trucks = section('Import trucks');
    assert.match(trucks, /Loaded \(t\)[\s\S]*Offloaded \(t\)[\s\S]*Difference \(t\)/);
    assert.match(trucks, /KAL-07[\s\S]*0\.080[\s\S]*Total \| 102\.180 \| 68\.070 \| 0\.150/, 'the difference is loaded less offloaded, worked out');
    assert.match(section('Payments'), /Outstanding \| USD 162,545\.76[\s\S]*Outstanding \(USD\)/);
    const locked = render(tableWith(draw('TradeBoard', 'Without the price tiers'), 'Trade').props.expand(kit.ST_BOARD_TRADES[0]), kit);
    const costs = tableWith(locked, 'Amount (USD)');
    assert.ok(costs.props.rows.every((r) => render(cell(costs, r, 'amount'), kit).type === 'Restricted'), 'without the tiers every amount is the lock');
    const tb = tableWith(draw('TradeBoard', 'Without the price tiers'), 'Trade');
    assert.ok(tb.props.rows.every((r) => render(cell(tb, r, 'margin'), kit).type === 'Restricted'), 'and every margin');
  });

  test('[M7.DS.02] the trade board keeps every state it had: the M7 states are added beside them', () => {
    const tb = read(join(ONE_LINK, 'TradeBoard.jsx'));
    assert.match(tb, /if \(M6_STATES\.TradeBoard\.includes\(state\)\) return <TradeBoardM6 state=\{state\} onOpen=\{onOpen\} \/>;\n  if \(typeof ST_TRADEBOARD_STATES !== 'undefined' && Array\.isArray\(ST_TRADEBOARD_STATES\) && ST_TRADEBOARD_STATES\.includes\(state\)\) return <TradeBoardM7/);
    assert.match(wordsOf(draw('TradeBoard', 'Trades by status'), kit).join(' | '), /Trades \| 7/, 'an M6 state still draws the M6 board');
    const index = read(join(ONE_LINK, 'index.html'));
    assert.ok(index.includes("'SettlementStates.jsx'"), 'the desktop app kit loads the M7 states');
    assert.match(index, /options=\{\['Owner','Restricted','Loading',\.\.\.M6\.TradeBoard\]\}[^\n]*\{tdView==='Trade Board'\?<Segmented options=\{K\.ST_TRADEBOARD_STATES\} value=\{tbState\} onChange=\{setTbState\}\/>:null\}/, 'a control of their own beside Owner, Restricted, Loading and the M6 states, which keep theirs');
  });
});

/* ------------------------------------------------------------------ Words, and AC 7 */

describe('[M7.DS.02] words (business rules)', () => {
  test('[M7.DS.02] the boundary words: invoice preparation, invoice-ready data, settlement statement, indicative; never invoice as a platform verb, payment instruction or valuation; fictional data; no em dash', () => {
    for (const [s, st] of ALL) {
      const said = words(s, st).join(' | ');
      assert.doesNotMatch(said, /\bUAG\b(?! invoice reference)|United African Grain|National Milling|Sky Milling|\bOwen\b|\bJacques\b|\bAlka\b|\bSid\b|\bRyan\b|ZAM ?4666/, `${s} ${st}: fictional, One Link`);
      assert.doesNotMatch(said, /Settlement run|Season book|Two clocks|Needs you|Not recorded|Compensating entry|Hard block|\bCommit\b|Submit for review|Lock run/, `${s} ${st}: S57`);
      assert.doesNotMatch(said, /payment instruction|[Vv]aluation(?<!not a valuation)|[Ii]nvoice (?:the|a) |[Ii]nvoicing the|\bupload|template|\bsync\b/, `${s} ${st}`);
      assert.doesNotMatch(said, /—|\s–\s/, `${s} ${st}`);
      assert.doesNotMatch(said, /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b(AM|PM)\b|\b\d{4}-\d{2}-\d{2}\b/, `${s} ${st}: dates read 27 Sep 2026`);
    }
    for (const src of [...Object.values(SRC), read(join(KIT, 'README.md')), read(join(KIT, 'index.html')), read(join(COMPONENTS, 'records/settlement.card.html'))]) assert.doesNotMatch(src, /—|\s–\s/);
    assert.match(words('InvoicePrepRuns', 'Runs').join(' | '), /Invoice preparation/);
    for (const [s, st] of [['InvoicePrepRun', 'Waiting for review'], ['SettlementBatches', 'Batches'], ['SettlementProposal', 'Pending approval']]) for (const m of findAll(draw(s, st), 'StatusMark')) assert.ok(m.props.kind && m.props.label != null, `${s}: icon and word`);
  });

  test('[M7.DS.02] Settlement batch is S57\'s word for the settlement run; the owner\'s banned list stays as it is (flagged for the app\'s copy test)', () => {
    assert.ok(SETTLE.SettlementBatches, 'Settlement batches, never Settlement run');
    assert.doesNotMatch(SRC.settlement, /'Settlement run'|"Settlement run"/);
    for (const [s, st] of ALL.filter(([x]) => x !== 'SettlementBatches')) assert.doesNotMatch(words(s, st).join(' | '), /\bbatch/i, `${s} ${st}: batch only names the settlement batch`);
  });

  test('[M7.DS.02] verify:design stays green after design-system:sync: no token is defined or changed and the vendored word list keeps its words (AC 7)', () => {
    assert.deepEqual(BANNED.words, ['batch', 'upload', 'template', 'sync', 'virtual warehouse']);
    assert.deepEqual(BANNED.patterns, ['\\berror code\\b', '\\b(?:E|ERR|ERROR)[-_ ]?\\d{2,}\\b']);
    for (const src of Object.values(SRC)) {
      assert.doesNotMatch(src, /(^|[\s{;'"`])--[a-z0-9-]+['"]?\s*:/m, 'no token defined');
      for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) assert.ok(tokens.has(m[1]), m[1]);
    }
  });
});

/* ------------------------------------------------------------------ The new components */

describe('[M7.DS.02] the new components', () => {
  test('[M7.DS.02] IndicativeFigure, GapBar, NettingSides and MoneyDocument each ship with a .d.ts, a usage note, a loader entry and a live card', () => {
    for (const f of Object.values(NEW)) {
      const base = f.replace(/\.jsx$/, '');
      assert.ok(existsSync(join(COMPONENTS, `${base}.d.ts`)), `${base}.d.ts`);
      assert.ok(existsSync(join(COMPONENTS, `${base}.prompt.md`)), `${base}.prompt.md`);
      assert.match(read(join(COMPONENTS, `${base}.d.ts`)), /@startingPoint section="(Data|Records)"[^\n]*M7\.DS\.02/);
      assert.ok(dsFiles.indexOf(f) > dsFiles.indexOf('records/CheckpointTimeline.jsx'), `${f} after what it composes`);
    }
    assert.ok(dsFiles.indexOf('data/GapBar.jsx') < dsFiles.indexOf('records/NettingSides.jsx'), 'NettingSides composes GapBar\'s money helpers');
    const card = read(join(COMPONENTS, 'records/settlement.card.html'));
    assert.match(card, /@dsCard group="Components"[^>]*M7\.DS\.02/);
    for (const c of ['IndicativeFigure', 'GapBar', 'NettingSides', 'PartialNettingDialog', 'MoneyDocument']) assert.ok(card.includes(`<${c}`), c);
  });

  test('[M7.DS.02] the published site carries the kit and the component card', () => {
    const dist = join(ROOT, 'dist');
    if (!existsSync(dist)) return;
    assert.ok(existsSync(join(dist, 'ui_kits/settlement/index.html')));
    assert.ok(existsSync(join(dist, 'components/records/settlement.card.html')));
    const bundle = read(join(dist, '_ds_bundle.js'));
    for (const n of ['IndicativeFigure', 'GapBar', 'NettingSides', 'MoneyDocument']) assert.ok(bundle.includes(n), n);
  });
});
