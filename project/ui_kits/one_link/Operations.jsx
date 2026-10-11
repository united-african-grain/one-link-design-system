/** Operations' farm-direct screens and the Exceptions list with Follow-up (M5.DS.02, UAG-190; S16 AL6 and AL7, canvas
    S17 "One Link Alka"): the farm-direct consignments list, capturing either side first, the consignment record (loaded
    side only, mill side only, both sides with the difference, received grade against contract grade), the farm-direct
    loads import preview, the Exceptions list with Follow-up as the operations lead's saved view (UX-07, INC-13), and
    the farm-direct variance decision with exactly three outcomes (UAG-150), which Trading or the Managing Director
    decides and Operations reads. Every screen takes `state`, one of its OPS_STATES entry, for ?screen=&state=.

    On a farm-direct load the mill's offloaded weight and grade count on both the purchase and the sale contract and set
    what the farmer is paid on; the farmer's loaded weight is kept to show the difference (Map D-36, RL-VAR-FD). A
    consignment is a load: In transit with the loaded side, Delivered with the mill side, Reconciled once the difference
    and the grade are settled; what it waits for is the field Waiting for, never a status (UX-32). Operations data only:
    no price or value on the consignment screens; value at risk appears on the exceptions (S16). Weights carry three
    decimals with t in the header (UX-12). Fictional sample data on the golden fixture names. */

export const OPS_STATES = {
  FarmDirectConsignments: ['All', 'Waiting for a side', 'Exporting', 'Empty'],
  NewConsignment: ['Loaded side', 'Mill side', 'Missing fields', 'Saving'],
  Consignment: ['Loaded side only', 'Mill side only', 'Both sides', 'Grade below contract', 'Acknowledging', 'Beyond allowance', 'Related', 'History'],
  FarmDirectUpload: ['Validating', 'Ready to import', 'Row to fix', 'Importing', 'Imported', 'Failed'],
  FollowUp: ['Follow-up', 'Acknowledged', 'Exporting', 'No items'],
  VarianceDecision: ['Open', 'Correct a side', 'Deciding', 'Decided', 'Operations, read only'],
};

/** The operations lead's navigation (canvas S17): Home, Logistics with Farm-direct, Finance, Counterparties, Reports. */
export const OPS_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'logistics', label: 'Logistics', icon: 'truck', sections: [{ value: 'farm-direct', label: 'Farm-direct' }] },
  { value: 'finance', label: 'Finance', icon: 'landmark' },
  { value: 'counterparties', label: 'Counterparties', icon: 'building-2' },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
] }];
export const OPS_USER = { initials: 'MC', name: 'M. Chanda', meta: 'Operations' };

/** Where a screen in this file sits. The variance decision is drawn in Trading's frame, except Operations' read-only view. */
export function opsFrame(screen, state) {
  const fd = ['Logistics', 'Farm-direct'];
  if (screen === 'FarmDirectConsignments') return { who: 'ops', module: 'logistics', section: 'farm-direct', breadcrumb: fd };
  if (screen === 'NewConsignment') return { who: 'ops', module: 'logistics', section: 'farm-direct', breadcrumb: [...fd, 'New consignment'] };
  if (screen === 'Consignment') return { who: 'ops', module: 'logistics', section: 'farm-direct', breadcrumb: [...fd, opsConsignmentFor(state).id] };
  if (screen === 'FarmDirectUpload') return { who: 'ops', module: 'logistics', section: 'farm-direct', breadcrumb: [...fd, 'Import'] };
  if (screen === 'FollowUp') return { who: 'ops', module: 'home', breadcrumb: ['Home', 'Exceptions'] };
  if (state === 'Operations, read only') return { who: 'ops', module: 'home', breadcrumb: ['Home', 'Exceptions', OPS_VARIANCE.id] };
  return { who: 'cover', module: 'home', breadcrumb: ['Home', 'Exceptions', OPS_VARIANCE.id] };
}

