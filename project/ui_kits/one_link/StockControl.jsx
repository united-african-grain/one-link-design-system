/** Stock control (M4.DS.01, UAG-53; S14 R2, R3, R8, canvas S15): Ryan's Home with the stock position by product and
    pack size, every figure opening Calculation details; the On the road list with its clearing window; a transfer
    order between sites, cleared on its goods received note, with a transit difference and its write-off Pending
    approval; and the month-end stock take with its tolerance, its exceptions, a third-party count and the held and
    loaded adjustments to book. Every screen takes `state`, one of its STOCK_CONTROL_STATES entry, for ?screen=&state=.

    Stock control sees stock in tonnes with bags or containers beside them, and today's gate price in ZMW per t as the
    only price (UX-10): no buy price, value or margin column exists on these layouts. Stock held for another owner is
    shown apart and never added into ours. No shortfall is drawn, because demand is not recorded (S14). Route type is
    plain text (UX-26). Stock take percentages show two decimals, because the tolerance is below 1% (UX-13). Counts
    name the Stock control role, not people (U-27). Fictional sample data only: Chisamba Shed, Mpongwe Depot, Lakeview
    Farms Ltd, Cameron Estates, Riverbend Milling. */

export const STOCK_CONTROL_STATES = {
  StockPosition: ['Position', 'Calculation details', 'No gate price in force'],
  OnTheRoad: ['All', 'Past window', 'Empty'],
  TransferOrder: ['In transit', 'Past clearing window', 'Cleared', 'Within allowance', 'Transit difference', 'Requesting write-off', 'Write-off pending approval'],
  StockTake: ['Counted', 'Request write-off', 'Requesting write-off', 'Write-off pending approval', 'Third-party count', 'Adjustments to book'],
};

/** Ryan's navigation (canvas S15): Home, Logistics, Inventory, Reports. */
export const STOCK_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'logistics', label: 'Logistics', icon: 'truck', sections: [{ value: 'road', label: 'On the road' }, { value: 'transfers', label: 'Transfer orders' }] },
  { value: 'inventory', label: 'Inventory', icon: 'warehouse', sections: [{ value: 'stocktake', label: 'Stock take' }] },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
] }];
export const STOCK_USER = { initials: 'RD', name: 'R. Daka', meta: 'Stock control' };

export function stockControlFrame(screen, state) {
  if (screen === 'StockPosition') return { who: 'stock', module: 'home', breadcrumb: ['Home'] };
  if (screen === 'OnTheRoad') return { who: 'stock', module: 'logistics', section: 'road', breadcrumb: ['Logistics', 'On the road'] };
  if (screen === 'TransferOrder') return { who: 'stock', module: 'logistics', section: 'transfers', breadcrumb: ['Logistics', 'Transfer orders', skTransferFor(state).ref] };
  return { who: 'stock', module: 'inventory', section: 'stocktake', breadcrumb: ['Inventory', 'Stock take', '30 Sep 2026'] };
}

/** A drillable figure in a table: link blue, opening Calculation details (UX-08, UX-18). */
function SkFigure({ children, onOpen }) {
  if (children === '' || children == null) return '';
  return <span data-figure-link=""><RefCell onOpen={onOpen}>{children}</RefCell></span>;
}

/** A KPI tile: label, the figure in black, a line under it, and the whole tile opens Calculation details (UX-08). */
function SkTile({ label, value, note, onOpen }) {
  return (
    <Card interactive onClick={onOpen} padding={16}>
      <span data-figure-link="" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Figure label={label} value={value} unit="t" size="heading-1-condensed" derivation={note} />
      </span>
    </Card>
  );
}

/** "No price in force" as a state with the commercial owner who sets the price (M4.PRC.01, BR-36): never a zero, a
    blank or a stale price. */
export function NoPriceInForce({ owner = 'Trading', size = 'body-4' }) {
  return (
    <span data-no-price="" style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '2px 6px' }}>
      <StatusMark kind="notSet" label="No price in force" size={size} />
      <span style={textStyle('body-4', { tone: 'secondary' })}>Set by {owner}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ Stock position, Ryan's Home (AB-RYAN-STOCK, S14 R2) */

