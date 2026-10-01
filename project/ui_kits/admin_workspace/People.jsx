/** Setup: people and access (M1.DS.02). The signed-out screens (Sign in, and a new account's activation with
    two-step sign-in), Users and a user's record with the activation code shown once, Bundles and a bundle's record,
    Audit logs (the Access log) and the access review. Every screen takes `state`, one of its PEOPLE_STATES entry.

    The signed-out screens keep the app's current design and wording (Henry's ruling of 30 Sep 2026 on this card):
    the AuthShell frame, its heading and one sentence, Forgot password and Back to home. Nothing before sign-in: no
    name, reference, figure or preview on them. Fictional sample data only. */

export const PEOPLE_STATES = {
  SignIn: ['Email and password', 'Incorrect credentials', 'Account locked', 'Session expired', 'Code', 'Wrong code', 'Signing in'],
  Activate: ['Activation code', 'Wrong code', 'Code expired', 'Choose a password', 'Set up two-step sign-in', 'Wrong two-step code'],
  UsersList: ['All', 'Locked', 'No match'],
  NewUser: ['Form', 'Missing fields', 'Saving', 'Code shown once'],
  UserRecord: ['Active', 'Invited', 'Code expired', 'Locked', 'Reissued code', 'Reset authenticator', 'Deactivated', 'Deactivated for inactivity', 'Own record', 'Only administrator'],
  BundlesList: ['All'],
  BundleRecord: ['Finance', 'Edit', 'Submitting', 'Pending approval', 'Own bundle refused'],
  AccessLog: ['Access log', 'Exporting', 'No match'],
  AccessReview: ['Who holds what', 'Exporting'],
};

/** The record a People screen's state shows, for the breadcrumb. */
export function peopleTitle(screen, state) {
  if (screen === 'NewUser') return 'New user';
  if (screen === 'UserRecord') return userFor(state).name;
  if (screen === 'BundleRecord') return 'Finance';
  return null;
}

const PEOPLE_ACTIVE = <StatusMark kind="clean" label="Active" size="body-4" />;
const STATUS = {
  Active: PEOPLE_ACTIVE,
  Invited: <StatusMark kind="pending" label="Invited" size="body-4" />,
  Locked: <StatusMark kind="locked" label="Locked" size="body-4" />,
  Deactivated: <StatusMark kind="neutral" label="Deactivated" size="body-4" />,
};

/* ------------------------------------------------------------------ Signed out (current design and wording) */

/** A stand-in matrix for the kit: the three finder squares and a scatter, never a real secret. */
function sampleQrMatrix(n = 25) {
  const finder = (r, c, top, left) => {
    const y = r - top; const x = c - left;
    if (y < 0 || x < 0 || y > 6 || x > 6) return null;
    return y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4);
  };
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => {
    const f = finder(r, c, 0, 0) ?? finder(r, c, 0, n - 7) ?? finder(r, c, n - 7, 0);
    if (f !== null) return f;
    if ((r < 8 && (c < 8 || c > n - 9)) || (r > n - 9 && c < 8)) return false;
    return ((r * 31 + c * 17 + r * c) % 7) < 3;
  }));
}

function SignedOutLinks() {
  return <><Button variant="ghost" size="small">Forgot password</Button><Button variant="ghost" size="small">Back to home</Button></>;
}

