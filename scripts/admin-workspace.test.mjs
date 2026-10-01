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
