/** Imports: the mill offload screens M7.IMP.05 (UAG-103) left undrawn: the Import legs card on a sale contract's
    Related tab, and an unmatched offload's record page with its open exception, Match to leg and Close. The Record
    offload dialog, the Reconcile card in its Beyond allowance state and the truck leg live in `Schedule.jsx`; the
    unmatched offloads list in `Corridor.jsx`. Every screen takes `state`, one of its IM_OFFLOAD_STATES entry.

    A leg reads the same loaded, offloaded and difference figures on the contract as on the import schedule (AC 10).
    An offload for a truck on no leg is saved, never refused, and raises the one exception Offload with no loaded record,
    whoever reported it: the mill's own portal entry joins the same list with the Source Mill portal (AC 8). Nothing is
    edited: matching to a leg records the offload on that leg and keeps the unmatched one beside it, and closing needs a
    reason. Fictional sample data. */

export const IM_OFFLOAD_STATES = {
  SaleContract: ['Related', 'Details', 'Loading'],
  UnmatchedOffload: ['Open', 'Match to leg', 'Matching', 'Close', 'Closing', 'Matched', 'Closed', 'From the mill portal', 'History'],
};

/** Trading's navigation, as the trading workspace draws it, for the contract record page opened from a truck leg. */
export const IM_TRADING_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'trade', label: 'Trading', icon: 'arrow-left-right', sections: [{ value: 'trades', label: 'Trades' }, { value: 'contracts', label: 'Contracts' }] },
  { value: 'logistics', label: 'Logistics', icon: 'truck' },
  { value: 'counterparties', label: 'Counterparties', icon: 'building-2' },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
] }];
export const IM_TRADING_USER = { initials: 'JT', name: 'J. Tembo', meta: 'Trading' };

export function imOffloadFrame(screen, state) {
  if (screen === 'SaleContract') return { who: 'trading', module: 'trade', section: 'contracts', breadcrumb: ['Trading', 'Contracts', IM_SALE_MILL.contract] };
  return { who: 'ops', module: 'logistics', section: 'unmatched', breadcrumb: ['Logistics', 'Unmatched offloads', imUnmatchedFor(state).truck] };
}

/* ------------------------------------------------------------------ The sale contract's Import legs (AC 10) */

/** The Import legs card: each leg with its truck, Loaded, Offloaded and Difference in tonnes to three decimals, and its
    status as a load (UX-32). The figures are the import schedule's own (imDifference), never retyped. */
