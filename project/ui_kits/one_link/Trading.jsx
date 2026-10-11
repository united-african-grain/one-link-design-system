/** Trading's working screens (M5.DS.02, UAG-190; S47 JQ1 and JQ2, canvas S50 "One Link Jacques"): the cover board,
    which is the trader's Home, its Calculation details, the forward view and the priority list with the suppliers to
    call. Added beside the Coverage kit screen (`Coverage.jsx`), which stays (Henry, 30 Sep 2026: add, never delete).
    Every screen takes `state`, one of its COVER_STATES entry, for ?screen=&state=.

    The gap is sold minus firm secured, and nothing else (RL-EXP-NOT-FIRM, DP-COV-GAP): expected supply is drawn as a
    dashed overlay and never subtracted (DP-EXP-OVERLAY); uncommitted stock and stock in transit sit in their own Could
    cover column and never reduce the gap until they are committed (DP-COULD-COVER). Cover figures are derived on read
    and never typed (RL-COVER-DERIVED, RL-NO-REKEY-COV). A stale, failed or missing input is one condition banner naming
    it, and Last refreshed turns amber with the warning icon (UX-23, UX-24). Money appears only with the contract tier
    (UX-10): without it, the value at risk column is left out. Weighbridge weights carry three decimals and totals
    none, with the unit in the header (UX-12). Fictional sample data on the golden fixture names; the canvas's buyer is
    Riverbend Milling here. */

export const COVER_STATES = {
  CoverHome: ['Current', 'Stale data', 'Upload failed', 'Upload missing', 'Calculation details', 'Could cover', 'Loading'],
  ForwardView: ['Next 30 days', 'Next 90 days', 'Week opened', 'Loading', 'Error'],
  PriorityList: ['Short contracts', 'Suppliers to call', 'Acknowledging', 'Acknowledged', 'Without the contract tier', 'All covered'],
};

/** Trading's navigation (canvas S50 menu): Home is the cover board; the priority list and the forward view sit under
    Trading. Same shape as the Managing Director's menu, with no Finance. */
export const CV_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'trade', label: 'Trading', icon: 'arrow-left-right', sections: [{ value: 'priority', label: 'Priority list' }, { value: 'forward', label: 'Forward view' }] },
  { value: 'logistics', label: 'Logistics', icon: 'truck' },
  { value: 'inventory', label: 'Inventory', icon: 'warehouse' },
  { value: 'counterparties', label: 'Counterparties', icon: 'building-2' },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
  { value: 'assistant', label: 'Assistant', icon: 'message-square' },
] }];

/** Where a screen in this file sits: Trading's frame, the module and section it highlights, and the breadcrumb. Home
    has none (UX-05). */
export function coverFrame(screen) {
  if (screen === 'CoverHome') return { who: 'cover', module: 'home', breadcrumb: [] };
  if (screen === 'ForwardView') return { who: 'cover', module: 'trade', section: 'forward', breadcrumb: ['Trading', 'Forward view'] };
  return { who: 'cover', module: 'trade', section: 'priority', breadcrumb: ['Trading', 'Priority list'] };
}

/* ------------------------------------------------------------------ The S47 example data, on the golden fixture */

export const CV_AS_OF = '26 Sep 2026, 07:02 CAT';
export const CV_STALE_AS_OF = '23 Sep 2026, 08:10 CAT';

/** One row per open sales contract, largest Short first, with the bold Total. Short is Sold minus Firm secured; Expected
    and Could cover sit beside it and are never subtracted. */
