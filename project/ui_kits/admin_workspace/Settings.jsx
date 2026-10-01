/** Setup: settings and governance (M1.DS.01). Setup Home, the user menu with Setup, Settings, a setting's record
    with its schedule, lookup and high-impact confirmation, scoped values, Switches, Approval steps, Policy methods,
    and the owner's Items to approve. Every screen takes `state`, one of its STATES entry, so the kit's index and the
    screenshot review can open any state directly. Fictional sample data only. */

export const SETTINGS_STATES = {
  SetupHome: ['Needs attention', 'Nothing waiting', 'Before reference data'],
  UserMenuWithSetup: ['Administrator', 'Without the Administrator bundle'],
  SettingsList: ['All', 'High impact', 'Not set', 'No match'],
  SettingRecord: ['Change scheduled', 'No change scheduled', 'Schedule change', 'Value in the past', 'Scheduling', 'High-impact confirmation', 'Lookup', 'History', 'Commercial'],
  ScopedValues: ['Bagged at Chisamba Shed', 'Default case'],
  SwitchesList: ['All', 'No match'],
  SwitchRecord: ['On', 'Off', 'Propose change', 'Submitting', 'Pending approval', 'Rejected', 'Precondition not met'],
  ApprovalStepsList: ['All'],
  ApprovalStepRecord: ['Gate price', 'Variance hold', 'Edit', 'Saving'],
  PolicyMethodsList: ['All'],
  PolicyRecord: ['In force', 'Alternative chosen', 'Confirm change', 'Unavailable refused'],
  ItemsToApprove: ['Waiting', 'Approving', 'Reject', 'Reject variance hold', 'As the administrator', 'Nothing waiting'],
};

/** The record a screen's state shows, for the breadcrumb. */
export function recordTitle(screen, state) {
  if (screen === 'SettingRecord') return state === 'Commercial' ? 'Hired store storage rate' : (state === 'No change scheduled' || state === 'High-impact confirmation') ? 'Bag-count tolerance' : 'GRN reconcile tolerance';
  if (screen === 'ScopedValues') return 'GRN reconcile tolerance';
  if (screen === 'SwitchRecord') return state === 'Off' ? 'External access' : 'Weight source, Chisamba Shed';
  if (screen === 'ApprovalStepRecord') return state === 'Variance hold' ? 'Variance hold' : 'Gate price';
  if (screen === 'PolicyRecord') return 'Netting order';
  return null;
}

const ACTIVE = <StatusMark kind="clean" label="Active" size="body-4" />;
const SCHEDULED = <StatusMark kind="pending" label="Scheduled" size="body-4" />;
const PENDING = <StatusMark kind="pending" label="Pending approval" size="body-4" />;
const blank = (v) => (v == null ? '' : v);
const useNarrow = () => !useMinWidth(768);

/* ------------------------------------------------------------------ Setup Home */

const NEEDS = [{ id: 's1', name: 'Hired store storage rate', owner: 'Owner' }, { id: 's2', name: 'Exchange rate source', owner: 'Owner' }];
const PENDING_ROWS = [
  { id: 'p1', name: 'Switch change: Weight source, Chisamba Shed', sub: 'Scanned slip to Weighbridge, waiting for T. Mwila' },
  { id: 'p2', name: 'Bundle change: Finance', sub: 'Add capability Export farmer statements, waiting for T. Mwila' },
];
const USERS_ROWS = [
  { id: 'u1', name: 'K. Zulu', sub: 'Stock control', status: <StatusMark kind="locked" label="Locked" size="body-4" /> },
  { id: 'u2', name: 'C. Banda', sub: 'Clerk, Chisamba Shed, code expires 28 Sep 2026, 09:15 CAT', status: <StatusMark kind="pending" label="Invited" size="body-4" /> },
];
const RECENT = [
  { id: 'r1', record: 'GRN reconcile tolerance', change: 'Change scheduled: 100 kg from 28 Sep 2026, 00:00 CAT', by: 'N. Phiri', date: '26 Sep 2026, 08:40' },
  { id: 'r2', record: 'Weight source, Chisamba Shed', change: 'Change submitted for approval', by: 'N. Phiri', date: '26 Sep 2026, 07:55' },
  { id: 'r3', record: 'Finance', change: 'Bundle change submitted for approval', by: 'N. Phiri', date: '26 Sep 2026, 07:30' },
  { id: 'r4', record: 'K. Zulu', change: 'Locked after failed sign-ins', by: 'One Link', date: '25 Sep 2026, 17:02' },
  { id: 'r5', record: 'C. Banda', change: 'User created', by: 'N. Phiri', date: '25 Sep 2026, 09:15' },
];

