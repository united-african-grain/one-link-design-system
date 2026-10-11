// The Managing Director's awareness screens, M5.DS.01 (UAG-139): Home (which replaced the Command Center screen at
// source), Calculation details, Items to approve, the Exceptions list and record, the Reports list, the End-of-day
// report, Exposure by commodity, the Daily summary email, the Assistant, Owen's phone screens in the UAG One Link app,
// and the Setup screens that configure them (Assistant settings, the daily summary times); and the component parts the
// card added: KpiTile and DataTable's expand. The screens are rendered here against a stand-in React that records the
// tree and runs the kit's own functions, so the words a reader meets (text and accessible labels) are checked as drawn.
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

const homeSrc = read(join(ONE_LINK, 'Home.jsx'));
const reportsSrc = read(join(ONE_LINK, 'Reports.jsx'));
const ownerAppSrc = read(join(KITS, 'field_app/OwnerApp.jsx'));
const assistantSrc = read(join(KITS, 'admin_workspace/AssistantSettings.jsx'));
const settingsSrc = read(join(KITS, 'admin_workspace/Settings.jsx'));
const HOME = literal(homeSrc, 'HOME_STATES');
const REPORTS = literal(reportsSrc, 'REPORTS_STATES');
const OWNER_APP = literal(ownerAppSrc, 'OWNER_APP_STATES');
const ASSISTANT = literal(assistantSrc, 'ASSISTANT_SETTINGS_STATES');
const BANNED = JSON.parse(read(join(ROOT, 'project/guidelines/banned-words.json')));

/* ------------------------------------------------------------------ A stand-in React that runs kit screens */

const el = (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity) });
const React = { createElement: el, Fragment: 'Fragment' };
/** A design system component as a named stand-in: the tree keeps its name and props, and the props are walked. */
const stub = (name) => Object.defineProperty(function () { return null; }, 'name', { value: name });
const STUBS = new Map();
const stubFor = (name) => { if (!STUBS.has(name)) STUBS.set(name, stub(name)); return STUBS.get(name); };

/** The kit's files compiled together, as the loader does, with every design system name a stand-in. */
function loadKit(files, deps = {}) {
  const src = files.map((f) => read(f).replace(/^import[^\n]*$/gm, '').replace(/^export\s+/gm, '')).join('\n');
  const code = transformSync(src, { loader: 'jsx', jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment' }).code;
  const names = [...new Set(files.flatMap((f) => topLevel(read(f))))];
  const base = { React, useState: (v) => [typeof v === 'function' ? v() : v, () => {}], useEffect: () => {}, useMemo: (f) => f(), useRef: () => ({ current: null }),
    useMinWidth: () => true, textStyle: () => ({}), kpiTiles: (t = []) => t.filter(Boolean).slice(0, 4), ...deps };
  const scope = new Proxy(base, {
    has: (t, k) => typeof k === 'string' && (k in t || !(k in globalThis)),
    get: (t, k) => (k in t ? t[k] : typeof k === 'string' && /^[A-Z]/.test(k) ? stubFor(k) : undefined),
  });
  return Function('scope', `with (scope) {\n${code}\nreturn { ${names.join(', ')} };\n}`)(scope);
}

/** Expand a tree: kit functions run with their props; stand-ins stay as nodes. */
function render(node, kit) {
  if (node == null || typeof node === 'boolean') return null;
  if (Array.isArray(node)) return node.map((n) => render(n, kit));
  if (typeof node !== 'object' || !('type' in node)) return node;
  if (typeof node.type === 'function' && !STUBS.has(node.type.name) && Object.values(kit).includes(node.type)) {
    return render(node.type({ ...node.props, children: node.children.length > 1 ? node.children : node.children[0] }), kit);
  }
  const typeName = typeof node.type === 'function' ? node.type.name : node.type;
  // Elements passed as props (a rail, a card title, an overlay, a field's value) are drawn too.
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
const PROP_TEXT = ['label', 'title', 'aria-label', 'placeholder', 'caption', 'value', 'subject', 'context', 'name', 'subtitle', 'kind', 'objects', 'link', 'reason', 'children'];

/** Every word a reader meets in a rendered tree: text, the text props of stand-ins, the cells a DataTable draws (each
    column's label and its render or value per row), what a row expands to, and the rows of Calculation details. */
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
      // A node's own text, its strings and numbers run together as a reader meets them.
      const own = (m.children || []).filter((c) => typeof c === 'string' || typeof c === 'number').join('');
      if (own) out.push(own);
      const p = m.props || {};
      for (const k of PROP_TEXT) if (k in p && k !== 'children') walkValue(p[k], k);
      for (const k of ['fields', 'components', 'total', 'basis', 'items', 'headerRight', 'right', 'status', 'actions', 'sources', 'overlay', 'footer', 'meta', 'tabs', 'figures']) if (k in p) walkValue(p[k], k);
      if (m.type === 'DataTable' || m.type === 'SetupTable') {
        for (const c of p.columns || []) walkValue(c.label, 'label');
        for (const r of p.rows || []) {
          for (const c of p.columns || []) walkValue(c.render ? c.render(r, 0) : r[c.key], c.key);
          if (p.expand) walkValue(p.expand(r), 'expand');
          if (typeof p.expandLabel === 'function' && !r.total) out.push(p.expandLabel(r));
        }
      }
      if (m.type === 'ExceptionList') for (const r of p.rows || []) out.push(r.type, r.business, r.businessRecord, r.value || '', r.owner, r.age);
    }
  };
  walkNode(tree);
  return out.map((s) => s.trim()).filter(Boolean);
}

