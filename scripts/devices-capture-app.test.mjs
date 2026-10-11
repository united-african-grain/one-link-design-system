// Device, capture review and UAG One Link app screens, M4.DS.03 (UAG-185): Devices and Captures in review in Setup,
// stock control's decision on a capture, Setup Home's Silent devices and Captures in review cards, the UAG One Link
// app at 390 (enrolment, sign-in once then the PIN or fingerprint, field tasks, proving delivery, a refused delivery,
// Pending sync, the sign-out warning, a revoked phone), and the pieces they introduced: CaptureTile, PinPad and
// MobileShell's opt-in `modules` and `onBack`.
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
const ADMIN = join(KITS, 'admin_workspace');
const FIELD = join(KITS, 'field_app');
const ONE_LINK = join(KITS, 'one_link');
const COMPONENTS = join(ROOT, 'project/components');
const read = (p) => readFileSync(p, 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const topLevel = (src) => [...src.matchAll(/^(?:export\s+)?(?:function|const|let)\s+([A-Za-z_]\w*)/gm)].map((m) => m[1]);
const literal = (src, name, open = '\\{', close = '\\}') => {
  const m = src.match(new RegExp(`(?:export )?const ${name} = (${open}[\\s\\S]*?\\n${close});`));
  assert.ok(m, `the source has ${name}`);
  return Function(`return (${m[1]});`)();
};
/** The source of one function, up to its closing brace at the start of a line. */
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
function readmeRows(md) {
  const rows = {};
  for (const line of md.split('\n')) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length !== 3 || cells[0] === 'Screen' || /^-+$/.test(cells[0])) continue;
    rows[cells[0]] = { file: cells[1].replace(/`/g, ''), states: cells[2].split('·').map((s) => s.trim()).filter(Boolean) };
  }
  return rows;
}

/** A component compiled and run against a stand-in React that only records the tree. Stubs record their props. */
function load(file, names, deps = {}) {
  const src = read(join(COMPONENTS, file)).replace(/^import[^\n]*$/gm, '').replace(/^export\s+/gm, '');
  const code = transformSync(src, { loader: 'jsx', jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment' }).code;
  const React = { createElement: (type, props, ...children) => ({ type: typeof type === 'function' ? type.name : type, props: props || {}, children: children.flat() }), Fragment: 'Fragment' };
  const stub = (name) => Object.defineProperty(function () { return null; }, 'name', { value: name });
  const all = { React, textStyle: () => ({}), Icon: stub('Icon'), Button: stub('Button'), StatusMark: stub('StatusMark'), CardRow: stub('CardRow'), Dot: stub('Dot'), ...deps };
  return Function(...Object.keys(all), `${code}\nreturn { ${names.join(', ')} };`)(...Object.values(all));
}
/** Every element in a recorded tree, including elements passed as props (a CardRow's trailing and bar). */
const nodes = (n) => {
  if (!n || typeof n !== 'object') return [];
  if (Array.isArray(n)) return n.flatMap(nodes);
  const fromProps = Object.values(n.props || {}).filter((v) => v && typeof v === 'object' && (v.type || Array.isArray(v))).flatMap(nodes);
  return [n, ...fromProps, ...(n.children || []).flatMap(nodes)];
};
const textOf = (n) => (n == null || typeof n === 'boolean' ? '' : typeof n !== 'object' ? String(n) : (n.children || []).map(textOf).join(''));

const field = read(join(FIELD, 'FieldApp.jsx'));
const devices = read(join(ADMIN, 'Devices.jsx'));
const review = read(join(ADMIN, 'CaptureReview.jsx'));
const settings = read(join(ADMIN, 'Settings.jsx'));
const APP = literal(field, 'FIELD_APP_STATES');
const DEVICES = literal(devices, 'DEVICES_STATES');
const REVIEW = literal(review, 'CAPTURE_REVIEW_STATES');
const DECISION = literal(review, 'CAPTURE_DECISION_STATES');
const NEW = ['records/CaptureTile.jsx', 'inputs/PinPad.jsx'];

const tokens = new Set(walk(join(ROOT, 'project/tokens')).filter((p) => p.endsWith('.css')).flatMap((p) => [...read(p).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1])));
const loader = read(join(COMPONENTS, '_loader.js'));
const dsFiles = JSON.parse(loader.match(/var FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
const published = new Set(dsFiles.flatMap((f) => topLevel(read(join(COMPONENTS, f)))));
const kitNames = (dir) => new Set(readdirSync(dir).filter((n) => n.endsWith('.jsx')).flatMap((n) => topLevel(read(join(dir, n)))));
export function compositionProblems(src, kit) {
  const components = new Set([...published, ...kit, ...topLevel(read(join(ONE_LINK, 'Shell.jsx'))), ...topLevel(read(join(ADMIN, 'Shell.jsx'))), 'React']);
  const problems = [];
  for (const m of src.matchAll(/(^|[\s{;'"`])(--[a-z0-9-]+)['"]?\s*:/g)) problems.push(`defines token ${m[2]}`);
  for (const m of src.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) if (!tokens.has(m[1])) problems.push(`uses unknown token ${m[1]}`);
  for (const m of src.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g)) problems.push(`literal colour ${m[0]}`);
  for (const m of src.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) if (!components.has(m[1])) problems.push(`unknown component <${m[1]}>`);
  return problems;
}
/** Money of any kind: a currency, a price, a value or a margin. */
const MONEY = /\b(USD|ZMW)\b|\bK\d|[Pp]rice|[Vv]alue\b|[Mm]argin/;

