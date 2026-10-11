// The Trading workspace, M6.DS.01 (UAG-82): the kit's screens (a) to (n) and the contract list, the M6 states of the
// existing kit screens (TradeBoard, Approval, GradingDispute, GRNFinalise, StockBoard), the trading screens of the UAG
// One Link app, the quality specifications in Setup, and the two components the card added (MarginCell, PermitHeadroom).
// The screens are rendered against a stand-in React that records the tree and runs the kit's own functions, so what a
// reader meets is checked as drawn.
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
const TW = join(KITS, 'trading_workspace');
const ADMIN = join(KITS, 'admin_workspace');
const FIELD = join(KITS, 'field_app');
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

const FILES = {
  workspace: join(TW, 'Workspace.jsx'), trades: join(TW, 'Trades.jsx'), terms: join(TW, 'Terms.jsx'), supply: join(TW, 'Supply.jsx'),
  states: join(ONE_LINK, 'TradingStates.jsx'), quality: join(ADMIN, 'QualitySpecs.jsx'), app: join(FIELD, 'TradingApp.jsx'),
};
const SRC = Object.fromEntries(Object.entries(FILES).map(([k, p]) => [k, read(p)]));
const TWS = literal(SRC.workspace, 'TRADING_WORKSPACE_STATES');
const M6 = literal(SRC.states, 'M6_STATES');
const QS = literal(SRC.quality, 'QUALITY_SPEC_STATES');
const APP = literal(SRC.app, 'TRADING_APP_STATES');
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
    permitHeadroom: loadComponent('records/PermitHeadroom.jsx', ['permitHeadroom']).permitHeadroom,
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
const PROP_TEXT = ['label', 'title', 'aria-label', 'placeholder', 'caption', 'value', 'subject', 'context', 'name', 'subtitle', 'kind', 'objects', 'link', 'reason', 'meta', 'children', 'permit', 'mill', 'holder', 'period', 'action'];

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
      for (const k of ['fields', 'components', 'total', 'basis', 'items', 'headerRight', 'right', 'status', 'actions', 'overlay', 'footer', 'tabs', 'cells', 'outcomes', 'options', 'tiles']) if (k in p) walkValue(p[k], k);
      if (m.type === 'DataTable') {
        for (const c of p.columns || []) walkValue(c.label, 'label');
        for (const r of p.rows || []) {
          for (const c of p.columns || []) walkValue(c.render ? c.render(r, 0) : r[c.key], c.key);
          if (p.expand) walkValue(p.expand(r), 'expand');
        }
      }
      if (m.type === 'ExceptionList') for (const r of p.rows || []) out.push(r.type, r.title, r.record, r.business, r.businessRecord, r.owner, r.age);
    }
  };
  walkNode(tree);
  return out.map((s) => s.trim()).filter(Boolean);
}