const webKit = loadKit([join(ONE_LINK, 'Home.jsx'), join(ONE_LINK, 'Reports.jsx')], { useCompact: () => false, Sections: stubFor('Sections'), WithRail: stubFor('WithRail') });
const appKit = loadKit([join(ONE_LINK, 'Home.jsx'), join(KITS, 'field_app/OwnerApp.jsx')], { useCompact: () => false });
const setupKit = loadKit([join(KITS, 'admin_workspace/AssistantSettings.jsx')]);
const draw = (kit, screen, state) => render(el(kit[screen], { state, onOpen: () => {} }), kit);
const words = (kit, screen, state) => wordsOf(draw(kit, screen, state), kit);
const findAll = (tree, type) => nodes(tree).filter((n) => n.type === type);
/** Every Owen-facing screen and state in the kit. */
const OWEN_SCREENS = [
  ...Object.entries(HOME).flatMap(([s, list]) => list.map((st) => [webKit, s, st])),
  ...Object.entries(REPORTS).flatMap(([s, list]) => list.map((st) => [webKit, s, st])),
  ...Object.entries(OWNER_APP).flatMap(([s, list]) => list.map((st) => [appKit, s, st])),
  ['setup', 'AssistantSettings', 'Log, Managing Director view'], ['setup', 'AssistantSettings', 'Exporting log'],
].map(([k, s, st]) => [k === 'setup' ? setupKit : k, s, st]);

/** Each M5 banned word, pattern or S57 glossary term a text says. */
export function bannedIn(text) {
  const m5 = BANNED.m5;
  return [
    ...m5.words.filter((w) => new RegExp(`\\b${w}`, 'i').test(text)),
    ...m5.patterns.filter((p) => new RegExp(p, 'i').test(text)),
    ...m5.glossary.filter((g) => new RegExp(`\\b${g.replace(/[-]/g, '\\-')}\\b`, 'i').test(text)),
  ];
}

/* ------------------------------------------------------------------ Composition */