describe('[M4.DS.03] the web screens', () => {
  test('[M4.DS.03] the kit READMEs list every new screen with its file and states, in order (AC 1, 2)', () => {
    const admin = readmeRows(read(join(ADMIN, 'README.md')));
    for (const [screen, list] of Object.entries(DEVICES)) assert.deepEqual(admin[screen], { file: 'Devices.jsx', states: list }, screen);
    for (const [screen, list] of Object.entries(REVIEW)) assert.deepEqual(admin[screen], { file: 'CaptureReview.jsx', states: list }, screen);
    const owen = readmeRows(read(join(ONE_LINK, 'README.md')));
    for (const [screen, list] of Object.entries(DECISION)) assert.deepEqual(owen[screen], { file: '../admin_workspace/CaptureReview.jsx', states: list }, screen);
    const app = readmeRows(read(join(FIELD, 'README.md')));
    for (const [screen, list] of Object.entries(APP)) assert.deepEqual(app[screen], { file: 'FieldApp.jsx', states: list }, screen);
    for (const [states, src] of [[DEVICES, devices], [REVIEW, review], [DECISION, review], [APP, field]]) {
      for (const screen of Object.keys(states)) assert.match(src, new RegExp(`export function ${screen}\\(`), `${screen} is exported`);
    }
  });

  test('[M4.DS.03] every new screen and state opens directly by ?screen=&state=, in its persona\'s frame', () => {
    const admin = read(join(ADMIN, 'index.html'));
    assert.ok(admin.includes("'Devices.jsx','CaptureReview.jsx'"));
    assert.match(admin, /\.\.\.K\.DEVICES_STATES, \.\.\.K\.CAPTURE_REVIEW_STATES/);
    assert.match(admin, /devices: \{ crumbs: \['Devices'\], screens: \['DevicesList', 'NewDevice', 'DeviceRecord', 'CapturesInReview', 'CaptureReview'\] \}/);
    const owen = read(join(ONE_LINK, 'index.html'));
    assert.ok(owen.includes("'../admin_workspace/Shell.jsx','../admin_workspace/CaptureReview.jsx'"));
    assert.match(owen, /\.\.\.K\.CAPTURE_DECISION_STATES/);
    assert.match(owen, /K\.CAPTURE_DECISION_STATES\[screen\] \? K\.captureDecisionFrame\(screen, state\)/);
    assert.match(body(review, 'captureDecisionFrame'), /who: 'stock', module: 'inventory', section: 'review'/, 'stock control decides in its own frame');
    const app = read(join(FIELD, 'index.html'));
    assert.ok(app.includes("'FieldApp.jsx'"));
    assert.match(app, /\.\.\.K\.FIELD_APP_STATES/);
    assert.match(app, /params\.get\('screen'\)/);
    assert.match(app, /params\.get\('state'\)/);
  });

  test('[M4.DS.03] every device, review and field screen composes published components only (token and component audit) (AC 3)', () => {
    for (const [name, src] of [['Devices.jsx', devices], ['CaptureReview.jsx', review], ['Settings.jsx', settings]]) assert.deepEqual(compositionProblems(src, kitNames(ADMIN)), [], name);
    assert.deepEqual(compositionProblems(field, kitNames(FIELD)), [], 'FieldApp.jsx');
    for (const f of [...NEW, 'navigation/MobileShell.jsx']) assert.deepEqual(compositionProblems(read(join(COMPONENTS, f)), new Set()), [], f);
  });

  test('the composition audit catches a token defined, an unknown token, a literal colour and an unknown component', () => {
    assert.deepEqual(compositionProblems("const a = <Gauge style={{ '--x-y': 1, color: 'var(--nope)', background: '#ff0000' }} />;", new Set()), ['defines token --x-y', 'uses unknown token --nope', 'literal colour #ff0000', 'unknown component <Gauge>']);
  });

  test('[M4.DS.03] Devices sits under Users and access, after Bundles, and nothing above it moved (AC 8)', () => {
    const nav = literal(read(join(ADMIN, 'Shell.jsx')), 'SETUP_NAV', '\\[', '\\]');
    assert.deepEqual(nav.find((g) => g.label === 'Users and access').items.map((i) => i.label), ['Users', 'Bundles', 'Devices']);
  });

  test('[M4.DS.03] a device row draws status active, revoked or spare with silent as a badge (AC 1)', () => {
    // The acceptance criteria and S10 win over the test's name: silent is not a status and no badge is drawn. A silent
    // phone is an Active device whose Connection status is Offline, an icon and a word.
    const statuses = devices.slice(devices.indexOf('export const DEVICE_STATUS'), devices.indexOf('const connection'));
    assert.deepEqual([...statuses.matchAll(/label="([^"]+)"/g)].map((m) => m[1]), ['Active', 'Revoked', 'Spare', 'Connected', 'Delayed', 'Offline']);
    assert.doesNotMatch(statuses, /<(Count|Capsule|SeverityTag|TrustChip)\b/, 'statuses are StatusMarks, never a badge');
    assert.ok(statuses.match(/<StatusMark /g).length === 6);
    const rows = literal(devices, 'DEVICES', '\\[', '\\]');
    assert.deepEqual([...new Set(rows.map((d) => d.status))].sort(), ['Active', 'Revoked', 'Spare']);
    assert.ok(rows.every((d) => !/silent/i.test(d.status + d.connection)), 'Silent is never a status or a connection word');
    const silent = rows.filter((d) => d.status === 'Active' && d.connection === 'Offline').map((d) => d.ref);
    assert.deepEqual(silent, ['DEV-0010', 'DEV-0011']);
    assert.match(devices, /export const silentDevices = \(list = DEVICES\) => list\.filter\(\(d\) => d\.status === 'Active' && d\.connection === 'Offline'\);/);
    assert.ok(rows.filter((d) => d.status !== 'Active').every((d) => d.connection === ''), 'a revoked or spare phone has a blank connection status');
    const list = body(devices, 'DevicesList');
    const labels = [...list.matchAll(/label: '([^']+)'/g)].map((m) => m[1]);
    assert.deepEqual(labels, ['Device', 'Assigned to', 'Site', 'App version', 'Last contact (CAT)', 'Connection status', 'Status'], 'the record link first, Status last (UX-07)');
    assert.match(read(join(COMPONENTS, 'navigation/CaptureStatus.jsx')), /kind=\{online \? 'clean' : 'neutral'\} label=\{online \? 'Online' : 'Offline'\}/);
    assert.match(devices, /Offline: <StatusMark kind="neutral" label="Offline"/, 'Offline is the same mark the phone draws');
  });

  test('[M4.DS.03] the device record: last contact, last sync, app version and Pending sync; Revoke confirmed with a reason; the four Setup patterns (AC 1, 8)', () => {
    const rec = body(devices, 'DeviceRecord');
    for (const f of ['Assigned to', 'Connection status', 'Last contact', 'Last sync', 'App version', 'Pending sync']) assert.ok(rec.includes(`label: '${f}'`), f);
    assert.match(rec, /<RecordHighlights kind="Device"/);
    assert.match(rec, /<Button variant="critical-ghost" size="small">Revoke<\/Button>/, 'Revoke is the destructive action on the record (UX-17)');
    assert.match(rec, /<ReasonDialog title=\{`Revoke \$\{d\.ref\}\?`\} label="Reason" minLength=\{1\} confirmLabel="Revoke" confirmVariant="critical" busy=\{state === 'Revoking'\}/);
    assert.match(body(devices, 'DevicesList'), /<ListView title="Devices" objects="devices"/);
    assert.match(rec, /tab === 'History'/);
    const log = literal(read(join(ADMIN, 'People.jsx')), 'ACCESS', '\\[', '\\]');
    assert.ok(log.some((r) => r.action === 'Revoked' && /DEV-0004/.test(r.resource)), 'a revocation is in Audit logs');
    assert.ok(log.some((r) => r.action === 'Issued enrolment code' && /DEV-0012/.test(r.resource)), 'an enrolment code is in Audit logs');
  });

  test('[M4.DS.03] the enrolment code panel shows the code once and never again after closing (AC 1)', () => {
    const { OneTimeCode } = load('feedback/OneTimeCode.jsx', ['OneTimeCode'], {
      useState: () => [false, () => {}], useMinWidth: () => true,
      Dialog: Object.defineProperty(function () { return null; }, 'name', { value: 'Dialog' }),
    });
    const shownOnce = OneTimeCode({ title: 'Enrolment code', code: 'H6T-3RW-9KD', expires: '28 Sep 2026, 09:15 CAT' });
    assert.equal(shownOnce.type, 'Dialog');
    assert.equal(shownOnce.props.title, 'Enrolment code');
    assert.match(textOf(shownOnce), /H6T-3RW-9KD/);
    // The same show-once dialog as the activation code, reused: the kit never draws a code any other way.
    assert.match(body(devices, 'NewDevice'), /state === 'Enrolment code shown once' \? <OneTimeCode title="Enrolment code" code="H6T-3RW-9KD"/);
    const rec = body(devices, 'DeviceRecord');
    assert.equal((rec.match(/<OneTimeCode /g) || []).length, 1);
    assert.match(rec, /state === 'Reissued code' \? <OneTimeCode title="Enrolment code"/, 'only a reissue shows a new code');
    assert.equal((devices.match(/H6T-3RW-9KD/g) || []).length, 1, 'the first code appears once, in its dialog, and nowhere after closing');
    assert.match(rec, /\{ label: 'Enrolment code', value: state === 'Reissued code' \? 'Reissued, expires 29 Sep 2026, 10:00' : 'Issued, expires 28 Sep 2026, 09:15' \}/, 'closed, the record says only issued and its expiry');
    assert.match(rec, /Reissue enrolment code/);
    assert.doesNotMatch(devices, /Show code|View code/);
  });

  test('[M4.DS.03] a review item draws its reason, capture time and revocation time; read-only for the administrator (AC 1)', () => {
    const items = literal(review, 'CAPTURES', '\\[', '\\]');
    assert.deepEqual(items.map((c) => c.reason), ['Late capture', 'From a revoked phone']);
    assert.equal(items[0].revoked, '', 'a phone that was not revoked: a blank cell');
    assert.match(items[1].revoked, /^\d{2} [A-Z][a-z]{2} \d{4}, \d{2}:\d{2}$/);
    const list = body(review, 'CapturesInReview');
    for (const k of ["key: 'reason', label: 'Reason'", "key: 'captured', label: 'Captured (CAT)'", "key: 'revoked', label: 'Revoked (CAT)'"]) assert.ok(list.includes(k), k);
    const rec = body(review, 'CaptureReview');
    for (const f of ['Reason', 'Captured', 'Revoked', 'Device', 'Captured by']) assert.ok(rec.includes(`label: '${f}'`), f);
    assert.match(rec, /const actions = decide && !decided \? <DecisionActions outcomes=\{CAPTURE_OUTCOMES\} busy=\{busy\} \/> : null;/, 'the administrator gets no decision');
    assert.match(rec, /\{ label: 'Waiting for', value: 'Stock control or Operations' \}/);
    assert.deepEqual(literal(review, 'CAPTURE_OUTCOMES', '\\[', '\\]').map((o) => [o.label, !!o.comment]), [['Reject', true], ['Approve', false]], 'Approve and Reject, never Accept (UX-33)');
    assert.match(rec, /<ReasonDialog title=\{`Reject \$\{c\.ref\}\?`\} label="Comment" minLength=\{1\} confirmLabel="Reject" confirmVariant="critical" busy=\{state === 'Rejecting'\}/);
    assert.match(review, /export function CaptureDecision\(props\) \{\n  return <CaptureReview \{\.\.\.props\} decide \/>;/);
  });

  test('[M4.DS.03] Setup Home gains Silent devices and Captures in review, each with a count, View all and the empty state, after M4 only (AC 8)', () => {
    const home = body(settings, 'SetupHome');
    assert.match(home, /<CountCard title="Silent devices" objects="devices" count=\{calm \? 0 : silentDevices\(\)\.length\} action=\{<HeaderLink onClick=\{\(\) => onSection && onSection\('devices'\)\}>View all<\/HeaderLink>\}>/);
    assert.match(home, /<CountCard title="Captures in review" objects="captures" count=\{calm \? 0 : CAPTURES\.length\} action=\{<HeaderLink onClick=\{\(\) => onSection && onSection\('captures'\)\}>View all<\/HeaderLink>\}>/);
    assert.match(read(join(ADMIN, 'Shell.jsx')), /title=\{`No \$\{objects\} to display\.`\}/, '"No devices to display." and "No captures to display."');
    assert.match(home, /state === 'Before reference data' \? null :/, 'not drawn before M4 ships');
    assert.match(home, /status: CONNECTION_STATUS\.Offline/, 'a silent phone is Offline, an icon and a word');
  });

  test('[M4.DS.03] device numbers and user names are links where the viewer can open them; dates DD MMM YYYY, 24-hour, CAT on first display; a missing value is blank (AC 9)', () => {
    const list = body(devices, 'DevicesList');
    assert.match(list, /render: \(r\) => <RecordLink onClick=\{\(\) => onOpen && onOpen\(r\.id\)\}>\{r\.ref\}<\/RecordLink>/);
    assert.match(list, /render: \(r\) => \(r\.user \? <RecordLink>\{r\.user\}<\/RecordLink> : ''\)/);
    assert.match(body(review, 'CapturesInReview'), /const ref = \(v\) => \(decide \? v : <RecordLink>\{v\}<\/RecordLink>\);/, 'plain text for stock control, who cannot open them');
    for (const src of [devices, review]) {
      for (const m of src.matchAll(/'(\d{1,2} [A-Z][a-z]+ \d{4}[^']*)'/g)) assert.match(m[1], /^\d{2} [A-Z][a-z]{2} \d{4}(, \d{2}:\d{2}( CAT)?)?$/, m[1]);
    }
    const spare = literal(devices, 'DEVICES', '\\[', '\\]').find((d) => d.status === 'Spare');
    assert.deepEqual([spare.contact, spare.sync, spare.version, spare.user], ['', '', '', ''], 'no last sync yet: blank, never None or 0');
    assert.doesNotMatch(shown(devices + review).join(' | '), /\bNone\b|\bN\/A\b|\bNever\b/);
  });
});

describe('[M4.DS.03] the UAG One Link app', () => {
  test('[M4.DS.03] the app draws every state the card lists, at 390 (AC 2)', () => {
    for (const st of ['Email and password', 'Account locked', 'No connection', 'Code', 'Wrong code']) assert.ok(APP.AppSignIn.includes(st), st);
    assert.deepEqual(APP.FieldTasks, ['Tasks', 'Offline', 'Empty']);
    for (const st of ['Photograph', 'Signature', 'Details', 'Queued']) assert.ok(APP.ProveDelivery.includes(st), st);
    assert.ok(APP.DeliveryRefused.length && APP.PendingSync.includes('Damaged file') && APP.SignOutWarning.includes('Pending captures'));
    assert.ok(APP.EnrolPhone.includes('Enrolment code') && APP.PinSet.includes('Choose a PIN') && APP.PinUnlock.includes('PIN') && APP.PinUnlock.includes('Fingerprint') && APP.PinUnlock.includes('Locked'));
    assert.deepEqual(APP.RevokedPhone, ['Capture blocked']);
    assert.match(field, /const PHONE = 844;/);
    assert.match(read(join(FIELD, 'index.html')), /@dsCard group="Field app" viewport="390x844"[^>]*name="UAG One Link app"/);
  });

  test('[M4.DS.03] the words: the empty task list, a damaged file, a revoked phone, the locked account (AC 2, S57)', () => {
    assert.match(body(field, 'FieldTasks'), /<EmptyState title="No field tasks to display\." \/>/);
    assert.match(read(join(COMPONENTS, 'records/CaptureTile.jsx')), /damaged: \{ word: 'File is damaged\. Capture it again\.', kind: 'breach' \}/);
    assert.match(body(field, 'PendingSync'), /'Damaged file': \['queued', 'queued', 'damaged'\]/);
    assert.match(body(field, 'RevokedPhone'), /<Refusal action="Capture" reason="This phone is revoked" \/>/, '"Capture is not allowed. This phone is revoked."');
    assert.match(read(join(COMPONENTS, 'feedback/Refusal.jsx')), /`\$\{action\} is not allowed\. \$\{end\(reason\)\}`/);
    assert.match(body(field, 'RevokedPhone'), />Contact your administrator\.</, 'says what to do next');
    assert.match(body(field, 'AppSignIn'), /Your account is locked\. Contact your administrator\./);
    assert.match(body(field, 'PinUnlock'), /<Refusal action="PIN entry" reason="Sign in again with your email and password" \/>/);
  });

  test('[M4.DS.03] full sign-in once while connected, then the PIN or fingerprint; nothing before sign-in (AC 2, 9)', () => {
    assert.match(body(field, 'AppSignIn'), /'No connection': <Refusal action="Sign in" reason="This phone is offline\. Connect to a network for the first sign-in" \/>/);
    assert.match(body(field, 'PinUnlock'), /fingerprint=\{!locked\}/, 'the PIN pad switches back to the fingerprint');
    assert.match(body(field, 'PinUnlock'), /loading=\{state === 'Switching'\}>Use PIN</);
    for (const fn of ['EnrolPhone', 'AppSignIn', 'PinSet', 'PinUnlock', 'FieldWaysBack', 'PhoneSignedOut']) {
      const words = shown(body(field, fn)).join(' | ');
      assert.doesNotMatch(words, /\b[A-Z]\. [A-Z][a-z]+|@example\.com|DN\d|DEV-|SYN\d|\d+(\.\d+)? ?(t|kg|bags)\b|Lakeview|Riverbend|Chisamba|Mpongwe/, `${fn} shows business data: ${words}`);
      assert.doesNotMatch(words, /Create (an )?account|Sign up|Register/i, `${fn} offers self-registration`);
    }
  });

  test('[M4.DS.03] the no-field-tasks state renders with no data (AC 2)', () => {
    const tasks = body(field, 'FieldTasks');
    assert.match(tasks, /const tasks = state === 'Empty' \? \[\] :/);
    assert.match(tasks, /tasks\.length \? tasks\.map/);
    assert.match(tasks, /pending=\{pendingSyncCount\(/, 'the count comes from the queue, so empty shows no Pending sync');
  });

  test('[M4.DS.03] every capture screen shows the connection status and Pending sync (count); task screens hide the bar, carry the back chevron and the main action at the bottom (AC 2, UX-31)', () => {
    for (const fn of ['FieldTasks', 'ProveDelivery', 'DeliveryRefused', 'PendingSync', 'SignOutWarning', 'RevokedPhone']) assert.match(body(field, fn), /<CaptureStatus /, fn);
    for (const fn of ['ProveDelivery', 'DeliveryRefused', 'RevokedPhone']) {
      assert.match(body(field, fn), /<FieldPhone title="[^"]+" task>/, `${fn} is a task screen`);
      assert.match(body(field, fn), /<TaskAction>\s*(\{[^}]*)?<PressButton kind="large" variant="primary" fullWidth/, `${fn} has its full-width action`);
    }
    assert.match(body(field, 'FieldPhone'), /showBottomBar=\{!task\} onBack=\{task \? \(\) => \{\} : undefined\}/);
    assert.match(body(field, 'TaskAction'), /marginTop: 'auto'/);
    assert.deepEqual(literal(field, 'FIELD_AREAS', '\\[', '\\]').map((a) => a.label), ['Tasks', 'Pending sync']);
  });

  test('[M4.DS.03] proof of delivery needs the photograph and the signature; a queued send keeps its busy state until synced (AC 2, 6, F4.8)', () => {
    const prove = body(field, 'ProveDelivery');
    assert.match(prove, /const ready = photo && signed;/);
    assert.match(prove, /loading=\{sending\} disabled=\{!ready && !sending\}>Send</);
    assert.match(prove, /const sending = state === 'Sending' \|\| state === 'Queued';/, 'queued is still sending: the button stays busy');
    assert.match(prove, /'Receiver signature is required\.'/);
    for (const f of ['Receiver name', 'Received (bags)']) assert.ok(prove.includes(`label="${f}"`), f);
    assert.match(prove, /<Card title="Photograph"/);
    assert.match(prove, /<Card title="Receiver signature"/);
  });

  test('[M4.DS.03] no UAG One Link app screen renders a price, value or margin slot (AC 5)', () => {
    const words = shown(field);
    assert.ok(words.includes('No field tasks to display.'), 'the audit reads the screen copy');
    assert.deepEqual(words.filter((w) => MONEY.test(w)), []);
    for (const f of NEW) assert.deepEqual(shown(read(join(COMPONENTS, f))).filter((w) => MONEY.test(w)), [], f);
    assert.doesNotMatch(field, /<(Restricted|Figure|QuantityChip|AmountRow)\b/, 'no money slot, not even a restricted one');
  });

  test('the money audit catches a price on a field screen', () => {
    assert.deepEqual(shown("const a = <SummaryList items={[{ label: 'Gate price', value: 'ZMW 6,800.00 per t' }]} />;").filter((w) => MONEY.test(w)), ['Gate price', 'ZMW 6,800.00 per t']);
  });

  test('[M4.DS.03] every button that captures, sends, switches or revokes draws its working state (AC 6)', () => {
    const working = {
      EnrolPhone: ['Enrolling'], AppSignIn: ['Signing in'], PinSet: ['Saving'], PinUnlock: ['Switching', 'Unlocking'], ProveDelivery: ['Capturing', 'Sending', 'Queued'],
      DeliveryRefused: ['Sending', 'Queued'], SignOutWarning: ['Signing out'],
    };
    for (const [screen, list] of Object.entries(working)) for (const st of list) assert.ok(APP[screen].includes(st), `${screen} draws ${st}`);
    assert.ok(DEVICES.DeviceRecord.includes('Revoking') && DEVICES.NewDevice.includes('Saving'));
    assert.ok(DECISION.CaptureDecision.includes('Approving') && DECISION.CaptureDecision.includes('Rejecting'));
    assert.match(body(field, 'ProveDelivery'), /loading=\{state === 'Capturing'\}>Take photograph</);
    assert.match(body(field, 'DeliveryRefused'), /loading=\{sending\} disabled=\{missing\}>Record refusal</);
    assert.match(body(field, 'SignOutWarning'), /<Button variant="critical" size="small" loading=\{busy\}>Sign out</);
    assert.match(body(field, 'EnrolPhone'), /loading=\{busy\}>Enrol phone</);
  });

  test('[M4.DS.03] sample data is fictional, people are initials, and no em dash', () => {
    const all = [field, devices, review, ...NEW.map((f) => read(join(COMPONENTS, f)))];
    for (const src of all) assert.doesNotMatch(shown(src).join(' | '), /National Milling|Zambeef|\bOwen\b|\bJacques\b|\bRyan\b|\bShakil\b|\bSidharth\b|Sam Banda/);
    for (const src of [...all, read(join(FIELD, 'README.md')), read(join(ADMIN, 'README.md')), read(join(ONE_LINK, 'README.md'))]) assert.doesNotMatch(src, /\u2014| \u2013 /);
  });
});

describe('[M4.DS.03] the components', () => {
  const { CaptureTile, captureBusy, pendingSyncCount, CAPTURE_SYNC } = load('records/CaptureTile.jsx', ['CaptureTile', 'captureBusy', 'pendingSyncCount', 'CAPTURE_SYNC']);
  const { PinPad, pinLocked, PIN_MAX_TRIES } = load('inputs/PinPad.jsx', ['PinPad', 'pinLocked', 'PIN_MAX_TRIES']);
  const { CaptureStatus } = load('navigation/CaptureStatus.jsx', ['CaptureStatus']);
  const spinning = (el) => nodes(el).some((n) => n.type === 'Icon' && n.props.name === 'loader-circle' && n.props.spin);

  test('[M4.DS.03] a queued capture tile keeps its busy state until marked synced', () => {
    for (const sync of ['queued', 'sending']) {
      const tile = CaptureTile({ title: 'Photograph, DN10000437', sync });
      assert.ok(spinning(tile), `${sync} spins`);
      assert.equal(tile.props['data-capture-sync'], sync);
      assert.ok(nodes(tile).some((n) => n.props && n.props['aria-busy'] === 'true'), `${sync} is announced busy`);
    }
    const synced = CaptureTile({ title: 'Photograph, DN10000437', sync: 'synced' });
    assert.ok(!spinning(synced), 'synced stops');
    assert.deepEqual(nodes(synced).filter((n) => n.type === 'StatusMark').map((n) => n.props.label), ['Synced']);
    assert.equal(captureBusy('queued'), true);
    assert.equal(captureBusy('sending'), true);
    assert.equal(captureBusy('synced'), false);
    assert.equal(captureBusy('something new'), true, 'an unknown state is never drawn as done');
    const damaged = CaptureTile({ title: 'Photograph, DN10000435', sync: 'damaged', recapturing: true });
    assert.ok(!spinning(damaged));
    assert.ok(nodes(damaged).some((n) => n.type === 'StatusMark' && n.props.label === 'File is damaged. Capture it again.'));
    const again = nodes(damaged).find((n) => n.type === 'Button');
    assert.equal(textOf(again), 'Capture again');
    assert.equal(again.props.loading, true, 'Capture again shows its working state');
    assert.deepEqual(Object.keys(CAPTURE_SYNC), ['queued', 'sending', 'synced', 'damaged']);
  });

  test('[M4.DS.03] the unsynced count badge never shows 0 while any capture is queued', () => {
    const states = ['queued', 'sending', 'synced', 'damaged'];
    const lists = [];
    for (const a of states) for (const b of states) for (const c of [...states, null]) lists.push([a, b, c].filter(Boolean).map((sync) => ({ sync })));
    for (const list of lists) {
      const count = pendingSyncCount(list);
      const waiting = list.filter((x) => x.sync !== 'synced').length;
      assert.equal(count, waiting);
      const line = textOf(CaptureStatus({ online: false, pending: count }));
      if (list.some((x) => x.sync === 'queued')) assert.ok(count > 0 && line.includes(`Pending sync (${count})`), JSON.stringify(list));
      assert.doesNotMatch(line, /\(0\)/, 'never "Pending sync (0)"');
    }
    assert.equal(pendingSyncCount([]), 0);
    assert.doesNotMatch(textOf(CaptureStatus({ online: true, pending: 0 })), /Pending sync/);
  });

  test('[M4.DS.03] a PIN pad locks its input after the fifth wrong entry', () => {
    assert.equal(PIN_MAX_TRIES, 5);
    assert.deepEqual([0, 1, 4, 5, 6].map((w) => pinLocked(w)), [false, false, false, true, true]);
    const keys = (el) => nodes(el).filter((n) => n.type === 'Button');
    const four = PinPad({ entered: 1, wrong: 4, fingerprint: true });
    assert.equal(keys(four).length, 12, 'ten digits, the fingerprint and delete');
    assert.ok(keys(four).every((k) => !k.props.disabled), 'four wrong: still open');
    const five = PinPad({ entered: 1, wrong: 5, fingerprint: true });
    assert.ok(keys(five).every((k) => k.props.disabled), 'the fifth wrong PIN locks every key');
    assert.equal(five.props['data-locked'], '');
    const busy = PinPad({ entered: 4, busy: true });
    assert.ok(keys(busy).every((k) => k.props.disabled) && spinning(busy), 'checking: keys wait, spinner shows');
    const dots = (el) => nodes(el).filter((n) => n.props && n.props['data-pin-dot']).map((n) => n.props['data-pin-dot']);
    assert.deepEqual(dots(PinPad({ entered: 2 })), ['filled', 'filled', 'empty', 'empty'], 'the pad shows only how many digits, never the PIN');
    assert.deepEqual(keys(PinPad({ entered: 0 })).filter((k) => k.props.icon).map((k) => k.props['aria-label']), ['Delete']);
  });

  test('[M4.DS.03] MobileShell\'s modules and back chevron are opt-in: left out, the shell is drawn as before', () => {
    const shell = read(join(COMPONENTS, 'navigation/MobileShell.jsx'));
    assert.match(shell, /const bottom = showBottomBar \? \(modules \|\| MODULES\.slice\(0, 5\)\) : \[\];/);
    assert.match(shell, /\{onBack \? <IconButton icon="chevron-left" label="Back" onClick=\{onBack\}/);
    assert.match(read(join(COMPONENTS, 'navigation/MobileShell.d.ts')), /modules\?: Array<\{ value: string; label: string; icon: string \}>;[\s\S]*onBack\?: \(\) => void;/);
  });

  test('[M4.DS.03] every new component has its types, a usage note, a loader entry and a place on the components card', () => {
    const card = read(join(COMPONENTS, 'records/capture.card.html'));
    for (const f of NEW) {
      const c = f.replace(/^\w+\/|\.jsx$/g, '');
      for (const ext of ['.jsx', '.d.ts', '.prompt.md']) assert.ok(existsSync(join(COMPONENTS, f.replace(/\.jsx$/, ext))), c + ext);
      assert.ok(dsFiles.includes(f), `${c} is in the loader`);
      assert.ok(card.includes(`<${c}`), `${c} is on the card`);
    }
    assert.match(card, /<MobileShell title="Prove delivery" onBack=/);
  });

  test('the build publishes the new screens, components and card', { skip: !existsSync(join(ROOT, 'dist')) && 'run npm run build first' }, () => {
    const app = read(join(ROOT, 'dist/ui_kits/field_app/ui_kits_field_app_index.kit.js'));
    for (const screen of Object.keys(APP)) assert.ok(app.includes(screen), `${screen} is compiled`);
    const admin = read(join(ROOT, 'dist/ui_kits/admin_workspace/ui_kits_admin_workspace_index.kit.js'));
    for (const screen of [...Object.keys(DEVICES), ...Object.keys(REVIEW)]) assert.ok(admin.includes(screen), `${screen} is compiled`);
    const owen = read(join(ROOT, 'dist/ui_kits/one_link/ui_kits_one_link_index.kit.js'));
    for (const screen of Object.keys(DECISION)) assert.ok(owen.includes(screen), `${screen} is compiled`);
    const ds = read(join(ROOT, 'dist/_ds_bundle.js'));
    for (const c of ['CaptureTile', 'pendingSyncCount', 'captureBusy', 'PinPad', 'pinLocked']) assert.ok(ds.includes(c), `${c} is compiled`);
    assert.ok(existsSync(join(ROOT, 'dist/components/records/capture.card.html')));
  });
});
