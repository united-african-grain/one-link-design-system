/** Imports: the operations lead's import screens (M7.DS.01, UAG-99; S16 AL1 to AL5, canvas S17 "One Link Alka"): her
    Home with Cannot invoice yet, Uploads today, Waiting on partners and Exceptions; the port schedule preview; the
    import schedule grouped by mill with a By port view, its invoicing column and the blocking total; and the truck leg
    record page with its checkpoints, port documents, the Record offload, Record border departure and Release port
    documents dialogs and the Reconcile card. Every screen takes `state`, one of its IM_STATES entry, for ?screen=&state=.

    The import schedule carries tonnes and trucks, never money, because the mills see the same view (M7.IMP.03, UX-09,
    UX-10). A leg is a load (UX-32): In transit until the mill offloads it, Delivered with the offload, Reconciled once
    the difference is within the loss allowance. The difference is loaded minus offloaded, computed and never typed
    (RL-DIFF), against the allowed loss on the road: 0.080 t a truck for bulk grain, 0 for bagged (Map D-44, CFG-LOSS).
    A position the transporter reports is a checkpoint row with its Source (CheckpointTimeline), never a badge. Weights
    on a leg carry three decimals, totals none, the unit in the header (UX-12). Dates read 22 Sep 2026, 08:40 with CAT
    on first display (UX-13). Fictional sample data on the golden fixture names. */

export const IM_STATES = {
  OperationsHome: ['With items', 'Cannot invoice yet', 'Uploads today', 'Waiting on partners', 'No items', 'Stale data', 'Loading', 'Error'],
  PortSchedulePreview: ['Validating', 'Row to fix', 'Ready to import', 'Importing', 'Imported', 'Failed'],
  ImportSchedule: ['By mill', 'By port', 'At the border', 'Exporting', 'Nothing scheduled', 'No results', 'Loading', 'Error'],
  TruckLeg: ['At the border', 'Record border departure', 'Record offload', 'Offload missing weight', 'Recording offload', 'Within allowance', 'Beyond tolerance',
    'Documents not released', 'Release port documents', 'Releasing', 'Related', 'History', 'Loading'],
};

/** The operations lead's navigation (canvas S17: Home, Logistics, Finance, Counterparties, Reports), with the import
    screens as Logistics and Finance sections. Farm-direct keeps its place first after the import schedule. */
export const IM_OPS_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'logistics', label: 'Logistics', icon: 'truck', sections: [
    { value: 'schedule', label: 'Import schedule' }, { value: 'farm-direct', label: 'Farm-direct' }, { value: 'performance', label: 'Transport performance' },
    { value: 'rhythm', label: 'Contracted rhythm' }, { value: 'tolerance', label: 'Tolerance agreements' }, { value: 'claims', label: 'Shortage claims' },
    { value: 'unmatched', label: 'Unmatched offloads' }] },
  { value: 'finance', label: 'Finance', icon: 'landmark', sections: [{ value: 'allocation', label: 'Import allocation' }] },
  { value: 'counterparties', label: 'Counterparties', icon: 'building-2' },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
] }];

/** Where a screen in this file sits: the operations lead's frame, the module it highlights and the breadcrumb. */
export function imScheduleFrame(screen, state) {
  const sched = ['Logistics', 'Import schedule'];
  if (screen === 'OperationsHome') return { who: 'ops', module: 'home', breadcrumb: [] };
  if (screen === 'PortSchedulePreview') return { who: 'ops', module: 'logistics', section: 'schedule', breadcrumb: [...sched, 'Port schedule'] };
  if (screen === 'ImportSchedule') return { who: 'ops', module: 'logistics', section: 'schedule', breadcrumb: sched };
  return { who: 'ops', module: 'logistics', section: 'schedule', breadcrumb: [...sched, imLegFor(state).id] };
}

/* ------------------------------------------------------------------ Example data (S16), on the golden fixture */

export const IM_AS_OF = '26 Sep 2026, 10:05 CAT';
export const IM_STALE_AS_OF = '26 Sep 2026, 06:40 CAT';
/** The allowed loss on the road (Map D-44, CFG-LOSS), a setting: bulk grain 0.080 t a truck, bagged 0. */
export const IM_LOSS_ALLOWANCE = { bulk: '0.080', bagged: '0.000', words: '0.080 t a truck, bulk' };

/** The mills on the schedule, each with its vessel, port and allocation from the import allocation (Sid records it). */
export const IM_MILLS = [
  { id: 'riverbend', mill: 'Riverbend Milling, Lusaka', vessel: 'MV Kalahari', port: 'Beira', corridor: 'Beira to Lusaka', contract: 'SYN4845', allocation: '5,000' },
  { id: 'crest', mill: 'Crest Milling, Kitwe', vessel: 'MV Zambezi Star', port: 'Walvis Bay', corridor: 'Walvis Bay to Kitwe', contract: 'SYN4852', allocation: '3,000' },
];

/** The truck legs (S16 example data). `at` is the latest checkpoint reached; `flag` the condition it is stuck in. A
    weight not yet recorded is blank, never "Not recorded" (UX-09). */
