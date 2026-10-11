/** The UAG One Link app (M4.DS.03, UAG-185), drawn at 390: enrolment, sign-in, the phone's PIN and fingerprint, the
    field task list, proving delivery, a refused delivery, Pending sync, the sign-out warning and a revoked phone. Every
    screen takes `state`, one of its FIELD_APP_STATES entry, for ?screen=&state=, and draws the whole phone.

    The signed-out screens (enrolment, sign-in) keep the app's current sign-in design and wording, which Henry's ruling
    of 30 Sep 2026 on this card leaves unchanged; they show the name, one sentence and the ways in, nothing else. Full
    sign-in happens once while connected; after that the app opens with the PIN or the fingerprint (S08 J1). The PIN
    screens are before the app opens, so they too show nothing of the business.

    Field screens carry operations words only: no price, value or margin. Every capture screen shows the connection
    status and Pending sync (count); task screens hide the bottom bar, carry the back chevron and put the main action
    full width at the bottom (UX-31). A send that is queued keeps its busy state until the capture has synced.
    Fictional sample data only: DN10000441, Lakeview Farms Ltd, Riverbend Milling, Chisamba Shed, P. Sakala. */

export const FIELD_APP_STATES = {
  EnrolPhone: ['Enrolment code', 'Wrong code', 'Code expired', 'Enrolling'],
  AppSignIn: ['Email and password', 'Incorrect credentials', 'Account locked', 'No connection', 'Code', 'Wrong code', 'Signing in'],
  PinSet: ['Choose a PIN', 'Confirm PIN', 'Does not match', 'Saving', 'Use fingerprint'],
  PinUnlock: ['Fingerprint', 'Switching', 'PIN', 'Wrong PIN', 'Unlocking', 'Locked'],
  FieldTasks: ['Tasks', 'Offline', 'Empty'],
  ProveDelivery: ['Photograph', 'Capturing', 'Signature', 'Details', 'Signature missing', 'Sending', 'Queued', 'Synced'],
  DeliveryRefused: ['Reason', 'Missing reason', 'Sending', 'Queued'],
  PendingSync: ['Offline', 'Sending', 'Damaged file', 'All synced'],
  SignOutWarning: ['Pending captures', 'Signing out'],
  RevokedPhone: ['Capture blocked'],
};

/** The field staff's main areas: the bottom bar on the task list and Pending sync (UX-31). */
export const FIELD_AREAS = [
  { value: 'tasks', label: 'Tasks', icon: 'list-checks' },
  { value: 'sync', label: 'Pending sync', icon: 'refresh-cw' },
];
const FIELD_USER = 'PS';
const PHONE = 844;

/* ------------------------------------------------------------------ Signed out, and the phone's PIN */

/** The signed-out column at the phone's size: the app's current sign-in frame. */
function PhoneSignedOut({ heading, sentence, links, children }) {
  return <div style={{ width: 390, maxWidth: '100%', height: PHONE, overflowY: 'auto' }}><AuthShell heading={heading} sentence={sentence} links={links}>{children}</AuthShell></div>;
}

function FieldWaysBack() {
  return <Button variant="ghost" size="small">Forgot password</Button>;
}

/** The phone is enrolled once, with the code the administrator was shown once in Setup (S10: the same show-once code). */
export function EnrolPhone({ state = 'Enrolment code' }) {
  const wrong = state === 'Wrong code';
  const busy = state === 'Enrolling';
  return (
    <PhoneSignedOut heading="Enrol this phone" sentence="Enter the enrolment code your administrator gave you.">
      {state === 'Code expired' ? <Refusal action="Enrol" reason="This enrolment code has expired. Ask your administrator for a new one" /> : null}
      <Field label="Enrolment code" error={wrong ? 'That enrolment code is not right. Check it with your administrator and try again.' : null}>
        <Input size="large" autoComplete="one-time-code" autoCapitalize="characters" invalid={wrong} disabled={busy} />
      </Field>
      <PressButton kind="large" variant="primary" fullWidth loading={busy}>Enrol phone</PressButton>
    </PhoneSignedOut>
  );
}

