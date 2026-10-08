// Inbound, gate price and stock screens, M4.DS.01 (UAG-53): the Clerk's inbound queue, the New goods received note
// form, the goods received note record in every state, the variance hold decision, gate prices, transfers and stock
// on the road, the month-end stock take, stock control's stock position, the Clerk's warehouse stock, vehicles and
// transporters in Setup, the over-delivery notice, and the components they introduced: RunningSum,
// ThreeWayReconcile, DecisionActions and TransitResidue. The rules they keep: published components and tokens only,
// no price for the Clerk and only today's gate price for stock control, Source apart from Counterparty status, a
// working state on every button that saves, finalises, decides or closes, and fictional data.
//
//   npm test            (after npm run build, for the published-site check)

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ONE_LINK = join(ROOT, 'project/ui_kits/one_link');
const ADMIN = join(ROOT, 'project/ui_kits/admin_workspace');
const COMPONENTS = join(ROOT, 'project/components');
const read = (p) => readFileSync(p, 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const topLevel = (src) => [...src.matchAll(/^(?:export\s+)?(?:function|const|let)\s+([A-Za-z_]\w*)/gm)].map((m) => m[1]);
const literal = (src, name, open = '\\{', close = '\\}') => {
  const m = src.match(new RegExp(`(?:export )?const ${name} = (${open}[\\s\\S]*?\\n${close});`));
  assert.ok(m, `the source has ${name}`);
  return Function(`return (${m[1]});`)();
};
/** The source of one screen or function, up to the next section rule or the end of the file. */
const fn = (src, name) => {
  const start = src.search(new RegExp(`(?:export )?function ${name}\\(`));
  assert.ok(start >= 0, `${name} is in the source`);
  const next = src.indexOf('\n/* ---', start);
  return src.slice(start, next < 0 ? src.length : next);
};
/** The source of one function only, up to its closing brace. */
const body = (src, name) => {
  const start = src.search(new RegExp(`(?:export )?function ${name}\\(`));
  assert.ok(start >= 0, `${name} is in the source`);
  return src.slice(start, src.indexOf('\n}\n', start));
};
/** String literals and JSX text: the words a reader can meet. */
const shown = (code) => {
  const c = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');
  const strings = [...c.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*)"|`([^`]*)`/g)].map((m) => m[1] ?? m[2] ?? m[3]);
  const text = [...c.matchAll(/>([^<>{}]+)</g)].map((m) => m[1]);
  return [...strings, ...text].map((s) => s.trim()).filter((s) => s && !/^[a-z][A-Za-z0-9-]*$/.test(s) && !/^(var\(|\d+px|minmax|repeat)/.test(s));
};

/** A component compiled and run against a stand-in React that only records the tree: element type (a component's
    name or a tag), props and children. Enough to see what a component draws without a browser. */
function load(file, names, deps = {}) {
  const src = read(join(COMPONENTS, file)).replace(/^import[^\n]*$/gm, '').replace(/^export\s+/gm, '');
  const code = transformSync(src, { loader: 'jsx', jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment' }).code;
  const React = { createElement: (type, props, ...children) => ({ type: typeof type === 'function' ? type.name : type, props: props || {}, children: children.flat() }), Fragment: 'Fragment' };
  const stub = (name) => Object.defineProperty(function () { return null; }, 'name', { value: name });
  const textStyle = () => ({});
  const all = { React, textStyle, Button: stub('Button'), StatusMark: stub('StatusMark'), ShareBar: stub('ShareBar'), ReconcileCard: stub('ReconcileCard'), ...deps };
  return Function(...Object.keys(all), `${code}\nreturn { ${names.join(', ')} };`)(...Object.values(all));
}
/** Every element in a recorded tree. */
const nodes = (n) => (n && typeof n === 'object' ? [n, ...(n.children || []).flatMap(nodes)] : []);
const textOf = (n) => (n == null || typeof n === 'boolean' ? '' : typeof n !== 'object' ? String(n) : (n.children || []).map(textOf).join(''));

const inbound = read(join(ONE_LINK, 'Inbound.jsx'));
const stock = read(join(ONE_LINK, 'StockControl.jsx'));
const gate = read(join(ONE_LINK, 'GatePrice.jsx'));
const tickets = read(join(ONE_LINK, 'Tickets.jsx'));
const vehicles = read(join(ADMIN, 'Vehicles.jsx'));
const INBOUND = literal(inbound, 'INBOUND_STATES');
const STOCK = literal(stock, 'STOCK_CONTROL_STATES');
const GATE = literal(gate, 'GATE_PRICE_STATES');
const VEHICLES = literal(vehicles, 'VEHICLES_STATES');
const TICKETS = literal(tickets, 'TICKETS_STATES');
const NEW = ['records/RunningSum.jsx', 'records/ThreeWayReconcile.jsx', 'records/DecisionActions.jsx', 'records/TransitResidue.jsx'];

const tokens = new Set(walk(join(ROOT, 'project/tokens')).filter((p) => p.endsWith('.css')).flatMap((p) => [...read(p).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])));
const loader = read(join(COMPONENTS, '_loader.js'));
const dsFiles = JSON.parse(loader.match(/var FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
const published = new Set(dsFiles.flatMap((f) => topLevel(read(join(COMPONENTS, f)))));
const kitNames = (dir) => new Set(readdirSync(dir).filter((n) => n.endsWith('.jsx')).flatMap((n) => topLevel(read(join(dir, n)))));
export function compositionProblems(src, kit) {
  const components = new Set([...published, ...kit, ...topLevel(read(join(ONE_LINK, 'Shell.jsx'))), 'React']);
  const problems = [];
  for (const m of src.matchAll(/(^|[\s{;'"`])(--[a-z0-9-]+)['"]?\s*:/g)) problems.push(`defines token ${m[2]}`);
  for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) if (!tokens.has(m[1])) problems.push(`uses unknown token ${m[1]}`);
  for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g)) problems.push(`literal colour ${m[0]}`);
  for (const m of src.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) if (!components.has(m[1])) problems.push(`unknown component <${m[1]}>`);
  return problems;
}
function readmeRows(md) {
  const rows = {};
  for (const line of md.split('\n')) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length !== 3 || cells[0] === 'Screen' || /^-+$/.test(cells[0])) continue;
    rows[cells[0]] = { file: cells[1].replace(/`/g, ''), states: cells[2].split('·').map((s) => s.trim()).filter(Boolean) };
  }
  return rows;
}
/** Money of any kind in a piece of source: a currency, a value, a margin or a buy price. */
const MONEY = /\b(USD|ZMW)\b|\bK\d|Value|Margin|Buy price/;

describe('[M4.DS.01] the screens', () => {
  test('[M4.DS.01] the kit READMEs list every new screen with its file and states, in order (AC 1)', () => {
    const rows = readmeRows(read(join(ONE_LINK, 'README.md')));
    for (const [file, states] of [['Inbound.jsx', INBOUND], ['StockControl.jsx', STOCK], ['GatePrice.jsx', GATE]]) {
      for (const [screen, list] of Object.entries(states)) assert.deepEqual(rows[screen], { file, states: list }, screen);
    }
    assert.deepEqual(rows.ClerkHome.states, TICKETS.ClerkHome, 'the Clerk Home row lists its added states');
    const admin = readmeRows(read(join(ADMIN, 'README.md')));
    for (const [screen, list] of Object.entries(VEHICLES)) assert.deepEqual(admin[screen], { file: 'Vehicles.jsx', states: list }, screen);
  });

  test('[M4.DS.01] every new screen and state opens directly by ?screen=&state=, in its persona\'s frame', () => {
    const index = read(join(ONE_LINK, 'index.html'));
    for (const f of ['Inbound.jsx', 'StockControl.jsx', 'GatePrice.jsx']) assert.ok(index.includes(`'${f}'`), f);
    assert.match(index, /\.\.\.K\.INBOUND_STATES, \.\.\.K\.STOCK_CONTROL_STATES, \.\.\.K\.GATE_PRICE_STATES/);
    assert.match(index, /frame\.who==='stock'\) return <Page nav=\{K\.STOCK_NAV\}/);
    const admin = read(join(ADMIN, 'index.html'));
    assert.ok(admin.includes("'Vehicles.jsx'") && admin.includes('...K.VEHICLES_STATES'));
    const frames = { ...Object.fromEntries(Object.keys(INBOUND).map((s) => [s, 'inboundFrame'])), ...Object.fromEntries(Object.keys(STOCK).map((s) => [s, 'stockControlFrame'])) };
    for (const [screen, f] of Object.entries(frames)) assert.match(fn(f === 'inboundFrame' ? inbound : stock, f), new RegExp(screen === 'WarehouseStock' || screen === 'StockTake' ? 'return \\{ who' : `'${screen}'`), screen);
  });

  test('[M4.DS.01] every inbound, gate price and stock screen composes published components only (token and component audit) (AC 2)', () => {
    for (const [name, src] of [['Inbound.jsx', inbound], ['StockControl.jsx', stock], ['GatePrice.jsx', gate], ['Tickets.jsx', tickets]]) assert.deepEqual(compositionProblems(src, kitNames(ONE_LINK)), [], name);
    assert.deepEqual(compositionProblems(vehicles, kitNames(ADMIN)), [], 'Vehicles.jsx');
    for (const f of NEW) assert.deepEqual(compositionProblems(read(join(COMPONENTS, f)), new Set()), [], f);
  });

  test('the composition audit catches a token defined, an unknown token, a literal colour and an unknown component', () => {
    assert.deepEqual(compositionProblems("const a = <Gauge style={{ '--x-y': 1, color: 'var(--nope)', background: '#ff0000' }} />;", new Set()), ['defines token --x-y', 'uses unknown token --nope', 'literal colour #ff0000', 'unknown component <Gauge>']);
  });

  test('[M4.DS.01] the Clerk\'s Home: counts are filters, not tiles, and the queue draws returned, draft, transfer arriving, aging unreceived and on hold rows, Waiting for as a labelled field, and the empty state (AC 1a)', () => {
    const home = fn(tickets, 'ClerkHome');
    assert.doesNotMatch(home, /<Figure|<FigureStrip|<Card /, 'no KPI tiles');
    assert.match(tickets, /const QUEUE_FILTERS = \[\['Ready', 'ready'\], \['Problem', 'problem'\], \['Stalled', 'stalled'\], \['On hold', 'on-hold'\], \['Drafts', 'draft'\]\];/);
    assert.match(home, /QUEUE_FILTERS\.map\(\(\[label, s\]\) => <Capsule/);
    const queue = literal(tickets, 'QUEUE', '\\[', '\\]');
    for (const [what, row] of [['returned', (q) => /^Returned by .*correct lines and re-finalise/.test(q.detail)], ['weight dispute', (q) => /re-weigh pending/.test(q.detail)],
      ['draft', (q) => q.status === 'draft'], ['transfer arriving', (q) => q.type === 'Transfer' && q.status === 'in-transit'],
      ['aging unreceived', (q) => /^Not received after \d+ operating hours$/.test(q.detail)], ['on hold', (q) => q.status === 'on-hold' && q.waiting === 'T. Mwila or J. Tembo' && !q.action]]) {
      assert.ok(queue.some(row), what);
    }
    assert.match(home, /Waiting for: \{r\.waiting\}/);
    for (const st of ['Empty', 'Weighbridge offline', 'On hold', 'Drafts']) assert.ok(TICKETS.ClerkHome.includes(st), st);
    assert.match(home, /const all = state === 'Empty' \? \[\] : QUEUE;/);
    assert.match(home, /objects="items"/, '"No items to display."');
    assert.match(home, /Last refreshed/);
    assert.doesNotMatch(JSON.stringify(queue), MONEY, 'no price on any queue row');
  });

  test('[M4.DS.01] the New goods received note: ticket, delivery details, lines, reconcile, offload tally in tonnes and bags, Save draft and Finalise (AC 1b)', () => {
    const form = fn(inbound, 'NewGoodsReceivedNote');
    for (const f of ["'Ticket'", "'Truck'", "'Net'", "'Source', 'Weighbridge'", "'Counterparty status'"]) assert.ok(form.includes(f), f);
    for (const f of ['Receipt type', 'Supplier', 'Contract leg', 'Basis', 'Seller', 'On the road', 'Dispatched', 'From', 'Leg', 'Vehicle', 'Offloaded at stack (t)', 'Bags offloaded at stack']) assert.ok(form.includes(`label="${f}"`), f);
    assert.match(form, /'Gate purchase'/);
    const lines = fn(inbound, 'InGrainLines');
    for (const h of ['Commodity', 'Grade', 'Shed', 'Stack', 'Owner', 'Weight (t)']) assert.ok(lines.includes(`label: '${h}'`), h);
    for (const h of ['Product', 'Pack', 'Count (bags)', 'Expected (t)', 'Bay', 'Owner']) assert.ok(form.includes(`label: '${h}'`), h);
    assert.match(form, /<ThreeWayReconcile tolerance="0\.080"/);
    assert.match(form, /\{ label: 'Tolerance, bagged', value: '0\.000 t' \}/, 'bags count exactly');
    assert.match(lines, /<RunningSum total=\{total\} target=\{target\} tolerance="0\.080" \/>/);
    assert.match(form, /loading=\{saving\}[^>]*>Save draft</);
    assert.match(form, /loading=\{finalising\}[^>]*>Finalise</);
    assert.deepEqual(INBOUND.NewGoodsReceivedNote.filter((s) => /beyond|short/.test(s)), ['Grain, beyond tolerance', 'Fertiliser, count short']);
  });

  test('[M4.DS.01] the variance hold: On hold with Waiting for, the approver\'s load with Release hold or Reject with a comment naming the follow-up, stock moving only after the decision, returned, weight dispute with its re-weigh slip, escalated (AC 1c)', () => {
    const grn = fn(inbound, 'GoodsReceivedNote');
    assert.match(grn, /\{ label: 'Waiting for', value: escalated \? 'T\. Mwila' : IN_APPROVERS \}/);
    assert.match(inbound, /const IN_APPROVERS = 'T\. Mwila or J\. Tembo';/);
    const outcomes = literal(inbound, 'VARIANCE_HOLD_OUTCOMES', '\\[', '\\]');
    assert.deepEqual(outcomes.map((o) => o.label), ['Reject', 'Release hold']);
    assert.ok(outcomes.find((o) => o.label === 'Reject').comment, 'Reject needs a comment');
    const load = fn(inbound, 'LoadOnHold');
    assert.match(load, /<DecisionActions outcomes=\{VARIANCE_HOLD_OUTCOMES\} busy=\{busy\} \/>/);
    assert.match(load, /<ReasonDialog title="Reject ABZ 4501\?" label="Comment" minLength=\{1\} confirmLabel="Reject" confirmVariant="critical"/);
    assert.match(load, /Name the follow-up: correct lines, re-weigh or cancel the receipt\./);
    for (const f of ["'Ticket net'", "'Lines total'", "'Variance'", "'Tolerance'", 'label="On hold"']) assert.ok(load.includes(f), f);
    assert.match(load, /\['Stock moved', decision\.moved\]/);
    assert.match(load, /moved: '\+31\.700 t to Shed A, stack A2'/, 'released: stock moves');
    assert.match(load, /moved: 'None\. Returned to S\. Banda\.'/, 'rejected: no stock moves');
    for (const st of ['Returned', 'Re-finalising', 'Weight dispute', 'Re-weigh slip', 'Escalated']) assert.ok(INBOUND.GoodsReceivedNote.includes(st), st);
    assert.match(grn, /title="Lines as finalised"/, 'the original lines stay visible beside the correction');
    assert.match(grn, /<Card title="Re-weigh slip">[\s\S]*\['Source', 'Scanned slip'\]/);
    assert.match(grn, /step: 'Weight dispute', who: IN_APPROVERS, status: 'pending'/);
    assert.match(grn, /step: 'Escalated after 24 hours'/);
  });

  test('[M4.DS.01] gate price in ZMW per t: set, Pending approval, Approved, Rejected, History, and no price in force with its owner; the Clerk sees only Awaiting gate price (AC 1d)', () => {
    for (const st of ['Pending approval', 'Approved', 'Rejected', 'History']) assert.ok(GATE.GatePriceRecord.includes(st), st);
    for (const m of gate.matchAll(/ZMW [\d,.]+(?: per t)?/g)) assert.match(m[0], /^ZMW \d{1,3}(,\d{3})*\.\d{2} per t$/, m[0]);
    assert.match(gate, /label: 'Gate price \(ZMW per t\)'/);
    assert.deepEqual(literal(gate, 'GATE_PRICE_OUTCOMES', '\\[', '\\]').map((o) => o.label), ['Reject', 'Approve']);
    assert.match(fn(gate, 'GatePriceRecord'), /<Refusal action="Approve" reason="You submitted this gate price" \/>/, 'nobody approves their own proposal');
    const none = fn(stock, 'NoPriceInForce');
    assert.match(none, /label="No price in force"/);
    assert.match(none, /Set by \{owner\}/);
    assert.match(fn(gate, 'GatePrices'), /r\.status === 'none' \? <NoPriceInForce \/>/);
    const row = literal(gate, 'GP_ROWS', '\\[', '\\]').find((r) => r.status === 'none');
    assert.equal(row.price, '', 'no zero and no stale price stands in');
    const grn = fn(inbound, 'GoodsReceivedNote');
    assert.match(grn, /\{ label: 'Gate price', value: valued \? 'ZMW 6,800\.00 per t' : <StatusMark kind="attention" label="Awaiting gate price"/);
    assert.equal(fn(inbound, 'inboundFrame').match(/state === 'Gate purchase, valued'\) return \{ who: '(\w+)'/)[1], 'owner', 'the valued note is drawn for a viewer with the price tier');
  });

  test('[M4.DS.01] On the road: leg, truck, route type, product, quantity, dispatch date and age; past the 7-day window is an exception; a transit difference clears within allowance or its residue waits Pending approval (AC 1e)', () => {
    const road = fn(stock, 'OnTheRoad');
    for (const h of ['Leg', 'Truck', 'Route type', 'Product', 'Quantity (t)', 'Dispatched', 'Age']) assert.ok(road.includes(`label: '${h}'`), h);
    assert.match(road, /\{ key: 'route', label: 'Route type', width: '110px' \}/, 'route type is plain text, never a tag');
    assert.match(road, /label=\{`\$\{r\.age\}, past window`\}/);
    assert.match(road, /Clearing window 7 days/);
    const order = fn(stock, 'TransferOrder');
    assert.match(order, /<ReconcileCard title="Transit" outcome=\{cleared \? 'allowance' : 'beyond'\}/);
    assert.match(stock, /allowance: '0\.000', allowanceWords: 'Bagged, none'/, 'bagged product has zero allowance');
    assert.match(order, /<TransitResidue residue=\{diff\} writeOff=\{writeOff\} requesting=\{state === 'Requesting write-off'\} \/>/);
    assert.match(order, /<RefCell>\{r\.grn\}<\/RefCell>/, 'cleared on its goods received note');
  });

  test('[M4.DS.01] the month-end stock take: theoretical against counted, tonnes and per cent to two decimals against 0.20%, Request write-off beyond, the empty Virtual warehouse, a third-party count, adjustments to book (AC 1f)', () => {
    const rows = literal(stock, 'SK_COUNT', '\\[', '\\]');
    for (const r of rows.filter((x) => x.pct)) assert.match(r.pct, /^\d+\.\d{2}%$/, r.pct);
    assert.match(fn(stock, 'StockTake'), /\{ label: 'Tolerance', value: '0\.20%' \}/);
    const v = rows.find((r) => r.bay === 'Virtual warehouse');
    assert.equal(v.theoretical, '0.000');
    assert.equal(v.status, 'empty');
    const take = fn(stock, 'StockTake');
    assert.match(take, /r\.status !== 'exception' \? null/, 'Request write-off only on an exception');
    assert.match(take, /<ReasonDialog title="Request write-off, B2 Foliar Feed 10 L\?" confirmLabel="Request write-off"/);
    assert.match(take, /\['Organisation', 'Copperbelt Surveyors Ltd'\]/);
    assert.match(take, /<EvidenceTile kind="document" caption="count-sheet/);
    assert.deepEqual([...stock.matchAll(/adjustment: '([^']+)'/g)].map((m) => m[1]), ['On hold, not in the book', 'Loaded, not shipped']);
    assert.doesNotMatch(shown(take).join(' | '), /Patricia|Shakil/, 'counts name the role, not people (U-27)');
  });

  test('[M4.DS.01] stock control\'s position: by product and pack size, Physical, Virtual, On the road, Committed, On hold and Free, bags beside, other owners apart, every figure opens Calculation details, no shortfall; the Clerk\'s Warehouse stock by shed and stack with no value (AC 1g)', () => {
    const pos = fn(stock, 'StockPosition');
    for (const h of ['Product', 'Pack', 'Bay', 'Owner', 'Physical (t)', 'Bags or containers', 'Virtual (t)', 'On the road (t)', 'Committed (t)', 'On hold (t)', 'Free (t)']) assert.ok(pos.includes(`label: '${h}'`), h);
    assert.match(pos, /title="Held for other owners"/);
    assert.ok(literal(stock, 'SK_POSITION', '\\[', '\\]').every((r) => r.total || r.owner === 'Own'), 'other owners are never added into ours');
    assert.match(pos, /<CalculationDetails open=\{calc\}/);
    assert.equal((pos.match(/<SkTile /g) || []).length, 4, 'KPI tiles capped at four (UX-08)');
    assert.equal((pos.match(/<SkTile [^>]*onOpen=\{open\} \/>/g) || []).length, 4, 'every tile opens Calculation details');
    assert.match(pos, /render: fig\('physical'\)/);
    assert.doesNotMatch(shown(stock).join(" | "), /[Ss]hortfall|[Dd]emand/, "no shortfall against demand is drawn");
    const ws = fn(inbound, 'WarehouseStock');
    for (const h of ['Shed', 'Stack or bay', 'Commodity', 'Owner', 'In warehouse (t)', 'Bags or containers', 'Free (t)', 'Committed (t)', 'On hold (t)']) assert.ok(ws.includes(`label: '${h}'`), h);
    assert.doesNotMatch(ws + JSON.stringify(literal(inbound, 'IN_STOCK', '\\[', '\\]')), MONEY);
  });

  test('[M4.DS.01] Vehicles and transporters in Setup reference data, with owner-operated and unverified vehicles (AC 1h)', () => {
    const nav = literal(read(join(ADMIN, 'Shell.jsx')), 'SETUP_NAV', '\\[', '\\]');
    const ref = nav.find((g) => g.label === 'Reference data').items.map((i) => i.label);
    assert.deepEqual(ref.slice(-2), ['Vehicles', 'Transporters']);
    assert.deepEqual(ref.slice(0, 2), ['Sites and storage units', 'Corridors and routes'], 'nothing above them moved');
    const list = literal(vehicles, 'VEHICLES', '\\[', '\\]');
    assert.ok(list.some((v) => v.operated === 'Owner-operated' && v.transporter === 'Lakeview Farms Ltd'));
    assert.ok(list.some((v) => v.status === 'Unverified' && v.transporter === '' && v.payload === '16.000'));
    assert.match(fn(vehicles, 'VehiclesList'), /<ListView title="Vehicles"/);
    assert.match(fn(vehicles, 'VehicleRecord'), /<RecordHighlights kind="Vehicle"/);
    assert.match(fn(vehicles, 'VehicleRecord'), /<Refusal action="Delete"/);
  });

  test('[M4.DS.01] the over-delivery notice: the full tonnage books, the notice goes to Owner, Trading and Stock control, any one acknowledges (AC 1i)', () => {
    const grn = fn(inbound, 'GoodsReceivedNote');
    assert.match(grn, /SYN4790 leg A is over-delivered by 10\.060 t\. The full tonnage is booked\./);
    assert.match(grn, /result: 'Over-delivery notice', detail: 'Sent to Owner, Trading and Stock control'/);
    const notice = fn(inbound, 'OverDeliveryNotice');
    for (const f of ['Contracted', 'Delivered', 'Over-delivered', 'Basis']) assert.ok(notice.includes(`label: '${f}'`), f);
    assert.match(notice, /<Button size="small" loading=\{busy\}>Acknowledge</);
    assert.ok(INBOUND.OverDeliveryNotice.includes('Acknowledging'));
  });

  test('[M4.DS.01] a restricted figure draws the dash, never a blank or a zero (AC 3)', () => {
    // AC 3 and UX-09 win over the test's name: a restricted figure on a shared layout is the lock with the tooltip
    // Restricted, never a dash, a blank or a zero; elsewhere the column or field is left out.
    assert.match(fn(inbound, 'OverDeliveryNotice'), /\{ label: 'Value', value: stock \? <Restricted \/> : 'USD 2,861\.06' \}/);
    assert.match(read(join(COMPONENTS, 'data/Restricted.jsx')), /<Icon name="lock"/);
    for (const src of [inbound, stock]) assert.doesNotMatch(src, /RestrictedCell|\u2014/);
  });

  test('[M4.DS.01] the Clerk sees no amount, and today\'s gate price in ZMW per t is the only price stock control sees (AC 3)', () => {
    for (const name of ['NewGoodsReceivedNote', 'WarehouseStock', 'InGrainLines', 'InLinesTable', 'InDecision']) assert.doesNotMatch(shown(body(inbound, name)).join(' | '), MONEY, name);
    const grn = fn(inbound, 'GoodsReceivedNote');
    for (const m of grn.matchAll(/'(ZMW [^']+|USD [^']+)'/g)) assert.match(grn.slice(Math.max(0, m.index - 60), m.index), /valued \?/, `${m[1]} is drawn only when valued`);
    const money = shown(stock).filter((w) => MONEY.test(w));
    assert.deepEqual([...new Set(money)], ['ZMW 6,800.00 per t'], 'stock control meets one price: today\'s gate price');
    assert.match(fn(stock, 'stockControlFrame'), /return \{ who: 'stock', module: 'inventory'/, 'every stock control screen is drawn in stock control\'s frame');
  });

  test('[M4.DS.01] provenance and confirmation draw as two chips (AC 4)', () => {
    // The map makes Source a labelled field and Counterparty status its own field: never merged, never one chip.
    for (const src of [inbound]) {
      assert.doesNotMatch(src, /<ProvenanceChip/);
      const sources = [...src.matchAll(/\['Source', '(Weighbridge|Scanned slip)'\]/g)].length;
      assert.ok(sources >= 4, 'weights name their Source');
    }
    assert.match(fn(inbound, 'NewGoodsReceivedNote'), /\['Source', 'Weighbridge'\], \['Counterparty status', <ConfirmationChip kind=\{ticket\.status\} \/>\]/);
    assert.match(fn(inbound, 'GoodsReceivedNote'), /\['Source', 'Weighbridge'\], \['Counterparty status', <ConfirmationChip kind="disputed" \/>\]/);
  });

  test('[M4.DS.01] every save, finalise, decide and close button draws its working state (AC 5)', () => {
    const working = {
      NewGoodsReceivedNote: ['Saving draft', 'Finalising'], GoodsReceivedNote: ['Re-finalising'], LoadOnHold: ['Rejecting', 'Releasing'],
      OverDeliveryNotice: ['Acknowledging'], WarehouseStock: ['Exporting'], TransferOrder: ['Requesting write-off'], StockTake: ['Requesting write-off'],
      NewGatePrice: ['Submitting'], GatePriceRecord: ['Approving', 'Rejecting'], VehicleRecord: ['Verifying'],
    };
    const all = { ...INBOUND, ...STOCK, ...GATE, ...VEHICLES };
    for (const [screen, list] of Object.entries(working)) for (const st of list) assert.ok(all[screen].includes(st), `${screen} draws ${st}`);
    assert.match(fn(inbound, 'GoodsReceivedNote'), /loading=\{state === 'Re-finalising'\}>Finalise</);
    assert.match(fn(gate, 'NewGatePrice'), /loading=\{busy\}[^>]*>Submit for approval</);
    assert.match(fn(vehicles, 'VehicleRecord'), /loading=\{state === 'Verifying'\}>Verify</);
    assert.match(fn(stock, 'StockTake'), /loading=\{requesting\}>Request write-off</);
  });

  test('[M4.DS.01] a record reference is a blue link only where the viewer can open the record (AC 9)', () => {
    const grn = fn(inbound, 'GoodsReceivedNote');
    assert.match(grn, /\{ label: 'Supplier', value: 'Cameron Estates' \}, \{ label: 'Contract leg', value: 'SYN4702 leg B' \}/, 'plain text for the Clerk');
    assert.match(grn, /\{ label: 'Ticket', value: 'WBT10001606', link: '#' \}/);
    assert.match(grn, /valued \? \{ label: 'Seller', value: 'Chongwe Growers', link: '#' \} : \{ label: 'Seller', value: 'Chongwe Growers' \}/);
    assert.match(fn(inbound, 'LoadOnHold'), /\{ label: 'Supplier', value: 'Cameron Estates', link: '#' \}, \{ label: 'Contract', value: 'SYN4702 leg B', link: '#' \}/);
    assert.match(fn(inbound, 'OverDeliveryNotice'), /stock \? \{ label: 'Supplier', value: 'Cameron Estates' \} : \{ label: 'Supplier', value: 'Cameron Estates', link: '#' \}/);
    assert.match(fn(tickets, 'ClerkHome'), /r\.link \? .*<RefCell>\{r\.item\}<\/RefCell>/);
  });

  test('[M4.DS.01] every screen that shows a contract shows its basis, Delivered or Collected', () => {
    for (const [src, name] of [[inbound, 'NewGoodsReceivedNote'], [inbound, 'GoodsReceivedNote'], [inbound, 'LoadOnHold'], [inbound, 'OverDeliveryNotice']]) {
      assert.match(fn(src, name), /(label="Basis"|label: 'Basis')/, name);
    }
    assert.match(inbound, /label: 'Basis', value: 'Collected'/);
    assert.match(inbound, /label: 'Basis', value: 'Delivered'/);
  });

  test('[M4.DS.01] sample data is the golden synthetic set, people are fictional, public copy never says UAG, and no em dash', () => {
    const all = [inbound, stock, gate, vehicles, ...NEW.map((f) => read(join(COMPONENTS, f)))];
    for (const src of all) assert.doesNotMatch(shown(src).join(' | '), /\bUAG\b|United African Grain|National Milling|Zambeef|\bOwen\b|\bJacques\b|\bRyan\b/);
    for (const src of [...all, read(join(ONE_LINK, 'README.md'))]) assert.doesNotMatch(src, /\u2014| \u2013 /);
    for (const n of ['SYN4702', 'SYN4790', 'Lakeview Farms Ltd', 'Cameron Estates', 'Riverbend Milling', 'Chisamba Shed', 'Mpongwe Depot']) assert.ok(all.join('').includes(n), n);
    assert.match(inbound, /tolerance="0\.080"/, 'the pack default, 80 kg on a weight pair');
    assert.doesNotMatch(inbound + stock, /0\.5 MT/);
  });

  test('the build publishes the new screens, components and card', { skip: !existsSync(join(ROOT, 'dist')) && 'run npm run build first' }, () => {
    const kit = read(join(ROOT, 'dist/ui_kits/one_link/ui_kits_one_link_index.kit.js'));
    for (const screen of [...Object.keys(INBOUND), ...Object.keys(STOCK), ...Object.keys(GATE)]) assert.ok(kit.includes(screen), `${screen} is compiled`);
    const admin = read(join(ROOT, 'dist/ui_kits/admin_workspace/ui_kits_admin_workspace_index.kit.js'));
    for (const screen of Object.keys(VEHICLES)) assert.ok(admin.includes(screen), `${screen} is compiled`);
    const ds = read(join(ROOT, 'dist/_ds_bundle.js'));
    for (const c of ['RunningSum', 'ThreeWayReconcile', 'DecisionActions', 'TransitResidue', 'threeWayCheck', 'runningSumState']) assert.ok(ds.includes(c), `${c} is compiled`);
    assert.ok(existsSync(join(ROOT, 'dist/components/records/inbound.card.html')));
  });
});

describe('[M4.DS.01] the components', () => {
  const { thousandths, tonnes, runningSumState, RunningSum } = load('records/RunningSum.jsx', ['thousandths', 'tonnes', 'runningSumState', 'RunningSum']);
  const { threeWayCheck, ThreeWayReconcile } = load('records/ThreeWayReconcile.jsx', ['threeWayCheck', 'ThreeWayReconcile'], { thousandths, tonnes });
  const { DecisionActions } = load('records/DecisionActions.jsx', ['DecisionActions']);
  const { TransitResidue, WRITE_OFF_MARKS } = load('records/TransitResidue.jsx', ['TransitResidue', 'WRITE_OFF_MARKS']);

  test('[M4.DS.01] a running-sum meter shows within, beyond and exact states against its target', () => {
    assert.equal(runningSumState('32.140', '32.140', '0.080'), 'exact');
    assert.equal(runningSumState('32.060', '32.140', '0.080'), 'within');
    assert.equal(runningSumState('32.060', '32.140', '0.080'), 'within', 'exactly at the tolerance is within');
    assert.equal(runningSumState('32.059', '32.140', '0.080'), 'beyond');
    assert.equal(runningSumState('31.700', '32.140', '0.080'), 'beyond');
    assert.equal(runningSumState('29.960', '30.060', '0'), 'beyond', 'bagged product: zero tolerance');
    assert.equal(tonnes(thousandths('0.1') + thousandths('0.2')), '0.300', 'sums stay exact to three decimals');
    const marks = (el) => nodes(el).filter((n) => n.type === 'StatusMark').map((n) => n.props.label);
    assert.deepEqual(marks(RunningSum({ total: '32.140', target: '32.140', tolerance: '0.080' })), ['Exact']);
    assert.deepEqual(marks(RunningSum({ total: '32.060', target: '32.140', tolerance: '0.080' })), ['Within tolerance']);
    const beyond = RunningSum({ total: '31.700', target: '32.140', tolerance: '0.080' });
    assert.deepEqual(marks(beyond), ['Beyond tolerance']);
    assert.match(textOf(beyond), /31\.700 t of 32\.140 t ticket net/);
    assert.match(textOf(beyond), /Difference 0\.440 t/);
    assert.equal(nodes(beyond).find((n) => n.type === 'ShareBar').props.share, 31700 / 32140);
  });

  test('[M4.DS.01] a three-figure reconcile panel names which pair is out and by how much', () => {
    const held = threeWayCheck(['32.140', '31.700', '31.700'], '0.080');
    assert.equal(held.outcome, 'beyond');
    assert.equal(held.variance, 440);
    assert.deepEqual(held.pairs.filter((p) => p.out).map((p) => [p.a, p.b, p.diff]), [[0, 1, 440], [0, 2, 440]]);
    const tally = threeWayCheck(['32.140', '32.100', '31.900'], '0.080');
    assert.deepEqual(tally.pairs.filter((p) => p.out).map((p) => [p.a, p.b, p.diff]), [[0, 2, 240], [1, 2, 200]], 'only the tally is out');
    assert.equal(threeWayCheck(['32.140', '32.060', '32.060'], '0.080').outcome, 'within');
    const figures = [{ label: 'Ticket net', value: '32.140' }, { label: 'Lines total', value: '32.100' }, { label: 'Offload tally', value: '31.900' }];
    const card = ThreeWayReconcile({ figures, tolerance: '0.080' });
    assert.equal(card.type, 'ReconcileCard');
    assert.equal(card.props.outcome, 'beyond');
    const rows = card.props.rows.map((r) => [textOf(r.label) || r.label, r.value, !!r.strong]);
    assert.deepEqual(rows, [
      ['Ticket net', '32.140 t', false], ['Lines total', '32.100 t', false], ['Offload tally', '31.900 t', false],
      ['Variance', '0.240 t', true], ['Tolerance', '0.080 t', false],
      ['Ticket net against offload tally', '0.240 t', false], ['Lines total against offload tally', '0.200 t', false],
    ]);
    const within = ThreeWayReconcile({ figures: figures.map((f) => ({ ...f, value: '32.140' })), tolerance: '0.080' });
    assert.equal(within.props.outcome, 'within');
    assert.equal(within.props.rows.length, 5, 'no pair row when every pair agrees');
  });

  test('[M4.DS.01] a decision panel draws exactly the outcomes it is given, never a hard-coded three', () => {
    const buttons = (el) => nodes(el).filter((n) => n.type === 'Button');
    const two = [{ value: 'reject', label: 'Reject', variant: 'critical', comment: true }, { value: 'release', label: 'Release hold', variant: 'primary' }];
    assert.deepEqual(buttons(DecisionActions({ outcomes: two })).map((b) => textOf(b)), ['Reject', 'Release hold']);
    const five = [...two, { value: 'return', label: 'Return' }, { value: 'dry', label: 'Dry' }, { value: 'divert', label: 'Divert' }];
    assert.deepEqual(buttons(DecisionActions({ outcomes: five })).map((b) => b.props['data-outcome']), ['reject', 'release', 'return', 'dry', 'divert']);
    assert.deepEqual(buttons(DecisionActions({ outcomes: [two[1]] })).map((b) => textOf(b)), ['Release hold']);
    assert.equal(buttons(DecisionActions({ outcomes: [] })).length, 0);
    const busy = buttons(DecisionActions({ outcomes: two, busy: 'release' }));
    assert.deepEqual(busy.map((b) => [b.props.loading, b.props.disabled]), [[false, true], [true, false]], 'the outcome being saved works; the others wait');
    assert.deepEqual(buttons(DecisionActions({ outcomes: two })).map((b) => b.props.variant), ['critical-ghost', 'primary']);
  });

  test('[M4.DS.01] a transit residue row draws its write-off as awaiting approval, never as done', () => {
    const marks = (el) => nodes(el).filter((n) => n.type === 'StatusMark').map((n) => n.props.label);
    const buttons = (el) => nodes(el).filter((n) => n.type === 'Button');
    const pending = TransitResidue({ residue: '0.300', writeOff: 'pending' });
    assert.deepEqual(marks(pending), ['Pending approval']);
    assert.equal(buttons(pending).length, 0);
    assert.doesNotMatch(textOf(pending), /[Ww]ritten off|Approved|Done/);
    const none = TransitResidue({ residue: '0.300' });
    assert.deepEqual(buttons(none).map((b) => textOf(b)), ['Request write-off']);
    assert.equal(buttons(TransitResidue({ residue: '0.300', requesting: true }))[0].props.loading, true);
    assert.deepEqual(marks(TransitResidue({ residue: '0.300', writeOff: 'approved' })), ['Approved']);
    assert.deepEqual(Object.values(WRITE_OFF_MARKS).map((m) => m.word), ['Pending approval', 'Approved', 'Rejected']);
  });

  test('[M4.DS.01] every new component has its types, a usage note, a loader entry and a place on the components card', () => {
    const card = read(join(COMPONENTS, 'records/inbound.card.html'));
    for (const f of NEW) {
      const c = f.replace(/^records\/|\.jsx$/g, '');
      for (const ext of ['.jsx', '.d.ts', '.prompt.md']) assert.ok(existsSync(join(COMPONENTS, 'records', c + ext)), c + ext);
      assert.ok(dsFiles.includes(f), `${c} is in the loader`);
      assert.ok(card.includes(`<${c}`), `${c} is on the card`);
    }
  });
});
