// Weighbridge continuity, M2.DS.01 (UAG-32): the Clerk's continuity screens and the Exceptions screens in the One
// Link kit, the components they introduced, and the rules they keep: the source is a labelled field and never a chip,
// no weight without its photo, no money on a weighbridge screen, S57 words, and a working state on every button that
// saves, confirms or acknowledges.
//
//   npm test            (after npm run build, for the published-site check)

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KIT = join(ROOT, 'project/ui_kits/one_link');
const COMPONENTS = join(ROOT, 'project/components');
const read = (p) => readFileSync(p, 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const topLevel = (src) => [...src.matchAll(/^(?:export\s+)?(?:function|const|let)\s+([A-Za-z_]\w*)/gm)].map((m) => m[1]);
const literal = (src, name, open = '\\{', close = '\\}', prelude = '') => {
  const m = src.match(new RegExp(`(?:export )?const ${name} = (${open}[\\s\\S]*?\\n${close});`));
  assert.ok(m, `the source has ${name}`);
  return Function(`${prelude}return (${m[1]});`)();
};
/** The source of one exported screen, up to the next section rule. */
const fn = (src, name) => {
  const start = src.indexOf(`export function ${name}(`);
  assert.ok(start >= 0, `${name} is exported`);
  const next = src.indexOf('\n/* ---', start);
  return src.slice(start, next < 0 ? src.length : next);
};
/** String literals and JSX text: the words a reader can meet. */
const shown = (code) => {
  const c = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const strings = [...c.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*)"|`([^`]*)`/g)].map((m) => m[1] ?? m[2] ?? m[3]);
  const text = [...c.matchAll(/>([^<>{}]+)</g)].map((m) => m[1]);
  return [...strings, ...text].map((s) => s.trim()).filter((s) => s && !/^[a-z][A-Za-z0-9-]*$/.test(s) && !/^(var\(|\d+px|minmax|repeat)/.test(s));
};

const FILES = { tickets: join(KIT, 'Tickets.jsx'), exceptions: join(KIT, 'Exceptions.jsx') };
const tickets = read(FILES.tickets);
const exceptions = read(FILES.exceptions);
const SCREENS = [
  { file: 'Tickets.jsx', src: tickets, states: literal(tickets, 'TICKETS_STATES') },
  { file: 'Exceptions.jsx', src: exceptions, states: literal(exceptions, 'EXCEPTIONS_STATES') },
];

const tokens = new Set(walk(join(ROOT, 'project/tokens')).filter((p) => p.endsWith('.css')).flatMap((p) => [...read(p).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])));
const loader = read(join(COMPONENTS, '_loader.js'));
const dsFiles = JSON.parse(loader.match(/var FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
const published = new Set(dsFiles.flatMap((f) => topLevel(read(join(COMPONENTS, f)))));
const kitNames = new Set(['Shell.jsx', 'Tickets.jsx', 'Exceptions.jsx'].flatMap((f) => topLevel(read(join(KIT, f)))));
const components = new Set([...published, ...kitNames, 'React']);

function compositionProblems(src) {
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

describe('[M2.DS.01] weighbridge continuity screens', () => {
  test('[M2.DS.01] the One Link kit README lists every continuity screen with its file and states, in order', () => {
    const rows = readmeRows(read(join(KIT, 'README.md')));
    for (const { file, src, states } of SCREENS) {
      for (const [screen, list] of Object.entries(states)) {
        assert.ok(rows[screen], `${screen} has a README row`);
        assert.equal(rows[screen].file, file, `${screen} names its file`);
        assert.deepEqual(rows[screen].states, list, `${screen} lists its states in order`);
        assert.match(src, new RegExp(`export function ${screen}\\(`), `${screen} is exported`);
      }
    }
  });

  test('[M2.DS.01] the kit index opens every continuity screen and state by ?screen=&state=', () => {
    const index = read(join(KIT, 'index.html'));
    for (const f of ['Tickets.jsx', 'Exceptions.jsx']) assert.ok(index.includes(`'${f}'`), `${f} is loaded`);
    assert.match(index, /K\.TICKETS_STATES, \.\.\.K\.EXCEPTIONS_STATES/);
    assert.match(index, /params\.get\('screen'\)/);
    assert.match(index, /params\.get\('state'\)/);
  });

  test('[M2.DS.01] every continuity screen composes published components and tokens only, with no bespoke colour', () => {
    for (const p of Object.values(FILES)) assert.deepEqual(compositionProblems(read(p)), [], p);
  });

  test('the composition audit catches a token defined, an unknown token, a literal colour and an unknown component', () => {
    assert.deepEqual(compositionProblems("const a = <Gauge style={{ '--x-y': 1, color: 'var(--nope)', background: '#ff0000' }} />;"), ['defines token --x-y', 'uses unknown token --nope', 'literal colour #ff0000', 'unknown component <Gauge>']);
  });

  test('[M2.DS.01] the Weighbridge tickets list keeps default, delayed, offline and empty, and gains stalled, scanned slip site and closed (AC 1)', () => {
    const states = literal(tickets, 'TICKETS_STATES').TicketsList;
    for (const s of ['All', 'Delayed', 'Offline', 'Empty', 'Stalled', 'Scanned slip site', 'Closed', 'One site and date']) assert.ok(states.includes(s), s);
    const list = fn(tickets, 'TicketsList');
    assert.match(list, /objects="weighbridge tickets"/, 'empty reads "No weighbridge tickets to display."');
    assert.match(tickets, /Chisamba Shed weighbridge is offline since 09:10 CAT\./);
    assert.ok(literal(tickets, 'WB_STALLED', '\\[', '\\]').every((r) => /^\d+ operating hours?$/.test(r.age)), 'a stalled ticket carries its age in operating hours');
    assert.match(tickets, /reason: 'Truck left without weighing out'/);
    assert.match(list, /slipSite \? <>.*Weight source Scanned slip/s, 'a scanned slip site shows its weight source, not a connection status');
  });

  test('[M2.DS.01] the one-site-and-date list has Gross (t), Tare (t), Net (t), Source and Status, a Total row and Export as a secondary button (AC 6c)', () => {
    for (const h of ["'Gross (t)'", "'Tare (t)'", "'Net (t)'", "label: 'Source'", "label: 'Status'"]) assert.ok(tickets.includes(h), h);
    const day = literal(tickets, 'WB_DAY', '\\[', '\\]');
    const total = day.find((r) => r.total);
    assert.ok(total, 'a Total row');
    const sum = (k) => day.filter((r) => !r.total).reduce((n, r) => n + Number(r[k]), 0).toFixed(3);
    for (const k of ['gross', 'tare', 'net']) assert.equal(total[k], sum(k), `the Total of ${k} adds up`);
    assert.match(fn(tickets, 'TicketsList'), /<Button variant="outline" size="small" icon="download" loading=\{state === 'Exporting'\}>Export<\/Button>/);
  });

  test('[M2.DS.01] the Scanned slip screen draws every reading state (AC 2 a to i)', () => {
    const states = literal(tickets, 'TICKETS_STATES').ScannedSlip;
    assert.deepEqual(states, ['Read clearly', 'Check', 'Corrected', 'Net disagrees', 'Tare at or above gross', 'Photo already used', 'Confirming', 'Reading', 'Pending reading', 'Reading failed', 'Second confirmation', 'Second confirmation, first confirmer', 'Withdraw']);
    const slip = fn(tickets, 'ScannedSlip');
    assert.match(slip, /<Refusal action="Confirm weights" reason="Tare must be less than gross" \/>/);
    assert.match(slip, /<Refusal action="Confirm weights" reason="This photo is already used on WBT\d+" \/>/);
    assert.match(slip, /Reading failed\. Take the photo again\./);
    assert.match(slip, /<ReadinessChip kind="pending-reading" \/>/, 'Pending reading is a status with no sentence');
    assert.match(slip, /<Icon name="loader-circle"[^>]*spin \/>/, 'reading in progress is a spinner with no text');
    for (const f of ['Ticket number', 'Direction', 'Vehicle', 'Driver', 'Supplier as printed', 'Weigh-in time', 'Weigh-out time', 'Gross (t)', 'Tare (t)', 'Printed net (t)']) assert.ok(tickets.includes(`label: '${f}'`), f);
    assert.match(slip, /\['Source', 'Scanned slip'\], \['Photographed by', [^\]]+\], \['Photographed', [^\]]+\], \['Direction', [^\]]+\]/, 'the Ticket source card');
  });

  test('[M2.DS.01] no kit screen offers a weight input without an evidence tile beside it (screen audit)', () => {
    for (const f of readdirSync(KIT).filter((n) => n.endsWith('.jsx'))) {
      const src = read(join(KIT, f));
      for (const name of topLevel(src)) {
        const start = src.search(new RegExp(`function ${name}\\(`));
        if (start < 0) continue;
        const body = src.slice(start, src.indexOf('\n}\n', start));
        if (/<FieldCheck[^>]*evidence=/.test(body)) assert.match(body, /<EvidenceViewer /, `${f} ${name} draws the photo beside its FieldCheck`);
        for (const m of body.matchAll(/<Field label="([^"]+)"/g)) assert.doesNotMatch(m[1], /gross|tare|net|weight|\(t\)/i, `${f} ${name} offers a typed weight: ${m[1]}`);
      }
    }
    const check = read(join(COMPONENTS, 'records/FieldCheck.jsx'));
    assert.match(check, /const editable = !!evidence;/);
    assert.match(check, /const confirmed = \(f\) => editable \? \(/, 'without evidence the Confirmed column is read only');
  });

  test('[M2.DS.01] readiness and provenance render as separate chips on ticket detail (AC 3, 7)', () => {
    const record = fn(tickets, 'TicketRecord');
    assert.match(record, /status=\{<ReadinessChip kind=\{t\.readiness\} \/>\}/, 'readiness is the status beside the number');
    assert.match(record, /\{ label: 'Source', value: t\.source \}/, 'the source is the labelled field Source');
    assert.match(record, /\['Counterparty status', <ConfirmationChip kind="confirmed" \/>\]/, 'agreement is its own field');
    assert.doesNotMatch(tickets, /<ProvenanceChip/, 'the source is never a chip on a weighbridge screen');
    assert.match(record, /Corrected from photo/);
    assert.match(record, /Keep recorded weights/);
    assert.match(record, /fingerprint=\{SLIP_PRINT\}/);
  });

  test('[M2.DS.01] the ticket History tab has Field, User, Old value, New value and Date, covering arrival, completion from a slip, confirmation and closing', () => {
    for (const h of ["label: 'Field'", "label: 'User'", "label: 'Old value'", "label: 'New value'", "label: 'Date (CAT)'"]) assert.ok(fn(tickets, 'TicketRecord').includes(h), h);
    const all = [...literal(tickets, 'HISTORY_SLIP', '\\[', '\\]'), ...literal(tickets, 'HISTORY_CLOSED', '\\[', '\\]')].map((r) => r.reason).join(' | ');
    for (const r of ['Arrived from the weighbridge', 'Completed from a scanned slip', 'Truck left without weighing out']) assert.ok(all.includes(r), r);
    assert.ok(literal(tickets, 'HISTORY_SLIP', '\\[', '\\]').some((r) => r.field === 'Counterparty status' && r.next === 'Confirmed'));
  });

  test('[M2.DS.01] the close-as-not-completed dialog is titled with the ticket and cannot save without a reason (AC 5)', () => {
    assert.match(fn(tickets, 'TicketsList'), /<ReasonDialog title="Close WBT10001599\?" confirmLabel="Close" minLength=\{1\}/);
    const dialog = read(join(COMPONENTS, 'feedback/ReasonDialog.jsx'));
    assert.match(dialog, /width=\{480\}/);
    assert.match(dialog, /disabled=\{short\}/);
    assert.match(dialog, />Cancel</);
  });

  test('[M2.DS.01] Clerk Home draws Problem rows for a slip photo not read yet and a refused feed record, each with its age and Close (AC 6a)', () => {
    const queue = literal(tickets, 'QUEUE', '\\[', '\\]');
    for (const type of ['Slip photo', 'Weighbridge record']) {
      const row = queue.find((q) => q.type === type);
      assert.ok(row, type);
      assert.equal(row.status, 'problem');
      assert.equal(row.action, 'Close');
      assert.ok(row.age);
    }
    assert.match(fn(tickets, 'ClerkHome'), /<ReasonDialog title="Close weighbridge record 10001611\?" confirmLabel="Close" minLength=\{1\}/);
  });

  test('[M2.DS.01] feed health shows Connection status, Last ticket, Last batch, and Imported, Duplicate and Failed (AC 6b)', () => {
    const health = fn(tickets, 'FeedHealth');
    for (const w of ["'Connection status'", "'Last ticket'", "'Last batch'", '"Imported today"', '"Duplicate"', '"Failed"']) assert.ok(health.includes(w), w);
    assert.deepEqual(literal(tickets, 'TICKETS_STATES').FeedHealth, ['Connected', 'Delayed', 'Offline']);
  });

  test('[M2.DS.01] the Setup kit draws the Weight source switch per site with its value in force, pending change and Connection status (AC 6d)', () => {
    const settings = read(join(ROOT, 'project/ui_kits/admin_workspace/Settings.jsx'));
    assert.ok(literal(settings, 'SETTINGS_STATES').SwitchesList.includes('Weight source per site'));
    const rows = literal(settings, 'WEIGHT_SOURCES', '\\[', '\\]', 'const ACTIVE = null, PENDING = null;').map((r) => ({ ...r, status: undefined }));
    for (const site of ['Chisamba Shed', 'Mpongwe Depot', 'Site A gate']) assert.ok(rows.some((r) => r.scope === site), site);
    assert.ok(rows.some((r) => r.pending), 'a pending change');
    assert.ok(rows.every((r) => (r.inForce === 'Scanned slip' ? r.connection === '' : ['Connected', 'Delayed', 'Offline'].includes(r.connection))), 'a weighbridge site shows its Connection status, a slip site none');
  });

  test('[M2.DS.01] no price or money appears on any weighbridge screen', () => {
    const words = shown(tickets).join(' | ');
    assert.doesNotMatch(words, /\bUSD\b|\bZMW\b|\bK\d|\bprice\b|value at risk|margin/i);
  });

  test('[M2.DS.01] the owner variant of an exception row renders no provenance, sync or ticket-reference text (kit data)', () => {
    const rows = literal(exceptions, 'EXCEPTION_ROWS', '\\[', '\\]');
    for (const r of rows) assert.doesNotMatch(`${r.business} | ${r.businessRecord}`, /sync|feed|batch|queue|ocr|provenance|scanned|slip|source|WBT\d|ticket/i, r.id);
    assert.ok(rows.some((r) => r.business === 'Chisamba Shed weighbridge is offline since 09:10 CAT.'));
    const list = read(join(COMPONENTS, 'records/ExceptionList.jsx'));
    assert.match(list, /const title = \(r\) => \(owner \? r\.business : r\.title\);/);
    assert.match(list, /const record = \(r\) => \(owner \? r\.businessRecord : r\.record\);/);
    assert.match(list, /priceTier \? \[\{ key: 'value', label: 'Value at risk \(USD\)'/);
    assert.match(list, /No exceptions to display\./);
    assert.doesNotMatch(list, /SeverityTag/, 'severity is the type and the order, never a coloured tag');
  });

  test('[M2.DS.01] Exceptions read Open, Acknowledged and Closed; Acknowledge has an optional note and its working state (AC 4)', () => {
    assert.match(read(join(COMPONENTS, 'records/ExceptionList.jsx')), /open: \{ kind: 'breach', label: 'Open' \}, acknowledged: \{ kind: 'pending', label: 'Acknowledged' \}, closed: \{ kind: 'clean', label: 'Closed' \}/);
    const record = fn(exceptions, 'ExceptionRecord');
    assert.match(record, /<Field label="Note">/, 'the note is optional');
    assert.match(record, /<Button size="small" loading=\{busy\}>Acknowledge<\/Button>/);
    assert.match(exceptions, /next: 'Acknowledged'/);
    assert.match(exceptions, /next: 'Closed'/);
    assert.match(fn(exceptions, 'ExceptionsList'), /<WbHead title="Exceptions" count=\{rows\.length\} \/>/, 'the empty list keeps its title and count 0');
  });

  test('[M2.DS.01] every button that saves, confirms, closes, acknowledges, receives or exports has a working state drawn (AC 9)', () => {
    const states = { ...literal(tickets, 'TICKETS_STATES'), ...literal(exceptions, 'EXCEPTIONS_STATES') };
    const working = { ClerkHome: 'Closing problem', TicketsList: 'Closing', ScannedSlip: 'Confirming', TicketRecord: 'Keeping weights', ExceptionRecord: 'Acknowledging' };
    for (const [screen, st] of Object.entries(working)) assert.ok(states[screen].includes(st), `${screen} draws ${st}`);
    assert.ok(states.TicketRecord.includes('Receiving') && states.TicketsList.includes('Exporting'));
    assert.match(tickets, /loading=\{confirming\}>Confirm weights/);
    assert.match(tickets, /loading=\{state === 'Receiving'\}>Receive/);
    assert.match(tickets, /loading=\{state === 'Keeping weights'\}>Keep recorded weights/);
  });

  test('[M2.DS.01] sample data is the golden synthetic set and public copy never says UAG', () => {
    const both = tickets + exceptions;
    assert.doesNotMatch(shown(both).join(' | '), /\bUAG\b|United African Grain|National Milling|Zambeef/);
    for (const name of ['Chisamba Shed', 'Mpongwe Depot', 'Site A gate', 'Lakeview Farms Ltd', 'Cameron Estates']) assert.ok(both.includes(name), name);
    assert.doesNotMatch(read(join(ROOT, 'project/assets/samples/slip-chisamba-10001614.svg')), /\bUAG\b|United African Grain/);
  });

  test('the build publishes the continuity screens and the new components', { skip: !existsSync(join(ROOT, 'dist')) && 'run npm run build first' }, () => {
    const bundle = read(join(ROOT, 'dist/ui_kits/one_link/ui_kits_one_link_index.kit.js'));
    for (const { states } of SCREENS) for (const screen of Object.keys(states)) assert.ok(bundle.includes(screen), `${screen} is compiled`);
    const ds = read(join(ROOT, 'dist/_ds_bundle.js'));
    for (const c of ['ReadinessChip', 'EvidenceViewer', 'FieldCheck', 'SecondConfirmation', 'ExceptionList']) assert.ok(ds.includes(c), `${c} is compiled`);
    assert.ok(existsSync(join(ROOT, 'dist/assets/samples/slip-chisamba-10001614.svg')));
  });
});

describe('[M2.DS.01] the components it introduced', () => {
  test('[M2.DS.01] provenance chip kinds are exactly synced, ocr-verified, unverified and declared (with the three review-only confidence kinds)', () => {
    const chip = read(join(COMPONENTS, 'feedback/TrustChip.jsx'));
    const prov = literal(chip, 'PROV');
    assert.deepEqual(Object.keys(prov), ['synced', 'ocr-verified', 'unverified', 'declared', 'ocr-high', 'ocr-medium', 'ocr-low']);
    assert.ok(['ocr-high', 'ocr-medium', 'ocr-low'].every((k) => prov[k].review), 'the confidence kinds are review-only');
    for (const [k, p] of Object.entries(prov)) assert.doesNotMatch(p.label, /high|medium|low|OCR|%|typed|\bbridge\b|feed/i, `${k} shows a confidence or a retired word: ${p.label}`);
    assert.deepEqual([prov.synced.label, prov['ocr-verified'].label], ['Weighbridge', 'Scanned slip']);
    assert.doesNotMatch(chip, /signal-/, 'no confidence signal is drawn');
    const typed = walk(join(ROOT, 'project')).filter((p) => /\.(jsx|html|ts)$/.test(p)).filter((p) => /kind="(typed|bridge)"|provenance: ?'typed'/.test(read(p)));
    assert.deepEqual(typed, [], 'nothing draws typed or bridge');
  });

  test('[M2.DS.01] readiness is a status mark with its own words, and Weighed in only is readiness (ReadinessChip)', () => {
    const r = read(join(COMPONENTS, 'records/ReadinessChip.jsx'));
    const spec = literal(r, 'READINESS_SPEC');
    assert.equal(spec['weighed-in-only'].word, 'Weighed in only');
    assert.equal(spec.ready.word, 'Ready');
    assert.match(r, /<StatusMark kind=\{r\.mark\} label=\{r\.word\}/, 'composes StatusMark: icon and word');
  });

  test('[M2.DS.01] a low-confidence field enables confirm only after its Checked tick is set or its value is edited', async () => {
    const src = read(join(COMPONENTS, 'records/FieldCheck.jsx'));
    const fieldOpen = Function(`${src.match(/export function fieldOpen[^\n]+/)[0].replace('export ', '')}; return fieldOpen;`)();
    const ready = (fs) => !fs.some(fieldOpen);
    const f = { key: 'tare', read: '13.380', value: '13.380', doubtful: true };
    assert.equal(ready([f]), false);
    assert.equal(ready([{ ...f, checked: true }]), true);
    assert.equal(ready([{ ...f, value: '13.880' }]), true);
    assert.equal(ready([{ ...f, doubtful: false }]), true);
  });

  test('[M2.DS.01] the waiting-for-a-second-confirmation state shows the reading, the entered value and the first confirmer, and offers withdraw only to that person', () => {
    const src = read(join(COMPONENTS, 'records/SecondConfirmation.jsx'));
    assert.match(src, /\['Read from slip', reading\], \['Entered', entered\], \['Confirmed first by'/);
    assert.match(src, /const own = viewer != null && viewer === firstBy;/);
    assert.match(src, /\{own \? <Button data-action="withdraw"/);
  });

  test('[M2.DS.01] the evidence viewer zooms and shows the fingerprint', () => {
    const src = read(join(COMPONENTS, 'records/EvidenceViewer.jsx'));
    assert.match(src, /aria-label="Zoom in"/);
    assert.match(src, /aria-label="Zoom out"/);
    assert.match(src, />Fingerprint</);
    assert.match(src, /width: `\$\{level \* 100\}%`/);
  });

  test('[M2.DS.01] every new component has its types, a usage note and a place on the components card', () => {
    const card = read(join(COMPONENTS, 'records/weighbridge.card.html'));
    for (const c of ['ReadinessChip', 'EvidenceViewer', 'FieldCheck', 'SecondConfirmation', 'ExceptionList']) {
      for (const ext of ['.jsx', '.d.ts', '.prompt.md']) assert.ok(existsSync(join(COMPONENTS, 'records', c + ext)), c + ext);
      assert.ok(dsFiles.includes(`records/${c}.jsx`), `${c} is in the loader`);
      assert.ok(card.includes(`<${c}`), `${c} is on the card`);
    }
  });
});