const SK_POSITION = [
  { id: 'p1', product: 'Urea', pack: '50 kg bag', bay: 'B1', owner: 'Own', physical: '820', bags: '16,400', virtual: '0', road: '200', committed: '300', hold: '0', free: '520' },
  { id: 'p2', product: 'Urea', pack: '20 kg bag', bay: 'B1', owner: 'Own', physical: '40', bags: '2,000', virtual: '0', road: '10', committed: '10', hold: '0', free: '30' },
  { id: 'p3', product: 'Urea', pack: '10 kg bag', bay: 'B3', owner: 'Own', physical: '12', bags: '1,200', virtual: '0', road: '0', committed: '0', hold: '0', free: '12' },
  { id: 'p4', product: 'Foliar Feed', pack: '10 L container', bay: 'B2', owner: 'Own', physical: '46', bags: '3,833 containers', virtual: '0', road: '0', committed: '0', hold: '7', free: '39' },
  { id: 'p5', product: 'Foliar Feed', pack: '5 L container', bay: 'B2', owner: 'Own', physical: '6', bags: '1,000 containers', virtual: '0', road: '0', committed: '0', hold: '0', free: '6' },
  { id: 'total', total: true, product: 'Total', physical: '924', virtual: '0', road: '210', committed: '310', hold: '7', free: '607' },
];
const SK_OTHER_OWNERS = [
  { id: 'o1', product: 'Urea', pack: '50 kg bag', bay: 'B3', owner: 'Riverbend Milling', physical: '120', bags: '2,400' },
];

export function StockPosition({ state = 'Position' }) {
  const [calc, setCalc] = useState(state === 'Calculation details');
  useEffect(() => setCalc(state === 'Calculation details'), [state]);
  const open = () => setCalc(true);
  const noPrice = state === 'No gate price in force';
  const meta = <>
    <span>Chisamba Shed</span><Dot style={{ margin: 0 }} /><span>Last refreshed 26 Sep 2026, 07:48 CAT</span><Dot style={{ margin: 0 }} />
    <span data-gate-price="" style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>Gate price today, maize: {noPrice ? <NoPriceInForce /> : <Text variant="body-3" strong tabular>ZMW 6,800.00 per t</Text>}</span>
  </>;
  const fig = (key) => (r) => (r.total ? wbStrong(r, r[key]) : <SkFigure onOpen={open}>{r[key]}</SkFigure>);
  const position = (
    <WbTable title="Position by product" action={<Button variant="ghost" size="xsmall">Export</Button>} columns={[
      { key: 'product', label: 'Product', width: '120px', render: (r) => (r.total ? wbStrong(r, 'Total') : <CommodityMarker commodity="fertilizer">{r.product}</CommodityMarker>) },
      { key: 'pack', label: 'Pack', width: '120px' }, { key: 'bay', label: 'Bay', width: '56px' }, { key: 'owner', label: 'Owner', width: '70px' },
      { key: 'physical', label: 'Physical (t)', width: '104px', align: 'right', render: fig('physical') },
      { key: 'bags', label: 'Bags or containers', width: '146px', align: 'right' },
      { key: 'virtual', label: 'Virtual (t)', width: '96px', align: 'right', render: fig('virtual') },
      { key: 'road', label: 'On the road (t)', width: '120px', align: 'right', render: fig('road') },
      { key: 'committed', label: 'Committed (t)', width: '116px', align: 'right', render: fig('committed') },
      { key: 'hold', label: 'On hold (t)', width: '100px', align: 'right', render: fig('hold') },
      { key: 'free', label: 'Free (t)', width: 'minmax(80px, 1fr)', align: 'right', render: fig('free') },
    ]} rows={SK_POSITION} objects="products" />
  );
  const others = (
    <WbTable title="Held for other owners" count={SK_OTHER_OWNERS.length} objects="stock for other owners" columns={[
      { key: 'product', label: 'Product', width: '140px', render: (r) => <CommodityMarker commodity="fertilizer">{r.product}</CommodityMarker> },
      { key: 'pack', label: 'Pack', width: '130px' }, { key: 'bay', label: 'Bay', width: '60px' }, { key: 'owner', label: 'Owner' },
      { key: 'physical', label: 'Physical (t)', width: '104px', align: 'right', render: fig('physical') },
      { key: 'bags', label: 'Bags or containers', width: '146px', align: 'right' },
    ]} rows={SK_OTHER_OWNERS} />
  );
  const rail = <>
    <Card gap={8} title={<>Exceptions <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 8 }}><Count>2</Count></span></>} headerRight={<Button variant="ghost" size="xsmall">View all</Button>}>
      <div style={{ margin: '0 -16px -16px' }}>
        <RailRow subject={<RefCell>Leg past clearing window</RefCell>} context="LEG-5088, Urea 20 kg, 10.000 t, 9 days on the road" status={<ExceptionStatus status="open" />} style={{ padding: '10px 16px' }} />
        <RailRow subject={<RefCell>Stock count variance</RefCell>} context="B2, Foliar Feed 10 L, 0.65% against 0.20%" status={<ExceptionStatus status="open" />} style={{ padding: '10px 16px' }} />
      </div>
    </Card>
    <WbTable title="Today" columns={[{ key: 'record', label: 'Record', render: (r) => <RefCell>{r.record}</RefCell> }, { key: 'count', label: 'Count', width: '70px', align: 'right' }]}
      rows={[{ id: 't1', record: 'Goods received notes', count: '3' }, { id: 't2', record: 'Delivery notes', count: '4' }, { id: 't3', record: 'Loading orders committed', count: '2' }]} objects="records" />
  </>;
  return (
    <Sections>
      <WbHead title="Home" meta={meta} right={<Button variant="outline" size="small" icon="plus">New loading order</Button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--card-gap)' }}>
        <SkTile label="Physical warehouse" value="924" note="In the shed" onOpen={open} />
        <SkTile label="On the road" value="210" note="7 legs" onOpen={open} />
        <SkTile label="Committed" value="310" note="On loading orders" onOpen={open} />
        <SkTile label="Free" value="607" note="Available for loading orders" onOpen={open} />
      </div>
      {position}
      {others}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>{rail}</div>
      <CalculationDetails open={calc} onClose={() => setCalc(false)} name="Physical warehouse, Urea 50 kg bag" value="820.000 t"
        components={[{ label: 'Opening stock, 01 Sep 2026', value: '700.000 t' }, { label: 'Goods received notes (14)', value: '+420.000 t' }, { label: 'Delivery notes (10)', value: '-300.000 t' }]}
        total={{ value: '820.000 t' }}
        basis={[{ label: 'Bags', value: '16,400' }, { label: 'Pack net weight', value: '50.00 kg' }, { label: 'Bay', value: 'B1' }, { label: 'Owner', value: 'Own' }]}
        action={{ label: 'View goods received notes' }} />
    </Sections>
  );
}

