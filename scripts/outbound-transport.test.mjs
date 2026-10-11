// Outbound and transport screens, M4.DS.02 (UAG-184): the Outbound tab of the Clerk's Home, the New loading order with
// its load builder, the loading order record, the New delivery note and the delivery note record from weighed out to
// proof of delivery, Ryan's Delivery notes and direct delivery capture, the capacity warning on inbound weighing, and
// Ashraf's Home, Loads that need a truck, Transport planning, Day plan, Transporters and their upload preview; and the
// components they introduced: LoadMeter, CountMatch, OutboundReconcile, VarianceReconcile and ProofOfDelivery. The
// rules they keep: published components and tokens only, no price for the Clerk or stock control, Source apart from
// Counterparty status, a working state on every button that commits, ships, closes or overrides, and fictional data.
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
  const all = { React, textStyle, Button: stub('Button'), StatusMark: stub('StatusMark'), ShareBar: stub('ShareBar'), ReconcileCard: stub('ReconcileCard'), Card: stub('Card'), DataTable: stub('DataTable'), ...deps };
  return Function(...Object.keys(all), `${code}\nreturn { ${names.join(', ')} };`)(...Object.values(all));
}
const nodes = (n) => (n && typeof n === 'object' ? [n, ...(n.children || []).flatMap(nodes)] : []);
const textOf = (n) => (n == null || typeof n === 'boolean' ? '' : typeof n !== 'object' ? String(n) : (n.children || []).map(textOf).join(''));

const outbound = read(join(ONE_LINK, 'Outbound.jsx'));
const transport = read(join(ONE_LINK, 'Transport.jsx'));
const inbound = read(join(ONE_LINK, 'Inbound.jsx'));
const tickets = read(join(ONE_LINK, 'Tickets.jsx'));
const stockControl = read(join(ONE_LINK, 'StockControl.jsx'));
const OUT = literal(outbound, 'OUTBOUND_STATES');
const TRP = literal(transport, 'TRANSPORT_STATES');
const INBOUND = literal(inbound, 'INBOUND_STATES');
const NEW = ['records/LoadMeter.jsx', 'records/CountMatch.jsx', 'records/OutboundReconcile.jsx', 'records/VarianceReconcile.jsx', 'records/ProofOfDelivery.jsx'];

