// Imports screens, M7.DS.01 (UAG-99): the Imports kit (the operations lead's Home, the port schedule preview, the import
// schedule, the truck leg, the corridor screens and the dispatch report), the M7 states of Coverage, stock control's
// Home and the Managing Director's Home, the UAG One Link app's import screens, and the CheckpointTimeline component.
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
const IMPORTS = join(KITS, 'imports');
const ONE_LINK = join(KITS, 'one_link');
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

const SRC = {
  schedule: read(join(IMPORTS, 'Schedule.jsx')), corridor: read(join(IMPORTS, 'Corridor.jsx')), dispatch: read(join(IMPORTS, 'Dispatch.jsx')), offloads: read(join(IMPORTS, 'Offloads.jsx')),
  app: read(join(FIELD, 'ImportsApp.jsx')), checkpoint: read(join(COMPONENTS, 'records/CheckpointTimeline.jsx')),
  coverage: read(join(ONE_LINK, 'Coverage.jsx')), stock: read(join(ONE_LINK, 'StockControl.jsx')),
};
const IM = literal(SRC.schedule, 'IM_STATES');
const CORRIDOR = literal(SRC.corridor, 'IM_CORRIDOR_STATES');
const DISPATCH = literal(SRC.dispatch, 'IM_DISPATCH_STATES');
const APP = literal(SRC.app, 'IMPORTS_APP_STATES');
const OFFLOADS = literal(SRC.offloads, 'IM_OFFLOAD_STATES');
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
const PROP_TEXT = ['label', 'title', 'aria-label', 'placeholder', 'caption', 'value', 'subject', 'context', 'name', 'subtitle', 'kind', 'objects', 'link', 'reason', 'meta', 'note', 'error'];

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
      for (const k of ['fields', 'components', 'total', 'basis', 'items', 'headerRight', 'right', 'status', 'actions', 'footer', 'tabs', 'cells', 'file', 'tiles', 'options', 'checkpoints', 'rows']) if (k in p) walkValue(p[k], k);
      if (m.type === 'DataTable' || m.type === 'ImportPreview') {
        for (const c of p.columns || []) walkValue(c.label, 'label');
        for (const r of p.rows || []) for (const c of p.columns || []) walkValue(c.render ? c.render(r, 0) : r[c.key], c.key);
      }
    }
  };
  walkNode(tree);
  return out.map((s) => s.trim()).filter(Boolean);
}

// The component's copy module and the weight helpers are real functions, so the kit computes as published.
const ds = loadKit([join(COMPONENTS, 'records/CheckpointTimeline.jsx'), join(COMPONENTS, 'records/RunningSum.jsx'), join(COMPONENTS, 'records/ReconcileCard.jsx')]);
const DEPS = { CHECKPOINTS: ds.CHECKPOINTS, CHECKPOINT_SOURCES: ds.CHECKPOINT_SOURCES, CHECKPOINT_STATUS: ds.CHECKPOINT_STATUS, checkpointSource: ds.checkpointSource,
  checkpointSourceOptions: ds.checkpointSourceOptions, thousandths: ds.thousandths, tonnes: ds.tonnes, RECONCILE_OUTCOMES: ds.RECONCILE_OUTCOMES, OFFLOAD_SOURCES: ds.OFFLOAD_SOURCES,
  offloadSource: ds.offloadSource };
const SHELL_PARTS = Object.fromEntries(['Sections', 'WithRail', 'WithPanel', 'PageHead', 'FigureStrip', 'ScrollRow', 'SectionLabel', 'Page'].map((n) => [n, stubFor(n)]));
const kit = loadKit([...['Home.jsx', 'Tickets.jsx', 'Operations.jsx', 'StockControl.jsx', 'Coverage.jsx'].map((f) => join(ONE_LINK, f)), ...['Schedule.jsx', 'Corridor.jsx', 'Dispatch.jsx', 'Offloads.jsx'].map((f) => join(IMPORTS, f)), join(FIELD, 'ImportsApp.jsx')], { ...SHELL_PARTS, ...DEPS });
const draw = (screen, state) => render(el(kit[screen], { state, onOpen: () => {} }), kit);
const words = (screen, state) => wordsOf(draw(screen, state), kit);
const findAll = (tree, type) => nodes(tree).filter((n) => n.type === type);
const tables = (tree) => findAll(tree, 'DataTable');
const tableBy = (tree, firstLabel) => tables(tree).find((t) => t.props.columns[0].label === firstLabel);
const labels = (t) => t.props.columns.map((c) => c.label);
const cell = (t, row, key) => { const c = t.props.columns.find((x) => x.key === key); return c.render ? c.render(row, 0) : row[key]; };
const textOf = (v) => { if (v == null) return ''; const r = typeof v === 'object' ? render(v, kit) : v; return typeof r === 'string' || typeof r === 'number' ? String(r) : wordsOf(r, kit).join(' '); };
const button = (tree, label) => [...findAll(tree, 'Button'), ...findAll(tree, 'PressButton')].find((b) => b.children.join('') === label);

const WEB = { ...IM, ...CORRIDOR, ...DISPATCH, ...OFFLOADS };
const ALL = [...Object.entries({ ...WEB, ...APP }).flatMap(([s, list]) => list.map((st) => [s, st])),
  ['Coverage', 'In transit'], ['StockPosition', 'Stock by route'], ['StockPosition', 'Direct share']];

/* ------------------------------------------------------------------ Composition */