/** Full sign-in, once, while connected (S08 J1), in the app's current wording. */
export function AppSignIn({ state = 'Email and password' }) {
  const code = state === 'Code' || state === 'Wrong code';
  const busy = state === 'Signing in';
  if (code) {
    return (
      <PhoneSignedOut heading="Enter your code" sentence="Open your authenticator app and enter the six-digit code for One Link." links={<FieldWaysBack />}>
        <Field label="Code from your app" hint="Six digits. It changes every 30 seconds."
          error={state === 'Wrong code' ? 'That code is not right. Open your authenticator app and enter the code showing now.' : null}>
          <Input size="large" inputMode="numeric" autoComplete="one-time-code" maxLength={6} invalid={state === 'Wrong code'} />
        </Field>
        <PressButton kind="large" variant="primary" fullWidth>Sign in</PressButton>
      </PhoneSignedOut>
    );
  }
  const banner = {
    'Incorrect credentials': <Banner tone="error">Incorrect email or password.</Banner>,
    'Account locked': <Banner tone="error">Your account is locked. Contact your administrator.</Banner>,
    'No connection': <Refusal action="Sign in" reason="This phone is offline. Connect to a network for the first sign-in" />,
  }[state];
  return (
    <PhoneSignedOut heading="Sign in" sentence="Use the email and password for your United African Grain account." links={<FieldWaysBack />}>
      {banner ?? null}
      <Field label="Email"><Input size="large" type="email" autoComplete="username" disabled={busy} /></Field>
      <Field label="Password"><Input size="large" type="password" autoComplete="current-password" disabled={busy} /></Field>
      <PressButton kind="large" variant="primary" fullWidth loading={busy} disabled={state === 'No connection'}>Sign in</PressButton>
    </PhoneSignedOut>
  );
}

/** After the first full sign-in: the phone's PIN, then the offer of the fingerprint. */
export function PinSet({ state = 'Choose a PIN' }) {
  if (state === 'Use fingerprint') {
    return (
      <PhoneSignedOut heading="Use your fingerprint" sentence="Open the app with your fingerprint instead of the PIN.">
        <PressButton kind="large" variant="primary" fullWidth icon="fingerprint">Use fingerprint</PressButton>
        <Button variant="ghost" size="large" fullWidth>Not now</Button>
      </PhoneSignedOut>
    );
  }
  const confirm = state !== 'Choose a PIN';
  return (
    <PhoneSignedOut heading={confirm ? 'Confirm your PIN' : 'Set your PIN'} sentence={confirm ? 'Enter the same 4 digits again.' : 'Choose 4 digits to open the app on this phone.'}>
      <PinPad entered={state === 'Does not match' ? 0 : state === 'Saving' ? 4 : confirm ? 2 : 1} busy={state === 'Saving'}
        error={state === 'Does not match' ? 'The PINs do not match. Choose your PIN again.' : null} />
    </PhoneSignedOut>
  );
}

/** Opening the app: the fingerprint, the switch to the PIN and back, and the lock after the fifth wrong PIN. */
export function PinUnlock({ state = 'Fingerprint' }) {
  if (state === 'Fingerprint' || state === 'Switching') {
    return (
      <PhoneSignedOut heading="Open with your fingerprint" sentence="Touch the fingerprint sensor.">
        <EmptyState tone="neutral" icon="fingerprint" title="Waiting for your fingerprint" />
        <Button variant="outline" size="large" fullWidth loading={state === 'Switching'}>Use PIN</Button>
      </PhoneSignedOut>
    );
  }
  const locked = state === 'Locked';
  const wrong = state === 'Wrong PIN' ? 2 : locked ? 5 : 0;
  return (
    <PhoneSignedOut heading="Enter your PIN" sentence={locked ? null : 'Or use your fingerprint.'}>
      {locked ? <Refusal action="PIN entry" reason="Sign in again with your email and password" /> : null}
      <PinPad entered={state === 'Unlocking' ? 4 : 0} wrong={wrong} busy={state === 'Unlocking'} fingerprint={!locked}
        error={state === 'Wrong PIN' ? 'That PIN is not right. 3 tries left.' : null} />
      {locked ? <PressButton kind="large" variant="primary" fullWidth>Sign in</PressButton> : null}
    </PhoneSignedOut>
  );
}

/* ------------------------------------------------------------------ Signed in: tasks, capture, Pending sync */

/** A delivery to prove (F4.8 at the farm, F3.9 at the mill or delivery point). Quantities only: no price anywhere. */
const FIELD_TASKS = [
  { id: 'dn441', ref: 'DN10000441', task: 'Prove delivery', to: 'Lakeview Farms Ltd, Mkushi', load: 'D Compound 50 kg, 400 bags', sync: '' },
  { id: 'dn443', ref: 'DN10000443', task: 'Prove delivery', to: 'Riverbend Milling, Lusaka', load: 'White maize, 32.140 t', sync: '' },
  { id: 'dn437', ref: 'DN10000437', task: 'Prove delivery', to: 'Cameron Estates, Chisamba', load: 'Urea 50 kg, 240 bags', sync: 'queued' },
];
const TASK = FIELD_TASKS[0];

