// The admin workspace kit (Setup), M1.DS.01: its README matches its screens, it composes published components and
// tokens only, the owner's Items to approve speaks business words only, and the build publishes it.
//
//   npm test            (after npm run build, for the published-site check)

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const KIT = join(ROOT, 'project/ui_kits/admin_workspace');
const read = (p) => readFileSync(p, 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const topLevel = (src) => [...src.matchAll(/^(?:export\s+)?(?:function|const|let)\s+([A-Za-z_]\w*)/gm)].map((m) => m[1]);

/** A section's STATES literal (SETTINGS_STATES, PEOPLE_STATES): screen name to its states. */
export function screenStates(src, name = 'SETTINGS_STATES') {
  const m = src.match(new RegExp(`export const ${name} = (\\{[\\s\\S]*?\\n\\});`));
  assert.ok(m, `the section exports ${name}`);
  return Function(`return (${m[1]});`)();
}

/** The kit's sections: each file, its states literal and the card that drew it. */
export const SECTIONS = [
  { file: 'Settings.jsx', states: 'SETTINGS_STATES', card: 'M1.DS.01' },
  { file: 'People.jsx', states: 'PEOPLE_STATES', card: 'M1.DS.02' },
  { file: 'Records.jsx', states: 'RECORDS_STATES', card: 'M1.DS.03' },
];

/** The README's settings and governance table: screen to { file, states }. */
export function readmeRows(md) {
  const rows = {};
  for (const line of md.split('\n')) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length !== 3 || cells[0] === 'Screen' || /^-+$/.test(cells[0])) continue;
    rows[cells[0]] = { file: cells[1].replace(/`/g, ''), states: cells[2].split('·').map((s) => s.trim()).filter(Boolean) };
  }
  return rows;
}

/** Problems with how a kit source composes the system: defined tokens, unknown tokens, literal colours, unknown components. */
export function compositionProblems(src, { tokens, components }) {
  const problems = [];
  for (const m of src.matchAll(/(^|[\s{;'"`])(--[a-z0-9-]+)['"]?\s*:/g)) problems.push(`defines token ${m[2]}`);
  for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) if (!tokens.has(m[1])) problems.push(`uses unknown token ${m[1]}`);
  for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g)) problems.push(`literal colour ${m[0]}`);
  for (const m of src.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) if (!components.has(m[1])) problems.push(`unknown component <${m[1]}>`);
  return problems;
}

/** Words a reader of Items to approve must never meet: system vocabulary (S57, map UX-23 and UX-33). */
export const SYSTEM_WORDS = ['sync', 'feed', 'batch', 'queue', 'payload', 'null', 'undefined', 'none', 'workflow', 'table', 'column', 'database', 'api', 'webhook', 'record id', 'uuid', 'status code', 'proposed', 'my approvals', 'error code'];