/* ------------------------------------------------------------------ On the road (ryan 06, S14 R3) */

const SK_ROAD = [
  { id: 'r1', leg: 'LEG-5088', truck: 'BCA 2102', route: 'Physical', product: 'Urea', pack: '20 kg bag', tonnes: '10.000', farmer: '', dispatched: '17 Sep 2026', age: '9 days', past: true },
  { id: 'r2', leg: 'LEG-5101', truck: 'BCA 2210', route: 'Physical', product: 'Urea', pack: '50 kg bag', tonnes: '30.000', farmer: '', dispatched: '22 Sep 2026', age: '4 days' },
  { id: 'r3', leg: 'LEG-5102', truck: 'BCA 2211', route: 'Physical', product: 'Urea', pack: '50 kg bag', tonnes: '30.000', farmer: '', dispatched: '22 Sep 2026', age: '4 days' },
  { id: 'r4', leg: 'LEG-5103', truck: 'BCA 2214', route: 'Transfer', product: 'Urea', pack: '50 kg bag', tonnes: '30.000', farmer: '', dispatched: '22 Sep 2026', age: '4 days' },
  { id: 'r5', leg: 'LEG-5104', truck: 'BCA 2218', route: 'Physical', product: 'Urea', pack: '50 kg bag', tonnes: '30.000', farmer: '', dispatched: '22 Sep 2026', age: '4 days' },
  { id: 'r6', leg: 'LEG-5105', truck: 'BCA 2220', route: 'Virtual', product: 'Urea', pack: '50 kg bag', tonnes: '40.000', farmer: 'Lakeview Farms Ltd', dispatched: '22 Sep 2026', age: '4 days' },
  { id: 'r7', leg: 'LEG-5106', truck: 'BCA 2231', route: 'Direct', product: 'Urea', pack: '50 kg bag', tonnes: '40.000', farmer: 'Cameron Estates', dispatched: '22 Sep 2026', age: '4 days' },
];