export const IM_LEGS = [
  { id: 'KAL-07', mill: 'riverbend', truck: 'ACE 4471', transporter: 'Kazungula Freight', loaded: '34.100', offloaded: '34.020', at: 'offloaded', loadedOn: '19 Sep 2026, 07:55', offloadedOn: '23 Sep 2026, 11:30' },
  { id: 'KAL-09', mill: 'riverbend', truck: 'ACE 4473', transporter: 'Kazungula Freight', loaded: '34.120', offloaded: '34.050', at: 'offloaded', loadedOn: '19 Sep 2026, 08:20', offloadedOn: '23 Sep 2026, 14:05' },
  { id: 'KAL-11', mill: 'riverbend', truck: 'ACE 4474', transporter: 'Kazungula Freight', loaded: '33.960', offloaded: '', at: 'border-arrival', flag: 'not departed', loadedOn: '22 Sep 2026, 08:40', age: '3 days' },
  { id: 'KAL-12', mill: 'riverbend', truck: 'ACE 4475', transporter: 'Kazungula Freight', loaded: '34.200', offloaded: '', at: 'in-transit', loadedOn: '23 Sep 2026, 09:15', age: '2 days' },
  { id: 'KAL-14', mill: 'riverbend', truck: 'ACE 4476', transporter: 'Kazungula Freight', loaded: '34.300', offloaded: '', at: 'loaded', flag: 'documents not released', loadedOn: '25 Sep 2026, 14:10', age: '1 day' },
  { id: 'ZBS-03', mill: 'crest', truck: 'NSH 2201', transporter: 'Northside Haulage', loaded: '33.880', offloaded: '33.700', at: 'offloaded', loadedOn: '18 Sep 2026, 10:05', offloadedOn: '24 Sep 2026, 09:40' },
  { id: 'ZBS-04', mill: 'crest', truck: 'NSH 2204', transporter: 'Northside Haulage', loaded: '34.010', offloaded: '', at: 'border-departure', loadedOn: '21 Sep 2026, 07:30', age: '5 days' },
  { id: 'ZBS-05', mill: 'crest', truck: 'NSH 2207', transporter: 'Northside Haulage', loaded: '33.950', offloaded: '', at: 'in-transit', loadedOn: '24 Sep 2026, 11:50', age: '2 days' },
];

const imMill = (id) => IM_MILLS.find((m) => m.id === id);
/** A checkpoint's word from the component's copy module (CHECKPOINTS), never retyped. */
export function imCheckpointWord(key) { return CHECKPOINTS.find((c) => c.key === key).word; }

/** Loaded minus offloaded in tonnes (RL-DIFF), or '' while the offload is missing. */
export function imDifference(leg) {
  return leg.offloaded ? tonnes(thousandths(leg.loaded) - thousandths(leg.offloaded)) : '';
}
/** Within the loss allowance, or beyond it (RL-ALLOW): 'allowance' or 'beyond', '' with no offload. */
export function imOutcome(leg, allowance = IM_LOSS_ALLOWANCE.bulk) {
  if (!leg.offloaded) return '';
  return thousandths(leg.loaded) - thousandths(leg.offloaded) <= thousandths(allowance) ? 'allowance' : 'beyond';
}
/** A leg's invoice word (S57 Invoices, AL8): Ready to invoice once the mill's offload is in, Blocked until then. */
export function imInvoice(leg) {
  return leg.offloaded ? { kind: 'clean', word: 'Ready to invoice' } : { kind: 'attention', word: 'Blocked' };
}
/** A leg as a load (UX-32): In transit until offloaded, Delivered with the offload, Reconciled within the allowance. */
export function imLegStatus(leg) {
  if (!leg.offloaded) return { kind: 'pending', word: 'In transit' };
  return imOutcome(leg) === 'allowance' ? { kind: 'clean', word: 'Reconciled' } : { kind: 'clean', word: 'Delivered' };
}
/** Whole tonnes for a total or a summary (UX-12): 170.680 is "171". */
export const imWhole = (k) => Math.round(k / 1000).toLocaleString('en-GB');
export const imSum = (legs, key) => legs.reduce((n, l) => n + thousandths(l[key]), 0);

/** The schedule's Checkpoint cell: the latest checkpoint's word (CHECKPOINTS), and the condition it is stuck in. */
export function ImCheckpointCell({ leg }) {
  const word = imCheckpointWord(leg.at);
  if (leg.flag) return <StatusMark kind="attention" label={`${word}, ${leg.flag}`} size="body-4" style={{ whiteSpace: 'normal' }} />;
  if (leg.at === 'offloaded') return <StatusMark kind="clean" label={word} size="body-4" />;
  return <StatusMark kind="awaiting" label={word} size="body-4" />;
}

/** Cannot invoice yet: the legs still waiting for the mill's offload, with their count and whole tonnes. */
export function imBlocking(legs) {
  const blocked = legs.filter((l) => !l.offloaded);
  return { legs: blocked.length, tonnes: imWhole(imSum(blocked, 'loaded')), words: `${blocked.length} ${blocked.length === 1 ? 'leg' : 'legs'}, ${imWhole(imSum(blocked, 'loaded'))} t` };
}

/* ------------------------------------------------------------------ Parts these screens share */

