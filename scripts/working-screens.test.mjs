// Trading, operations and farmer finance screens, M5.DS.02 (UAG-190): Trading's cover board, forward view and priority
// list; the farm-direct consignments, their capture, record and import preview, the Exceptions list with Follow-up and
// the farm-direct variance decision; the farmer account, the credit book's farmer detail, the statement run, the
// statement layout approval and the exchange rates; Setup's key-upload list and exception rules; and the two kit details
// corrected at source (the Coverage short derivation and the Credit book price control). The screens are rendered
// against a stand-in React that records the tree and runs the kit's own functions, so what a reader meets is checked as
// drawn.
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
const ONE_LINK = join(KITS, 'one_link');
const ADMIN = join(KITS, 'admin_workspace');
const COMPONENTS = join(ROOT, 'project/components');
const read = (p) => readFileSync(p, 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const topLevel = (src) => [...src.matchAll(/^(?:export\s+)?(?:function|const|let)\s+([A-Za-z_]\w*)/gm)].map((m) => m[1]);
const literal = (src, name) => {
  const m = src.match(new RegExp(`(?:export )?const ${name} = (\\{[\\s\\S]*?\\n\\});`));
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

const SRC = {
  trading: read(join(ONE_LINK, 'Trading.jsx')), operations: read(join(ONE_LINK, 'Operations.jsx')), finance: read(join(ONE_LINK, 'Finance.jsx')),
  monitoring: read(join(ADMIN, 'Monitoring.jsx')), coverage: read(join(ONE_LINK, 'Coverage.jsx')), credit: read(join(ONE_LINK, 'CreditBook.jsx')),
};
const COVER = literal(SRC.trading, 'COVER_STATES');
const OPS = literal(SRC.operations, 'OPS_STATES');
const FIN = literal(SRC.finance, 'FINANCE_STATES');
const MON = literal(SRC.monitoring, 'MONITORING_STATES');
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
    UPLOAD_STATUS: { validating: { kind: 'pending', word: 'Validating' }, ready: { kind: 'clean', word: 'Ready to import' }, imported: { kind: 'clean', word: 'Imported' }, failed: { kind: 'breach', word: 'Failed' } },
    Sections: stubFor('Sections'), WithRail: stubFor('WithRail'), WithPanel: stubFor('WithPanel'), ...deps };
  const scope = new Proxy(base, {
    has: (t, k) => typeof k === 'string' && (k in t || !(k in globalThis)),
    get: (t, k) => (k in t ? t[k] : typeof k === 'string' && /^[A-Z]/.test(k) ? stubFor(k) : undefined),
  });
  return Function('scope', `with (scope) {\n${code}\nreturn { ${names.join(', ')} };\n}`)(scope);
}