/* ------------------------------------------------------------------ The S16 example data, on the golden fixture */

/** Farm-direct consignments, local farmers to Riverbend Milling, Lusaka (S16 screen 8). A missing side is a blank cell. */
export const OPS_CONSIGNMENTS = [
  { id: 'FD-0142', farmer: 'Lakeview Farms Ltd', leg: 'SYN4702 leg A', loaded: '32.140', offloaded: '31.980', diff: '0.160', pct: '0.50%', grade: 'Grade 2', contractGrade: 'Grade 1', waiting: 'Grade decision', status: 'delivered',
    note: '0142', truck: 'ACF 5521', loadedOn: '24 Sep 2026, 07:30', offloadedOn: '25 Sep 2026, 15:50', outcome: 'allowance', below: true },
  { id: 'FD-0139', farmer: 'Cameron Estates', leg: 'SYN4702 leg A', loaded: '33.200', offloaded: '33.120', diff: '0.080', pct: '0.24%', grade: 'Grade 1', contractGrade: 'Grade 1', waiting: '', status: 'reconciled',
    note: '0139', truck: 'BAF 2231', loadedOn: '23 Sep 2026, 06:55', offloadedOn: '24 Sep 2026, 11:20', outcome: 'allowance' },
  { id: 'FD-0145', farmer: 'Chongwe Growers Ltd', leg: 'SYN4845 leg C', loaded: '', offloaded: '30.500', diff: '', pct: '', grade: 'Grade 1', contractGrade: 'Grade 1', waiting: 'Loaded side', status: 'delivered',
    note: '', truck: '', loadedOn: '', offloadedOn: '25 Sep 2026, 13:05' },
  { id: 'FD-0146', farmer: 'Mpongwe Valley Farms', leg: 'SYN4845 leg A', loaded: '31.000', offloaded: '', diff: '', pct: '', grade: '', contractGrade: 'Grade 1', waiting: 'Mill side', status: 'in-transit',
    note: '0146', truck: 'ABZ 4412', loadedOn: '25 Sep 2026, 08:10', offloadedOn: '' },
  { id: 'FD-0149', farmer: 'Kapiri Farms', leg: 'SYN4845 leg B', loaded: '32.000', offloaded: '30.500', diff: '1.500', pct: '4.69%', grade: 'Grade 1', contractGrade: 'Grade 1', waiting: 'Managing Director or Trading', status: 'delivered',
    note: '0149', truck: 'BCD 7720', loadedOn: '25 Sep 2026, 06:40', offloadedOn: '26 Sep 2026, 09:15', outcome: 'beyond' },
];

/** A consignment's status as a load (UX-32): In transit with the loaded side, Delivered with the mill side, Reconciled. */
export const OPS_LOAD_STATUS = { 'in-transit': { kind: 'pending', label: 'In transit' }, delivered: { kind: 'clean', label: 'Delivered' }, reconciled: { kind: 'clean', label: 'Reconciled' } };
export function OpsLoadStatus({ status, size = 'body-4' }) {
  const s = OPS_LOAD_STATUS[status];
  return <StatusMark kind={s.kind} label={s.label} size={size} />;
}

/** The consignment each record state shows. */
export function opsConsignmentFor(state) {
  const by = (id) => OPS_CONSIGNMENTS.find((c) => c.id === id);
  if (state === 'Loaded side only') return by('FD-0146');
  if (state === 'Mill side only') return by('FD-0145');
  if (state === 'Both sides') return by('FD-0139');
  if (state === 'Beyond allowance') return by('FD-0149');
  return by('FD-0142');
}

/* ------------------------------------------------------------------ Farm-direct consignments (list view, UX-07) */