export const CV_CONTRACTS = [
  { id: 'SYN4702', buyer: 'Riverbend Milling', sold: '5,000', firm: '4,200', expected: '0', could: '0', short: '800', window: '01 Sep to 30 Nov 2026', share: 0.84, dec: 0 },
  { id: 'SYN4845', buyer: 'Riverbend Milling', sold: '4,000', firm: '3,600', expected: '200', could: '0', short: '400', window: '20 Oct to 08 Nov 2026', share: 0.9, dec: 0.05 },
  { id: 'SYN4790', buyer: 'Riverbend Milling', sold: '1,200', firm: '1,200', expected: '0', could: '0', short: '0', window: '01 Oct to 22 Oct 2026', share: 1, dec: 0 },
  { id: 'total', total: true, buyer: '', sold: '10,200', firm: '9,000', expected: '200', could: '0', short: '1,200', window: '' },
];

/** The board by commodity: wheat, maize and soya on the figures Owen's Home reads (Short 1,200, Long 640, Flat). */
export const CV_COMMODITIES = [
  { id: 'wheat', commodity: 'Wheat', marker: 'wheat', sold: '10,200', firm: '9,000', expected: '200', could: '0', short: '1,200' },
  { id: 'maize', commodity: 'Maize', marker: 'maize', sold: '780', firm: '780', expected: '0', could: '640', short: '0' },
  { id: 'soya', commodity: 'Soya', marker: 'soya', sold: '1,000', firm: '1,000', expected: '0', could: '0', short: '0' },
];

/** What Calculation details lists for a contract's Short: Sold and Firm secured as rows, the gap as the bold total, then
    the basis, which names what was not counted (UX-18; Map D-55: a leg counts the greater of firm and delivered). */
export const CV_SHORT_PARTS = {
  SYN4702: { firm: [['SYN4702 leg A, Cameron Estates', '1,700 t'], ['SYN4702 leg B, Kapiri Farms', '1,800 t'], ['SYN4702 leg C, Lakeview Farms Ltd', '700 t']], expected: [] },
  SYN4845: { firm: [['SYN4845 leg A, Cameron Estates', '500 t'], ['SYN4845 leg B, Kapiri Farms', '300 t'], ['Stock committed on loading orders, Chisamba Shed', '2,800 t']], expected: [['Chisomo Agri, declared', '140 t'], ['Trade sheet estimate', '60 t']] },
  SYN4790: { firm: [['SYN4790 leg A, Lakeview Farms Ltd', '1,200 t']], expected: [] },
};

/** Calculation details for one contract's Short (UX-18). The gap is sold minus firm secured; expected and could cover
    are named in the basis as not counted, so they can never be read as part of it. */
export function cvShortCalc(row) {
  const parts = CV_SHORT_PARTS[row.id];
  const expected = parts.expected.length ? parts.expected.map(([label, value]) => ({ label: `Expected, not counted: ${label}`, value })) : [{ label: 'Expected, not counted', value: `${row.expected} t` }];
  return {
    name: `Short, ${row.id}`, value: `${row.short} t`,
    components: [{ label: 'Sold', value: `${row.sold} t` }, { label: 'Firm secured', value: `-${row.firm} t` }],
    total: { label: 'Short (t)', value: row.short },
    basis: [...parts.firm.map(([label, value]) => ({ label: `Firm secured: ${label}`, value })), ...expected,
      { label: 'Could cover, not counted', value: `${row.could} t` }, { label: 'As of', value: CV_AS_OF }],
  };
}

/** Could cover: UAG-owned stock not yet committed, and stock in transit, beside the gap and never in it. */
export const CV_COULD = {
  maize: [['Uncommitted stock, Chisamba Shed, stack M2', '640 t'], ['Stock in transit', '0 t']],
  wheat: [['Uncommitted stock', '0 t'], ['Stock in transit', '0 t']],
  soya: [['Uncommitted stock', '0 t'], ['Stock in transit', '0 t']],
};
export function cvCouldCalc(row) {
  return {
    name: `Could cover, ${row.commodity}`, value: `${row.could} t`,
    components: CV_COULD[row.id].map(([label, value]) => ({ label, value })),
    total: { label: 'Could cover (t)', value: row.could },
    basis: [{ label: 'Short, not reduced by it', value: `${row.short} t` }, { label: 'As of', value: CV_AS_OF }],
  };
}