export function OnTheRoad({ state = 'All', onOpen }) {
  const past = state === 'Past window';
  const legs = state === 'Empty' ? [] : past ? SK_ROAD.filter((r) => r.past) : SK_ROAD;
  const sum = legs.reduce((n, r) => n + thousandths(r.tonnes), 0);
  const rows = legs.length ? [...legs, { id: 'total', total: true, leg: 'Total', tonnes: tonnes(sum) }] : [];
  return (
    <Sections>
      <WbHead title="On the road" count={legs.length} meta={<span>Clearing window 7 days</span>} />
      <ScrollRow>
        {['All', 'Physical', 'Virtual', 'Direct', 'Transfer', 'Past window'].map((f) => <Capsule key={f} selected={f === 'Past window' ? past : f === 'All' && !past}>{f}</Capsule>)}
      </ScrollRow>
      <WbTable columns={[
        { key: 'leg', label: 'Leg', width: '110px', render: (r) => (r.total ? wbStrong(r, 'Total') : <span onClick={() => onOpen && onOpen(r.leg)}><RefCell>{r.leg}</RefCell></span>) },
        { key: 'truck', label: 'Truck', width: '100px' },
        // Route type is plain text, never a coloured tag (UX-26).
        { key: 'route', label: 'Route type', width: '110px' },
        { key: 'product', label: 'Product', width: '100px', render: (r) => (r.total ? '' : <CommodityMarker commodity="fertilizer">{r.product}</CommodityMarker>) },
        { key: 'pack', label: 'Pack', width: '110px' },
        { key: 'tonnes', label: 'Quantity (t)', width: '110px', align: 'right', render: (r) => wbStrong(r, r.tonnes) },
        { key: 'farmer', label: 'Farmer', width: 'minmax(150px, 1fr)' },
        { key: 'dispatched', label: 'Dispatched', width: '120px', tabular: true },
        { key: 'age', label: 'Age', width: '170px', render: (r) => (r.past ? <StatusMark kind="attention" label={`${r.age}, past window`} size="body-4" /> : r.age) },
      ]} rows={rows} objects="legs" />
    </Sections>
  );
}

/* ------------------------------------------------------------------ Transfer order and its leg (S14 R3, M4.VIR.01 to 03) */

/** The transfer each state draws: bagged urea from Mpongwe Depot (zero allowance), or bulk maize (1.0% allowance). */
function skTransferFor(state) {
  const bulk = state === 'Within allowance';
  return bulk
    ? { ref: 'TRF-0032', product: 'Maize', commodity: 'maize', pack: 'Bulk', leg: 'LEG-5110', truck: 'ABZ 4412', sent: '30.000', sentBags: '', allowance: '0.300', allowanceWords: '1.0% bulk' }
    : { ref: 'TRF-0031', product: 'Urea', commodity: 'fertilizer', pack: '50 kg bag', leg: state === 'Past clearing window' ? 'LEG-5088' : 'LEG-5103', truck: state === 'Past clearing window' ? 'BCA 2102' : 'BCA 2214', sent: '30.000', sentBags: '600', allowance: '0.000', allowanceWords: 'Bagged, none' };
}

