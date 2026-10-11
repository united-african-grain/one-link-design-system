/** Trades and contracts in the Trading workspace (M6.DS.01): (a) the trade working view with live margin, (g) the trade
    record, (h) the new trade (enquiry capture) and the close-trade dialog, (i) generating contracts and recording
    signatures, and the contract list (M6.TRD.13). Every screen takes `state`, one of TRADING_WORKSPACE_STATES.

    Margin is sale less purchase less transport, per leg, recomputed as a line changes; the transport rate fills
    itself from (pickup district, destination) and is visible before Submit for approval, as is the buyer's exposure
    (S47 JQ4). A missing rate is Not set in the rate cell and in every margin resting on it, and Submit for approval is
    refused naming the route (UX-16, UX-21). A negative margin is drawn as a signal (MarginCell). Without the contract
    tier the prices, rates and margin are left out of tables, and a shared field is the Restricted lock (UX-09). */

/* ------------------------------------------------------------------ (a) The trade working view */

/** The working trade's legs as entered: quantity, price and pickup district are inputs; the transport rate fills
    itself and is never typed; margin per tonne and per leg follow. */
function twWorkingLegs(state) {
  const legs = TW_SYN4810.legs.map((l) => ({ ...l }));
  if (state === 'Negative margin') Object.assign(legs[1], { price: '258.00', perT: '-1.60', margin: '-800.00' });
  if (state === 'Rate not set') Object.assign(legs[2], { transport: '', perT: '', margin: '' });
  if (state === 'Uncovered tonnage') Object.assign(legs[2], { quantity: '200', margin: '2,570.00' });
  return legs;
}
const TW_WORKING_TOTAL = {
  'Negative margin': { lined: '1,500', uncovered: '0', margin: '11,420.00', perT: '7.61' },
  'Rate not set': { lined: '1,500', uncovered: '0', margin: '', perT: '' },
  'Uncovered tonnage': { lined: '1,400', uncovered: '100', margin: '16,635.00', perT: '11.88' },
};
export const TW_NO_RATE = 'No transport rate for Mpongwe to Riverbend Mill Kitwe intake';