/** The words a screen shows: string literals and JSX text inside the named function and the constants it reads. */
export function shownWords(src, fn, constants = []) {
  const body = (name, kind) => {
    const start = src.indexOf(kind === 'fn' ? `function ${name}(` : `const ${name} = `);
    assert.ok(start >= 0, `${name} is in the source`);
    const next = src.indexOf('\n/* ---', start + 1);
    const end = kind === 'fn' ? (next < 0 ? src.length : next) : src.indexOf('];', start) + 2;
    return src.slice(start, end);
  };
  const code = [body(fn, 'fn'), ...constants.map((c) => body(c, 'const'))].join('\n')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  const strings = [...code.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*)"|`([^`]*)`/g)].map((m) => m[1] ?? m[2] ?? m[3]);
  const jsxText = [...code.matchAll(/>([^<>{}]+)</g)].map((m) => m[1]);
  // Keys and props are code, not copy: drop identifiers, CSS values and token references.
  return [...strings, ...jsxText].map((s) => s.trim()).filter((s) => s && !/^[a-z][A-Za-z0-9]*$/.test(s) && !/^(var\(|\d+px|max-content|minmax)/.test(s));
}

export function vocabularyProblems(words) {
  const problems = [];
  for (const w of words) for (const bad of SYSTEM_WORDS) if (new RegExp(`\\b${bad}\\b`, 'i').test(w)) problems.push(`"${w}" says ${bad}`);
  return problems;
}

function readmeMatches(section) {
  const states = screenStates(read(join(KIT, section.file)), section.states);
  const rows = readmeRows(read(join(KIT, 'README.md')));
  for (const [screen, list] of Object.entries(states)) {
    assert.ok(rows[screen], `${screen} has a README row`);
    assert.equal(rows[screen].file, section.file, `${screen} names its file`);
    assert.deepEqual(rows[screen].states, list, `${screen} lists its states in order`);
    assert.match(read(join(KIT, section.file)), new RegExp(`export function ${screen}\\(`), `${screen} is exported`);
  }
}

const tokens = new Set(walk(join(ROOT, 'project/tokens')).filter((p) => p.endsWith('.css')).flatMap((p) => [...read(p).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])));
const loader = read(join(ROOT, 'project/components/_loader.js'));
const dsFiles = JSON.parse(loader.match(/var FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
const published = new Set(dsFiles.flatMap((f) => topLevel(read(join(ROOT, 'project/components', f)))));
const kitFiles = ['Shell.jsx', ...SECTIONS.map((x) => x.file)].map((f) => join(KIT, f));
const kitNames = new Set([...kitFiles, join(ROOT, 'project/ui_kits/one_link/Shell.jsx')].flatMap((p) => topLevel(read(p))));
const components = new Set([...published, ...kitNames, 'React']);

describe('[M1.DS.01] the admin workspace kit', () => {
  test('[M1.DS.01] the admin workspace README lists every settings and governance screen with its file and states', () => {
    readmeMatches(SECTIONS[0]);
  });

  test('[M1.DS.02] the admin workspace README lists every people and access screen with its file and states', () => {
    readmeMatches(SECTIONS[1]);
  });

  test('[M1.DS.03] the admin workspace README lists every records and data screen with its file and states', () => {
    readmeMatches(SECTIONS[2]);
  });

  test('the README lists no screen a section does not draw', () => {
    const rows = readmeRows(read(join(KIT, 'README.md')));
    const drawn = SECTIONS.flatMap((x) => Object.keys(screenStates(read(join(KIT, x.file)), x.states)));
    assert.deepEqual(Object.keys(rows).sort(), drawn.sort());
  });

  test('[M1.DS.02] every people and access screen composes published components only and adds no token', () => {
    assert.deepEqual(compositionProblems(read(join(KIT, 'People.jsx')), { tokens, components }), []);
  });

  test('[M1.DS.02] the signed-out screens show nothing before sign-in: no person, reference, figure or preview', () => {
    const src = read(join(KIT, 'People.jsx'));
    for (const fn of ['SignIn', 'Activate']) {
      const words = [...shownWords(src, fn), ...shownWords(src, 'SignedOutLinks')].join(' | ');
      assert.doesNotMatch(words, /\b[A-Z]\. [A-Z][a-z]+|@example\.com|SYN\d|GRN-|\bK\d|\d+(\.\d+)? ?(t|kg)\b|Lakeview|Riverbend|Chisamba|Mpongwe/, `${fn} shows business data: ${words}`);
      assert.match(words, /Forgot password/, `${fn} keeps the current ways back`);
      assert.doesNotMatch(words, /Create (an )?account|Sign up|Register/i, `${fn} offers self-registration`);
    }
  });

  test('[M1.DS.01] every settings and governance screen composes published components only and adds no token', () => {
    for (const file of kitFiles.filter((f) => !f.endsWith('People.jsx'))) assert.deepEqual(compositionProblems(read(file), { tokens, components }), [], file);
  });

  test('the composition audit fails on a defined token, an unknown token, a literal colour and an unknown component', () => {
    const src = "const a = <Gauge style={{ '--brand-x': 1, color: 'var(--made-up)', background: '#ff0000' }} />;";
    assert.deepEqual(compositionProblems(src, { tokens, components }), ['defines token --brand-x', 'uses unknown token --made-up', 'literal colour #ff0000', 'unknown component <Gauge>']);
  });

  test('[M1.DS.01] My approvals uses no system vocabulary', () => {
    const words = shownWords(read(join(KIT, 'Settings.jsx')), 'ItemsToApprove', ['ITEMS']);
    assert.ok(words.includes('Items to approve') && words.includes('Release hold'), 'the audit reads the screen copy');
    assert.deepEqual(vocabularyProblems(words), []);
  });

  test('the vocabulary audit catches a system word in a summary or a status', () => {
    assert.deepEqual(vocabularyProblems(['Weighbridge feed batch 12', 'Proposed', 'Riverbend Milling, maize, 1,500 t']), ['"Weighbridge feed batch 12" says feed', '"Weighbridge feed batch 12" says batch', '"Proposed" says proposed']);
  });

  test('the build publishes ui_kits/admin_workspace/ with its compiled screens and lists it on the site', { skip: !existsSync(join(ROOT, 'dist')) && 'run npm run build first' }, () => {
    const page = read(join(ROOT, 'dist/ui_kits/admin_workspace/index.html'));
    assert.match(page, /ui_kits_admin_workspace_index\.kit\.js/);
    assert.doesNotMatch(page, /babel/i, 'precompiled, no Babel in the browser');
    const bundle = read(join(ROOT, 'dist/ui_kits/admin_workspace/ui_kits_admin_workspace_index.kit.js'));
    for (const x of SECTIONS) for (const screen of Object.keys(screenStates(read(join(KIT, x.file)), x.states))) assert.ok(bundle.includes(screen), `${screen} is compiled`);
    assert.match(read(join(ROOT, 'dist/index.html')), /ui_kits\/admin_workspace\/index\.html/);
  });
});

describe('[M1.ID.05] bundles as S10 sets them', () => {
  const src = read(join(KIT, 'People.jsx'));
  const bundles = Function(`return (${src.match(/const BUNDLES = (\[[\s\S]*?\n\]);/)[1]});`)();

  test('[M1.ID.05] the ten default bundles carry the price tiers S10 gives them, in tier order, blank for none', () => {
    assert.deepEqual(Object.fromEntries(bundles.map((b) => [b.name, b.tiers])), {
      'Managing Director': 'Gate, Contract, Sell, Farmer account', Trading: 'Gate, Contract, Sell', 'Trading support': 'Contract',
      Finance: 'Gate, Contract, Sell, Farmer account', Operations: 'Gate, Contract, Sell, Farmer account', 'Stock control': 'Gate',
      Warehouse: '', Clerk: '', 'Field capture': '', Administrator: '',
    });
  });

  test('[M1.ID.05] a bundle waiting for Owen names who acts next as the labelled field Waiting for, not inside the banner (UX-23)', () => {
    const record = src.slice(src.indexOf('export function BundleRecord('), src.indexOf('/* ---', src.indexOf('export function BundleRecord(')));
    assert.match(record, /label: 'Waiting for'/);
    const banner = record.match(/<ConditionBanner>([^<]*)<\/ConditionBanner>/)[1];
    assert.doesNotMatch(banner, /Waiting for/);
  });
});

describe('[M1.DS.03] records and data', () => {
  const src = read(join(KIT, 'Records.jsx'));
  const fn = (name) => src.slice(src.indexOf(`export function ${name}(`), src.indexOf('\n/* ---', src.indexOf(`export function ${name}(`)) + 1 || undefined);

  test('[M1.DS.03] every records and data screen composes published components only and adds no token', () => {
    assert.deepEqual(compositionProblems(src, { tokens, components }), []);
  });

  test('[M1.DS.03] a site offers Deactivate and never Delete, and a refused Deactivate reads in the blocked pattern', () => {
    const site = fn('SiteRecord');
    assert.match(site, />Deactivate</);
    assert.doesNotMatch(site, />Delete</);
    assert.match(site, /<Refusal action="Deactivate" reason="[^"]+"/);
  });

  test('[M1.DS.03] a permanent record draws no Edit and offers Reverse with the S57 destructive confirmation', () => {
    const ledger = fn('LedgerView');
    assert.doesNotMatch(ledger, />Edit</);
    assert.match(ledger, />Reverse</);
    assert.match(ledger, /<ReverseDialog record="JE-2026-000412"/);
    const dialog = read(join(ROOT, 'project/components/records/ReverseDialog.jsx'));
    assert.match(dialog, /title=\{`Reverse \$\{record\}\?`\}/);
    assert.match(dialog, /A reversal entry will be created\./);
    assert.match(dialog, /confirmLabel="Reverse"/);
  });

  test('[M1.DS.03] without the contract tier, price and margin are the Restricted mark, never a dash, a blank or a zero', () => {
    const contract = fn('ContractView');
    assert.match(contract, /const money = \(v\) => \(tier \? v : <Restricted \/>\)/);
    for (const field of ["'Price', money(", "'Margin', money("]) assert.ok(contract.includes(field), `${field} goes through the restricted treatment`);
    assert.match(read(join(ROOT, 'project/components/data/Restricted.jsx')), /Restricted/);
  });

  test('[M1.DS.03] a refused upload says why in the S57 pattern, and Import stays disabled while a row has an error', () => {
    const refused = Function(`return (${src.match(/const REFUSED = (\{[\s\S]*?\n\});/)[1]});`)();
    assert.deepEqual(Object.keys(refused), ['Wrong type', 'Too large', 'Protected', 'Empty', 'Wrong sheet']);
    for (const message of Object.values(refused)) assert.match(message, /^(File|Sheet) must [^.]+\.( \(\.xlsx\)\.)?$|^File must be an Excel workbook \(\.xlsx\)\.$/);
    const preview = read(join(ROOT, 'project/components/records/ImportPreview.jsx'));
    assert.match(preview, /disabled=\{errors\.length > 0/);
    assert.match(preview, /to fix/, 'a file with a row error never says Ready to import');
  });

  test('[M1.DS.03] sample data is the golden synthetic set: no real customer and no pack reference', () => {
    assert.doesNotMatch(src, /National Milling|Zambeef|ZAMACE|NMC|FRA\b/);
    for (const name of ['SYN4702', 'Lakeview Farms Ltd', 'Riverbend Milling', 'Chisamba Shed', 'Mpongwe Depot']) assert.ok(src.includes(name), name);
  });
});

describe('[M1.ID.04] figures and price tiers', () => {
  const src = read(join(KIT, 'Settings.jsx'));
  test('[M1.ID.04] the figure catalogue shows each figure\'s tier and never a value, and a tier change is high-impact', () => {
    const rows = Function(`return (${src.match(/const FIGURE_ROWS = (\[[\s\S]*?\n\]);/)[1]});`)();
    assert.ok(rows.every((r) => ['Gate', 'Contract', 'Sell', 'Farmer account'].includes(r.tier)), 'every figure has a tier');
    const words = shownWords(src, 'FiguresList', ['FIGURE_ROWS']).join(' | ');
    assert.doesNotMatch(words, /USD|ZMW|K\d|\d+\.\d+%|\d+(\.\d+)? per t/, `the catalogue shows a value: ${words}`);
    const record = src.slice(src.indexOf('export function FigureRecord('));
    assert.match(record, /<ReasonDialog title="Confirm high-impact change"/);
  });
});