export function TransferOrder({ state = 'In transit' }) {
  const t = skTransferFor(state);
  const onRoad = state === 'In transit' || state === 'Past clearing window';
  const past = state === 'Past clearing window';
  const cleared = state === 'Cleared' || state === 'Within allowance';
  const difference = !onRoad && !cleared;
  const received = state === 'Within allowance' ? '29.950' : difference ? '29.700' : '30.000';
  const receivedBags = difference ? '594' : t.sentBags;
  const diff = tonnes(thousandths(t.sent) - thousandths(received));
  const writeOff = state === 'Write-off pending approval' ? 'pending' : 'none';
  // A leg is a load (UX-32): In transit until offloaded, Delivered by the offload, Reconciled when the difference is
  // within its allowance or its write-off is decided. A residue Pending approval keeps the leg Delivered.
  const legStatus = onRoad ? <StatusMark kind="pending" label="In transit" size="body-4" /> : cleared ? <StatusMark kind="clean" label="Reconciled" size="body-4" /> : <StatusMark kind="clean" label="Delivered" size="body-4" />;
  const leg = {
    id: 'l1', leg: t.leg, truck: t.truck, sent: t.sent, bags: t.sentBags, dispatched: past ? '17 Sep 2026' : '22 Sep 2026',
    received: onRoad ? '' : received, grn: onRoad ? '' : t.ref === 'TRF-0032' ? 'GRN10000390' : 'GRN10000388', difference: onRoad ? '' : diff,
  };
  return (
    <Sections>
      <WbHead title={t.ref} />
      {past ? <ConditionBanner>{t.leg} is past its clearing window of 7 days.</ConditionBanner> : null}
      <RecordHighlights kind="Transfer order" title={t.ref} status={legStatus} tabs={[]}
        fields={[{ label: 'From', value: 'Mpongwe Depot' }, { label: 'To', value: 'Chisamba Shed' },
          { label: 'Product', value: <CommodityMarker commodity={t.commodity}>{`${t.product}, ${t.pack}`}</CommodityMarker> },
          { label: 'Quantity', value: `${t.sent} t` }, { label: 'Dispatched', value: leg.dispatched }, { label: 'Age', value: past ? <StatusMark kind="attention" label="9 days, past window" size="body-4" /> : onRoad ? '4 days' : '' }]} />
      <WbTable title="Legs" count={1} objects="legs" columns={[
        { key: 'leg', label: 'Leg', width: '110px', render: (r) => <RefCell>{r.leg}</RefCell> },
        { key: 'truck', label: 'Truck', width: '100px' },
        { key: 'sent', label: 'Dispatched (t)', width: '130px', align: 'right' },
        ...(t.sentBags ? [{ key: 'bags', label: 'Bags', width: '80px', align: 'right' }] : []),
        { key: 'received', label: 'Received (t)', width: '120px', align: 'right' },
        { key: 'grn', label: 'Goods received note', width: '170px', render: (r) => (r.grn ? <RefCell>{r.grn}</RefCell> : '') },
        { key: 'difference', label: 'Difference (t)', width: '120px', align: 'right' },
        { key: 'status', label: 'Status', width: '120px', render: () => legStatus },
      ]} rows={[leg]} />
      {onRoad ? null : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
          <ReconcileCard title="Transit" outcome={cleared ? 'allowance' : 'beyond'} status={cleared ? 'Within allowance' : 'Beyond allowance'} rows={[
            { label: 'Dispatched', value: `${t.sent} t` }, { label: 'Received', value: `${received} t` },
            ...(t.sentBags ? [{ label: 'Bags dispatched', value: t.sentBags }, { label: 'Bags received', value: receivedBags }] : []),
            { label: 'Difference', value: `${diff} t`, strong: true }, { label: 'Allowance', value: `${t.allowance} t` },
          ]} />
          {difference ? (
            <Card title="Transit difference">
              <TransitResidue residue={diff} writeOff={writeOff} requesting={state === 'Requesting write-off'} />
              <WbFacts min={140} fields={[['Allowance', t.allowanceWords], ['Received on', 'GRN10000388'], ['Approver', 'Owner']]} />
            </Card>
          ) : null}
        </div>
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Month-end stock take (ryan 15, S14 R8) */

const SK_COUNT = [
  { id: 'c1', bay: 'B1', product: 'Urea', pack: '50 kg bag', theoretical: '820.000', counted: '818.450', diff: '-1.550', pct: '0.19%', status: 'within' },
  { id: 'c2', bay: 'B1', product: 'Urea', pack: '20 kg bag', theoretical: '40.000', counted: '40.000', diff: '0.000', pct: '0.00%', status: 'within' },
  { id: 'c3', bay: 'B3', product: 'Urea', pack: '10 kg bag', theoretical: '12.000', counted: '12.000', diff: '0.000', pct: '0.00%', status: 'within' },
  { id: 'c4', bay: 'B2', product: 'Foliar Feed', pack: '10 L container', theoretical: '46.000', counted: '45.700', diff: '-0.300', pct: '0.65%', status: 'exception' },
  { id: 'c5', bay: 'B2', product: 'Foliar Feed', pack: '5 L container', theoretical: '6.000', counted: '6.000', diff: '0.000', pct: '0.00%', status: 'within' },
  // The Virtual warehouse must be empty at month end: received, not delivered, is a state that clears.
  { id: 'v', bay: 'Virtual warehouse', product: '', pack: '', theoretical: '0.000', counted: '', diff: '', pct: '', status: 'empty' },
];
const SK_ADJUSTMENTS = [
  { id: 'a1', adjustment: 'On hold, not in the book', record: 'GRN10000391', bay: 'B1', product: 'Urea 50 kg bag', tonnes: '+30.060', status: <StatusMark kind="attention" label="On hold" size="body-4" /> },
  { id: 'a2', adjustment: 'Loaded, not shipped', record: 'LO-2231', bay: 'B1', product: 'Urea 50 kg bag', tonnes: '-30.000', status: <StatusMark kind="pending" label="Loading" size="body-4" /> },
];

export function StockTake({ state = 'Counted' }) {
  const narrow = !useMinWidth(768);
  const third = state === 'Third-party count';
  const pending = state === 'Write-off pending approval';
  const requesting = state === 'Requesting write-off';
  const mark = (r) => (r.status === 'empty' ? <StatusMark kind="clean" label="Empty" size="body-4" />
    : r.status === 'exception' ? <StatusMark kind="attention" label="Exception" size="body-4" /> : <StatusMark kind="clean" label="Within tolerance" size="body-4" />);
  const action = (r) => (r.status !== 'exception' ? null
    : pending ? <StatusMark kind="pending" label="Pending approval" size="body-4" />
    : <Button variant="outline" size="xsmall" loading={requesting}>Request write-off</Button>);
  return (
    <Sections>
      <WbHead title="Stock take, 30 Sep 2026" right={<Button variant="outline" size="small" icon="download">Export</Button>} />
      <RecordHighlights kind="Stock take" title="30 Sep 2026" tabs={[]}
        fields={[{ label: 'Site', value: 'Chisamba Shed' }, { label: 'Counted by', value: third ? 'Copperbelt Surveyors Ltd' : 'Stock control' },
          { label: 'Counted', value: '30 Sep 2026, 16:00' }, { label: 'Tolerance', value: '0.20%' }]} />
      <WbTable columns={[
        { key: 'bay', label: 'Bay', width: '130px' },
        { key: 'product', label: 'Product', width: '120px', render: (r) => (r.product ? <CommodityMarker commodity="fertilizer">{r.product}</CommodityMarker> : '') },
        { key: 'pack', label: 'Pack', width: '120px' },
        { key: 'theoretical', label: 'Theoretical (t)', width: '120px', align: 'right' },
        { key: 'counted', label: 'Counted (t)', width: '110px', align: 'right' },
        { key: 'diff', label: 'Difference (t)', width: '110px', align: 'right' },
        { key: 'pct', label: 'Difference (%)', width: '116px', align: 'right' },
        { key: 'status', label: 'Status', width: '140px', render: mark },
        { key: 'action', label: 'Write-off', width: 'minmax(160px, 1fr)', align: 'right', render: action },
      ]} rows={SK_COUNT} objects="counts" />
      {third ? (
        <Card title="Third-party count">
          <WbFacts min={160} fields={[['Organisation', 'Copperbelt Surveyors Ltd'], ['Counted', '30 Sep 2026, 16:00 CAT'], ['Count sheet', 'Photographed by R. Daka, 30 Sep 2026, 16:40 CAT']]} />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><EvidenceTile kind="document" caption="count-sheet-chisamba-30-sep-2026" time="16:40" /></div>
        </Card>
      ) : null}
      {state === 'Adjustments to book' ? (
        <WbTable title="Adjustments to book" count={SK_ADJUSTMENTS.length} objects="adjustments" columns={[
          { key: 'adjustment', label: 'Adjustment', width: 'minmax(180px, 1fr)' },
          { key: 'record', label: 'Record', width: '130px', render: (r) => <RefCell>{r.record}</RefCell> },
          { key: 'bay', label: 'Bay', width: '60px' }, { key: 'product', label: 'Product', width: '150px' },
          { key: 'tonnes', label: 'Tonnes (t)', width: '110px', align: 'right' },
          { key: 'status', label: 'Status', width: '120px', render: (r) => r.status },
        ]} rows={SK_ADJUSTMENTS} />
      ) : null}
      {state === 'Request write-off' ? (
        <ReasonDialog title="Request write-off, B2 Foliar Feed 10 L?" confirmLabel="Request write-off" minLength={1} sheet={narrow}>
          0.300 t, 0.65% against a tolerance of 0.20%. The write-off is made only when it is approved.
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}