const tokens = new Set(walk(join(ROOT, 'project/tokens')).filter((p) => p.endsWith('.css')).flatMap((p) => [...read(p).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])));
const loader = read(join(COMPONENTS, '_loader.js'));
const dsFiles = JSON.parse(loader.match(/var FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
const published = new Set(dsFiles.flatMap((f) => topLevel(read(join(COMPONENTS, f)))));
const kitNames = new Set([ONE_LINK, IMPORTS, FIELD].flatMap((d) => readdirSync(d).filter((n) => n.endsWith('.jsx')).flatMap((n) => topLevel(read(join(d, n))))));
function compositionProblems(src, extra = []) {
  const components = new Set([...published, ...kitNames, ...extra, 'React']);
  const problems = [];
  for (const m of src.matchAll(/(^|[\s{;'"`])(--[a-z0-9-]+)['"]?\s*:/g)) problems.push(`defines token ${m[2]}`);
  for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) if (!tokens.has(m[1])) problems.push(`uses unknown token ${m[1]}`);
  for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g)) problems.push(`literal colour ${m[0]}`);
  for (const m of src.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) if (!components.has(m[1])) problems.push(`unknown component <${m[1]}>`);
  return problems;
}
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/* ------------------------------------------------------------------ AC 1: the Imports kit lists the screens */

describe('[M7.DS.01] the Imports kit', () => {
  test('[M7.DS.01] the design system site has an Imports kit that lists every screen (a) to (s) with its file and states, each opening by ?screen=&state= (AC 1)', () => {
    const index = read(join(IMPORTS, 'index.html'));
    assert.match(index, /@dsCard group="One Link"[^>]*name="Imports"/, 'the kit is a card on the site');
    for (const f of ['Schedule.jsx', 'Corridor.jsx', 'Dispatch.jsx', 'Offloads.jsx']) assert.ok(index.includes(`'${f}'`), f);
    assert.match(index, /const STATES = \{ \.\.\.K\.IM_STATES, \.\.\.K\.IM_DISPATCH_STATES, \.\.\.K\.IM_CORRIDOR_STATES, \.\.\.K\.IM_OFFLOAD_STATES, \.\.\.M7 \}/);
    assert.match(index, /params\.get\('screen'\)/);
    const rows = readmeRows(read(join(IMPORTS, 'README.md')));
    for (const [file, states] of [['Schedule.jsx', IM], ['Corridor.jsx', CORRIDOR], ['Dispatch.jsx', DISPATCH], ['Offloads.jsx', OFFLOADS]]) for (const [s, list] of Object.entries(states)) assert.deepEqual(rows[s], { file, states: list }, s);
    // (a) schedule, (b) truck leg, (c) performance, (d) dispatch preview, (e) uploads today, (i) claim, (o) drawdown,
    // (p) stock by route, (q) rhythm, (r) agreements, (s) unmatched offloads.
    for (const s of ['ImportSchedule', 'TruckLeg', 'TransportPerformance', 'DispatchPreview', 'OperationsHome', 'ShortageClaim', 'AllocationDrawdown', 'ContractedRhythm', 'ToleranceAgreements', 'UnmatchedOffloads']) assert.ok(WEB[s], s);
    assert.deepEqual(rows.StockPosition.states, ['Stock by route', 'Direct share']);
    assert.match(read(join(ROOT, 'README.md')), /ui_kits\/imports\//, 'the repo README links the kit');
  });

  test('[M7.DS.01] every Imports screen and named state renders, including over-delivered, beyond permit, behind schedule, direct share, nothing scheduled and unmatched offload (AC 1, 3)', () => {
    for (const [s, st] of ALL) {
      const tree = draw(s, st);
      if (st === 'Loading') assert.ok(findAll(tree, 'CardSkeleton').length + findAll(tree, 'Skeleton').length > 0, `${s} ${st}: a skeleton, no text`);
      else assert.ok(words(s, st).length > 1, `${s} ${st} draws something`);
    }
    for (const st of ['Over-delivered', 'Beyond permit', 'Behind schedule']) assert.ok(CORRIDOR.AllocationDrawdown.includes(st), st);
    assert.ok(IM.ImportSchedule.includes('Nothing scheduled'));
    assert.ok(CORRIDOR.UnmatchedOffloads.includes('Unmatched'));
    assert.match(words('ImportSchedule', 'Nothing scheduled').join(' | '), /No legs to display\./);
    assert.match(words('ImportSchedule', 'No results').join(' | '), /No results match your filters\./);
  });
});

/* ------------------------------------------------------------------ (a) the import schedule and criterion 7 */

describe('[M7.DS.01] the import schedule (AC 1a, 7)', () => {
  test('[M7.DS.01] grouped by mill with a By port view and vessel and checkpoint filters; each mill group shows its vessel, allocation, loaded and offloaded totals; each leg its port, truck, Loaded (t), Checkpoint, Offloaded (t) and Difference (t); no money', () => {
    const tree = draw('ImportSchedule', 'By mill');
    const capsules = findAll(tree, 'Capsule').map((c) => c.children.join(''));
    assert.ok(findAll(tree, 'Capsule').some((c) => c.props.selected && c.children.join('') === 'By mill' && c.props.chevron), 'By mill is the saved view in the view selector (UX-07)');
    assert.ok(capsules.includes('Vessel: All') && capsules.includes('Checkpoint: All'));
    assert.ok(findAll(draw('ImportSchedule', 'By port'), 'Capsule').some((c) => c.props.selected && c.children.join('') === 'By port'));
    const cards = findAll(tree, 'Card').filter((c) => /Milling/.test(textOf(c.props.title)));
    assert.deepEqual(cards.map((c) => c.props.title), ['Riverbend Milling, Lusaka', 'Crest Milling, Kitwe']);
    assert.match(words('ImportSchedule', 'By mill').join(' | '), /Vessel \| MV Kalahari \| Allocation \(t\) \| 5,000 \| Loaded \(t\) \| 171 \| Offloaded \(t\) \| 68/, 'labelled group fields, not a run-on line (UX-26); totals whole tonnes');
    const t = tableBy(tree, 'Leg');
    assert.deepEqual(labels(t), ['Leg', 'Port', 'Truck', 'Loaded (t)', 'Checkpoint', 'Offloaded (t)', 'Difference (t)', 'Invoice']);
    const kal07 = t.props.rows.find((r) => r.id === 'KAL-07');
    assert.deepEqual([cell(t, kal07, 'loaded'), cell(t, kal07, 'offloaded'), cell(t, kal07, 'diff')], ['34.100', '34.020', '0.080'], 'three decimals on a leg (UX-12)');
    assert.equal(cell(t, t.props.rows.find((r) => r.id === 'KAL-11'), 'offloaded'), '', 'an offload not recorded is blank (UX-09)');
    const byPort = tableBy(draw('ImportSchedule', 'By port'), 'Leg');
    assert.ok(labels(byPort).includes('Mill'));
    for (const st of IM.ImportSchedule) assert.doesNotMatch(words('ImportSchedule', st).join(' | '), /\bUSD\b|\bZMW\b|\bK\d|[Pp]rice|[Vv]alue|[Mm]argin|Restricted/, `${st}: no money for anyone (M7.IMP.03)`);
  });

  test('[M7.DS.01] the import schedule draws its invoicing column and the blocking total (AC 7)', () => {
    const tree = draw('ImportSchedule', 'By mill');
    const t = tableBy(tree, 'Leg');
    const inv = (id) => findAll(render(cell(t, t.props.rows.find((r) => r.id === id), 'invoice'), kit), 'StatusMark')[0].props.label;
    assert.equal(inv('KAL-07'), 'Ready to invoice');
    assert.equal(inv('KAL-11'), 'Blocked');
    const said = words('ImportSchedule', 'By mill').join(' | ');
    assert.match(said, /Cannot invoice yet \| 5 legs, 170 t/, 'the schedule\'s blocking total, legs and whole tonnes');
    assert.match(said, /Cannot invoice yet \| 3 legs, 102 t/, 'each mill\'s blocking total');
    assert.deepEqual(kit.imBlocking(kit.IM_LEGS), { legs: 5, tonnes: '170', words: '5 legs, 170 t' });
  });
});

/* ------------------------------------------------------------------ (b) the truck leg */

describe('[M7.DS.01] the truck leg record page (AC 1b)', () => {
  test('[M7.DS.01] checkpoints with status, date, recorded by and source; port documents; the Record offload dialog; the difference against the loss allowance in a Reconcile card', () => {
    const tree = draw('TruckLeg', 'At the border');
    const hl = findAll(tree, 'RecordHighlights')[0].props;
    assert.deepEqual(hl.fields.slice(0, 6).map((f) => f.label), ['Vessel', 'Mill', 'Contract', 'Transporter', 'Truck', 'Loaded'], 'UX-19 highlights');
    const banners = findAll(tree, 'ConditionBanner');
    assert.equal(banners.length, 1);
    assert.equal(banners[0].children.join(''), 'Arrived at Kazungula border 24 Sep 2026, 11:20. Not departed.');
    const cp = findAll(tree, 'CheckpointTimeline')[0].props.checkpoints;
    assert.deepEqual(cp.map((c) => c.key), ['loaded', 'in-transit', 'border-arrival', 'border-departure']);
    assert.ok(cp.filter((c) => c.status === 'done').every((c) => c.date && c.by && c.source), 'each reached checkpoint has its date, recorded by and source');
    assert.ok(findAll(tree, 'Card').some((c) => c.props.title === 'Port documents'));
    assert.match(words('TruckLeg', 'At the border').join(' | '), /Released to \| Corridor Clearing Ltd/);
    const dialog = findAll(draw('TruckLeg', 'Record offload'), 'Dialog')[0];
    assert.deepEqual([dialog.props.title, dialog.props.width], ['Record offload, KAL-11', 480], 'UX-22: titled with the act and the leg, 480 px');
    const off = words('TruckLeg', 'Record offload').join(' | ');
    assert.match(off, /Offloaded weight \(t\)[\s\S]*Offload date[\s\S]*Source/);
    assert.match(off, /Difference \| 0\.070 t \(0\.21%\)[\s\S]*Loss allowance \| 80 kg[\s\S]*Within allowance/, 'the difference is computed against 80 kg a truck (Map D-44), the allowance in kg (UX-12)');
    const within = findAll(draw('TruckLeg', 'Within allowance'), 'ReconcileCard')[0].props;
    assert.deepEqual([within.outcome, within.status], ['allowance', undefined], 'the outcome carries the words; no status is retyped');
    assert.deepEqual(within.rows.map((r) => [r.label, r.value]), [['Loaded', '34.100 t'], ['Offloaded', '34.020 t'], ['Difference', '0.080 t (0.23%)'], ['Loss allowance', '80 kg']]);
    const beyond = findAll(draw('TruckLeg', 'Beyond allowance'), 'ReconcileCard')[0].props;
    assert.deepEqual([beyond.outcome, beyond.status], ['beyond-allowance', undefined], 'UX-20 words: Beyond allowance');
    assert.doesNotMatch(SRC.schedule, /1\.0%/, 'the canvas\'s 1.0% is superseded by 80 kg a truck');
    const release = findAll(draw('TruckLeg', 'Release port documents'), 'Dialog')[0].props;
    assert.deepEqual([release.title, release.width], ['Release port documents, KAL-14', 480]);
  });

  test('[M7.DS.01] the difference is computed from loaded and offloaded weight, never typed, and compared with 0.080 t a truck (RL-DIFF, RL-ALLOW)', () => {
    assert.equal(kit.imDifference({ loaded: '33.960', offloaded: '33.890' }), '0.070');
    assert.equal(kit.imOutcome({ loaded: '34.100', offloaded: '34.020' }), 'allowance', 'exactly the allowance is within it');
    assert.equal(kit.imOutcome({ loaded: '33.880', offloaded: '33.700' }), 'beyond-allowance');
    assert.equal(kit.imOutcome({ loaded: '33.880', offloaded: '' }), '');
    assert.equal(kit.IM_LOSS_ALLOWANCE.bulk, '0.080');
    assert.equal(kit.IM_LOSS_ALLOWANCE.bagged, '0.000');
  });
});

/* ------------------------------------------------------------------ The component: CheckpointTimeline */

describe('[M7.DS.01] CheckpointTimeline', () => {
  // The card's test reads "renders loaded, in transit and offloaded only"; AC 1b names five checkpoints. The AC wins:
  // the timeline renders the five, in order, and nothing else.
  test('[M7.DS.01] a checkpoint timeline renders the five checkpoints of AC 1b, in order, and only those', () => {
    assert.deepEqual(ds.CHECKPOINTS.map((c) => c.word), ['Loaded at origin', 'In transit', 'Border arrival', 'Border departure', 'Offloaded']);
    const tree = render(el(ds.CheckpointTimeline, { checkpoints: [{ key: 'border-arrival', status: 'done', date: '24 Sep 2026, 11:20', by: 'M. Chanda', source: 'transporter-call' }, { key: 'not-a-checkpoint', status: 'done' }] }), ds);
    const t = findAll(tree, 'DataTable')[0].props;
    assert.deepEqual(t.rows.map((r) => r.checkpoint), ['Loaded at origin', 'In transit', 'Border arrival', 'Border departure', 'Offloaded']);
    assert.deepEqual(t.columns.map((c) => c.label), ['Checkpoint', 'Status', 'Date (CAT)', 'Recorded by', 'Source']);
    assert.deepEqual(t.rows.map((r) => r.status), ['', '', 'done', '', ''], 'not reached is blank (UX-09), never Not recorded');
    const list = render(el(ds.CheckpointTimeline, { variant: 'list', checkpoints: [] }), ds);
    assert.equal(findAll(list, 'li').length, 5);
    assert.deepEqual(Object.values(ds.CHECKPOINT_STATUS).map((s) => s.word), ['Done', 'Waiting']);
  });

  test('[M7.DS.01] a transporter-reported position is a checkpoint row with a labelled Source naming the report, distinct from every provenance badge: no badge, no confidence, never Source: Weighbridge (AC 4)', () => {
    assert.equal(ds.checkpointSource('border-arrival', 'transporter-call'), 'Transporter call');
    for (const p of ['in-transit', 'border-arrival', 'border-departure']) {
      assert.equal(ds.checkpointSource(p, 'weighbridge'), '', `${p}: never Weighbridge`);
      assert.ok(!ds.checkpointSourceOptions(p).includes('Weighbridge'), `${p}: Weighbridge is never offered`);
    }
    assert.equal(ds.checkpointSource('offloaded', 'transporter-call'), '', 'a transporter\'s report never stands for a weight');
    const tree = render(el(ds.CheckpointTimeline, { checkpoints: [{ key: 'border-arrival', status: 'done', source: 'weighbridge' }] }), ds);
    assert.equal(findAll(tree, 'DataTable')[0].props.rows[2].source, '', 'a weighbridge position draws no source rather than a wrong one');
    for (const src of [SRC.checkpoint, SRC.schedule, SRC.app]) {
      const c = code(src);
      assert.doesNotMatch(c, /ProvenanceChip|ConfirmationChip|TrustChip|SeverityTag|Badge|[Cc]onfidence|synced/, 'no badge, provenance styling or confidence');
    }
    // On the KAL-11 leg the border arrival is the transporter's call, and the weight sources sit on the weight checkpoints.
    const kal11 = kit.IM_CHECKPOINTS['KAL-11'];
    assert.equal(kal11.find((c) => c.key === 'border-arrival').source, 'transporter-call');
    for (const leg of Object.values(kit.IM_CHECKPOINTS)) for (const c of leg) if (c.source) assert.notEqual(ds.checkpointSource(c.key, c.source), '', `${c.key} ${c.source}`);
  });

  test('[M7.DS.01] the checkpoint copy lives in one module: screens import its words and never retype them', () => {
    for (const src of [SRC.schedule, SRC.app]) {
      const c = code(src);
      for (const w of ['Loaded at origin', 'Border arrival', 'Border departure', 'Transporter call', 'Mill offload sheet']) assert.ok(!c.includes(`'${w}'`), `${w} is not retyped`);
    }
    assert.match(SRC.schedule, /CHECKPOINTS\.find/);
    assert.match(SRC.schedule, /IM_OFFLOAD_SOURCES = checkpointSourceOptions\('offloaded'\)/);
    assert.ok(dsFiles.includes('records/CheckpointTimeline.jsx'), 'the loader publishes it');
    assert.ok(dsFiles.indexOf('records/CheckpointTimeline.jsx') > dsFiles.indexOf('data/DataTable.jsx'), 'after what it composes');
    const dts = read(join(COMPONENTS, 'records/CheckpointTimeline.d.ts'));
    for (const n of ['CheckpointTimeline', 'CHECKPOINTS', 'CHECKPOINT_SOURCES', 'CHECKPOINT_STATUS', 'checkpointSource', 'checkpointSourceOptions', 'CheckpointStatusMark']) assert.match(dts, new RegExp(`export (function|const) ${n}\\b`), n);
    assert.match(read(join(COMPONENTS, 'records/CheckpointTimeline.prompt.md')), /never Source: Weighbridge/);
    assert.match(read(join(COMPONENTS, 'records/imports.card.html')), /@dsCard group="Components"[\s\S]*CheckpointTimeline/);
    assert.deepEqual(compositionProblems(SRC.checkpoint), []);
  });
});

/* ------------------------------------------------------------------ (d) and (e): dispatch report, Home */

describe('[M7.DS.01] the dispatch report preview and the operations lead\'s Home (AC 1d, 1e, 2)', () => {
  test('[M7.DS.01] the dispatch preview: the File card, each line with leg, truck, product, pack, bags, tonnes and its Classification, the farmer on virtual and direct lines, the On the road, At warehouse awaiting receipt and Already received split with totals, Discard and Import', () => {
    const tree = draw('DispatchPreview', 'Ready to import');
    const p = findAll(tree, 'ImportPreview')[0].props;
    assert.equal(p.file.name, 'Dispatch report 22 Sep 2026.xlsx');
    assert.deepEqual(p.columns.map((c) => c.label), ['Leg', 'Truck', 'Product', 'Pack', 'Bags', 'Tonnes (t)', 'Classification', 'Farmer']);
    assert.deepEqual(p.tiles.map((t) => t.label), ['Physical warehouse', 'Virtual warehouse', 'Direct delivery']);
    const cls = p.columns.find((c) => c.key === 'classification');
    assert.deepEqual(render(cls.render(p.rows[0]), kit).props.options, ['Physical warehouse', 'Virtual warehouse', 'Direct delivery']);
    const farmer = p.columns.find((c) => c.key === 'farmer');
    assert.equal(farmer.render(p.rows.find((r) => r.classification === 'Physical warehouse')), '', 'no farmer on a physical line');
    assert.equal(render(farmer.render(p.rows.find((r) => r.classification === 'Direct delivery')), kit).props.defaultValue, 'Cameron Estates');
    assert.equal(render(farmer.render(p.rows.find((r) => r.classification === 'Virtual warehouse')), kit).props.defaultValue, 'Lakeview Farms Ltd');
    const split = tableBy(tree, 'Where it is');
    assert.deepEqual(split.props.rows.map((r) => [r.split, r.lines, r.tonnes]), [['On the road', '6', '200'], ['At warehouse awaiting receipt', '1', '10'], ['Already received', '1', '30'], ['Total', '8', '240']]);
    assert.ok(p.rows.some((r) => r.check === 'already-recorded'), 'a re-sent line is recognised, not duplicated');
    assert.ok(button(tree, 'Discard') && button(tree, 'Import'));
    assert.equal(button(draw('DispatchPreview', 'Classifying'), 'Import').props.disabled, true, 'Import waits while a direct line has no farmer');
    assert.ok(findAll(draw('DispatchPreview', 'Classifying'), 'ImportPreview')[0].props.rows.some((r) => r.error === 'Select a farmer.'));
    assert.doesNotMatch(code(SRC.dispatch), /Commit/, 'Import, never Commit (UX-33)');
  });

  test('[M7.DS.01] Uploads today on the operations lead\'s Home: each expected upload with its uploader, time, rows and status, one with a row error and one not received by its due time, and Waiting on partners; the queue counts are filters, not tiles (AC 1e, 2)', () => {
    const tree = draw('OperationsHome', 'With items');
    const up = tableBy(tree, 'Upload');
    assert.deepEqual(labels(up), ['Upload', 'By', 'Time (CAT)', 'Rows', 'Status']);
    const status = (r) => textOf(cell(up, r, 'status'));
    const rows = up.props.rows;
    assert.match(status(rows.find((r) => r.upload === 'Port schedule')), /Ready to import 1 row to fix/);
    assert.equal(status(rows.find((r) => r.upload === 'Farm-direct loads')), 'Imported', 'Imported, never Committed');
    const missing = rows.find((r) => r.status === 'missing');
    assert.deepEqual([status(missing), missing.time], ['Not received', 'Due 12:00']);
    assert.ok(tableBy(tree, 'Record').props.columns.some((c) => c.label === 'Partner'), 'Waiting on partners');
    assert.deepEqual(findAll(tree, 'Capsule').map((c) => c.children.join('')), ['Cannot invoice yet', 'Uploads today', 'Waiting on partners', 'Exceptions']);
    assert.equal(findAll(tree, 'KpiTile').length, 0, 'Alka\'s Home counts are filters on the list below (UX-08)');
    const only = draw('OperationsHome', 'Uploads today');
    assert.ok(findAll(only, 'Capsule').find((c) => c.children.join('') === 'Uploads today').props.selected);
    assert.ok(!words('OperationsHome', 'Uploads today').includes('Record offload'), 'the filter shows its list only');
    assert.ok(words('OperationsHome', 'With items').includes('Record offload'));
    assert.doesNotMatch(code(SRC.schedule), /Committed/);
  });
});

/* ------------------------------------------------------------------ The corridor screens (c, i, o, p, q, r, s) */

describe('[M7.DS.01] the corridor screens (AC 1c, 1i, 1o, 1q, 1r, 1s)', () => {
  test('[M7.DS.01] transport performance per transporter and corridor, week by week, against the contracted rhythm', () => {
    const t = tableBy(draw('TransportPerformance', 'Week by week'), 'Transporter');
    assert.deepEqual(labels(t).slice(0, 3), ['Transporter', 'Corridor', 'Agreed trucks a week']);
    assert.equal(labels(t).filter((l) => /^Week of /.test(l)).length, 4);
    const none = t.props.rows.find((r) => !r.agreed);
    assert.equal(render(cell(t, none, 'agreed'), kit).type, 'NotSet', 'no rhythm agreed reads Not set (U-44)');
    assert.deepEqual(tableBy(draw('TransportPerformance', 'Behind schedule'), 'Transporter').props.rows.map((r) => r.status), ['behind']);
  });

  test('[M7.DS.01] a shortage claim with its pre-loading tolerance and evidence', () => {
    const tree = draw('ShortageClaim', 'Pending approval');
    const said = words('ShortageClaim', 'Pending approval').join(' | ');
    assert.match(said, /Pre-loading tolerance \| 0\.080 t a truck/);
    assert.match(said, /Shortage claimed \| 0\.100 t/);
    assert.equal(kit.imClaimable(), '0.100', 'the difference beyond the tolerance agreed before loading');
    assert.equal(findAll(tree, 'EvidenceTile').length, 2);
    assert.equal(findAll(draw('ShortageClaim', 'Within tolerance'), 'Refusal')[0].props.action, 'Submit for approval');
  });

  test('[M7.DS.01] allocation and shipment drawdown: allocated, loaded, offloaded, in transit, remaining, over-delivered, beyond permit, behind schedule', () => {
    const t = tableBy(draw('AllocationDrawdown', 'All allocations'), 'Mill');
    assert.deepEqual(labels(t), ['Mill', 'Vessel', 'Permit (t)', 'Allocated (t)', 'Loaded (t)', 'Offloaded (t)', 'In transit (t)', 'Remaining (t)', 'Over-delivered (t)', 'Status']);
    const marks = t.props.rows.filter((r) => !r.total).map((r) => findAll(render(cell(t, r, 'status'), kit), 'StatusMark')[0].props.label);
    assert.deepEqual(marks, ['On schedule', 'Behind schedule', 'Over-delivered', 'Beyond permit']);
    for (const a of kit.IM_ALLOCATIONS) {
      const d = kit.imDrawdown(a);
      const n = (v) => Number(String(v).replace(/,/g, '')) || 0;
      assert.equal(n(d.transit), n(a.loaded) - n(a.offloaded), `${a.mill}: in transit is loaded less offloaded`);
      assert.equal(n(d.remaining), Math.max(0, n(a.allocated) - n(a.loaded)), `${a.mill}: remaining never below zero`);
    }
    assert.equal(kit.imDrawdown(kit.IM_ALLOCATIONS[2]).over, '60');
    for (const st of ['Over-delivered', 'Beyond permit', 'Behind schedule']) assert.equal(tableBy(draw('AllocationDrawdown', st), 'Mill').props.rows.filter((r) => !r.total).length, 1, st);
    assert.equal(findAll(draw('AllocationDrawdown', 'Calculation details'), 'CalculationDetails').length, 1);
    assert.match(words('AllocationDrawdown', 'Nothing allocated').join(' | '), /No allocations to display\./);
  });

  test('[M7.DS.01] fertiliser stock by route (Physical warehouse, Virtual warehouse, Direct delivery) with the direct share (AC 1p)', () => {
    const tree = draw('StockPosition', 'Stock by route');
    const routes = tableBy(tree, 'Route');
    assert.deepEqual(routes.props.rows.map((r) => r.route), ['Physical warehouse', 'Virtual warehouse', 'Direct delivery', 'Total']);
    assert.match(words('StockPosition', 'Stock by route').join(' | '), /Direct share 4\.8%/);
    const panel = findAll(draw('StockPosition', 'Direct share'), 'CalculationDetails')[0].props;
    assert.equal(panel.open, true);
    assert.deepEqual(panel.components.map((c) => c.label), ['Direct delivery, dispatched', 'All routes, dispatched']);
    const direct = kit.SK_ROUTES.find((r) => r.id === 'direct');
    const all = kit.SK_ROUTES.find((r) => r.total);
    const n = (v) => Number(String(v).replace(/,/g, ''));
    assert.equal((100 * n(direct.dispatched) / n(all.dispatched)).toFixed(1) + '%', direct.share, 'the share is computed, never typed (U-23)');
  });

  test('[M7.DS.01] contracted rhythm entry, transporter tolerance agreements with evidence, and the unmatched offloads list', () => {
    const form = words('ContractedRhythm', 'New rhythm').join(' | ');
    for (const l of ['Transporter', 'Corridor', 'Agreed trucks a week', 'From']) assert.ok(form.includes(l), l);
    assert.match(words('ContractedRhythm', 'Missing fields').join(' | '), /Agreed trucks a week must be a whole number\./);
    const ag = tableBy(draw('ToleranceAgreements', 'Agreements'), 'Agreement');
    assert.deepEqual(labels(ag), ['Agreement', 'Transporter', 'Product', 'Tolerance a truck (t)', 'Agreed on', 'Evidence', 'Status']);
    assert.equal(findAll(draw('ToleranceAgreements', 'Agreement'), 'EvidenceTile').length, 1);
    assert.equal(findAll(draw('ToleranceAgreements', 'Evidence missing'), 'Refusal')[0].props.reason, 'No signed agreement is attached');
    const un = tableBy(draw('UnmatchedOffloads', 'Unmatched'), 'Truck');
    assert.deepEqual(labels(un).slice(0, 8), ['Truck', 'Mill', 'Offloaded (t)', 'Offloaded on (CAT)', 'Source', 'Reported by', 'Age', 'Status']);
    assert.equal(findAll(draw('UnmatchedOffloads', 'Match to leg'), 'Dialog')[0].props.width, 480);
    assert.match(words('UnmatchedOffloads', 'No items').join(' | '), /No unmatched offloads to display\./);
  });
});

/* ------------------------------------------------------------------ AC 2: the existing screens */

describe('[M7.DS.01] the existing kit screens gain only the M7 states (AC 2)', () => {
  test('[M7.DS.01] Coverage, StockBoard and the import states show their new states, the others unchanged', () => {
    const cov = draw('Coverage', 'In transit');
    const figures = findAll(cov, 'Figure').map((f) => f.props.label);
    assert.equal(figures.indexOf('supply on the way'), figures.indexOf('short') + 1, 'supply on the way sits beside the gap');
    const col = tableBy(cov, 'Mill');
    assert.ok(labels(col).includes('In transit (MT)'), 'the in-transit column state');
    assert.equal(kit.COVERAGE_IN_TRANSIT.find((r) => r.total).transit, '640', 'the same 640 MT Could cover counts as stock in transit');
    for (const st of ['Board', 'Calculation details']) {
      const t = draw('Coverage', st);
      assert.ok(!findAll(t, 'Figure').some((f) => f.props.label === 'supply on the way'), `${st} unchanged`);
      assert.equal(tables(t).length, 0, `${st} unchanged`);
    }
    assert.match(SRC.coverage, /COVERAGE_SHORT = \{\n  name: 'Short, wheat \(local\)', value: '35,061 MT'/, 'the short is not changed by supply on the way');
    const pos = tableBy(draw('StockPosition', 'Stock by route'), 'Product');
    assert.deepEqual(labels(pos).slice(2), ['On the road (t)', 'Physical warehouse (t)', 'Virtual warehouse (t)', 'Committed (t)', 'On hold (t)', 'Free (t)'], 'On the road by product and pack beside the rest');
    assert.equal((SRC.stock.match(/function SkStockByRoute[\s\S]*?\n\}/)[0].match(/<SkTile /g) || []).length, 4, 'four tiles at most (UX-08)');
    const old = draw('StockPosition', 'Position');
    assert.equal(tableBy(old, 'Route'), undefined, 'the Position state is drawn as before');
    const road = tableBy(draw('OnTheRoad', 'All'), 'Leg');
    for (const l of ['Route type', 'Dispatched', 'Age']) assert.ok(labels(road).includes(l), `On the road shows each leg's ${l}`);
  });

  test('[M7.DS.01] no Home gains imports lanes or tiles: the Managing Director\'s Home keeps its three KPI tiles, and the imports work sits on the operations lead\'s Home', () => {
    const home = draw('Home', 'With items');
    assert.deepEqual(findAll(home, 'KpiTile').map((t) => t.props.label), ['Total exposure', 'Uncovered exposure', 'Coverage']);
    assert.doesNotMatch(words('Home', 'With items').join(' | '), /Cannot invoice yet|Uploads today|Waiting on partners|Import schedule|imports/i);
    const ops = words('OperationsHome', 'With items').join(' | ');
    for (const w of ['Cannot invoice yet', 'Uploads today', 'Waiting on partners', 'Exceptions']) assert.ok(ops.includes(w), w);
  });
});

/* ------------------------------------------------------------------ AC 3, 5, 6: composition, visibility, working */

describe('[M7.DS.01] composition, visibility and working states (AC 3, 5, 6)', () => {
  test('[M7.DS.01] every Imports screen composes published components and tokens only, with no bespoke colour, and the Alka, Sid and Ryan app screens too (AC 3, 7)', () => {
    for (const [name, src] of Object.entries({ schedule: SRC.schedule, corridor: SRC.corridor, dispatch: SRC.dispatch, offloads: SRC.offloads, app: SRC.app, stock: SRC.stock })) {
      assert.deepEqual(compositionProblems(src), [], name);
    }
    // Coverage's season chart keeps its older literal wheat colour (pre-existing); the M7 additions add none.
    assert.deepEqual(compositionProblems(SRC.coverage).filter((p) => p !== 'literal colour #7A6937'), [], 'coverage');
    for (const src of [SRC.schedule, SRC.corridor, SRC.dispatch, SRC.offloads, SRC.app]) assert.doesNotMatch(src, /<svg|<canvas|<table|fontFamily|boxShadow: '0 /i, 'no bespoke drawing or styling');
  });

  test('[M7.DS.01] a field the viewer is not entitled to shows the lock with no value and the tooltip Restricted, never a dash, a zero or a figure; Clerk, Warehouse and stock control views show no money (AC 5)', () => {
    const tree = draw('ShortageClaim', 'Warehouse view');
    const value = findAll(tree, 'RecordHighlights')[0].props.fields.find((f) => f.label === 'Claim value').value;
    assert.equal(value.type, 'Restricted');
    assert.equal(value.props.label, undefined, 'the tooltip stays Restricted');
    assert.doesNotMatch(words('ShortageClaim', 'Warehouse view').join(' | '), /USD|28\.44|284\.40/, 'no value leaks');
    assert.equal(kit.imCorridorFrame('ShortageClaim', 'Warehouse view').who, 'warehouse');
    assert.match(words('ShortageClaim', 'Pending approval').join(' | '), /Claim value \| USD 28\.44/, 'the operations lead sees it');
    for (const [s, list] of Object.entries({ ...DISPATCH, PortSchedulePreview: IM.PortSchedulePreview, ImportSchedule: IM.ImportSchedule, StockApp: APP.StockApp, ImportScheduleApp: APP.ImportScheduleApp, RecordOffloadApp: APP.RecordOffloadApp })) {
      for (const st of list) assert.doesNotMatch(words(s, st).join(' | '), /\bUSD\b|\bZMW\b|\bK\d|[Pp]rice|[Mm]argin/, `${s} ${st}`);
    }
    for (const st of ['Stock by route', 'Direct share']) assert.doesNotMatch(words('StockPosition', st).join(' | '), /\bUSD\b|\bZMW\b|[Vv]alue|[Mm]argin/, st);
  });

  test('[M7.DS.01] the restricted-dash and working-button contracts are reused, not duplicated (AC 5)', () => {
    for (const src of [SRC.schedule, SRC.corridor, SRC.dispatch, SRC.app]) {
      const c = code(src);
      assert.doesNotMatch(c, /RestrictedCell|name="lock"|icon="lock"|'Restricted'/, 'the Restricted component, never a hand-drawn lock or the older cell');
      assert.doesNotMatch(c, /Spinner|@keyframes|animation:/, 'no hand-made spinner: Button and PressButton draw the working state');
    }
    const busy = (s, st, label) => [...findAll(draw(s, st), 'Button'), ...findAll(draw(s, st), 'PressButton')].some((b) => b.children.join('') === label && b.props.loading === true);
    for (const [s, st, label] of [['TruckLeg', 'Recording offload', 'Record offload'], ['TruckLeg', 'Releasing', 'Release'], ['ImportSchedule', 'Exporting', 'Export'], ['PortSchedulePreview', 'Importing', 'Import'],
      ['DispatchPreview', 'Importing', 'Import'], ['DispatchUpload', 'Previewing', 'Preview'], ['ShortageClaim', 'Submitting', 'Submit for approval'], ['ContractedRhythm', 'Saving', 'Save'],
      ['ToleranceAgreements', 'Activating', 'Activate'], ['UnmatchedOffloads', 'Matching', 'Match to leg'], ['TransportPerformance', 'Exporting', 'Export'], ['RecordOffloadApp', 'Recording', 'Record offload'], ['RecordOffloadApp', 'Queued', 'Record offload']]) {
      assert.equal(busy(s, st, label), true, `${s} ${st}: ${label}`);
    }
  });

  test('[M7.DS.01] verify:design stays green after design-system:sync: no token is defined or changed and the vendored word list keeps its words (AC 6)', () => {
    assert.deepEqual(BANNED.words, ['batch', 'upload', 'template', 'sync', 'virtual warehouse']);
    assert.deepEqual(BANNED.patterns, ['\\berror code\\b', '\\b(?:E|ERR|ERROR)[-_ ]?\\d{2,}\\b']);
    for (const src of Object.values(SRC)) {
      assert.doesNotMatch(src, /(^|[\s{;'"`])--[a-z0-9-]+['"]?\s*:/m, 'no token defined');
      for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) assert.ok(tokens.has(m[1]), m[1]);
    }
  });
});

/* ------------------------------------------------------------------ AC 7: the UAG One Link app */

describe('[M7.DS.01] the UAG One Link app (AC 7)', () => {
  test('[M7.DS.01] the app draws the operations lead\'s schedule and offload entry, Finance\'s pipeline with Payables ageing and Receivables ageing, and stock control\'s stock at 390', () => {
    const index = read(join(FIELD, 'index.html'));
    assert.ok(index.includes("'../imports/Schedule.jsx','ImportsApp.jsx'"));
    assert.match(index, /\.\.\.K\.IMPORTS_APP_STATES/);
    const rows = readmeRows(read(join(FIELD, 'README.md')));
    for (const [s, list] of Object.entries(APP)) assert.deepEqual(rows[s], { file: 'ImportsApp.jsx', states: list }, s);
    const off = draw('RecordOffloadApp', 'Weight entered');
    const shell = findAll(off, 'MobileShell')[0].props;
    assert.equal(shell.showBottomBar, false, 'a task screen hides the bottom bar (UX-31)');
    assert.equal(typeof shell.onBack, 'function', 'and carries the back chevron');
    const go = button(off, 'Record offload');
    assert.deepEqual([go.type, go.props.kind, go.props.fullWidth], ['PressButton', 'large', true], 'the full-width 48 px button');
    assert.deepEqual(findAll(off, 'CaptureStatus')[0].props, { online: true, pending: 0 });
    assert.deepEqual(findAll(draw('RecordOffloadApp', 'Queued'), 'CaptureStatus')[0].props, { online: false, pending: 1 }, 'Pending sync (count) while offline');
    assert.match(words('RecordOffloadApp', 'Weight entered').join(' | '), /Difference \| 0\.070 t[\s\S]*Within allowance/);
    assert.match(words('RecordOffloadApp', 'Beyond allowance').join(' | '), /Beyond allowance/);
    assert.equal(findAll(draw('ImportScheduleApp', 'Leg KAL-11'), 'CheckpointTimeline')[0].props.variant, 'list');
    const pipe = words('PipelineApp', 'Pipeline').join(' | ');
    assert.match(pipe, /Receivables ageing[\s\S]*Payables ageing/);
    assert.ok(findAll(draw('PipelineApp', 'No rate today'), 'KpiTile').some((t) => t.props.notSet), 'no rate today is Not set, never a zero');
    const stock = draw('StockApp', 'Position');
    assert.deepEqual(findAll(stock, 'KpiTile').map((t) => t.props.label), ['Physical warehouse (t)', 'Virtual warehouse (t)', 'On the road (t)', 'Free (t)']);
  });
});

/* ------------------------------------------------------------------ AC 8: words */

describe('[M7.DS.01] words (AC 8)', () => {
  test('[M7.DS.01] S57 and the locked words: Loaded, In transit, Offloaded and Difference on legs; On the road, Physical warehouse, Virtual warehouse and Direct delivery on fertiliser; no batch terms, no Commit; fictional data; no em dash', () => {
    // Coverage's older copy (its needs-you rail, the Horizon window dash) is pre-existing and flagged in M5.DS.02; its M7
    // additions are checked on their own below.
    for (const [s, st] of ALL.filter(([x]) => x !== 'Coverage')) {
      const said = words(s, st).join(' | ');
      assert.doesNotMatch(said, /\b[Bb]atch\b|\bCommit\b|[Cc]onfidence/, `${s} ${st}`);
      assert.doesNotMatch(said, /\bUAG\b|United African Grain|National Milling|\bOwen\b|\bJacques\b|\bAlka\b|\bSid\b|\bRyan\b|\bShakil\b|\bAshraf\b/, `${s} ${st}: fictional, One Link`);
      assert.doesNotMatch(said, /Season book|Derivation|\bDigest\b|End-of-day list|Settlement run|Two clocks|Needs you|Not recorded/, `${s} ${st}: S57 glossary`);
      assert.doesNotMatch(said, /\u2014|\s\u2013\s/, `${s} ${st}`);
      assert.doesNotMatch(said, /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b|\b(AM|PM)\b|\b\d{4}-\d{2}-\d{2}\b/, `${s} ${st}: dates read 22 Sep 2026`);
    }
    const added = wordsOf(tableBy(draw('Coverage', 'In transit'), 'Mill'), kit).join(' | ') + JSON.stringify(SRC.coverage.match(/COVERAGE_IN_TRANSIT = \[[\s\S]*?\];/)[0]);
    assert.doesNotMatch(added, /\u2014|\s\u2013\s|Needs you|\bUAG\b/);
    for (const src of [SRC.schedule, SRC.corridor, SRC.dispatch, SRC.offloads, SRC.app, SRC.checkpoint, read(join(IMPORTS, 'README.md')), read(join(IMPORTS, 'index.html'))]) assert.doesNotMatch(src, /\u2014|\s\u2013\s/);
    const leg = tableBy(draw('ImportSchedule', 'By mill'), 'Leg');
    assert.ok(['Loaded (t)', 'Offloaded (t)', 'Difference (t)'].every((l) => labels(leg).includes(l)));
    const cells = leg.props.rows.map((r) => findAll(render(cell(leg, r, 'at'), kit), 'StatusMark')[0].props.label);
    assert.ok(cells.includes('In transit') && cells.includes('Offloaded'), 'the leg words: Loaded, In transit, Offloaded, Difference');
    for (const [screen, state] of [['TruckLeg', 'At the border'], ['ImportSchedule', 'By mill'], ['OperationsHome', 'With items'], ['ShortageClaim', 'Pending approval']]) {
      for (const m of findAll(draw(screen, state), 'StatusMark')) assert.ok(m.props.kind && m.props.label != null, `${screen}: icon and word`);
    }
  });
});

/* ------------------------------------------------------------------ M7.IMP.05 (UAG-103): the gaps the card left undrawn */

describe('[M7.IMP.05] mill offload: sources, Declared by mill, Beyond allowance, Import legs and unmatched offloads', () => {
  test('[M7.IMP.05] an offload\'s Source is one of the mill\'s five, never Weighbridge; a form offers Mill call, Email and Mill offload sheet (AC 7, 8)', () => {
    assert.deepEqual(ds.OFFLOAD_SOURCES, ['mill-call', 'email', 'mill-offload-sheet', 'scanned-slip', 'mill-portal']);
    assert.deepEqual(ds.OFFLOAD_SOURCES.map((k) => ds.offloadSource(k)), ['Mill call', 'Email', 'Mill offload sheet', 'Scanned slip', 'Mill portal']);
    for (const k of ds.OFFLOAD_SOURCES) assert.equal(ds.checkpointSource('offloaded', k), ds.CHECKPOINT_SOURCES[k].word, k);
    for (const k of ['weighbridge', 'port-schedule', 'transporter-call']) assert.equal(ds.checkpointSource('offloaded', k), '', `an offload is never ${k}`);
    assert.equal(ds.offloadSource('weighbridge'), '');
    assert.deepEqual(ds.checkpointSourceOptions('offloaded'), ['Mill call', 'Email', 'Mill offload sheet', 'Mill phone call', 'Mill email'], 'Scanned slip and Mill portal are never picked; the kept two stay offered');
    assert.deepEqual(ds.checkpointSourceOptions('loaded'), ['Port schedule', 'Mill phone call', 'Mill email', 'Weighbridge'], 'a new mill source never stands for the loaded weight');
    assert.match(words('TruckLeg', 'Record offload').join(' | '), /Source \| Mill call \| Email \| Mill offload sheet \| Mill phone call \| Mill email \| Delivery point[\s\S]*Mill delivery note \| Mill document/, 'AC 11 fields');
    assert.doesNotMatch(words('TruckLeg', 'Record offload').join(' | '), /Grade/, 'no grade field');
  });

  test('[UAG-102] the stored sources Mill phone call and Mill email still resolve to their old words, as before', () => {
    assert.deepEqual(ds.CHECKPOINT_SOURCES['mill-phone-call'].word, 'Mill phone call');
    assert.deepEqual(ds.CHECKPOINT_SOURCES['mill-email'].word, 'Mill email');
    for (const cp of ['loaded', 'offloaded']) {
      assert.equal(ds.checkpointSource(cp, 'mill-phone-call'), 'Mill phone call', cp);
      assert.equal(ds.checkpointSource(cp, 'mill-email'), 'Mill email', cp);
    }
    for (const cp of ['in-transit', 'border-arrival', 'border-departure']) assert.equal(ds.checkpointSource(cp, 'mill-phone-call'), '', cp);
    assert.deepEqual([ds.offloadSource('mill-phone-call'), ds.offloadSource('mill-email')], ['Mill phone call', 'Mill email']);
    assert.ok(!ds.OFFLOAD_SOURCES.includes('mill-phone-call') && !ds.OFFLOAD_SOURCES.includes('mill-email'), 'the five import offload sources stay as built');
  });

  test('[M7.IMP.05] the provenance chip has Declared by mill beside Declared by farmer, which keeps its words', () => {
    const prov = literal(read(join(COMPONENTS, 'feedback/TrustChip.jsx')), 'PROV');
    assert.equal(prov.declared.label, 'Declared by farmer');
    assert.equal(prov['declared-mill'].label, 'Declared by mill');
    assert.match(read(join(COMPONENTS, 'feedback/TrustChip.d.ts')), /'declared-mill'/);
    assert.equal(findAll(draw('UnmatchedOffload', 'Open'), 'ProvenanceChip')[0].props.kind, 'declared-mill');
  });

  test('[M7.IMP.05] the Reconcile card closes Beyond allowance, the pair to Within allowance, in the attention look (AC 2)', () => {
    assert.deepEqual(ds.RECONCILE_OUTCOMES['beyond-allowance'], { kind: 'attention', word: 'Beyond allowance' });
    assert.deepEqual(ds.RECONCILE_OUTCOMES.beyond.kind, ds.RECONCILE_OUTCOMES['beyond-allowance'].kind, 'same look as Beyond tolerance');
    assert.deepEqual(ds.RECONCILE_OUTCOMES.allowance, { kind: 'clean', word: 'Within allowance' });
    const leg = draw('TruckLeg', 'Beyond allowance');
    assert.deepEqual(findAll(leg, 'ReconcileCard')[0].props.rows.map((r) => [r.label, r.value]),
      [['Loaded', '32.000 t'], ['Offloaded', '31.200 t'], ['Difference', '0.800 t (2.50%)'], ['Loss allowance', '80 kg']]);
    assert.equal(findAll(leg, 'RecordHighlights')[0].props.status.props.label, 'Delivered', 'the leg stays Delivered');
    assert.equal(kit.imDifferenceWords({ loaded: '32.500', offloaded: '32.450' }), '0.050 t (0.15%)');
    assert.equal(kit.imOutcome({ loaded: '32.000', offloaded: '31.920' }), 'allowance', 'exactly 80 kg is within');
    assert.equal(kit.imOutcome({ loaded: '32.000', offloaded: '31.919' }), 'beyond-allowance', '81 kg is beyond');
    const tree = draw('TruckLeg', 'Beyond allowance');
    const rel = render(el(kit.TruckLeg, { state: 'Related', onOpen: () => {} }), kit);
    assert.ok(rel, 'Related renders');
    assert.deepEqual(kit.imLegExceptions(kit.IM_SALE_LEGS[1]).map((x) => [x.title, x.status]), [['Weight difference beyond allowance', 'open']]);
    assert.deepEqual(kit.imLegExceptions(kit.IM_SALE_LEGS[0]), [], 'a reconciled leg has none');
    assert.ok(tree);
  });

  test('[M7.IMP.05] a sale contract\'s Related tab has Import legs with a count and View all, the schedule\'s figures (AC 10)', () => {
    const tree = draw('SaleContract', 'Related');
    const card = kit.ImImportLegs({ legs: kit.IM_SALE_LEGS });
    assert.deepEqual([card.props.title, card.props.count, card.props.link], ['Import legs', 3, 'View all']);
    assert.ok(findAll(tree, 'ImImportLegs').length + tables(tree).length > 0);
    const t = tableBy(tree, 'Leg');
    assert.deepEqual(labels(t), ['Leg', 'Truck', 'Loaded (t)', 'Offloaded (t)', 'Difference (t)', 'Status']);
    const baz = t.props.rows.find((r) => r.truck === 'BAZ 2231');
    assert.deepEqual([baz.loaded, baz.offloaded, cell(t, baz, 'difference')], ['32.000', '31.200', '0.800']);
    assert.ok(['loaded', 'offloaded', 'difference'].every((k) => t.props.columns.find((c) => c.key === k).align === 'right'), 'figures right aligned');
    assert.equal(cell(t, baz, 'id').type, kit.HmLink, 'the leg is a record link');
    assert.match(words('SaleContract', 'Related').join(' | '), /Weight difference beyond allowance/);
    assert.equal(kit.imOffloadFrame('SaleContract').breadcrumb.join(' / '), 'Trading / Contracts / SYN4811');
  });

  test('[M7.IMP.05] an unmatched offload is saved and raises Offload with no loaded record; the portal\'s joins the same list; match or close with a reason, nothing edited (AC 8)', () => {
    const list = tableBy(draw('UnmatchedOffloads', 'Unmatched'), 'Truck');
    const zzt = list.props.rows.find((r) => r.truck === 'ZZT 901');
    assert.deepEqual([zzt.mill, cell(list, zzt, 'source'), zzt.by], ['Antelope Mills, Lusaka', 'Mill call', 'M. Chanda']);
    const portal = list.props.rows.find((r) => r.source === 'mill-portal');
    assert.deepEqual([cell(list, portal, 'source'), portal.by], ['Mill portal', 'Antelope Mills'], 'one list whoever reported it');
    const open = draw('UnmatchedOffload', 'Open');
    const hl = findAll(open, 'RecordHighlights')[0].props;
    assert.deepEqual(hl.fields.map((f) => f.label), ['Truck', 'Mill', 'Offloaded', 'Offloaded on', 'Source', 'Reported by']);
    assert.match(words('UnmatchedOffload', 'Open').join(' | '), /Offload with no loaded record[\s\S]*Operations/);
    assert.ok(button(open, 'Match to leg') && button(open, 'Close'));
    assert.equal(findAll(draw('UnmatchedOffload', 'Match to leg'), 'Dialog')[0].props.title, 'Match to leg, ZZT 901');
    assert.ok(findAll(draw('UnmatchedOffload', 'Matching'), 'Button').some((b) => b.children.join('') === 'Match to leg' && b.props.loading === true), 'Match to leg shows it is working');
    const close = findAll(draw('UnmatchedOffload', 'Close'), 'ReasonDialog')[0].props;
    assert.deepEqual([close.open, close.label, close.minLength, close.confirmLabel], [true, 'Reason', 10, 'Close']);
    assert.equal(findAll(draw('UnmatchedOffload', 'Closing'), 'ReasonDialog')[0].props.busy, true);
    const matched = draw('UnmatchedOffload', 'Matched');
    assert.ok(!button(matched, 'Match to leg'), 'a matched offload has no actions');
    assert.ok(findAll(matched, 'RecordHighlights')[0].props.fields.some((f) => f.label === 'Matched to leg' && f.value === 'KAL-23'));
    assert.match(words('UnmatchedOffload', 'From the mill portal').join(' | '), /Mill portal[\s\S]*Antelope Mills/);
    assert.doesNotMatch(code(SRC.offloads) + code(SRC.corridor), /'(Mill call|Email|Mill offload sheet|Scanned slip|Mill portal|Mill email|Mill phone call)'/, 'source words come from the component');
  });
});

test('the build publishes the Imports kit, the app screens and the CheckpointTimeline component', { skip: !existsSync(join(ROOT, 'dist')) && 'run npm run build first' }, () => {
  const kitJs = read(join(ROOT, 'dist/ui_kits/imports/ui_kits_imports_index.kit.js'));
  for (const n of ['OperationsHome', 'ImportSchedule', 'TruckLeg', 'DispatchPreview', 'AllocationDrawdown', 'UnmatchedOffloads', 'SkStockByRoute', 'COVERAGE_IN_TRANSIT']) assert.ok(kitJs.includes(n), n);
  assert.ok(read(join(ROOT, 'dist/ui_kits/field_app/ui_kits_field_app_index.kit.js')).includes('RecordOffloadApp'));
  assert.match(read(join(ROOT, 'dist/_ds_bundle.js')), /CheckpointTimeline/);
  assert.ok(JSON.parse(read(join(ROOT, 'dist/cards.json'))).some((c) => c.path === 'ui_kits/imports/index.html' && c.name === 'Imports'));
});