export function TradeWorkingView({ state = 'Working', onOpen }) {
  const [calc, setCalc] = useState(state === 'Calculation details' ? 'margin' : null);
  useEffect(() => setCalc(state === 'Calculation details' ? 'margin' : null), [state]);
  if (state === 'Loading') return <TwLoading title="SYN4810" />;
  const tier = state !== 'Without the contract tier';
  const noRate = state === 'Rate not set';
  const legs = twWorkingLegs(state);
  const total = TW_WORKING_TOTAL[state] || { lined: '1,500', uncovered: '0', margin: TW_SYN4810.margin, perT: TW_SYN4810.marginPerT };
  const sel = (options, value) => <Select options={options} defaultValue={value} disabled={!tier || state === 'Submitting'} />;
  const num = (value) => <Input align="right" defaultValue={value} disabled={!tier || state === 'Submitting'} />;
  const legRows = [...legs, { id: 'total', total: true, supplier: 'Total', quantity: total.lined, margin: total.margin }];
  const columns = [
    { key: 'id', label: 'Leg', width: '56px', render: (r) => (r.total ? <Text variant="body-3" strong>Total</Text> : r.id) },
    { key: 'supplier', label: 'Supplier', width: 'minmax(160px, 1fr)', wrap: true, render: (r) => (r.total ? '' : <HmLink onOpen={() => onOpen && onOpen(r.supplier)}>{r.supplier}</HmLink>) },
    { key: 'pickup', label: 'Pickup district', width: '140px', render: (r) => (r.total ? '' : sel(['Mkushi', 'Chisamba', 'Mpongwe', 'Kabwe'], r.pickup)) },
    { key: 'quantity', label: 'Quantity (t)', width: '116px', align: 'right', render: (r) => (r.total ? <Text variant="body-3" strong tabular>{r.quantity}</Text> : num(r.quantity)) },
    ...(tier ? [
      { key: 'price', label: 'Price (USD per t)', width: '130px', align: 'right', render: (r) => (r.total ? '' : num(r.price)) },
      { key: 'transport', label: 'Transport (USD per t)', width: '150px', align: 'right', render: (r) => (r.total ? '' : r.transport ? r.transport : <NotSet size="body-4" />) },
      { key: 'perT', label: 'Margin (USD per t)', width: '140px', align: 'right', render: (r) => (r.total ? '' : <MarginCell value={r.perT} notSet={!r.transport} />) },
      { key: 'margin', label: 'Margin (USD)', width: '124px', align: 'right', render: (r) => (r.total ? <MarginCell value={r.margin} notSet={noRate} onOpen={() => setCalc('margin')} /> : <MarginCell value={r.margin} notSet={!r.transport} onOpen={() => setCalc(r.id)} />) },
    ] : []),
  ];
  const calcFor = (id) => {
    if (id === 'margin') {
      return { name: 'Margin, SYN4810', value: noRate ? <NotSet /> : `USD ${total.margin}`,
        components: legs.map((l) => ({ label: `Leg ${l.id}, ${l.supplier}`, value: l.transport ? l.margin : <NotSet /> })),
        total: { label: 'Margin (USD)', value: noRate ? <NotSet /> : total.margin },
        basis: [...(noRate ? [{ label: 'Missing rate', value: TW_NO_RATE }, { label: 'Setting owner', value: 'Trading' }] : []),
          { label: 'Lined', value: `${total.lined} t of 1,500 t` }, { label: 'Rates as of', value: TW_RATE_DATE }, { label: 'Exchange rate', value: TW_RATE }] };
    }
    if (id === 'uncovered') {
      return { name: 'Uncovered, SYN4810', value: `${total.uncovered} t`, components: [{ label: 'Sale', value: '1,500 t' }, ...legs.map((l) => ({ label: `Less leg ${l.id}, ${l.supplier}`, value: `-${l.quantity} t` }))],
        total: { label: 'Uncovered (t)', value: total.uncovered }, basis: [{ label: 'Margin counts', value: `The ${total.lined} t lined` }] };
    }
    const l = legs.find((x) => x.id === id);
    return { name: `Margin, leg ${l.id}`, value: l.transport ? `USD ${l.margin}` : <NotSet />,
      components: [{ label: 'Sale price (USD per t)', value: TW_SYN4810.price }, { label: 'Purchase price (USD per t)', value: `-${l.price}` }, { label: 'Transport (USD per t)', value: l.transport ? `-${l.transport}` : <NotSet /> }, { label: 'Quantity (t)', value: l.quantity }],
      total: { label: 'Margin (USD)', value: l.transport ? l.margin : <NotSet /> },
      basis: [...(l.transport ? [{ label: 'Transport rate', value: `${l.pickup} to ${TW_SYN4810.location}` }] : [{ label: 'Missing rate', value: TW_NO_RATE }]), { label: 'Rates as of', value: TW_RATE_DATE }] };
  };
  const panel = calc ? calcFor(calc) : null;
  return (
    <Sections>
      <HmHead title="SYN4810" />
      {noRate ? <Refusal action="Submit for approval" reason={TW_NO_RATE} /> : null}
      <RecordHighlights kind="Trade" title="SYN4810" status={<TwStatus status="draft" />} tabs={[]}
        actions={tier ? <><Button variant="outline" size="small" disabled={state === 'Submitting'}>Save</Button><Button size="small" loading={state === 'Submitting'} disabled={noRate}>Submit for approval</Button></> : null}
        fields={[
          { label: 'Buyer', value: 'Riverbend Milling', link: '#' },
          { label: 'Commodity', value: <CommodityMarker commodity="maize">Maize</CommodityMarker> },
          { label: 'Quantity', value: '1,500 t' },
          { label: 'Lined', value: `${total.lined} t` },
          { label: 'Uncovered', value: <HmLink onOpen={() => setCalc('uncovered')}>{`${total.uncovered} t`}</HmLink> },
          { label: 'Margin', value: tier ? <MarginCell value={total.margin} currency="USD" notSet={noRate} onOpen={() => setCalc('margin')} /> : <MarginCell restricted /> },
          ...(tier ? [{ label: 'Margin per t', value: <MarginCell value={total.perT} currency="USD" notSet={noRate} /> }] : []),
          { label: 'Owner', value: 'J. Tembo' },
        ]} />
      <Card title="Sale" padding={16}>
        <HmFacts fields={[['Buyer', 'Riverbend Milling'], ['Commodity', 'Maize'], ['Grade', 'White maize'], ['Quantity', '1,500 t'],
          ...(tier ? [['Sale price', 'USD 272.00 per t']] : []), ['Basis', 'Delivered'], ['Delivery window', 'Jun 2027 to Aug 2027'], ['Delivery location', TW_SYN4810.location], ['Type', 'Back-to-back']]} />
      </Card>
      <HmCard title="Purchase legs" count={legs.length} objects="purchase legs">
        <HmTable rows={legRows} columns={columns} />
      </HmCard>
      {tier ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
          <Card title="Counterparty exposure, Riverbend Milling" padding={16}>
            <HmFacts min={150} fields={[['Before this trade', 'USD 574,000.00'], ['This trade', 'USD 408,000.00'], ['After this trade', 'USD 982,000.00'], ['Single client limit', 'USD 5,000,000.00'], ['Payment terms', '7 days']]} />
          </Card>
          <Card title="Rates" padding={16}>
            <HmFacts min={150} fields={[['Rates as of', TW_RATE_DATE], ['Exchange rate', TW_RATE], ['Transport rates', 'Pickup district to Riverbend Mill Kitwe intake'], ['Source', 'Transport rates, 22 Sep 2026']]} />
          </Card>
        </div>
      ) : null}
      {panel ? <CalculationDetails open onClose={() => setCalc(null)} name={panel.name} value={panel.value} components={panel.components} total={panel.total} basis={panel.basis} /> : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ (g) The trade record (trade-360) */

/** Trade SYN4702's purchase legs with what each has delivered, and the load chain under each: ticket, goods received
    note, delivery note, truck, date, weight with three decimals, grade and deducted tonnes. */
export const TW_702_LEGS = [
  { id: 'A', ref: 'SYN4702-A', supplier: 'Cameron Estates', basis: 'Collected', contracted: '1,700', delivered: '1,700', left: '0' },
  { id: 'B', ref: 'SYN4702-B', supplier: 'Kapiri Farms', basis: 'Collected', contracted: '1,800', delivered: '1,800', left: '0' },
  { id: 'C', ref: 'SYN4702-C', supplier: 'Lakeview Farms Ltd', basis: 'Collected', contracted: '700', delivered: '400', left: '300' },
  { id: 'total', total: true, ref: 'Total', contracted: '4,200', delivered: '3,900', left: '300' },
];
export const TW_LOAD_CHAIN = [
  { id: 'k1', truck: 'ABZ 4521', ticket: 'WBT10001588', grn: 'GRN10000371', dn: '', date: '16 Sep 2026', weight: '24.500', grade: 'B1', deducted: '0.049' },
  { id: 'k2', truck: 'BAL 6750', ticket: 'WBT10001574', grn: 'GRN10000366', dn: '', date: '14 Sep 2026', weight: '30.260', grade: 'B2', deducted: '0.000' },
  { id: 'k3', truck: 'BAL 1940', ticket: 'WBT10001569', grn: '', dn: '', date: '12 Sep 2026', weight: '27.740', grade: 'B2', deducted: '0.000' },
];
const TW_702_HISTORY = [
  { id: 'h3', field: 'Pending approval', user: 'J. Tembo', role: 'Trading', old: '', next: 'Amendment, SYN4702-A price', date: '25 Sep 2026, 10:05', note: 'From 01 Nov 2026' },
  { id: 'h2', field: 'Status', user: 'J. Tembo', role: 'Trading', old: 'Approved', next: 'Active', date: '04 Sep 2026, 15:20', note: 'Sale and every leg signed' },
  { id: 'h1', field: 'Status', user: 'T. Mwila', role: 'Managing Director', old: 'Pending approval', next: 'Approved', date: '02 Sep 2026, 11:40', note: 'Approved as approver' },
];

function TwLegChain({ links = true }) {
  return (
    <HmTable rows={TW_LOAD_CHAIN} columns={[
      { key: 'truck', label: 'Truck', width: '100px' },
      { key: 'ticket', label: 'Ticket', width: '130px', render: (r) => <TwRef open={links}>{r.ticket}</TwRef> },
      { key: 'grn', label: 'Goods received note', width: '230px', render: (r) => (r.grn ? <TwRef open={links}>{r.grn}</TwRef> : <Text variant="body-4" tone="secondary">No goods received note recorded</Text>) },
      { key: 'date', label: 'Date', width: '120px', tabular: true },
      { key: 'weight', label: 'Weight (t)', width: '100px', align: 'right' },
      { key: 'grade', label: 'Grade', width: '70px' },
      { key: 'deducted', label: 'Deducted (t)', width: '110px', align: 'right' },
    ]} />
  );
}

/** The trade record (UX-19; M6.SET.01 trade-360, on screen a record page): highlights with status, then Details,
    Related and History. Related cards appear only when their records exist: no invoices or payments are recorded on
    SYN4702 yet, so neither card is drawn and nothing shows as zero. */
export function TradeRecord({ state = 'Details', onOpen }) {
  const initial = state === 'Related' ? 'Related' : state === 'History' ? 'History' : 'Details';
  const [tab, setTab] = useState(initial);
  const [calc, setCalc] = useState(false);
  useEffect(() => setTab(initial), [state]);
  if (state === 'Pending approval') return <TwTradeApproval state="Pending approval" onOpen={onOpen} />;
  if (state === 'Loading') return <TwLoading title="SYN4702" />;
  if (state === 'Close suggested' || state === 'Closed with balance') return <TwCloseRecord state={state === 'Close suggested' ? 'Close suggested' : 'Closed with balance'} />;
  const tier = state !== 'Without the contract tier';
  const fields = [
    { label: 'Counterparty', value: 'Riverbend Milling', link: '#' }, { label: 'Commodity', value: <CommodityMarker commodity="wheat">Wheat</CommodityMarker> },
    { label: 'Quantity', value: '5,000 t' }, { label: 'Delivered', value: '4,200 t' },
    { label: 'Margin', value: tier ? <MarginCell value="61,200.00" currency="USD" onOpen={() => setCalc(true)} /> : <MarginCell restricted /> }, { label: 'Owner', value: 'J. Tembo' },
  ];
  const legs = (
    <HmCard title="Purchase legs" count={3} objects="purchase legs">
      <HmTable rows={TW_702_LEGS} expanded={tab === 'Details' ? ['C'] : undefined} expandLabel={(r) => `Show loads, ${r.ref}`} expand={(r) => (r.total ? null : <TwLegChain />)} columns={[
        { key: 'ref', label: 'Leg', width: '110px', render: (r) => (r.total ? <Text variant="body-3" strong>Total</Text> : <HmLink onOpen={() => onOpen && onOpen(r.ref)}>{r.ref}</HmLink>) },
        { key: 'supplier', label: 'Supplier', width: 'minmax(150px, 1fr)', wrap: true },
        { key: 'basis', label: 'Basis', width: '96px' },
        { key: 'contracted', label: 'Contracted (t)', width: '120px', align: 'right', render: (r) => twStrong(r, r.contracted) },
        { key: 'delivered', label: 'Delivered (t)', width: '110px', align: 'right', render: (r) => twStrong(r, r.delivered) },
        { key: 'left', label: 'Left to deliver (t)', width: '140px', align: 'right', render: (r) => twStrong(r, r.left) },
      ]} />
    </HmCard>
  );
  return (
    <Sections>
      <HmHead title="SYN4702" />
      <RecordHighlights kind="Trade" title="SYN4702" status={<TwStatus status="active" />} fields={fields} tab={tab} onTab={setTab}
        actions={tier ? <Button variant="outline" size="small" icon="download">Export</Button> : null} />
      {tab === 'History' ? (
        <HmCard title="History" count={TW_702_HISTORY.length} objects="changes">
          <HmTable rows={TW_702_HISTORY} columns={[
            { key: 'field', label: 'Field', width: '130px' }, { key: 'user', label: 'User', width: '100px' }, { key: 'role', label: 'Role', width: '150px' },
            { key: 'old', label: 'Old value', width: '140px' }, { key: 'next', label: 'New value', width: 'minmax(180px, 1fr)', wrap: true },
            { key: 'date', label: 'Date (CAT)', width: '150px', tabular: true }, { key: 'note', label: 'Note', width: '170px', wrap: true },
          ]} />
        </HmCard>
      ) : tab === 'Related' ? (
        <>
          <HmCard title="Contracts" count={4} objects="contracts" link="View all" onLink={() => onOpen && onOpen('contracts')}>
            <HmTable rows={TW_CONTRACTS.filter((c) => c.id.startsWith('SYN4702'))} columns={[
              { key: 'id', label: 'Contract', width: '110px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
              { key: 'kind', label: 'Kind', width: '96px' }, { key: 'cp', label: 'Counterparty', width: 'minmax(150px, 1fr)', wrap: true },
              { key: 'quantity', label: 'Quantity (t)', width: '104px', align: 'right' }, { key: 'delivered', label: 'Delivered (t)', width: '110px', align: 'right' },
              { key: 'status', label: 'Status', width: '110px', render: (r) => <TwStatus status={r.status} /> },
            ]} />
          </HmCard>
          <HmCard title="Items to approve" count={1} objects="items">
            <RailRow subject={<HmLink onOpen={() => onOpen && onOpen('amendment')}>Amendment, SYN4702-A</HmLink>} context="Price from USD 250.00 to USD 256.00 per t, from 01 Nov 2026" right={<TwStatus status="pending" />} style={{ padding: '10px 16px' }} />
          </HmCard>
          <HmCard title="Exceptions" count={1} objects="exceptions">
            <RailRow subject={<HmLink onOpen={() => onOpen && onOpen('EXC-000184')}>Delivery overdue</HmLink>} context="SYN4702-C, Lakeview Farms Ltd, 300 t" right={<ExceptionStatus status="open" />} style={{ padding: '10px 16px' }} />
          </HmCard>
        </>
      ) : (
        <>
          <Card title="Trade information" padding={16}>
            <HmFacts fields={[['Trade number', 'SYN4702'], ['Type', 'Back-to-back'], ['Buyer', 'Riverbend Milling'], ['Commodity', 'Wheat'], ['Grade', 'B1'], ['Quantity', '5,000 t'],
              ['Delivery window', 'Sep 2026 to Nov 2026'], ['Delivery location', 'Riverbend Mill Kitwe intake'], ...(tier ? [['Sale price', 'USD 284.40 per t']] : []), ['Basis', 'Delivered'],
              ['Quality specification', <HmLink onOpen={() => onOpen && onOpen('spec')}>Wheat, ZAMACE grade 1, v3</HmLink>], ['Approved by', 'T. Mwila']]} />
          </Card>
          <Card title="Delivery and coverage" padding={16}>
            <HmFacts fields={[['Quantity', '5,000 t'], ['Delivered', '4,200 t'], ['Left to deliver', '800 t'], ['Firm secured', '4,200 t'], ['Coverage', 'Short 800 t']]} />
          </Card>
          {legs}
          <Card title="System information" padding={16}>
            <HmFacts fields={[['Created by', 'A. Mwale'], ['Created date', '02 Sep 2026, 09:14'], ['Last modified by', 'J. Tembo'], ['Last modified date', '25 Sep 2026, 10:05']]} />
          </Card>
        </>
      )}
      <CalculationDetails open={calc} onClose={() => setCalc(false)} name="Margin, SYN4702" value="USD 61,200.00"
        components={[{ label: 'Leg A, Cameron Estates: 1,700 t at USD 12.00 per t', value: '20,400.00' }, { label: 'Leg B, Kapiri Farms: 1,800 t at USD 13.00 per t', value: '23,400.00' }, { label: 'Leg C, Lakeview Farms Ltd: 700 t at USD 12.00 per t', value: '8,400.00' }, { label: 'Stock from Chisamba Shed: 800 t at USD 11.25 per t', value: '9,000.00' }]}
        total={{ label: 'Margin (USD)', value: '61,200.00' }} basis={[{ label: 'Rates as of', value: '01 Sep 2026' }, { label: 'Exchange rate', value: TW_RATE }]} />
    </Sections>
  );
}

/* ------------------------------------------------------------------ Close suggested and closed with balance */

const TW_790_LEGS = [
  { id: 'A', ref: 'SYN4790-A', supplier: 'Lakeview Farms Ltd', contracted: '700', delivered: '698', remaining: '2' },
  { id: 'B', ref: 'SYN4790-B', supplier: 'Cameron Estates', contracted: '500', delivered: '498', remaining: '2' },
  { id: 'total', total: true, ref: 'Total', contracted: '1,200', delivered: '1,196', remaining: '4' },
];
function TwClosingLegs({ rows, compact = false }) {
  return (
    <HmTable rows={rows} columns={[
      { key: 'ref', label: 'Leg', width: compact ? '100px' : '110px', render: (r) => (r.total ? <Text variant="body-3" strong>Total</Text> : <HmLink>{r.ref}</HmLink>) },
      ...(compact ? [] : [{ key: 'supplier', label: 'Supplier', width: 'minmax(150px, 1fr)', wrap: true, render: (r) => (r.total ? '' : r.supplier) }]),
      { key: 'contracted', label: 'Contracted (t)', width: compact ? '112px' : '120px', align: 'right', render: (r) => twStrong(r, r.contracted) },
      { key: 'delivered', label: 'Delivered (t)', width: compact ? '104px' : '110px', align: 'right', render: (r) => twStrong(r, r.delivered) },
      { key: 'remaining', label: 'Remaining (t)', width: compact ? '112px' : '120px', align: 'right', render: (r) => twStrong(r, r.remaining) },
    ]} />
  );
}

/** A trade whose legs are all delivered within the leg completion tolerance carries the exception Close suggested;
    its status stays Active, and nothing closes on its own. A closed trade keeps its Remaining balance. */
function TwCloseRecord({ state, dialog }) {
  const closed = state === 'Closed with balance' || state === 'Closed';
  const syn4798 = state === 'Closed with balance';
  const id = syn4798 ? 'SYN4798' : 'SYN4790';
  const legs = syn4798 ? TW_CLOSED_LEGS : TW_790_LEGS;
  return (
    <Sections>
      <HmHead title={id} />
      <RecordHighlights kind="Trade" title={id} status={<TwStatus status={closed ? 'closed' : 'active'} />} tabs={['Details', 'Related', 'History']} tab="Details"
        actions={closed ? null : <Button variant="outline" size="small">Close</Button>}
        fields={[{ label: 'Counterparty', value: syn4798 ? 'Kafue Valley Milling' : 'Riverbend Milling', link: '#' }, { label: 'Commodity', value: <CommodityMarker commodity={syn4798 ? 'maize' : 'wheat'}>{syn4798 ? 'Maize' : 'Wheat'}</CommodityMarker> },
          { label: 'Quantity', value: syn4798 ? '1,000 t' : '1,200 t' }, { label: 'Delivered', value: syn4798 ? '962 t' : '1,196 t' }, { label: 'Owner', value: 'J. Tembo' },
          ...(closed ? [{ label: 'Remaining balance', value: syn4798 ? '38 t' : '4 t' }, { label: 'Closed', value: syn4798 ? '24 Sep 2026, 15:10' : '26 Sep 2026, 09:12' }] : [])]} />
      {closed ? null : (
        <HmCard title="Exceptions" count={1} objects="exceptions">
          <RailRow subject={<HmLink>Close suggested</HmLink>} context="Every leg and the sale delivered within the 1.0% leg completion tolerance" right={<ExceptionStatus status="open" />} style={{ padding: '10px 16px' }} />
        </HmCard>
      )}
      {closed ? (
        <Card title="Closing" padding={16}>
          <HmFacts fields={[['Closed by', 'J. Tembo'], ['Reason', syn4798 ? 'Mpongwe Valley Farms cannot supply the last 38 t this season' : 'Within tolerance; mill confirmed the contract complete'], ['Remaining balance', syn4798 ? '38 t' : '4 t']]} />
        </Card>
      ) : null}
      <HmCard title="Purchase legs" count={2} objects="purchase legs"><TwClosingLegs rows={legs} /></HmCard>
      {dialog}
    </Sections>
  );
}

/* ------------------------------------------------------------------ (h) Close-trade dialog */

/** Close trade SYN4790 (M6.TRD.01 AC 7): each leg's contracted, delivered and remaining, and a reason before Close is
    enabled (UX-22). Any remaining balance is recorded as closed with balance. */
export function CloseTrade({ state = 'Close' }) {
  const narrow = !useMinWidth(768);
  if (state === 'Closed') return <TwCloseRecord state="Closed" />;
  const busy = state === 'Closing';
  const reason = state === 'Close' ? '' : 'Within tolerance; mill confirmed the contract complete';
  const dialog = (
    <Dialog title="Close trade SYN4790?" width={480} sheet={narrow} onClose={busy ? undefined : () => {}}
      footer={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy} disabled={!reason}>Close</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span>4 t is left on the legs and is recorded as closed with balance.</span>
        <div style={{ margin: '0 -16px' }}><TwClosingLegs rows={TW_790_LEGS} compact /></div>
        <Field label="Reason" required><Input multiline disabled={busy} defaultValue={reason} /></Field>
      </div>
    </Dialog>
  );
  return <TwCloseRecord state="Close suggested" dialog={dialog} />;
}

/* ------------------------------------------------------------------ (h) Enquiry capture: New trade */

/** New trade (UX-21; M6.TRD.01 AC 1): the enquiry, saved as a Draft trade. Crush and offtake and storage mandate are
    listed and cannot be chosen (D-20). */
export function NewTrade({ state = 'Enquiry' }) {
  const busy = state === 'Saving';
  const missing = state === 'Missing fields';
  return (
    <Sections>
      <HmHead title="New trade" right={<><Button variant="outline" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Save</Button></>} />
      <Card title="Enquiry" padding={16}>
        <TwFields>
          <Field label="Buyer" required error={missing ? 'Choose a buyer.' : null}>
            <Select invalid={missing} disabled={busy} defaultValue={missing ? '' : 'Riverbend Milling'} options={[{ value: '', label: 'Choose a buyer' }, 'Riverbend Milling', 'Kafue Valley Milling', 'Crestline Milling']} />
          </Field>
          <Field label="Commodity" required><Select disabled={busy} defaultValue="White maize" options={['White maize', 'Wheat', 'Soya']} /></Field>
          <Field label="Approximate quantity (t)" required error={missing ? 'Approximate quantity must be a number.' : null}>
            <Input align="right" invalid={missing} disabled={busy} defaultValue={missing ? '' : '1,500'} />
          </Field>
          <Field label="Destination" required><Select disabled={busy} defaultValue="Riverbend Mill Kitwe intake" options={['Riverbend Mill Kitwe intake', 'Kafue Valley Mill, Lusaka']} /></Field>
          <Field label="Delivery from" required><Select disabled={busy} defaultValue="Jun 2027" options={['Jun 2027', 'Jul 2027', 'Aug 2027']} /></Field>
          <Field label="Delivery to" required><Select disabled={busy} defaultValue="Aug 2027" options={['Jun 2027', 'Jul 2027', 'Aug 2027']} /></Field>
          <Field label="Type" required>
            <Select disabled={busy} defaultValue="Back-to-back" options={['Back-to-back', 'Import', 'Financing', { value: 'crush', label: 'Crush and offtake (not in use)', disabled: true }, { value: 'storage', label: 'Storage mandate (not in use)', disabled: true }]} />
          </Field>
          <Field label="Owner" required><Select disabled={busy} defaultValue="J. Tembo" options={['J. Tembo', 'T. Mwila']} /></Field>
        </TwFields>
      </Card>
      <Card title="Source" padding={16}>
        <Field label="Source note"><Input multiline disabled={busy} defaultValue="Teams, 03 Sep 2026" /></Field>
      </Card>
    </Sections>
  );
}

/* ------------------------------------------------------------------ (i) Generate contracts and record signatures */

const TW_GENERATED = [
  { id: 'SYN4810', kind: 'Sale', cp: 'Riverbend Milling', quantity: '1,500', basis: 'Delivered', price: '272.00', signed: '28 Sep 2026' },
  { id: 'SYN4810-A', kind: 'Purchase', cp: 'Lakeview Farms Ltd', quantity: '700', basis: 'Collected', price: '246.40', signed: '28 Sep 2026' },
  { id: 'SYN4810-B', kind: 'Purchase', cp: 'Cameron Estates', quantity: '500', basis: 'Collected', price: '245.00', signed: '29 Sep 2026' },
  { id: 'SYN4810-C', kind: 'Purchase', cp: 'Mpongwe Valley Farms', quantity: '300', basis: 'Collected', price: '250.00', signed: '30 Sep 2026' },
];

/** Generate contracts (M6.TRD.04): from the approved trade, one sale and its lettered purchase legs under the sale
    reference reserved when the trade was worked, carrying exactly the approved version; nobody re-types a figure. Each
    signature is recorded (signing happens outside One Link), "n of m signed" until the last, then the trade is Active. */
export function GenerateContracts({ state = 'Approved', onOpen }) {
  const narrow = !useMinWidth(768);
  const generated = !['Approved', 'Generate contracts', 'Generating'].includes(state);
  const signedCount = state === 'Signed' ? 4 : state === '3 of 4 signed' ? 3 : 0;
  const rows = TW_GENERATED.map((c, i) => ({ ...c, signedOn: i < signedCount ? c.signed : '' }));
  const status = state === 'Signed' ? 'active' : 'approved';
  const signing = state === 'Record signature' || state === 'Recording';
  return (
    <Sections>
      <HmHead title="SYN4810" />
      <RecordHighlights kind="Trade" title="SYN4810" status={<TwStatus status={status} />} tabs={[]}
        actions={generated ? null : <Button size="small" loading={state === 'Generating'}>Generate contracts</Button>}
        fields={[{ label: 'Counterparty', value: 'Riverbend Milling', link: '#' }, { label: 'Commodity', value: <CommodityMarker commodity="maize">Maize</CommodityMarker> },
          { label: 'Quantity', value: '1,500 t' }, { label: 'Sale reference', value: 'SYN4810' }, { label: 'Approved by', value: 'T. Mwila' },
          ...(generated ? [{ label: 'Signed', value: `${signedCount} of 4 signed` }] : [])]} />
      {generated ? (
        <HmCard title="Contracts" count={rows.length} objects="contracts">
          <HmTable rows={rows} columns={[
            { key: 'id', label: 'Contract', width: '110px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
            { key: 'kind', label: 'Kind', width: '90px' }, { key: 'cp', label: 'Counterparty', width: 'minmax(150px, 1fr)', wrap: true },
            { key: 'quantity', label: 'Quantity (t)', width: '104px', align: 'right' }, { key: 'basis', label: 'Basis', width: '96px' },
            { key: 'price', label: 'Price (USD per t)', width: '130px', align: 'right' },
            { key: 'signedOn', label: 'Signed', width: '170px', render: (r) => (r.signedOn ? r.signedOn : <Button variant="outline" size="xsmall">Record signature</Button>) },
            { key: 'status', label: 'Status', width: '100px', render: (r) => <TwStatus status={r.signedOn ? 'active' : 'draft'} /> },
          ]} />
        </HmCard>
      ) : (
        <HmCard title="Purchase legs" count={3} objects="purchase legs"><TwLegsTable trade={TW_SYN4810} onOpen={onOpen} /></HmCard>
      )}
      {state === 'Generate contracts' || state === 'Generating' ? (
        <Dialog title="Generate contracts for SYN4810?" width={480} sheet={narrow} onClose={state === 'Generating' ? undefined : () => {}}
          footer={<><Button variant="ghost" size="small" disabled={state === 'Generating'}>Cancel</Button><Button size="small" loading={state === 'Generating'}>Generate contracts</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span>Under the reserved sale reference SYN4810, from approved version 2. Each contract starts as a draft.</span>
            <div style={{ margin: '0 -16px' }}>
              <HmTable rows={TW_GENERATED} columns={[
                { key: 'id', label: 'Contract', width: '110px' }, { key: 'kind', label: 'Kind', width: '90px' },
                { key: 'cp', label: 'Counterparty', width: 'minmax(150px, 1fr)', wrap: true }, { key: 'quantity', label: 'Quantity (t)', width: '104px', align: 'right' },
              ]} />
            </div>
          </div>
        </Dialog>
      ) : null}
      {signing ? (
        <Dialog title="Record signature, SYN4810-C" width={480} sheet={narrow} onClose={state === 'Recording' ? undefined : () => {}}
          footer={<><Button variant="ghost" size="small" disabled={state === 'Recording'}>Cancel</Button><Button size="small" loading={state === 'Recording'}>Save</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span>Mpongwe Valley Farms, 300 t. Signing happens outside One Link; this records that it did.</span>
            <Field label="Date signed" required><Input defaultValue="30 Sep 2026" disabled={state === 'Recording'} /></Field>
            <Field label="Signed copy"><div><Button variant="outline" size="small" icon="paperclip" disabled={state === 'Recording'}>Attach file</Button></div></Field>
          </div>
        </Dialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Contract list (list view, M6.TRD.13) */

/** The contract list (UX-07, AC 9): sales and purchases, the status and commodity on every row, filters and totals.
    A Warehouse viewer sees tonnes and statuses and cannot open a contract, so references are plain text (UX-01). */
export function ContractList({ state = 'All', onOpen }) {
  if (state === 'Loading') return <Sections><HmHead title="Contracts" /><div aria-busy="true" style={{ display: 'contents' }}><CardSkeleton /><CardSkeleton /></div></Sections>;
  const wheatBuys = state === 'Wheat purchases';
  const warehouse = state === 'Warehouse view';
  const rows = state === 'No match' ? [] : wheatBuys ? TW_CONTRACTS.filter((c) => c.kind === 'Purchase' && c.commodity === 'Wheat') : TW_CONTRACTS;
  const sum = (k) => rows.reduce((n, r) => n + Number(String(r[k]).replace(/,/g, '') || 0), 0).toLocaleString('en-US');
  const withTotal = rows.length ? [...rows, { id: 'total', total: true, quantity: sum('quantity'), delivered: sum('delivered'), left: sum('left') }] : rows;
  return (
    <Sections>
      <HmHead title="Contracts" count={rows.length} right={warehouse ? null : <><Button variant="outline" size="small" icon="download" loading={state === 'Exporting'}>Export</Button><Button size="small">New</Button></>} />
      <TwFilters view={wheatBuys ? 'Open contracts' : 'All open contracts'}>
        <Capsule chevron selected={wheatBuys}>{wheatBuys ? 'Kind: Purchase' : 'Kind'}</Capsule>
        <Capsule chevron selected={wheatBuys}>{wheatBuys ? 'Commodity: Wheat' : 'Commodity'}</Capsule>
        <Capsule chevron>Status</Capsule>
      </TwFilters>
      {rows.length ? (
        <Card padding={4}>
          <HmTable rows={withTotal} columns={[
            { key: 'id', label: 'Contract', width: '110px', render: (r) => (r.total ? <Text variant="body-3" strong>Total</Text> : <TwRef open={!warehouse} onOpen={() => onOpen && onOpen(r.id)}>{r.id}</TwRef>) },
            { key: 'kind', label: 'Kind', width: '90px' },
            { key: 'cp', label: 'Counterparty', width: 'minmax(150px, 1fr)', wrap: true },
            { key: 'commodity', label: 'Commodity', width: '110px', render: (r) => (r.total ? '' : <CommodityMarker commodity={r.marker}>{r.commodity}</CommodityMarker>) },
            { key: 'quantity', label: 'Quantity (t)', width: '104px', align: 'right', render: (r) => twStrong(r, r.quantity) },
            { key: 'delivered', label: 'Delivered (t)', width: '110px', align: 'right', render: (r) => twStrong(r, r.delivered) },
            { key: 'left', label: 'Left (t)', width: '84px', align: 'right', render: (r) => twStrong(r, r.left) },
            { key: 'cover', label: 'Cover (t)', width: '120px', align: 'right' },
            { key: 'status', label: 'Status', width: '160px', render: (r) => (r.total ? '' : <TwStatus status={r.status} />) },
          ]} />
        </Card>
      ) : <Card><EmptyState title="No contracts to display." /></Card>}
    </Sections>
  );
}