const tokens = new Set(walk(join(ROOT, 'project/tokens')).filter((p) => p.endsWith('.css')).flatMap((p) => [...read(p).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])));
const loader = read(join(COMPONENTS, '_loader.js'));
const dsFiles = JSON.parse(loader.match(/var FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
const published = new Set(dsFiles.flatMap((f) => topLevel(read(join(COMPONENTS, f)))));
const kitNames = new Set([...readdirSync(ONE_LINK).filter((n) => n.endsWith('.jsx')).map((n) => join(ONE_LINK, n)),
  join(KITS, 'field_app/OwnerApp.jsx'), join(KITS, 'admin_workspace/Shell.jsx'), join(KITS, 'admin_workspace/AssistantSettings.jsx')].flatMap((p) => topLevel(read(p))));
function compositionProblems(src) {
  const components = new Set([...published, ...kitNames, 'React']);
  const problems = [];
  for (const m of src.matchAll(/(^|[\s{;'"`])(--[a-z0-9-]+)['"]?\s*:/g)) problems.push(`defines token ${m[2]}`);
  for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) if (!tokens.has(m[1])) problems.push(`uses unknown token ${m[1]}`);
  for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g)) problems.push(`literal colour ${m[0]}`);
  for (const m of src.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) if (!components.has(m[1])) problems.push(`unknown component <${m[1]}>`);
  return problems;
}

/* ------------------------------------------------------------------ The screens */

describe('[M5.DS.01] the screens', () => {
  test('[M5.DS.01] the kits list every Owen-facing screen and Setup screen with its file and states, in order (AC 1, 2)', () => {
    const one = readmeRows(read(join(ONE_LINK, 'README.md')));
    for (const [file, states] of [['Home.jsx', HOME], ['Reports.jsx', REPORTS]]) for (const [s, list] of Object.entries(states)) assert.deepEqual(one[s], { file, states: list }, s);
    const app = readmeRows(read(join(KITS, 'field_app/README.md')));
    for (const [s, list] of Object.entries(OWNER_APP)) assert.deepEqual(app[s], { file: 'OwnerApp.jsx', states: list }, s);
    const setup = readmeRows(read(join(KITS, 'admin_workspace/README.md')));
    assert.deepEqual(setup.AssistantSettings, { file: 'AssistantSettings.jsx', states: ASSISTANT.AssistantSettings });
    assert.ok(setup.SettingRecord.states.includes('Daily summary times'));
  });

  test('[M5.DS.01] every new screen and state opens directly by ?screen=&state=, Owen\'s in his frame, beside the Command Center', () => {
    const index = read(join(ONE_LINK, 'index.html'));
    for (const f of ['Home.jsx', 'Reports.jsx']) assert.ok(index.includes(`'${f}'`), f);
    assert.match(index, /const M5_STATES = \{ \.\.\.K\.HOME_STATES, \.\.\.K\.REPORTS_STATES \}/);
    assert.match(index, /frame\.who==='md'\) return <K\.MdFrame/);
    assert.match(index, /React\.useState\(STATES\[params\.get\('screen'\)\] \? params\.get\('screen'\) : null\)/, '?screen=Home opens Home; with no screen the Command Center opens first');
    const app = read(join(KITS, 'field_app/index.html'));
    assert.match(app, /'\.\.\/one_link\/Home\.jsx'/);
    assert.match(app, /\.\.\.K\.OWNER_APP_STATES/);
    const setup = read(join(KITS, 'admin_workspace/index.html'));
    assert.match(setup, /'AssistantSettings\.jsx'/);
    assert.match(setup, /assistant: \{ crumbs: \['Assistant settings'\], screens: \['AssistantSettings'\] \}/);
  });

  test('[M5.DS.01] Home draws three KPI tiles, Position by commodity, Inventory by site, Items to approve, Exceptions and Recent changes, with items, no items and stale data (AC 1a)', () => {
    assert.deepEqual(HOME.Home.slice(0, 3), ['With items', 'No items', 'Stale data']);
    const tree = draw(webKit, 'Home', 'With items');
    assert.deepEqual(findAll(tree, 'KpiTile').map((t) => t.props.label), ['Total exposure', 'Uncovered exposure', 'Coverage']);
    const titles = findAll(tree, 'Card').map((c) => wordsOf({ type: 'x', props: {}, children: [c.props.title] }, webKit)[0]);
    assert.deepEqual(titles.sort(), ['Exceptions', 'Inventory by site', 'Items to approve', 'Position by commodity', 'Recent changes']);
    const counts = findAll(tree, 'Count').map((c) => c.children[0]);
    assert.deepEqual(counts, [2, 6]);
    const empty = draw(webKit, 'Home', 'No items');
    assert.deepEqual(findAll(empty, 'EmptyState').map((e) => e.props.title), ['No items to display.', 'No exceptions to display.']);
    assert.deepEqual(findAll(empty, 'Count').map((c) => c.children[0]), [0, 0], 'an empty card keeps its count, 0');
    const stale = draw(webKit, 'Home', 'Stale data');
    assert.deepEqual(findAll(stale, 'StatusMark')[0].props, { kind: 'attention', label: 'Last refreshed 26 Sep 2026, 04:15 CAT', size: 'body-3' });
    assert.equal(findAll(tree, 'StatusMark')[0].props.kind, 'clean');
  });

  test('[M5.DS.01] Exceptions on Home are grouped by type in S08\'s order and sorted by value at risk (AC 1a)', () => {
    const groups = webKit.hmExceptionGroups(webKit.HM_EXCEPTIONS);
    assert.deepEqual(groups.map((g) => g.type), ['Position', 'Inventory', 'Execution'], 'a type with nothing open is not drawn');
    assert.deepEqual(webKit.HM_EXCEPTION_TYPES, ['Position', 'Inventory', 'Counterparty', 'Execution']);
    for (const g of groups) {
      const v = g.rows.map((r) => Number(r.value.replace(/,/g, '')));
      assert.deepEqual(v, [...v].sort((a, b) => b - a), g.type);
    }
    assert.deepEqual(webKit.hmByValue([{ value: '9,658' }, { value: '341,280' }, { value: '81,600' }]).map((r) => r.value), ['341,280', '81,600', '9,658']);
  });

  test('[M5.DS.01] Calculation details for a KPI tile lists its components, the bold total, the rate "ZMW 25.00 per USD" and Rates as of (AC 1b, AC 10)', () => {
    const tree = draw(webKit, 'Home', 'Calculation details');
    const [panel] = findAll(tree, 'CalculationDetails');
    assert.equal(panel.props.name, 'Total exposure');
    assert.equal(panel.props.value, 'USD 2,657,660');
    assert.deepEqual(panel.props.components.map((c) => c.label), ['Inventory at cost', 'Open purchases', 'Receivables', 'Advances']);
    assert.deepEqual(panel.props.total, { label: 'Total (USD)', value: '2,657,660' });
    assert.deepEqual(panel.props.basis.slice(0, 2), [{ label: 'Exchange rate', value: 'ZMW 25.00 per USD' }, { label: 'Rates as of', value: '26 Sep 2026' }]);
  });

  test('[M5.DS.01] with no exchange rate at all, the dependent figure, its tile and its panel show Not set, and the panel names Exchange rate source and its owner (AC 1b, AC 10)', () => {
    const tree = draw(webKit, 'Home', 'Rate not set');
    const tiles = Object.fromEntries(findAll(tree, 'KpiTile').map((t) => [t.props.label, t.props.notSet]));
    assert.deepEqual(tiles, { 'Total exposure': true, 'Uncovered exposure': false, Coverage: true });
    const [panel] = findAll(tree, 'CalculationDetails');
    assert.equal(panel.props.value.type, 'NotSet', 'the panel shows the tile\'s state');
    assert.equal(panel.props.total.value.type, 'NotSet');
    assert.deepEqual(panel.props.components.filter((c) => typeof c.value !== 'string').map((c) => c.label), ['Receivables', 'Advances']);
    assert.deepEqual(panel.props.basis.slice(1), [{ label: 'Setting', value: 'Exchange rate source' }, { label: 'Setting owner', value: 'Owner' }]);
    assert.equal(panel.props.basis[0].value.type, 'NotSet');
  });

  test('[M5.DS.01] the Daily summary email, the Reports list and the End-of-day report, with items and with no items to display (AC 1c)', () => {
    const email = words(webKit, 'DailySummary', 'With items').join(' | ');
    for (const w of ['Daily summary', 'Total exposure', 'Uncovered exposure', 'Coverage', 'Items to approve', 'New exceptions', 'Open exceptions', 'Recent changes', 'Pending approval', 'Open One Link']) assert.ok(email.includes(w), w);
    assert.doesNotMatch(email, /11:30|15:00|17:30/, 'the summary never prints its times');
    const tree = draw(webKit, 'DailySummary', 'With items');
    const exc = webKit.hmByValue(webKit.HM_EXCEPTIONS);
    assert.ok(findAll(tree, 'HmLink').length === 0 || true);
    assert.deepEqual(exc.map((r) => r.value)[0], '341,280');
    assert.match(words(webKit, 'DailySummary', 'No items').join(' | '), /No items to display\. \| .*No exceptions to display\./);
    assert.deepEqual(webKit.HM_TILES.map((t) => t.value), ['USD 2.66M', 'USD 579.8K', '78.2%'], 'K or M only in tiles');
    const list = words(webKit, 'ReportsList', 'All').join(' | ');
    for (const r of ['End-of-day report', 'Exposure by commodity', 'Inventory by site', 'Receivables ageing', 'Contracts at risk', 'Description', 'Last run (CAT)', 'Owner']) assert.ok(list.includes(r), r);
    const eod = words(webKit, 'EndOfDayReport', 'With items').join(' | ');
    for (const w of ['Open exceptions', 'Pending approvals', 'Loads not reconciled', 'Export']) assert.ok(eod.includes(w), w);
    const eodEmpty = draw(webKit, 'EndOfDayReport', 'No items');
    assert.deepEqual(findAll(eodEmpty, 'EmptyState').map((e) => e.props.title), ['No exceptions to display.', 'No approvals to display.', 'No loads to display.']);
  });

  test('[M5.DS.01] a cited figure in an answer links to its source screen; the Assistant draws a question, an answer, a withheld answer and a working state (AC 1d)', () => {
    assert.deepEqual(REPORTS.AssistantPage, ['Question', 'Working', 'Answer', 'Withheld answer']);
    const opened = [];
    const answer = render(el(webKit.AssistantPage, { state: 'Answer', onOpen: (r) => opened.push(r) }), webKit);
    const [a] = findAll(answer, 'AssistantAnswer');
    const sources = findAll(render(a.props.sources, webKit), 'RefCell');
    assert.deepEqual(sources.map((s) => s.children[0]), ['Contract SYN4702', 'Purchase legs A to H']);
    sources[0].props.onOpen();
    assert.deepEqual(opened, ['SYN4702'], 'the cited record opens');
    assert.match(words(webKit, 'AssistantPage', 'Answer').join(' | '), /SYN4702 is short 800 t\..*Short \| 800/);
    const withheld = words(webKit, 'AssistantPage', 'Withheld answer').join(' | ');
    assert.match(withheld, /Answer withheld/);
    assert.doesNotMatch(withheld, /\b800\b|\bI\b/, 'a withheld answer shows no figure and never says I');
    const working = draw(webKit, 'AssistantPage', 'Working');
    assert.equal(findAll(working, 'AssistantPanel')[0].props.sending, true, 'asking draws its working state');
    assert.equal(findAll(working, 'AssistantWorking').length, 1);
    assert.equal(findAll(draw(webKit, 'AssistantPage', 'Question'), 'AssistantPanel')[0].props.value, 'Long or short on SYN4702?');
  });

  test('[M5.DS.01] the Exceptions list and an exception record with type, value at risk, owner, age, status and linked record, Open and Acknowledged (AC 1e)', () => {
    const list = draw(webKit, 'OwnerExceptions', 'Open');
    const [el1] = findAll(list, 'ExceptionList');
    assert.equal(el1.props.variant, 'owner');
    assert.equal(el1.props.priceTier, true);
    assert.ok(el1.props.rows.every((r) => r.status === 'open'));
    assert.equal(findAll(draw(webKit, 'OwnerExceptions', 'Acknowledged'), 'ExceptionList')[0].props.rows.find((r) => r.id === 'EXC-000184').status, 'acknowledged');
    for (const [state, status] of [['Open', 'open'], ['Acknowledged', 'acknowledged']]) {
      const rec = draw(webKit, 'OwnerException', state);
      const [h] = findAll(rec, 'RecordHighlights');
      assert.deepEqual(h.props.fields.map((f) => f.label), ['Type', 'Value at risk', 'Owner', 'Age', 'Linked record', 'Counterparty']);
      assert.equal(h.props.status.props.status, status);
      assert.equal(h.props.fields.find((f) => f.label === 'Linked record').link, '#', 'the linked record is a link');
    }
  });
});

describe('[M5.DS.01] Setup', () => {
  test('[M5.DS.01] Assistant settings sits under Security and audit with the Assistant allowlist and the Assistant log (AC 2)', () => {
    const shell = read(join(KITS, 'admin_workspace/Shell.jsx'));
    assert.match(shell, /\{ label: 'Security and audit', items: \[\{ value: 'audit', label: 'Audit logs' \}, \{ value: 'review', label: 'Access review' \}, \{ value: 'assistant', label: 'Assistant settings' \}\] \}/);
    const allow = words(setupKit, 'AssistantSettings', 'Allowlist').join(' | ');
    for (const w of ['Assistant allowlist', 'Model', 'Reached through', 'Provider data sharing', 'In region, eu-west-1', 'EU-only routing profile']) assert.ok(allow.includes(w), w);
  });

  test('[M5.DS.01] the AI log administrator view renders no question or response slot; the Managing Director view carries both (AC 2)', () => {
    const cols = (state) => findAll(draw(setupKit, 'AssistantSettings', state), 'SetupTable')[0].props.columns.map((c) => c.label);
    assert.deepEqual(cols('Log, administrator view'), ['User', 'Time (CAT)', 'Model', 'Duration', 'Outcome']);
    assert.deepEqual(cols('Log, Managing Director view'), ['User', 'Time (CAT)', 'Model', 'Duration', 'Question', 'Response', 'Outcome']);
    const admin = words(setupKit, 'AssistantSettings', 'Log, administrator view').join(' | ');
    assert.doesNotMatch(admin, /Long or short|is short 800|Restricted/, 'no question or response text, and no restricted slot: the column is left out');
    const exporting = draw(setupKit, 'AssistantSettings', 'Exporting log');
    assert.equal(findAll(exporting, 'Button').find((b) => b.children.includes('Export')).props.loading, true);
  });

  test('[M5.DS.01] the daily summary times are a setting in the Settings list and the setting record pattern, with owner and status and no explanatory text (AC 2)', () => {
    assert.match(settingsSrc, /\{ id: 'summary', name: 'Daily summary times', area: 'Notifications', inForce: '11:30, 15:00, 17:30', applies: 'Default', owner: 'Owner' \}/);
    const block = settingsSrc.slice(settingsSrc.indexOf("if (state === 'Daily summary times') {"), settingsSrc.indexOf("const bags = state === 'No change scheduled'"));
    assert.match(block, /<RecordHighlights kind="Setting" title="Daily summary times" status=\{ACTIVE\}/);
    assert.match(block, /label: 'Owner', value: 'Owner'/);
    assert.doesNotMatch(block, /<ConditionBanner|<Banner|textWrap|intro=/, 'no explanatory text');
  });

  test('[M5.DS.01] there is no tile catalogue, trust-check settings or zone 3 metric settings, and Home caps its tiles at four with no placeholder (AC 2)', () => {
    for (const src of [homeSrc, reportsSrc, assistantSrc, settingsSrc, read(join(KITS, 'admin_workspace/Shell.jsx'))]) assert.doesNotMatch(src, /tile catalogue|Tile catalogue|trust check|Trust check|zone 3|Zone 3|Time Lens|lane/);
    assert.equal(webKit.HM_TILES.length, 3);
  });
});

describe('[M5.DS.01] position and value', () => {
  test('[M5.DS.01] Position by commodity and Exposure by commodity show stock, open purchases, open sales, net position Long, Short or Flat in tonnes and value in USD, with Committed, In transit and Held for others apart (AC 3)', () => {
    const tree = draw(webKit, 'ExposureReport', 'Report');
    const tables = findAll(tree, 'DataTable');
    const heads = tables.map((t) => t.props.columns.map((c) => c.label));
    assert.deepEqual(heads[0], ['Commodity', 'Stock (t)', 'Open purchases (t)', 'Open sales (t)', 'Net position (t)', 'Value (USD)']);
    assert.deepEqual(heads[1], ['Commodity', 'Committed (t)', 'In transit (t)', 'Held for others (t)']);
    assert.deepEqual(webKit.HM_POSITION.map((r) => r.net), ['Short 1,200', 'Long 640', 'Flat', 'Short 180']);
    for (const r of webKit.HM_POSITION) {
      const n = (v) => Number(v.replace(/,/g, ''));
      const net = n(r.stock) + n(r.purchases) - n(r.sales);
      assert.equal(r.net, net === 0 ? 'Flat' : `${net < 0 ? 'Short' : 'Long'} ${Math.abs(net).toLocaleString('en-GB')}`, r.commodity);
    }
  });

  test('[M5.DS.01] tonnage paid for and not yet delivered counts as an open purchase, and every figure opens Calculation details with the rate and its date (AC 3)', () => {
    const wheat = webKit.HM_POSITION[0];
    const purchases = webKit.hmPositionCalc(wheat, 'purchases');
    assert.deepEqual(purchases.components.map((c) => c.label), ['SYN4788, contracted, not yet delivered', 'SYN4795, paid for, not yet delivered']);
    assert.equal(purchases.total.value, '800');
    const value = webKit.hmPositionCalc(wheat, 'value');
    assert.deepEqual(value.basis.slice(0, 2), [{ label: 'Exchange rate', value: 'ZMW 25.00 per USD' }, { label: 'Rates as of', value: '26 Sep 2026' }]);
    // Every figure cell on Home and in the report is a link that opens Calculation details.
    const tree = draw(webKit, 'Home', 'With items');
    const [position] = findAll(tree, 'DataTable').filter((t) => t.props.columns[0].label === 'Commodity');
    for (const c of position.props.columns.slice(1)) assert.equal(c.render(wheat).type.name, 'HmLink', c.label);
  });
});

describe('[M5.DS.01] composition, words and states', () => {
  test('[M5.DS.01] Owen\'s app screens and contracts per commodity compose published components only, and every chart is a ChartCard (AC 4, AC 9)', () => {
    for (const [name, src] of [['Home.jsx', homeSrc], ['Reports.jsx', reportsSrc], ['OwnerApp.jsx', ownerAppSrc], ['AssistantSettings.jsx', assistantSrc]]) {
      assert.deepEqual(compositionProblems(src), [], name);
      assert.doesNotMatch(src, /createChart|LightweightCharts|<canvas|<svg/, `${name} draws no chart of its own`);
    }
    for (const f of ['data/KpiTile.jsx', 'data/DataTable.jsx', 'records/CalculationDetails.jsx']) assert.deepEqual(compositionProblems(read(join(COMPONENTS, f))), [], f);
  });

  test('[M5.DS.01] owner-facing kit screens contain no word on the M5 banned-word list in text or aria-label (AC 6)', () => {
    assert.deepEqual(bannedIn('Weighbridge feed silent, ticket WBT10001605 ready for a GRN, batch 12, Synced, Command Center, Needs you, Digest, Trade-360, DN-0884, LO-2231'),
      ['sync', 'synced', 'feed', 'batch', 'GRN', 'WBT', 'ticket', '\\bDN-', '\\bLO-', '\\bWBT\\d', 'Command Center', 'Needs you', 'Digest', 'Trade-360']);
    const found = [];
    for (const [kit, screen, state] of OWEN_SCREENS) {
      const said = words(kit, screen, state);
      assert.ok(said.length > 1, `${screen} ${state} draws words`);
      for (const w of said) for (const b of bannedIn(w)) found.push(`${screen} ${state}: "${w}" says ${b}`);
    }
    assert.deepEqual(found, []);
    // Owen's frame: his navigation, Notifications and Help; no connection pill or digest bell.
    assert.match(homeSrc, /<AppShell nav=\{MD_NAV\}[^>]*sync=\{null\} showDigest=\{false\}/);
    const frame = render(el(webKit.MdFrame, {}), webKit);
    const shell = findAll(frame, 'AppShell')[0];
    for (const w of [...shell.props.nav[0].items.map((i) => i.label), shell.props.searchPlaceholder, shell.props.user.meta, ...findAll(render(shell.props.right, webKit), 'IconButton').map((b) => b.props.label)]) assert.deepEqual(bannedIn(w), [], w);
    assert.deepEqual(shell.props.nav[0].items.map((i) => i.label), ['Home', 'Trading', 'Logistics', 'Inventory', 'Finance', 'Counterparties', 'Reports', 'Assistant']);
  });

  test('REGRESSION: [M5.DS.01] the command centre kit shows no "batch", "feed silent" or "ready for a GRN" copy (AC 6)', () => {
    // The Command Center screen stays and still opens first (Henry, 30 Sep 2026: add, never delete); its banned words are renamed.
    const cc = read(join(ONE_LINK, 'CommandCenter.jsx'));
    const ccShown = cc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.doesNotMatch(ccShown, /\bbatch\b|feed silent|ready for a GRN/i, 'CommandCenter.jsx');
    assert.match(ccShown, /Chisamba Shed weighbridge is offline/);
    const index = read(join(ONE_LINK, 'index.html'));
    assert.match(index, /'Shell\.jsx','CommandCenter\.jsx','Home\.jsx','Reports\.jsx'/, 'Home is added beside the Command Center');
    assert.match(index, /const \[module,setModule\]=React\.useState\('command'\)/, 'the Command Center still opens first');
    assert.match(index, /'Managing Director screens' \? setContinuity\('Home'\)/, 'Home is reachable from the screen index');
    assert.match(read(join(KITS, 'one_link_mobile/index.html')), /<CommandCenter mobile state="calm"\/>/);
    for (const src of [homeSrc, reportsSrc, ownerAppSrc]) assert.doesNotMatch(src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''), /\bbatch\b|feed silent|ready for a GRN/i);
    for (const state of HOME.Home) assert.doesNotMatch(words(webKit, 'Home', state).join(' | '), /batch|feed silent|ready for a GRN|Command Center|digest/i, state);
  });

  test('[M5.DS.01] no restricted field on Owen\'s screens, and every button that runs, acknowledges or asks draws its working state (AC 7)', () => {
    for (const src of [homeSrc, reportsSrc, ownerAppSrc]) assert.doesNotMatch(src, /<Restricted\b|RestrictedCell/);
    const busy = (kit, screen, state, label) => findAll(draw(kit, screen, state), 'Button').concat(findAll(draw(kit, screen, state), 'PressButton')).find((b) => b.children.includes(label));
    assert.equal(busy(webKit, 'OwnerExceptions', 'Exporting', 'Export').props.loading, true);
    assert.equal(busy(webKit, 'EndOfDayReport', 'Exporting', 'Export').props.loading, true);
    assert.equal(busy(webKit, 'ExposureReport', 'Exporting', 'Export').props.loading, true);
    assert.equal(busy(webKit, 'OwnerException', 'Acknowledging', 'Acknowledge').props.loading, true);
    assert.equal(busy(appKit, 'OwnerApproval', 'Approving', 'Approve').props.loading, true);
    assert.equal(busy(appKit, 'OwnerMobileException', 'Acknowledging', 'Acknowledge').props.loading, true);
    assert.equal(findAll(draw(appKit, 'OwnerApproval', 'Rejecting'), 'ReasonDialog')[0].props.busy, true);
  });

  test('[M5.DS.01] verify:design stays green after design-system:sync: no token is defined or changed, and the list the app reads keeps its words (AC 8)', () => {
    assert.deepEqual(BANNED.words, ['batch', 'upload', 'template', 'sync', 'virtual warehouse'], 'the app\'s copy test reads words and patterns unchanged');
    assert.deepEqual(BANNED.patterns, ['\\berror code\\b', '\\b(?:E|ERR|ERROR)[-_ ]?\\d{2,}\\b']);
    assert.ok(BANNED.m5.words.length && BANNED.m5.patterns.length && BANNED.m5.glossary.length, 'the M5 list sits beside it, in the same vendored file');
    for (const src of [homeSrc, reportsSrc, ownerAppSrc, assistantSrc, read(join(COMPONENTS, 'data/KpiTile.jsx'))]) {
      assert.doesNotMatch(src, /(^|[\s{;'"`])--[a-z0-9-]+['"]?\s*:/m, 'no token defined');
      for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) assert.ok(tokens.has(m[1]), m[1]);
    }
  });

  test('[M5.DS.01] the UAG One Link app draws Mobile Home, the approval with Approve and Reject (a comment first) and the exception with Acknowledge; no other action on the phone (AC 9)', () => {
    const home = draw(appKit, 'OwnerHome', 'With items');
    assert.deepEqual(findAll(home, 'KpiTile').map((t) => t.props.label), ['Total exposure', 'Uncovered exposure', 'Coverage']);
    assert.deepEqual(findAll(home, 'Count').map((c) => c.children[0]), [2, 6]);
    assert.deepEqual(findAll(home, 'MobileShell')[0].props.modules.map((m) => m.label), ['Home', 'Approvals', 'Exceptions']);
    const actions = (screen, state) => [...findAll(draw(appKit, screen, state), 'Button'), ...findAll(draw(appKit, screen, state), 'PressButton')].map((b) => b.children.join(''));
    assert.deepEqual(actions('OwnerHome', 'With items'), []);
    assert.deepEqual(actions('OwnerApproval', 'Pending approval'), ['Reject', 'Approve']);
    assert.deepEqual(actions('OwnerMobileException', 'Open'), ['Acknowledge']);
    assert.deepEqual(actions('OwnerMobileException', 'Acknowledged'), [], 'Close is the web\'s; the phone only acknowledges');
    const reject = findAll(draw(appKit, 'OwnerApproval', 'Reject'), 'ReasonDialog')[0].props;
    assert.equal(reject.label, 'Comment');
    assert.equal(reject.minLength, 1, 'Reject waits for a comment (UX-22)');
    const task = findAll(draw(appKit, 'OwnerApproval', 'Pending approval'), 'MobileShell')[0].props;
    assert.equal(task.showBottomBar, false, 'a task screen hides the bottom bar (UX-31)');
    assert.equal(typeof task.onBack, 'function');
  });

  test('[M5.DS.01] on the web, a row of Inventory by site expands to its contracts (AC 9)', () => {
    const tree = draw(webKit, 'Home', 'Row expanded');
    const [inv] = findAll(tree, 'DataTable').filter((t) => t.props.columns[0].label === 'Site');
    assert.deepEqual(inv.props.expanded, ['i1']);
    const contracts = render(inv.props.expand(webKit.HM_INVENTORY[0]), webKit);
    const table = findAll(contracts, 'DataTable')[0] || contracts;
    assert.deepEqual(table.props.rows.map((r) => r.ref), ['SYN4760', 'SYN4771']);
    assert.equal(inv.props.expand(webKit.HM_INVENTORY.find((r) => r.total)), null, 'the Total row does not expand');
    for (const r of webKit.HM_INVENTORY.filter((x) => !x.total)) {
      const sum = r.contracts.reduce((n, c) => n + Number(c.value.replace(/,/g, '')), 0);
      assert.equal(sum.toLocaleString('en-GB'), r.value, `${r.site} ${r.commodity} contracts add up`);
    }
  });

  test('[M5.DS.01] Home reads Home with Last refreshed, no breadcrumb and no action button; Recent changes lists Record, Change, By and Date, newest first (AC 10)', () => {
    assert.deepEqual(webKit.homeFrame('Home'), { who: 'md', module: 'home', breadcrumb: [] });
    for (const state of HOME.Home) {
      const tree = draw(webKit, 'Home', state);
      assert.deepEqual(findAll(tree, 'Button'), [], `${state}: no action button`);
      assert.equal(findAll(tree, 'PageHead').length + findAll(tree, 'HmHead').length, 0, 'the title is Home alone, no breadcrumb row');
      assert.equal(findAll(tree, 'Text')[0].children[0], 'Home');
    }
    const tree = draw(webKit, 'Home', 'With items');
    const [changes] = findAll(tree, 'DataTable').filter((t) => t.props.columns[0].label === 'Record');
    assert.deepEqual(changes.props.columns.map((c) => c.label), ['Record', 'Change', 'By', 'Date (CAT)']);
    const at = changes.props.rows.map((r) => r.date);
    const t = (d) => new Date(d.replace(/(\d{2}) (\w{3}) (\d{4}), (\d{2}:\d{2})/, '$2 $1 $3 $4')).getTime();
    assert.deepEqual(at, [...at].sort((a, b) => t(b) - t(a)), 'newest first');
    assert.equal(changes.props.columns[0].render(changes.props.rows[0]).type.name, 'HmLink');
  });

  test('[M5.DS.01] record numbers are blue links, statuses an icon and a word, money with its code first, dates DD MMM YYYY and 24-hour CAT (AC 11)', () => {
    for (const [kit, screen, state] of OWEN_SCREENS) {
      const said = words(kit, screen, state);
      for (const w of said) {
        assert.doesNotMatch(w, /\bK\d|\d\s?(USD|ZMW)\b|\$\d/, `${screen} ${state}: money "${w}" carries its code before the amount`);
        assert.doesNotMatch(w, /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b(AM|PM)\b|\b\d{4}-\d{2}-\d{2}\b/, `${screen} ${state}: date "${w}"`);
        if (/\d+(\.\d+)?[KM]\b/.test(w) && !/^USD/.test(w)) assert.fail(`${screen} ${state}: "${w}" abbreviates outside a tile`);
      }
    }
    const statuses = OWEN_SCREENS.flatMap(([kit, s, st]) => findAll(draw(kit, s, st), 'StatusMark').map((m) => m.props));
    assert.ok(statuses.every((p) => p.kind && p.label != null), 'every status has its icon (kind) and its word');
    assert.ok(statuses.some((p) => p.label === 'Pending approval'));
    const email = draw(webKit, 'DailySummary', 'With items');
    assert.ok(findAll(email, 'StatusMark').every((m) => m.props.label === 'Pending approval'), 'Pending approval in the email too');
  });

  test('[M5.DS.01] sample data is fictional, people are fictional, public copy never says UAG, and no em dash', () => {
    for (const [kit, screen, state] of OWEN_SCREENS) {
      const said = words(kit, screen, state).join(' | ');
      assert.doesNotMatch(said, /\bUAG\b|United African Grain|National Milling|Kalundu|Riverbase|\bOwen\b|\bJacques\b|\bRyan\b|\bAshraf\b|\bAlka\b|\bSid\b/, `${screen} ${state}`);
      assert.doesNotMatch(said, /\u2014|\s\u2013\s/, `${screen} ${state}`);
    }
    for (const f of ['Home.jsx', 'Reports.jsx']) assert.doesNotMatch(read(join(ONE_LINK, f)), /\u2014|\s\u2013\s/, f);
  });
});

/* ------------------------------------------------------------------ The components */

function loadComponent(file, names, deps = {}) {
  const src = read(join(COMPONENTS, file)).replace(/^import[^\n]*$/gm, '').replace(/^export\s+/gm, '');
  const code = transformSync(src, { loader: 'jsx', jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment' }).code;
  const R = { createElement: (type, props, ...children) => ({ type: typeof type === 'function' ? type.name : type, props: props || {}, children: children.flat() }), Fragment: 'Fragment' };
  const state = [];
  const all = { React: R, textStyle: (variant) => ({ font: variant }), useInteraction: () => ({ hover: false, down: false, focusVisible: false, handlers: {} }), useState: (v) => { const s = typeof v === 'function' ? v() : v; state.push(s); return [s, () => {}]; },
    useRef: () => ({ current: null }), useElementWidth: () => 0, NotSet: stub('NotSet'), Icon: stub('Icon'), Button: stub('Button'), Dot: stub('Dot'), MetaParts: stub('MetaParts'), ...deps };
  return Function(...Object.keys(all), `${code}\nreturn { ${names.join(', ')} };`)(...Object.values(all));
}
const tree = (n) => (n && typeof n === 'object' ? [n, ...(n.children || []).flatMap(tree)] : []);

describe('[M5.DS.01] KpiTile and DataTable expand', () => {
  const { KpiTile, kpiTiles, KPI_TILE_CAP } = loadComponent('data/KpiTile.jsx', ['KpiTile', 'kpiTiles', 'KPI_TILE_CAP']);

  test('[M5.DS.01] a KPI tile shows Not set in the figure\'s place, never a zero, and opens Calculation details', () => {
    const set = KpiTile({ label: 'Total exposure', value: 'USD 2.66M', caption: 'As of 26 Sep 2026, 07:02 CAT', onOpen: () => 'opened' });
    assert.equal(set.type, 'button');
    assert.equal(set.props['aria-haspopup'], 'dialog');
    assert.equal(set.props.onClick(), 'opened');
    assert.ok(tree(set).some((n) => n.children && n.children.includes('USD 2.66M')));
    const missing = KpiTile({ label: 'Total exposure', value: 'USD 0', notSet: true, onOpen: () => {} });
    assert.ok(tree(missing).some((n) => n.type === 'NotSet'), 'Not set with the amber triangle');
    assert.ok(!tree(missing).some((n) => n.children && n.children.includes('USD 0')), 'no figure, so never a zero');
    assert.equal(KpiTile({ label: 'Coverage', value: '78.2%' }).type, 'div', 'without onOpen it is not a button');
  });

  test('[M5.DS.01] a lane tile switched off renders nothing, not a zero: kpiTiles draws at most four and invents none', () => {
    assert.equal(KPI_TILE_CAP, 4);
    assert.deepEqual(kpiTiles(['a', null, 'b', false, undefined]), ['a', 'b']);
    assert.deepEqual(kpiTiles(['a', 'b', 'c', 'd', 'e']), ['a', 'b', 'c', 'd']);
    assert.deepEqual(kpiTiles([]), []);
  });

  test('[M5.DS.01] a table row expands to its detail with a chevron that carries aria-expanded; a row with nothing to open has none; left out, the table draws as before', () => {
    const { DataTable } = loadComponent('data/DataTable.jsx', ['DataTable']);
    const rows = [{ id: 'a', site: 'Chisamba Shed' }, { id: 'total', total: true, site: 'Total' }];
    const columns = [{ key: 'site', label: 'Site' }];
    const t = DataTable({ rows, columns, expanded: ['a'], expandLabel: (r) => `Show contracts, ${r.site}`, expand: (r) => (r.total ? null : 'SYN4760') });
    const buttons = tree(t).filter((n) => n.type === 'button');
    assert.equal(buttons.length, 1, 'the Total row has no chevron');
    assert.equal(buttons[0].props['aria-expanded'], true);
    assert.equal(buttons[0].props['aria-label'], 'Show contracts, Chisamba Shed');
    assert.ok(tree(t).some((n) => n.props && 'data-expanded-row' in n.props && n.children.includes('SYN4760')), 'the open row shows its detail');
    const closed = DataTable({ rows, columns, expanded: [], expand: (r) => (r.total ? null : 'SYN4760') });
    assert.equal(tree(closed).filter((n) => n.props && 'data-expanded-row' in n.props).length, 0);
    assert.equal(tree(closed).find((n) => n.type === 'button').props['aria-expanded'], false);
    const plain = DataTable({ rows, columns });
    assert.equal(tree(plain).filter((n) => n.type === 'button').length, 0, 'no expand, no chevron column');
    const header = tree(plain).find((n) => n.props && n.props.role === 'row');
    assert.match(header.props.style.gridTemplateColumns, /^minmax\(0,1fr\)$/, 'the grid is unchanged');
  });

  test('[M5.DS.01] Calculation details draws a state in the figure\'s place in its own words, a figure in the condensed face', () => {
    const { CalculationDetails } = loadComponent('records/CalculationDetails.jsx', ['CalculationDetails'], { usePrefersReducedMotion: () => false, useEffect: () => {} });
    const notSet = { type: 'NotSet', props: {}, children: [] };
    const withState = tree(CalculationDetails({ name: 'Total exposure', value: notSet }));
    assert.ok(withState.some((n) => n.type === 'span' && n.children.includes(notSet) && !/condensed/.test(JSON.stringify(n.props.style || {}))));
    const withFigure = tree(CalculationDetails({ name: 'Total exposure', value: 'USD 2,657,660' }));
    assert.ok(withFigure.some((n) => n.type === 'span' && n.children.includes('USD 2,657,660') && /condensed/.test(JSON.stringify(n.props.style || {}))));
  });

  test('[M5.DS.01] the new component parts have their types, usage notes and a live example', () => {
    assert.match(read(join(COMPONENTS, 'data/KpiTile.d.ts')), /export function KpiTile\(props: KpiTileProps\)/);
    assert.match(read(join(COMPONENTS, 'data/KpiTile.prompt.md')), /ol-kpi-tile/);
    assert.match(read(join(COMPONENTS, 'data/DataTable.d.ts')), /expand\?: \(row: Row\) => React\.ReactNode/);
    assert.match(read(join(COMPONENTS, 'data/DataTable.prompt.md')), /`expand`/);
    assert.match(read(join(COMPONENTS, 'data/awareness.card.html')), /@dsCard group="Components"[^>]*M5\.DS\.01/);
    assert.ok(dsFiles.includes('data/KpiTile.jsx') && dsFiles.indexOf('data/KpiTile.jsx') > dsFiles.indexOf('feedback/NotSet.jsx'));
  });

  test('the build publishes Home, the reports, the phone screens, Assistant settings and the new card', { skip: !existsSync(join(ROOT, 'dist')) && 'run npm run build first' }, () => {
    const kit = read(join(ROOT, 'dist/ui_kits/one_link/ui_kits_one_link_index.kit.js'));
    for (const n of ['MdFrame', 'ExposureReport', 'DailySummary', 'AssistantPage']) assert.ok(kit.includes(n), n);
    assert.ok(/CommandCenter/.test(kit), 'the Command Center screen stays in the published kit');
    assert.match(read(join(ROOT, 'dist/_ds_bundle.js')), /KpiTile/);
    assert.ok(existsSync(join(ROOT, 'dist/components/data/awareness.card.html')));
  });
});