/** A component file run against a recording React, for the component contracts. */
function loadComponent(file, names, deps = {}) {
  const src = read(join(COMPONENTS, file)).replace(/^import[^\n]*$/gm, '').replace(/^export\s+/gm, '');
  const code = transformSync(src, { loader: 'jsx', jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment' }).code;
  const R = { createElement: (type, props, ...children) => ({ type: typeof type === 'function' ? type.name : type, props: props || {}, children: children.flat() }), Fragment: 'Fragment' };
  const all = { React: R, textStyle: (variant) => ({ font: variant }), Icon: stub('Icon'), NotSet: stub('NotSet'), Restricted: stub('Restricted'), RefCell: stub('RefCell'), Card: stub('Card'), StatusMark: stub('StatusMark'), Refusal: stub('Refusal'), ...deps };
  return Function(...Object.keys(all), `${code}\nreturn { ${names.join(', ')} };`)(...Object.values(all));
}
const ctree = (n) => (n && typeof n === 'object' ? [n, ...(n.children || []).flatMap(ctree), ...Object.values(n.props || {}).filter((v) => v && typeof v === 'object' && 'type' in v).flatMap(ctree)] : []);

const KIT_FILES = [join(ONE_LINK, 'Shell.jsx'), join(ONE_LINK, 'Home.jsx'), join(ONE_LINK, 'TradeBoard.jsx'), join(ONE_LINK, 'Approval.jsx'), join(ONE_LINK, 'Weighbridge.jsx'), join(ONE_LINK, 'StockBoard.jsx'),
  FILES.states, join(ADMIN, 'Shell.jsx'), FILES.quality, FILES.workspace, FILES.trades, FILES.terms, FILES.supply, FILES.app];
// Shell's layout parts stay stand-ins, so their props (a rail, a panel) are walked as drawn.
const SHELL_PARTS = Object.fromEntries(['Sections', 'WithRail', 'WithPanel', 'PageHead', 'FigureStrip', 'ScrollRow', 'SectionLabel', 'Page'].map((n) => [n, stubFor(n)]));
const kit = loadKit(KIT_FILES.filter((f) => !f.endsWith('one_link/Shell.jsx')), SHELL_PARTS);
const draw = (screen, state) => render(el(kit[screen], { state, onOpen: () => {} }), kit);
const words = (screen, state) => wordsOf(draw(screen, state), kit);
const findAll = (tree, type) => nodes(tree).filter((n) => n.type === type);
const tables = (tree) => findAll(tree, 'DataTable');
const tableBy = (tree, firstLabel) => tables(tree).find((t) => t.props.columns[0].label === firstLabel);
const cell = (t, row, key) => { const c = t.props.columns.find((x) => x.key === key); return c.render ? c.render(row, 0) : row[key]; };
const textOf = (v) => { if (v == null) return ''; const r = typeof v === 'object' ? render(v, kit) : v; return typeof r === 'string' || typeof r === 'number' ? String(r) : wordsOf(r, kit).join(' '); };
const fieldsOf = (tree) => Object.fromEntries(findAll(tree, 'RecordHighlights')[0].props.fields.map((f) => [f.label, f.value]));
const buttons = (tree) => [...findAll(tree, 'Button'), ...findAll(tree, 'PressButton')];
const button = (tree, label) => buttons(tree).find((b) => b.children.join('') === label);

/** Every new screen and state, and every M6 state of an existing screen. */
const ALL = Object.entries({ ...TWS, ...QS, ...M6, ...APP }).flatMap(([s, list]) => list.map((st) => [s, st]));

/* ------------------------------------------------------------------ Composition */

const tokens = new Set(walk(join(ROOT, 'project/tokens')).filter((p) => p.endsWith('.css')).flatMap((p) => [...read(p).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])));
const loader = read(join(COMPONENTS, '_loader.js'));
const dsFiles = JSON.parse(loader.match(/var FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
const published = new Set(dsFiles.flatMap((f) => topLevel(read(join(COMPONENTS, f)))));
const kitNames = new Set([ONE_LINK, TW, ADMIN, FIELD].flatMap((d) => readdirSync(d).filter((n) => n.endsWith('.jsx')).map((n) => join(d, n))).flatMap((p) => topLevel(read(p))));
function compositionProblems(src) {
  const components = new Set([...published, ...kitNames, 'React']);
  const problems = [];
  for (const m of src.matchAll(/(^|[\s{;'"`])(--[a-z0-9-]+)['"]?\s*:/g)) problems.push(`defines token ${m[2]}`);
  for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) if (!tokens.has(m[1])) problems.push(`uses unknown token ${m[1]}`);
  for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g)) problems.push(`literal colour ${m[0]}`);
  for (const m of src.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) if (!components.has(m[1])) problems.push(`unknown component <${m[1]}>`);
  return problems;
}

/* ------------------------------------------------------------------ The kit and its screens */

describe('[M6.DS.01] the Trading workspace kit', () => {
  test('[M6.DS.01] a "Trading workspace" kit lists the screens (a) to (n) and the contract list with their files and states, in order (AC 1, 2)', () => {
    const index = read(join(TW, 'index.html'));
    assert.match(index, /@dsCard group="One Link"[^>]*name="Trading workspace"/);
    const rows = readmeRows(read(join(TW, 'README.md')));
    const FILE = { TradeWorkingView: 'Trades.jsx', TradeRecord: 'Trades.jsx', NewTrade: 'Trades.jsx', CloseTrade: 'Trades.jsx', GenerateContracts: 'Trades.jsx', ContractList: 'Trades.jsx',
      ContractTerms: 'Terms.jsx', AmendmentConfirm: 'Terms.jsx', LotDefinition: 'Terms.jsx', ScheduleGrid: 'Supply.jsx', PriceLadder: 'Supply.jsx', ShipmentAllocations: 'Supply.jsx',
      LongShort: 'Supply.jsx', PermitsList: 'Supply.jsx', DiversionTask: 'Supply.jsx' };
    for (const [s, list] of Object.entries(TWS)) assert.deepEqual(rows[s], { file: FILE[s], states: list }, s);
    assert.deepEqual(Object.keys(TWS), ['TradeWorkingView', 'ContractTerms', 'ScheduleGrid', 'PriceLadder', 'ShipmentAllocations', 'LongShort', 'TradeRecord', 'NewTrade', 'CloseTrade',
      'GenerateContracts', 'AmendmentConfirm', 'LotDefinition', 'PermitsList', 'DiversionTask', 'ContractList'], '(a) to (n) in the card\'s order, then the contract list');
    for (const [s, list] of Object.entries(M6)) assert.deepEqual(rows[s], { file: '../one_link/TradingStates.jsx', states: list }, s);
    assert.deepEqual(readmeRows(read(join(ADMIN, 'README.md'))).QualitySpecifications, { file: 'QualitySpecs.jsx', states: QS.QualitySpecifications });
    for (const s of [...Object.keys(TWS), 'QualitySpecifications', ...Object.keys(M6)]) assert.match(index, new RegExp(`'${s}'`), `${s} is in the screen index`);
    for (const f of ['Workspace.jsx', 'Trades.jsx', 'Terms.jsx', 'Supply.jsx', '../one_link/TradingStates.jsx', '../admin_workspace/QualitySpecs.jsx']) assert.ok(index.includes(`'${f}'`), f);
  });

  test('[M6.DS.01] every screen and state opens directly by ?screen=&state= in its person\'s frame, every trading page under the Trading breadcrumb (UX-04)', () => {
    for (const [screen, state] of ALL.filter(([s]) => !(s in APP))) {
      const f = kit.twFrame(screen, state);
      assert.ok(['trading', 'finance', 'clerk', 'stock', 'md', 'setup'].includes(f.who), `${screen} ${state}`);
      if (f.who === 'trading' || f.who === 'md') assert.equal(f.breadcrumb[0], 'Trading', `${screen} ${state}: the Trading breadcrumb`);
    }
    assert.deepEqual(kit.twFrame('QualitySpecifications', 'Editor').crumbs.slice(0, 1), ['Quality specifications']);
    const setup = read(join(ADMIN, 'Shell.jsx'));
    assert.match(setup, /\{ value: 'transporters', label: 'Transporters' \},\n\s*\/\/ Quality specifications[^\n]*\n\s*\{ value: 'quality', label: 'Quality specifications' \}\] \}/, 'under Reference data, after Transporters (S10)');
    assert.match(read(join(ADMIN, 'index.html')), /quality: \{ crumbs: \['Quality specifications'\], screens: \['QualitySpecifications'\] \}/);
    assert.match(read(join(ONE_LINK, 'index.html')), /'TradingStates\.jsx'/);
    assert.match(read(join(KITS, 'one_link_mobile/index.html')), /'TradingStates\.jsx'/, 'the phone kit loads the states its screens hand over to');
  });

  test('[M6.DS.01] the existing kit screens hand only their M6 states over; every state they had draws as it always has (AC 3)', () => {
    for (const [file, fn, prop] of [['TradeBoard.jsx', 'TradeBoard', 'TradeBoardM6'], ['Approval.jsx', 'Approval', 'ApprovalM6'], ['Weighbridge.jsx', 'GRNFinalise', 'GRNFinaliseM6'], ['Weighbridge.jsx', 'GradingDispute', 'GradingDisputeM6'], ['StockBoard.jsx', 'StockBoard', 'StockBoardM6']]) {
      assert.match(read(join(ONE_LINK, file)), new RegExp(`export function ${fn}\\(\\{[^}]*\\}\\) \\{\\n  if \\(M6_STATES\\.${fn}\\.includes\\(state\\)\\) return <${prop} `), `${fn} hands over its M6 states and nothing else`);
    }
    const old = render(el(kit.TradeBoard, { state: 'default' }), kit);
    assert.equal(findAll(old, 'PageHead')[0].props.title, 'Trade Desk', 'the owner variant still draws');
    assert.equal(findAll(render(el(kit.Approval, {}), kit), 'PageHead')[0].props.title, 'T-0141 · Crest Milling · Wheat');
    assert.equal(findAll(render(el(kit.StockBoard, { role: 'Owner' }), kit), 'PageHead')[0].props.title, 'Stock: Kafue Road, Lusaka');
    assert.match(findAll(render(el(kit.GRNFinalise, {}), kit), 'PageHead')[0].props.title, /^GR10000356/);
    assert.match(findAll(render(el(kit.GradingDispute, {}), kit), 'PageHead')[0].props.title, /^GR10000377/);
    const index = read(join(ONE_LINK, 'index.html'));
    for (const s of ['M6.TradeBoard', 'M6.Approval', 'M6.GRNFinalise', 'M6.GradingDispute', 'M6.StockBoard']) assert.ok(index.includes(s), `${s} beside the screen's own states`);
    assert.match(index, /options=\{\['Owner','Restricted','Loading',\.\.\.M6\.TradeBoard\]\}/, 'the old states keep their place');
  });
});

/* ------------------------------------------------------------------ The card's named contract tests */

describe('[M6.DS.01] the card\'s contract tests', () => {
  const { MarginCell, marginSign, marginWords } = loadComponent('data/MarginCell.jsx', ['MarginCell', 'marginSign', 'marginWords']);
  const { PermitHeadroom, permitHeadroom, permitReason } = loadComponent('records/PermitHeadroom.jsx', ['PermitHeadroom', 'permitHeadroom', 'permitReason']);

  test('[M6.DS.01] a margin cell shows a negative value with its signal and never as blank', () => {
    const neg = MarginCell({ value: '-800.00' });
    assert.equal(neg.props['data-margin'], 'negative');
    assert.ok(ctree(neg).some((n) => n.type === 'Icon' && n.props.name === 'trending-down'), 'the trending-down icon');
    assert.equal(neg.props.style.color, 'var(--content-accent-down)', 'the down colour');
    assert.ok(ctree(neg).some((n) => (n.children || []).includes('\u2212800.00')), 'the minus stays on the figure');
    assert.match(neg.props['aria-label'], /negative margin/);
    assert.equal(marginWords('-800.00', { currency: 'USD' }), 'USD \u2212800.00');
    for (const blank of ['', null, undefined, '  ', 'n/a']) {
      assert.equal(marginSign(blank), 'notSet', `${blank} is never read as 0`);
      const c = MarginCell({ value: blank });
      assert.ok(ctree(c).some((n) => n.type === 'NotSet'), `${blank}: Not set, never blank`);
    }
    assert.equal(marginSign('0.00'), 'zero');
    assert.equal(marginSign('17,920.00'), 'positive');
    assert.equal(MarginCell({ value: '0.00' }).props['data-margin'], 'zero', 'a true zero is 0');
    assert.equal(MarginCell({ value: '1.00', restricted: true }).type, 'Restricted');
    assert.equal(marginWords('11.95', { currency: 'USD', unit: 'per t' }), 'USD 11.95 per t');
    const link = MarginCell({ value: '8,365.00', onOpen: () => 'calc' });
    assert.equal(ctree(link).find((n) => n.type === 'RefCell').props.onOpen(), 'calc', 'the figure opens Calculation details');
    // On the screens: the negative leg is drawn with its sign, never hidden.
    const legs = tableBy(draw('TradeWorkingView', 'Negative margin'), 'Leg');
    const b = legs.props.rows.find((r) => r.id === 'B');
    assert.equal(cell(legs, b, 'margin').props.value, '-800.00');
    assert.equal(cell(legs, legs.props.rows.find((r) => r.total), 'margin').props.value, '11,420.00');
  });

  test('[M6.DS.01] a missing rate reads Not set, never 0 (the card\'s "no rate for this route", UX-16)', () => {
    // The card's test name reads "no rate for this route"; AC and UX-16 say Not set with the warning icon, so the
    // cell asserts Not set and Calculation details and the refusal name the route.
    const tree = draw('TradeWorkingView', 'Rate not set');
    const legs = tableBy(tree, 'Leg');
    const c = legs.props.rows.find((r) => r.id === 'C');
    assert.equal(render(cell(legs, c, 'transport'), kit).type, 'NotSet', 'the rate cell is Not set with the amber warning');
    assert.equal(cell(legs, c, 'perT').props.notSet, true);
    assert.equal(cell(legs, c, 'margin').props.notSet, true, 'the margin that depends on it is Not set');
    assert.equal(cell(legs, legs.props.rows.find((r) => r.total), 'margin').props.notSet, true, 'and the total');
    assert.equal(cell(legs, legs.props.rows.find((r) => r.id === 'A'), 'margin').props.value, '8,365.00', 'the other legs keep their margins');
    assert.doesNotMatch(JSON.stringify(c), /"transport":"0/, 'never a zero rate');
    const refusal = findAll(tree, 'Refusal')[0].props;
    assert.equal(`${refusal.action} is not allowed. ${refusal.reason}.`, 'Submit for approval is not allowed. No transport rate for Mpongwe to Riverbend Mill Kitwe intake.');
    assert.equal(button(tree, 'Submit for approval').props.disabled, true, 'Submit for approval is refused');
    assert.match(read(FILES.trades), /\{ label: 'Missing rate', value: TW_NO_RATE \}/, 'Calculation details names the missing rate');
  });

  test('[M6.DS.01] a generated ladder cell has no input and no edit affordance', () => {
    for (const state of TWS.PriceLadder.filter((s) => s !== 'Loading')) {
      const ladder = tables(draw('PriceLadder', state)).find((t) => t.props.columns[0].label === 'Month');
      for (const r of ladder.props.rows) for (const col of ladder.props.columns) {
        const v = render(cell(ladder, r, col.key), kit);
        assert.ok(!nodes(v).some((n) => ['Input', 'Select', 'Button', 'PressButton', 'input', 'select', 'button'].includes(n.type)), `${state} ${r.month} ${col.key}: no input`);
      }
      assert.ok(ladder.props.rows.every((r) => cell(ladder, r, 'source') === 'Price rule'), `${state}: every price is generated from the rule`);
    }
    const f = fieldsOf(draw('PriceLadder', 'Ladder'));
    assert.equal(f.Source, 'Price rule, Storage carry, 0.83% monthly, compounding', 'Source: Price rule as a labelled field');
    assert.deepEqual(kit.TW_LADDER.map((m) => m.v1), ['560.00', '564.65', '569.33', '574.06', '578.82', '583.63', '588.47', '593.36']);
    const v2 = tables(draw('PriceLadder', 'Version 2')).find((t) => t.props.columns[0].label === 'Month');
    assert.deepEqual(v2.props.columns.map((c) => c.label).slice(1, 3), ['Version 1 (USD per t)', 'Version 2 (USD per t)'], 'both versions stay visible');
    assert.match(words('PriceLadder', 'Lot not assigned').join(' | '), /Lot not assigned/, 'a load with no lot is never priced at 0');
  });

  test('[M6.DS.01] the blocked allocation state names permit, headroom and excess', () => {
    assert.deepEqual(permitHeadroom({ allowed: '10,000', booked: '9,950', adding: '100' }), { allowed: 10000, booked: 9950, adding: 100, headroom: 50, after: 0, excess: 50, refused: true, overOrdered: 0 });
    assert.equal(permitHeadroom({ allowed: '10,000', booked: '9,950', adding: '50' }).refused, false, 'exactly 0 headroom after it is allowed');
    assert.equal(permitHeadroom({ allowed: '10,000', booked: '9,950', wanted: '10,400' }).overOrdered, 400);
    assert.equal(permitReason('SI-2026-014', 50, 50), 'Exceeds permit SI-2026-014 headroom of 50 t by 50 t.');
    const panel = PermitHeadroom({ permit: 'SI-2026-014', mill: 'Riverbend Milling', allowed: '10,000', booked: '9,950', adding: '100', wanted: '10,400' });
    const refusal = ctree(panel).find((n) => n.type === 'Refusal').props;
    assert.equal(`${refusal.action} is not allowed. ${refusal.reason}`, 'Allocation is not allowed. Exceeds permit SI-2026-014 headroom of 50 t by 50 t.');
    const fine = PermitHeadroom({ permit: 'SI-2026-014', allowed: '10,000', booked: '9,950', adding: '50' });
    assert.ok(!ctree(fine).some((n) => n.type === 'Refusal'));
    const tree = draw('ShipmentAllocations', 'Refused allocation');
    const p = findAll(tree, 'PermitHeadroom')[0].props;
    assert.deepEqual([p.permit, p.allowed, p.booked, p.adding], ['SI-2026-014', '10,000', '9,950', '100']);
    assert.equal(button(tree, 'Allocate').props.disabled, true, 'Allocate is refused with it');
    assert.equal(button(draw('ShipmentAllocations', 'Allocate'), 'Allocate').props.disabled, false);
    for (const label of ['Wanted (t)', 'Allowed (t)', 'Booked (t)', 'Headroom (t)']) assert.ok(read(join(COMPONENTS, 'records/PermitHeadroom.jsx')).includes(`label="${label}"`), label);
  });

  test('[M6.DS.01] a wide grid scrolls inside its container at 390 px and the page does not', () => {
    for (const [screen, state, first] of [['ScheduleGrid', 'Contracts', 'Contract'], ['ScheduleGrid', 'Allocations', 'Allocation'], ['PriceLadder', 'Version 2', 'Month']]) {
      const t = tables(draw(screen, state)).find((x) => x.props.columns[0].label === first);
      assert.ok(t.props.minWidth > 358, `${screen} ${state}: the grid is wider than a phone's column (${t.props.minWidth}px), so it scrolls in its own container`);
    }
    const months = tableBy(draw('ScheduleGrid', 'Contracts'), 'Contract').props.columns.map((c) => c.label);
    assert.deepEqual(months.slice(2, 8), ['Sep 2026 (t)', 'Oct 2026 (t)', 'Nov 2026 (t)', 'Dec 2026 (t)', 'Jan 2027 (t)', 'Feb 2027 (t)'], 'months across with the unit in the header');
    const dt = read(join(COMPONENTS, 'data/DataTable.jsx'));
    assert.match(dt, /overflowX: 'auto'/, 'the table scrolls in its own container below its minimum width');
    assert.match(read(join(ONE_LINK, 'Home.jsx')), /return <DataTable rowKey="id" \{\.\.\.props\} minWidth=\{min\} \/>;/);
  });

  test('[M6.DS.01] the trade board draws awaiting approval, amendment awaiting approval, close suggested, closed with balance and gate purchase', () => {
    const tree = draw('TradeBoard', 'Trades by status');
    const t = tableBy(tree, 'Trade');
    const statuses = t.props.rows.map((r) => textOf(cell(t, r, 'status')));
    for (const s of ['Draft', 'Pending approval', 'Approved', 'Active', 'Closed']) assert.ok(statuses.includes(s), s);
    assert.ok(statuses.every((s) => ['Draft', 'Pending approval', 'Approved', 'Active', 'Closed'].includes(s)), 'only the S57 statuses (UX-32)');
    const approvals = findAll(tree, 'RailRow').filter((r) => /Amendment, SYN4702/.test(textOf(r.props.subject)));
    assert.equal(approvals.length, 1, 'the amendment is an item on the trade');
    assert.equal(textOf(approvals[0].props.right), 'Pending approval');
    assert.equal(textOf(cell(t, t.props.rows.find((r) => r.id === 'SYN4702'), 'status')), 'Active', 'the trade keeps its status');
    const close = findAll(tree, 'RailRow').find((r) => /Close suggested/.test(textOf(r.props.subject)));
    assert.ok(close && /SYN4790/.test(close.props.context), 'a suggested close is an exception on the trade');
    assert.equal(textOf(cell(t, t.props.rows.find((r) => r.id === 'SYN4790'), 'status')), 'Active', 'not a status');
    assert.ok(!statuses.includes('Close suggested'));
    const closed = tableBy(draw('TradeBoard', 'Closed with balance'), 'Trade');
    assert.deepEqual(closed.props.expanded, ['SYN4798']);
    assert.match(textOf(closed.props.expand(closed.props.rows[0])), /Remaining balance \| 38 t|Remaining balance 38 t/);
    const gate = tableBy(draw('TradeBoard', 'Gate purchase'), 'Trade');
    assert.equal(cell(gate, gate.props.rows[0], 'type'), 'Gate purchase', 'Gate purchase is a plain-text type value');
    assert.equal(textOf(cell(t, t.props.rows.find((r) => r.id === 'SYN4822'), 'type')), 'Gate purchase');
    assert.equal(typeof cell(t, t.props.rows.find((r) => r.id === 'SYN4822'), 'type'), 'string');
  });

  test('[M6.DS.01] the goods received note draws failed quality, held for drying, awaiting diversion and rejected and returned', () => {
    const status = (state) => findAll(draw('GRNFinalise', state), 'RecordHighlights')[0].props.status.props.label;
    assert.deepEqual(['Failed quality', 'Held for drying', 'Awaiting diversion', 'Rejected and returned'].map(status), ['Failed quality', 'Held for drying', 'Awaiting diversion', 'Rejected']);
    const routes = findAll(draw('GRNFinalise', 'Failed quality'), 'RadioList')[0].props.options.map((o) => o.label);
    assert.deepEqual(routes, ['Return to farmer', 'Dry on site', 'Divert'], 'the three routes');
    assert.ok(findAll(draw('GRNFinalise', 'Failed quality'), 'Field').some((f) => f.props.label === 'Reason' && f.props.required), 'each route needs a reason');
    assert.equal(button(draw('GRNFinalise', 'Saving route'), 'Save').props.loading, true);
    assert.match(words('GRNFinalise', 'Held for drying').join(' | '), /Owner \| Cameron Estates/, 'held for drying belongs to the farmer');
    assert.match(words('GRNFinalise', 'Awaiting diversion').join(' | '), /Waiting for \| J\. Tembo/);
    assert.match(words('GRNFinalise', 'Rejected and returned').join(' | '), /Route \| Return to farmer/);
    for (const state of M6.GRNFinalise) assert.doesNotMatch(words('GRNFinalise', state).join(' | '), /USD|ZMW|\bvalue\b|price|margin/i, `${state}: the Clerk's layout carries no money`);
  });

  test('[M6.DS.01] restricted-dash and working-button contracts reused, not duplicated (AC 5 to 8)', () => {
    for (const [name, src] of Object.entries(SRC)) {
      assert.doesNotMatch(src.replace(/\/\*[\s\S]*?\*\//g, ''), /RestrictedCell/, `${name}: new screens use Restricted`);
      assert.doesNotMatch(src, /function \w*(Restricted|Spinner|Busy)\w*\(/, `${name}: no second restricted or working-state part`);
    }
    assert.match(read(join(COMPONENTS, 'data/MarginCell.jsx')), /import \{ Restricted \} from '\.\/Restricted\.jsx';/);
    assert.match(read(join(COMPONENTS, 'data/MarginCell.jsx')), /import \{ NotSet \} from '\.\.\/feedback\/NotSet\.jsx';/);
    assert.match(read(join(COMPONENTS, 'records/PermitHeadroom.jsx')), /import \{ Refusal \} from '\.\.\/feedback\/Refusal\.jsx';/);
  });
});

/* ------------------------------------------------------------------ Acceptance criteria */

describe('[M6.DS.01] the screens, by acceptance criterion', () => {
  test('[M6.DS.01] (a) the trade working view: buyer, lined legs, prices, transport and margin per leg and in total, uncovered tonnage, exposure and the transport rate before commit, Rates as of and the exchange rate as labelled fields (AC 1a)', () => {
    const tree = draw('TradeWorkingView', 'Working');
    const f = fieldsOf(tree);
    for (const k of ['Buyer', 'Commodity', 'Quantity', 'Lined', 'Uncovered', 'Margin', 'Margin per t', 'Owner']) assert.ok(k in f, k);
    const legs = tableBy(tree, 'Leg');
    assert.deepEqual(legs.props.columns.map((c) => c.label), ['Leg', 'Supplier', 'Pickup district', 'Quantity (t)', 'Price (USD per t)', 'Transport (USD per t)', 'Margin (USD per t)', 'Margin (USD)']);
    assert.ok(legs.props.rows.some((r) => r.total), 'a total');
    assert.equal(typeof cell(legs, legs.props.rows[0], 'transport'), 'string', 'the transport rate fills itself and is never an input');
    const said = words('TradeWorkingView', 'Working').join(' | ');
    for (const re of [/Before this trade \| USD 574,000\.00/, /Single client limit \| USD 5,000,000\.00/, /Rates as of \| 26 Sep 2026/, /Exchange rate \| ZMW 25\.00 per USD/]) assert.match(said, re);
    assert.equal(textOf(f.Uncovered), '0 t');
    assert.equal(textOf(fieldsOf(draw('TradeWorkingView', 'Uncovered tonnage')).Uncovered), '100 t');
    assert.equal(findAll(draw('TradeWorkingView', 'Calculation details'), 'CalculationDetails').length, 1, 'margin opens Calculation details (UX-18)');
  });

  test('[M6.DS.01] (b) contract terms: quality specification, grade differentials, the contract basis and what it governs, amendment history (AC 1b)', () => {
    const said = words('ContractTerms', 'Sale').join(' | ');
    for (const re of [/Specification \| Wheat, ZAMACE grade 1/, /Contract basis \| Delivered/, /Invoice weight \| Offloaded weight at the buyer/, /Price adjustment for grade/, /Transit loss \| Carried by the seller/]) assert.match(said, re);
    assert.match(words('ContractTerms', 'Purchase leg').join(' | '), /Transit loss \| Carried by the buyer/);
    const diff = tableBy(draw('ContractTerms', 'Sale'), 'Grade');
    assert.equal(diff.props.columns.find((c) => c.key === 'diff').label, 'Differential (USD per t)');
    assert.ok(tableBy(draw('ContractTerms', 'Sale'), 'Term'), 'amendment history');
    const refusal = findAll(draw('ContractTerms', 'Basis missing'), 'Refusal')[0].props;
    assert.equal(`${refusal.action} is not allowed. ${refusal.reason}.`, 'Submit for approval is not allowed. Choose collected or delivered for SYN4810-B.');
  });

  test('[M6.DS.01] (c) the monthly schedule grid: months across, contracts or allocations down, scheduled against delivered (AC 1c)', () => {
    const t = tableBy(draw('ScheduleGrid', 'Contracts'), 'Contract');
    const lines = t.props.rows.filter((r) => r.contract === 'SYN4702' || !r.contract).slice(0, 3).map((r) => r.line);
    assert.deepEqual(lines, ['Scheduled', 'Delivered', 'Behind']);
    const alloc = tableBy(draw('ScheduleGrid', 'Allocations'), 'Allocation');
    assert.ok(alloc.props.rows.some((r) => r.line === 'Corridor'), 'a planned corridor on each month');
    assert.ok(alloc.props.rows.some((r) => r.group && r.contract === 'Riverbend Milling'), 'grouped under the mill');
    assert.match(words('ScheduleGrid', 'Not fully scheduled').join(' | '), /100 t of the contract is not scheduled/);
    assert.match(words('ScheduleGrid', 'Empty').join(' | '), /No schedules to display\./);
  });

  test('[M6.DS.01] (e) shipment and allocations, with a permit panel per mill showing wanted, allowed, booked and headroom (AC 1e)', () => {
    const tree = draw('ShipmentAllocations', 'Allocations');
    const panels = findAll(tree, 'PermitHeadroom').map((p) => p.props.mill);
    assert.deepEqual(panels, ['Riverbend Milling', 'Crestline Milling', 'Kafue Valley Milling', 'Copperhill Mills'], 'one panel per mill');
    const t = tableBy(tree, 'Allocation');
    assert.deepEqual(t.props.columns.map((c) => c.label), ['Allocation', 'Mill', 'Contract', 'OBL', 'Corridor', 'Lot', 'Delivery start', 'Allocated (t)']);
    assert.match(words('ShipmentAllocations', 'Fully allocated').join(' | '), /MV Kalahari is fully allocated, 42,500 t of 42,500 t\. This allocation would exceed it by 100 t/);
    assert.equal(buttons(draw('ShipmentAllocations', 'Operations, read only')).filter((b) => /Allocate/.test(b.children.join(''))).length, 0, 'Operations reads, never allocates');
  });

  test('[M6.DS.01] (f) long and short by origin and corridor, every figure opening what it is made of and none changeable (AC 1f)', () => {
    const t = tableBy(draw('LongShort', 'By origin'), 'Origin');
    assert.deepEqual(t.props.rows.map((r) => [r.origin, r.gap]), [['Australia', 'Long 1,200'], ['Baltic', 'Short 594'], ['South Africa', 'Flat'], ['Total', 'Long 606']]);
    const n = (v) => Number(String(v).replace(/,/g, ''));
    const sum = (k) => t.props.rows.filter((r) => !r.total).reduce((a, r) => a + n(r[k]), 0);
    assert.deepEqual([sum('ordered'), sum('booked')], [131080, 131686]);
    const c = tableBy(draw('LongShort', 'By corridor'), 'Origin');
    assert.ok(c.props.rows.some((r) => r.corridor === 'Corridor not planned'), 'never dropped from the totals');
    assert.ok(c.props.rows.some((r) => r.corridor === 'Booked, not yet allocated'));
    assert.equal(findAll(draw('LongShort', 'Calculation details'), 'CalculationDetails')[0].props.open, true);
    for (const st of TWS.LongShort) assert.equal([...findAll(draw('LongShort', st), 'Input'), ...findAll(draw('LongShort', st), 'Select')].length, 0, `${st}: nothing to change`);
  });

  test('[M6.DS.01] (g) the trade record: highlights with status, then Details, Related and History; legs and load chain rows; Related cards only when their records exist (AC 1g)', () => {
    const tree = draw('TradeRecord', 'Details');
    const h = findAll(tree, 'RecordHighlights')[0].props;
    assert.deepEqual(h.tabs || ['Details', 'Related', 'History'], ['Details', 'Related', 'History']);
    assert.equal(textOf(h.status), 'Active');
    const legs = tableBy(tree, 'Leg');
    assert.deepEqual(legs.props.expanded, ['C']);
    const chain = render(legs.props.expand(legs.props.rows[2]), kit);
    assert.deepEqual(tables(chain)[0].props.columns.map((c) => c.label), ['Truck', 'Ticket', 'Goods received note', 'Date', 'Weight (t)', 'Grade', 'Deducted (t)']);
    assert.match(wordsOf(chain, kit).join(' | '), /No goods received note recorded/, 'a missing link is named, never blank');
    const related = draw('TradeRecord', 'Related');
    const cards = findAll(related, 'Card').map((c) => textOf(c.props.title).replace(/\s*\d+$/, ''));
    assert.deepEqual(cards, ['Contracts', 'Items to approve', 'Exceptions']);
    assert.ok(!cards.some((c) => /Invoice|Payment|Cost/.test(c)), 'no invoice, payment or cost card while none is recorded');
    assert.ok(tableBy(draw('TradeRecord', 'History'), 'Field').props.columns.some((c) => c.label === 'Role'));
  });

  test('[M6.DS.01] (h) a new trade captures the enquiry, and the close-trade dialog shows contracted, delivered and remaining per leg with a mandatory reason (AC 2h)', () => {
    const fields = findAll(draw('NewTrade', 'Enquiry'), 'Field').map((f) => f.props.label);
    for (const l of ['Buyer', 'Commodity', 'Approximate quantity (t)', 'Destination', 'Delivery from', 'Delivery to', 'Type', 'Owner', 'Source note']) assert.ok(fields.includes(l), l);
    const types = findAll(draw('NewTrade', 'Enquiry'), 'Select').find((s) => s.props.options.includes('Import')).props.options;
    assert.ok(types.filter((o) => typeof o === 'object' && o.disabled).length === 2, 'crush and offtake and storage mandate cannot be chosen');
    assert.equal(button(draw('NewTrade', 'Saving'), 'Save').props.loading, true);
    const dialog = findAll(draw('CloseTrade', 'Close'), 'Dialog')[0];
    assert.equal(dialog.props.title, 'Close trade SYN4790?');
    const legs = tables(dialog).find((t) => t.props.columns.some((c) => c.label === 'Remaining (t)'));
    assert.deepEqual(legs.props.columns.map((c) => c.label), ['Leg', 'Contracted (t)', 'Delivered (t)', 'Remaining (t)']);
    assert.equal(textOf(dialog.props.footer).includes('Close'), true);
    const closeBtn = (state) => findAll(render(findAll(draw('CloseTrade', state), 'Dialog')[0].props.footer, kit), 'Button').find((b) => b.children.join('') === 'Close');
    assert.equal(closeBtn('Close').props.disabled, true, 'Close waits for the reason');
    assert.equal(closeBtn('Reason given').props.disabled, false);
    assert.equal(closeBtn('Closing').props.loading, true);
    assert.equal(textOf(fieldsOf(draw('CloseTrade', 'Closed'))['Remaining balance']), '4 t');
  });

  test('[M6.DS.01] (i) generate contracts under the reserved sale reference, and signature recording with "n of m signed" (AC 2i)', () => {
    assert.equal(fieldsOf(draw('GenerateContracts', 'Approved'))['Sale reference'], 'SYN4810');
    const dialog = findAll(draw('GenerateContracts', 'Generate contracts'), 'Dialog')[0];
    assert.match(textOf(dialog.children), /reserved sale reference SYN4810/);
    assert.deepEqual(tables(dialog)[0].props.rows.map((r) => r.id), ['SYN4810', 'SYN4810-A', 'SYN4810-B', 'SYN4810-C']);
    assert.equal(fieldsOf(draw('GenerateContracts', '3 of 4 signed')).Signed, '3 of 4 signed');
    assert.equal(fieldsOf(draw('GenerateContracts', 'Signed')).Signed, '4 of 4 signed');
    assert.equal(textOf(findAll(draw('GenerateContracts', 'Signed'), 'RecordHighlights')[0].props.status), 'Active');
    assert.equal(findAll(draw('GenerateContracts', 'Record signature'), 'Dialog')[0].props.title, 'Record signature, SYN4810-C');
  });

  test('[M6.DS.01] (j) the amendment confirmation names the affected loads, the reason and the effective date (AC 2j)', () => {
    const dialog = findAll(draw('AmendmentConfirm', 'Confirm'), 'Dialog')[0];
    assert.equal(dialog.props.title, 'Confirm amendment, SYN4702-A');
    assert.equal(tables(dialog)[0].props.rows.length, 12, 'the 12 delivered loads are named');
    const labels = findAll(dialog, 'Field').map((f) => [f.props.label, f.props.required]);
    assert.deepEqual(labels, [['Effective date', true], ['Reason', true]]);
    const submit = (state) => findAll(render(findAll(draw('AmendmentConfirm', state), 'Dialog')[0].props.footer, kit), 'Button').find((b) => b.children.join('') === 'Submit for approval');
    assert.equal(submit('Confirm').props.disabled, true, 'a reason first (UX-22)');
    assert.equal(submit('Submitting').props.loading, true);
    assert.match(words('AmendmentConfirm', 'Pending approval').join(' | '), /Amendment, SYN4702-A/);
  });

  test('[M6.DS.01] (k) the quality specification editor: parameter, limit, step, deduction per step, reject limit and version, under Setup, Reference data (AC 2k)', () => {
    const editor = draw('QualitySpecifications', 'Editor');
    const t = tables(editor)[0];
    assert.deepEqual(t.props.columns.map((c) => c.label), ['Parameter', 'Unit', 'Limit (%)', 'Step (points)', 'Deduction per step (% of weight)', 'Reject limit (%)']);
    assert.equal(fieldsOf(editor).Version, '4');
    const missing = draw('QualitySpecifications', 'Missing field');
    assert.equal(findAll(missing, 'Refusal')[0].props.action, 'Save');
    assert.equal(button(missing, 'Save').props.disabled, true);
    assert.equal(button(draw('QualitySpecifications', 'Saving'), 'Save').props.loading, true);
    const list = tables(draw('QualitySpecifications', 'Specifications'))[0].props;
    assert.equal(list.columns.at(-1).label, 'Status');
    const defaults = list.rows.filter((r) => r.isDefault === 'Yes').map((r) => r.product);
    assert.equal(new Set(defaults).size, defaults.length, 'exactly one default per product');
  });

  test('[M6.DS.01] (l) a lot with base price, base month and the rule label; the lot picker at capture shows no price (AC 2l)', () => {
    const fields = findAll(draw('LotDefinition', 'New lot'), 'Field').map((f) => f.props.label);
    for (const l of ['Base price (USD per t)', 'Base month']) assert.ok(fields.includes(l), l);
    assert.match(words('LotDefinition', 'New lot').join(' | '), /Source \| Price rule, Storage carry, 0\.83% monthly, compounding/);
    assert.equal(findAll(draw('LotDefinition', 'Missing base month'), 'Field').find((f) => f.props.label === 'Base month').props.error, 'Choose a base month.');
    const picker = findAll(draw('LotDefinition', 'Lot picker'), 'RadioList')[0].props.options;
    assert.deepEqual(picker.map((o) => o.value), ['SYN4666-L1', 'SYN4666-L2']);
    assert.doesNotMatch(JSON.stringify(picker) + words('LotDefinition', 'Lot picker').join(' '), /USD|ZMW|price/i, 'no price at capture');
    assert.match(words('LotDefinition', 'One open lot').join(' | '), /the only open lot/);
  });

  test('[M6.DS.01] (m) the permits list in the list view layout, Status last, and the permit-limit exception row (AC 2m)', () => {
    const t = tableBy(draw('PermitsList', 'All'), 'Permit');
    assert.deepEqual(t.props.columns.map((c) => c.label), ['Permit', 'Mill', 'Holder', 'Commodity', 'Period', 'Allowed (t)', 'Booked (t)', 'Headroom (t)', 'Status']);
    assert.ok(t.props.rows.every((r) => ['Riverbend Milling', 'Kafue Valley Milling', 'Own'].includes(r.holder)), 'the holder is the mill or One Link\'s own company');
    const ex = findAll(draw('PermitsList', 'Permit limit exception'), 'ExceptionList')[0].props.rows[0];
    assert.equal(ex.business, 'Riverbend Milling at permit limit: cannot allocate more');
    assert.equal(textOf(cell(tableBy(draw('PermitsList', 'At limit'), 'Permit'), tableBy(draw('PermitsList', 'At limit'), 'Permit').props.rows[0], 'status')), 'At limit');
    assert.ok(!buttons(draw('PermitsList', 'Operations, read only')).some((b) => b.children.join('') === 'New'), 'Operations cannot record a permit');
  });

  test('[M6.DS.01] (n) the diversion completion task: new buyer, both prices, the approval state; the Clerk sees no price and no action (AC 2n)', () => {
    const said = words('DiversionTask', 'Pending approval').join(' | ');
    for (const re of [/Buyer \| Kafue Stockfeeds Ltd/, /Sale price \| ZMW 5,900\.00 per t/, /Purchase price, Cameron Estates \| ZMW 5,200\.00 per t/, /Transport \| ZMW 250\.00 per t/]) assert.match(said, re);
    const steps = tableBy(draw('DiversionTask', 'Pending approval'), 'Step');
    assert.equal(textOf(cell(steps, steps.props.rows[1], 'status')), 'Pending approval');
    assert.equal(textOf(cell(tableBy(draw('DiversionTask', 'Completed'), 'Step'), tableBy(draw('DiversionTask', 'Completed'), 'Step').props.rows[1], 'status')), 'Approved');
    assert.equal(button(draw('DiversionTask', 'Submitting'), 'Submit for approval').props.loading, true);
    const clerk = draw('DiversionTask', 'Clerk view');
    assert.equal(buttons(clerk).length, 0, 'only Trading completes a diversion');
    assert.doesNotMatch(words('DiversionTask', 'Clerk view').join(' | '), /ZMW|USD|price|margin/i);
  });

  test('[M6.DS.01] the approval record matches Owen\'s: highlights, Waiting for, Trade information, Purchase legs with a Total row, Approval history, Approve and Reject with a comment, and History with the role (AC 3, AC 10)', () => {
    const tree = draw('Approval', 'Pending approval');
    const h = findAll(tree, 'RecordHighlights')[0].props;
    assert.deepEqual(h.fields.map((f) => f.label), ['Counterparty', 'Commodity', 'Quantity', 'Margin', 'Owner', 'Submitted', 'Waiting for']);
    assert.equal(h.fields.at(-1).value, 'T. Mwila');
    const outcomes = findAll(tree, 'DecisionActions')[0].props.outcomes;
    assert.deepEqual(outcomes.map((o) => [o.label, o.variant, !!o.comment]), [['Reject', 'critical', true], ['Approve', 'primary', false]]);
    const said = words('Approval', 'Pending approval').join(' | ');
    assert.match(said, /Rates as of \| 25 Sep 2026/);
    assert.match(said, /Exchange rate \| ZMW 25\.00 per USD/);
    assert.ok(tableBy(tree, 'Leg').props.rows.some((r) => r.total), 'Purchase legs with a Total row');
    assert.deepEqual(tableBy(tree, 'Step').props.columns.map((c) => c.label).slice(0, 4), ['Step', 'Assigned to', 'Status', 'Date (CAT)']);
    const reject = findAll(draw('Approval', 'Reject'), 'ReasonDialog')[0].props;
    assert.deepEqual([reject.title, reject.label, reject.minLength, reject.confirmLabel, reject.confirmVariant], ['Reject trade SYN4810?', 'Comment', 1, 'Reject', 'critical']);
    assert.equal(findAll(draw('Approval', 'Rejecting'), 'ReasonDialog')[0].props.busy, true);
    assert.equal(findAll(draw('Approval', 'Approving'), 'DecisionActions')[0].props.busy, 'approve');
    const deputy = fieldsOf(draw('Approval', 'Deputy decision'));
    assert.deepEqual([deputy['Approved by'], deputy['On behalf of']], ['N. Phiri', 'Managing Director']);
    assert.match(words('Approval', 'Deputy decision').join(' | '), /Acting as \| Deputy/, 'the authority snapshot panel');
    assert.equal(findAll(draw('Approval', "Requester's view"), 'DecisionActions').length, 0, 'no Approve for the requester');
    const history = tableBy(draw('Approval', 'History'), 'Field');
    const decision = history.props.rows[0];
    assert.deepEqual([decision.user, decision.role, decision.next, decision.date], ['T. Mwila', 'Managing Director', 'Approved', '26 Sep 2026, 07:20']);
  });

  test('[M6.DS.01] the grading dispute: a re-test supersedes a result only by a decision, and both stay (AC 3)', () => {
    const before = tableBy(draw('GradingDispute', 'Re-test recorded'), 'Result');
    assert.equal(before.props.rows.length, 2);
    assert.equal(textOf(cell(before, before.props.rows[0], 'mark')), 'Disputed');
    const after = tableBy(draw('GradingDispute', 'Decided'), 'Result');
    assert.deepEqual(after.props.rows.map((r) => textOf(cell(after, r, 'mark'))), ['Superseded by re-test', 'Applies']);
    assert.match(words('GradingDispute', 'Decided').join(' | '), /Correction: the re-test applies/, 'the money is corrected beside the original');
    assert.equal(findAll(draw('GradingDispute', 'Deciding'), 'DecisionActions')[0].props.busy, 'retest');
  });

  test('[M6.DS.01] the stock board: stack, bay and silo grouping, third-party sites, and stock owned by others shown apart (AC 3)', () => {
    const t = tableBy(draw('StockBoard', 'By storage unit'), 'Site');
    const kinds = new Set(t.props.rows.filter((r) => !r.total).map((r) => r.kind));
    for (const k of ['Stack', 'Bay', 'Silo']) assert.ok(kinds.has(k), k);
    assert.ok(t.props.columns.some((c) => c.label === 'Owner'));
    assert.ok(tableBy(draw('StockBoard', 'Third-party sites'), 'Site').props.rows.filter((r) => !r.total).every((r) => r.siteType === 'Third party'));
    assert.ok(tableBy(draw('StockBoard', 'Owned by others'), 'Site').props.rows.filter((r) => !r.total).every((r) => r.owner !== 'Own'));
    const situations = tableBy(draw('StockBoard', 'By storage unit'), 'Situation').props.rows;
    assert.equal(situations.length, 5, 'the five situations, each named');
    assert.deepEqual(situations.map((r) => r.counts), ['Yes', 'Yes', 'Yes', 'Yes', 'No'], 'another owner\'s grain never counts');
    for (const st of M6.StockBoard) assert.doesNotMatch(words('StockBoard', st).join(' | '), /USD|ZMW|value|price/i, `${st}: stock control's layout carries no money`);
  });
});

/* ------------------------------------------------------------------ Visibility, money, formats, words, working states */

describe('[M6.DS.01] cross-cutting rules', () => {
  test('[M6.DS.01] a withheld money figure on a shared layout is the Restricted lock, never blank, a dash or zero; otherwise the column is left out (AC 7)', () => {
    const work = draw('TradeWorkingView', 'Without the contract tier');
    assert.equal(fieldsOf(work).Margin.props.restricted, true, 'the shared Margin field is the lock');
    assert.deepEqual(tableBy(work, 'Leg').props.columns.map((c) => c.label), ['Leg', 'Supplier', 'Pickup district', 'Quantity (t)'], 'price, transport and margin columns left out');
    assert.doesNotMatch(words('TradeWorkingView', 'Without the contract tier').join(' | '), /USD|ZMW|\d+\.\d{2}\b/, 'no money leaks');
    const ladder = tables(draw('PriceLadder', 'Without the contract tier')).find((t) => t.props.columns[0].label === 'Month');
    assert.ok(ladder.props.rows.every((r) => render(cell(ladder, r, 'v1'), kit).type === 'Restricted'), 'each ladder price is the lock');
    assert.equal(fieldsOf(draw('PriceLadder', 'Without the contract tier'))['Base price'].type, 'Restricted');
    const terms = draw('ContractTerms', 'Without the contract tier');
    assert.equal(fieldsOf(terms).Price.type, 'Restricted');
    const diff = tableBy(terms, 'Grade');
    assert.ok(diff.props.rows.every((r) => render(cell(diff, r, 'diff'), kit).type === 'Restricted'), 'a differential is the lock');
    assert.equal(fieldsOf(draw('TradeRecord', 'Without the contract tier')).Margin.props.restricted, true);
    for (const src of Object.values(SRC)) assert.doesNotMatch(src, /'\u2014'|"\u2014"|>\u2014</, 'never a dash for a withheld value');
  });

  test('[M6.DS.01] every button that saves, submits for approval, approves, rejects, generates, records, allocates, closes or exports draws its working state (AC 8)', () => {
    for (const [screen, state, label] of [['TradeWorkingView', 'Submitting', 'Submit for approval'], ['NewTrade', 'Saving', 'Save'], ['GenerateContracts', 'Generating', 'Generate contracts'],
      ['ShipmentAllocations', 'Allocating', 'Allocate'], ['ScheduleGrid', 'Saving', 'Save'], ['LotDefinition', 'Saving', 'Save'], ['QualitySpecifications', 'Saving', 'Save'],
      ['DiversionTask', 'Submitting', 'Submit for approval'], ['ContractList', 'Exporting', 'Export'], ['GRNFinalise', 'Saving route', 'Save']]) {
      const b = button(draw(screen, state), label);
      assert.ok(b, `${screen} ${state}: ${label}`);
      assert.equal(b.props.loading, true, `${screen} ${state}: ${label} works`);
    }
    const inFooter = (screen, state, label) => findAll(render(findAll(draw(screen, state), 'Dialog')[0].props.footer, kit), 'Button').find((b) => b.children.join('') === label).props.loading;
    assert.equal(inFooter('GenerateContracts', 'Generating', 'Generate contracts'), true);
    assert.equal(inFooter('GenerateContracts', 'Recording', 'Save'), true, 'recording a signature');
    assert.equal(inFooter('CloseTrade', 'Closing', 'Close'), true);
    assert.equal(inFooter('AmendmentConfirm', 'Submitting', 'Submit for approval'), true);
    assert.equal(findAll(draw('Approval', 'Approving'), 'DecisionActions')[0].props.busy, 'approve');
    assert.equal(findAll(draw('Approval', 'Rejecting'), 'ReasonDialog')[0].props.busy, true);
  });

  test('[M6.DS.01] a gate purchase shows its gate price in kwacha per tonne, while value and roll-ups are in US dollars with the exchange rate and its date (AC 11)', () => {
    const tree = draw('TradeBoard', 'Gate purchase');
    const t = tableBy(tree, 'Trade');
    assert.deepEqual(t.props.columns.filter((c) => /\(/.test(c.label)).map((c) => c.label), ['Received (t)', 'Gate price (ZMW per t)', 'Value (USD)']);
    assert.deepEqual([t.props.rows[0].gate, t.props.rows[0].usd], ['4,300.00', '5,404.24']);
    const said = words('TradeBoard', 'Gate purchase').join(' | ');
    for (const re of [/Gate price \| ZMW 4,300\.00 per t/, /Value in US dollars \| USD 5,404\.24/, /Exchange rate \| ZMW 25\.00 per USD/, /Rates as of \| 26 Sep 2026/]) assert.match(said, re);
    assert.equal(Math.round(31.42 * 4300 / 25 * 100) / 100, 5404.24, 'the roll-up is the gate value at the rate shown');
  });

  test('[M6.DS.01] numbers right-aligned with the unit or currency in the header, summary tonnes whole and weighbridge weights three decimals, month ranges "Sep 2026 to Nov 2026", the commodity marker on every row, a missing value blank, and links only where the viewer can open (AC 12)', () => {
    for (const [screen, state] of ALL.filter(([s]) => !(s in APP))) {
      for (const t of tables(draw(screen, state))) {
        for (const c of t.props.columns) {
          if (/\((t|%|USD|ZMW|USD per t|ZMW per t|points|% of weight)\)$/.test(String(c.label)) && !/Line|Contract|Allocation/.test(c.label)) assert.equal(c.align, 'right', `${screen} ${state}: ${c.label} is right-aligned`);
          if (/^(Price|Value|Margin|Amount|Transport|Differential)\b/.test(String(c.label))) assert.match(c.label, /\((USD|ZMW)( per t)?\)$/, `${screen} ${state}: ${c.label} names its currency`);
          if (c.key === 'commodity') for (const r of t.props.rows.filter((x) => !x.total && !x.group)) assert.equal(render(cell(t, r, 'commodity'), kit).type, 'CommodityMarker', `${screen} ${state}: the commodity marker`);
        }
      }
      for (const w of words(screen, state)) {
        assert.doesNotMatch(w, /\bK\d|\d\s?(USD|ZMW)\b(?! per)|\$\d/, `${screen} ${state}: money "${w}" carries its code before the amount`);
        assert.doesNotMatch(w, /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) to (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b|\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b(AM|PM)\b/, `${screen} ${state}: date "${w}"`);
        assert.doesNotMatch(w, /^(None|Not recorded|N\/A|-)$/, `${screen} ${state}: a missing value is blank`);
      }
    }
    const weighed = [...kit.TW_LOAD_CHAIN.map((r) => r.weight), ...kit.TW_AFFECTED_LOADS.map((r) => r.weight)];
    assert.ok(weighed.every((w) => /^\d+\.\d{3}$/.test(w)), 'weighbridge weights carry three decimals');
    const summary = [...kit.TW_CONTRACTS.flatMap((r) => [r.quantity, r.delivered, r.left]), ...kit.TW_ALLOCATIONS.map((r) => r.tonnes), ...kit.TW_ORIGINS.flatMap((r) => [r.ordered, r.booked])];
    assert.ok(summary.every((w) => /^\d{1,3}(,\d{3})*$/.test(w)), 'summary tonnes carry no decimals');
    assert.match(words('TradeRecord', 'Details').join(' | '), /Delivery window \| Sep 2026 to Nov 2026/);
    const wh = tableBy(draw('ContractList', 'Warehouse view'), 'Contract');
    assert.ok(wh.props.rows.filter((r) => !r.total).every((r) => typeof render(cell(wh, r, 'id'), kit) === 'string'), 'Warehouse cannot open a contract, so it is plain text');
    const tr = tableBy(draw('ContractList', 'All'), 'Contract');
    assert.ok(tr.props.rows.filter((r) => !r.total).every((r) => render(cell(tr, r, 'id'), kit).type === 'HmLink' || render(cell(tr, r, 'id'), kit).type === 'RefCell'), 'Trading opens them, so they are links');
  });

  test('[M6.DS.01] trading words only: S57 statuses, no lifecycle names as statuses, no system words, the S57 glossary\'s right column, fictional data that never says UAG, and no em dash', () => {
    const STATUS = new Set(['Draft', 'Pending approval', 'Approved', 'Active', 'Closed', 'Rejected', 'Submitted']);
    for (const [screen, state] of [['TradeBoard', 'Trades by status'], ['ContractList', 'All'], ['GenerateContracts', 'Drafts'], ['Approval', 'Deputy decision'], ['TradeRecord', 'Related']]) {
      for (const m of findAll(draw(screen, state), 'StatusMark')) if (!/^Last refreshed/.test(m.props.label)) assert.ok(STATUS.has(m.props.label), `${screen} ${state}: ${m.props.label} is an S57 status`);
    }
    for (const [screen, state] of ALL) {
      const said = words(screen, state).join(' | ');
      for (const m of findAll(draw(screen, state), 'StatusMark')) assert.doesNotMatch(String(m.props.label), /^(Enquiry|Working|Contracted)$/, `${screen} ${state}: lifecycle names stay in specs`);
      assert.doesNotMatch(said, /\b(batch|sync|synced|projection|upload|template)\b/i, `${screen} ${state}: no system words`);
      for (const g of BANNED.m5.glossary) assert.ok(!said.includes(g), `${screen} ${state}: S57 glossary "${g}"`);
      assert.doesNotMatch(said, /\bUAG\b|United African Grain|National Milling|Royal Milling|Antelope|\bOwen\b|\bJacques\b|\bAlka\b|\bSid\b|\bAshraf\b/, `${screen} ${state}: fictional, and One Link never UAG`);
      assert.doesNotMatch(said, /\u2014|\s\u2013\s/, `${screen} ${state}: no em dash`);
    }
    for (const src of [...Object.values(SRC), read(join(COMPONENTS, 'data/MarginCell.jsx')), read(join(COMPONENTS, 'records/PermitHeadroom.jsx')), read(join(TW, 'README.md')), read(join(COMPONENTS, 'records/trading.card.html'))]) {
      assert.doesNotMatch(src, /\u2014|\s\u2013\s/, 'no em dash or spaced en dash');
    }
  });

  test('[M6.DS.01] the contract list and the trading app screens compose published components only (AC 9)', () => {
    const list = tableBy(draw('ContractList', 'All'), 'Contract');
    assert.deepEqual(list.props.columns.map((c) => c.label), ['Contract', 'Kind', 'Counterparty', 'Commodity', 'Quantity (t)', 'Delivered (t)', 'Left (t)', 'Cover (t)', 'Status'], 'record link first, Status last (UX-07)');
    assert.ok(list.props.rows.at(-1).total, 'totals');
    assert.deepEqual(new Set(list.props.rows.filter((r) => !r.total).map((r) => r.kind)), new Set(['Sale', 'Purchase']));
    const wheat = tableBy(draw('ContractList', 'Wheat purchases'), 'Contract');
    assert.ok(wheat.props.rows.filter((r) => !r.total).every((r) => r.kind === 'Purchase' && r.commodity === 'Wheat'));
    assert.equal(wheat.props.rows.at(-1).quantity, '4,200');
    for (const [name, src] of Object.entries(SRC)) {
      assert.deepEqual(compositionProblems(src), [], name);
      assert.doesNotMatch(src, /LightweightCharts|createChart|<canvas|<svg/i, name);
    }
    for (const f of ['data/MarginCell.jsx', 'records/PermitHeadroom.jsx']) assert.deepEqual(compositionProblems(read(join(COMPONENTS, f))), [], f);
    const app = (screen, state) => render(el(kit[screen], { state }), kit);
    assert.equal(findAll(app('AppContracts', 'By status'), 'MobileShell').length, 1);
    assert.deepEqual(findAll(app('AppContracts', 'By status'), 'TaCard').length, 0, 'kit parts render through');
    assert.match(wordsOf(app('AppContracts', 'By status'), kit).join(' | '), /Pending approval.*SYN4810/);
    assert.match(wordsOf(app('AppShortList', 'Suppliers to call'), kit).join(' | '), /no contact on record/);
    assert.match(wordsOf(app('AppDayPlan', 'Today'), kit).join(' | '), /AAZ 3310.*In transit/);
    assert.match(wordsOf(app('AppDayPlan', 'No signal'), kit).join(' | '), /No signal\. Last refreshed 07:02 CAT/);
    for (const s of Object.keys(APP)) for (const st of APP[s]) assert.doesNotMatch(wordsOf(app(s, st), kit).join(' | '), /USD|ZMW|price|margin/i, `${s} ${st}: no price on the phone`);
    const index = read(join(FIELD, 'index.html'));
    assert.match(index, /'TradingApp\.jsx'/);
    assert.match(index, /\.\.\.K\.TRADING_APP_STATES/);
    assert.deepEqual(readmeRows(read(join(FIELD, 'README.md'))).AppDayPlan, { file: 'TradingApp.jsx', states: APP.AppDayPlan });
  });

  test('[M6.DS.01] verify:design stays green after design-system:sync: no token, font, asset or banned word changes (AC 8)', () => {
    assert.deepEqual(BANNED.words, ['batch', 'upload', 'template', 'sync', 'virtual warehouse']);
    for (const src of [...Object.values(SRC), read(join(COMPONENTS, 'data/MarginCell.jsx')), read(join(COMPONENTS, 'records/PermitHeadroom.jsx'))]) {
      assert.doesNotMatch(src, /(^|[\s{;'"`])--[a-z0-9-]+['"]?\s*:/m, 'no token defined');
      for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) assert.ok(tokens.has(m[1]), m[1]);
    }
  });

  test('[M6.DS.01] the new components have their types, usage notes, a live example and their place in the bundle', () => {
    for (const [f, fn] of [['data/MarginCell', 'MarginCell'], ['records/PermitHeadroom', 'PermitHeadroom']]) {
      assert.match(read(join(COMPONENTS, `${f}.d.ts`)), new RegExp(`export function ${fn}\\(props: ${fn}Props\\): JSX\\.Element;`));
      assert.match(read(join(COMPONENTS, `${f}.prompt.md`)), new RegExp(`ol-${fn.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`));
      assert.ok(dsFiles.includes(`${f}.jsx`), `${f} is bundled`);
    }
    assert.ok(dsFiles.indexOf('data/MarginCell.jsx') > dsFiles.indexOf('data/Restricted.jsx') && dsFiles.indexOf('data/MarginCell.jsx') > dsFiles.indexOf('feedback/NotSet.jsx'));
    assert.ok(dsFiles.indexOf('records/PermitHeadroom.jsx') > dsFiles.indexOf('feedback/Refusal.jsx'));
    assert.match(read(join(COMPONENTS, 'records/trading.card.html')), /@dsCard group="Components"[^>]*M6\.DS\.01/);
  });

  test('the build publishes the Trading workspace kit, the new states and components', { skip: !existsSync(join(ROOT, 'dist')) && 'run npm run build first' }, () => {
    const tw = read(join(ROOT, 'dist/ui_kits/trading_workspace/ui_kits_trading_workspace_index.kit.js'));
    for (const n of [...Object.keys(TWS), 'QualitySpecifications', 'TradeBoardM6', 'ApprovalM6', 'GRNFinaliseM6', 'GradingDisputeM6', 'StockBoardM6']) assert.ok(tw.includes(n), n);
    assert.ok(read(join(ROOT, 'dist/ui_kits/one_link/ui_kits_one_link_index.kit.js')).includes('M6_STATES'));
    assert.ok(read(join(ROOT, 'dist/ui_kits/field_app/ui_kits_field_app_index.kit.js')).includes('AppDayPlan'));
    const bundle = read(join(ROOT, 'dist/_ds_bundle.js'));
    for (const n of ['MarginCell', 'PermitHeadroom']) assert.match(bundle, new RegExp(n));
    assert.match(read(join(ROOT, 'dist/index.html')), /ui_kits\/trading_workspace\/index\.html/);
  });
});