function render(node, kit) {
  if (node == null || typeof node === 'boolean') return null;
  if (Array.isArray(node)) return node.map((n) => render(n, kit));
  if (typeof node !== 'object' || !('type' in node)) return node;
  if (typeof node.type === 'function' && !STUBS.has(node.type.name) && Object.values(kit).includes(node.type)) {
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
const PROP_TEXT = ['label', 'title', 'aria-label', 'placeholder', 'caption', 'value', 'subject', 'context', 'name', 'subtitle', 'kind', 'objects', 'link', 'reason', 'meta', 'children'];

/** Every word a reader meets in a rendered tree: text, the text props of stand-ins, and the cells a DataTable draws. */
function wordsOf(tree, kit) {
  const out = [];
  const walkValue = (v, key) => {
    if (v == null || typeof v === 'boolean') return;
    if (typeof v === 'string' || typeof v === 'number') { if (key !== 'kind' || /\s/.test(String(v))) out.push(String(v)); return; }
    if (Array.isArray(v)) { v.forEach((x) => walkValue(x, key)); return; }
    if (typeof v === 'object' && 'type' in v) { walkNode(render(v, kit)); return; }
    if (typeof v === 'object') for (const [k, x] of Object.entries(v)) if (k !== 'style' && typeof x !== 'function') walkValue(x, k);
  };
  const walkNode = (n) => {
    for (const m of nodes(n)) {
      const own = (m.children || []).filter((c) => typeof c === 'string' || typeof c === 'number').join('');
      if (own) out.push(own);
      const p = m.props || {};
      for (const k of PROP_TEXT) if (k in p && k !== 'children') walkValue(p[k], k);
      for (const k of ['fields', 'components', 'total', 'basis', 'items', 'headerRight', 'right', 'status', 'actions', 'overlay', 'footer', 'tabs', 'cells', 'outcomes', 'file', 'tiles']) if (k in p) walkValue(p[k], k);
      if (m.type === 'DataTable') {
        for (const c of p.columns || []) walkValue(c.label, 'label');
        for (const r of p.rows || []) {
          for (const c of p.columns || []) walkValue(c.render ? c.render(r, 0) : r[c.key], c.key);
          if (p.expand) walkValue(p.expand(r), 'expand');
        }
      }
      if (m.type === 'ExceptionList') for (const r of p.rows || []) out.push(r.type, r.title, r.record, r.value || '', r.owner, r.age);
    }
  };
  walkNode(tree);
  return out.map((s) => s.trim()).filter(Boolean);
}

const KIT_FILES = ['Shell.jsx', 'Home.jsx', 'Trading.jsx', 'Operations.jsx', 'Finance.jsx', 'Coverage.jsx', 'CreditBook.jsx'].map((f) => join(ONE_LINK, f));
// Shell's layout parts stay stand-ins, so their props (a rail, a panel) are walked as drawn.
const SHELL_PARTS = Object.fromEntries(['Sections', 'WithRail', 'WithPanel', 'PageHead', 'FigureStrip', 'ScrollRow', 'SectionLabel', 'Page'].map((n) => [n, stubFor(n)]));
const kit = loadKit(KIT_FILES.slice(1), SHELL_PARTS);
const setupKit = loadKit([join(ADMIN, 'Monitoring.jsx')]);
const draw = (k, screen, state) => render(el(k[screen], { state, onOpen: () => {} }), k);
const words = (k, screen, state) => wordsOf(draw(k, screen, state), k);
const findAll = (tree, type) => nodes(tree).filter((n) => n.type === type);
const tables = (tree) => findAll(tree, 'DataTable');
const tableBy = (tree, firstLabel) => tables(tree).find((t) => t.props.columns[0].label === firstLabel);
const cell = (t, row, key) => { const c = t.props.columns.find((x) => x.key === key); return c.render ? c.render(row, 0) : row[key]; };
const textOf = (v) => { if (v == null) return ''; const r = typeof v === 'object' ? render(v, kit) : v; return typeof r === 'string' || typeof r === 'number' ? String(r) : wordsOf(r, kit).join(' '); };

/** Every new screen and state, with its kit. */
const ALL = [
  ...Object.entries({ ...COVER, ...OPS, ...FIN }).flatMap(([s, list]) => list.map((st) => [kit, s, st])),
  ...Object.entries(MON).flatMap(([s, list]) => list.map((st) => [setupKit, s, st])),
];

/* ------------------------------------------------------------------ Composition */

const tokens = new Set(walk(join(ROOT, 'project/tokens')).filter((p) => p.endsWith('.css')).flatMap((p) => [...read(p).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])));
const loader = read(join(COMPONENTS, '_loader.js'));
const dsFiles = JSON.parse(loader.match(/var FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
const published = new Set(dsFiles.flatMap((f) => topLevel(read(join(COMPONENTS, f)))));
const kitNames = new Set([...readdirSync(ONE_LINK).filter((n) => n.endsWith('.jsx')).map((n) => join(ONE_LINK, n)), ...readdirSync(ADMIN).filter((n) => n.endsWith('.jsx')).map((n) => join(ADMIN, n))].flatMap((p) => topLevel(read(p))));
function compositionProblems(src) {
  const components = new Set([...published, ...kitNames, 'React']);
  const problems = [];
  for (const m of src.matchAll(/(^|[\s{;'"`])(--[a-z0-9-]+)['"]?\s*:/g)) problems.push(`defines token ${m[2]}`);
  for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) if (!tokens.has(m[1])) problems.push(`uses unknown token ${m[1]}`);
  for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g)) problems.push(`literal colour ${m[0]}`);
  for (const m of src.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) if (!components.has(m[1])) problems.push(`unknown component <${m[1]}>`);
  return problems;
}

/* ------------------------------------------------------------------ The screens exist */

describe('[M5.DS.02] the screens', () => {
  test('[M5.DS.02] the kits list every new screen with its file and states, in order (AC 1 to 4)', () => {
    const one = readmeRows(read(join(ONE_LINK, 'README.md')));
    for (const [file, states] of [['Trading.jsx', COVER], ['Operations.jsx', OPS], ['Finance.jsx', FIN]]) for (const [s, list] of Object.entries(states)) assert.deepEqual(one[s], { file, states: list }, s);
    const setup = readmeRows(read(join(ADMIN, 'README.md')));
    for (const [s, list] of Object.entries(MON)) assert.deepEqual(setup[s], { file: 'Monitoring.jsx', states: list }, s);
  });

  test('[M5.DS.02] every new screen and state opens directly by ?screen=&state=, in Trading\'s, Operations\' or Finance\'s frame (AC 7)', () => {
    const index = read(join(ONE_LINK, 'index.html'));
    for (const f of ['Trading.jsx', 'Operations.jsx', 'Finance.jsx']) assert.ok(index.includes(`'${f}'`), f);
    assert.match(index, /const M5B_STATES = \{ \.\.\.K\.COVER_STATES, \.\.\.K\.OPS_STATES, \.\.\.K\.FINANCE_STATES \}/);
    for (const who of ['cover', 'ops', 'fin']) assert.match(index, new RegExp(`frame\\.who==='${who}'`));
    for (const s of Object.keys({ ...COVER, ...OPS, ...FIN })) assert.match(index, new RegExp(`\\b${s}: '`), `${s} has a label in the screen index`);
    const setup = read(join(ADMIN, 'index.html'));
    assert.match(setup, /'Monitoring\.jsx'/);
    assert.match(setup, /keyuploads: \{ crumbs: \['Key uploads'\], screens: \['KeyUploadsList'\] \}/);
    assert.match(setup, /rules: \{ crumbs: \['Exception rules'\], screens: \['ExceptionRulesList'\] \}/);
    const nav = read(join(ADMIN, 'Shell.jsx'));
    assert.match(nav, /\{ value: 'figures', label: 'Figures and price tiers' \}, \{ value: 'rules', label: 'Exception rules' \}/, 'added after Figures and price tiers');
    assert.match(nav, /\{ value: 'readiness', label: 'Production readiness' \}, \{ value: 'keyuploads', label: 'Key uploads' \}/, 'added after Production readiness');
  });

  test('[M5.DS.02] the cover board is Trading\'s Home with Last refreshed, the stale states, Could cover beside the gap, weighed loads as labelled fields and the forward view through ChartCard (AC 1)', () => {
    const current = draw(kit, 'CoverHome', 'Current');
    assert.ok(words(kit, 'CoverHome', 'Current').includes('Home'));
    const refreshed = findAll(current, 'StatusMark').find((m) => /^Last refreshed /.test(m.props.label));
    assert.equal(refreshed.props.kind, 'clean');
    assert.equal(findAll(current, 'ConditionBanner').length, 0);
    for (const [state, input] of [['Stale data', /Supply forecast, wheat is 3 days old/], ['Upload failed', /Trade sheet import failed/], ['Upload missing', /Supply forecast, soya was not received/]]) {
      const tree = draw(kit, 'CoverHome', state);
      const mark = findAll(tree, 'StatusMark').find((m) => /^Last refreshed /.test(m.props.label));
      assert.equal(mark.props.kind, 'attention', `${state}: Last refreshed turns amber with the warning icon`);
      const banners = findAll(tree, 'ConditionBanner');
      assert.equal(banners.length, 1, `${state}: one banner`);
      assert.match(banners[0].children.join(''), input, `${state}: the banner names the input`);
    }
    const board = tableBy(current, 'Contract');
    const labels = board.props.columns.map((c) => c.label);
    assert.deepEqual(labels.slice(2, 8), ['Sold (t)', 'Firm secured (t)', 'Cover', 'Expected (t)', 'Could cover (t)', 'Short (t)']);
    assert.equal(labels.indexOf('Could cover (t)') + 1, labels.indexOf('Short (t)'), 'Could cover sits beside the gap');
    const weighed = tables(current).find((t) => t.props.columns.some((c) => c.label === 'Weighed loads not yet received'));
    assert.deepEqual(weighed.props.columns.map((c) => c.label).slice(0, 3), ['Contract', 'Weighed loads not yet received', 'Tonnage (t)']);
    assert.deepEqual([weighed.props.rows[0].loads, weighed.props.rows[0].tonnage], ['3', '96']);
    const charts = findAll(current, 'ChartCard');
    assert.equal(charts.length, 1, 'the forward view is on Home, through ChartCard');
    assert.deepEqual(charts[0].props.series.map((s) => s.name), ['Due to mills', 'Firm intake', 'Expected intake']);
    assert.equal(charts[0].props.series[2].options.lineStyle, 2, 'expected intake is dashed');
    for (const state of COVER.ForwardView) assert.equal(findAll(draw(kit, 'ForwardView', state), 'ChartCard').length, 1, state);
    assert.equal(findAll(draw(kit, 'ForwardView', 'Error'), 'ChartCard')[0].props.state, 'error');
    assert.equal(findAll(draw(kit, 'ForwardView', 'Loading'), 'ChartCard')[0].props.state, 'loading');
  });

  test('[M5.DS.02] the priority list shows short contracts with their severity, and opens the suppliers to call with a reason each (AC 1)', () => {
    const tree = draw(kit, 'PriorityList', 'Suppliers to call');
    const t = tableBy(tree, 'Contract');
    assert.deepEqual(t.props.rows.map((r) => [r.id, r.severity]), [['SYN4702', 'High'], ['SYN4845', 'Medium']]);
    assert.deepEqual(t.props.expanded, ['SYN4702']);
    const said = words(kit, 'PriorityList', 'Suppliers to call').join(' | ');
    for (const r of kit.CV_PRIORITY) for (const s of r.suppliers) assert.ok(said.includes(s.reason), s.reason);
    assert.match(words(kit, 'PriorityList', 'All covered').join(' | '), /Every open contract is covered\./);
  });

  test('[M5.DS.02] a supplier row renders its reason and its contact or "no contact on record"', () => {
    const withContact = render(el(kit.CvSupplierRow, { supplier: { id: 'a', name: 'Kapiri Farms', reason: '100 t undelivered on SYN4845 leg B', contact: '+260 96 555 0187' }, first: true }), kit);
    const row = findAll(withContact, 'RailRow')[0];
    assert.equal(row.props.context, '100 t undelivered on SYN4845 leg B');
    assert.match(textOf(row.props.right), /\+260 96 555 0187/);
    const without = render(el(kit.CvSupplierRow, { supplier: { id: 'b', name: 'Chisomo Agri', reason: 'Declared 140 t expected, not yet firm', contact: null }, first: true }), kit);
    assert.match(textOf(findAll(without, 'RailRow')[0].props.right), /^no contact on record$/);
  });

  test('[M5.DS.02] the operations screens: consignment capture and record with the loaded side only, the mill side only, both sides with the difference, and received grade against contract grade (AC 2)', () => {
    const facts = (state) => Object.fromEntries(findAll(draw(kit, 'Consignment', state), 'RecordHighlights')[0].props.fields.map((f) => [f.label, f.value]));
    assert.equal(facts('Loaded side only')['Waiting for'], 'Mill side');
    assert.equal(facts('Mill side only')['Waiting for'], 'Loaded side');
    const status = (state) => findAll(draw(kit, 'Consignment', state), 'StatusMark').find((m) => ['In transit', 'Delivered', 'Reconciled'].includes(m.props.label)).props.label;
    assert.deepEqual(['Loaded side only', 'Mill side only', 'Both sides'].map(status), ['In transit', 'Delivered', 'Reconciled'], 'a consignment is a load (UX-32)');
    const both = findAll(draw(kit, 'Consignment', 'Both sides'), 'ReconcileCard')[0].props.rows.map((r) => [r.label, r.value, !!r.strong]);
    assert.deepEqual(both.slice(0, 3), [['Loaded', '33.200 t', false], ['Offloaded', '33.120 t', false], ['Difference', '0.080 t, 0.24%', true]]);
    assert.equal(findAll(draw(kit, 'Consignment', 'Loaded side only'), 'ReconcileCard').length, 0, 'no difference until both sides are in');
    const below = draw(kit, 'Consignment', 'Grade below contract');
    assert.deepEqual([facts('Grade below contract')['Contract grade'], facts('Grade below contract')['Grade received']], ['Grade 1', 'Grade 2']);
    assert.ok(findAll(below, 'StatusMark').some((m) => m.props.label === 'Grade below contract' && m.props.kind === 'breach'));
    for (const st of ['Loaded side', 'Mill side']) assert.ok(findAll(draw(kit, 'NewConsignment', st), 'RadioList')[0].props.value === st, `capture starts from the ${st}`);
    const preview = findAll(draw(kit, 'FarmDirectUpload', 'Row to fix'), 'ImportPreview')[0].props;
    assert.equal(preview.statusWord, 'map');
    assert.ok(preview.rows.some((r) => r.error));
    assert.equal(preview.readyWord({ side: 'Mill side' }), 'Completes consignment');
  });

  test('[M5.DS.02] the Exceptions list with Follow-up as the operations lead\'s saved view lists the farm-direct exceptions with Type, Record, Value at risk (USD), Owner, Age and Status (AC 2)', () => {
    const tree = draw(kit, 'FollowUp', 'Follow-up');
    assert.ok(findAll(tree, 'Capsule').some((c) => c.props.selected && c.children.join('') === 'Follow-up'), 'Follow-up is the selected saved view');
    const list = findAll(tree, 'ExceptionList')[0].props;
    assert.equal(list.priceTier, true, 'Value at risk (USD) is drawn');
    const titles = list.rows.map((r) => r.title);
    for (const t of ['Missing mill side', 'Missing loaded side', 'Missing mill offload', 'Weight difference beyond allowance']) assert.ok(titles.includes(t), t);
    const n = (v) => Number(String(v).replace(/,/g, ''));
    assert.deepEqual(list.rows.map((r) => n(r.value)), [...list.rows.map((r) => n(r.value))].sort((a, b) => b - a), 'ranked by value at risk');
    assert.ok(list.rows.every((r) => ['open', 'acknowledged'].includes(r.status)));
    assert.ok(findAll(draw(kit, 'FollowUp', 'Acknowledged'), 'ExceptionList')[0].props.rows.some((r) => r.status === 'acknowledged'));
    const readOnly = draw(kit, 'VarianceDecision', 'Operations, read only');
    assert.equal(findAll(readOnly, 'DecisionActions').length, 0, 'the variance is read only for Operations');
    assert.match(words(kit, 'VarianceDecision', 'Operations, read only').join(' | '), /Waiting for \| Managing Director or Trading/);
  });

  test('[M5.DS.02] the variance decision panel offers exactly three outcomes', () => {
    const [panel] = findAll(draw(kit, 'VarianceDecision', 'Open'), 'DecisionActions');
    assert.deepEqual(panel.props.outcomes.map((o) => [o.value, o.label]), [
      ['accept_weighed_net', "Accept the mill's offloaded weight"], ['correct_lines', 'Correct a side, with a reason'], ['re_weigh', 'Send for re-weigh']]);
    assert.equal(panel.props.outcomes.filter((o) => o.comment).length, 1, 'only Correct a side asks for a reason');
    const dialog = findAll(draw(kit, 'VarianceDecision', 'Correct a side'), 'ReasonDialog')[0].props;
    assert.equal(dialog.minLength, 1, 'the reason is mandatory (UX-22)');
  });

  test('[M5.DS.02] the farmer finance screens: the farmer account under Farmer accounts, the credit book farmer detail with its LTV chart, the statement run and the layout approval (AC 3)', () => {
    assert.match(SRC.finance, /label: 'Farmer accounts'/);
    const fields = findAll(draw(kit, 'FarmerAccount', 'Details'), 'RecordHighlights')[0].props.fields.map((f) => f.label);
    for (const f of ['Input debt', 'Trade payable', 'Expected recovery', 'Exposure', 'LTV band']) assert.ok(fields.includes(f), f);
    const chart = findAll(draw(kit, 'CreditBookFarmer', 'Red band'), 'ChartCard')[0].props;
    assert.equal(chart.series[0].type, 'baseline');
    assert.deepEqual(chart.priceLines.map((p) => p.price).sort(), [20, 22]);
    const preview = draw(kit, 'StatementRun', 'Preview');
    assert.equal(findAll(preview, 'FfStatementPreview').length + findAll(preview, 'Card').filter((c) => c.props.title === 'Preview').length >= 1, true, 'a PDF preview');
    const runs = tableBy(draw(kit, 'StatementRun', 'Run history'), 'Run');
    assert.ok(runs.props.rows.some((r) => textOf(cell(runs, r, 'status')) === 'Superseded'), 'the run history shows a superseded run');
    for (const [state, word] of [['Pending approval', 'Pending approval'], ['Approved', 'Approved'], ['Rejected', 'Rejected']]) {
      assert.ok(findAll(draw(kit, 'StatementLayout', state), 'StatusMark').some((m) => m.props.label === word), state);
    }
    const reject = findAll(draw(kit, 'StatementLayout', 'Reject'), 'ReasonDialog')[0].props;
    assert.deepEqual([reject.label, reject.minLength], ['Comment', 1], 'Rejected needs a comment');
    assert.match(words(kit, 'StatementLayout', 'Pending approval').join(' | '), /Sample Farm Ltd/);
    assert.doesNotMatch(words(kit, 'StatementLayout', 'Pending approval').join(' | '), /Lakeview|Cameron|Riverbend/, 'sample data only in the layout preview');
  });

  test('[M5.DS.02] a superseded statement run renders its superseded mark and stays downloadable', () => {
    const t = tableBy(draw(kit, 'StatementRun', 'Run history'), 'Run');
    const old = t.props.rows.find((r) => r.superseded);
    assert.ok(old, 'the earlier run is kept');
    assert.match(textOf(cell(t, old, 'status')), /^Superseded$/);
    assert.equal(cell(t, old, 'download').children.join(''), 'Download');
    assert.notEqual(cell(t, old, 'download').props.disabled, true);
    assert.equal(t.props.columns.at(-1).key, 'status', 'Status last');
  });

  test('[M5.DS.02] a layout version renders its language', () => {
    for (const state of FIN.StatementLayout) {
      const f = findAll(draw(kit, 'StatementLayout', state), 'RecordHighlights')[0].props.fields;
      assert.equal(f.find((x) => x.label === 'Language').value, 'English', state);
    }
    assert.equal(findAll(draw(kit, 'StatementRun', 'No approved layout'), 'Refusal')[0].props.reason, 'No approved statement layout in Afrikaans');
  });

  test('[M5.DS.02] the admin lists: key uploads with the import statuses, exchange rates "ZMW 25.00 per USD" with their dates and a correction dialog beside Exchange rate source, and the exception rules with Threshold, Owner, Daily summary and End-of-day report (AC 4)', () => {
    const keys = findAll(draw(setupKit, 'KeyUploadsList', 'All'), 'ListView')[0].props;
    const statusCol = keys.columns.find((c) => c.key === 'status');
    const words4 = keys.rows.map((r) => statusCol.render(r).props.label);
    for (const w of words4) assert.ok(['Validating', 'Ready to import', 'Imported', 'Failed'].includes(w), w);
    assert.deepEqual([...new Set(words4)].sort(), ['Failed', 'Imported', 'Ready to import', 'Validating']);
    assert.equal(keys.columns.at(-1).key, 'status');
    const rates = draw(kit, 'ExchangeRates', 'Rates');
    const t = tableBy(rates, 'Date');
    for (const r of t.props.rows) { assert.match(r.rate, /^ZMW \d{2}\.\d{2} per USD$/); assert.match(r.date, /^\d{2} [A-Z][a-z]{2} \d{4}$/); }
    assert.match(words(kit, 'ExchangeRates', 'Rates').join(' | '), /Exchange rate source[\s\S]*Setting owner \| Owner/, 'beside the setting and its owner');
    const fix = findAll(draw(kit, 'ExchangeRates', 'Correct rate'), 'ReasonDialog')[0].props;
    assert.deepEqual([fix.label, fix.minLength], ['Reason', 1]);
    assert.ok(t.props.rows.some((r) => r.status === 'Corrected'), 'the original row stays beside its correction');
    assert.equal(findAll(draw(kit, 'ExchangeRates', 'Rate already entered'), 'Refusal').length, 1);
    const rules = findAll(draw(setupKit, 'ExceptionRulesList', 'All'), 'ListView')[0].props;
    assert.deepEqual(rules.columns.map((c) => c.label), ['Rule', 'Threshold', 'Owner', 'Daily summary', 'End-of-day report', 'Status']);
  });
});

/* ------------------------------------------------------------------ The two corrections at source */

describe('[M5.DS.02] the kit details corrected at source', () => {
  const t = (v) => Number(String(v).replace(/[^\d-]/g, ''));

  test('REGRESSION: [M5.DS.02] coverage short derivation is sold minus firm secured, declared never subtracted, could-cover never subtracted (AC 5)', () => {
    const s = kit.COVERAGE_SHORT;
    assert.deepEqual(s.components.map((c) => c.label), ['Sold', 'Firm secured']);
    assert.equal(t(s.components[0].value) + t(s.components[1].value), t(s.total.value), 'the gap is sold minus firm secured');
    const declared = t(s.basis.find((b) => /^Declared/.test(b.label)).value);
    const could = t(s.basis.find((b) => /^Could cover/.test(b.label)).value);
    assert.notEqual(t(s.total.value), t(s.components[0].value) + t(s.components[1].value) - declared, 'declared is never subtracted');
    assert.notEqual(t(s.total.value), t(s.components[0].value) + t(s.components[1].value) - could, 'could cover is never subtracted');
    const tree = draw(kit, 'Coverage', 'Calculation details');
    const panel = findAll(tree, 'CalculationDetails')[0].props;
    assert.equal(panel.total.label, 'Short (MT)');
    assert.equal(findAll(draw(kit, 'Coverage', 'Board'), 'CalculationDetails').length, 0, 'it opens from the short figure');
    const figures = findAll(tree, 'Figure').map((f) => f.props.label);
    assert.ok(figures.includes('could cover') && figures.includes('short') && figures.indexOf('could cover') !== figures.indexOf('short'), 'Could cover is its own figure');
    assert.ok(findAll(tree, 'ShareBar').some((b) => b.props.declared > 0), 'declared supply is drawn as the dashed overlay');
    assert.doesNotMatch(SRC.coverage, /target\s*[−-]\s*firm\s*[−-]\s*declared/i);
    assert.match(SRC.coverage, /Short = sold minus firm secured/);
    // Each mill's short and the trader's board follow the same rule.
    const mills = kit.MILLS.filter((m) => /^short /.test(m.short));
    for (const m of mills) assert.equal(t(m.target) - t(m.firm), t(m.short), m.name);
    for (const r of kit.CV_CONTRACTS) assert.equal(t(r.sold) - t(r.firm), t(r.short), r.id);
    const calc = kit.cvShortCalc(kit.CV_CONTRACTS[1]);
    assert.deepEqual(calc.components.map((c) => c.label), ['Sold', 'Firm secured']);
    assert.ok(calc.basis.some((b) => /^Expected, not counted/.test(b.label)) && calc.basis.some((b) => /^Could cover, not counted/.test(b.label)));
  });

  test('REGRESSION: [M5.DS.02] the credit book price control is read-only (AC 6)', () => {
    const code = SRC.credit.replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(code, /LineStepper|Segmented|<Input|setPrice|what-if|rescores the whole book instantly/i);
    const tree = draw(kit, 'CreditBook');
    const items = findAll(tree, 'SummaryList').flatMap((s) => s.props.items).map((i) => [i.label, i.value]);
    assert.deepEqual(items.find(([l]) => l === 'Price in force'), ['Price in force', 'USD 400.00 per t']);
    assert.match(items.find(([l]) => l === 'Approved')[1], /^15 Sep 2026, T\. Mwila$/);
    assert.ok(tables(tree).some((x) => x.props.rows.map((r) => r.id).join() === kit.CREDIT_PRICE_HISTORY.map((r) => r.id).join()), 'with its history');
    const controls = [...findAll(tree, 'LineStepper'), ...findAll(tree, 'Segmented'), ...findAll(tree, 'Input'), ...findAll(tree, 'PressToggle')];
    assert.deepEqual(controls, [], 'no control edits the price or runs a what-if');
    for (const state of FIN.CreditBookFarmer) {
      const t2 = draw(kit, 'CreditBookFarmer', state);
      assert.equal([...findAll(t2, 'Input'), ...findAll(t2, 'LineStepper'), ...findAll(t2, 'Segmented')].length, 0, state);
      assert.match(words(kit, 'CreditBookFarmer', state).join(' | '), /Approved \| \d{2} Sep 2026/, `${state}: the price carries its approval date`);
    }
  });
});

/* ------------------------------------------------------------------ Composition, restricted, working states */

describe('[M5.DS.02] composition, visibility and working states', () => {
  test('[M5.DS.02] every new screen composes published components and tokens only, with no bespoke colour, and every chart is a ChartCard (AC 7)', () => {
    for (const [name, src] of Object.entries({ trading: SRC.trading, operations: SRC.operations, finance: SRC.finance, monitoring: SRC.monitoring })) {
      assert.deepEqual(compositionProblems(src), [], name);
      assert.doesNotMatch(src, /LightweightCharts|createChart|<canvas|<svg/i, `${name}: charts only through ChartCard`);
    }
  });

  test('[M5.DS.02] a restricted figure renders the restricted dash: the lock with no value and the tooltip Restricted, or the column left out (AC 8)', () => {
    // The map's Restricted state (UX-09) is the lock, so the test's "dash" is drawn as the AC says: the lock, no value.
    const tree = draw(kit, 'FarmerAccount', 'Without the farmer account tier');
    const f = findAll(tree, 'RecordHighlights')[0].props.fields;
    for (const label of ['Input debt', 'Trade payable', 'Expected recovery', 'Exposure', 'LTV band']) {
      const v = f.find((x) => x.label === label).value;
      assert.equal(v.type, 'Restricted', `${label} is the lock`);
      assert.equal(v.props.label, undefined, 'the tooltip stays Restricted');
    }
    assert.doesNotMatch(words(kit, 'FarmerAccount', 'Without the farmer account tier').join(' | '), /USD \d|23,760|15,990|18\.38/, 'no value leaks');
    const balances = tables(tree).find((t) => t.props.columns.some((c) => c.label === 'Entry'));
    assert.ok(!balances.props.columns.some((c) => /\(USD\)/.test(c.label)), 'the money columns are left out of the table');
    const priority = tableBy(draw(kit, 'PriorityList', 'Without the contract tier'), 'Contract');
    assert.ok(!priority.props.columns.some((c) => /USD/.test(c.label)), 'value at risk is left out without the contract tier');
    assert.ok(tableBy(draw(kit, 'PriorityList', 'Short contracts'), 'Contract').props.columns.some((c) => c.label === 'Value at risk (USD)'));
    for (const src of [SRC.operations]) assert.doesNotMatch(src.replace(/\/\*[\s\S]*?\*\//g, ''), /RestrictedCell/, 'new screens use Restricted, not the older cell');
  });

  test('[M5.DS.02] every run, approve and acknowledge control draws its working state (AC 8)', () => {
    const busy = (k, screen, state, label) => [...findAll(draw(k, screen, state), 'Button'), ...findAll(draw(k, screen, state), 'PressButton')].find((b) => b.children.join('') === label);
    for (const [screen, state, label] of [['StatementRun', 'Running', 'Run statement'], ['Consignment', 'Acknowledging', 'Acknowledge'], ['FarmDirectConsignments', 'Exporting', 'Export'],
      ['FollowUp', 'Exporting', 'Export'], ['NewConsignment', 'Saving', 'Save'], ['ExchangeRates', 'Saving', 'Save']]) {
      assert.equal(busy(kit, screen, state, label).props.loading, true, `${screen} ${state}`);
    }
    assert.equal(busy(setupKit, 'KeyUploadsList', 'Saving', 'Save').props.loading, true);
    const pl = tableBy(draw(kit, 'PriorityList', 'Acknowledging'), 'Contract');
    const ack = findAll(render(pl.props.expand(pl.props.rows[0]), kit), 'Button').find((b) => b.children.join('') === 'Acknowledge');
    assert.equal(ack.props.loading, true, 'the quiet supplier\'s Acknowledge');
    assert.equal(findAll(draw(kit, 'VarianceDecision', 'Deciding'), 'DecisionActions')[0].props.busy, 'accept_weighed_net');
    assert.equal(findAll(draw(kit, 'StatementLayout', 'Approving'), 'DecisionActions')[0].props.busy, 'approve');
    assert.equal(findAll(draw(kit, 'StatementLayout', 'Rejecting'), 'ReasonDialog')[0].props.busy, true);
    assert.equal(findAll(draw(kit, 'ExchangeRates', 'Correcting'), 'ReasonDialog')[0].props.busy, true);
    assert.equal(findAll(draw(kit, 'FarmDirectUpload', 'Importing'), 'ImportPreview')[0].props.importing, true);
    const download = tableBy(draw(kit, 'StatementRun', 'Downloading'), 'Run');
    assert.ok(download.props.rows.some((r) => cell(download, r, 'download').props.loading === true));
  });

  test('[M5.DS.02] verify:design stays green after design-system:sync: no token is defined or changed and the vendored word list keeps its words (AC 9)', () => {
    assert.deepEqual(BANNED.words, ['batch', 'upload', 'template', 'sync', 'virtual warehouse']);
    assert.deepEqual(BANNED.patterns, ['\\berror code\\b', '\\b(?:E|ERR|ERROR)[-_ ]?\\d{2,}\\b']);
    for (const src of [...Object.values(SRC), read(join(COMPONENTS, 'data/ChartCard.jsx'))]) {
      assert.doesNotMatch(src, /(^|[\s{;'"`])--[a-z0-9-]+['"]?\s*:/m, 'no token defined');
      for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) assert.ok(tokens.has(m[1]), m[1]);
    }
  });

  test('[M5.DS.02] on a farm-direct consignment with both sides, the mill\'s offloaded weight and grade count on both legs and set what the farmer is paid on; the loaded weight is kept for the difference (AC 10)', () => {
    const tree = draw(kit, 'Consignment', 'Grade below contract');
    const f = Object.fromEntries(findAll(tree, 'RecordHighlights')[0].props.fields.map((x) => [x.label, x.value]));
    assert.equal(f['Paid on'], '31.980 t at grade 2');
    const related = draw(kit, 'Consignment', 'Related');
    const legs = tableBy(related, 'Contract');
    assert.deepEqual(legs.props.rows.map((r) => [r.side, r.qty, r.grade]), [['Purchase', '31.980', 'Grade 2'], ['Sale', '31.980', 'Grade 2']]);
    const said = words(kit, 'Consignment', 'Grade below contract').join(' | ');
    assert.match(said, /Loaded \| 32\.140 t/, 'the loaded weight is kept');
    assert.match(said, /Counts on \| The difference only/);
    assert.match(said, /Counts on \| Purchase leg and sale contract/);
  });

  test('[M5.DS.02] weights carry three decimals and totals none with the unit in the header; money its code first and the currency in table headers; a missing value is blank and a true zero 0; statuses an icon and a word; record numbers link only where the viewer can open them (AC 11)', () => {
    const list = tableBy(draw(kit, 'FarmDirectConsignments', 'All'), 'Consignment');
    for (const key of ['loaded', 'offloaded', 'diff']) {
      assert.match(list.props.columns.find((c) => c.key === key).label, /\(t\)$/);
      for (const r of list.props.rows) assert.match(r[key], /^(\d+\.\d{3})?$/, `${r.id} ${key}: three decimals or blank`);
    }
    assert.equal(list.props.rows.find((r) => r.id === 'FD-0146').offloaded, '', 'a missing side is a blank cell');
    const board = tableBy(draw(kit, 'CoverHome', 'Current'), 'Contract');
    for (const r of board.props.rows) for (const k of ['sold', 'firm', 'expected', 'could', 'short']) assert.match(r[k], /^\d{1,3}(,\d{3})*$/, `${r.id} ${k}: a total with no decimals`);
    assert.equal(textOf(cell(board, board.props.rows.find((r) => r.id === 'SYN4790'), 'short')), '0', 'a true zero is 0');
    for (const [k, screen, state] of ALL) {
      for (const w of words(k, screen, state)) {
        assert.doesNotMatch(w, /\bK\d|\d\s?(USD|ZMW)\b(?! per)|\$\d/, `${screen} ${state}: money "${w}" carries its code before the amount`);
        assert.doesNotMatch(w, /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b(AM|PM)\b|\b\d{4}-\d{2}-\d{2}\b/, `${screen} ${state}: date "${w}"`);
      }
      for (const t of tables(draw(k, screen, state))) for (const c of t.props.columns) if (/value|amount|debt|payable|owed/i.test(String(c.label)) && !/^(Old|New) value$/.test(c.label)) assert.match(c.label, /\((USD|ZMW)\)|USD/, `${screen} ${state}: ${c.label} names its currency`);
      for (const m of findAll(draw(k, screen, state), 'StatusMark')) assert.ok(m.props.kind && m.props.label != null, `${screen} ${state}: icon and word`);
    }
    const S57 = new Set(['Open', 'Acknowledged', 'Closed', 'Validating', 'Ready to import', 'Imported', 'Failed', 'Draft', 'Pending approval', 'Approved', 'Rejected', 'Active', 'Loading', 'In transit', 'Delivered', 'Reconciled']);
    for (const [screen, state] of [['FollowUp', 'Follow-up'], ['StatementLayout', 'Pending approval'], ['FarmDirectConsignments', 'All']]) {
      const marks = findAll(draw(kit, screen, state), 'StatusMark').map((m) => m.props.label).filter((l) => !/^Last refreshed/.test(l));
      for (const l of marks) assert.ok(S57.has(l), `${screen}: ${l} is S57's`);
    }
    const follow = findAll(draw(kit, 'FollowUp', 'Follow-up'), 'ExceptionList')[0].props.rows;
    assert.ok(follow.every((r) => r.recordLink), 'Operations can open each record, so each is a link');
    const supplierAsCp = tableBy(draw(kit, 'StatementLayout', 'Pending approval'), 'Date');
    assert.ok(supplierAsCp.props.rows.every((r) => typeof cell(supplierAsCp, r, 'ref') === 'string'), 'sample references are plain text, never links');
  });

  test('[M5.DS.02] sample data is fictional, public copy never says UAG, the canvas\'s mill is Riverbend Milling, the S57 glossary\'s right column is used, and no em dash', () => {
    for (const [k, screen, state] of ALL) {
      const said = words(k, screen, state).join(' | ');
      assert.doesNotMatch(said, /\bUAG\b|United African Grain|National Milling|\bOwen\b|\bJacques\b|\bAlka\b|\bSid\b|\bAshraf\b/, `${screen} ${state}`);
      assert.doesNotMatch(said, /Season book|Farmer Finance|Derivation|\bDigest\b|End-of-day list|Settlement run|Needs you/, `${screen} ${state}: S57 glossary`);
      assert.doesNotMatch(said, /\u2014|\s\u2013\s/, `${screen} ${state}`);
    }
    for (const src of [SRC.trading, SRC.operations, SRC.finance, SRC.monitoring]) assert.doesNotMatch(src, /\u2014|\s\u2013\s/);
  });
});

/* ------------------------------------------------------------------ The component change */

describe('[M5.DS.02] ChartCard reads token colours', () => {
  function loadChartColor(computed) {
    const src = read(join(COMPONENTS, 'data/ChartCard.jsx'));
    const fn = src.match(/export function chartColor[\s\S]*?\n\}/)[0].replace(/^export /, '');
    return Function('getComputedStyle', 'document', `${fn}\nreturn chartColor;`)(() => ({ getPropertyValue: (n) => computed[n] || '' }), { documentElement: {} });
  }

  test('[M5.DS.02] a token colour is read from the page and a plain colour is returned as it is, so screens pass tokens and never a hex', () => {
    const chartColor = loadChartColor({ '--commodity-wheat': ' #7A6937' });
    assert.equal(chartColor('var(--commodity-wheat)'), '#7A6937');
    assert.equal(chartColor('#2563EB'), '#2563EB');
    assert.equal(chartColor('var(--missing, #df0c10)'), '#df0c10', 'a fallback when the token is not on the page');
    const src = read(join(COMPONENTS, 'data/ChartCard.jsx'));
    assert.match(src, /const color = chartColor\(s\.color \|\| '#2563EB', el\)/);
    assert.match(src, /color: chartColor\(p\.color \|\| '#df0c10', el\)/);
    assert.match(read(join(COMPONENTS, 'data/ChartCard.d.ts')), /export function chartColor\(value: string, el\?: Element \| null\): string;/);
    assert.match(read(join(COMPONENTS, 'data/ChartCard.prompt.md')), /chartColor/);
  });

  test('the build publishes the new screens and ChartCard\'s token colours', { skip: !existsSync(join(ROOT, 'dist')) && 'run npm run build first' }, () => {
    const one = read(join(ROOT, 'dist/ui_kits/one_link/ui_kits_one_link_index.kit.js'));
    for (const n of ['CoverHome', 'PriorityList', 'ForwardView', 'Consignment', 'FollowUp', 'VarianceDecision', 'FarmerAccount', 'StatementRun', 'StatementLayout', 'ExchangeRates', 'Coverage', 'CreditBook']) assert.ok(one.includes(n), n);
    assert.ok(read(join(ROOT, 'dist/ui_kits/admin_workspace/ui_kits_admin_workspace_index.kit.js')).includes('KeyUploadsList'));
    assert.match(read(join(ROOT, 'dist/_ds_bundle.js')), /chartColor/);
  });
});