/** Weighed loads on a contract's legs with no receipt finalised yet: labelled fields, loads and tonnage, never a note. */
export const CV_WEIGHED = [{ id: 'w1', contract: 'SYN4702', loads: '3', tonnage: '96', latest: '26 Sep 2026, 06:41' }];

/** Each input the board reads, with the condition banner it raises when it is past its threshold, failed or missing. */
export const CV_INPUT_BANNERS = {
  'Stale data': 'Supply forecast, wheat is 3 days old. Last imported 23 Sep 2026, 08:10 CAT.',
  'Upload failed': 'Trade sheet import failed at 07:30 CAT. Sold figures are as of 25 Sep 2026.',
  'Upload missing': 'Supply forecast, soya was not received by 08:00 CAT.',
};

/** Forward view: per ISO week, due to mills against firm intake, and expected intake apart (UAG-143). Undelivered
    tonnage is spread evenly across each window. */
export const CV_WEEKS = [
  { id: 'wk1', week: '28 Sep to 04 Oct 2026', start: '2026-09-28', due: '412', firm: '388', expected: '40', gap: 'Short 24' },
  { id: 'wk2', week: '05 Oct to 11 Oct 2026', start: '2026-10-05', due: '436', firm: '450', expected: '60', gap: 'Long 14' },
  { id: 'wk3', week: '12 Oct to 18 Oct 2026', start: '2026-10-12', due: '520', firm: '333', expected: '60', gap: 'Short 187' },
  { id: 'wk4', week: '19 Oct to 25 Oct 2026', start: '2026-10-19', due: '484', firm: '245', expected: '40', gap: 'Short 239' },
  { id: 'wk5', week: '26 Oct to 01 Nov 2026', start: '2026-10-26', due: '310', firm: '296', expected: '0', gap: 'Short 14' },
];
export const CV_WEEKS_90 = [...CV_WEEKS,
  { id: 'wk6', week: '02 Nov to 08 Nov 2026', start: '2026-11-02', due: '284', firm: '300', expected: '0', gap: 'Long 16' },
  { id: 'wk7', week: '09 Nov to 15 Nov 2026', start: '2026-11-09', due: '266', firm: '240', expected: '0', gap: 'Short 26' },
  { id: 'wk8', week: '16 Nov to 22 Nov 2026', start: '2026-11-16', due: '250', firm: '250', expected: '0', gap: 'Flat' },
];
/** The contracts and legs one week is made of (UAG-143 AC 8). */
export const CV_WEEK_PARTS = [
  { id: 'p1', ref: 'SYN4702', kind: 'Due to Riverbend Milling', window: '01 Sep to 30 Nov 2026', tonnes: '88' },
  { id: 'p2', ref: 'SYN4845', kind: 'Due to Riverbend Milling', window: '20 Oct to 08 Nov 2026', tonnes: '432' },
  { id: 'p3', ref: 'SYN4702 leg A', kind: 'Firm intake, Cameron Estates', window: '08 Oct to 22 Oct 2026', tonnes: '225' },
  { id: 'p4', ref: 'SYN4845 leg B', kind: 'Firm intake, Kapiri Farms', window: '12 Oct to 18 Oct 2026', tonnes: '108' },
  { id: 'p5', ref: 'Chisomo Agri', kind: 'Expected, declared', window: '15 Oct to 28 Oct 2026', tonnes: '60' },
];

/** The priority list (UAG-144, S47 JQ2): short contracts by severity, then by value at risk; each row opens the
    suppliers to call, each with a reason and a contact or "no contact on record". */
