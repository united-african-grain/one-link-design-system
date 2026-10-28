/** Imports: the corridor screens of the operations lead's second pass (M7.DS.01, UAG-99; S16 "Later rounds": transport
    rhythm UAG-105 and shortage tolerances UAG-112; Sid's import allocation, S60 screen 11). No canvas draws them yet, so
    they are built in the layout, sections and words of the nearest canvas, Alka's (Build Charter section 8), and are
    Proposed: transport performance per transporter and corridor, week by week; a shortage claim with its pre-loading
    tolerance and evidence; allocation and shipment drawdown; contracted rhythm entry; transporter tolerance agreements
    with evidence; and unmatched offloads. Every screen takes `state`, one of its IM_CORRIDOR_STATES entry.

    Operations data on every screen except the shortage claim's value, which carries the tier treatment (M1.ID.04): the
    warehouse's view of the same claim shows the Restricted lock in its place. Allocations are recorded by Finance and
    read here; going beyond a mill's import permit is a flag, never a block (S60 screen 11). Fictional sample data. */

export const IM_CORRIDOR_STATES = {
  TransportPerformance: ['Week by week', 'Behind schedule', 'Exporting', 'No legs', 'Loading'],
  ShortageClaim: ['Draft', 'Submitting', 'Pending approval', 'Approved', 'Within tolerance', 'Warehouse view', 'History'],
  AllocationDrawdown: ['All allocations', 'Over-delivered', 'Beyond permit', 'Behind schedule', 'Calculation details', 'Nothing allocated', 'Loading'],
  ContractedRhythm: ['Rhythms', 'New rhythm', 'Missing fields', 'Saving', 'Saved', 'No rhythms'],
  ToleranceAgreements: ['Agreements', 'Agreement', 'Evidence missing', 'Activating', 'No agreements'],
  UnmatchedOffloads: ['Unmatched', 'Match to leg', 'Matching', 'No items'],
};

/** The warehouse's frame (Build Charter section 8: the Clerk's canvas): it opens the import schedule and a shortage
    claim, and sees no price, value or margin. */
export const IM_WAREHOUSE_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'logistics', label: 'Logistics', icon: 'truck', sections: [{ value: 'schedule', label: 'Import schedule' }, { value: 'claims', label: 'Shortage claims' }] },
  { value: 'inventory', label: 'Inventory', icon: 'warehouse' },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
] }];
export const IM_WAREHOUSE_USER = { initials: 'KZ', name: 'K. Zulu', meta: 'Warehouse' };

export function imCorridorFrame(screen, state) {
  const lg = (section, label, ...rest) => ({ who: 'ops', module: 'logistics', section, breadcrumb: ['Logistics', label, ...rest] });
  if (screen === 'TransportPerformance') return lg('performance', 'Transport performance');
  if (screen === 'ShortageClaim') return state === 'Warehouse view' ? { who: 'warehouse', module: 'logistics', section: 'claims', breadcrumb: ['Logistics', 'Shortage claims', IM_CLAIM.id] } : lg('claims', 'Shortage claims', IM_CLAIM.id);
  if (screen === 'AllocationDrawdown') return { who: 'ops', module: 'finance', section: 'allocation', breadcrumb: ['Finance', 'Import allocation'] };
  if (screen === 'ContractedRhythm') return ['New rhythm', 'Missing fields', 'Saving'].includes(state) ? lg('rhythm', 'Contracted rhythm', 'New') : lg('rhythm', 'Contracted rhythm');
  if (screen === 'ToleranceAgreements') return state === 'No agreements' || state === 'Agreements' ? lg('tolerance', 'Tolerance agreements') : lg('tolerance', 'Tolerance agreements', state === 'Agreement' ? 'TA-0002' : 'TA-0004');
  return lg('unmatched', 'Unmatched offloads');
}

/* ------------------------------------------------------------------ Transport performance, week by week (c) */

/** Trucks loaded each week against the contracted rhythm (Agreed trucks a week, U-44). A transporter and corridor with
    no rhythm agreed shows Not set, and no status is drawn for it. */
