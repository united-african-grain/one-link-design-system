// Templates, upload history and relationship screens, M3.DS.01 (UAG-41): Setup's Data screens (Templates, the
// version editor and comparison, Upload history, an upload's record page, Production readiness), the upload preview
// additions, Owen's Counterparties module, and the components they introduced: ColumnMapping, VersionCompare,
// ImportPreview's checks, CounterpartyOverview and SourceLine. The rules they keep: published components and tokens
// only, a reason before a destructive template change, a mapped tier that cannot be removed, every preview check with
// its cell, business words only on Owen's screens, no control that captures or edits there, the Restricted mark for an
// unentitled figure, and an as-of date on every figure.
//
//   npm test            (after npm run build, for the published-site check)

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ADMIN = join(ROOT, 'project/ui_kits/admin_workspace');
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
/** A plain function (no JSX) from a component's source, with the constants it reads, ready to call. */
const plain = (src, name, consts = []) => {
  const body = (n, kind) => {
    const start = src.indexOf(kind === 'fn' ? `export function ${n}(` : `export const ${n} = `);
    assert.ok(start >= 0, `${n} is exported`);
    const close = kind === 'fn' ? '\n}\n' : src[start + `export const ${n} = `.length] === '{' ? '\n};' : '\n];';
    return src.slice(start, src.indexOf(close, start) + close.length).replace(/^export /, '');
  };
  return Function(`${consts.map((c) => body(c, 'const')).join('\n')}\n${body(name, 'fn')}\nreturn ${name};`)();
};
/** The source of one exported screen or function, up to the next section rule or the end of the file. */
const fn = (src, name) => {
  const start = src.search(new RegExp(`(?:export )?function ${name}\\(`));
  assert.ok(start >= 0, `${name} is in the source`);
  const next = src.indexOf('\n/* ---', start);
  return src.slice(start, next < 0 ? src.length : next);
};
/** String literals and JSX text: the words a reader can meet. */
const shown = (code) => {
  const c = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');
  const strings = [...c.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*)"|`([^`]*)`/g)].map((m) => m[1] ?? m[2] ?? m[3]);
  const text = [...c.matchAll(/>([^<>{}]+)</g)].map((m) => m[1]);
  return [...strings, ...text].map((s) => s.trim()).filter((s) => s && !/^[a-z][A-Za-z0-9-]*$/.test(s) && !/^(var\(|\d+px|minmax|repeat)/.test(s));
};

/** The one shared list of words an owner's screen never shows (spec section 4, rule 6), also read by the web app. */
const BANNED = JSON.parse(read(join(ROOT, 'project/guidelines/banned-words.json')));
export function bannedWords(words) {
  const problems = [];
  for (const w of words) {
    for (const bad of BANNED.words) if (new RegExp(`\\b${bad}`, 'i').test(w)) problems.push(`"${w}" says ${bad}`);
    for (const p of BANNED.patterns) if (new RegExp(p, 'i').test(w)) problems.push(`"${w}" matches ${p}`);
  }
  return problems;
}

const data = read(join(ADMIN, 'Data.jsx'));
const records = read(join(ADMIN, 'Records.jsx'));
const counterparties = read(join(ONE_LINK, 'Counterparties.jsx'));
const mapping = read(join(COMPONENTS, 'records/ColumnMapping.jsx'));
const compare = read(join(COMPONENTS, 'records/VersionCompare.jsx'));
const preview = read(join(COMPONENTS, 'records/ImportPreview.jsx'));
const overview = read(join(COMPONENTS, 'records/CounterpartyOverview.jsx'));
const sourceLine = read(join(COMPONENTS, 'data/SourceLine.jsx'));
const DATA_STATES = literal(data, 'DATA_STATES');
const CP_STATES = literal(counterparties, 'COUNTERPARTIES_STATES');
const RECORDS_STATES = literal(records, 'RECORDS_STATES');

const tokens = new Set(walk(join(ROOT, 'project/tokens')).filter((p) => p.endsWith('.css')).flatMap((p) => [...read(p).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])));
const loader = read(join(COMPONENTS, '_loader.js'));
const dsFiles = JSON.parse(loader.match(/var FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
const published = new Set(dsFiles.flatMap((f) => topLevel(read(join(COMPONENTS, f)))));
const kitNames = (dir) => new Set(readdirSync(dir).filter((n) => n.endsWith('.jsx')).flatMap((n) => topLevel(read(join(dir, n)))));
function compositionProblems(src, kit) {
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

describe('[M3.DS.01] the screens', () => {
  test('[M3.ING.02] an upload\'s statuses include Discarded and Reversed, each an icon and a word, as the Data screens draw them', () => {
    const src = readFileSync(join(COMPONENTS, 'records/ImportPreview.jsx'), 'utf8');
    assert.match(src, /discarded: \{ kind: 'neutral', word: 'Discarded' \}/);
    assert.match(src, /reversed: \{ kind: 'neutral', word: 'Reversed' \}/);
  });

  test('[M3.DS.01] the kit READMEs list every new screen with its file and states, in order', () => {
    const admin = readmeRows(read(join(ADMIN, 'README.md')));
    for (const [screen, list] of Object.entries(DATA_STATES)) assert.deepEqual(admin[screen], { file: 'Data.jsx', states: list }, screen);
    assert.deepEqual(admin.UploadPreview.states, RECORDS_STATES.UploadPreview, 'the upload preview row lists its added states');
    const owen = readmeRows(read(join(ONE_LINK, 'README.md')));
    for (const [screen, list] of Object.entries(CP_STATES)) assert.deepEqual(owen[screen], { file: 'Counterparties.jsx', states: list }, screen);
  });

  test('[M3.DS.01] every new screen and state opens directly by ?screen=&state=', () => {
    const admin = read(join(ADMIN, 'index.html'));
    assert.ok(admin.includes("'Data.jsx'"));
    assert.match(admin, /\.\.\.K\.DATA_STATES/);
    for (const screen of Object.keys(DATA_STATES)) assert.ok(admin.includes(`'${screen}'`), `${screen} sits in a Setup section`);
    const owen = read(join(ONE_LINK, 'index.html'));
    assert.ok(owen.includes("'Counterparties.jsx'"));
    assert.match(owen, /\.\.\.K\.COUNTERPARTIES_STATES/);
    assert.match(owen, /params\.get\('screen'\)/);
  });

  test('[M3.DS.01] the Setup navigation\'s Data group holds Templates, Upload history and Production readiness (S11)', () => {
    const nav = literal(read(join(ADMIN, 'Shell.jsx')), 'SETUP_NAV', '\\[', '\\]');
    const group = nav.find((g) => g.label === 'Data');
    assert.deepEqual(group.items.map((i) => i.label), ['Templates', 'Upload history', 'Production readiness']);
    assert.ok(!nav.some((g) => g.label === 'Uploads'), 'renamed, not duplicated');
  });

  test('[M3.DS.01] every new screen composes published components and tokens only, with no bespoke colour', () => {
    assert.deepEqual(compositionProblems(data, kitNames(ADMIN)), [], 'Data.jsx');
    assert.deepEqual(compositionProblems(records, kitNames(ADMIN)), [], 'Records.jsx');
    assert.deepEqual(compositionProblems(counterparties, kitNames(ONE_LINK)), [], 'Counterparties.jsx');
    for (const f of ['records/ColumnMapping.jsx', 'records/VersionCompare.jsx', 'records/CounterpartyOverview.jsx', 'data/SourceLine.jsx', 'records/ImportPreview.jsx']) assert.deepEqual(compositionProblems(read(join(COMPONENTS, f)), new Set()), [], f);
  });

  test('[M3.DS.01] Templates is a list view with what it loads, version, effective date and who may upload, and New as the primary button (AC 1a)', () => {
    const list = fn(data, 'TemplatesList');
    for (const h of ["'Template'", "'Loads'", "'Version'", "'Effective from'", "'Who may upload'", "'Status'"]) assert.ok(list.includes(`label: ${h}`), h);
    assert.match(list, /primary=\{<Button size="small">New<\/Button>\}/);
    const rows = literal(data, 'TEMPLATE_ROWS', '\\[', '\\]');
    assert.ok(rows.some((r) => r.who === ''), 'no person is named by default (D-39)');
    assert.match(list, /r\.who \? r\.who : <NotSet/);
  });

  test('[M3.DS.01] template states Draft, Scheduled and Retired are each an icon and a word (AC 1h)', () => {
    const rows = literal(data, 'TEMPLATE_ROWS', '\\[', '\\]');
    for (const s of ['Active', 'Draft', 'Scheduled', 'Retired']) {
      assert.ok(rows.some((r) => r.status === s), `a ${s} template`);
      assert.match(data, new RegExp(`${s}: <StatusMark kind="[a-z]+" label="${s}"`), `${s} is a StatusMark`);
    }
    assert.deepEqual(DATA_STATES.NewTemplate, ['Form', 'Missing fields', 'Saving']);
  });

  test('[M3.DS.01] the version editor tests the mapping against a header row from a headers file or a mismatched upload, and never shows row values (AC 1b)', () => {
    assert.deepEqual(DATA_STATES.TemplateVersion.slice(0, 2), ['From a headers file', 'From an upload']);
    const editor = fn(data, 'TemplateVersion');
    assert.match(editor, /<ColumnMapping editable fields=\{TRADE_FIELDS\} columns=\{columns\}/);
    assert.match(data, /found: false/, 'a heading not in the header row');
    assert.match(mapping, /label="Not in the header row"/);
    assert.match(mapping, /`Found, cell \$\{c\.cell\}`/);
    assert.doesNotMatch(data.slice(data.indexOf('export const TRADE_V1'), data.indexOf('export function TemplateVersion')), /\b\d{1,3}(?:,\d{3})+\b|\b\d+\.\d{2,3}\b/, 'no row value or price in a template');
    assert.match(read(join(ADMIN, 'Records.jsx')), /<Button variant="outline" size="small">New version<\/Button>/, 'New version on the template record');
  });

  test('[M3.DS.01] upload history lists each upload with file, fingerprint, template version, uploader, time, row counts and status (AC 1d)', () => {
    const list = fn(data, 'UploadHistory');
    for (const h of ['Upload', 'File', 'Fingerprint', 'Template version', 'Uploaded by', 'Time (CAT)', 'Rows', 'Imported', 'Status']) assert.ok(list.includes(`label: '${h}'`), h);
    const rows = literal(data, 'UPLOAD_ROWS_HISTORY', '\\[', '\\]');
    assert.deepEqual([...new Set(rows.map((r) => r.status))].sort(), ['Discarded', 'Imported', 'Reversed']);
  });

  test('[M3.DS.01] a reversed upload names the reason, lists its reversal records on Related and its warnings with their cells (AC 1e)', () => {
    const record = fn(data, 'UploadRecord');
    assert.match(record, /\['Reason', 'Rows read under the wrong delivery months'\]/);
    assert.match(record, /<CountCard title="Reversal records"/);
    assert.match(record, /<CountCard title="Warnings at import"/);
    assert.ok(literal(data, 'UPLOAD_WARNINGS', '\\[', '\\]').every((w) => /^[A-Z]+\d+$/.test(w.cell)), 'each warning cites its cell');
  });

  test('[M3.DS.01] Reverse refused reads "Reverse is not allowed. [Reason]." with the dependent records, and Reverse shows its working state (AC 1g)', () => {
    const record = fn(data, 'UploadRecord');
    assert.match(record, /<Refusal action="Reverse" reason="[^"]+" \/>/);
    assert.match(record, /rows=\{DEPENDENTS\}/);
    assert.match(record, /<ReverseDialog record=\{u\.id\} busy=\{state === 'Reversing'\}/);
    assert.ok(DATA_STATES.UploadRecord.includes('Reversing'));
  });

  test('[M3.DS.01] import in progress shows its row count with Import working (AC 1g)', () => {
    assert.ok(RECORDS_STATES.UploadPreview.includes('Importing'));
    assert.match(records, /importing=\{state === 'Importing'\}/);
    assert.match(records, /\{ label: 'Imported so far', value: '412 of 1,240' \}/);
  });

  test('[M3.DS.01] Production readiness draws the Records open switch with the switch pattern and, when off, a condition banner (AC 1i)', () => {
    const page = fn(data, 'ProductionReadiness');
    assert.match(page, /<RecordHighlights kind="Switch" title="Records open"/);
    assert.match(page, /\{open \? null : <ConditionBanner>/);
    assert.match(page, />Propose change</);
    assert.match(page, /loading=\{busy\}>Submit for approval</);
    assert.ok(DATA_STATES.ProductionReadiness.includes('Submitting'));
  });

  test('[M3.DS.01] every save, confirm and submit button on the new screens draws its working state', () => {
    const working = { NewTemplate: 'Saving', TemplateVersion: 'Saving', UploadRecord: 'Reversing', ProductionReadiness: 'Submitting' };
    for (const [screen, st] of Object.entries(working)) assert.ok(DATA_STATES[screen].includes(st), `${screen} draws ${st}`);
    assert.ok(RECORDS_STATES.UploadPreview.includes('Confirming amendment'));
    assert.match(records, /loading=\{state === 'Confirming amendment'\}>Confirm</);
    assert.match(fn(data, 'TemplateVersion'), /busy=\{state === 'Saving'\}/);
  });

  test('[M3.DS.01] a load awaiting offload is In transit and its over-delivery variance is a labelled field (AC 2e)', () => {
    const loads = literal(counterparties, 'CP_LOADS', '\\[', '\\]');
    assert.ok(loads.every((l) => ['Loading', 'In transit', 'Delivered', 'Reconciled'].includes(l.status)), 'S57 load statuses');
    assert.ok(loads.some((l) => l.status === 'In transit' && l.offloaded === ''));
    assert.match(counterparties, /\['Over-delivery variance', '\+50\.000 t'\]/);
  });

  test('[M3.DS.01] the opening stock names the stock sheet and its date as a labelled Source, and freshness reads Last refreshed (AC 2f)', () => {
    assert.match(counterparties, /\['Opening stock', '1,300\.000 t'\]/);
    assert.match(counterparties, /<SourceLine kind="stock-sheet" date="30 Sep 2026" \/>/);
    assert.match(counterparties, /'Last refreshed 05 Oct 2026, 07:02 CAT'/);
    for (const m of counterparties.matchAll(/sourceWords\('[a-z-]+', '([^']+)'\)/g)) assert.match(m[1], /^\d{2} [A-Z][a-z]{2} \d{4}$/, m[1]);
  });

  test('[M3.DS.01] find a counterparty offers "Did you mean" and an "Also known as" line, and the drill-down is Calculation details (AC 2a, 2c)', () => {
    assert.deepEqual(CP_STATES.CounterpartyFind, ['Global search', 'Did you mean', 'Also known as', 'List view', 'No match']);
    assert.match(counterparties, /Did you mean <CpLink/);
    assert.match(counterparties, /Also known as \{aka\}/);
    assert.match(fn(counterparties, 'CounterpartyView'), /<CalculationDetails open=\{calc\}/);
    assert.match(fn(counterparties, 'CounterpartyGroup'), /Remaining under contract, by product/);
  });

  test('[M3.DS.01] sample data is the golden synthetic set and public copy never says UAG', () => {
    for (const src of [data, counterparties, mapping, compare, overview, sourceLine]) assert.doesNotMatch(shown(src).join(' | '), /\bUAG\b|United African Grain|National Milling|Zambeef/);
    for (const name of ['Riverbend Milling', 'Lakeview Farms Ltd', 'SYN4702', 'Chisamba Shed']) assert.ok(counterparties.includes(name), name);
    assert.ok(data.includes('SYN4702') || records.includes('SYN4702'));
  });

  test('the build publishes the new screens and components', { skip: !existsSync(join(ROOT, 'dist')) && 'run npm run build first' }, () => {
    const admin = read(join(ROOT, 'dist/ui_kits/admin_workspace/ui_kits_admin_workspace_index.kit.js'));
    for (const screen of Object.keys(DATA_STATES)) assert.ok(admin.includes(screen), `${screen} is compiled`);
    const owen = read(join(ROOT, 'dist/ui_kits/one_link/ui_kits_one_link_index.kit.js'));
    for (const screen of Object.keys(CP_STATES)) assert.ok(owen.includes(screen), `${screen} is compiled`);
    const ds = read(join(ROOT, 'dist/_ds_bundle.js'));
    for (const c of ['ColumnMapping', 'VersionCompare', 'CounterpartyOverview', 'SourceLine', 'PREVIEW_STATES']) assert.ok(ds.includes(c), `${c} is compiled`);
    assert.ok(existsSync(join(ROOT, 'dist/components/records/ingestion.card.html')));
    assert.ok(existsSync(join(ROOT, 'dist/guidelines/banned-words.json')));
  });
});

describe('[M3.DS.01] the components', () => {
  test('[M3.DS.01] a column mapping row shows field, type, required and tier tag', () => {
    const labels = [...mapping.matchAll(/label: '([^']+)'/g)].map((m) => m[1]);
    for (const l of ['Column in the file', 'One Link field', 'Type', 'Required', 'Price tier', 'Header row']) assert.ok(labels.includes(l), l);
    assert.match(mapping, /<span data-mapping-field="">\{c\.field\}<\/span>/);
    assert.match(mapping, /<span data-mapping-type="">\{c\.type\}<\/span>/);
    assert.match(mapping, /\{c\.required \? 'Required' : ''\}/);
    assert.match(mapping, /render: \(c\) => <TierTag tier=\{c\.tier\} from=\{c\.tierFrom\}/);
  });

  test('[M3.DS.01] a version comparison marks added, removed and remapped columns', () => {
    const compareVersions = plain(compare, 'compareVersions');
    const rows = compareVersions(literal(data, 'TRADE_V1', '\\[', '\\]'), Function(`const TRADE_V1 = ${data.match(/export const TRADE_V1 = (\[[\s\S]*?\n\]);/)[1]}; return ${data.match(/export const TRADE_V2 = (\[[\s\S]*?\n\]);/)[1]};`)());
    const by = Object.fromEntries(rows.map((r) => [r.source, r.change]));
    assert.equal(by.Qty, 'remapped');
    assert.equal(by.Comments, 'removed');
    assert.equal(by['Delivery window'], 'added');
    assert.equal(by['Contract no'], null, 'an unchanged column carries no mark');
    const marks = literal(compare, 'COMPARE_MARKS');
    assert.deepEqual([marks.added.word, marks.removed.word, marks.remapped.word], ['Added', 'Removed', 'Remapped']);
    assert.match(compare, /<StatusMark kind=\{COMPARE_MARKS\[r\.change\]\.kind\} label=\{COMPARE_MARKS\[r\.change\]\.word\}/);
  });

  test('[M3.DS.01] a destructive template change cannot confirm without a reason', () => {
    const mappingChanges = plain(mapping, 'mappingChanges');
    const before = [{ source: 'Qty', field: 'Quantity', type: 'Tonnes' }, { source: 'Comments', field: 'Note', type: 'Text' }, { source: 'Rate', field: 'Transport rate', type: 'Money' }];
    const after = [{ source: 'Qty', field: 'Quantity', type: 'Number' }, { source: 'Rate', field: 'Transport rate', type: 'Money', required: true }, { source: 'Month', field: 'Delivery window', type: 'Month range' }];
    const changes = mappingChanges(before, after);
    assert.deepEqual(changes.map((c) => [c.kind, c.destructive]), [['type', true], ['removed', true], ['required', true], ['added', false]]);
    assert.equal(changes.find((c) => c.kind === 'removed').words, 'Comments is removed.');
    // The editor reuses the M1.DS.01 ReasonDialog contract rather than a dialog of its own: Confirm waits for the reason.
    const editor = fn(data, 'TemplateVersion');
    assert.match(editor, /<ReasonDialog title="Confirm template change" confirmLabel="Save version"/);
    assert.match(editor, /mappingChanges\(TRADE_V2, columns\)\.filter\(\(c\) => c\.destructive\)/);
    assert.match(read(join(COMPONENTS, 'feedback/ReasonDialog.jsx')), /disabled=\{short\}/);
  });

  test('[M3.DS.01] a mapped tier tag is drawn read-only with no remove control', () => {
    const tag = fn(mapping, 'TierTag');
    const mapped = tag.slice(tag.indexOf("if (from === 'mapping')"), tag.indexOf('if (editable)'));
    assert.match(mapped, /data-tier-from="mapping"/);
    assert.match(mapped, /From Figures and price tiers/);
    assert.doesNotMatch(mapped, /<Select|<Button|<button|<Input|<input|onClick|onChange|aria-label="Remove|\bx\b/, 'nothing that changes or removes it');
    assert.ok(literal(data, 'TRADE_V1', '\\[', '\\]').some((c) => c.tierFrom === 'mapping'), 'the kit draws a mapped tier');
  });

  test('[M3.DS.01] every preview state renders with its cell reference and its commit-enabled flag', () => {
    const states = literal(preview, 'PREVIEW_STATES', '\\[', '\\]');
    assert.equal(states.length, 9, 'the nine states of AC 1(f)');
    const previewBlocked = plain(preview, 'previewBlocked');
    const checks = literal(preview, 'PREVIEW_CHECKS');
    const trade = fn(records, 'TradeSheetPreview') + records.slice(records.indexOf('const TRADE_CHECK'), records.indexOf('function TradeSheetPreview'));
    // The inputs each state draws: the same shapes the kit passes to ImportPreview.
    const inputs = {
      'Heading not found': { file: { missing: ['Delivery window (Trades, row 1)'] }, rows: [] },
      'Columns not read': { file: { notRead: ['Comments (H1)'] }, rows: [{ row: 2 }] },
      'Price tier missing': { refusal: { reason: 'Buy price K/t (cell F1)' }, rows: [] },
      'Earlier version': { file: { template: 'Trade sheet, version 1' }, rows: [{ row: 2 }] },
      Amendment: { rows: [{ row: 4, check: 'amendment', cell: 'D4' }] },
      'Already recorded': { rows: [{ row: 3, check: 'already-recorded', cell: 'A3' }] },
      'Differs from recorded': { rows: [{ row: 6, check: 'differs-from-recorded', cell: 'D6' }] },
      'Sheet figure differs': { rows: [{ row: 5, check: 'sheet-figure-differs', cell: 'K5' }] },
      'Duplicate refused': { refusal: { reason: 'This file was imported as UPL-000240' }, rows: [] },
    };
    for (const s of states) {
      assert.ok(RECORDS_STATES.UploadPreview.includes(s.state), `${s.state} is drawn`);
      assert.ok(trade.includes(s.cite), `${s.state} cites ${s.cite}`);
      assert.ok(JSON.stringify(inputs[s.state]).includes(s.cite), `${s.state}'s inputs carry ${s.cite}`);
      assert.equal(!previewBlocked(inputs[s.state]), s.importEnabled, `${s.state}: Import ${s.importEnabled ? 'enabled' : 'disabled'}`);
    }
    for (const [k, c] of Object.entries(checks)) assert.ok(c.word && c.kind, k);
    assert.match(preview, /label=\{`Cell \$\{r\.cell\}: \$\{c\.word\}`\}/, 'a row check names its cell');
    assert.match(preview, /disabled=\{errors\.length > 0 \|\| blocked \|\| status !== 'ready'\}/);
  });

  test('[M3.DS.01] a source line renders business wording for each source kind', () => {
    const sourceWords = plain(sourceLine, 'sourceWords', ['SOURCE_KINDS']);
    const kinds = literal(sourceLine, 'SOURCE_KINDS');
    assert.ok(Object.keys(kinds).length >= 8);
    for (const kind of Object.keys(kinds)) {
      const words = sourceWords(kind, '01 Oct 2026');
      assert.match(words, /^[A-Z][a-z]+( [a-z]+)*, 01 Oct 2026$/, words);
      assert.deepEqual(bannedWords([words]), [], kind);
    }
    assert.equal(sourceWords('trade-sheet', '01 Oct 2026'), 'Trade sheet, 01 Oct 2026');
    assert.match(sourceLine, /label = 'Source'/, 'a labelled field Source');
  });

  test('[M3.DS.01] relationship kit copy contains no banned system words', () => {
    const words = [...shown(counterparties), ...shown(overview), ...shown(sourceLine)];
    assert.ok(words.includes('Sales under contract') && words.includes('Left to deliver'), 'the audit reads the screen copy');
    assert.deepEqual(bannedWords(words), []);
  });

  test('the banned-word audit catches each word and an error code', () => {
    assert.deepEqual(bannedWords(['Trade sheet upload', 'Batch 12', 'Template v2', 'Synced 07:02', 'Virtual warehouse', 'Error code E1042']).length, 7);
    assert.deepEqual(bannedWords(['Source: Trade sheet, 01 Oct 2026', 'UPL']), []);
  });

  test('[M3.DS.01] the counterparty overview renders no button, input or upload control', () => {
    assert.doesNotMatch(overview, /<Button|<button|<IconButton|<Input|<input|<Select|<select|<CheckboxList|<RadioList|type="file"|Upload|Import/);
    assert.match(overview, /tabs=\{\[\]\}/, 'the highlights panel draws no tab buttons of its own');
    assert.match(overview, /<a href="#" data-figure-link=/, 'a figure opens Calculation details as a link');
    // And Owen's screens offer nothing that captures, edits, confirms or uploads (S08).
    assert.doesNotMatch(counterparties, /<(Field|Input|Select|CheckboxList|RadioList|ReasonDialog|ReverseDialog|Dialog)\b/);
    for (const m of counterparties.matchAll(/<Button[^>]*>([^<]*)<\/Button>/g)) assert.equal(m[1], 'View all', `a ${m[1]} button`);
  });

  test('[M3.DS.01] an unentitled figure renders the restricted dash', () => {
    // AC 6 and UX-09 win over the test's name: the restricted figure is a lock, no value and the tooltip Restricted,
    // never a dash, a zero or a made-up figure.
    assert.match(overview, /const value = figure\.restricted \? <Restricted \/>/);
    const restricted = read(join(COMPONENTS, 'data/Restricted.jsx'));
    assert.match(restricted, /<Icon name="lock"/);
    assert.match(restricted, /label = 'Restricted'/);
    assert.doesNotMatch(overview, /\u2014|RestrictedCell/);
    const view = fn(counterparties, 'CounterpartyView');
    assert.match(view, /restricted: f\.tier === 'Sell' && !sellTier/);
    assert.match(counterparties, /\['Balance', farmerTier \? 'USD 4,850\.00' : <Restricted \/>\]/);
    assert.match(counterparties, /\.\.\.\(sellTier \? \[\{ key: 'amount', label: 'Amount \(USD\)'/, 'elsewhere the column is left out');
  });

  test('[M3.DS.01] every figure renders an as-at line', () => {
    assert.match(fn(overview, 'OverviewFigure'), /<span data-as-of="" [^>]*>As of \{figure\.asOf\}<\/span>/);
    assert.doesNotMatch(fn(overview, 'OverviewFigure'), /figure\.asOf \?/, 'the line is never conditional');
    for (const cp of ['RIVERBEND', 'LAKEVIEW']) {
      const figures = literal(counterparties, cp).figures;
      assert.deepEqual(figures.map((f) => f.label), ['Sales under contract', 'Delivered', 'Left to deliver', 'Receivables', 'Oldest unpaid']);
      for (const f of figures) assert.match(f.asOf, /^\d{2} [A-Z][a-z]{2} \d{4}$/, `${cp} ${f.label}`);
    }
  });

  test('[M3.DS.01] every new component has its types, a usage note and a place on the components card', () => {
    const card = read(join(COMPONENTS, 'records/ingestion.card.html'));
    for (const [dir, c] of [['records', 'ColumnMapping'], ['records', 'VersionCompare'], ['records', 'CounterpartyOverview'], ['data', 'SourceLine']]) {
      for (const ext of ['.jsx', '.d.ts', '.prompt.md']) assert.ok(existsSync(join(COMPONENTS, dir, c + ext)), c + ext);
      assert.ok(dsFiles.includes(`${dir}/${c}.jsx`), `${c} is in the loader`);
      assert.ok(card.includes(`<${c}`), `${c} is on the card`);
    }
    assert.ok(card.includes('<ImportPreview'), 'the preview checks are on the card');
  });
});