export const CV_PRIORITY = [
  { id: 'SYN4702', buyer: 'Riverbend Milling', commodity: 'Wheat', short: '800', ofSold: '16.0%', severity: 'High', reason: 'Delivery overdue on leg C', value: '217,600', age: '10 days',
    suppliers: [
      { id: 's1', name: 'Lakeview Farms Ltd', reason: 'No deliveries for 10 days: 300 t undelivered on SYN4702 leg C', contact: '+260 97 555 0142', alert: 'open' },
      { id: 's2', name: 'Cameron Estates', reason: '120 t undelivered on SYN4702 leg A, window ends 30 Nov 2026', contact: '+260 96 555 0177' },
      { id: 's3', name: 'Chongwe Growers Ltd', reason: 'Declared 80 t expected, not yet firm', contact: null },
    ] },
  { id: 'SYN4845', buyer: 'Riverbend Milling', commodity: 'Wheat', short: '400', ofSold: '10.0%', severity: 'Medium', reason: 'Window starts 20 Oct 2026', value: '108,800', age: '4 days',
    suppliers: [
      { id: 's4', name: 'Kapiri Farms', reason: '100 t undelivered on SYN4845 leg B, window ends 08 Nov 2026', contact: '+260 96 555 0187' },
      { id: 's5', name: 'Chisomo Agri', reason: 'Declared 140 t expected, not yet firm', contact: null },
    ] },
];

/* ------------------------------------------------------------------ Parts these screens share */

/** A Short figure: a link to its Calculation details while there is a gap; a true zero is 0. */
function CvShort({ row, onOpen }) {
  if (row.total) return <Text variant="body-3" strong tabular>{row.short}</Text>;
  return row.short === '0' ? '0' : <HmLink onOpen={onOpen}>{row.short}</HmLink>;
}
const cvBold = (r, v) => (r.total ? <Text variant="body-3" strong tabular>{v}</Text> : v);

/** The cover board's table (S50 screen 1): Sold, Firm secured with the cover bar (expected drawn dashed beyond it),
    Expected, Could cover, Short, Delivery window. */
export function CvBoard({ onShort, onOpen }) {
  return (
    <HmTable rows={CV_CONTRACTS} columns={[
      { key: 'id', label: 'Contract', width: '100px', render: (r) => (r.total ? <Text variant="body-3" strong>Total</Text> : <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink>) },
      { key: 'buyer', label: 'Buyer', width: 'minmax(150px, 1fr)', wrap: true },
      { key: 'sold', label: 'Sold (t)', width: '84px', align: 'right', render: (r) => cvBold(r, r.sold) },
      { key: 'firm', label: 'Firm secured (t)', width: '128px', align: 'right', render: (r) => cvBold(r, r.firm) },
      { key: 'cover', label: 'Cover', width: '96px', render: (r) => (r.total ? '' : <ShareBar share={r.share} declared={r.dec} color="var(--commodity-wheat)" maxWidth={80} />) },
      { key: 'expected', label: 'Expected (t)', width: '104px', align: 'right', render: (r) => cvBold(r, r.expected) },
      { key: 'could', label: 'Could cover (t)', width: '120px', align: 'right', render: (r) => cvBold(r, r.could) },
      { key: 'short', label: 'Short (t)', width: '84px', align: 'right', render: (r) => <CvShort row={r} onOpen={() => onShort(r)} /> },
      { key: 'window', label: 'Delivery window', width: '180px', tabular: true },
    ]} />
  );
}

/* ------------------------------------------------------------------ Home, the cover board */