/** A list view's view selector, filters and search (UX-07): saved views in the selector, never pill chips. */
export function ImListBar({ view, filters, search = 'Search this list' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <ScrollRow><Capsule chevron selected>{view}</Capsule>{filters}</ScrollRow>
      <SearchField placeholder={search} hint={null} maxWidth={320} />
    </div>
  );
}

/** Loading: a skeleton in the page's footprint, no text (S57). */
export function ImLoading({ cards = 2 }) {
  return <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}>{Array.from({ length: cards }, (_, i) => <CardSkeleton key={i} />)}</div>;
}

/** A system error (S57): "[Action] failed. [Next step].", with Try again. */
export function ImError({ action = 'Refresh' }) {
  return <Banner tone="error" action={<Button variant="outline" size="small">Try again</Button>}>{action} failed. Try again.</Banner>;
}

/* ------------------------------------------------------------------ Operations view, the operations lead's Home (AL1) */

/** Uploads today (AL1 step 3): each expected upload with its uploader, time, rows and status. The status is the
    import's word (UX-25, UX-33: Imported, never Committed); a file with a row error reads Ready to import with its
    rows to fix beside it; an upload not in by its due time reads Not received (AL1). */
export const IM_UPLOADS = [
  { id: 'u1', upload: 'Port schedule', by: 'K. Zulu', time: '09:12', rows: '14', status: 'ready', fix: '1 row to fix', link: 'port-schedule' },
  { id: 'u2', upload: 'Farm-direct loads', by: 'M. Chanda', time: '08:30', rows: '6', status: 'imported', link: 'farm-direct' },
  { id: 'u3', upload: 'Riverbend Milling offload sheet', by: '', time: 'Due 12:00', rows: '', status: 'missing' },
];
export function ImUploadStatus({ row }) {
  if (row.status === 'missing') return <StatusMark kind="breach" label="Not received" size="body-4" />;
  const s = UPLOAD_STATUS[row.status];
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
      <StatusMark kind={s.kind} label={s.word} size="body-4" />
      {row.fix ? <Text variant="body-4" tone="secondary">{row.fix}</Text> : null}
    </span>
  );
}

/** Cannot invoice yet (AL1 step 2): loads loaded with no mill offload, with truck, loaded weight, age and what they wait for. */
export const IM_CANNOT_INVOICE = [
  { id: 'KAL-11', type: 'Import leg', mill: 'Riverbend Milling, Lusaka', truck: 'ACE 4474', loaded: '33.960', waiting: 'Mill offload', age: '3 days' },
  { id: 'ZBS-04', type: 'Import leg', mill: 'Crest Milling, Kitwe', truck: 'NSH 2204', loaded: '34.010', waiting: 'Mill offload', age: '5 days' },
  { id: 'FD-0146', type: 'Farm-direct', mill: 'Riverbend Milling, Lusaka', truck: 'ABZ 4412', loaded: '31.000', waiting: 'Mill side', age: '1 day' },
];

/** Waiting on partners (AL1 step 4): import trucks awaiting a mill offload or a border departure, farm-direct loads
    awaiting a side, and port documents awaiting the clearing agent. */
export const IM_WAITING = [
  { id: 'w1', record: 'KAL-11', type: 'Import leg', partner: 'Kazungula Freight', waiting: imCheckpointWord('border-departure'), age: '2 days' },
  { id: 'w2', record: 'ZBS-04', type: 'Import leg', partner: 'Crest Milling, Kitwe', waiting: 'Mill offload', age: '5 days' },
  { id: 'w3', record: 'FD-0146', type: 'Farm-direct', partner: 'Riverbend Milling, Lusaka', waiting: 'Mill side', age: '1 day' },
  { id: 'w4', record: 'FD-0145', type: 'Farm-direct', partner: 'Chongwe Growers Ltd', waiting: 'Loaded side', age: '1 day' },
];

/** The exceptions on her Home: the Follow-up view's, ranked by value at risk (S16 AL7). */
export const IM_HOME_EXCEPTIONS = [
  { id: 'EXC-000201', title: 'Documents not released', record: 'KAL-14', value: '9,755' },
  { id: 'EXC-000196', title: 'Missing mill offload', record: 'KAL-11', value: '9,658' },
  { id: 'EXC-000207', title: 'Weight difference beyond allowance', record: 'ZBS-03', value: '51' },
  { id: 'EXC-000202', title: 'Missing mill side', record: 'FD-0146', value: '8,432' },
  { id: 'EXC-000203', title: 'Missing loaded side', record: 'FD-0145', value: '8,296' },
  { id: 'EXC-000204', title: 'Grade below contract', record: 'FD-0142', value: '256' },
];
const imN = (v) => Number(String(v).replace(/,/g, '')) || 0;

/** The four queue counts as filters on the list below (UX-08: Alka's Home counts are filters, not tiles). */
export function imQueue(empty) {
  const uploadsIn = IM_UPLOADS.filter((u) => u.status !== 'missing').length;
  return [
    { value: 'Cannot invoice yet', count: empty ? '0' : String(IM_CANNOT_INVOICE.length) },
    { value: 'Uploads today', count: empty ? '0' : `${uploadsIn} of ${IM_UPLOADS.length}` },
    { value: 'Waiting on partners', count: empty ? '0' : String(IM_WAITING.length) },
    { value: 'Exceptions', count: empty ? '0' : String(IM_HOME_EXCEPTIONS.length) },
  ];
}

