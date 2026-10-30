/** The M7 money states of the trade board (M7.DS.02 AC 2, UAG-200), added beside its states and changing none of them
    (Henry, 30 Sep 2026: new work adds to the design and never deletes). TradeBoard hands one of ST_TRADEBOARD_STATES to
    TradeBoardM7; any other state draws exactly as it always has. Each state opens one trade's money section under its
    row: the costs tagged to it with their GL categories (cost tags), a supplier cash prepayment with its tonnage
    equivalence, its import trucks with loaded, offloaded and difference, and its payments with what is outstanding.

    Money carries the price tiers (UX-10): a reader without them gets the same board with every money cell drawn as the
    Restricted lock, because the board is a shared layout, never a dash or a zero. Weights carry three decimals on a leg
    (UX-12), money its code in the column header (UX-11). Fictional sample data on the golden fixture names. */

export const ST_TRADEBOARD_STATES = ['Cost tags', 'Supplier prepayment', 'Import trucks', 'Payments', 'Without the price tiers'];

export const ST_BOARD_TRADES = [
  { id: 'SYN4702', type: 'Back-to-back', cp: 'Riverbend Milling', commodity: 'Wheat', marker: 'wheat', quantity: '5,000', delivered: '4,200', margin: '61,200.00', costs: ['Transport', 'Clearing Docs', 'Commissions'], status: 'active' },
  { id: 'SYN4811', type: 'Back-to-back', cp: 'Antelope Mills', commodity: 'White maize', marker: 'maize', quantity: '2,000', delivered: '1,412', margin: '24,180.00', costs: ['Transport', 'Prepayments on Prefinance'], prepayment: true, status: 'active' },
  { id: 'SYN4845', type: 'Import', cp: 'Riverbend Milling', commodity: 'Wheat (import)', marker: 'wheat', quantity: '5,000', delivered: '68', margin: '41,600.00', costs: ['Transport', 'Clearing Docs', 'Phyto Certificates'], imports: true, status: 'active' },
  { id: 'SYN4852', type: 'Import', cp: 'Crest Milling', commodity: 'Wheat (import)', marker: 'wheat', quantity: '3,000', delivered: '1,240', margin: '18,950.00', costs: ['Transport'], status: 'active' },
];
/** The costs on SYN4702, each tagged with its GL category (F7.2): append-only lines, never capitalised into stock cost. */
export const ST_BOARD_COSTS = [
  { id: 'k1', category: 'Transport', code: '610100', on: '18 Sep 2026', reference: 'Northside Haulage inv 2207, 12 trucks', amount: '10,661.56' },
  { id: 'k2', category: 'Clearing Docs', code: '610300', on: '20 Sep 2026', reference: 'Corridor Clearing Ltd inv 0398', amount: '1,280.00' },
  { id: 'k3', category: 'Commissions', code: '610400', on: '24 Sep 2026', reference: 'Agent note 0042', amount: '2,500.00' },
];
/** SYN4845's import trucks: the difference is loaded less offloaded, worked out, never typed; a truck not yet offloaded
    has no difference. */
export const ST_BOARD_LEGS = [
  { id: 'KAL-07', truck: 'ACE 4412', loaded: '34.100', offloaded: '34.020' },
  { id: 'KAL-09', truck: 'ACE 4418', loaded: '34.120', offloaded: '34.050' },
  { id: 'KAL-11', truck: 'ACE 4431', loaded: '33.960', offloaded: '' },
];
export const ST_BOARD_INVOICES = [
  { id: 'b1', ref: '8693', date: '31 Jul 2026', invoiced: '831,941.10', paid: '821,478.24', outstanding: '10,462.86', status: 'invoiced' },
  { id: 'b2', ref: '8986', date: '31 Aug 2026', invoiced: '132,723.79', paid: '0.00', outstanding: '132,723.79', status: 'overdue' },
  { id: 'b3', ref: '9012', date: '05 Oct 2026', invoiced: '19,359.11', paid: '0.00', outstanding: '19,359.11', status: 'invoiced' },
];
const ST_BOARD_INVOICE_MARK = { invoiced: { kind: 'pending', word: 'Invoiced' }, paid: { kind: 'clean', word: 'Paid' }, overdue: { kind: 'attention', word: 'Overdue' } };
const stBoardDiff = (l) => (l.offloaded ? tonnes(thousandths(l.loaded) - thousandths(l.offloaded)) : '');
const stBoardSum = (rows, k) => rows.reduce((n, r) => n + centsOf(r[k]), 0);