export function CoverHome({ state = 'Current', onOpen }) {
  const compact = useCompact(false);
  const stale = state === 'Stale data' || state === 'Upload failed' || state === 'Upload missing';
  const initial = state === 'Calculation details' ? { kind: 'short', row: CV_CONTRACTS[1] } : state === 'Could cover' ? { kind: 'could', row: CV_COMMODITIES[1] } : null;
  const [calc, setCalc] = useState(initial);
  useEffect(() => setCalc(initial), [state]);
  const head = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Text as="h1" variant="heading-2" strong style={{ margin: 0 }}>Home</Text>
      <HmRefreshed stale={stale} time={stale ? CV_STALE_AS_OF : CV_AS_OF} />
    </div>
  );
  if (state === 'Loading') {
    return (
      <Sections>
        {head}
        <div aria-busy="true" style={{ display: 'contents' }}>
          <WithRail rail={<><CardSkeleton /><CardSkeleton /></>}><CardSkeleton /><CardSkeleton /><CardSkeleton /></WithRail>
        </div>
      </Sections>
    );
  }
  const rail = <>
    <HmCard title="Priority list" count={CV_PRIORITY.length} objects="short contracts" link="View all" onLink={() => onOpen && onOpen('priority')}>
      {CV_PRIORITY.map((r, i) => (
        <RailRow key={r.id} subject={<HmLink onOpen={() => onOpen && onOpen('priority')}>{r.id}</HmLink>} context={`${r.buyer}, short ${r.short} t`}
          right={<Text variant="body-4" tone="secondary">{r.severity}</Text>} style={{ padding: '10px 16px', boxShadow: i ? 'inset 0 1px 0 var(--border-light)' : 'none' }} />
      ))}
    </HmCard>
    <HmApprovalsCard rows={HM_APPROVALS.filter((a) => a.type === 'Gate price')} onOpen={onOpen} />
    <HmExceptionsCard rows={HM_EXCEPTIONS.filter((e) => e.owner === 'J. Tembo')} onOpen={onOpen} />
  </>;
  // The board runs the full width of the page, as the canvas draws it; the cards below share the row with the rail.
  const board = (
    <Card gap={8} title="Coverage, wheat" headerRight={<Capsule chevron selected>Commodity: Wheat</Capsule>}>
      <div style={{ margin: '0 -16px -16px' }}><CvBoard onShort={(row) => setCalc({ kind: 'short', row })} onOpen={onOpen} /></div>
    </Card>
  );
  const main = <>
    <HmCard title="By commodity">
      <HmTable rows={CV_COMMODITIES} columns={[
        { key: 'commodity', label: 'Commodity', width: 'minmax(110px, 1fr)', render: (r) => <CommodityMarker commodity={r.marker}>{r.commodity}</CommodityMarker> },
        { key: 'sold', label: 'Sold (t)', width: '84px', align: 'right' },
        { key: 'firm', label: 'Firm secured (t)', width: '128px', align: 'right' },
        { key: 'expected', label: 'Expected (t)', width: '104px', align: 'right' },
        { key: 'could', label: 'Could cover (t)', width: '120px', align: 'right', render: (r) => (r.could === '0' ? '0' : <HmLink onOpen={() => setCalc({ kind: 'could', row: r })}>{r.could}</HmLink>) },
        { key: 'short', label: 'Short (t)', width: '84px', align: 'right' },
      ]} />
    </HmCard>
    <HmCard title="Weighed, not yet received" count={CV_WEIGHED.length} objects="weighed loads">
      <HmTable rows={CV_WEIGHED} columns={[
        { key: 'contract', label: 'Contract', width: 'minmax(110px, 1fr)', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.contract)}>{r.contract}</HmLink> },
        { key: 'loads', label: 'Weighed loads not yet received', width: '220px', align: 'right' },
        { key: 'tonnage', label: 'Tonnage (t)', width: '110px', align: 'right' },
        { key: 'latest', label: 'Latest weighed (CAT)', width: '170px', tabular: true },
      ]} />
    </HmCard>
    <HmCard title="Forward view, wheat" link="View forward view" onLink={() => onOpen && onOpen('forward')}>
      <div style={{ padding: '0 16px 16px' }}><CvForwardChart weeks={CV_WEEKS} height={200} /></div>
    </HmCard>
  </>;
  const panel = calc ? (calc.kind === 'short' ? cvShortCalc(calc.row) : cvCouldCalc(calc.row)) : null;
  return (
    <Sections>
      {head}
      {stale ? <ConditionBanner>{CV_INPUT_BANNERS[state]}</ConditionBanner> : null}
      {board}
      {compact ? <>{rail}{main}</> : <WithRail rail={rail}>{main}</WithRail>}
      {panel ? <CalculationDetails open onClose={() => setCalc(null)} name={panel.name} value={panel.value} components={panel.components} total={panel.total} basis={panel.basis} /> : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Forward view */

/** The forward chart's key: each line as the chart draws it (a ShareBar swatch, dashed for expected), then its name. */
export const CV_FORWARD_KEY = [
  { name: 'Due to mills', color: 'var(--commodity-wheat)' },
  { name: 'Firm intake', color: 'var(--content-accent-brand)' },
  { name: 'Expected intake', color: 'var(--content-tertiary-solid)', dashed: true },
];
function CvForwardKey() {
  return (
    <div data-chart-key style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
      {CV_FORWARD_KEY.map((k) => (
        <span key={k.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ShareBar share={k.dashed ? 0 : 1} declared={k.dashed ? 1 : 0} color={k.color} maxWidth={16} height={2} style={{ width: 16 }} />
          <Text variant="body-4" tone="secondary">{k.name}</Text>
        </span>
      ))}
    </div>
  );
}

/** Expected intake against the delivery windows, through ChartCard only: due to mills and firm intake as lines, expected
    intake dashed and apart. Colours are tokens. */
export function CvForwardChart({ weeks, height = 280, state = 'ready', onRetry }) {
  const series = useMemo(() => {
    const n = (v) => Number(String(v).replace(/,/g, ''));
    return [
      { type: 'line', color: CV_FORWARD_KEY[0].color, name: 'Due to mills', format: (v) => `${Math.round(v)} t`, data: weeks.map((w) => ({ time: w.start, value: n(w.due) })) },
      { type: 'line', color: CV_FORWARD_KEY[1].color, name: 'Firm intake', data: weeks.map((w) => ({ time: w.start, value: n(w.firm) })) },
      { type: 'line', color: CV_FORWARD_KEY[2].color, name: 'Expected intake', options: { lineStyle: 2 }, data: weeks.map((w) => ({ time: w.start, value: n(w.expected) })) },
    ];
  }, [weeks]);
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}><CvForwardKey /><ChartCard height={height} state={state} onRetry={onRetry} series={series} footerNote="Spread evenly across each window" style={{ boxShadow: 'none', padding: 0 }} /></div>;
}

export function ForwardView({ state = 'Next 30 days', onOpen }) {
  const ninety = state === 'Next 90 days';
  const weeks = ninety ? CV_WEEKS_90 : CV_WEEKS;
  const chartState = state === 'Loading' ? 'loading' : state === 'Error' ? 'error' : 'ready';
  return (
    <Sections>
      <HmHead title="Forward view" meta={<HmRefreshed time={CV_AS_OF} />} />
      <ScrollRow><Capsule chevron selected>Commodity: Wheat</Capsule><Capsule selected={!ninety}>Next 30 days</Capsule><Capsule selected={ninety}>Next 90 days</Capsule></ScrollRow>
      <Card title="Expected intake against delivery windows" padding={16}>
        <CvForwardChart weeks={weeks} state={chartState} onRetry={() => {}} />
      </Card>
      {state === 'Loading' ? <CardSkeleton /> : state === 'Error' ? null : (
        <HmCard title="By week" count={weeks.length} objects="weeks">
          <HmTable rows={weeks} expanded={state === 'Week opened' ? ['wk3'] : undefined} expandLabel={(r) => `Show contracts and legs, ${r.week}`}
            expand={(r) => (r.id === 'wk3' ? (
              <HmTable rows={CV_WEEK_PARTS} columns={[
                { key: 'ref', label: 'Contract or leg', width: '150px', render: (p) => (/^SYN/.test(p.ref) ? <HmLink onOpen={() => onOpen && onOpen(p.ref)}>{p.ref}</HmLink> : p.ref) },
                { key: 'kind', label: 'What it is', width: 'minmax(180px, 1fr)', wrap: true },
                { key: 'window', label: 'Window', width: '190px', tabular: true },
                { key: 'tonnes', label: 'This week (t)', width: '110px', align: 'right' },
              ]} />
            ) : null)}
            columns={[
              { key: 'week', label: 'Week (CAT)', width: 'minmax(190px, 1fr)', tabular: true },
              { key: 'due', label: 'Due to mills (t)', width: '130px', align: 'right' },
              { key: 'firm', label: 'Firm intake (t)', width: '124px', align: 'right' },
              { key: 'expected', label: 'Expected (t)', width: '110px', align: 'right' },
              { key: 'gap', label: 'Long or short (t)', width: '140px', align: 'right' },
            ]} />
        </HmCard>
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Priority list */

/** A supplier to call: the reason, then the contact or "no contact on record", and the quiet-supplier alert with
    Acknowledge, which never resolves it (C8-9). */
export function CvSupplierRow({ supplier, ack, onOpen, first }) {
  const contact = supplier.contact ? <Text variant="body-3" tabular>{supplier.contact}</Text> : <Text variant="body-3" tone="secondary">no contact on record</Text>;
  const alert = supplier.alert ? (ack === 'done'
    ? <ExceptionStatus status="acknowledged" />
    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><ExceptionStatus status="open" /><Button variant="outline" size="xsmall" loading={ack === 'busy'}>Acknowledge</Button></span>) : null;
  return (
    <RailRow subject={<HmLink onOpen={() => onOpen && onOpen(supplier.name)}>{supplier.name}</HmLink>} context={supplier.reason}
      right={<span data-supplier-contact style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>{contact}{alert}</span>}
      style={{ padding: '10px 16px', boxShadow: first ? 'none' : 'inset 0 1px 0 var(--border-light)' }} />
  );
}

export function PriorityList({ state = 'Short contracts', onOpen }) {
  const tier = state !== 'Without the contract tier';
  const rows = state === 'All covered' ? [] : CV_PRIORITY;
  const open = state === 'Suppliers to call' || state === 'Acknowledging' || state === 'Acknowledged' ? ['SYN4702'] : undefined;
  const ack = state === 'Acknowledging' ? 'busy' : state === 'Acknowledged' ? 'done' : null;
  const columns = [
    { key: 'id', label: 'Contract', width: '100px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
    { key: 'buyer', label: 'Buyer', width: 'minmax(150px, 1fr)', wrap: true },
    { key: 'short', label: 'Short (t)', width: '84px', align: 'right' },
    { key: 'ofSold', label: 'Of sold', width: '80px', align: 'right' },
    { key: 'severity', label: 'Severity', width: '90px' },
    { key: 'reason', label: 'Reason', width: 'minmax(180px, 1.2fr)', wrap: true },
    // The contract tier carries the money (UX-10): without it the column is left out and the list ranks by severity, then age.
    ...(tier ? [{ key: 'value', label: 'Value at risk (USD)', width: '150px', align: 'right' }] : []),
    { key: 'age', label: 'Age', width: '84px', tabular: true },
  ];
  return (
    <Sections>
      <HmHead title="Priority list" count={rows.length} meta={<HmRefreshed time={CV_AS_OF} />} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <ScrollRow><Capsule chevron selected>Short contracts</Capsule><Capsule chevron>Commodity</Capsule></ScrollRow>
        <SearchField placeholder="Search this list" hint={null} maxWidth={320} />
      </div>
      {rows.length ? (
        <Card padding={4}>
          <HmTable rows={rows} columns={columns} expanded={open} expandLabel={(r) => `Show suppliers to call, ${r.id}`}
            expand={(r) => (
              <div data-suppliers={r.id}>{r.suppliers.map((s, i) => <CvSupplierRow key={s.id} supplier={s} first={i === 0} ack={ack} onOpen={onOpen} />)}</div>
            )} />
        </Card>
      ) : <Card><EmptyState title="Every open contract is covered." meta={`Checked ${CV_AS_OF}`} /></Card>}
    </Sections>
  );
}