/** The signed-in phone: the field areas in the bottom bar on a list, the back chevron and no bar on a task (UX-31). */
function FieldPhone({ title, area, task = false, children, overlay }) {
  return (
    <MobileShell title={title} initials={FIELD_USER} height={PHONE} modules={FIELD_AREAS} module={area}
      showBottomBar={!task} onBack={task ? () => {} : undefined}>
      {children}
      {overlay}
    </MobileShell>
  );
}

/** The main action of a task screen: full width at the bottom (UX-31). */
function TaskAction({ children }) {
  return <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>;
}

function TaskCard({ task = TASK }) {
  return (
    <Card padding={16} gap={8}>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text variant="body-4" tone="secondary">Delivery note</Text>
        <Text variant="heading-3" strong tabular>{task.ref}</Text>
      </span>
      <SummaryList items={[{ label: 'Deliver to', value: task.to }, { label: 'Load', value: task.load }]} />
    </Card>
  );
}

export function FieldTasks({ state = 'Tasks' }) {
  const offline = state === 'Offline';
  const tasks = state === 'Empty' ? [] : offline ? FIELD_TASKS : FIELD_TASKS.slice(0, 2);
  return (
    <FieldPhone title="Field tasks" area="tasks">
      <CaptureStatus online={!offline} pending={pendingSyncCount(tasks.filter((t) => t.sync).map((t) => ({ sync: t.sync })))} />
      {tasks.length ? tasks.map((t) => (
        <Card key={t.id} padding={16} gap={8} interactive onClick={() => {}}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text variant="body-2" strong tabular>{t.ref}</Text>
            {t.sync ? <StatusMark kind="pending" label="Pending sync" size="body-4" /> : null}
          </span>
          <SummaryList items={[{ label: 'Task', value: t.task }, { label: 'Deliver to', value: t.to }, { label: 'Load', value: t.load }]} />
        </Card>
      )) : <Card><EmptyState title="No field tasks to display." /></Card>}
    </FieldPhone>
  );
}

/** Proving delivery (F4.8, F3.9): a photograph and the receiver's signature, both required, then the receiver's name
    and the quantity received. Send stays disabled until both are captured (UX-17); once pressed it stays busy until the
    capture has synced, however long the phone is offline. */
export function ProveDelivery({ state = 'Photograph' }) {
  const order = FIELD_APP_STATES.ProveDelivery;
  const at = order.indexOf(state);
  const photo = at >= order.indexOf('Signature');
  const signed = at >= order.indexOf('Details') && state !== 'Signature missing';
  const sending = state === 'Sending' || state === 'Queued';
  const synced = state === 'Synced';
  const offline = state === 'Queued';
  const details = at >= order.indexOf('Details');
  const ready = photo && signed;
  const captures = sending ? [{ sync: state === 'Sending' ? 'sending' : 'queued' }] : [];
  return (
    <FieldPhone title="Prove delivery" task>
      <CaptureStatus online={!offline} pending={pendingSyncCount(captures)} />
      <TaskCard />
      {synced ? <Banner tone="success">Proof of delivery synced.</Banner> : null}
      <Card title="Photograph" padding={16}>
        {photo ? (
          <span style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <EvidenceTile caption="photo-dn10000441" time="14:41" />
            {sending || synced ? null : <Button variant="outline" size="xsmall" icon="camera">Retake</Button>}
          </span>
        ) : <PressButton kind="large" variant="outline" fullWidth icon="camera" loading={state === 'Capturing'}>Take photograph</PressButton>}
      </Card>
      <Card title="Receiver signature" padding={16}>
        {signed ? <EvidenceTile kind="document" caption="signature-dn10000441" time="14:43" /> : (
          <Field error={state === 'Signature missing' ? 'Receiver signature is required.' : null}>
            <PressButton kind="large" variant="outline" fullWidth icon="pencil" disabled={!photo}>Capture signature</PressButton>
          </Field>
        )}
      </Card>
      {details ? (
        <Card padding={16} gap={16}>
          <Field label="Receiver name" required><Input defaultValue="J. Mwanza" disabled={sending || synced} /></Field>
          <Field label="Received (bags)" required><Input inputMode="numeric" align="right" defaultValue="400" disabled={sending || synced} /></Field>
        </Card>
      ) : null}
      <TaskAction>
        {synced ? <PressButton kind="large" variant="primary" fullWidth>Done</PressButton> : (
          <PressButton kind="large" variant="primary" fullWidth loading={sending} disabled={!ready && !sending}>Send</PressButton>
        )}
        {at <= order.indexOf('Capturing') ? <Button variant="ghost" size="large" fullWidth>Delivery refused</Button> : null}
      </TaskAction>
    </FieldPhone>
  );
}