export function ImImportLegs({ legs, onOpen, limit }) {
  const rows = limit ? legs.slice(0, limit) : legs;
  return (
    <HmCard title="Import legs" count={legs.length} objects="import legs" link="View all" onLink={() => onOpen && onOpen('schedule')}>
      <HmTable rows={rows} columns={[
        { key: 'id', label: 'Leg', width: '96px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
        { key: 'truck', label: 'Truck', width: '100px' },
        { key: 'loaded', label: 'Loaded (t)', width: '104px', align: 'right' },
        { key: 'offloaded', label: 'Offloaded (t)', width: '116px', align: 'right' },
        { key: 'difference', label: 'Difference (t)', width: '120px', align: 'right', render: (r) => imDifference(r) },
        { key: 'status', label: 'Status', width: 'minmax(130px, 1fr)', render: (r) => { const s = imLegStatus(r); return <StatusMark kind={s.kind} label={s.word} size="body-4" />; } },
      ]} />
    </HmCard>
  );
}

/** Antelope Mills' sale contract SYN4811, its record page (UX-19) with the Related tab's cards: Import legs, then the
    open exceptions on those legs. Related cards appear only when their records exist. */
export function SaleContract({ state = 'Related', onOpen }) {
  const initial = state === 'Details' ? 'Details' : 'Related';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const m = IM_SALE_MILL;
  if (state === 'Loading') return <Sections><HmHead title={m.contract} /><Card padding={16} gap={8}><Skeleton width={120} height={14} /><Skeleton width={200} height={24} /><Skeleton height={40} /></Card><ImLoading /></Sections>;
  const delivered = imWhole(imSum(IM_SALE_LEGS.filter((l) => l.offloaded), 'offloaded'));
  const exceptions = IM_SALE_LEGS.filter((l) => l.offloaded).flatMap((l) => imLegExceptions(l).map((x) => ({ ...x, leg: l.id })));
  return (
    <Sections>
      <HmHead title={m.contract} />
      <RecordHighlights kind="Sale contract" title={m.contract} status={<StatusMark kind="clean" label="Active" size="body-3" />} tab={tab} onTab={setTab}
        fields={[
          { label: 'Counterparty', value: 'Antelope Mills', link: '#' },
          { label: 'Commodity', value: <CommodityMarker commodity="wheat">Wheat</CommodityMarker> },
          { label: 'Quantity', value: `${m.allocation} t` },
          { label: 'Delivered', value: `${delivered} t` },
          { label: 'Vessel', value: m.vessel },
          { label: 'Owner', value: 'J. Tembo' },
        ]} />
      {tab === 'Related' ? (
        <>
          <ImImportLegs legs={IM_SALE_LEGS} onOpen={onOpen} />
          {exceptions.length ? (
            <HmCard title="Exceptions" count={exceptions.length} objects="exceptions">
              <HmTable rows={exceptions} columns={[
                { key: 'id', label: 'Exception', width: '130px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
                { key: 'title', label: 'Title', width: 'minmax(200px, 1fr)', wrap: true },
                { key: 'leg', label: 'Record', width: '96px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.leg)}>{r.leg}</HmLink> },
                { key: 'owner', label: 'Owner', width: '110px' }, { key: 'age', label: 'Age', width: '72px' },
                { key: 'status', label: 'Status', width: '120px', render: (r) => <ExceptionStatus status={r.status} /> },
              ]} />
            </HmCard>
          ) : null}
        </>
      ) : tab === 'History' ? (
        <HmCard title="History" count={1} objects="changes">
          <HmTable rows={[{ id: 'h1', field: 'Status', user: 'J. Tembo', old: 'Draft', next: 'Active', date: '02 Oct 2026, 09:20' }]} columns={[
            { key: 'field', label: 'Field', width: '120px' }, { key: 'user', label: 'User', width: '110px' },
            { key: 'old', label: 'Old value', width: '110px' }, { key: 'next', label: 'New value', width: 'minmax(140px, 1fr)' },
            { key: 'date', label: 'Date (CAT)', width: '160px', tabular: true },
          ]} />
        </HmCard>
      ) : (
        <Card title="Contract information" padding={16}>
          <HmFacts fields={[['Contract', m.contract], ['Kind', 'Sale'], ['Buyer', 'Antelope Mills'], ['Commodity', 'Wheat'], ['Quantity', `${m.allocation} t`],
            ['Delivered', `${delivered} t`], ['Vessel', m.vessel], ['Corridor', m.corridor], ['Delivery point', IM_DELIVERY_POINTS.antelope]]} />
        </Card>
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ An unmatched offload's record page (AC 8) */

/** The offload each record state draws: ZZT 901, typed from Antelope Mills' call; From the mill portal draws BCX 3310,
    which the mill entered itself, in the same list and with the same exception. */
export function imUnmatchedFor(state) {
  return IM_UNMATCHED.find((u) => u.id === (state === 'From the mill portal' ? 'BCX 3310' : 'ZZT 901'));
}

/** The leg the mill meant: ZZT 910 on SYN4811, still on the road. Matching records the offload on it as a new entry. */
const IM_MATCH_LEG = () => IM_SALE_LEGS.find((l) => l.id === 'KAL-23');

/** Match to leg (UX-22, 480 px): the leg and a reason; the leg's difference against the loss allowance is shown as it
    would read, computed and never typed. */
export function ImMatchDialog({ offload, busy = false, sheet = false }) {
  const leg = IM_MATCH_LEG();
  const after = { ...leg, offloaded: offload.offloaded };
  const options = IM_SALE_LEGS.filter((l) => !l.offloaded).map((l) => `${l.id}, ${l.truck}`);
  return (
    <Dialog title={`Match to leg, ${offload.truck}`} width={480} sheet={sheet} onClose={busy ? undefined : () => {}}
      footer={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Match to leg</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SummaryList items={[{ label: 'Mill', value: offload.mill }, { label: 'Offloaded', value: `${offload.offloaded} t` }, { label: 'Source', value: offloadSource(offload.source) }]} />
        <Field label="Leg" required><Select options={options} defaultValue={options[0]} disabled={busy} /></Field>
        <Field label="Reason" required><Input multiline defaultValue="Truck registration misheard on the call: ZZT 910" disabled={busy} /></Field>
        <SummaryList items={[{ label: 'Loaded', value: `${leg.loaded} t` }, { label: 'Difference', value: imDifferenceWords(after), strong: true }, { label: 'Loss allowance', value: IM_LOSS_ALLOWANCE.words }]} />
        <ImOutcomeMark outcome={imOutcome(after)} />
      </div>
    </Dialog>
  );
}

const IM_UNMATCHED_HISTORY = {
  opened: { id: 'u1', field: 'Status', user: 'One Link', old: '', next: 'Open', date: '15 Oct 2026, 10:21', note: 'Offload with no loaded record' },
  matched: { id: 'u2', field: 'Matched to leg', user: 'M. Chanda', old: '', next: 'KAL-23', date: '15 Oct 2026, 12:05', note: 'Truck registration misheard on the call: ZZT 910' },
  closed: { id: 'u3', field: 'Status', user: 'M. Chanda', old: 'Open', next: 'Closed', date: '15 Oct 2026, 12:05', note: '' },
  closedReason: { id: 'u3', field: 'Status', user: 'M. Chanda', old: 'Open', next: 'Closed', date: '15 Oct 2026, 12:40', note: 'Reported twice: the same offload is on the mill offload sheet' },
};

export function UnmatchedOffload({ state = 'Open', onOpen }) {
  const narrow = !useMinWidth(768);
  const u = imUnmatchedFor(state);
  const initial = state === 'History' ? 'History' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const matched = state === 'Matched';
  const closed = matched || state === 'Closed';
  const status = closed ? 'closed' : u.status;
  const H = IM_UNMATCHED_HISTORY;
  const history = matched ? [H.closed, H.matched, H.opened] : state === 'Closed' ? [H.closedReason, H.opened] : [H.opened];
  const actions = closed ? null : <><Button variant="outline" size="small">Close</Button><Button size="small">Match to leg</Button></>;
  const exception = [{ id: u.exception, title: 'Offload with no loaded record', owner: 'Operations', age: u.age, status }];
  return (
    <Sections>
      <HmHead title={u.truck} />
      <RecordHighlights kind="Unmatched offload" title={u.truck} status={<ExceptionStatus status={status} size="body-3" />} tab={tab} onTab={setTab} tabs={['Details', 'History']} actions={actions}
        fields={[
          { label: 'Truck', value: u.truck },
          { label: 'Mill', value: u.mill, link: '#' },
          { label: 'Offloaded', value: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{`${u.offloaded} t`}<ProvenanceChip kind="declared-mill" /></span> },
          { label: 'Offloaded on', value: u.on },
          { label: 'Source', value: offloadSource(u.source) },
          { label: 'Reported by', value: u.by },
          ...(matched ? [{ label: 'Matched to leg', value: 'KAL-23', link: '#' }] : []),
        ]} />
      {tab === 'History' ? (
        <HmCard title="History" count={history.length} objects="changes">
          <HmTable rows={history} columns={[
            { key: 'field', label: 'Field', width: '130px' }, { key: 'user', label: 'User', width: '110px' },
            { key: 'old', label: 'Old value', width: '100px' }, { key: 'next', label: 'New value', width: '110px' },
            { key: 'date', label: 'Date (CAT)', width: '160px', tabular: true }, { key: 'note', label: 'Note', width: 'minmax(200px, 1fr)', wrap: true },
          ]} />
        </HmCard>
      ) : (
        <>
          <HmCard title="Exceptions" count={1} objects="exceptions">
            <HmTable rows={exception} columns={[
              { key: 'id', label: 'Exception', width: '130px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
              { key: 'title', label: 'Title', width: 'minmax(220px, 1fr)', wrap: true },
              { key: 'owner', label: 'Owner', width: '110px' }, { key: 'age', label: 'Age', width: '72px' },
              { key: 'status', label: 'Status', width: '130px', render: (r) => <ExceptionStatus status={r.status} /> },
            ]} />
          </HmCard>
          <Card title="Offload information" padding={16}>
            <HmFacts fields={[['Truck on the report', u.truck], ['Mill', u.mill], ['Delivery point', IM_DELIVERY_POINTS.antelope], ['Offloaded weight', `${u.offloaded} t`],
              ['Offload date', u.on], ['Source', offloadSource(u.source)], ['Mill delivery note', u.source === 'mill-portal' ? 'ANT-55139' : 'ANT-55187'], ['Mill document', ''],
              ['Reported by', u.by], ['Leg', matched ? <HmLink onOpen={() => onOpen && onOpen('KAL-23')}>KAL-23</HmLink> : '']]} />
          </Card>
          {state === 'Closed' ? (
            <Card title="Closing" padding={16}>
              <HmFacts fields={[['Closed by', 'M. Chanda'], ['Closed', '15 Oct 2026, 12:40'], ['Reason', H.closedReason.note]]} />
            </Card>
          ) : null}
        </>
      )}
      {state === 'Match to leg' || state === 'Matching' ? <ImMatchDialog offload={u} busy={state === 'Matching'} sheet={narrow} /> : null}
      <ReasonDialog open={state === 'Close' || state === 'Closing'} title={`Close ${u.truck}?`} label="Reason" minLength={10} confirmLabel="Close" busy={state === 'Closing'} sheet={narrow}
        defaultReason={state === 'Closing' ? H.closedReason.note : ''}>
        The offload and its exception stay on record with your reason.
      </ReasonDialog>
    </Sections>
  );
}