export function FarmDirectConsignments({ state = 'All', onOpen }) {
  const waiting = state === 'Waiting for a side';
  const rows = state === 'Empty' ? [] : waiting ? OPS_CONSIGNMENTS.filter((c) => c.waiting === 'Loaded side' || c.waiting === 'Mill side') : OPS_CONSIGNMENTS;
  return (
    <Sections>
      <HmHead title="Farm-direct consignments" count={rows.length} right={<>
        <Button variant="outline" size="small" icon="download" loading={state === 'Exporting'}>Export</Button>
        <Button variant="outline" size="small" icon="upload" onClick={() => onOpen && onOpen('import')}>Import</Button>
        <Button size="small" icon="plus" onClick={() => onOpen && onOpen('new')}>New</Button>
      </>} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <ScrollRow><Capsule chevron selected>{waiting ? 'Waiting for a side' : 'All consignments'}</Capsule><Capsule chevron>Farmer</Capsule></ScrollRow>
        <SearchField placeholder="Search this list" hint={null} maxWidth={320} />
      </div>
      {rows.length ? (
        <Card padding={4}>
          <HmTable rows={rows} columns={[
            { key: 'id', label: 'Consignment', width: '120px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
            { key: 'farmer', label: 'Farmer', width: 'minmax(170px, 1fr)', wrap: true },
            { key: 'loaded', label: 'Loaded (t)', width: '96px', align: 'right' },
            { key: 'offloaded', label: 'Offloaded (t)', width: '112px', align: 'right' },
            { key: 'diff', label: 'Difference (t)', width: '112px', align: 'right' },
            { key: 'grade', label: 'Grade received', width: '120px' },
            { key: 'contractGrade', label: 'Contract grade', width: '120px' },
            { key: 'waiting', label: 'Waiting for', width: '170px', wrap: true },
            { key: 'status', label: 'Status', width: '130px', render: (r) => <OpsLoadStatus status={r.status} /> },
          ]} />
        </Card>
      ) : <Card><EmptyState title="No consignments to display." /></Card>}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Capture either side first (UX-21) */

export function NewConsignment({ state = 'Loaded side' }) {
  const mill = state === 'Mill side';
  const missing = state === 'Missing fields';
  const busy = state === 'Saving';
  return (
    <Sections>
      <HmHead title="New consignment" right={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy} disabled={missing}>Save</Button></>} />
      <Card title="Consignment" padding={16}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 16 }}>
          <Field label="Farmer" required><Select options={['Mpongwe Valley Farms', 'Lakeview Farms Ltd', 'Cameron Estates']} defaultValue="Mpongwe Valley Farms" disabled={busy} /></Field>
          <Field label="Purchase leg" required><Select options={['SYN4845 leg A', 'SYN4702 leg A']} defaultValue="SYN4845 leg A" disabled={busy} /></Field>
          <Field label="Mill"><Input defaultValue="Riverbend Milling, Lusaka" disabled /></Field>
          <Field label="Side recorded first" required><RadioList name="side" options={['Loaded side', 'Mill side']} value={mill ? 'Mill side' : 'Loaded side'} disabled={busy} /></Field>
        </div>
      </Card>
      {mill ? (
        <Card title="Mill side" padding={16}>
          <EvidenceTile kind="document" caption="Mill offload sheet" time="26 Sep 2026" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16 }}>
            <Field label="Offloaded (t)" required><Input align="right" defaultValue="30.880" disabled={busy} /></Field>
            <Field label="Grade" required><Select options={['Grade 1', 'Grade 2', 'Grade 3']} defaultValue="Grade 1" disabled={busy} /></Field>
            <Field label="Offloaded on" required><Input defaultValue="26 Sep 2026, 10:40" disabled={busy} /></Field>
            <Field label="Source"><Select options={['Mill offload sheet']} defaultValue="Mill offload sheet" disabled={busy} /></Field>
          </div>
        </Card>
      ) : (
        <Card title="Loaded side" padding={16}>
          <EvidenceTile kind="document" caption="Farmer delivery note" time="26 Sep 2026" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: 16 }}>
            <Field label="Delivery note" required error={missing ? 'Delivery note is required.' : null}><Input defaultValue={missing ? '' : '0147'} invalid={missing} disabled={busy} /></Field>
            <Field label="Truck" required><Input defaultValue="ABZ 4412" disabled={busy} /></Field>
            <Field label="Loaded (t)" required error={missing ? 'Loaded must be a weight in tonnes.' : null}><Input align="right" defaultValue={missing ? '' : '30.800'} invalid={missing} disabled={busy} /></Field>
            <Field label="Loaded on" required><Input defaultValue="26 Sep 2026, 07:15" disabled={busy} /></Field>
            <Field label="Source"><Select options={['Farmer delivery note']} defaultValue="Farmer delivery note" disabled={busy} /></Field>
          </div>
        </Card>
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ The consignment record (UX-19, UX-20) */