const REFUSAL_REASONS = ['Choose a reason', 'Damaged bags', 'Wrong product', 'Short delivery', 'Not ordered', 'Other'];

/** The receiver refuses the delivery: the reason, a photograph, the receiver's name and a comment, sent like a proof. */
export function DeliveryRefused({ state = 'Reason' }) {
  const sending = state === 'Sending' || state === 'Queued';
  const missing = state === 'Missing reason';
  return (
    <FieldPhone title="Delivery refused" task>
      <CaptureStatus online={state !== 'Queued'} pending={pendingSyncCount(sending ? [{ sync: state === 'Sending' ? 'sending' : 'queued' }] : [])} />
      <TaskCard />
      <Card padding={16} gap={16}>
        <Field label="Reason" required error={missing ? 'Reason is required.' : null}>
          <Select options={REFUSAL_REASONS} defaultValue={missing ? 'Choose a reason' : 'Damaged bags'} invalid={missing} disabled={sending} />
        </Field>
        <Field label="Receiver name" required><Input defaultValue="J. Mwanza" disabled={sending} /></Field>
        <Field label="Comment"><Input multiline defaultValue="12 bags torn at the seams." disabled={sending} /></Field>
      </Card>
      <Card title="Photograph" padding={16}>
        <EvidenceTile caption="photo-dn10000441-refused" time="14:52" />
      </Card>
      <TaskAction>
        <PressButton kind="large" variant="primary" fullWidth loading={sending} disabled={missing}>Record refusal</PressButton>
      </TaskAction>
    </FieldPhone>
  );
}

const PENDING = [
  { id: 'c1', kind: 'photo', title: 'Photograph, DN10000437', meta: 'Taken 26 Sep 2026, 11:20 CAT' },
  { id: 'c2', kind: 'signature', title: 'Receiver signature, DN10000437', meta: 'Taken 26 Sep 2026, 11:22 CAT' },
  { id: 'c3', kind: 'photo', title: 'Photograph, DN10000435', meta: 'Taken 26 Sep 2026, 09:05 CAT' },
];

/** Everything captured on this phone that the server has not confirmed. Its count is the "Pending sync (count)" on
    every capture screen; it is never 0 while anything waits, and an empty list says so. */
export function PendingSync({ state = 'Offline' }) {
  const sync = { Offline: ['queued', 'queued', 'queued'], Sending: ['sending', 'queued', 'queued'], 'Damaged file': ['queued', 'queued', 'damaged'], 'All synced': [] }[state];
  const captures = PENDING.slice(0, sync.length).map((c, i) => ({ ...c, sync: sync[i] }));
  return (
    <FieldPhone title="Pending sync" area="sync">
      <CaptureStatus online={state !== 'Offline'} pending={pendingSyncCount(captures)} />
      <Card padding={16} gap={16}>
        {captures.length ? captures.map((c) => <CaptureTile key={c.id} kind={c.kind} title={c.title} meta={c.meta} sync={c.sync} />)
          : <EmptyState title="No captures to display." />}
      </Card>
    </FieldPhone>
  );
}

/** Signing out with captures still waiting: the S57 destructive confirmation, over the task list. */
export function SignOutWarning({ state = 'Pending captures' }) {
  const busy = state === 'Signing out';
  return (
    <FieldPhone title="Field tasks" area="tasks"
      overlay={<Dialog contained sheet title="Sign out?" footer={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button variant="critical" size="small" loading={busy}>Sign out</Button></>}>
        2 captures are pending sync. They send after you sign in again on this phone.
      </Dialog>}>
      <CaptureStatus online={false} pending={2} />
      <TaskCard />
    </FieldPhone>
  );
}

/** A revoked phone (UX-21, S57 blocked action): capture is refused, and the person is told what to do next. */
export function RevokedPhone() {
  return (
    <FieldPhone title="Prove delivery" task>
      <CaptureStatus online pending={0} />
      <Refusal action="Capture" reason="This phone is revoked" />
      <Text variant="body-3" tone="secondary">Contact your administrator.</Text>
      <TaskCard />
      <TaskAction>
        <PressButton kind="large" variant="primary" fullWidth disabled>Take photograph</PressButton>
      </TaskAction>
    </FieldPhone>
  );
}