function CardRows({ rows, onOpen }) {
  return rows.map((r, i) => (
    <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '12px 16px', boxShadow: i ? 'inset 0 1px 0 var(--border-light)' : 'none' }}>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <RecordLink onClick={onOpen}>{r.name}</RecordLink>
        <span style={textStyle('body-4', { tone: 'secondary' })}>{r.sub}</span>
      </span>
      <span style={{ flex: 'none' }}>{r.status}</span>
    </div>
  ));
}

export function SetupHome({ state = 'Needs attention', onSection }) {
  const calm = state === 'Nothing waiting';
  const narrow = useNarrow();
  return (
    <Sections>
      <SetupHead title="Setup" />
      <div style={{ display: 'grid', gridTemplateColumns: narrow ? 'minmax(0,1fr)' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
        <CountCard title="Settings needing attention" objects="settings" count={calm ? 0 : NEEDS.length} action={<HeaderLink onClick={() => onSection && onSection('settings')}>View all</HeaderLink>}>
          <CardRows rows={NEEDS.map((r) => ({ ...r, sub: `Owner: ${r.owner}`, status: <NotSet size="body-4" /> }))} onOpen={() => onSection && onSection('settings')} />
        </CountCard>
        <CountCard title="Pending approval" objects="items" count={calm ? 0 : PENDING_ROWS.length}>
          <CardRows rows={PENDING_ROWS.map((r) => ({ ...r, status: PENDING }))} onOpen={() => onSection && onSection('switches')} />
        </CountCard>
        <CountCard title="Users needing attention" objects="users" count={calm ? 0 : USERS_ROWS.length} action={<HeaderLink onClick={() => onSection && onSection('users')}>View all</HeaderLink>}>
          <CardRows rows={USERS_ROWS} onOpen={() => onSection && onSection('users')} />
        </CountCard>
      </div>
      <Card gap={8} title="Recent changes" headerRight={<HeaderLink onClick={() => onSection && onSection('audit')}>View audit log</HeaderLink>}>
        <div style={{ margin: '0 -16px -16px' }}>
          <SetupTable rowKey="id" columns={[
            { key: 'record', label: 'Record', render: (r) => <RecordLink>{r.record}</RecordLink> },
            { key: 'change', label: 'Change' },
            { key: 'by', label: 'By', width: '150px' },
            { key: 'date', label: 'Date', width: '170px', tabular: true },
          ]} rows={RECENT} />
        </div>
      </Card>
    </Sections>
  );
}

/* ------------------------------------------------------------------ User menu with Setup */

export function UserMenuWithSetup({ state = 'Administrator', onSetup }) {
  const admin = state === 'Administrator';
  return (
    <AppShell nav={[{ items: MODULES }]} module="command" breadcrumb={['Command Center']} sync={null} accountOpen user={admin ? { ...ADMIN, meta: 'Finance, Administrator' } : { ...ADMIN, name: 'L. Mulenga', initials: 'LM', email: 'l.mulenga@example.com', meta: 'Finance' }}
      onSignOut={() => {}} menu={admin ? <MenuRow icon="settings" label="Setup" onClick={onSetup} /> : null}>
      <Sections>
        <PageHead title="Command Center" meta="Checked 07:02 · next digest 13:00" />
        <Card><EmptyState title="Nothing needs your attention" meta="Checked 07:02" /></Card>
      </Sections>
    </AppShell>
  );
}

/* ------------------------------------------------------------------ Settings */

const SETTINGS = [
  { id: 'grn', name: 'GRN reconcile tolerance', area: 'Intake', inForce: '80 kg', applies: 'Default; bagged 0 kg', next: '100 kg from 28 Sep 2026', owner: 'Administrator' },
  { id: 'bags', name: 'Bag-count tolerance', area: 'Intake', inForce: '0 bags', applies: 'Default', owner: 'Administrator', high: true },
  { id: 'transit', name: 'Transit loss allowance', area: 'Logistics', inForce: '1.0%', applies: 'Default; bagged 0%', owner: 'Administrator', high: true },
  { id: 'silent', name: 'Silent weighbridge alert', area: 'Intake', inForce: '3 hours', applies: 'Per site, operating hours', owner: 'Owner' },
  { id: 'esc', name: 'Escalation age', area: 'Approvals', inForce: '24 hours', applies: 'Default', owner: 'Owner' },
  { id: 'code', name: 'Activation code expiry', area: 'Users', inForce: '72 hours', applies: 'Default', owner: 'Administrator' },
  { id: 'ret', name: 'Retention', area: 'Audit', inForce: '8 years', applies: 'Default', owner: 'Administrator' },
  { id: 'store', name: 'Hired store storage rate', area: 'Storage', notSet: true, applies: 'Per site', owner: 'Owner', commercial: true },
  { id: 'fx', name: 'Exchange rate source', area: 'Finance', notSet: true, applies: 'Default', owner: 'Owner' },
];

export function SettingsList({ state = 'All', onOpen }) {
  const rows = state === 'High impact' ? SETTINGS.filter((s) => s.high) : state === 'Not set' ? SETTINGS.filter((s) => s.notSet) : state === 'No match' ? [] : SETTINGS;
  return (
    <ListView title="Settings" objects="settings" search="Search settings" view="Area: All"
      filters={<><Capsule selected={state === 'High impact'}>High impact</Capsule><Capsule selected={state === 'Not set'}>Not set</Capsule></>}
      columns={[
        { key: 'name', label: 'Setting', render: (r) => <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}><RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink>{r.high ? <span style={textStyle('body-4', { tone: 'secondary' })}>High impact</span> : null}</span> },
        { key: 'area', label: 'Area', width: '150px' },
        { key: 'inForce', label: 'In force', width: '150px', render: (r) => (r.notSet ? <NotSet size="body-4" /> : r.inForce) },
        { key: 'applies', label: 'Applies to' },
        { key: 'next', label: 'Next change', render: (r) => blank(r.next) },
        { key: 'owner', label: 'Owner', width: '150px' },
      ]} rows={rows} />
  );
}

const SCOPES = ['Counterparty', 'Product', 'Commodity', 'Delivery point', 'Site', 'Route', 'Corridor', 'Counterparty class', 'Contract type', 'Commodity form', 'Default'];

function ValuesCard({ scheduled }) {
  const rows = [
    { id: 'v1', value: '80 kg', scope: 'Default', from: '01 Sep 2026, 00:00', to: scheduled ? '27 Sep 2026, 23:59' : '', status: ACTIVE },
    ...(scheduled ? [{ id: 'v2', value: '100 kg', scope: 'Default', from: '28 Sep 2026, 00:00', to: '', status: SCHEDULED }] : []),
    { id: 'v3', value: '0 kg', scope: 'Commodity form: bagged', from: '01 Sep 2026, 00:00', to: '', status: ACTIVE },
  ];
  return (
    <CountCard title="Values" objects="values" count={rows.length}>
      <SetupTable rowKey="id" columns={[
        { key: 'value', label: 'Value', width: '150px', tabular: true },
        { key: 'scope', label: 'Scope' },
        { key: 'from', label: 'Effective from', tabular: true },
        { key: 'to', label: 'Effective to', tabular: true },
        { key: 'status', label: 'Status', width: '170px', render: (r) => r.status },
      ]} rows={rows} />
    </CountCard>
  );
}

function HistoryCard({ rows }) {
  return (
    <CountCard title="History" objects="changes" count={rows.length}>
      <SetupTable rowKey="id" columns={[
        { key: 'field', label: 'Field', width: '150px' },
        { key: 'user', label: 'User', width: '150px' },
        { key: 'old', label: 'Old value', width: '150px' },
        { key: 'next', label: 'New value', width: '150px' },
        { key: 'date', label: 'Date', width: '170px', tabular: true },
        { key: 'reason', label: 'Reason' },
      ]} rows={rows} />
    </CountCard>
  );
}

const GRN_HISTORY = [
  { id: 'h1', field: 'Value, from 28 Sep 2026', user: 'N. Phiri', old: '80 kg', next: '100 kg', date: '26 Sep 2026, 08:40', reason: 'Agreed tolerance for the new season' },
  { id: 'h2', field: 'Value', user: 'T. Mwila', old: '', next: '80 kg, bagged 0 kg', date: '01 Sep 2026, 09:00', reason: 'Initial value' },
];

function ScheduleChangeDialog({ unit = 'kg', value = '100', from = '28 Sep 2026, 00:00 CAT', past = false, busy = false, onClose }) {
  const narrow = useNarrow();
  return (
    <Dialog title="Schedule change" width={480} sheet={narrow} onClose={busy ? undefined : onClose}
      footer={<><Button variant="ghost" size="small" disabled={busy} onClick={onClose}>Cancel</Button><Button size="small" loading={busy}>Schedule</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label={`Value (${unit})`} required><Input defaultValue={value} align="right" inputMode="decimal" disabled={busy} /></Field>
        <Field label="Applies to" required><Select options={['Default', 'Commodity form: bagged']} disabled={busy} /></Field>
        <Field label="Effective from" required error={past ? 'Effective from must be now or later.' : null}><Input defaultValue={past ? '25 Sep 2026, 00:00 CAT' : from} invalid={past} disabled={busy} /></Field>
        <Field label="Reason" required><Input multiline defaultValue="Agreed tolerance for the new season" disabled={busy} /></Field>
      </div>
    </Dialog>
  );
}

function Lookup() {
  return (
    <Card title="Value in force" padding={16}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, alignItems: 'end' }}>
        <Field label="Date"><Input defaultValue="29 Sep 2026" /></Field>
        <Field label="Time (CAT)"><Input defaultValue="10:00" /></Field>
        <Field label="Scope"><Select options={['Commodity form: bagged', 'Default']} /></Field>
        <Button variant="outline" size="small">Look up</Button>
      </div>
      <dl style={{ margin: 0, paddingTop: 16, boxShadow: 'inset 0 1px 0 var(--border-light)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {[['Value', '0 kg'], ['Comes from', 'Commodity form: bagged'], ['Effective from', '01 Sep 2026, 00:00 CAT'], ['Overrides', 'Default, 100 kg']].map(([l, v]) => (
          <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><dt style={textStyle('body-4', { tone: 'secondary' })}>{l}</dt><dd style={{ margin: 0, ...textStyle('body-3', { strong: l === 'Value' }) }}>{v}</dd></div>
        ))}
      </dl>
    </Card>
  );
}