export function OperationsHome({ state = 'With items', onOpen }) {
  const empty = state === 'No items';
  const stale = state === 'Stale data';
  const filter = ['Cannot invoice yet', 'Uploads today', 'Waiting on partners'].includes(state) ? state : null;
  const show = (card) => !filter || filter === card;
  const head = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Text as="h1" variant="heading-2" strong style={{ margin: 0 }}>Home</Text>
      <HmRefreshed stale={stale} time={stale ? IM_STALE_AS_OF : IM_AS_OF} />
    </div>
  );
  if (state === 'Loading') return <Sections>{head}<WithRail rail={<CardSkeleton />}><ImLoading cards={3} /></WithRail></Sections>;
  if (state === 'Error') return <Sections>{head}<ImError /></Sections>;
  const queue = (
    <ScrollRow>
      {imQueue(empty).map((q) => <Capsule key={q.value} count={q.count} selected={filter === q.value} onClick={() => onOpen && onOpen(`home:${q.value}`)}>{q.value}</Capsule>)}
    </ScrollRow>
  );
  const cannot = empty ? [] : IM_CANNOT_INVOICE;
  const uploads = empty ? [] : IM_UPLOADS;
  const waiting = empty ? [] : IM_WAITING;
  const exceptions = empty ? [] : [...IM_HOME_EXCEPTIONS].sort((a, b) => imN(b.value) - imN(a.value));
  const main = <>
    {show('Cannot invoice yet') ? (
      <HmCard title="Cannot invoice yet" count={cannot.length} objects="loads">
        <HmTable rows={cannot} columns={[
          { key: 'id', label: 'Record, truck', width: '104px', wrap: true, render: (r) => <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink><Text variant="body-4" tone="secondary" tabular>{r.truck}</Text></span> },
          { key: 'type', label: 'Type', width: '96px', wrap: true },
          { key: 'mill', label: 'Mill', width: 'minmax(120px, 1fr)', wrap: true },
          { key: 'loaded', label: 'Loaded (t)', width: '88px', align: 'right' },
          { key: 'waiting', label: 'Waiting for', width: '96px', wrap: true },
          { key: 'age', label: 'Age', width: '68px' },
          { key: 'action', label: '', width: '136px', align: 'right', render: (r) => <Button variant="outline" size="xsmall" onClick={() => onOpen && onOpen(`offload:${r.id}`)}>Record offload</Button> },
        ]} />
      </HmCard>
    ) : null}
    {show('Uploads today') ? (
      <HmCard title="Uploads today" count={uploads.length} objects="uploads">
        <HmTable rows={uploads} columns={[
          { key: 'upload', label: 'Upload', width: 'minmax(200px, 1fr)', wrap: true, render: (r) => (r.link ? <HmLink onOpen={() => onOpen && onOpen(r.link)}>{r.upload}</HmLink> : r.upload) },
          { key: 'by', label: 'By', width: '110px' },
          { key: 'time', label: 'Time (CAT)', width: '100px', tabular: true },
          { key: 'rows', label: 'Rows', width: '64px', align: 'right' },
          { key: 'status', label: 'Status', width: '150px', render: (r) => <ImUploadStatus row={r} /> },
        ]} />
      </HmCard>
    ) : null}
    {show('Waiting on partners') ? (
      <HmCard title="Waiting on partners" count={waiting.length} objects="records">
        <HmTable rows={waiting} columns={[
          { key: 'record', label: 'Record', width: '100px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.record)}>{r.record}</HmLink> },
          { key: 'type', label: 'Type', width: '110px' },
          { key: 'partner', label: 'Partner', width: 'minmax(170px, 1fr)', wrap: true },
          { key: 'waiting', label: 'Waiting for', width: '140px', wrap: true },
          { key: 'age', label: 'Age', width: '72px' },
        ]} />
      </HmCard>
    ) : null}
  </>;
  const rail = (
    <HmCard title="Exceptions" count={exceptions.length} objects="exceptions" link="View all" onLink={() => onOpen && onOpen('exceptions')}>
      {exceptions.map((r) => (
        <RailRow key={r.id} subject={<HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.title}</HmLink>} context={r.record}
          right={<span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}><Text variant="body-3" strong tabular>USD {r.value}</Text><Text variant="body-4" tone="secondary">Value at risk</Text></span>}
          style={{ padding: '10px 16px', boxShadow: 'inset 0 1px 0 var(--border-light)' }} />
      ))}
    </HmCard>
  );
  return (
    <Sections>
      {head}
      {stale ? <ConditionBanner>Riverbend Milling offload sheet was not received by 12:00 CAT.</ConditionBanner> : null}
      {queue}
      {filter ? main : <WithRail rail={rail}>{main}</WithRail>}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Port schedule preview (AL2, UX-25) */

const IM_PORT_ROWS = [
  { row: 1, leg: 'KAL-15', truck: 'ACE 4480', transporter: 'Kazungula Freight', loaded: '34.180', on: '25 Sep 2026' },
  { row: 2, leg: 'KAL-16', truck: 'ACE 4481', transporter: 'Kazungula Freight', loaded: '33.940', on: '25 Sep 2026' },
  { row: 3, leg: 'KAL-14', truck: 'ACE 4476', transporter: 'Kazungula Freight', loaded: '34.300', on: '25 Sep 2026', check: 'already-recorded', cell: 'A3' },
  { row: 9, leg: 'KAL-17', truck: 'NSH 2209', transporter: 'Northside Haulage', loaded: '34.020', on: '26 Sep 2026' },
  { row: 10, leg: 'KAL-18', truck: 'NSH 2210', transporter: 'Northside Haulage', loaded: '33.870', on: '26 Sep 2026' },
];

export function PortSchedulePreview({ state = 'Row to fix' }) {
  const fix = state === 'Row to fix';
  const status = { Validating: 'validating', Imported: 'imported', Failed: 'failed' }[state] || 'ready';
  const rows = IM_PORT_ROWS.map((r) => (fix && r.row === 9 ? { ...r, leg: '', truck: '', error: 'Row 9: truck registration missing' } : r));
  const blank = status === 'validating' || status === 'failed';
  const blocked = fix || blank || status === 'imported';
  return (
    <Sections>
      <HmHead title="Port schedule preview" right={<>
        <Button variant="outline" size="small" disabled={state === 'Importing' || status === 'imported'}>Discard</Button>
        <Button size="small" loading={state === 'Importing'} disabled={blocked}>Import</Button>
      </>} />
      <ImportPreview status={status} statusWord="map" actions="none" importing={state === 'Importing'} rows={blank ? [] : rows} readyWord="New leg"
        refusal={status === 'failed' ? { action: 'Import', reason: 'The file has no sheet named Loaded trucks' } : undefined}
        file={{ name: 'Port schedule 26 Sep 2026.xlsx', by: ['K. Zulu', '09:12'], rows: 14, template: 'Port schedule, version 1' }}
        tiles={blank ? [] : [{ label: 'Rows', value: '14', note: 'In file' }, { label: 'New legs', value: fix ? '12' : '13', note: imCheckpointWord('loaded') },
          { label: 'Already recorded', value: '1', note: 'Recognised, not duplicated' }, { label: 'Errors', value: fix ? '1' : '0', note: 'Fix before import' }]}
        columns={[
          { key: 'leg', label: 'Leg', width: '90px' }, { key: 'truck', label: 'Truck', width: '100px' },
          { key: 'transporter', label: 'Transporter', width: '160px' },
          { key: 'loaded', label: 'Loaded (t)', width: '100px', align: 'right', tabular: true },
          { key: 'on', label: 'Loaded on', width: '120px', tabular: true },
        ]} />
    </Sections>
  );
}

/* ------------------------------------------------------------------ Import schedule (AL3, list view, UX-07) */

function ImLegTable({ legs, byPort, onOpen }) {
  return (
    <HmTable rows={legs} columns={[
      { key: 'id', label: 'Leg', width: '90px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
      ...(byPort ? [{ key: 'mill', label: 'Mill', width: 'minmax(170px, 1fr)', wrap: true, render: (r) => imMill(r.mill).mill }] : [{ key: 'port', label: 'Port', width: '100px', render: (r) => imMill(r.mill).port }]),
      { key: 'truck', label: 'Truck', width: '90px' },
      { key: 'loaded', label: 'Loaded (t)', width: '96px', align: 'right' },
      { key: 'at', label: 'Checkpoint', width: 'minmax(190px, 1.4fr)', wrap: true, render: (r) => <ImCheckpointCell leg={r} /> },
      { key: 'offloaded', label: 'Offloaded (t)', width: '110px', align: 'right' },
      { key: 'diff', label: 'Difference (t)', width: '112px', align: 'right', render: (r) => imDifference(r) },
      // The invoicing column (criterion 7): whether the leg can be invoiced, never an amount.
      { key: 'invoice', label: 'Invoice', width: '150px', render: (r) => { const i = imInvoice(r); return <StatusMark kind={i.kind} label={i.word} size="body-4" />; } },
    ]} />
  );
}

/** A group's labelled fields (UX-26, not a run-on meta line): vessel, allocation, loaded and offloaded totals, and what
    cannot be invoiced yet. Totals are whole tonnes. */
function ImGroupFacts({ legs, mill }) {
  const b = imBlocking(legs);
  return (
    <HmFacts min={120} fields={[
      ...(mill ? [['Vessel', mill.vessel], ['Allocation (t)', mill.allocation]] : [['Vessel', [...new Set(legs.map((l) => imMill(l.mill).vessel))].join(', ')], ['Mills', String(new Set(legs.map((l) => l.mill)).size)]]),
      ['Loaded (t)', imWhole(imSum(legs, 'loaded'))], ['Offloaded (t)', imWhole(imSum(legs, 'offloaded'))], ['Cannot invoice yet', b.legs ? b.words : '0'],
    ]} />
  );
}

export function ImportSchedule({ state = 'By mill', onOpen }) {
  const byPort = state === 'By port';
  const border = state === 'At the border';
  const head = <HmHead title="Import schedule" count={state === 'Loading' || state === 'Error' ? undefined : state === 'Nothing scheduled' || state === 'No results' ? 0 : border ? 1 : IM_LEGS.length}
    right={<Button variant="outline" size="small" icon="download" loading={state === 'Exporting'} disabled={state === 'Nothing scheduled'}>Export</Button>} />;
  const bar = (
    <ImListBar view={byPort ? 'By port' : 'By mill'} filters={<>
      <Capsule chevron selected={state === 'No results'}>{state === 'No results' ? 'Vessel: MV Ilala' : 'Vessel: All'}</Capsule>
      <Capsule chevron>Corridor: All</Capsule>
      <Capsule chevron selected={border}>{border ? `Checkpoint: ${imCheckpointWord('border-arrival')}` : 'Checkpoint: All'}</Capsule>
    </>} search="Search legs and trucks" />
  );
  if (state === 'Loading') return <Sections>{head}{bar}<ImLoading /></Sections>;
  if (state === 'Error') return <Sections>{head}{bar}<ImError /></Sections>;
  if (state === 'Nothing scheduled') return <Sections>{head}{bar}<Card><EmptyState title="No legs to display." /></Card></Sections>;
  if (state === 'No results') return <Sections>{head}{bar}<Card><EmptyState icon="search" tone="neutral" title="No results match your filters." /></Card></Sections>;
  const legs = border ? IM_LEGS.filter((l) => l.at === 'border-arrival') : IM_LEGS;
  const groups = byPort
    ? [...new Set(legs.map((l) => imMill(l.mill).port))].map((port) => ({ key: port, title: port, legs: legs.filter((l) => imMill(l.mill).port === port) }))
    : IM_MILLS.map((m) => ({ key: m.id, title: m.mill, mill: m, legs: legs.filter((l) => l.mill === m.id) })).filter((g) => g.legs.length);
  const all = imBlocking(legs);
  return (
    <Sections>
      {head}
      {bar}
      <Card padding={16} title="Totals">
        <HmFacts min={140} fields={[['Legs on the schedule', String(legs.length)], ['Loaded (t)', imWhole(imSum(legs, 'loaded'))], ['Offloaded (t)', imWhole(imSum(legs, 'offloaded'))], ['Cannot invoice yet', all.words]]} />
      </Card>
      {groups.map((g) => (
        <Card key={g.key} gap={12} title={g.title} padding={16}>
          <ImGroupFacts legs={g.legs} mill={g.mill} />
          <div style={{ margin: '0 -16px -16px' }}><ImLegTable legs={g.legs} byPort={byPort} onOpen={onOpen} /></div>
        </Card>
      ))}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Truck leg record page (AL4, AL5, UX-19) */

/** The leg each record state draws: KAL-11 at the border, KAL-07 within allowance, ZBS-03 beyond tolerance, KAL-14
    with its port documents not released. */
export function imLegFor(state) {
  const by = (id) => IM_LEGS.find((l) => l.id === id);
  if (state === 'Within allowance') return by('KAL-07');
  if (state === 'Beyond tolerance') return by('ZBS-03');
  if (state === 'Documents not released' || state === 'Release port documents' || state === 'Releasing') return by('KAL-14');
  return by('KAL-11');
}

/** Each leg's checkpoints as recorded: the border arrival on KAL-11 came from a transporter call, a reported position
    with its Source; the weight sources stay on the weight checkpoints. */
export const IM_CHECKPOINTS = {
  'KAL-11': [
    { key: 'loaded', status: 'done', date: '22 Sep 2026, 08:40', by: 'K. Zulu', source: 'port-schedule' },
    { key: 'in-transit', status: 'done', date: '22 Sep 2026, 09:10', by: 'System', source: 'port-schedule' },
    { key: 'border-arrival', status: 'done', date: '24 Sep 2026, 11:20', by: 'M. Chanda', source: 'transporter-call' },
    { key: 'border-departure', status: 'waiting' },
  ],
  'KAL-07': [
    { key: 'loaded', status: 'done', date: '19 Sep 2026, 07:55', by: 'K. Zulu', source: 'port-schedule' },
    { key: 'in-transit', status: 'done', date: '19 Sep 2026, 08:30', by: 'System', source: 'port-schedule' },
    { key: 'border-arrival', status: 'done', date: '21 Sep 2026, 10:10', by: 'M. Chanda', source: 'transporter-message' },
    { key: 'border-departure', status: 'done', date: '21 Sep 2026, 15:40', by: 'M. Chanda', source: 'clearing-agent' },
    { key: 'offloaded', status: 'done', date: '23 Sep 2026, 11:30', by: 'M. Chanda', source: 'mill-offload-sheet' },
  ],
  'ZBS-03': [
    { key: 'loaded', status: 'done', date: '18 Sep 2026, 10:05', by: 'K. Zulu', source: 'port-schedule' },
    { key: 'in-transit', status: 'done', date: '18 Sep 2026, 11:00', by: 'System', source: 'port-schedule' },
    { key: 'border-arrival', status: 'done', date: '20 Sep 2026, 16:45', by: 'M. Chanda', source: 'transporter-call' },
    { key: 'border-departure', status: 'done', date: '21 Sep 2026, 09:20', by: 'M. Chanda', source: 'transporter-call' },
    { key: 'offloaded', status: 'done', date: '24 Sep 2026, 09:40', by: 'M. Chanda', source: 'mill-phone-call' },
  ],
  'KAL-14': [
    { key: 'loaded', status: 'done', date: '25 Sep 2026, 14:10', by: 'K. Zulu', source: 'port-schedule' },
  ],
};

/** The port document set released to the clearing agent when a truck loads (Map D-22). */
export const IM_PORT_DOCUMENTS = ['Bill of lading', 'Commercial invoice', 'Packing list', 'Certificate of origin'];
/** The mill's offload reaches Operations by sheet, call or email (AL4 step 2): the weight sources a mill can give. */
export const IM_OFFLOAD_SOURCES = ['mill-offload-sheet', 'mill-phone-call', 'mill-email'].map((k) => CHECKPOINT_SOURCES[k].word);

const IM_LEG_HISTORY = [
  { id: 'h3', field: imCheckpointWord('border-arrival'), user: 'M. Chanda', old: '', next: `24 Sep 2026, 11:20, ${CHECKPOINT_SOURCES['transporter-call'].word}`, date: '24 Sep 2026, 11:24' },
  { id: 'h2', field: 'Port documents', user: 'M. Chanda', old: 'Not released', next: 'Released to Corridor Clearing Ltd', date: '22 Sep 2026, 10:05' },
  { id: 'h1', field: 'Status', user: 'System', old: '', next: 'In transit', date: '22 Sep 2026, 09:10' },
];

/** Record offload, KAL-11 (UX-22, 480 px): the weight, the date and the mill's source; the difference against the loss
    allowance is computed as the weight is entered, never typed. */
export function ImRecordOffloadDialog({ leg, offloaded = '33.890', missing = false, busy = false, sheet = false }) {
  const after = { ...leg, offloaded: missing ? '' : offloaded };
  const diff = imDifference(after);
  const outcome = imOutcome(after);
  return (
    <Dialog title={`Record offload, ${leg.id}`} width={480} sheet={sheet} onClose={busy ? undefined : () => {}}
      footer={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy} disabled={missing}>Record offload</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16 }}>
          <Field label="Offloaded weight (t)" required error={missing ? 'Offloaded weight must be a weight in tonnes.' : null}><Input align="right" defaultValue={missing ? '' : offloaded} invalid={missing} disabled={busy} /></Field>
          <Field label="Offload date" required><Input defaultValue="26 Sep 2026, 09:40" disabled={busy} /></Field>
        </div>
        <Field label="Source" required><Select options={IM_OFFLOAD_SOURCES} defaultValue={IM_OFFLOAD_SOURCES[0]} disabled={busy} /></Field>
        <SummaryList items={[{ label: 'Loaded', value: `${leg.loaded} t` }, { label: 'Difference', value: diff ? `${diff} t` : '', strong: true }, { label: 'Loss allowance', value: IM_LOSS_ALLOWANCE.words }]} />
        {outcome ? <StatusMark kind={outcome === 'allowance' ? 'clean' : 'attention'} label={outcome === 'allowance' ? 'Within allowance' : 'Beyond tolerance'} /> : null}
      </div>
    </Dialog>
  );
}

export function TruckLeg({ state = 'At the border', onOpen }) {
  const narrow = !useMinWidth(768);
  const leg = imLegFor(state);
  const mill = imMill(leg.mill);
  const initial = state === 'Related' ? 'Related' : state === 'History' ? 'History' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const status = imLegStatus(leg);
  const released = leg.id !== 'KAL-14';
  const offloadOpen = ['Record offload', 'Offload missing weight', 'Recording offload'].includes(state);
  const releaseOpen = state === 'Release port documents' || state === 'Releasing';
  if (state === 'Loading') return <Sections><HmHead title={leg.id} /><Card padding={16} gap={8}><Skeleton width={120} height={14} /><Skeleton width={200} height={24} /><Skeleton height={40} /></Card><ImLoading /></Sections>;
  const actions = leg.offloaded ? null : !released
    ? <Button size="small" onClick={() => onOpen && onOpen('release')}>Release documents</Button>
    : <><Button variant="outline" size="small" onClick={() => onOpen && onOpen('departure')}>Record border departure</Button><Button size="small" onClick={() => onOpen && onOpen('offload')}>Record offload</Button></>;
  const banner = leg.at === 'border-arrival' ? <ConditionBanner>Arrived at Kazungula border 24 Sep 2026, 11:20. Not departed.</ConditionBanner>
    : !released ? <ConditionBanner>Loaded 25 Sep 2026, 14:10. Port documents not released.</ConditionBanner> : null;
  const outcome = imOutcome(leg);
  const reconcile = leg.offloaded ? (
    <ReconcileCard outcome={outcome} status={outcome === 'allowance' ? 'Within allowance' : 'Beyond tolerance'} rows={[
      { label: 'Loaded', value: `${leg.loaded} t` }, { label: 'Offloaded', value: `${leg.offloaded} t` },
      { label: 'Difference', value: `${imDifference(leg)} t`, strong: true }, { label: 'Loss allowance', value: IM_LOSS_ALLOWANCE.words },
    ]} />
  ) : null;
  const docs = released
    ? [['Status', 'Released'], ['Released to', 'Corridor Clearing Ltd'], ['Released', leg.id === 'KAL-07' ? '19 Sep 2026, 08:05' : leg.id === 'ZBS-03' ? '18 Sep 2026, 10:30' : '22 Sep 2026, 10:05'], ['Released by', 'M. Chanda'], ['Documents', IM_PORT_DOCUMENTS.join(', ')]]
    : [['Status', <StatusMark kind="attention" label="Not released" size="body-3" />], ['Released to', ''], ['Released', ''], ['Released by', ''], ['Age', leg.age]];
  const invoice = imInvoice(leg);
  return (
    <Sections>
      <HmHead title={leg.id} />
      {banner}
      <RecordHighlights kind="Truck leg" title={leg.id} status={<StatusMark kind={status.kind} label={status.word} size="body-3" />} tab={tab} onTab={setTab} actions={actions}
        fields={[
          { label: 'Vessel', value: mill.vessel },
          { label: 'Mill', value: mill.mill, link: '#' },
          { label: 'Contract', value: mill.contract, link: '#' },
          { label: 'Transporter', value: leg.transporter, link: '#' },
          { label: 'Truck', value: leg.truck },
          { label: 'Loaded', value: `${leg.loaded} t` },
          { label: 'Invoice', value: <StatusMark kind={invoice.kind} label={invoice.word} size="body-3" /> },
        ]} />
      {tab === 'History' ? (
        <HmCard title="History" count={IM_LEG_HISTORY.length} objects="changes">
          <HmTable rows={IM_LEG_HISTORY} columns={[
            { key: 'field', label: 'Field', width: '140px' }, { key: 'user', label: 'User', width: '110px' },
            { key: 'old', label: 'Old value', width: '120px' }, { key: 'next', label: 'New value', width: 'minmax(200px, 1fr)', wrap: true },
            { key: 'date', label: 'Date (CAT)', width: '160px', tabular: true },
          ]} />
        </HmCard>
      ) : tab === 'Related' ? (
        <HmCard title="Exceptions" count={1} objects="exceptions">
          <HmTable rows={[{ id: 'EXC-000196', title: 'Missing mill offload', owner: 'M. Chanda', age: '3 days', status: 'open' }]} columns={[
            { key: 'id', label: 'Exception', width: '130px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
            { key: 'title', label: 'Title', width: 'minmax(180px, 1fr)', wrap: true },
            { key: 'owner', label: 'Owner', width: '110px' }, { key: 'age', label: 'Age', width: '80px' },
            { key: 'status', label: 'Status', width: '120px', render: (r) => <ExceptionStatus status={r.status} /> },
          ]} />
        </HmCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: reconcile ? 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' : 'minmax(0, 1fr)', gap: 'var(--card-gap)', alignItems: 'start' }}>
          <Sections>
            <HmCard title="Checkpoints" count={CHECKPOINTS.length}>
              <CheckpointTimeline checkpoints={IM_CHECKPOINTS[leg.id]} />
            </HmCard>
            <Card title="Port documents" padding={16}><HmFacts min={140} fields={docs} /></Card>
          </Sections>
          {reconcile}
        </div>
      )}
      {offloadOpen ? <ImRecordOffloadDialog leg={leg} missing={state === 'Offload missing weight'} busy={state === 'Recording offload'} sheet={narrow} /> : null}
      {state === 'Record border departure' ? (
        <Dialog title={`Record border departure, ${leg.id}`} width={480} sheet={narrow} onClose={() => {}}
          footer={<><Button variant="ghost" size="small">Cancel</Button><Button size="small">Record border departure</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Departed" required><Input defaultValue="26 Sep 2026, 08:15" /></Field>
            <Field label="Source" required><Select options={checkpointSourceOptions('border-departure')} defaultValue={CHECKPOINT_SOURCES['transporter-call'].word} /></Field>
          </div>
        </Dialog>
      ) : null}
      {releaseOpen ? (
        <Dialog title={`Release port documents, ${leg.id}`} width={480} sheet={narrow} onClose={state === 'Releasing' ? undefined : () => {}}
          footer={<><Button variant="ghost" size="small" disabled={state === 'Releasing'}>Cancel</Button><Button size="small" loading={state === 'Releasing'}>Release</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Released to" required><Select options={['Corridor Clearing Ltd', 'Beira Port Agencies']} defaultValue="Corridor Clearing Ltd" disabled={state === 'Releasing'} /></Field>
            <Field label="Documents" required><CheckboxList options={IM_PORT_DOCUMENTS} values={IM_PORT_DOCUMENTS} disabled={state === 'Releasing'} /></Field>
            <Field label="Released" required><Input defaultValue="26 Sep 2026, 10:20" disabled={state === 'Releasing'} /></Field>
          </div>
        </Dialog>
      ) : null}
    </Sections>
  );
}