export function SignIn({ state = 'Email and password' }) {
  const code = state === 'Code' || state === 'Wrong code';
  const busy = state === 'Signing in';
  const banner = {
    'Incorrect credentials': <Banner tone="error">Incorrect email or password.</Banner>,
    'Account locked': <Banner tone="error">Your account is locked. Contact your administrator.</Banner>,
    'Session expired': <Banner tone="info">Your session expired. Sign in again to continue.</Banner>,
  }[state];
  if (code) {
    return (
      <AuthShell heading="Enter your code" sentence="Open your authenticator app and enter the six-digit code for One Link." links={<SignedOutLinks />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Code from your app" hint="Six digits. It changes every 30 seconds."
            error={state === 'Wrong code' ? 'That code is not right. Open your authenticator app and enter the code showing now.' : null}>
            <Input size="large" inputMode="numeric" autoComplete="one-time-code" maxLength={6} invalid={state === 'Wrong code'} />
          </Field>
          <PressButton kind="large" variant="primary" fullWidth>Sign in</PressButton>
        </div>
      </AuthShell>
    );
  }
  return (
    <AuthShell heading="Sign in" sentence="Use the email and password for your United African Grain account." links={<SignedOutLinks />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {banner ?? null}
        <Field label="Email"><Input size="large" type="email" autoComplete="username" disabled={busy} /></Field>
        <Field label="Password"><Input size="large" type="password" autoComplete="current-password" disabled={busy} /></Field>
        <PressButton kind="large" variant="primary" fullWidth loading={busy}>Sign in</PressButton>
      </div>
    </AuthShell>
  );
}

/** A new account's first visit: the activation code an administrator handed over, a password, then two-step sign-in. */
export function Activate({ state = 'Activation code' }) {
  if (state === 'Choose a password') {
    return (
      <AuthShell heading="Set your password" sentence="Choose a password to finish activating your account." links={<SignedOutLinks />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="New password" hint="At least 8 characters, with upper and lower case letters, a number and a symbol."><Input size="large" type="password" autoComplete="new-password" /></Field>
          <Field label="Confirm new password"><Input size="large" type="password" autoComplete="new-password" /></Field>
          <PressButton kind="large" variant="primary" fullWidth>Set password and continue</PressButton>
        </div>
      </AuthShell>
    );
  }
  if (state === 'Set up two-step sign-in' || state === 'Wrong two-step code') {
    return (
      <AuthShell heading="Set up two-step sign-in" sentence="Scan this with your authenticator app. It will show One Link and your email address." links={<SignedOutLinks />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'stretch' }}>
          <QrCode matrix={sampleQrMatrix()} size={168} label="Code to scan with your authenticator app" style={{ alignSelf: 'center' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={textStyle('body-4', { tone: 'tertiary' })}>Cannot scan it? Type this code into the app instead.</span>
            <span style={{ ...textStyle('body-3', { strong: true }), letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}>ABCD EFGH IJKL MNOP</span>
          </div>
          <Field label="Code from your app" hint="Six digits. It changes every 30 seconds."
            error={state === 'Wrong two-step code' ? 'That code is not right. Open your authenticator app and enter the code showing now.' : null}>
            <Input size="large" inputMode="numeric" autoComplete="one-time-code" maxLength={6} invalid={state === 'Wrong two-step code'} />
          </Field>
          <PressButton kind="large" variant="primary" fullWidth>Turn on two-step sign-in</PressButton>
        </div>
      </AuthShell>
    );
  }
  return (
    <AuthShell heading="Activate your account" sentence="Enter your email and the activation code your administrator gave you." links={<SignedOutLinks />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {state === 'Code expired' ? <Refusal action="Activate" reason="This activation code has expired. Ask your administrator for a new one" /> : null}
        <Field label="Email"><Input size="large" type="email" autoComplete="username" /></Field>
        <Field label="Activation code" error={state === 'Wrong code' ? 'That activation code is not right. Check it with your administrator and try again.' : null}>
          <Input size="large" autoComplete="one-time-code" autoCapitalize="characters" invalid={state === 'Wrong code'} />
        </Field>
        <PressButton kind="large" variant="primary" fullWidth>Continue</PressButton>
      </div>
    </AuthShell>
  );
}

/* ------------------------------------------------------------------ Users */

const USERS = [
  { id: 'tm', name: 'T. Mwila', email: 't.mwila@example.com', bundles: 'Managing director', sites: 'All sites', status: 'Active', last: '26 Sep 2026, 06:58' },
  { id: 'jt', name: 'J. Tembo', email: 'j.tembo@example.com', bundles: 'Trading', sites: 'All sites', status: 'Active', last: '26 Sep 2026, 07:40' },
  { id: 'np', name: 'N. Phiri', email: 'n.phiri@example.com', bundles: 'Finance, Administrator', sites: 'All sites', status: 'Active', last: '26 Sep 2026, 07:12' },
  { id: 'rd', name: 'R. Daka', email: 'r.daka@example.com', bundles: 'Warehouse, Trading support', sites: 'All sites', status: 'Active', last: '26 Sep 2026, 07:05' },
  { id: 'lm', name: 'L. Mulenga', email: 'l.mulenga@example.com', bundles: 'Operations', sites: 'All sites', status: 'Active', last: '25 Sep 2026, 17:48' },
  { id: 'kz', name: 'K. Zulu', email: 'k.zulu@example.com', bundles: 'Warehouse', sites: 'Chisamba Shed', status: 'Locked', last: '24 Sep 2026, 15:10' },
  { id: 'cb', name: 'C. Banda', email: 'c.banda@example.com', bundles: 'Clerk', sites: 'Chisamba Shed', status: 'Invited', last: '' },
  { id: 'ml', name: 'M. Lungu', email: 'm.lungu@example.com', bundles: 'Stock control', sites: 'Mpongwe Depot', status: 'Deactivated', last: '12 Jun 2026, 08:15' },
];

export function UsersList({ state = 'All', onOpen }) {
  const rows = state === 'No match' ? [] : state === 'Locked' ? USERS.filter((u) => u.status === 'Locked') : USERS;
  return (
    <ListView title="Users" objects="users" search="Search users" view={state === 'Locked' ? 'Locked users' : 'All users'}
      primary={<Button size="small" icon="plus">New</Button>}
      columns={[
        { key: 'name', label: 'Name', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink> },
        { key: 'email', label: 'Email' },
        { key: 'bundles', label: 'Bundles' },
        { key: 'sites', label: 'Sites', width: '150px' },
        { key: 'last', label: 'Last sign-in', width: '170px', tabular: true },
        { key: 'status', label: 'Status', width: '150px', render: (r) => STATUS[r.status] },
      ]} rows={rows} />
  );
}

const BUNDLE_OPTIONS = [
  { value: 'Managing director', label: 'Managing director', hint: 'Price tiers: Gate, Contract, Sell, Farmer account' },
  { value: 'Trading', label: 'Trading', hint: 'Price tiers: Gate, Contract' },
  { value: 'Trading support', label: 'Trading support', hint: 'Price tiers: Contract' },
  { value: 'Finance', label: 'Finance', hint: 'Price tiers: Gate, Contract, Sell, Farmer account' },
  { value: 'Operations', label: 'Operations', hint: 'Price tiers: Gate, Contract, Sell, Farmer account' },
  { value: 'Stock control', label: 'Stock control', hint: 'Price tiers: Gate' },
  { value: 'Warehouse', label: 'Warehouse' },
  { value: 'Clerk', label: 'Clerk' },
  { value: 'Field capture', label: 'Field capture' },
  { value: 'Administrator', label: 'Administrator' },
];
const SITE_OPTIONS = ['All sites', 'Chisamba Shed', 'Mpongwe Depot'];

export function NewUser({ state = 'Form' }) {
  const missing = state === 'Missing fields';
  const busy = state === 'Saving';
  return (
    <Sections>
      <SetupHead title="New user" right={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Save</Button></>} />
      <Card title="User information" padding={16}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <Field label="First name" required error={missing ? 'First name is required.' : null}><Input defaultValue={missing ? '' : 'Chanda'} invalid={missing} disabled={busy} /></Field>
          <Field label="Last name" required><Input defaultValue="Banda" disabled={busy} /></Field>
          <Field label="Email" required error={missing ? 'Email must be an email address.' : null}><Input type="email" defaultValue={missing ? 'c.banda' : 'c.banda@example.com'} invalid={missing} disabled={busy} /></Field>
        </div>
      </Card>
      <Card title="Access" padding={16}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          <Field label="Bundles" required error={missing ? 'Bundles must include at least one bundle.' : null}>
            <CheckboxList options={BUNDLE_OPTIONS} values={missing ? [] : ['Clerk']} disabled={busy} />
          </Field>
          <Field label="Sites" required><CheckboxList options={SITE_OPTIONS} values={['Chisamba Shed']} disabled={busy} /></Field>
        </div>
      </Card>
      {state === 'Code shown once' ? <OneTimeCode code="7Q4-K9M-2XP" expires="28 Sep 2026, 09:15 CAT" /> : null}
    </Sections>
  );
}

function userFor(state) {
  if (state === 'Own record') return USERS[2];
  if (state === 'Invited' || state === 'Code expired' || state === 'Reissued code') return USERS[6];
  if (state === 'Locked') return USERS[5];
  if (state === 'Deactivated' || state === 'Deactivated for inactivity') return USERS[7];
  return USERS[3];
}

export function UserRecord({ state = 'Active' }) {
  const [tab, setTab] = useState('Details');
  const u = userFor(state);
  const deactivated = state.startsWith('Deactivated');
  const status = deactivated ? 'Deactivated' : state === 'Own record' || state === 'Only administrator' ? 'Active' : u.status;
  const own = state === 'Own record';
  const active = status === 'Active';
  const fields = [
    { label: 'Email', value: u.email },
    { label: 'Bundles', value: state === 'Only administrator' ? 'Administrator' : u.bundles },
    { label: 'Sites', value: u.sites },
    { label: 'Activated', value: status === 'Invited' ? '' : '02 Sep 2026, 10:20' },
    { label: 'Last sign-in', value: u.last },
    ...(status === 'Invited' ? [{ label: 'Activation code', value: state === 'Code expired' ? 'Expired 28 Sep 2026, 09:15 CAT' : 'Expires 28 Sep 2026, 09:15 CAT' }] : []),
    ...(deactivated ? [{ label: 'Deactivated', value: state === 'Deactivated for inactivity' ? '10 Sep 2026, 00:00: inactive for 90 days' : '15 Sep 2026, 11:30' }] : []),
  ];
  const actions = own || deactivated ? null : (
    <>
      {status === 'Invited' || status === 'Locked' ? <Button variant="outline" size="small">Reissue activation code</Button> : null}
      {active ? <><Button variant="outline" size="small">Edit bundles</Button><Button variant="outline" size="small">Reset authenticator</Button><Button variant="critical-ghost" size="small">Deactivate</Button></> : null}
    </>
  );
  const history = [
    ...(state === 'Reissued code' ? [{ id: 'h3', field: 'Activation code', user: 'N. Phiri', old: 'Expired', next: 'Reissued, expires 01 Oct 2026, 10:00', date: '28 Sep 2026, 10:00' }] : []),
    ...(deactivated ? [{ id: 'h4', field: 'Status', user: state === 'Deactivated for inactivity' ? 'One Link' : 'N. Phiri', old: 'Active', next: 'Deactivated', date: state === 'Deactivated for inactivity' ? '10 Sep 2026, 00:00' : '15 Sep 2026, 11:30' }] : []),
    { id: 'h2', field: 'Bundles', user: 'T. Mwila', old: 'Finance', next: u.bundles, date: '02 Sep 2026, 10:05' },
    { id: 'h1', field: 'User', user: 'T. Mwila', old: '', next: 'Created', date: '01 Sep 2026, 14:30' },
  ];
  return (
    <Sections>
      <SetupHead title={u.name} />
      {own ? <Banner tone="info">You can't change your own access.</Banner> : null}
      {state === 'Only administrator' ? <Refusal action="Deactivate" reason="This is the only active administrator" /> : null}
      <RecordHighlights kind="User" title={u.name} status={STATUS[status]} actions={actions} fields={fields} tab={tab} onTab={setTab} />
      {tab === 'History' ? (
        <CountCard title="History" objects="changes" count={history.length}>
          <SetupTable columns={[
            { key: 'field', label: 'Field', width: '150px' }, { key: 'user', label: 'User', width: '150px' },
            { key: 'old', label: 'Old value' }, { key: 'next', label: 'New value' }, { key: 'date', label: 'Date', width: '170px', tabular: true },
          ]} rows={history} />
        </CountCard>
      ) : (
        <Card title="Assignments" padding={16}>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[['Bundles', u.bundles], ['Sites', u.sites], ['Delivery points', u.sites === 'All sites' ? 'All delivery points' : `${u.sites} intake`]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><dt style={textStyle('body-4', { tone: 'secondary' })}>{l}</dt><dd style={{ margin: 0, ...textStyle('body-3') }}>{v}</dd></div>
            ))}
          </dl>
        </Card>
      )}
      {state === 'Reissued code' ? <OneTimeCode code="P3W-8RT-6LN" expires="01 Oct 2026, 10:00 CAT" /> : null}
      {state === 'Reset authenticator' ? (
        <ReasonDialog title="Reset authenticator" label="Reason" minLength={1} confirmLabel="Reset authenticator">R. Daka sets up two-step sign-in again at the next sign-in.</ReasonDialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Bundles */

const BUNDLES = [
  { id: 'md', name: 'Managing director', users: 1, tiers: 'Gate, Contract, Sell, Farmer account', status: 'Active' },
  { id: 'trading', name: 'Trading', users: 1, tiers: 'Gate, Contract', status: 'Active' },
  { id: 'support', name: 'Trading support', users: 1, tiers: 'Contract', status: 'Active' },
  { id: 'finance', name: 'Finance', users: 1, tiers: 'Gate, Contract, Sell, Farmer account', status: 'Active' },
  { id: 'operations', name: 'Operations', users: 1, tiers: 'Gate, Contract, Sell, Farmer account', status: 'Active' },
  { id: 'stock', name: 'Stock control', users: 1, tiers: 'Gate', status: 'Active' },
  { id: 'warehouse', name: 'Warehouse', users: 2, tiers: '', status: 'Active' },
  { id: 'clerk', name: 'Clerk', users: 1, tiers: '', status: 'Active' },
  { id: 'field', name: 'Field capture', users: 0, tiers: '', status: 'Active' },
  { id: 'admin', name: 'Administrator', users: 1, tiers: '', status: 'Active' },
];

export function BundlesList({ onOpen }) {
  return (
    <ListView title="Bundles" objects="bundles" search="Search bundles" view="All bundles"
      columns={[
        { key: 'name', label: 'Bundle', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink> },
        { key: 'users', label: 'Users', align: 'right', width: '90px' },
        { key: 'tiers', label: 'Price tiers' },
        { key: 'status', label: 'Status', width: '150px', render: () => PEOPLE_ACTIVE },
      ]} rows={BUNDLES} />
  );
}

const CAPABILITIES = [
  ['View contracts', 'Trading'], ['View invoices and payments', 'Finance'], ['Record payments', 'Finance'], ['Run settlement batches', 'Finance'],
  ['Release collateral', 'Finance'], ['Allocate import permits', 'Imports'], ['Maintain exchange rates', 'Finance'], ['Export reports', 'Reports'],
];
const PRICE_TIERS = [
  ['Gate', 'Gate price and gate-purchase receipt values'], ['Contract', 'Buy and sell prices, transport rates, margin, stock value'],
  ['Sell', 'Invoice-ready amounts, payments, shortage claims'], ['Farmer account', 'Advances, input debt, payables, statements'],
];

export function BundleRecord({ state = 'Finance' }) {
  const [tab, setTab] = useState('Details');
  const editing = state === 'Edit' || state === 'Submitting';
  const pending = state === 'Pending approval';
  const busy = state === 'Submitting';
  return (
    <Sections>
      <SetupHead title="Finance" />
      {pending ? <ConditionBanner>Change to Finance submitted for approval by N. Phiri, 26 Sep 2026, 07:30 CAT. Waiting for T. Mwila.</ConditionBanner> : null}
      {state === 'Own bundle refused' ? <Refusal action="Submit for approval" reason="You hold the Finance bundle, and no one changes their own access" /> : null}
      <RecordHighlights kind="Bundle" title="Finance" status={pending ? <StatusMark kind="pending" label="Pending approval" size="body-4" /> : PEOPLE_ACTIVE} tab={tab} onTab={setTab}
        actions={pending ? null : editing ? <><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Submit for approval</Button></> : <Button variant="outline" size="small">Edit</Button>}
        fields={[{ label: 'Users', value: '1' }, { label: 'Price tiers', value: 'Gate, Contract, Sell, Farmer account' }, { label: 'Capabilities', value: '8' }, { label: 'Last approved by', value: 'T. Mwila' }, { label: 'Last approved', value: '02 Sep 2026, 10:05' }]} />
      {editing ? (
        <Card title="Edit bundle" padding={16}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            <Field label="Capabilities"><CheckboxList options={[...CAPABILITIES.map(([c]) => c), 'Export farmer statements']} values={[...CAPABILITIES.map(([c]) => c), 'Export farmer statements']} disabled={busy} /></Field>
            <Field label="Price tiers"><CheckboxList options={PRICE_TIERS.map(([t, covers]) => ({ value: t, label: t, hint: covers }))} values={PRICE_TIERS.map(([t]) => t)} disabled={busy} /></Field>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
          <CountCard title="Capabilities" objects="capabilities" count={CAPABILITIES.length}>
            <SetupTable columns={[{ key: 'c', label: 'Capability' }, { key: 'a', label: 'Area', width: '120px' }]} rows={CAPABILITIES.map(([c, a]) => ({ id: c, c, a }))} />
          </CountCard>
          <CountCard title="Price tiers" objects="price tiers" count={PRICE_TIERS.length}>
            <SetupTable columns={[{ key: 't', label: 'Price tier', width: '140px' }, { key: 'covers', label: 'Covers' }]} rows={PRICE_TIERS.map(([t, covers]) => ({ id: t, t, covers }))} />
          </CountCard>
        </div>
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Audit logs and the access review */

const ACCESS = [
  { id: 'a7', time: '26 Sep 2026, 08:44', user: 'N. Phiri', action: 'Exported', resource: 'Access log, 25 to 26 Sep 2026, 7 rows', source: 'Web, 102.144.18.7' },
  { id: 'a6', time: '26 Sep 2026, 08:40', user: 'N. Phiri', action: 'Changed', resource: 'Setting GRN reconcile tolerance', source: 'Web, 102.144.18.7' },
  { id: 'a5', time: '26 Sep 2026, 07:31', user: 'N. Phiri', action: 'Exported', resource: 'Report Receivables ageing, 1 row', source: 'Web, 102.144.18.7' },
  { id: 'a4', time: '26 Sep 2026, 07:15', user: 'T. Mwila', action: 'Opened', resource: 'Contract SYN4702', source: 'Web, 41.72.110.3' },
  { id: 'a3', time: '26 Sep 2026, 07:12', user: 'N. Phiri', action: 'Signed in', resource: '', source: 'Web, 102.144.18.7' },
  { id: 'a2', time: '26 Sep 2026, 06:58', user: 'T. Mwila', action: 'Signed in', resource: '', source: 'Web, 41.72.110.3' },
  { id: 'a1', time: '25 Sep 2026, 17:02', user: 'k.zulu', action: 'Sign-in failed', resource: '', source: 'Web, 197.212.4.90' },
];

export function AccessLog({ state = 'Access log' }) {
  const [tab, setTab] = useState('Access log');
  const rows = state === 'No match' ? [] : ACCESS;
  return (
    <Sections>
      <SetupHead title="Audit logs" />
      <Tabs tabs={['Access log', 'Business changes', 'Cloud activity']} value={tab} onChange={setTab} height={44} variant="panel" />
      {tab !== 'Access log' ? <DrawnElsewhere title={tab} card="M1.DS.03" /> : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, flex: '1 1 480px' }}>
              <Field label="From"><Input type="date" defaultValue="2026-09-25" /></Field>
              <Field label="To"><Input type="date" defaultValue="2026-09-26" /></Field>
              <Field label="User"><Select options={['All users', ...USERS.map((u) => u.name)]} /></Field>
            </div>
            <Button variant="outline" size="small" icon="download" loading={state === 'Exporting'}>Export</Button>
          </div>
          {rows.length ? <SetupTable columns={[
            { key: 'time', label: 'Time (CAT)', width: '170px', tabular: true }, { key: 'user', label: 'User', width: '130px' },
            { key: 'action', label: 'Action', width: '140px' }, { key: 'resource', label: 'Resource' }, { key: 'source', label: 'Source', width: '170px' },
          ]} rows={rows} /> : <Card><EmptyState title="No access records to display." /></Card>}
        </>
      )}
    </Sections>
  );
}

const HOLDINGS = USERS.filter((u) => u.status !== 'Deactivated').map((u) => ({
  ...u, tiers: [...new Set(BUNDLES.filter((b) => u.bundles.split(', ').includes(b.name)).flatMap((b) => (b.tiers ? b.tiers.split(', ') : [])))].join(', '),
  granted: u.id === 'cb' ? 'N. Phiri, 25 Sep 2026' : 'T. Mwila, 01 Sep 2026',
}));

/** Who holds what today (S10 control 5): every active and invited user with their bundles, price tiers and sites, ready to hand an auditor. */
export function AccessReview({ state = 'Who holds what' }) {
  return (
    <Sections>
      <SetupHead title="Access review" count={HOLDINGS.length} right={<Button variant="outline" size="small" icon="download" loading={state === 'Exporting'}>Export</Button>} />
      <Text variant="body-3" tone="secondary">As at 01 Oct 2026, 09:00 CAT</Text>
      <SetupTable columns={[
        { key: 'name', label: 'User', width: '130px' }, { key: 'bundles', label: 'Bundles' }, { key: 'tiers', label: 'Price tiers' },
        { key: 'sites', label: 'Sites', width: '140px' }, { key: 'granted', label: 'Granted by', width: '190px' },
        { key: 'status', label: 'Status', width: '150px', render: (r) => STATUS[r.status] },
      ]} rows={HOLDINGS} />
    </Sections>
  );
}