export function SettingRecord({ state = 'Change scheduled' }) {
  const [tab, setTab] = useState(state === 'History' ? 'History' : 'Details');
  useEffect(() => setTab(state === 'History' ? 'History' : 'Details'), [state]);
  if (state === 'Commercial') {
    return (
      <Sections>
        <SetupHead title="Hired store storage rate" />
        <RecordHighlights kind="Setting" title="Hired store storage rate" status={<NotSet owner="Owner" size="body-4" />} tab={tab} onTab={setTab}
          fields={[{ label: 'In force', value: <NotSet size="body-3" /> }, { label: 'Area', value: 'Storage' }, { label: 'Applies to', value: 'Per site' }, { label: 'Owner', value: 'Owner' }]} />
        <HistoryCard rows={[]} />
      </Sections>
    );
  }
  const bags = state === 'No change scheduled' || state === 'High-impact confirmation';
  const scheduled = !bags;
  const title = bags ? 'Bag-count tolerance' : 'GRN reconcile tolerance';
  const fields = bags
    ? [{ label: 'In force', value: '0 bags' }, { label: 'Next change', value: '' }, { label: 'Area', value: 'Intake' }, { label: 'Type', value: 'Count' }, { label: 'Impact', value: 'High' }, { label: 'Owner', value: 'Administrator' }]
    : [{ label: 'In force', value: '80 kg' }, { label: 'Next change', value: '100 kg from 28 Sep 2026, 00:00 CAT' }, { label: 'Area', value: 'Intake' }, { label: 'Type', value: 'Mass (kg)' }, { label: 'Owner', value: 'Administrator' }];
  const dialog = state === 'Schedule change' || state === 'Value in the past' || state === 'Scheduling';
  return (
    <Sections>
      <SetupHead title={title} />
      <RecordHighlights kind="Setting" title={title} status={ACTIVE} tab={tab} onTab={setTab} fields={fields}
        actions={<>{bags ? null : <Button variant="outline" size="small">Add override</Button>}<Button size="small">Schedule change</Button></>} />
      {tab === 'History' ? <HistoryCard rows={bags ? [] : GRN_HISTORY} /> : (
        <>
          {state === 'Lookup' ? <Lookup /> : null}
          {bags ? (
            <CountCard title="Values" objects="values" count={1}>
              <SetupTable rowKey="id" columns={[{ key: 'value', label: 'Value', width: '150px' }, { key: 'scope', label: 'Scope' }, { key: 'from', label: 'Effective from' }, { key: 'to', label: 'Effective to' }, { key: 'status', label: 'Status', width: '170px', render: () => ACTIVE }]}
                rows={[{ id: 'b1', value: '0 bags', scope: 'Default', from: '01 Sep 2026, 00:00', to: '' }]} />
            </CountCard>
          ) : <ValuesCard scheduled={scheduled} />}
        </>
      )}
      {dialog ? <ScheduleChangeDialog past={state === 'Value in the past'} busy={state === 'Scheduling'} /> : null}
      {state === 'High-impact confirmation' ? (
        <ReasonDialog title="Confirm high-impact change" sheet={false}>Bag-count tolerance changes from 0 bags to 2 bags, effective 01 Oct 2026, 00:00 CAT. Loads up to 2 bags short will book without a hold.</ReasonDialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Scoped values */

export function ScopedValues({ state = 'Bagged at Chisamba Shed' }) {
  const bagged = state === 'Bagged at Chisamba Shed';
  const overrides = { 'Commodity form': '0 kg', Site: '60 kg', Default: '80 kg' };
  const caseMatches = bagged ? ['Site', 'Commodity form', 'Default'] : ['Default'];
  const winner = SCOPES.find((s) => caseMatches.includes(s) && overrides[s]);
  return (
    <Sections>
      <SetupHead title="GRN reconcile tolerance" />
      <RecordHighlights kind="Setting" title="GRN reconcile tolerance" status={ACTIVE} tabs={[]}
        fields={[{ label: 'In force for this case', value: overrides[winner] }, { label: 'Comes from', value: winner }, { label: 'Order', value: `${SCOPES.indexOf(winner) + 1} of ${SCOPES.length}` }]} />
      <Card title="Case" padding={16}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          <Field label="Counterparty"><Select options={['Lakeview Farms Ltd', 'Riverbend Milling']} /></Field>
          <Field label="Site"><Select options={bagged ? ['Chisamba Shed', 'Mpongwe Depot'] : ['Mpongwe Depot', 'Chisamba Shed']} /></Field>
          <Field label="Commodity form"><Select options={bagged ? ['Bagged', 'Bulk'] : ['Bulk', 'Bagged']} /></Field>
        </div>
      </Card>
      <CountCard title="Overrides in order" objects="overrides" count={Object.keys(overrides).length}>
        <SetupTable rowKey="scope" columns={[
          { key: 'order', label: 'Order', align: 'right', width: '72px' },
          { key: 'scope', label: 'Scope' },
          { key: 'value', label: 'Value', width: '150px', render: (r) => blank(overrides[r.scope]) },
          { key: 'applies', label: 'Applies to this case', width: '150px', render: (r) => (caseMatches.includes(r.scope) && overrides[r.scope] ? 'Yes' : '') },
          { key: 'status', label: 'Status', width: '170px', render: (r) => (r.scope === winner ? <StatusMark kind="clean" label="Wins" size="body-4" /> : caseMatches.includes(r.scope) && overrides[r.scope] ? <StatusMark kind="flat" label="Outranked" size="body-4" /> : '') },
        ]} rows={SCOPES.map((s, i) => ({ scope: s, order: i + 1 }))} />
      </CountCard>
    </Sections>
  );
}

/* ------------------------------------------------------------------ Switches */

const SWITCHES = [
  { id: 'weight', name: 'Weight source', scope: 'Chisamba Shed', inForce: 'Scanned slip', status: PENDING, approver: 'Owner' },
  { id: 'external', name: 'External access', scope: 'All counterparties', inForce: 'Off', status: ACTIVE, approver: 'Owner' },
];

export function SwitchesList({ state = 'All', onOpen }) {
  return (
    <ListView title="Switches" objects="switches" search="Search switches" view="All switches"
      columns={[
        { key: 'name', label: 'Switch', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink> },
        { key: 'scope', label: 'Scope' },
        { key: 'inForce', label: 'In force', width: '150px' },
        { key: 'approver', label: 'Approver', width: '150px' },
        { key: 'status', label: 'Status', width: '170px', render: (r) => r.status },
      ]} rows={state === 'No match' ? [] : SWITCHES} />
  );
}

function ApprovalHistory({ rows }) {
  return (
    <CountCard title="Approval history" objects="approvals" count={rows.length}>
      <SetupTable rowKey="id" columns={[
        { key: 'step', label: 'Step' },
        { key: 'who', label: 'Assigned to', width: '150px' },
        { key: 'status', label: 'Status', width: '170px', render: (r) => r.status },
        { key: 'date', label: 'Date', width: '170px', tabular: true },
        { key: 'reason', label: 'Reason' },
      ]} rows={rows} />
    </CountCard>
  );
}

export function SwitchRecord({ state = 'On' }) {
  const [tab, setTab] = useState('Details');
  const narrow = useNarrow();
  const external = state === 'Off';
  const pending = state === 'Pending approval';
  const rejected = state === 'Rejected';
  const inForce = external ? 'Off' : 'Scanned slip';
  const status = pending ? PENDING : rejected ? <StatusMark kind="breach" label="Rejected" size="body-4" /> : ACTIVE;
  const title = external ? 'External access' : 'Weight source, Chisamba Shed';
  const busy = state === 'Submitting';
  const history = [
    ...(pending || rejected ? [{ id: 'a2', step: 'Submitted', who: 'N. Phiri', status: <StatusMark kind="clean" label="Submitted" size="body-4" />, date: '26 Sep 2026, 07:55', reason: 'Weighbridge feed live at Chisamba Shed' }] : []),
    ...(pending ? [{ id: 'a3', step: 'Owner approval', who: 'T. Mwila', status: PENDING, date: '', reason: '' }] : []),
    ...(rejected ? [{ id: 'a3', step: 'Owner approval', who: 'T. Mwila', status: <StatusMark kind="breach" label="Rejected" size="body-4" />, date: '26 Sep 2026, 11:20', reason: 'Wait until the weighbridge is calibrated' }] : []),
    { id: 'a1', step: 'Approved', who: 'T. Mwila', status: <StatusMark kind="clean" label="Approved" size="body-4" />, date: '01 Sep 2026, 09:00', reason: 'Initial value' },
  ];
  return (
    <Sections>
      <SetupHead title={title} />
      {pending ? <ConditionBanner>Change to Weighbridge submitted for approval by N. Phiri, 26 Sep 2026, 07:55 CAT. Waiting for T. Mwila.</ConditionBanner> : null}
      {state === 'Precondition not met' ? <Refusal action="Submit for approval" reason="The weighbridge at Chisamba Shed has not reported since 06:10" /> : null}
      <RecordHighlights kind="Switch" title={external ? 'External access' : 'Weight source'} status={status} tab={tab} onTab={setTab}
        actions={pending ? null : <Button size="small">Propose change</Button>}
        fields={[{ label: 'Scope', value: external ? 'All counterparties' : 'Chisamba Shed' }, { label: 'In force', value: inForce }, { label: 'Values', value: external ? 'Off, On' : 'Scanned slip, Weighbridge' }, { label: 'Approver', value: 'Owner' }, { label: 'Owner bundle', value: 'Administrator' }]} />
      <ApprovalHistory rows={external ? [{ id: 'e1', step: 'Approved', who: 'T. Mwila', status: <StatusMark kind="clean" label="Approved" size="body-4" />, date: '01 Sep 2026, 09:00', reason: 'Initial value' }] : history} />
      {state === 'Propose change' || busy ? (
        <Dialog title="Propose change" width={480} sheet={narrow} onClose={busy ? undefined : () => {}}
          footer={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Submit for approval</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}><dt style={textStyle('body-4', { tone: 'secondary' })}>Current value</dt><dd style={{ margin: 0, ...textStyle('body-3') }}>{inForce}</dd></dl>
            <Field label="New value" required><Select options={['Weighbridge', 'Scanned slip']} disabled={busy} /></Field>
            <Field label="Reason" required><Input multiline defaultValue="Weighbridge feed live at Chisamba Shed" disabled={busy} /></Field>
          </div>
        </Dialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Approval steps */

const STEPS = [
  { id: 'trade', name: 'Trade approval', kind: 'Decision', approvers: 'Owner', deputies: 'Trading', escalation: '24 hours' },
  { id: 'gate', name: 'Gate price', kind: 'Decision', approvers: 'Owner', deputies: 'Trading, Finance', escalation: '24 hours' },
  { id: 'variance', name: 'Variance hold', kind: 'Decision', approvers: 'Owner, Trading', deputies: 'Stock control', escalation: '24 hours' },
  { id: 'switch', name: 'Switch change', kind: 'Decision', approvers: 'Owner', escalation: '24 hours' },
  { id: 'bundle', name: 'Bundle change with price tiers', kind: 'Decision', approvers: 'Owner', escalation: '24 hours' },
  { id: 'over', name: 'Over-delivery notice', kind: 'Notice', approvers: 'Owner, Trading, Stock control' },
];

export function ApprovalStepsList({ onOpen }) {
  return (
    <ListView title="Approval steps" objects="approval steps" search="Search approval steps" view="All approval steps"
      columns={[
        { key: 'name', label: 'Step', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink> },
        { key: 'kind', label: 'Kind', width: '150px' },
        { key: 'approvers', label: 'Approvers' },
        { key: 'deputies', label: 'Deputy list', render: (r) => blank(r.deputies) },
        { key: 'escalation', label: 'Escalation', width: '150px', render: (r) => blank(r.escalation) },
      ]} rows={STEPS} />
  );
}

export function ApprovalStepRecord({ state = 'Gate price' }) {
  const [tab, setTab] = useState('Details');
  const variance = state === 'Variance hold';
  const editing = state === 'Edit' || state === 'Saving';
  const busy = state === 'Saving';
  const step = variance ? STEPS[2] : STEPS[1];
  const outcomes = variance
    ? [{ id: 'o1', outcome: 'Release hold', result: 'The held load books against the contract' }, { id: 'o2', outcome: 'Reject', result: 'The load stays held; a comment is required' }]
    : [{ id: 'o1', outcome: 'Approve', result: 'Gate price takes effect from its effective time' }, { id: 'o2', outcome: 'Reject', result: 'Gate price is not applied; the reason is recorded' }];
  const deputies = step.deputies.split(', ').map((b, i) => ({ id: b, order: i + 1, bundle: b }));
  return (
    <Sections>
      <SetupHead title={step.name} />
      <RecordHighlights kind="Approval step" title={step.name} status={ACTIVE} tab={tab} onTab={setTab}
        actions={editing ? <><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Save</Button></> : <Button variant="outline" size="small">Edit</Button>}
        fields={[{ label: 'Kind', value: step.kind }, { label: 'Approvers', value: step.approvers }, { label: 'Escalation', value: step.escalation }, { label: 'Escalate to', value: step.deputies }, { label: 'Threshold', value: '' }, { label: 'Version', value: variance ? '1' : '3' }]} />
      {editing ? (
        <Card title="Edit approval step" padding={16}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <Field label="Kind" required><Select options={['Decision', 'Notice']} disabled={busy} /></Field>
            <Field label="Approvers" required><Select options={['Owner', 'Owner, Trading']} disabled={busy} /></Field>
            <Field label="Escalation" required><Input defaultValue="24 hours" disabled={busy} /></Field>
            <Field label="Escalate to"><Select options={['Trading, Finance', 'Trading']} disabled={busy} /></Field>
            <Field label="Threshold"><Input defaultValue="" disabled={busy} /></Field>
          </div>
        </Card>
      ) : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
        <CountCard title="Deputy list" objects="deputies" count={deputies.length}>
          <SetupTable rowKey="id" columns={[{ key: 'order', label: 'Order', align: 'right', width: '72px' }, { key: 'bundle', label: 'Bundle' }]} rows={deputies} />
        </CountCard>
        <CountCard title="Outcomes" objects="outcomes" count={outcomes.length}>
          <SetupTable rowKey="id" columns={[{ key: 'outcome', label: 'Outcome', width: '150px' }, { key: 'result', label: 'Result' }]} rows={outcomes} />
        </CountCard>
      </div>
    </Sections>
  );
}

/* ------------------------------------------------------------------ Policy methods */

const POLICIES = [
  { id: 'netting', name: 'Netting order', choice: 'Single', method: 'Oldest debt first', description: 'Which debt a settlement nets first', owner: 'Administrator' },
  { id: 'proven', name: 'Proven delivery', choice: 'Single', method: 'GRN finalised or mill offload recorded', description: 'When a delivery counts as proven', owner: 'Administrator' },
  { id: 'rhythm', name: 'Supplier rhythm source', choice: 'Single', method: 'Observed rhythm', description: "How a supplier's usual delivery rhythm is found", owner: 'Administrator' },
];

export function PolicyMethodsList({ onOpen }) {
  return (
    <ListView title="Policy methods" objects="policy methods" search="Search policy methods" view="All policy methods"
      columns={[
        { key: 'name', label: 'Policy', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink> },
        { key: 'choice', label: 'Choice', width: '150px' },
        { key: 'method', label: 'Method in force' },
        { key: 'description', label: 'Description' },
        { key: 'owner', label: 'Owner', width: '150px' },
      ]} rows={POLICIES} />
  );
}

export function PolicyRecord({ state = 'In force' }) {
  const [tab, setTab] = useState('Details');
  const chosen = state === 'Alternative chosen' || state === 'Confirm change' ? 'largest' : 'oldest';
  return (
    <Sections>
      <SetupHead title="Netting order" />
      {state === 'Unavailable refused' ? <Refusal action="Change method" reason="Smallest debt first needs debt ageing, which arrives with Farmer finance" /> : null}
      <RecordHighlights kind="Policy" title="Netting order" status={ACTIVE} tab={tab} onTab={setTab}
        actions={<Button size="small" disabled={chosen === 'oldest'}>Change method</Button>}
        fields={[{ label: 'Method in force', value: 'Oldest debt first' }, { label: 'Choice', value: 'Single' }, { label: 'Description', value: 'Which debt a settlement nets first' }, { label: 'Owner', value: 'Administrator' }]} />
      <Card title="Methods" padding={16}>
        <RadioList value={chosen} options={[
          { value: 'oldest', label: 'Oldest debt first', hint: 'In force' },
          { value: 'largest', label: 'Largest debt first' },
          { value: 'smallest', label: 'Smallest debt first', disabled: true, reason: 'Needs debt ageing, which arrives with Farmer finance.' },
        ]} />
      </Card>
      {state === 'Confirm change' ? <ReasonDialog title="Change method" confirmLabel="Change method">Netting order changes from Oldest debt first to Largest debt first, effective 01 Oct 2026, 00:00 CAT.</ReasonDialog> : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Items to approve (the owner, outside Setup) */

const ITEMS = [
  { id: 'i1', item: 'Trade SYN4702', type: 'Trade', summary: 'Riverbend Milling, maize, 1,500 t', by: 'J. Tembo', at: '25 Sep 2026, 16:40' },
  { id: 'i2', item: 'Gate price, maize', type: 'Gate price', summary: 'Chisamba Shed, K4,300 per t', by: 'R. Daka', at: '26 Sep 2026, 06:30' },
  { id: 'i4', item: 'Switch change, Weight source', type: 'Switch change', summary: 'Chisamba Shed, to Weighbridge', by: 'N. Phiri', at: '26 Sep 2026, 07:55' },
  { id: 'i3', item: 'Variance hold, GRN-0412', type: 'Variance hold', summary: 'Lakeview Farms Ltd, 2 bags short', by: 'One Link', at: '26 Sep 2026, 09:05' },
];

export function ItemsToApprove({ state = 'Waiting' }) {
  // An administrator's own proposals never appear in their own Items to approve (S10 control 3).
  const admin = state === 'As the administrator';
  const rows = state === 'Nothing waiting' ? [] : admin ? ITEMS.filter((r) => r.by !== ADMIN.name && r.type !== 'Trade') : ITEMS;
  const approving = state === 'Approving';
  const decide = (r) => (r.type === 'Variance hold'
    ? <span style={{ display: 'inline-flex', gap: 8 }}><Button variant="outline" size="xsmall">Release hold</Button><Button variant="critical-ghost" size="xsmall">Reject</Button></span>
    : <span style={{ display: 'inline-flex', gap: 8 }}><Button size="xsmall" loading={approving && r.id === 'i1'}>Approve</Button><Button variant="critical-ghost" size="xsmall" disabled={approving && r.id === 'i1'}>Reject</Button></span>);
  return (
    <AppShell nav={[{ items: MODULES }]} module="command" breadcrumb={['Command Center', 'Items to approve']} sync={null} user={admin ? ADMIN : OWNER}>
      <Sections>
        <SetupHead title="Items to approve" count={rows.length} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Capsule chevron selected>Assigned to me</Capsule>
          <SearchField placeholder="Search this list" hint={null} maxWidth={320} />
        </div>
        {rows.length ? (
          <SetupTable rowKey="id" columns={[
            { key: 'item', label: 'Item', render: (r) => <RecordLink>{r.item}</RecordLink> },
            { key: 'summary', label: 'Summary' },
            { key: 'by', label: 'Submitted by', width: '110px' },
            { key: 'at', label: 'Submitted', width: '150px', tabular: true },
            { key: 'decide', label: 'Decision', width: '190px', render: decide },
            { key: 'status', label: 'Status', width: '150px', render: () => PENDING },
          ]} rows={rows} />
        ) : <Card><EmptyState title="No items to display." /></Card>}
      </Sections>
      {state === 'Reject' ? <ReasonDialog title="Reject gate price" label="Comment" minLength={1} confirmLabel="Reject" confirmVariant="critical">Gate price, maize at Chisamba Shed, K4,300 per t, submitted by R. Daka.</ReasonDialog> : null}
      {state === 'Reject variance hold' ? <ReasonDialog title="Reject variance hold" label="Comment" minLength={1} confirmLabel="Reject" confirmVariant="critical">Variance hold on GRN-0412, Lakeview Farms Ltd, 2 bags short at Mpongwe Depot. The load stays held.</ReasonDialog> : null}
    </AppShell>
  );
}