export const IM_WEEKS = ['07 Sep', '14 Sep', '21 Sep', '28 Sep'];
export const IM_PERFORMANCE = [
  { id: 'p1', transporter: 'Kazungula Freight', corridor: 'Beira to Lusaka', agreed: '12', weeks: ['12', '12', '11', '9'], within: '96%', status: 'on' },
  { id: 'p2', transporter: 'Northside Haulage', corridor: 'Walvis Bay to Kitwe', agreed: '8', weeks: ['8', '7', '5', '4'], within: '88%', status: 'behind' },
  { id: 'p3', transporter: 'Ridgeway Transport', corridor: 'Beira to Lusaka', agreed: '', weeks: ['3', '2', '4', '3'], within: '100%', status: '' },
];
const IM_RHYTHM_MARK = { on: { kind: 'clean', word: 'On schedule' }, behind: { kind: 'attention', word: 'Behind schedule' } };
export function ImRhythmStatus({ status }) {
  const s = IM_RHYTHM_MARK[status];
  return s ? <StatusMark kind={s.kind} label={s.word} size="body-4" /> : '';
}

export function TransportPerformance({ state = 'Week by week', onOpen }) {
  const behind = state === 'Behind schedule';
  const rows = state === 'No legs' ? [] : behind ? IM_PERFORMANCE.filter((r) => r.status === 'behind') : IM_PERFORMANCE;
  const head = <HmHead title="Transport performance" count={state === 'Loading' ? undefined : rows.length} right={<Button variant="outline" size="small" icon="download" loading={state === 'Exporting'}>Export</Button>} />;
  const bar = <ImListBar view={behind ? 'Behind schedule' : 'All transporters'} filters={<><Capsule chevron>Corridor: All</Capsule><Capsule chevron>Weeks: last 4</Capsule></>} search="Search transporters" />;
  if (state === 'Loading') return <Sections>{head}{bar}<ImLoading cards={1} /></Sections>;
  return (
    <Sections>
      {head}
      {bar}
      {rows.length ? (
        <Card padding={4}>
          <HmTable rows={rows} columns={[
            { key: 'transporter', label: 'Transporter', width: 'minmax(140px, 1fr)', wrap: true, render: (r) => <HmLink onOpen={() => onOpen && onOpen('rhythm')}>{r.transporter}</HmLink> },
            { key: 'corridor', label: 'Corridor', width: '140px', wrap: true },
            { key: 'agreed', label: 'Agreed trucks a week', width: '150px', align: 'right', render: (r) => (r.agreed ? r.agreed : <NotSet size="body-4" />) },
            ...IM_WEEKS.map((w, i) => ({ key: `w${i}`, label: `Week of ${w}`, width: '104px', align: 'right', render: (r) => r.weeks[i] })),
            { key: 'within', label: 'Within allowance', width: '120px', align: 'right' },
            { key: 'status', label: 'Status', width: '140px', render: (r) => <ImRhythmStatus status={r.status} /> },
          ]} />
        </Card>
      ) : <Card><EmptyState title="No legs to display." /></Card>}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Shortage claim (i) */

/** A mill's shortage claim on a delivered leg (U-39: an accepted claim is a Shortage adjustment line on the next invoice
    run). The shortage counts beyond the tolerance agreed before loading; within it there is nothing to claim. */
export const IM_CLAIM = {
  id: 'SC-0007', leg: 'ZBS-03', mill: 'Crest Milling, Kitwe', contract: 'SYN4852', transporter: 'Northside Haulage', agreement: 'TA-0002',
  loaded: '33.880', offloaded: '33.700', tolerance: '0.080', price: 'USD 284.40 per t',
};
/** The claimable shortage: the difference beyond the pre-loading tolerance, never below zero. */
export function imClaimable(c = IM_CLAIM) {
  const over = thousandths(c.loaded) - thousandths(c.offloaded) - thousandths(c.tolerance);
  return over > 0 ? tonnes(over) : '0.000';
}
const IM_CLAIM_HISTORY = [
  { id: 'h3', field: 'Status', user: 'M. Chanda', old: 'Draft', next: 'Pending approval', date: '25 Sep 2026, 15:12' },
  { id: 'h2', field: 'Evidence', user: 'M. Chanda', old: '', next: 'Mill offload sheet, 24 Sep 2026', date: '25 Sep 2026, 15:05' },
  { id: 'h1', field: 'Status', user: 'M. Chanda', old: '', next: 'Draft', date: '25 Sep 2026, 14:58' },
];

export function ShortageClaim({ state = 'Pending approval', onOpen }) {
  const warehouse = state === 'Warehouse view';
  const within = state === 'Within tolerance';
  const c = within ? { ...IM_CLAIM, id: 'SC-0008', leg: 'KAL-07', mill: 'Riverbend Milling, Lusaka', contract: 'SYN4845', transporter: 'Kazungula Freight', agreement: 'TA-0001', loaded: '34.100', offloaded: '34.020' } : IM_CLAIM;
  const claimable = imClaimable(c);
  const draft = state === 'Draft' || state === 'Submitting' || within;
  const status = draft ? { kind: 'neutral', word: 'Draft' } : state === 'Approved' ? { kind: 'clean', word: 'Approved' } : { kind: 'pending', word: 'Pending approval' };
  const value = warehouse ? <Restricted /> : `USD ${(thousandths(claimable) * 0.2844).toFixed(2)}`;
  const tab = state === 'History' ? 'History' : 'Details';
  const actions = warehouse ? null : draft
    ? <Button size="small" loading={state === 'Submitting'} disabled={within}>Submit for approval</Button> : null;
  return (
    <Sections>
      <HmHead title={c.id} />
      <RecordHighlights kind="Shortage claim" title={c.id} status={<StatusMark kind={status.kind} label={status.word} size="body-3" />} tab={tab} onTab={() => {}} actions={actions}
        fields={[
          { label: 'Leg', value: c.leg, link: warehouse ? undefined : '#' },
          { label: 'Claimed by', value: c.mill },
          { label: 'Contract', value: c.contract, link: warehouse ? undefined : '#' },
          { label: 'Transporter', value: c.transporter },
          { label: 'Shortage claimed', value: `${claimable} t` },
          { label: 'Claim value', value },
          ...(state === 'Pending approval' ? [{ label: 'Waiting for', value: 'Managing Director or Trading' }] : []),
          ...(state === 'Approved' ? [{ label: 'Invoice', value: 'Shortage adjustment, next invoice run' }] : []),
        ]} />
      {within ? <Refusal action="Submit for approval" reason="The difference is within the tolerance agreed before loading" /> : null}
      {tab === 'History' ? (
        <HmCard title="History" count={IM_CLAIM_HISTORY.length} objects="changes">
          <HmTable rows={IM_CLAIM_HISTORY} columns={[
            { key: 'field', label: 'Field', width: '110px' }, { key: 'user', label: 'User', width: '110px' },
            { key: 'old', label: 'Old value', width: '120px' }, { key: 'next', label: 'New value', width: 'minmax(200px, 1fr)', wrap: true },
            { key: 'date', label: 'Date (CAT)', width: '160px', tabular: true },
          ]} />
        </HmCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
          <ReconcileCard title="Shortage" outcome={thousandths(claimable) > 0 ? 'beyond' : 'allowance'} status={thousandths(claimable) > 0 ? 'Beyond tolerance' : 'Within allowance'} rows={[
            { label: 'Loaded', value: `${c.loaded} t` }, { label: 'Offloaded', value: `${c.offloaded} t` },
            { label: 'Difference', value: `${tonnes(thousandths(c.loaded) - thousandths(c.offloaded))} t` },
            { label: 'Pre-loading tolerance', value: `${c.tolerance} t a truck` },
            { label: 'Shortage claimed', value: `${claimable} t`, strong: true },
          ]} />
          <Card title="Evidence" padding={16}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <EvidenceTile kind="document" caption="Mill offload sheet" time="24 Sep 2026" />
              <EvidenceTile kind="document" caption="Port schedule, row 4" time="18 Sep 2026" />
            </div>
            <HmFacts min={140} fields={[['Tolerance agreement', warehouse ? c.agreement : <HmLink onOpen={() => onOpen && onOpen('agreement')}>{c.agreement}</HmLink>], ['Agreed before loading', '01 Sep 2026'], ['Contract price', warehouse ? <Restricted /> : c.price]]} />
          </Card>
        </div>
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Allocation and shipment drawdown (o) */

/** Each mill's import allocation against its permit, drawn down by the legs: loaded, offloaded, in transit (loaded
    less offloaded), remaining (allocated less loaded, never below zero) and over-delivered. Finance records the
    allocation (U-18 default: Sid, S60 screen 11); Operations reads it. */
export const IM_ALLOCATIONS = [
  { id: 'a1', mill: 'Riverbend Milling, Lusaka', vessel: 'MV Kalahari', permit: '5,500', allocated: '5,000', loaded: '3,410', offloaded: '2,980', expected: '3,200', flag: '' },
  { id: 'a2', mill: 'Crest Milling, Kitwe', vessel: 'MV Zambezi Star', permit: '3,000', allocated: '3,000', loaded: '1,240', offloaded: '1,100', expected: '2,000', flag: 'behind' },
  { id: 'a3', mill: 'Kafue Valley Milling, Kafue', vessel: 'MV Kalahari', permit: '2,500', allocated: '2,000', loaded: '2,060', offloaded: '2,020', expected: '2,000', flag: 'over' },
  { id: 'a4', mill: 'Greenfield Agri, Mkushi', vessel: 'MV Zambezi Star', permit: '1,500', allocated: '1,800', loaded: '1,560', offloaded: '1,500', expected: '1,500', flag: 'permit' },
];
const imT = (v) => Number(String(v).replace(/,/g, '')) || 0;
const imFmt = (n) => n.toLocaleString('en-GB');
/** The drawdown figures of one allocation, derived, never typed. */
export function imDrawdown(a) {
  const loaded = imT(a.loaded);
  const allocated = imT(a.allocated);
  return { transit: imFmt(loaded - imT(a.offloaded)), remaining: imFmt(Math.max(0, allocated - loaded)), over: loaded > allocated ? imFmt(loaded - allocated) : '' };
}
const IM_ALLOCATION_MARK = { behind: { kind: 'attention', word: 'Behind schedule' }, over: { kind: 'attention', word: 'Over-delivered' }, permit: { kind: 'breach', word: 'Beyond permit' }, '': { kind: 'clean', word: 'On schedule' } };

export function AllocationDrawdown({ state = 'All allocations', onOpen }) {
  const filter = { 'Over-delivered': 'over', 'Beyond permit': 'permit', 'Behind schedule': 'behind' }[state];
  const rows = state === 'Nothing allocated' ? [] : filter ? IM_ALLOCATIONS.filter((a) => a.flag === filter) : IM_ALLOCATIONS;
  const [calc, setCalc] = useState(state === 'Calculation details');
  useEffect(() => setCalc(state === 'Calculation details'), [state]);
  const head = <HmHead title="Import allocation" count={state === 'Loading' ? undefined : rows.length} meta={<span>Recorded by Finance, 2026 wheat import allocation</span>} />;
  const bar = <ImListBar view={state === 'All allocations' || state === 'Calculation details' || state === 'Nothing allocated' || state === 'Loading' ? 'All allocations' : state} filters={<><Capsule chevron>Vessel: All</Capsule><Capsule chevron>Corridor: All</Capsule></>} search="Search mills" />;
  if (state === 'Loading') return <Sections>{head}{bar}<ImLoading cards={1} /></Sections>;
  const sum = (k) => imFmt(rows.reduce((n, a) => n + imT(a[k]), 0));
  const sumD = (k) => imFmt(rows.reduce((n, a) => n + imT(imDrawdown(a)[k]), 0));
  const data = rows.length ? [...rows, { id: 'total', total: true, mill: 'Total', allocated: sum('allocated'), loaded: sum('loaded'), offloaded: sum('offloaded'), transit: sumD('transit'), remaining: sumD('remaining'), over: sumD('over') }] : [];
  const strong = (r, v) => (r.total ? <Text variant="body-3" strong tabular>{v}</Text> : v);
  const d = (k) => (r) => strong(r, r.total ? r[k] : imDrawdown(r)[k]);
  const riverbend = IM_ALLOCATIONS[0];
  return (
    <Sections>
      {head}
      {bar}
      {data.length ? (
        <Card padding={4}>
          <HmTable rows={data} columns={[
            { key: 'mill', label: 'Mill', width: 'minmax(150px, 1fr)', wrap: true, render: (r) => strong(r, r.mill) },
            { key: 'vessel', label: 'Vessel', width: '120px', wrap: true },
            { key: 'permit', label: 'Permit (t)', width: '84px', align: 'right' },
            { key: 'allocated', label: 'Allocated (t)', width: '100px', align: 'right', render: (r) => strong(r, r.allocated) },
            { key: 'loaded', label: 'Loaded (t)', width: '88px', align: 'right', render: (r) => strong(r, r.loaded) },
            { key: 'offloaded', label: 'Offloaded (t)', width: '104px', align: 'right', render: (r) => strong(r, r.offloaded) },
            { key: 'transit', label: 'In transit (t)', width: '100px', align: 'right', render: d('transit') },
            { key: 'remaining', label: 'Remaining (t)', width: '108px', align: 'right', render: (r) => (r.total ? strong(r, r.remaining) : <HmLink onOpen={() => setCalc(true)}>{imDrawdown(r).remaining}</HmLink>) },
            { key: 'over', label: 'Over-delivered (t)', width: '132px', align: 'right', render: d('over') },
            { key: 'status', label: 'Status', width: '140px', render: (r) => (r.total ? '' : <StatusMark kind={IM_ALLOCATION_MARK[r.flag].kind} label={IM_ALLOCATION_MARK[r.flag].word} size="body-4" />) },
          ]} />
        </Card>
      ) : <Card><EmptyState title="No allocations to display." /></Card>}
      {calc ? <CalculationDetails open onClose={() => setCalc(false)} name={`Remaining, ${riverbend.mill}`} value={`${imDrawdown(riverbend).remaining} t`}
        components={[{ label: 'Allocated', value: `${riverbend.allocated} t` }, { label: 'Loaded', value: `-${riverbend.loaded} t` }]}
        total={{ label: 'Remaining (t)', value: imDrawdown(riverbend).remaining }}
        basis={[{ label: 'Import permit', value: `${riverbend.permit} t` }, { label: 'Expected loaded by 26 Sep 2026', value: `${riverbend.expected} t` }, { label: 'Source', value: '2026 wheat import allocation, recorded by Finance' }]} /> : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Contracted rhythm entry (q) */

export const IM_RHYTHMS = [
  { id: 'r1', transporter: 'Kazungula Freight', corridor: 'Beira to Lusaka', agreed: '12', from: '01 Sep 2026', by: 'M. Chanda', status: 'Active' },
  { id: 'r2', transporter: 'Northside Haulage', corridor: 'Walvis Bay to Kitwe', agreed: '8', from: '01 Sep 2026', by: 'M. Chanda', status: 'Active' },
];

export function ContractedRhythm({ state = 'Rhythms' }) {
  const form = ['New rhythm', 'Missing fields', 'Saving'].includes(state);
  if (form) {
    const missing = state === 'Missing fields';
    const busy = state === 'Saving';
    return (
      <Sections>
        <HmHead title="New contracted rhythm" right={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Save</Button></>} />
        <Card title="Contracted rhythm" padding={16}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: 16 }}>
            <Field label="Transporter" required><Select options={['Ridgeway Transport', 'Kazungula Freight', 'Northside Haulage']} defaultValue="Ridgeway Transport" disabled={busy} /></Field>
            <Field label="Corridor" required><Select options={['Beira to Lusaka', 'Walvis Bay to Kitwe']} defaultValue="Beira to Lusaka" disabled={busy} /></Field>
            <Field label="Agreed trucks a week" required error={missing ? 'Agreed trucks a week must be a whole number.' : null}><Input align="right" inputMode="numeric" defaultValue={missing ? '' : '4'} invalid={missing} disabled={busy} /></Field>
            <Field label="From" required><Input defaultValue="28 Sep 2026" disabled={busy} /></Field>
          </div>
        </Card>
      </Sections>
    );
  }
  const rows = state === 'No rhythms' ? [] : IM_RHYTHMS;
  return (
    <Sections>
      <HmHead title="Contracted rhythm" count={rows.length} right={<Button size="small" icon="plus">New</Button>} />
      {state === 'Saved' ? <Banner tone="success">Contracted rhythm saved.</Banner> : null}
      <ImListBar view="All rhythms" filters={<Capsule chevron>Corridor: All</Capsule>} search="Search transporters" />
      {rows.length ? (
        <Card padding={4}>
          <HmTable rows={state === 'Saved' ? [...rows, { id: 'r3', transporter: 'Ridgeway Transport', corridor: 'Beira to Lusaka', agreed: '4', from: '28 Sep 2026', by: 'M. Chanda', status: 'Active' }] : rows} columns={[
            { key: 'transporter', label: 'Transporter', width: 'minmax(160px, 1fr)', wrap: true },
            { key: 'corridor', label: 'Corridor', width: '170px', wrap: true },
            { key: 'agreed', label: 'Agreed a week (trucks)', width: '170px', align: 'right' },
            { key: 'from', label: 'From', width: '120px', tabular: true },
            { key: 'by', label: 'Recorded by', width: '120px' },
            { key: 'status', label: 'Status', width: '110px', render: (r) => <StatusMark kind="clean" label={r.status} size="body-4" /> },
          ]} />
        </Card>
      ) : <Card><EmptyState title="No contracted rhythms to display." /></Card>}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Transporter tolerance agreements (r) */

/** The loss each transporter agreed before loading, with the signed agreement as evidence. The default is the allowed
    loss on the road (Map D-44): 0.080 t a truck for bulk grain, 0 for bagged. An agreement with no evidence stays Draft. */
export const IM_AGREEMENTS = [
  { id: 'TA-0001', transporter: 'Kazungula Freight', product: 'Bulk wheat', tolerance: '0.080', agreed: '01 Sep 2026', evidence: 'Signed agreement', status: 'Active' },
  { id: 'TA-0002', transporter: 'Northside Haulage', product: 'Bulk wheat', tolerance: '0.080', agreed: '01 Sep 2026', evidence: 'Signed agreement', status: 'Active' },
  { id: 'TA-0003', transporter: 'Ridgeway Transport', product: 'Bagged fertiliser', tolerance: '0.000', agreed: '15 Sep 2026', evidence: 'Signed agreement', status: 'Active' },
  { id: 'TA-0004', transporter: 'Ridgeway Transport', product: 'Bulk wheat', tolerance: '0.080', agreed: '', evidence: '', status: 'Draft' },
];

export function ToleranceAgreements({ state = 'Agreements', onOpen }) {
  if (state === 'Agreements' || state === 'No agreements') {
    const rows = state === 'No agreements' ? [] : IM_AGREEMENTS;
    return (
      <Sections>
        <HmHead title="Tolerance agreements" count={rows.length} right={<Button size="small" icon="plus">New</Button>} />
        <ImListBar view="All agreements" filters={<Capsule chevron>Transporter: All</Capsule>} search="Search agreements" />
        {rows.length ? (
          <Card padding={4}>
            <HmTable rows={rows} columns={[
              { key: 'id', label: 'Agreement', width: '110px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
              { key: 'transporter', label: 'Transporter', width: 'minmax(160px, 1fr)', wrap: true },
              { key: 'product', label: 'Product', width: '150px' },
              { key: 'tolerance', label: 'Tolerance a truck (t)', width: '160px', align: 'right' },
              { key: 'agreed', label: 'Agreed on', width: '120px', tabular: true },
              { key: 'evidence', label: 'Evidence', width: '150px' },
              { key: 'status', label: 'Status', width: '100px', render: (r) => <StatusMark kind={r.status === 'Active' ? 'clean' : 'neutral'} label={r.status} size="body-4" /> },
            ]} />
          </Card>
        ) : <Card><EmptyState title="No tolerance agreements to display." /></Card>}
      </Sections>
    );
  }
  const a = state === 'Agreement' ? IM_AGREEMENTS[1] : IM_AGREEMENTS[3];
  const draft = a.status === 'Draft';
  return (
    <Sections>
      <HmHead title={a.id} />
      <RecordHighlights kind="Tolerance agreement" title={a.id} status={<StatusMark kind={draft ? 'neutral' : 'clean'} label={a.status} size="body-3" />} tabs={[]}
        actions={draft ? <Button size="small" loading={state === 'Activating'} disabled={state === 'Evidence missing'}>Activate</Button> : null}
        fields={[{ label: 'Transporter', value: a.transporter, link: '#' }, { label: 'Product', value: a.product }, { label: 'Tolerance a truck', value: `${a.tolerance} t` }, { label: 'Agreed on', value: a.agreed }, { label: 'Recorded by', value: 'M. Chanda' }]} />
      {state === 'Evidence missing' ? <Refusal action="Activate" reason="No signed agreement is attached" /> : null}
      <Card title="Evidence" padding={16}>
        {a.evidence || state === 'Activating'
          ? <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><EvidenceTile kind="document" caption={`Signed agreement, ${a.transporter}`} time={a.agreed || '26 Sep 2026'} /></div>
          : <EmptyState tone="neutral" icon="file-text" title="No evidence to display." />}
        {draft ? <div><Button variant="outline" size="small" icon="paperclip">Attach evidence</Button></div> : null}
      </Card>
    </Sections>
  );
}

/* ------------------------------------------------------------------ Unmatched offloads (s), M7.IMP.05 AC 8 */

/** Offloads a mill reported for a truck on no leg: saved, never refused, each raising the one exception Offload with
    no loaded record, whoever reported it (Operations by call, email or sheet, or the mill itself through the portal),
    so there is one list for one problem. The columns are the operations lead's follow-up: the truck, the mill, the
    offloaded weight and date, the Source, who reported it, its age and its exception's status. Matching to a leg or
    closing with a reason are entries beside the original; the unmatched offload is never edited. */
export const IM_UNMATCHED = [
  { id: 'ZZT 901', mill: 'Antelope Mills, Lusaka', truck: 'ZZT 901', offloaded: '31.640', on: '15 Oct 2026, 10:20', source: 'mill-call', by: 'M. Chanda', age: '2 h', status: 'open', exception: 'EXC-000233' },
  { id: 'BCX 3310', mill: 'Antelope Mills, Lusaka', truck: 'BCX 3310', offloaded: '32.180', on: '14 Oct 2026, 16:05', source: 'mill-portal', by: 'Antelope Mills', age: '1 day', status: 'open', exception: 'EXC-000229' },
  { id: 'NSH 2240', mill: 'Crest Milling, Kitwe', truck: 'NSH 2240', offloaded: '34.050', on: '14 Oct 2026, 09:40', source: 'email', by: 'M. Chanda', age: '1 day', status: 'acknowledged', exception: 'EXC-000226' },
  { id: 'ACE 4447', mill: 'Riverbend Milling, Lusaka', truck: 'ACE 4447', offloaded: '33.910', on: '13 Oct 2026, 14:20', source: 'mill-offload-sheet', by: 'M. Chanda', age: '2 days', status: 'open', exception: 'EXC-000221' },
];

export function UnmatchedOffloads({ state = 'Unmatched', onOpen }) {
  const narrow = !useMinWidth(768);
  const rows = state === 'No items' ? [] : IM_UNMATCHED;
  const dialog = state === 'Match to leg' || state === 'Matching';
  return (
    <Sections>
      <HmHead title="Unmatched offloads" count={rows.length} />
      <ImListBar view="All unmatched offloads" filters={<><Capsule chevron>Mill: All</Capsule><Capsule chevron>Source: All</Capsule></>} search="Search trucks" />
      {rows.length ? (
        <Card padding={4}>
          <HmTable rows={rows} columns={[
            { key: 'truck', label: 'Truck', width: '110px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(`unmatched:${r.id}`)}>{r.truck}</HmLink> },
            { key: 'mill', label: 'Mill', width: 'minmax(170px, 1fr)', wrap: true },
            { key: 'offloaded', label: 'Offloaded (t)', width: '110px', align: 'right' },
            { key: 'on', label: 'Offloaded on (CAT)', width: '170px', tabular: true },
            { key: 'source', label: 'Source', width: '150px', render: (r) => offloadSource(r.source) },
            { key: 'by', label: 'Reported by', width: '140px', wrap: true },
            { key: 'age', label: 'Age', width: '72px' },
            { key: 'status', label: 'Status', width: '130px', render: (r) => <ExceptionStatus status={r.status} /> },
            { key: 'action', label: '', width: '130px', align: 'right', render: (r) => (r.status === 'closed' ? '' : <Button variant="outline" size="xsmall" onClick={() => onOpen && onOpen(`unmatched:${r.id}`)}>Match to leg</Button>) },
          ]} />
        </Card>
      ) : <Card><EmptyState title="No unmatched offloads to display." /></Card>}
      {dialog ? <ImMatchDialog offload={IM_UNMATCHED[0]} busy={state === 'Matching'} sheet={narrow} /> : null}
    </Sections>
  );
}