const tokens = new Set(walk(join(ROOT, 'project/tokens')).filter((p) => p.endsWith('.css')).flatMap((p) => [...read(p).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])));
const loader = read(join(COMPONENTS, '_loader.js'));
const dsFiles = JSON.parse(loader.match(/var FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
const published = new Set(dsFiles.flatMap((f) => topLevel(read(join(COMPONENTS, f)))));
const kitNames = new Set(readdirSync(ONE_LINK).filter((n) => n.endsWith('.jsx')).flatMap((n) => topLevel(read(join(ONE_LINK, n)))));
/** Problems with a piece of source: a token defined or unknown, a literal colour, a component that is neither
    published nor a kit helper. */
function compositionProblems(src, kit) {
  const components = new Set([...published, ...kit, 'React']);
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
/** Money of any kind in a piece of source: a currency, a price, a value, a margin. */
const MONEY = /\b(USD|ZMW)\b|\bK\d|Value|Margin|[Pp]rice\b/;

describe('[M4.DS.02] the screens', () => {
  test('[M4.DS.02] the Operations kit lists every outbound and transport screen with its file and states, in order (AC 1)', () => {
    const rows = readmeRows(read(join(ONE_LINK, 'README.md')));
    for (const [file, states] of [['Outbound.jsx', OUT], ['Transport.jsx', TRP]]) {
      for (const [screen, list] of Object.entries(states)) assert.deepEqual(rows[screen], { file, states: list }, screen);
    }
    assert.deepEqual(rows.NewGoodsReceivedNote.states, INBOUND.NewGoodsReceivedNote, 'the inbound form lists its capacity state');
  });

  test('[M4.DS.02] every new screen and state opens directly by ?screen=&state=, in its persona\'s frame', () => {
    const index = read(join(ONE_LINK, 'index.html'));
    for (const f of ['Outbound.jsx', 'Transport.jsx']) assert.ok(index.includes(`'${f}'`), f);
    assert.match(index, /\.\.\.K\.OUTBOUND_STATES, \.\.\.K\.TRANSPORT_STATES/);
    assert.match(index, /K\.OUTBOUND_STATES\[screen\] \? K\.outboundFrame\(screen, state\) : K\.TRANSPORT_STATES\[screen\] \? K\.transportFrame\(screen, state\)/);
    assert.match(index, /frame\.who==='jacques'\) return <Page nav=\{K\.TRADING_NAV\}/);
    assert.match(index, /frame\.who==='transport'\) return <Page nav=\{K\.TRANSPORT_NAV\}/);
    for (const screen of Object.keys(OUT)) assert.ok(fn(outbound, 'outboundFrame').includes(`'${screen}'`) || screen === 'DirectDelivery', screen);
    for (const screen of Object.keys(TRP)) assert.ok(fn(transport, 'transportFrame').includes(`'${screen}'`) || screen === 'Transporters', screen);
    // Navigation entries are added after the existing ones; nothing moved (Henry's ruling of 30 Sep 2026).
    assert.match(tickets, /sections: \[\{ value: 'tickets', label: 'Weighbridge tickets' \}, \{ value: 'received', label: 'Goods received' \}, \{ value: 'loading', label: 'Loading orders' \}, \{ value: 'delivery', label: 'Delivery notes' \}\]/);
    assert.match(stockControl, /\{ value: 'road', label: 'On the road' \}, \{ value: 'transfers', label: 'Transfer orders' \}, \{ value: 'loading', label: 'Loading orders' \}/);
  });

  test('[M4.DS.02] every outbound screen composes published components only (token and component audit) (AC 2)', () => {
    for (const [name, src] of [['Outbound.jsx', outbound], ['Inbound.jsx', inbound], ['Tickets.jsx', tickets]]) assert.deepEqual(compositionProblems(src, kitNames), [], name);
    for (const f of NEW) assert.deepEqual(compositionProblems(read(join(COMPONENTS, f)), new Set()), [], f);
    assert.deepEqual(compositionProblems(read(join(COMPONENTS, 'records/ReconcileCard.jsx')), new Set()), [], 'ReconcileCard');
  });

  test('[M4.DS.02] transport planning and the transporter upload compose published components only (AC 8)', () => {
    assert.deepEqual(compositionProblems(transport, kitNames), []);
    assert.match(fn(transport, 'TransportersUpload'), /<ImportPreview status=\{status\} statusWord="map"/, 'the upload preview is the import preview (UX-25)');
    assert.deepEqual(TRP.TransportPlanning, ['By farm', 'By contract', 'Day plan']);
    const plan = fn(transport, 'TransportPlanning');
    for (const h of ['Left (t)', 'Planned (t)', 'Still to plan (t)', 'Trucks a day', 'Left to deliver (t)', 'Transporter', 'Truck', 'Order or contract']) assert.ok(plan.includes(`label: '${h}'`), h);
    for (const t of ['Loads without a truck', 'Trucks planned today', 'Tonnes still to plan']) assert.ok(fn(transport, 'TransportHome').includes(`label="${t}"`), t);
    const list = fn(transport, 'Transporters');
    assert.doesNotMatch(list, /<Button/, 'transporters, trucks and rates are read only');
    assert.deepEqual(TRP.Transporters, ['Transporters', 'Trucks', 'Rates']);
    assert.doesNotMatch(shown(transport).join(' | '), /[Mm]issed load/, 'missed loads are not drawn');
  });

  test('[M4.DS.02] the loading order: New form, Committed with its delivery point and truck, Ashraf\'s queue and Assign truck, Commit refused, closed within tolerance and short, and the clerk\'s Ready to load with Create delivery note only (AC 1a)', () => {
    const form = fn(outbound, 'NewLoadingOrder');
    for (const f of ['Customer', 'Delivery point', 'Maximum order weight (t)', 'Sale contract']) assert.ok(form.includes(`label="${f}"`), f);
    assert.match(form, /loading=\{saving\}[^>]*>Save draft</);
    assert.match(form, /loading=\{committing\}[^>]*>Commit</);
    assert.match(form, /<Refusal action="Commit" reason="Stock not received" \/>/, '"Commit is not allowed. Stock not received."');
    assert.equal(outboundFrameWho('NewLoadingOrder', 'Grain'), 'jacques');
    assert.equal(outboundFrameWho('NewLoadingOrder', 'Within maximum'), 'stock');
    const record = fn(outbound, 'LoadingOrder');
    assert.match(record, /\{ label: 'Delivery point', value: 'Lakeview Farms farm gate' \}/);
    assert.match(record, /\['Transporter', 'Kafue Transport Ltd'\], \['Truck', 'ABZ 4412'\], \['Loading weight', '30\.000 t'\], \['Assigned by', 'A\. Mwale, 26 Sep 2026, 08:10'\]/);
    assert.match(record, /if \(clerk\) actions = <Button size="small">Create delivery note<\/Button>;/);
    assert.match(record, /\['Reason', 'Customer took less'\]/);
    assert.match(record, /\{ label: 'Shortfall', value: '2\.000 t' \}/);
    assert.match(record, /\['Closed by', 'One Link, within the outbound tolerance'\]/);
    assert.match(record, /<ReasonDialog title=\{`Close \$\{o\.ref\} short\?`\} confirmLabel="Close" minLength=\{1\} busy=\{state === 'Closing'\}/);
    assert.equal(outboundFrameWho('LoadingOrder', 'Ready to load'), 'clerk');
    // The clerk never raises or commits an order (Map D-37): none of his frame's outbound states offers Commit.
    const clerkCommit = shown(body(outbound, 'LoadingOrder')).filter((w) => w === 'Commit');
    assert.deepEqual(clerkCommit, [], 'the loading order record offers no Commit');
    const queue = fn(transport, 'LoadsNeedTruck');
    assert.match(queue, /label: 'Needs a truck'/);
    assert.match(queue, /label: 'Truck assigned'/);
    assert.ok(TRP.LoadsNeedTruck.includes('Assign truck') && TRP.LoadsNeedTruck.includes('Over the legal payload'));
    assert.match(queue, /<Dialog title="Assign truck, LO-2241"/);
    assert.match(queue, /\{over \? <Field label="Reason" required>/, 'over the legal payload asks for a reason');
    assert.match(queue, /loading=\{assigning\} disabled=\{state === 'Over the legal payload'\}>Assign</);
  });

  test('[M4.DS.02] the delivery note ships from the order with nothing retyped: truck confirmed from the ticket, Weighbridge ticket, Reconcile; weighed out, superseded weighing, shipped, returned and cancelled before ship (AC 1b)', () => {
    const form = fn(outbound, 'NewDeliveryNote');
    assert.match(form, /\['Loading order', <RefCell>\{g\.lo\}<\/RefCell>\], \['Customer', 'Riverbend Milling'\]/, 'carried from the order as fields, not inputs');
    assert.match(form, /\['Truck', g\.truck\], \['Confirmed from', <RefCell>\{g\.ticket\}<\/RefCell>\]/);
    assert.match(form, /<ObWeighings ticket=\{g\.ticket\}/);
    assert.match(form, /<OutboundReconcile ordered=\{g\.ordered\} loaded=\{g\.net\} net=\{g\.net\} tolerance=\{OB_TOL\} \/>/);
    assert.match(outbound, /const OB_TOL = '0\.080';/);
    for (const st of ['Ready to dispatch', 'Superseded weighing', 'Shipped', 'Reversed', 'Closed']) assert.ok(OUT.DeliveryNote.includes(st), st);
    assert.match(fn(outbound, 'DeliveryNote'), /superseded: true, weighing: 'Second weighing, gross: tarpaulin left on the scale'/);
    assert.match(fn(outbound, 'ObWeighings'), /r\.superseded \? obMark\('neutral', 'Superseded'\)/);
    // The delivery note list settled in the Clerk batch (UX-32), and On hold for a held direct delivery.
    const marks = [...outbound.matchAll(/obMark\('\w+', '([^']+)'\)/g)].map((m) => m[1]);
    for (const w of ['Draft', 'Ready to dispatch', 'Shipped', 'Proof missing', 'Delivered', 'Delivery refused', 'Variance flagged', 'Reversed', 'Closed']) assert.ok(marks.includes(w), w);
  });

  test('[M4.DS.02] the load builder: theoretical weight from pack weight or volume and density, Within maximum, Approaching, At maximum and Over with Commit disabled; the grain note\'s legal payload override needs a reason (AC 1c)', () => {
    const form = fn(outbound, 'NewLoadingOrder');
    assert.match(form, /label: 'Weight from'/);
    assert.match(outbound, /from: 'Pack weight', unit: '50\.10'/);
    assert.match(outbound, /from: 'Volume and density', unit: '12\.00'/);
    assert.match(form, /<LoadMeter label=\{null\} total=\{total\} limit=\{limit\} approachShare=\{OB_APPROACH\}/);
    assert.match(outbound, /const OB_APPROACH = 0\.95;/);
    assert.match(form, /disabled=\{over \|\| saving\}>Commit</, 'Over disables Commit');
    assert.deepEqual(OUT.NewLoadingOrder.slice(0, 4), ['Within maximum', 'Approaching', 'At maximum', 'Over']);
    const sums = Object.fromEntries(Object.entries(literal(outbound, 'OB_LINES')).map(([k, lines]) => [k, lines.reduce((n, l) => n + Math.round(parseFloat(l.weight) * 1000), 0)]));
    assert.deepEqual(sums, { within: 27240, approaching: 29400, at: 30000, over: 30255 });
    const nd = fn(outbound, 'NewDeliveryNote');
    assert.match(nd, /<ReasonDialog title=\{`Override legal payload on \$\{g\.lo\}\?`\} confirmLabel="Override" minLength=\{1\} busy=\{overriding\}/);
    assert.match(nd, /disabled=\{over \|\| saving\}>Ship</);
    assert.match(fn(outbound, 'ObPayload'), /\['Override reason', override\], \['Near-miss', 'Recorded'\]/);
  });

  test('[M4.DS.02] the bag count against the count sheet: matches, mismatch blocking Ship with its message, supervised recount, no warn mode (AC 1d)', () => {
    const form = fn(outbound, 'NewDeliveryNote');
    assert.match(form, /mark=\{<CountMatch sheet="400" loaded=\{loadedBags\} \/>\}/);
    assert.match(form, /<Refusal action="Ship" reason=\{bagCountReason\('400', loadedBags\)\} \/>/);
    assert.match(form, /disabled=\{blocked \|\| saving\}>Ship</);
    assert.match(form, /count: 'Supervised recount', by: 'Stock control', bags: '400'/);
    assert.match(form, /\['Counted by', 'Stock control'\]/, 'counts name the role, not a person (U-27)');
    assert.deepEqual(OUT.NewDeliveryNote.filter((s) => /count|Fertiliser/i.test(s)), ['Fertiliser', 'Bag count mismatch', 'Supervised recount']);
  });

  test('[M4.DS.02] direct delivery for Ryan: one capture makes the linked notes, Reconcile of bags, a count difference to Ryan, On hold, the Virtual warehouse capture (AC 1e)', () => {
    const dd = fn(outbound, 'DirectDelivery');
    for (const l of ['Bags dispatched', 'Bags received', 'Difference', 'Tonnes', 'Quantity source']) assert.ok(dd.includes(`label: '${l}'`), l);
    assert.match(dd, /value: 'Supplier document, Farmer confirmation'/);
    assert.match(dd, /\{ label: 'Exception', value: 'Count difference, owner Stock control' \}/);
    assert.match(dd, /type: 'Goods received note', ref: 'GRN10000392'[\s\S]*type: 'Delivery note', ref: 'DN-0892'/);
    assert.match(dd, /\['Ticket', <RefCell>WBT10001631<\/RefCell>\]/, 'the pass-through truck\'s one ticket');
    assert.equal(outboundFrameWho('DirectDelivery', 'Counts match'), 'stock', 'Ryan, never the clerk');
    assert.match(dd, /\[\['Route', 'Direct'\]|\['Route', 'Direct'\]/);
    assert.doesNotMatch(dd, /<span[^>]*background/, 'Route is plain text, never a tag (UX-26)');
  });

  test('[M4.DS.02] a held direct delivery draws its delivery note as held awaiting decision', () => {
    const dd = fn(outbound, 'DirectDelivery');
    assert.match(dd, /\{ id: 'n2', type: 'Delivery note', ref: 'DN-0893', into: 'Lakeview Farms farm gate', tonnes: '29\.100', status: 'on-hold' \}/);
    assert.match(dd, /s === 'on-hold' \? obMark\('attention', 'On hold'\)/);
    assert.match(dd, /\{ label: 'Waiting for', value: 'T\. Mwila or J\. Tembo' \}/);
    assert.match(dd, /status=\{held \? obMark\('attention', 'On hold'\)/);
  });

  test('[M4.DS.02] the outbound queue kit draws every state M4.QUE.02 lists, including bag count mismatch blocking ship, capacity override pending, transfer order ready to dispatch and weighed out but not shipped (AC 1)', () => {
    const queue = literal(outbound, 'OUTBOUND_QUEUE', '\\[', '\\]');
    const marks = literal(outbound, 'OUTBOUND_MARKS');
    const words = queue.map((q) => marks[q.status].word);
    // M4.QUE.02 AC 8's order (Clerk batch words), Pending sync beside In review.
    const order = ['Short load', 'Refused', 'Slip unconfirmed', 'Count mismatch', 'Variance flagged', 'Over legal payload', 'Proof missing', 'Price changed', 'Below plan', 'Window ended', 'Ready to load', 'Ready to load', 'Ready to dispatch', 'In review', 'Pending sync', 'Ready to load', 'Ready to load'];
    assert.deepEqual(words, order);
    assert.ok(queue.some((q) => q.status === 'count-mismatch' && /bag count 399, count sheet 400/.test(q.detail)), 'bag count mismatch blocking ship');
    assert.ok(queue.some((q) => q.status === 'over-payload') && queue.some((q) => q.status === 'variance-flagged' && q.waiting === 'R. Daka'), 'capacity override pending');
    assert.ok(queue.some((q) => q.type === 'Transfer' && q.status === 'ready-to-load'), 'transfer order ready to dispatch');
    assert.ok(queue.some((q) => q.status === 'ready-to-dispatch' && /weighed out/.test(q.detail)), 'weighed out but not shipped');
    assert.ok(queue.some((q) => q.status === 'ready-to-load' && q.aged), 'aging: Ready to load with its Age');
    for (const m of Object.values(marks)) assert.ok(m.word.split(' ').length <= 2 || m.word === 'Ready to dispatch' || m.word === 'Over legal payload' || m.word === 'Ready to load', m.word);
    assert.match(outbound, /export const OUTBOUND_FILTERS = \[\['Loading orders due', 'ready-to-load'\], \['Ready to dispatch', 'ready-to-dispatch'\], \['Proof missing', 'proof-missing'\]\];/);
    const home = fn(outbound, 'ClerkOutbound');
    assert.doesNotMatch(home, /<Figure|<TpTile|<SkTile/, 'counts are filters, not KPI tiles (UX-08)');
    assert.match(home, /OUTBOUND_FILTERS\.map\(\(\[label, s\]\) => <Capsule/);
    assert.match(home, /const all = state === 'Empty' \? \[\] : OUTBOUND_QUEUE;/);
    assert.ok(queue.filter((q) => q.type === 'Loading order' && q.status === 'ready-to-load').every((q) => /Truck [A-Z]{3} \d{4}, /.test(q.detail)), 'orders show their assigned truck and transporter');
    // Price changed is a status word with no figures (M4.QUE.02 AC 3); no row carries an amount, a value or a margin.
    assert.doesNotMatch(queue.map((q) => q.detail).join(' | '), MONEY, 'no price on any queue row');
    assert.match(tickets, /count: OUTBOUND_QUEUE\.length/, 'the Inbound tab counts the outbound queue');
  });

  test('[M4.DS.02] a proof panel on the delivery note\'s Details tab: Delivered, Proof missing with its banner, Pending sync, In review, Delivery refused, received beside shipped, superseded proof (AC 1g)', () => {
    const dn = fn(outbound, 'DeliveryNote');
    for (const st of ['Delivered', 'Proof missing', 'Pending sync', 'In review', 'Delivery refused', 'Received beside shipped', 'Superseded proof']) assert.ok(OUT.DeliveryNote.includes(st), st);
    assert.match(dn, /<ProofOfDelivery items=\{p\.items\}/);
    assert.match(dn, /if \(state === 'Proof missing'\) banner = <ConditionBanner>Proof of delivery not received after 1 day\.<\/ConditionBanner>;/);
    const proof = fn(outbound, 'obProof');
    for (const i of ["item: 'Photograph'", "item: 'Receiver signature'", "item: 'Receiver name'"]) assert.ok(proof.includes(i), i);
    assert.match(proof, /\['Shipped', '34\.020 t'\], \['Received', '33\.880 t'\]/);
    assert.match(proof, /status: 'superseded'/);
  });

  test('[M4.DS.02] capacity warning on inbound and outbound weighing, and the fertiliser weighbridge variance: Variance flagged, Ship not allowed, Override variance for Ryan only with a reason (AC 1h)', () => {
    assert.ok(INBOUND.NewGoodsReceivedNote.includes('Grain, over legal payload'));
    assert.match(fn(inbound, 'NewGoodsReceivedNote'), /<LoadMeter kind="payload" label="Ticket net" total=\{ticket\.net\} limit="34\.000"/);
    assert.match(fn(inbound, 'NewGoodsReceivedNote'), /\['Receipt', 'Not blocked'\], \['Near-miss', 'Recorded on finalise'\]/, 'a receipt is never blocked for capacity');
    const dn = fn(outbound, 'DeliveryNote');
    assert.match(dn, /<VarianceReconcile theoretical="27\.240" net=\{net\} allowedPct=\{1\}/);
    assert.match(dn, /<Refusal action="Ship" reason="Weighbridge net is beyond the allowed variance" \/>/);
    assert.match(dn, /if \(ryan\) actions = <Button size="small" loading=\{state === 'Overriding variance'\}>Override variance<\/Button>;/);
    assert.match(dn, /else actions = <Button size="small" disabled=\{flagged\}>Ship<\/Button>;/, 'the clerk has no override');
    assert.match(dn, /<ReasonDialog title="Override variance, DN-0884" confirmLabel="Override" minLength=\{1\}/, 'Override is enabled once a reason is entered (UX-22)');
    for (const st of ['Variance flagged', 'Override variance', 'Overriding variance']) assert.equal(outboundFrameWho('DeliveryNote', st), 'stock', st);
    assert.equal(outboundFrameWho('DeliveryNote', 'Variance flagged, clerk'), 'clerk');
  });

  test('[M4.DS.02] margin and committed value draw the restricted dash for clerk and stock control (AC 3)', () => {
    // AC 3 and UX-09 win over the test's name, as on M4.DS.01: on the Clerk's and stock control's layouts the field is
    // left out; on a layout shared with a viewer who holds the tier, a viewer without it sees the lock (Restricted).
    for (const name of ['ClerkOutbound', 'NewDeliveryNote', 'DirectDelivery', 'DeliveryNotes', 'ObWeighings', 'ObPayload', 'ObLines']) assert.doesNotMatch(shown(body(outbound, name)).join(' | '), MONEY, name);
    const fert = fn(outbound, 'NewLoadingOrder');
    assert.doesNotMatch(shown(fert.slice(fert.indexOf('const lines = OB_LINES[key]'))).join(' | '), MONEY, 'Ryan\'s load builder');
    const lo = fn(outbound, 'LoadingOrder');
    assert.match(lo, /\.\.\.\(trading \? \[\{ label: 'Committed value', value: 'USD 9,669\.60' \}\] : transport \? \[\{ label: 'Committed value', value: <Restricted \/> \}\] : \[\]\)/);
    assert.match(fn(outbound, 'DeliveryNote'), /if \(trading\) fields = \[\.\.\.fields, \{ label: 'Sell price', value: 'USD 284\.40 per t' \}, \{ label: 'Value', value: 'USD 9,703\.73' \}\];/);
    assert.equal(outboundFrameWho('DeliveryNote', 'Trading view'), 'jacques');
    assert.equal(outboundFrameWho('LoadingOrder', 'Transport view'), 'transport');
    assert.doesNotMatch(outbound + transport, /RestrictedCell|\u2014/, 'no dash');
    assert.doesNotMatch(shown(outbound + transport).join(' | '), /[Mm]argin/, 'margin is parked (UAG-195): never drawn');
  });

  test('[M4.DS.02] provenance and confirmation draw as two chips (AC 4)', () => {
    assert.doesNotMatch(outbound + transport, /<ProvenanceChip/);
    assert.ok([...outbound.matchAll(/\['Source', '(Weighbridge|Scanned slip)'\]|source: 'Weighbridge'/g)].length >= 6, 'weights name their Source');
    assert.match(fn(outbound, 'NewDeliveryNote'), /\['Counterparty status', <ConfirmationChip kind="pending" \/>\]/);
    assert.match(fn(outbound, 'obProof'), /\['Source', 'Scanned slip'\], \['Counterparty status', <ConfirmationChip kind="confirmed" \/>\]/);
    assert.match(fn(outbound, 'DirectDelivery'), /\['Source', 'Weighbridge'\], \['Counterparty status', <ConfirmationChip kind="pending" \/>\]/);
  });

  test('[M4.DS.02] every commit, ship and override button draws its working state (AC 5)', () => {
    const working = {
      NewLoadingOrder: ['Saving draft', 'Committing'], LoadingOrder: ['Closing'], NewDeliveryNote: ['Overriding', 'Saving draft', 'Shipping'],
      DeliveryNote: ['Shipping', 'Overriding variance'], DeliveryNotes: ['Exporting'], DirectDelivery: ['Finalising'],
    };
    for (const [screen, list] of Object.entries(working)) for (const st of list) assert.ok(OUT[screen].includes(st), `${screen} draws ${st}`);
    assert.ok(TRP.LoadsNeedTruck.includes('Assigning') && TRP.TransportersUpload.includes('Importing'));
    assert.match(fn(outbound, 'NewLoadingOrder'), /loading=\{committing\}[^>]*>Commit</);
    assert.match(fn(outbound, 'NewDeliveryNote'), /loading=\{shipping\}[^>]*>Ship</);
    assert.match(fn(outbound, 'NewDeliveryNote'), /busy=\{overriding\}/);
    assert.match(fn(outbound, 'DeliveryNote'), /loading=\{state === 'Shipping'\}>Ship</);
    assert.match(fn(outbound, 'DeliveryNote'), /busy=\{state === 'Overriding variance'\}/);
    assert.match(fn(outbound, 'DirectDelivery'), /loading=\{finalising\}>Finalise</);
    assert.match(fn(transport, 'TransportersUpload'), /importing=\{state === 'Importing'\}/);
  });

  test('[M4.DS.02] verify:design stays green after design-system:sync: no token is defined or changed, every token used exists (AC 7)', () => {
    // design-system:sync vendors project/tokens; this card adds no token, font or asset, so the app's check meets the
    // same files. Every var() the new screens and components use is a published token.
    for (const src of [outbound, transport, ...NEW.map((f) => read(join(COMPONENTS, f)))]) {
      for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) assert.ok(tokens.has(m[1]), m[1]);
      assert.doesNotMatch(src, /(^|[\s{;'"`])--[a-z0-9-]+['"]?\s*:/m, 'no token defined');
    }
  });

  test('[M4.DS.02] a record reference is a blue link only where the viewer can open the record (AC 10)', () => {
    const home = fn(outbound, 'ClerkOutbound');
    assert.match(home, /<RefCell>\{r\.item\}<\/RefCell>/);
    assert.ok(literal(outbound, 'OUTBOUND_QUEUE', '\\[', '\\]').every((q) => !/RefCell/.test(q.detail)), 'customers stay plain text in the detail');
    const lo = fn(outbound, 'LoadingOrder');
    assert.match(lo, /const contract = trading \? \{ label: 'Sale contract', value: 'SYN4702', link: '#' \} : \{ label: 'Sale contract', value: 'SYN4702' \};/);
    assert.match(lo, /fields = \[\{ label: 'Customer', value: 'Riverbend Milling' \}, contract/);
    assert.match(lo, /fields = \[\{ label: 'Customer', value: 'Lakeview Farms Ltd' \}/, 'Ryan reads the customer as plain text (UX-01)');
    assert.match(fn(outbound, 'DeliveryNotes'), /\{ key: 'customer', label: 'Customer', width: 'minmax\(160px, 1fr\)' \}/);
    assert.match(fn(outbound, 'DeliveryNotes'), /\{ key: 'route', label: 'Route', width: '100px' \}/, 'Route is plain text (UX-26)');
    assert.match(fn(transport, 'TransportHome'), /render: \(r\) => <RefCell>\{r\.contract\}<\/RefCell>[\s\S]*\{ key: 'buyer', label: 'Buyer', width: 'minmax\(150px, 1fr\)' \}/);
  });

  test('[M4.DS.02] sample data is fictional, people are fictional, public copy never says UAG, and no em dash', () => {
    const all = [outbound, transport, ...NEW.map((f) => read(join(COMPONENTS, f)))];
    for (const src of all) assert.doesNotMatch(shown(src).join(' | '), /\bUAG\b|United African Grain|National Milling|Royal Milling|Zambeef|\bOwen\b|\bJacques\b|\bRyan\b|\bAshraf\b|\bAlka\b|Patricia|Afil/);
    for (const src of [...all, read(join(ONE_LINK, 'README.md')), read(join(COMPONENTS, 'records/outbound.card.html'))]) assert.doesNotMatch(src, /\u2014| \u2013 /);
    for (const n of ['SYN4702', 'SYN4790', 'Riverbend Milling', 'Lakeview Farms Ltd', 'Cameron Estates', 'Chisamba Shed']) assert.ok(all.join('').includes(n), n);
  });

  test('the build publishes the new screens, components and card', { skip: !existsSync(join(ROOT, 'dist')) && 'run npm run build first' }, () => {
    const kit = read(join(ROOT, 'dist/ui_kits/one_link/ui_kits_one_link_index.kit.js'));
    for (const screen of [...Object.keys(OUT), ...Object.keys(TRP)]) assert.ok(kit.includes(screen), `${screen} is compiled`);
    const ds = read(join(ROOT, 'dist/_ds_bundle.js'));
    for (const c of ['LoadMeter', 'loadState', 'CountMatch', 'bagCountState', 'OutboundReconcile', 'outboundCheck', 'VarianceReconcile', 'weighbridgeVariance', 'ProofOfDelivery', 'proofState']) assert.ok(ds.includes(c), `${c} is compiled`);
    assert.ok(existsSync(join(ROOT, 'dist/components/records/outbound.card.html')));
  });
});

/** Whose frame a screen state opens in, read from outboundFrame without a browser. */
function outboundFrameWho(screen, state) {
  const src = ['obLoFor', 'obDnFor', 'obDirectFor', 'outboundFrame'].map((n) => body(outbound, n) + '\n}').join('\n');
  const consts = outbound.match(/const OB_LO = [^\n]+\nconst OB_DN = [^\n]+\nconst OB_STOCK_DN = [^\n]+/)[0];
  const code = transformSync(`${consts}\n${src.replace(/^export /gm, '')}\nreturn outboundFrame;`, { loader: 'js' }).code;
  return Function(code)()(screen, state).who;
}

describe('[M4.DS.02] the components', () => {
  const { thousandths, tonnes } = load('records/RunningSum.jsx', ['thousandths', 'tonnes']);
  const { loadState, loadUsed, LoadMeter, LOAD_MARKS } = load('records/LoadMeter.jsx', ['loadState', 'loadUsed', 'LoadMeter', 'LOAD_MARKS'], { thousandths, tonnes });
  const { bagCountState, bagCountReason, CountMatch } = load('records/CountMatch.jsx', ['bagCountState', 'bagCountReason', 'CountMatch']);
  const { outboundCheck, OutboundReconcile } = load('records/OutboundReconcile.jsx', ['outboundCheck', 'OutboundReconcile'], { thousandths, tonnes });
  const { weighbridgeVariance, variancePct, VarianceReconcile } = load('records/VarianceReconcile.jsx', ['weighbridgeVariance', 'variancePct', 'VarianceReconcile'], { thousandths, tonnes });
  const { proofState, ProofOfDelivery } = load('records/ProofOfDelivery.jsx', ['proofState', 'ProofOfDelivery']);
  const marks = (el) => nodes(el).filter((n) => n.type === 'StatusMark').map((n) => n.props.label);

  test('[M4.DS.02] a payload bar shows approaching from the configured share, at payload at 100% and over above 100%', () => {
    assert.equal(loadState('27.240', '30.000', 0.95), 'within');
    assert.equal(loadState('28.499', '30.000', 0.95), 'within', 'just under 95%');
    assert.equal(loadState('28.500', '30.000', 0.95), 'approaching', 'from exactly the share');
    assert.equal(loadState('29.400', '30.000', 0.9), 'approaching');
    assert.equal(loadState('27.000', '30.000', 0.9), 'approaching', 'the share is an input, not a constant');
    assert.equal(loadState('26.999', '30.000', 0.9), 'within');
    assert.equal(loadState('30.000', '30.000', 0.95), 'at', 'exactly the limit is At, never Over');
    assert.equal(loadState('30.001', '30.000', 0.95), 'over');
    assert.equal(loadState('34.000', '34.000'), 'at');
    assert.equal(loadUsed('29.990', '30.000'), '99%', 'never 100% below the limit');
    assert.equal(loadUsed('30.000', '30.000'), '100%');
    assert.equal(loadUsed('30.010', '30.000'), '101%', 'never 100% above it');
    assert.equal(loadUsed('27.240', '30.000'), '91%');
    assert.deepEqual(marks(LoadMeter({ total: '30.000', limit: '30.000' })), ['At maximum']);
    assert.deepEqual(marks(LoadMeter({ total: '30.255', limit: '30.000' })), ['Over by 0.255 t']);
    assert.deepEqual(marks(LoadMeter({ total: '29.500', limit: '30.000' })), ['Approaching']);
    assert.deepEqual(marks(LoadMeter({ total: '36.200', limit: '34.000', kind: 'payload' })), ['Over legal payload']);
    assert.deepEqual(marks(LoadMeter({ total: '34.000', limit: '34.000', kind: 'payload' })), ['At legal payload']);
    assert.deepEqual(Object.values(LOAD_MARKS.order).map((m) => m.word), ['Within maximum', 'Approaching', 'At maximum', 'Over']);
    const bar = nodes(LoadMeter({ total: '27.240', limit: '30.000' })).find((n) => n.type === 'ShareBar');
    assert.equal(bar.props.share, 27240 / 30000);
  });

  test('[M4.DS.02] a count match chip never shows matched when counts differ by one', () => {
    assert.equal(bagCountState('400', '400'), 'matches');
    assert.equal(bagCountState('400', '399'), 'mismatch');
    assert.equal(bagCountState('400', '401'), 'mismatch');
    assert.equal(bagCountState('1,200', '1,199'), 'mismatch');
    assert.equal(bagCountState('400', ''), 'mismatch', 'a missing count is never a match');
    assert.deepEqual(marks(CountMatch({ sheet: '400', loaded: '399' })), ['Count mismatch']);
    assert.deepEqual(marks(CountMatch({ sheet: '400', loaded: '400' })), ['Count sheet matches']);
    assert.equal(`Ship is not allowed. ${bagCountReason('400', '399')}.`, 'Ship is not allowed. Bag count 399 does not match count sheet 400.');
  });

  test('[M4.DS.02] a proof panel draws in review and delivery refused as distinct states from proof missing', () => {
    const three = (status) => ['Photograph', 'Receiver signature', 'Receiver name'].map((item) => ({ item, status }));
    assert.equal(proofState(three('missing')), 'missing');
    assert.equal(proofState(three('in-review')), 'in-review');
    assert.equal(proofState([...three('missing').slice(0, 2), { item: 'Receiver name', status: 'refused' }]), 'refused');
    assert.equal(proofState(three('pending-sync')), 'pending-sync');
    assert.equal(proofState(three('received')), 'delivered');
    assert.equal(proofState(three('awaiting')), 'awaiting');
    assert.equal(proofState([{ item: 'Photograph', status: 'superseded' }, ...three('received')]), 'delivered', 'a superseded capture never counts');
    const head = (items) => ProofOfDelivery({ items }).props.headerRight.props.label;
    assert.deepEqual([head(three('missing')), head(three('in-review')), head(three('refused')), head(three('pending-sync')), head(three('received'))],
      ['Proof missing', 'In review', 'Delivery refused', 'Pending sync', 'Delivered']);
    const table = nodes(ProofOfDelivery({ items: three('missing') })).find((n) => n.type === 'DataTable');
    assert.deepEqual(table.props.rows.map((r) => r.item), ['Photograph', 'Receiver signature', 'Receiver name']);
  });

  test('[M4.DS.02] an outbound reconcile shows ordered, loaded and ticket net side by side and names the pair that is out', () => {
    assert.equal(outboundCheck({ ordered: '34.000', loaded: '34.120', net: '34.120', tolerance: '0.080' }).outcome, 'within');
    assert.equal(outboundCheck({ ordered: '34.000', loaded: '34.120', net: '34.040', tolerance: '0.080' }).outcome, 'within', 'exactly the tolerance');
    assert.equal(outboundCheck({ ordered: '34.000', loaded: '34.120', net: '33.940', tolerance: '0.080' }).outcome, 'beyond');
    assert.equal(outboundCheck({ ordered: '34.000', loaded: '32.000', net: '32.020', tolerance: '0.080' }).outcome, 'within', 'below plan is not a tolerance');
    const card = OutboundReconcile({ ordered: '34.000', loaded: '34.120', net: '33.940', tolerance: '0.080' });
    assert.equal(card.type, 'ReconcileCard');
    assert.equal(card.props.outcome, 'beyond');
    assert.deepEqual(card.props.rows.map((r) => [textOf(r.label) || r.label, r.value]), [
      ['Ordered', '34.000 t'], ['Loaded', '34.120 t'], ['Ticket net', '33.940 t'], ['Variance', '0.180 t'], ['Tolerance', '0.080 t'],
      ['Loaded against ticket net', '0.180 t'], ['Ordered against loaded', '0.120 t'],
    ]);
  });

  test('[M4.DS.02] the weighbridge variance flags beyond the allowed per cent, never at it', () => {
    assert.equal(weighbridgeVariance('27.240', '27.610', 1).flagged, true);
    assert.equal(weighbridgeVariance('27.240', '27.380', 1).flagged, false);
    assert.equal(weighbridgeVariance('25.000', '25.250', 1).flagged, false, 'exactly 1.0% is within');
    assert.equal(weighbridgeVariance('25.000', '25.251', 1).flagged, true);
    assert.equal(weighbridgeVariance('25.000', '24.749', 1).flagged, true, 'light as well as heavy');
    assert.equal(variancePct(1.358, 1), '1.4%');
    assert.equal(variancePct(0.193, 0.5), '0.19%', 'two decimals below 1% (UX-13)');
    const card = VarianceReconcile({ theoretical: '27.240', net: '27.610', allowedPct: 1 });
    assert.deepEqual(card.props.rows.map((r) => [r.label, r.value]).slice(0, 4), [['Theoretical weight', '27.240 t'], ['Weighbridge net', '27.610 t'], ['Difference', '+0.370 t, 1.4%'], ['Allowed variance', '1.0%']]);
    assert.equal(card.props.mark.props.label, 'Variance flagged');
    assert.equal(VarianceReconcile({ theoretical: '27.240', net: '27.380', allowedPct: 1 }).props.mark, null);
  });

  test('[M4.DS.02] every new component has its types, a usage note, a loader entry and a place on the components card', () => {
    const card = read(join(COMPONENTS, 'records/outbound.card.html'));
    for (const f of NEW) {
      const c = f.replace(/^records\/|\.jsx$/g, '');
      for (const ext of ['.jsx', '.d.ts', '.prompt.md']) assert.ok(existsSync(join(COMPONENTS, 'records', c + ext)), c + ext);
      assert.ok(dsFiles.includes(f), `${c} is in the loader`);
      assert.ok(dsFiles.indexOf(f) > dsFiles.indexOf('records/RunningSum.jsx') && dsFiles.indexOf(f) > dsFiles.indexOf('records/ReconcileCard.jsx'), `${c} loads after what it composes`);
      assert.ok(card.includes(`<${c}`), `${c} is on the card`);
    }
    assert.match(read(join(COMPONENTS, 'records/ReconcileCard.d.ts')), /mark\?: React\.ReactNode;/);
    assert.match(read(join(COMPONENTS, 'records/ReconcileCard.jsx')), /\{mark \|\| <StatusMark kind=\{o\.kind\} label=\{status \|\| o\.word\} \/>\}/, 'without mark, drawn as before');
  });
});