function StBoardSection({ trade, state, tier }) {
  const money = (v) => (tier ? v : <Restricted />);
  const pad = { padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 };
  if (state === 'Cost tags' || (state === 'Without the price tiers' && trade.id === 'SYN4702')) {
    return (
      <div style={pad}>
        <Text variant="body-3" strong>Costs</Text>
        <HmTable rows={[...ST_BOARD_COSTS, { id: 'total', total: true, category: 'Total', amount: fromCents(stBoardSum(ST_BOARD_COSTS, 'amount')) }]} columns={[
          { key: 'category', label: 'Category', width: 'minmax(140px, 1fr)', render: (r) => twStrong(r, r.category) },
          { key: 'code', label: 'Account code', width: '110px' },
          { key: 'on', label: 'Incurred on', width: '116px', tabular: true },
          { key: 'reference', label: 'Reference', width: 'minmax(200px, 1.4fr)', wrap: true },
          { key: 'amount', label: 'Amount (USD)', width: '120px', align: 'right', render: (r) => money(twStrong(r, r.amount)) },
          { key: 'status', label: 'Status', width: '110px', render: (r) => (r.total ? '' : <StatusMark kind="clean" label="Recorded" size="body-4" />) },
        ]} />
      </div>
    );
  }
  if (state === 'Supplier prepayment') {
    return (
      <div style={pad}>
        <Text variant="body-3" strong>Supplier prepayment</Text>
        <HmFacts min={150} fields={[['Prepayment', 'LE-0002, LV prepay 1'], ['Supplier', 'Lakeview Farms Ltd'], ['Contract', 'SYN4811 P A'], ['Paid on', '20 Aug 2026'], ['Amount', money('ZMW 340,000.00')], ['Price', money('ZMW 6,800.00 per t')],
          ['Tonnage equivalence', '50.000 t'], ['Delivered against it', '12.500 t'], ['Remaining', '37.500 t']]} />
        <StatusMark kind="pending" label="Open" size="body-4" />
      </div>
    );
  }
  if (state === 'Import trucks') {
    const loaded = ST_BOARD_LEGS.reduce((n, l) => n + thousandths(l.loaded), 0);
    const off = ST_BOARD_LEGS.filter((l) => l.offloaded);
    const offloaded = off.reduce((n, l) => n + thousandths(l.offloaded), 0);
    const diff = off.reduce((n, l) => n + thousandths(l.loaded) - thousandths(l.offloaded), 0);
    return (
      <div style={pad}>
        <Text variant="body-3" strong>Import trucks</Text>
        <HmTable rows={[...ST_BOARD_LEGS, { id: 'total', total: true, truck: 'Total', loaded: tonnes(loaded), offloaded: tonnes(offloaded), diff: tonnes(diff) }]} columns={[
          { key: 'id', label: 'Leg', width: '90px', render: (r) => (r.total ? '' : <HmLink>{r.id}</HmLink>) },
          { key: 'truck', label: 'Truck', width: 'minmax(110px, 1fr)', render: (r) => twStrong(r, r.truck) },
          { key: 'loaded', label: 'Loaded (t)', width: '100px', align: 'right', render: (r) => twStrong(r, r.loaded) },
          { key: 'offloaded', label: 'Offloaded (t)', width: '110px', align: 'right', render: (r) => twStrong(r, r.offloaded) },
          { key: 'diff', label: 'Difference (t)', width: '116px', align: 'right', render: (r) => twStrong(r, r.total ? r.diff : stBoardDiff(r)) },
          { key: 'status', label: 'Status', width: '120px', render: (r) => (r.total ? '' : <StatusMark kind={r.offloaded ? 'clean' : 'pending'} label={r.offloaded ? 'Reconciled' : 'In transit'} size="body-4" />) },
        ]} />
      </div>
    );
  }
  const outstanding = fromCents(stBoardSum(ST_BOARD_INVOICES, 'outstanding'));
  return (
    <div style={pad}>
      <Text variant="body-3" strong>Payments</Text>
      <HmFacts min={150} fields={[['Invoiced', money(`USD ${fromCents(stBoardSum(ST_BOARD_INVOICES, 'invoiced'))}`)], ['Paid', money(`USD ${fromCents(stBoardSum(ST_BOARD_INVOICES, 'paid'))}`)], ['Outstanding', money(`USD ${outstanding}`)]]} />
      <HmTable rows={ST_BOARD_INVOICES} columns={[
        { key: 'ref', label: 'Invoice', width: '90px' }, { key: 'date', label: 'Date', width: '116px', tabular: true },
        { key: 'invoiced', label: 'Invoiced (USD)', width: '120px', align: 'right', render: (r) => money(r.invoiced) },
        { key: 'paid', label: 'Paid (USD)', width: '110px', align: 'right', render: (r) => money(r.paid) },
        { key: 'outstanding', label: 'Outstanding (USD)', width: '136px', align: 'right', render: (r) => money(r.outstanding) },
        { key: 'status', label: 'Status', width: 'minmax(100px, 1fr)', render: (r) => <StatusMark kind={ST_BOARD_INVOICE_MARK[r.status].kind} label={ST_BOARD_INVOICE_MARK[r.status].word} size="body-4" /> },
      ]} />
    </div>
  );
}