const OPS_HISTORY = [
  { id: 'h3', field: 'Mill side', user: 'M. Chanda', old: '', next: '31.980 t, Grade 2', date: '25 Sep 2026, 16:02' },
  { id: 'h2', field: 'Status', user: 'System', old: 'In transit', next: 'Delivered', date: '25 Sep 2026, 16:02' },
  { id: 'h1', field: 'Loaded side', user: 'M. Chanda', old: '', next: '32.140 t', date: '24 Sep 2026, 08:05' },
];

export function Consignment({ state = 'Grade below contract', onOpen }) {
  const c = opsConsignmentFor(state);
  const initial = state === 'Related' ? 'Related' : state === 'History' ? 'History' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const hasLoaded = !!c.loaded;
  const hasMill = !!c.offloaded;
  const both = hasLoaded && hasMill;
  const below = !!c.below;
  const counts = hasMill ? `${c.offloaded} t at ${c.grade.toLowerCase()}` : '';
  const actions = below ? <><Button variant="outline" size="small">Open grading dispute</Button><Button size="small" loading={state === 'Acknowledging'}>Acknowledge</Button></>
    : !hasMill ? <Button size="small">Record offload</Button> : !hasLoaded ? <Button size="small">Record loaded side</Button> : null;
  const reconcile = both ? (
    <ReconcileCard outcome={c.outcome} status={c.outcome === 'beyond' ? 'Beyond allowance' : 'Within allowance'} rows={[
      { label: 'Loaded', value: `${c.loaded} t` }, { label: 'Offloaded', value: `${c.offloaded} t` },
      { label: 'Difference', value: `${c.diff} t, ${c.pct}`, strong: true }, { label: 'Loss allowance', value: '1.0%' },
      { label: 'Grade received', value: c.grade }, { label: 'Contract grade', value: c.contractGrade },
    ]} mark={<span style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <StatusMark kind={c.outcome === 'beyond' ? 'attention' : 'clean'} label={c.outcome === 'beyond' ? 'Weight difference beyond allowance' : 'Weight within allowance'} />
      {below ? <StatusMark kind="breach" label="Grade below contract" /> : <StatusMark kind="clean" label="Grade as contracted" />}
    </span>} />
  ) : null;
  return (
    <Sections>
      <HmHead title={c.id} />
      <RecordHighlights kind="Farm-direct consignment" title={c.id} status={<OpsLoadStatus status={c.status} size="body-3" />} tab={tab} onTab={setTab} actions={actions}
        fields={[
          { label: 'Farmer', value: c.farmer, link: '#' },
          { label: 'Mill', value: 'Riverbend Milling, Lusaka' },
          { label: 'Purchase leg', value: c.leg, link: '#' },
          { label: 'Contract grade', value: c.contractGrade },
          { label: 'Grade received', value: c.grade },
          { label: 'Paid on', value: counts },
          { label: 'Waiting for', value: c.waiting },
        ]} />
      {tab === 'History' ? (
        <HmCard title="History" count={OPS_HISTORY.length} objects="changes">
          <HmTable rows={OPS_HISTORY} columns={[
            { key: 'field', label: 'Field', width: '120px' }, { key: 'user', label: 'User', width: '110px' },
            { key: 'old', label: 'Old value', width: '120px' }, { key: 'next', label: 'New value', width: 'minmax(150px, 1fr)' },
            { key: 'date', label: 'Date (CAT)', width: '160px', tabular: true },
          ]} />
        </HmCard>
      ) : tab === 'Related' ? (
        <HmCard title="Contracts this load counts on" count={2} objects="contracts">
          <HmTable rows={[{ id: 'r1', ref: c.leg, side: 'Purchase', cp: c.farmer, qty: c.offloaded, grade: c.grade }, { id: 'r2', ref: 'SYN4702', side: 'Sale', cp: 'Riverbend Milling', qty: c.offloaded, grade: c.grade }]} columns={[
            { key: 'ref', label: 'Contract', width: '140px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.ref)}>{r.ref}</HmLink> },
            { key: 'side', label: 'Side', width: '100px' },
            { key: 'cp', label: 'Counterparty', width: 'minmax(160px, 1fr)', wrap: true },
            { key: 'qty', label: 'Counts (t)', width: '100px', align: 'right' },
            { key: 'grade', label: 'Grade', width: '90px' },
          ]} />
        </HmCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
          <Card title="Loaded side" padding={16}>
            {hasLoaded ? <HmFacts min={130} fields={[['Delivery note', c.note], ['Truck', c.truck], ['Loaded', `${c.loaded} t`], ['Loaded on', c.loadedOn], ['Recorded by', 'M. Chanda'], ['Source', 'Farmer delivery note'], ['Counts on', 'The difference only']]} />
              : <EmptyState tone="neutral" icon="truck" title="Loaded side not recorded." />}
          </Card>
          <Card title="Mill side" padding={16}>
            {hasMill ? <HmFacts min={130} fields={[['Offloaded', `${c.offloaded} t`], ['Grade', c.grade], ['Offloaded on', c.offloadedOn], ['Recorded by', 'M. Chanda'], ['Source', 'Mill offload sheet'], ['Counts on', 'Purchase leg and sale contract'],
              ...(below ? [['Grade notice', 'Sent to Lakeview Farms Ltd, 25 Sep 2026, 16:05']] : [])]} />
              : <EmptyState tone="neutral" icon="factory" title="Mill side not recorded." />}
          </Card>
          {reconcile}
        </div>
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Farm-direct loads import preview (UX-25) */

const OPS_UPLOAD = [
  { row: 1, consignment: 'FD-0147', farmer: 'Mpongwe Valley Farms', side: 'Loaded side', loaded: '30.800', offloaded: '' },
  { row: 2, consignment: 'FD-0146', farmer: 'Mpongwe Valley Farms', side: 'Mill side', loaded: '', offloaded: '30.880, grade 1' },
  { row: 3, consignment: 'FD-0139', farmer: 'Cameron Estates', side: 'Mill side', loaded: '', offloaded: '33.120, grade 1', check: 'already-recorded', cell: 'E3' },
  { row: 4, consignment: 'FD-0148', farmer: 'Lakeview Farms Ltd', side: 'Loaded side', loaded: '32.500', offloaded: '' },
];

export function FarmDirectUpload({ state = 'Ready to import' }) {
  const fix = state === 'Row to fix';
  const rows = OPS_UPLOAD.map((r) => (fix && r.row === 4 ? { ...r, loaded: '32.5O0', error: 'Cell E4: Loaded must be a weight in tonnes' } : r));
  const status = { Validating: 'validating', Imported: 'imported', Failed: 'failed' }[state] || 'ready';
  return (
    <Sections>
      <HmHead title="Farm-direct loads preview" />
      <ImportPreview status={status} statusWord="map" importing={state === 'Importing'} rows={status === 'validating' || status === 'failed' ? [] : rows}
        refusal={status === 'failed' ? { action: 'Import', reason: 'The file has no sheet named Loads' } : undefined}
        readyWord={(r) => (r.side === 'Mill side' ? 'Completes consignment' : 'Creates consignment')}
        file={{ name: 'Farm-direct loads 26 Sep 2026.xlsx', by: ['M. Chanda', '08:30'], rows: OPS_UPLOAD.length, template: 'Farm-direct loads, version 1', notRead: ['Comments (H1)'] }}
        tiles={status === 'validating' || status === 'failed' ? [] : [{ label: 'Rows', value: '4' }, { label: 'Creates consignment', value: '2' }, { label: 'Completes consignment', value: '1' }, { label: 'Errors', value: fix ? '1' : '0' }]}
        columns={[
          { key: 'consignment', label: 'Consignment', width: '120px' }, { key: 'farmer', label: 'Farmer', width: '180px' },
          { key: 'side', label: 'Side', width: '110px' }, { key: 'loaded', label: 'Loaded (t)', width: '100px', align: 'right', tabular: true },
          { key: 'offloaded', label: 'Offloaded (t)', width: '140px', align: 'right', tabular: true },
        ]} />
    </Sections>
  );
}

/* ------------------------------------------------------------------ Exceptions, Follow-up view (UX-07, UX-34) */

/** Follow-up: the operations lead's saved view of the one Exceptions list, ranked by value at risk (S16 AL7). The weight
    difference beyond allowance is read only for her: Trading or the Managing Director decides it. */
export const OPS_EXCEPTIONS = [
  { id: 'EXC-000201', type: 'Execution', title: 'Documents not released', record: 'KAL-14', recordLink: true, value: '9,755', owner: 'M. Chanda', age: '1 day', status: 'open' },
  { id: 'EXC-000196', type: 'Execution', title: 'Missing mill offload', record: 'KAL-11', recordLink: true, value: '9,658', owner: 'M. Chanda', age: '3 days', status: 'open' },
  { id: 'EXC-000202', type: 'Execution', title: 'Missing mill side', record: 'FD-0146', recordLink: true, value: '8,432', owner: 'M. Chanda', age: '1 day', status: 'open' },
  { id: 'EXC-000203', type: 'Execution', title: 'Missing loaded side', record: 'FD-0145', recordLink: true, value: '8,296', owner: 'M. Chanda', age: '1 day', status: 'open' },
  { id: 'EXC-000205', type: 'Execution', title: 'Weight difference beyond allowance', record: 'FD-0149', recordLink: true, value: '408', owner: 'Managing Director or Trading', age: 'Today', status: 'open' },
  { id: 'EXC-000204', type: 'Quality', title: 'Grade below contract', record: 'FD-0142', recordLink: true, value: '256', owner: 'M. Chanda, J. Tembo informed', age: 'Today', status: 'open' },
].map((r) => ({ ...r, business: r.title, businessRecord: r.record }));

export function FollowUp({ state = 'Follow-up', onOpen }) {
  const rows = state === 'No items' ? [] : hmByValue(OPS_EXCEPTIONS).map((r) => (state === 'Acknowledged' && r.id === 'EXC-000196' ? { ...r, status: 'acknowledged' } : r));
  return (
    <Sections>
      <HmHead title="Exceptions" count={rows.length} right={<Button variant="outline" size="small" icon="download" loading={state === 'Exporting'}>Export</Button>} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <ScrollRow><Capsule chevron selected>Follow-up</Capsule><Capsule chevron>Type</Capsule></ScrollRow>
        <SearchField placeholder="Search this list" hint={null} maxWidth={320} />
      </div>
      <Card padding={rows.length ? 4 : 16}>
        <ExceptionList rows={rows} variant="clerk" priceTier onOpen={onOpen} onOpenRecord={onOpen} />
      </Card>
    </Sections>
  );
}

/* ------------------------------------------------------------------ The farm-direct variance decision (UAG-150) */

/** Exactly three outcomes, as data, under the keys the approval step seeds; Correct a side needs a reason (UX-22). */
export const OPS_VARIANCE_OUTCOMES = [
  { value: 'accept_weighed_net', label: "Accept the mill's offloaded weight", variant: 'primary' },
  { value: 'correct_lines', label: 'Correct a side, with a reason', variant: 'outline', comment: true },
  { value: 're_weigh', label: 'Send for re-weigh', variant: 'outline' },
];
export const OPS_VARIANCE = { id: 'EXC-000205', consignment: 'FD-0149' };

export function VarianceDecision({ state = 'Open', onOpen }) {
  const narrow = !useMinWidth(768);
  const c = OPS_CONSIGNMENTS.find((x) => x.id === OPS_VARIANCE.consignment);
  const readOnly = state === 'Operations, read only';
  const decided = state === 'Decided';
  const busy = state === 'Deciding' ? 'accept_weighed_net' : null;
  const panel = (
    <ActionPanel subject="Decision" context={`${OPS_VARIANCE.id}, ${c.id}`} menu={false} width="100%">
      <SummaryList items={[{ label: 'Loaded', value: `${c.loaded} t` }, { label: 'Offloaded', value: `${c.offloaded} t` }, { label: 'Difference', value: `${c.diff} t, ${c.pct}`, strong: true }, { label: 'Value at risk', value: 'USD 408.00' }]} />
      {decided ? <StatusMark kind="clean" label="Closed" />
        : readOnly ? <HmFacts min={140} fields={[['Waiting for', 'Managing Director or Trading']]} />
        : <div data-variance-decision style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><DecisionActions outcomes={OPS_VARIANCE_OUTCOMES} busy={busy} /></div>}
    </ActionPanel>
  );
  return (
    <Sections>
      <HmHead title={OPS_VARIANCE.id} />
      <RecordHighlights kind="Exception" title={OPS_VARIANCE.id} status={<ExceptionStatus status={decided ? 'closed' : 'open'} size="body-3" />} tabs={[]}
        fields={[
          { label: 'Type', value: 'Execution' },
          { label: 'Exception', value: 'Weight difference beyond allowance' },
          { label: 'Record', value: c.id, link: '#' },
          { label: 'Value at risk', value: 'USD 408.00' },
          { label: 'Owner', value: 'Managing Director or Trading' },
          { label: 'Age', value: 'Today' },
          ...(decided ? [{ label: 'Decision', value: "Accept the mill's offloaded weight, J. Tembo, 26 Sep 2026, 10:12 CAT" }] : []),
        ]} />
      <WithPanel panel={panel}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
          <Card title="Loaded side" padding={16}><HmFacts min={120} fields={[['Farmer', c.farmer], ['Delivery note', c.note], ['Truck', c.truck], ['Loaded', `${c.loaded} t`], ['Loaded on', c.loadedOn]]} /></Card>
          <Card title="Mill side" padding={16}><HmFacts min={120} fields={[['Mill', 'Riverbend Milling, Lusaka'], ['Offloaded', `${c.offloaded} t`], ['Grade', c.grade], ['Offloaded on', c.offloadedOn], ['Counts on', 'Purchase leg and sale contract']]} /></Card>
        </div>
        <ReconcileCard outcome="beyond" status="Beyond allowance" rows={[{ label: 'Loaded', value: `${c.loaded} t` }, { label: 'Offloaded', value: `${c.offloaded} t` }, { label: 'Difference', value: `${c.diff} t, ${c.pct}`, strong: true }, { label: 'Loss allowance', value: '1.0%' }]} />
      </WithPanel>
      {state === 'Correct a side' ? (
        <ReasonDialog open title={`Correct a side, ${c.id}`} label="Reason" minLength={1} confirmLabel="Correct a side" sheet={narrow}>
          The original weights stay on the record beside the correction.
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}