/** TradeBoard's M7 states: the trades in the list view layout (UX-07) with a Costs column of cost tags, and one trade's
    money section open under its row. */
export function TradeBoardM7({ state, onOpen }) {
  const tier = state !== 'Without the price tiers';
  const open = { 'Cost tags': 'SYN4702', 'Supplier prepayment': 'SYN4811', 'Import trucks': 'SYN4845', Payments: 'SYN4845', 'Without the price tiers': 'SYN4702' }[state];
  return (
    <Sections>
      <HmHead title="Trades" count={ST_BOARD_TRADES.length} meta={<HmRefreshed time="01 Oct 2026, 07:02 CAT" />}
        right={<><Button variant="outline" size="small" icon="download">Export</Button><Button size="small">New</Button></>} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <ScrollRow><Capsule chevron selected>Active trades</Capsule><Capsule chevron>Commodity</Capsule><Capsule chevron>Cost category</Capsule></ScrollRow>
        <SearchField placeholder="Search this list" hint={null} maxWidth={320} />
      </div>
      <Card padding={4}>
        <HmTable rows={ST_BOARD_TRADES} expanded={[open]} expandLabel={(r) => `Show the money, ${r.id}`}
          expand={(r) => (r.id === open ? <StBoardSection trade={r} state={state} tier={tier} /> : null)}
          columns={[
            { key: 'id', label: 'Trade', width: '100px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
            { key: 'type', label: 'Type', width: '110px' },
            { key: 'cp', label: 'Counterparty', width: 'minmax(150px, 1fr)', wrap: true },
            { key: 'commodity', label: 'Commodity', width: '140px', render: (r) => <CommodityMarker commodity={r.marker}>{r.commodity}</CommodityMarker> },
            { key: 'quantity', label: 'Quantity (t)', width: '104px', align: 'right' },
            { key: 'delivered', label: 'Delivered (t)', width: '110px', align: 'right' },
            { key: 'costs', label: 'Costs', width: 'minmax(180px, 1.2fr)', wrap: true, render: (r) => r.costs.join(', ') },
            { key: 'margin', label: 'Margin (USD)', width: '124px', align: 'right', render: (r) => (tier ? <MarginCell value={r.margin} /> : <Restricted />) },
            { key: 'status', label: 'Status', width: '116px', render: (r) => <TwStatus status={r.status} /> },
          ]} />
      </Card>
    </Sections>
  );
}
