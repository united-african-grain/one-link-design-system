/** Inbound (M4.DS.01, UAG-53; S12 C2, C3, C6, S08 J5, canvases S13 and S09): the New goods received note form for
    grain and fertiliser, the goods received note record page in every state a later M4 card needs, the load an
    approver opens to decide a variance hold, the over-delivery notice, and the Clerk's Warehouse stock. Every screen
    takes `state`, one of its INBOUND_STATES entry, so the kit's index and the screenshot review open any state with
    ?screen=&state=.

    The Clerk sees no price, value or margin anywhere (UX-10): his gate purchase shows the field Gate price with only
    its status. A weight's source is the labelled field Source and counterparty agreement is the separate field
    Counterparty status. A held note names who acts next as the field Waiting for. The approver's choices are data
    (DecisionActions): Release hold, or Reject with a mandatory comment naming the follow-up. Every save, finalise,
    decide and acknowledge button draws its working state. Fictional sample data only: SYN4702 (delivered basis),
    SYN4790 (collected basis), Lakeview Farms Ltd, Cameron Estates, Riverbend Milling, Chisamba Shed, Mpongwe Depot;
    people are T. Mwila (owner), J. Tembo (trading), S. Banda (clerk) and R. Daka (stock control). */

export const INBOUND_STATES = {
  NewGoodsReceivedNote: ['Grain', 'Grain, beyond tolerance', 'Grain, tally in bags', 'Fertiliser', 'Fertiliser, count short', 'Gate purchase', 'Transfer', 'Saving draft', 'Finalising'],
  GoodsReceivedNote: ['Booked', 'On hold', 'Escalated', 'Returned', 'Re-finalising', 'Weight dispute', 'Re-weigh slip', 'Gate purchase', 'Gate purchase, valued', 'Over-delivery', 'Related', 'History'],
  LoadOnHold: ['On hold', 'Reject', 'Rejecting', 'Rejected', 'Releasing', 'Released', 'Escalated'],
  OverDeliveryNotice: ['Open', 'Acknowledge', 'Acknowledging', 'Acknowledged', 'Stock control'],
  WarehouseStock: ['All', 'Exporting', 'Empty'],
};

/** Where an inbound screen sits: whose frame (the Clerk's, the owner's or stock control's), the module the navigation
    highlights (Logistics or Inventory on record and form pages, never Home, UX-04) and the breadcrumb. */
export function inboundFrame(screen, state) {
  const grn = ['Logistics', 'Goods received notes'];
  if (screen === 'NewGoodsReceivedNote') return { who: 'clerk', module: 'logistics', section: 'received', breadcrumb: [...grn, 'New'] };
  if (screen === 'GoodsReceivedNote' && state === 'Gate purchase, valued') return { who: 'owner', module: 'warehouse', breadcrumb: ['Warehouse', 'Goods received notes', 'GRN10000384'] };
  if (screen === 'GoodsReceivedNote') return { who: 'clerk', module: 'logistics', section: 'received', breadcrumb: [...grn, inGrnFor(state).ref] };
  if (screen === 'LoadOnHold') return { who: 'owner', module: 'warehouse', breadcrumb: ['Warehouse', 'Loads', 'ABZ 4501'] };
  if (screen === 'OverDeliveryNotice') return state === 'Stock control'
    ? { who: 'stock', module: 'inventory', breadcrumb: ['Inventory', 'Over-delivery notices', 'SYN4790 leg A'] }
    : { who: 'owner', module: 'trade', breadcrumb: ['Trade Desk', 'Over-delivery notices', 'SYN4790 leg A'] };
  return { who: 'clerk', module: 'inventory', breadcrumb: ['Inventory', 'Warehouse stock'] };
}

const IN_APPROVERS = 'T. Mwila or J. Tembo';
const inNarrow = () => !useMinWidth(768);

/** Content beside a 320px side column (the Reconcile card) from 1024px; below that, one column with the side after. */
function InSide({ side, children }) {
  const two = useMinWidth(1024);
  if (!two) return <Sections>{children}{side}</Sections>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 'var(--card-gap)', alignItems: 'start' }}>
      <Sections>{children}</Sections>
      <Sections>{side}</Sections>
    </div>
  );
}

/** A form grid of fields: labels above inputs (UX-21), as many columns as fit. */
function InFields({ children, min = 200 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: 16 }}>{children}</div>;
}

/** A step of an approval, an icon and a word (S57 records with approval). */
const IN_STEP = {
  submitted: <StatusMark kind="clean" label="Submitted" size="body-4" />,
  pending: <StatusMark kind="pending" label="Pending approval" size="body-4" />,
  approved: <StatusMark kind="clean" label="Approved" size="body-4" />,
  rejected: <StatusMark kind="breach" label="Rejected" size="body-4" />,
};
/** A goods received note's status (S12, settled in the Clerk batch): Draft, On hold, Returned, Booked. */
const IN_GRN_STATUS = {
  booked: <StatusMark kind="clean" label="Booked" size="body-4" />,
  'on-hold': <StatusMark kind="attention" label="On hold" size="body-4" />,
  returned: <StatusMark kind="breach" label="Returned" size="body-4" />,
  draft: <StatusMark kind="neutral" label="Draft" size="body-4" />,
};
const IN_RESULT = (word) => <StatusMark kind="clean" label={word} size="body-4" />;

/** The Decision card: each step of the variance decision with who it is assigned to, its status, its date and the
    comment, so a returned note says what to do next in the approver's own words. */
function InDecision({ rows }) {
  return (
    <WbTable title="Decision" count={rows.length} objects="steps" columns={[
      { key: 'step', label: 'Step', width: '180px' }, { key: 'who', label: 'Assigned to', width: '150px' },
      { key: 'status', label: 'Status', width: '140px', render: (r) => IN_STEP[r.status] },
      { key: 'date', label: 'Date (CAT)', width: '150px', tabular: true }, { key: 'comment', label: 'Comment' },
    ]} rows={rows} />
  );
}

/* ------------------------------------------------------------------ New goods received note (CS-CLERK-04, CS-CLERK-05) */

const IN_GRAIN_LINES = [
  { id: 'l1', line: '1', commodity: 'Wheat', grade: 'Grade 1', shed: 'Shed A', stack: 'A1', owner: 'Own', weight: '32.060' },
];
const IN_GRAIN_LINES_HELD = [
  { id: 'l1', line: '1', commodity: 'Wheat', grade: 'Grade 1', shed: 'Shed A', stack: 'A2', owner: 'Own', weight: '20.000' },
  { id: 'l2', line: '2', commodity: 'Wheat', grade: 'Grade 2', shed: 'Shed A', stack: 'A2', owner: 'Own', weight: '11.700' },
];

/** The grain lines as inputs: commodity, grade, shed, stack, owner and weight, and + Add line (UX-21). */
function InGrainLines({ lines, disabled, total, target }) {
  const narrow = inNarrow();
  const sel = (options, value) => <Select options={options} defaultValue={value} disabled={disabled} />;
  return (
    <Card gap={8} title={<>Lines <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 8 }}><Count>{lines.length}</Count></span></>}>
      <div style={{ margin: '0 -16px' }}>
        <DataTable rowKey="id" minWidth={narrow ? 900 : 790} rows={lines} columns={[
          { key: 'line', label: 'Line', width: '52px' },
          { key: 'commodity', label: 'Commodity', width: 'minmax(124px, 1fr)', render: (r) => sel(['Wheat', 'Maize', 'Soya'], r.commodity) },
          { key: 'grade', label: 'Grade', width: '132px', render: (r) => sel(['Grade 1', 'Grade 2', 'Grade 3'], r.grade) },
          { key: 'shed', label: 'Shed', width: '124px', render: (r) => sel(['Shed A', 'Shed B'], r.shed) },
          { key: 'stack', label: 'Stack', width: '96px', render: (r) => sel(['A1', 'A2', 'A3', 'A4'], r.stack) },
          { key: 'owner', label: 'Owner', width: 'minmax(140px, 1fr)', render: (r) => sel(['Own', 'Riverbend Milling'], r.owner) },
          { key: 'weight', label: 'Weight (t)', width: '116px', align: 'right', render: (r) => <Input align="right" defaultValue={r.weight} disabled={disabled} /> },
        ]} />
      </div>
      <div><Button variant="outline" size="small" icon="plus" disabled={disabled}>Add line</Button></div>
      <RunningSum total={total} target={target} tolerance="0.080" />
    </Card>
  );
}

const IN_FERT_LINES = [
  { id: 'f1', product: 'Urea', commodity: 'fertilizer', pack: '50 kg bag', packWeight: '50.10', count: '600', expected: '30.060', shed: 'Shed B', bay: 'B1', owner: 'Own' },
];

export function NewGoodsReceivedNote({ state = 'Grain' }) {
  const saving = state === 'Saving draft';
  const finalising = state === 'Finalising';
  const busy = saving || finalising;
  const fert = state.startsWith('Fertiliser');
  const short = state === 'Fertiliser, count short';
  const gate = state === 'Gate purchase';
  const transfer = state === 'Transfer';
  const beyond = state === 'Grain, beyond tolerance';
  const bags = state === 'Grain, tally in bags';
  const ticket = fert ? { ref: 'WBT10001608', truck: 'BCA 2210', net: '30.060', status: 'confirmed' }
    : gate ? { ref: 'WBT10001609', truck: 'ALB 7714', net: '8.420', status: 'pending' }
    : transfer ? { ref: 'WBT10001617', truck: 'BCA 2214', net: '29.950', status: 'confirmed' }
    : beyond ? { ref: 'WBT10001597', truck: 'ABZ 4501', net: '32.140', status: 'pending' }
    : { ref: 'WBT10001606', truck: 'ABZ 4412', net: '32.140', status: 'pending' };
  const lines = beyond ? IN_GRAIN_LINES_HELD
    : gate ? [{ id: 'l1', line: '1', commodity: 'Maize', grade: 'Grade 1', shed: 'Shed A', stack: 'A3', owner: 'Own', weight: '8.420' }]
    : transfer ? [{ id: 'l1', line: '1', commodity: 'Maize', grade: 'Grade 1', shed: 'Shed A', stack: 'A3', owner: 'Own', weight: '29.950' }]
    : IN_GRAIN_LINES;
  const linesTotal = beyond ? '31.700' : gate ? '8.420' : transfer ? '29.950' : '32.060';
  const tally = beyond ? '31.700' : gate ? '8.420' : transfer ? '29.950' : bags ? '32.050' : '32.060';
  const head = (
    <WbHead title="New goods received note" right={<>
      <Button variant="outline" size="small" loading={saving} disabled={finalising}>Save draft</Button>
      <Button size="small" loading={finalising} disabled={saving}>Finalise</Button>
    </>} />
  );
  const ticketCard = (
    <Card title="Ticket">
      <WbFacts min={130} fields={[
        ['Ticket', <RefCell>{ticket.ref}</RefCell>], ['Truck', ticket.truck], ['Net', `${ticket.net} t`],
        ['Source', 'Weighbridge'], ['Counterparty status', <ConfirmationChip kind={ticket.status} />],
      ]} />
    </Card>
  );
  const delivery = (
    <Card title="Delivery details">
      <InFields>
        {fert ? <>
          <Field label="Receipt type" required><Select options={['Supplier delivery', 'Purchase contract leg', 'Gate purchase', 'Transfer']} defaultValue="Supplier delivery" disabled={busy} /></Field>
          <Field label="On the road" required><Select options={['Beira dispatch, truck BCA 2210', 'Beira dispatch, truck BCA 2211']} disabled={busy} /></Field>
          <Field label="Dispatched"><span style={{ ...textStyle('body-3', { tabular: true }), lineHeight: '32px' }}>22 Sep 2026</span></Field>
          <Field label="Vehicle"><span style={{ ...textStyle('body-3'), lineHeight: '32px' }}>BCA 2210</span></Field>
        </> : gate ? <>
          <Field label="Receipt type" required><Select options={['Gate purchase', 'Purchase contract leg', 'Transfer']} defaultValue="Gate purchase" disabled={busy} /></Field>
          <Field label="Seller" required><Input defaultValue="Chongwe Growers" disabled={busy} /></Field>
          <Field label="Vehicle"><span style={{ ...textStyle('body-3'), lineHeight: '32px' }}>ALB 7714</span></Field>
        </> : transfer ? <>
          <Field label="Receipt type" required><Select options={['Transfer', 'Purchase contract leg', 'Gate purchase']} defaultValue="Transfer" disabled={busy} /></Field>
          <Field label="From" required><Select options={['Mpongwe Depot']} disabled={busy} /></Field>
          <Field label="Leg"><span style={{ lineHeight: '32px' }}><RefCell>LEG-5103</RefCell></span></Field>
          <Field label="Vehicle"><span style={{ ...textStyle('body-3'), lineHeight: '32px' }}>BCA 2214</span></Field>
        </> : <>
          <Field label="Receipt type" required><Select options={['Purchase contract leg', 'Gate purchase', 'Transfer']} defaultValue="Purchase contract leg" disabled={busy} /></Field>
          <Field label="Supplier" required><Select options={['Lakeview Farms Ltd', 'Cameron Estates']} defaultValue={beyond ? 'Cameron Estates' : 'Lakeview Farms Ltd'} disabled={busy} /></Field>
          <Field label="Contract leg" required><Select options={beyond ? ['SYN4702 leg B'] : ['SYN4702 leg C', 'SYN4702 leg B']} disabled={busy} /></Field>
          <Field label="Basis"><span style={{ ...textStyle('body-3'), lineHeight: '32px' }}>Delivered</span></Field>
          <Field label="Vehicle"><span style={{ ...textStyle('body-3'), lineHeight: '32px' }}>{ticket.truck}</span></Field>
        </>}
      </InFields>
    </Card>
  );
  if (fert) {
    const count = short ? '598' : '600';
    const expected = short ? '29.960' : '30.060';
    const rows = [{ ...IN_FERT_LINES[0], count, expected }, { id: 'total', total: true, product: 'Total', count, expected }];
    const linesCard = (
      <Card gap={8} title={<>Lines <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 8 }}><Count>1</Count></span></>}>
        <div style={{ margin: '0 -16px' }}>
          <DataTable rowKey="id" minWidth={860} rows={rows} columns={[
            { key: 'product', label: 'Product', width: 'minmax(120px, 1fr)', render: (r) => (r.total ? <Text variant="body-3" strong>Total</Text> : <CommodityMarker commodity="fertilizer">{r.product}</CommodityMarker>) },
            { key: 'pack', label: 'Pack', width: '110px' },
            { key: 'packWeight', label: 'Pack weight incl. packaging (kg)', width: '150px', align: 'right' },
            { key: 'count', label: 'Count (bags)', width: '120px', align: 'right', render: (r) => (r.total ? wbStrong(r, r.count) : <Input align="right" defaultValue={r.count} disabled={busy} />) },
            { key: 'expected', label: 'Expected (t)', width: '110px', align: 'right', render: (r) => wbStrong(r, r.expected) },
            { key: 'shed', label: 'Shed', width: '80px' }, { key: 'bay', label: 'Bay', width: '60px' },
            { key: 'owner', label: 'Owner', width: '90px' },
          ]} />
        </div>
        <div><Button variant="outline" size="small" icon="plus" disabled={busy}>Add line</Button></div>
        <RunningSum label="Expected from count" total={expected} target="30.060" targetLabel="Ticket net" tolerance="0" />
      </Card>
    );
    const reconcile = (
      <ReconcileCard outcome={short ? 'beyond' : 'within'} rows={[
        { label: 'Ticket net', value: '30.060 t' }, { label: 'Expected from count', value: `${expected} t` },
        { label: 'Variance', value: short ? '0.100 t' : '0.000 t', strong: true }, { label: 'Tolerance, bagged', value: '0.000 t' },
        { label: 'Bags counted', value: count },
      ]} />
    );
    return <Sections>{head}<InSide side={reconcile}>{ticketCard}{delivery}{linesCard}</InSide></Sections>;
  }
  const tallyCard = (
    <Card title="Offload tally">
      <InFields min={180}>
        {bags ? <>
          <Field label="Bags offloaded at stack" required><Input align="right" defaultValue="641" disabled={busy} /></Field>
          <WbFacts min={140} fields={[['Pack net weight', '50.00 kg'], ['Offloaded at stack', '32.050 t']]} />
        </> : <Field label="Offloaded at stack (t)" required style={{ maxWidth: 260 }}><Input align="right" defaultValue={tally} disabled={busy} /></Field>}
      </InFields>
    </Card>
  );
  const reconcile = (
    <ThreeWayReconcile tolerance="0.080" extra={bags ? [{ label: 'Bags offloaded', value: '641' }] : []} figures={[
      { label: 'Ticket net', value: ticket.net }, { label: 'Lines total', value: linesTotal }, { label: 'Offload tally', value: tally },
    ]} />
  );
  return (
    <Sections>
      {head}
      <InSide side={reconcile}>{ticketCard}{delivery}<InGrainLines lines={lines} disabled={busy} total={linesTotal} target={ticket.net} />{tallyCard}</InSide>
    </Sections>
  );
}

/* ------------------------------------------------------------------ Goods received note record page */

/** The note each state draws: the booked note (clerk__06), the held note (clerk__07), the gate purchase (clerk__08),
    a note returned for correction, a weight dispute, and an over-delivery. */
function inGrnFor(state) {
  if (state === 'Gate purchase' || state === 'Gate purchase, valued') return { ref: 'GRN10000384', status: 'booked' };
  if (state === 'Over-delivery') return { ref: 'GRN10000386', status: 'booked' };
  if (state === 'Returned' || state === 'Re-finalising') return { ref: 'GRN10000375', status: 'returned' };
  if (state === 'Weight dispute' || state === 'Re-weigh slip') return { ref: 'GRN10000379', status: 'on-hold' };
  if (state === 'On hold' || state === 'Escalated') return { ref: 'GRN10000377', status: 'on-hold' };
  return { ref: 'GRN10000382', status: 'booked' };
}

const IN_GRN_HISTORY = [
  { id: 'g3', field: 'Status', user: 'S. Banda', old: 'Draft', next: 'Booked', date: '26 Sep 2026, 07:52', reason: 'Finalised within tolerance' },
  { id: 'g2', field: 'Offload tally (t)', user: 'S. Banda', old: '', next: '32.060', date: '26 Sep 2026, 07:50', reason: '' },
  { id: 'g1', field: 'Status', user: 'S. Banda', old: '', next: 'Draft', date: '26 Sep 2026, 07:41', reason: 'Received from WBT10001606' },
];

/** The lines of a note as read-only rows with their Total on a grey band (UX-26). */
function InLinesTable({ title = 'Lines', lines }) {
  const sum = lines.reduce((n, l) => n + thousandths(l.weight), 0);
  const rows = [...lines, { id: 'total', total: true, line: 'Total', weight: tonnes(sum) }];
  return (
    <WbTable title={title} count={lines.length} objects="lines" columns={[
      { key: 'line', label: 'Line', width: '70px', render: (r) => wbStrong(r, r.line) },
      { key: 'commodity', label: 'Commodity', width: '130px', render: (r) => (r.total ? '' : <CommodityMarker commodity={r.commodity.toLowerCase()}>{r.commodity}</CommodityMarker>) },
      { key: 'grade', label: 'Grade', width: '100px' }, { key: 'shed', label: 'Shed', width: '90px' },
      { key: 'stack', label: 'Stack', width: '80px' }, { key: 'owner', label: 'Owner', width: '110px' },
      { key: 'weight', label: 'Weight (t)', width: '110px', align: 'right', render: (r) => wbStrong(r, r.weight) },
    ]} rows={rows} />
  );
}

export function GoodsReceivedNote({ state = 'Booked' }) {
  const initial = state === 'History' ? 'History' : state === 'Related' ? 'Related' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const g = inGrnFor(state);
  const held = state === 'On hold' || state === 'Escalated';
  const escalated = state === 'Escalated';
  const returned = state === 'Returned' || state === 'Re-finalising';
  const dispute = state === 'Weight dispute' || state === 'Re-weigh slip';
  const slipIn = state === 'Re-weigh slip';
  const gate = state === 'Gate purchase' || state === 'Gate purchase, valued';
  const valued = state === 'Gate purchase, valued';
  const over = state === 'Over-delivery';
  const status = IN_GRN_STATUS[g.status];

  // The highlights: four to six key fields (UX-19). The Clerk cannot open a contract or a counterparty, so the
  // supplier and the contract leg are plain text for him (UX-01); the ticket is a link. Who acts next is Waiting for.
  let fields;
  if (gate) {
    fields = [
      { label: 'Receipt type', value: 'Gate purchase' },
      valued ? { label: 'Seller', value: 'Chongwe Growers', link: '#' } : { label: 'Seller', value: 'Chongwe Growers' },
      valued ? { label: 'Trade', value: 'GP-0012', link: '#' } : { label: 'Trade', value: 'GP-0012' },
      { label: 'Ticket', value: 'WBT10001609', link: '#' }, { label: 'Received', value: '8.420 t' },
      // The Clerk sees the field Gate price with its status only, never an amount (UX-10, INC-27). Valued, for a viewer
      // with the price tier, it is the unit price in ZMW per t and the value it gave (UX-11, Map D-38).
      { label: 'Gate price', value: valued ? 'ZMW 6,800.00 per t' : <StatusMark kind="attention" label="Awaiting gate price" size="body-4" /> },
      ...(valued ? [{ label: 'Value', value: 'ZMW 57,256.00' }] : []),
    ];
  } else if (over) {
    fields = [{ label: 'Supplier', value: 'Cameron Estates' }, { label: 'Contract leg', value: 'SYN4790 leg A' }, { label: 'Basis', value: 'Collected' },
      { label: 'Ticket', value: 'WBT10001608', link: '#' }, { label: 'Received', value: '30.060 t' }, { label: 'Over-delivery', value: '10.060 t' }];
  } else if (held || dispute) {
    fields = [{ label: 'Supplier', value: 'Cameron Estates' }, { label: 'Contract leg', value: 'SYN4702 leg B' }, { label: 'Basis', value: 'Delivered' },
      { label: 'Truck', value: 'ABZ 4501' }, { label: 'Net', value: '32.140 t' }, { label: 'Lines total', value: '31.700 t' },
      { label: 'Waiting for', value: escalated ? 'T. Mwila' : IN_APPROVERS }];
  } else if (returned) {
    fields = [{ label: 'Supplier', value: 'Lakeview Farms Ltd' }, { label: 'Contract leg', value: 'SYN4702 leg C' }, { label: 'Basis', value: 'Delivered' },
      { label: 'Ticket', value: 'WBT10001602', link: '#' }, { label: 'Net', value: '31.880 t' }, { label: 'Waiting for', value: 'S. Banda' }];
  } else {
    fields = [{ label: 'Supplier', value: 'Lakeview Farms Ltd' }, { label: 'Contract leg', value: 'SYN4702 leg C' }, { label: 'Basis', value: 'Delivered' },
      { label: 'Ticket', value: 'WBT10001606', link: '#' }, { label: 'Net', value: '32.140 t' }, { label: 'Received', value: '32.060 t' }];
  }
  const actions = returned ? <Button size="small" loading={state === 'Re-finalising'}>Finalise</Button>
    : state === 'Weight dispute' ? <Button variant="outline" size="small" icon="scan-line">Scan slip</Button> : null;

  const heldReconcile = (net = '32.140') => (
    <ThreeWayReconcile tolerance="0.080" figures={[{ label: 'Ticket net', value: net }, { label: 'Lines total', value: '31.700' }, { label: 'Offload tally', value: '31.700' }]} />
  );

  let details;
  if (gate || over || state === 'Booked') {
    const results = gate ? [
      { id: 'r1', result: 'Stock movement', detail: 'Maize grade 1, +8.420 t, Shed A, stack A3', status: IN_RESULT('Posted') },
      { id: 'r2', result: 'Trade', detail: 'GP-0012 created for Chongwe Growers, 8.420 t', status: IN_RESULT('Created') },
      ...(valued ? [{ id: 'r3', result: 'Value', detail: 'Valued at the first gate price approved after receipt, 26 Sep 2026, 09:12', status: IN_RESULT('Posted') }] : []),
    ] : over ? [
      { id: 'r1', result: 'Stock movement', detail: 'Maize grade 1, +30.060 t, Shed A, stack A3', status: IN_RESULT('Posted') },
      { id: 'r2', result: 'Contract leg delivery', detail: 'SYN4790 leg A: 1,010.060 t of 1,000.000 t delivered, 0.000 t left, over-delivered 10.060 t', status: IN_RESULT('Recorded') },
      { id: 'r3', result: 'Over-delivery notice', detail: 'Sent to Owner, Trading and Stock control', status: IN_RESULT('Sent') },
    ] : [
      { id: 'r1', result: 'Stock movement', detail: 'Wheat grade 1, +32.060 t, Shed A, stack A1', status: IN_RESULT('Posted') },
      { id: 'r2', result: 'Contract leg delivery', detail: 'SYN4702 leg C: 432.060 t of 700.000 t delivered, 267.940 t left', status: IN_RESULT('Recorded') },
      { id: 'r3', result: 'Grade notice', detail: 'Sent to Lakeview Farms Ltd, 26 Sep 2026, 07:52', status: IN_RESULT('Sent') },
    ];
    const lines = gate ? [{ id: 'l1', line: '1', commodity: 'Maize', grade: 'Grade 1', shed: 'Shed A', stack: 'A3', owner: 'Own', weight: '8.420' }]
      : over ? [{ id: 'l1', line: '1', commodity: 'Maize', grade: 'Grade 1', shed: 'Shed A', stack: 'A3', owner: 'Own', weight: '30.060' }] : IN_GRAIN_LINES;
    details = <>
      {over ? <ConditionBanner>SYN4790 leg A is over-delivered by 10.060 t. The full tonnage is booked.</ConditionBanner> : null}
      <WbTable title="Results" count={results.length} objects="results" columns={[
        { key: 'result', label: 'Result', width: '200px' }, { key: 'detail', label: 'Detail' }, { key: 'status', label: 'Status', width: '140px', render: (r) => r.status },
      ]} rows={results} />
      <InLinesTable lines={lines} />
      <Card title="Goods received note information">
        <WbFacts fields={[['Source', 'Weighbridge'], ['Counterparty status', <ConfirmationChip kind={gate ? 'pending' : 'confirmed'} />], ['Site', 'Chisamba Shed'],
          ['Vehicle', gate ? 'ALB 7714' : over ? 'BCA 2210' : 'ABZ 4412'], ['Finalised', gate ? '26 Sep 2026, 08:31' : over ? '26 Sep 2026, 08:05' : '26 Sep 2026, 07:52'], ['Finalised by', 'S. Banda']]} />
      </Card>
    </>;
  } else if (held) {
    const rows = [
      { id: 'd1', step: 'Finalised beyond tolerance', who: 'S. Banda', status: 'submitted', date: '26 Sep 2026, 06:48', comment: '' },
      { id: 'd2', step: 'Variance decision', who: escalated ? 'T. Mwila' : IN_APPROVERS, status: 'pending', date: '', comment: '' },
      ...(escalated ? [{ id: 'd3', step: 'Escalated after 24 hours', who: 'T. Mwila', status: 'pending', date: '27 Sep 2026, 06:48', comment: '' }] : []),
    ];
    details = <InSide side={heldReconcile()}><InDecision rows={rows} /><InLinesTable lines={IN_GRAIN_LINES_HELD} /></InSide>;
  } else if (returned) {
    const rows = [
      { id: 'd1', step: 'Finalised beyond tolerance', who: 'S. Banda', status: 'submitted', date: '26 Sep 2026, 07:10', comment: '' },
      { id: 'd2', step: 'Variance decision', who: 'T. Mwila', status: 'rejected', date: '26 Sep 2026, 08:10', comment: 'Correct lines: line 2 is grade 1, stack A3. Count the tally again.' },
    ];
    const asFinalised = [
      { id: 'l1', line: '1', commodity: 'Maize', grade: 'Grade 1', shed: 'Shed A', stack: 'A3', owner: 'Own', weight: '20.000' },
      { id: 'l2', line: '2', commodity: 'Maize', grade: 'Grade 2', shed: 'Shed A', stack: 'A2', owner: 'Own', weight: '11.300' },
    ];
    const corrected = [
      { id: 'l1', line: '1', commodity: 'Maize', grade: 'Grade 1', shed: 'Shed A', stack: 'A3', owner: 'Own', weight: '20.000' },
      { id: 'l2', line: '2', commodity: 'Maize', grade: 'Grade 1', shed: 'Shed A', stack: 'A3', owner: 'Own', weight: '11.860' },
    ];
    const busy = state === 'Re-finalising';
    const side = (
      <ThreeWayReconcile tolerance="0.080" figures={[{ label: 'Ticket net', value: '31.880' }, { label: 'Lines total', value: '31.860' }, { label: 'Offload tally', value: '31.860' }]} />
    );
    details = <InSide side={side}>
      <InDecision rows={rows} />
      <InLinesTable title="Lines as finalised" lines={asFinalised} />
      <InGrainLines lines={corrected} disabled={busy} total="31.860" target="31.880" />
      <Card title="Correction">
        <InFields>
          <Field label="Offloaded at stack (t)" required><Input align="right" defaultValue="31.860" disabled={busy} /></Field>
          <Field label="Reason" required><Input multiline defaultValue="Line 2 re-graded and re-stacked; tally counted again" disabled={busy} /></Field>
        </InFields>
      </Card>
    </InSide>;
  } else {
    // Weight dispute: the approver's Reject named a re-weigh. The supplier disputes the bridge's weight (Counterparty
    // status Disputed, apart from Source), and the case is decided by Owen or Jacques on the re-weigh slip (D-46).
    const rows = [
      { id: 'd1', step: 'Variance decision', who: 'J. Tembo', status: 'rejected', date: '26 Sep 2026, 09:30', comment: 'Re-weigh at Mpongwe Depot: the supplier disputes the bridge weight.' },
      { id: 'd2', step: 'Weight dispute', who: IN_APPROVERS, status: 'pending', date: '', comment: '' },
    ];
    const slip = slipIn ? (
      <Card title="Re-weigh slip">
        <WbFacts min={140} fields={[['Gross', '45.880 t'], ['Tare', '14.160 t'], ['Net', '31.720 t'], ['Source', 'Scanned slip'], ['Weighed', '26 Sep 2026, 11:40 CAT'], ['Weighbridge', 'Mpongwe Depot']]} />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><EvidenceTile kind="receipt" caption="reweigh-slip-mpongwe-grn10000379" time="11:42" /></div>
      </Card>
    ) : (
      <Card title="Re-weigh slip" headerRight={<ReadinessChip kind="pending-reading" />}>
        <span style={textStyle('body-3', { tone: 'secondary' })}>No re-weigh slip yet.</span>
      </Card>
    );
    details = <InSide side={heldReconcile(slipIn ? '31.720' : '32.140')}>
      <InDecision rows={rows} />
      {slip}
      <Card title="Weighbridge ticket">
        <WbFacts min={140} fields={[['Ticket', <RefCell>WBT10001601</RefCell>], ['Net', '32.140 t'], ['Source', 'Weighbridge'], ['Counterparty status', <ConfirmationChip kind="disputed" />]]} />
      </Card>
      <InLinesTable lines={IN_GRAIN_LINES_HELD.map((l) => ({ ...l, commodity: 'Maize' }))} />
    </InSide>;
  }

  return (
    <Sections>
      <WbHead title={g.ref} />
      {returned ? <ConditionBanner>Returned by T. Mwila, 26 Sep 2026, 08:10 CAT. Correct lines and finalise again.</ConditionBanner> : null}
      {escalated ? <ConditionBanner>Waiting over 24 hours. Escalated to T. Mwila.</ConditionBanner> : null}
      <RecordHighlights kind="Goods received note" title={g.ref} status={status} actions={actions} fields={fields} tab={tab} onTab={setTab} />
      {tab === 'History' ? (
        <WbTable title="History" count={IN_GRN_HISTORY.length} objects="changes" columns={[
          { key: 'field', label: 'Field', width: '170px' }, { key: 'user', label: 'User', width: '120px' },
          { key: 'old', label: 'Old value', width: '120px' }, { key: 'next', label: 'New value', width: '120px' },
          { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true }, { key: 'reason', label: 'Reason' },
        ]} rows={IN_GRN_HISTORY} />
      ) : tab === 'Related' ? (
        <WbTable title="Weighbridge tickets" count={1} objects="weighbridge tickets" columns={[
          { key: 'ref', label: 'Ticket', width: '140px', render: (r) => <RefCell>{r.ref}</RefCell> }, { key: 'truck', label: 'Truck', width: '110px' },
          { key: 'net', label: 'Net (t)', width: '100px', align: 'right' }, { key: 'source', label: 'Source', width: '130px' },
          { key: 'status', label: 'Status', render: () => <ReadinessChip kind="received" /> },
        ]} rows={[{ id: 'r1', ref: 'WBT10001606', truck: 'ABZ 4412', net: '32.140', source: 'Weighbridge' }]} />
      ) : details}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Load on hold: the approver decides (owen-1 15, S08 J5) */

/** The approver's choices on a variance hold (S08 J5): Release hold, or Reject with a mandatory comment that names the
    follow-up (correct lines, re-weigh or cancel the receipt). Data, so a later card adds an outcome without a redraw. */
export const VARIANCE_HOLD_OUTCOMES = [
  { value: 'reject', label: 'Reject', variant: 'critical', comment: true },
  { value: 'release', label: 'Release hold', variant: 'primary' },
];

export function LoadOnHold({ state = 'On hold' }) {
  const narrow = inNarrow();
  const [tab, setTab] = useState('Details');
  const released = state === 'Released';
  const rejected = state === 'Rejected';
  const escalated = state === 'Escalated';
  const decided = released || rejected;
  const busy = state === 'Releasing' ? 'release' : state === 'Rejecting' ? 'reject' : null;
  const status = released ? <StatusMark kind="clean" label="Delivered" size="body-4" /> : <StatusMark kind="attention" label="On hold" size="body-4" />;
  const decision = released ? { what: 'Release hold', note: '', moved: '+31.700 t to Shed A, stack A2' }
    : rejected ? { what: 'Reject', note: 'Re-weigh at Mpongwe Depot: the supplier disputes the bridge weight.', moved: 'None. Returned to S. Banda.' } : null;
  return (
    <Sections>
      <WbHead title="ABZ 4501" />
      {escalated ? <ConditionBanner>Waiting over 24 hours. Escalated to T. Mwila.</ConditionBanner> : null}
      <RecordHighlights kind="Load" title="ABZ 4501" status={status} tab={tab} onTab={setTab}
        actions={decided ? null : <DecisionActions outcomes={VARIANCE_HOLD_OUTCOMES} busy={busy} />}
        fields={[{ label: 'Site', value: 'Chisamba Shed' }, { label: 'Supplier', value: 'Cameron Estates', link: '#' }, { label: 'Contract', value: 'SYN4702 leg B', link: '#' },
          { label: 'Basis', value: 'Delivered' }, { label: 'Commodity', value: <CommodityMarker commodity="wheat">Wheat</CommodityMarker> },
          { label: 'Variance', value: '0.440 t' }, { label: 'Value on hold', value: 'USD 9,015.48' }]} />
      {decision ? (
        <Card title="Decision">
          <WbFacts min={160} fields={[['Decision', decision.what], ['Decided by', 'T. Mwila'], ['Decided', '26 Sep 2026, 09:02 CAT'], ['Stock moved', decision.moved], ...(decision.note ? [['Comment', decision.note]] : [])]} />
        </Card>
      ) : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
        <Sections>
          <Card title="Weighbridge ticket">
            <WbFacts min={140} fields={[['Ticket', <RefCell>WBT10001597</RefCell>], ['Source', 'Weighbridge'], ['Gross', '46.280 t'], ['Tare', '14.140 t'], ['Net', '32.140 t'], ['Weighed', '26 Sep 2026, 06:41'], ['Counterparty status', <ConfirmationChip kind="pending" />]]} />
          </Card>
          <Card title="Variance">
            <WbFacts min={140} fields={[['Ticket net', '32.140 t'], ['Lines total', '31.700 t'], ['Offload tally', '31.700 t'], ['Variance', '0.440 t'], ['Tolerance', '0.080 t'],
              ['Status', released ? <StatusMark kind="clean" label="Released" size="body-4" /> : <StatusMark kind="attention" label="On hold" size="body-4" />], ['On hold since', '26 Sep 2026, 06:48'], ['Goods received note', <RefCell>GRN10000377</RefCell>]]} />
          </Card>
        </Sections>
        <InLinesTable title="GRN lines" lines={IN_GRAIN_LINES_HELD} />
      </div>
      {state === 'Reject' || state === 'Rejecting' ? (
        <ReasonDialog title="Reject ABZ 4501?" label="Comment" minLength={1} confirmLabel="Reject" confirmVariant="critical" busy={state === 'Rejecting'} sheet={narrow}
          defaultReason={state === 'Rejecting' ? 'Re-weigh at Mpongwe Depot: the supplier disputes the bridge weight.' : ''}>
          GRN10000377, variance 0.440 t. The load stays on hold and returns to S. Banda. Name the follow-up: correct lines, re-weigh or cancel the receipt.
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Over-delivery notice (M4.GRN.03) */

export function OverDeliveryNotice({ state = 'Open' }) {
  const narrow = inNarrow();
  const [tab, setTab] = useState('Details');
  const stock = state === 'Stock control';
  const acknowledged = state === 'Acknowledged';
  const dialog = state === 'Acknowledge' || state === 'Acknowledging';
  const busy = state === 'Acknowledging';
  // Owen and Jacques see the value; stock control shares the layout without the price tier, so the value is the
  // Restricted mark (UX-09). Stock control cannot open a contract or a counterparty: plain text (UX-01).
  return (
    <Sections>
      <WbHead title="SYN4790 leg A" />
      <RecordHighlights kind="Over-delivery notice" title="SYN4790 leg A" status={<ExceptionStatus status={acknowledged ? 'acknowledged' : 'open'} />} tab={tab} onTab={setTab}
        actions={acknowledged ? null : <Button size="small">Acknowledge</Button>}
        fields={[stock ? { label: 'Contract leg', value: 'SYN4790 leg A' } : { label: 'Contract leg', value: 'SYN4790 leg A', link: '#' },
          stock ? { label: 'Supplier', value: 'Cameron Estates' } : { label: 'Supplier', value: 'Cameron Estates', link: '#' },
          { label: 'Basis', value: 'Collected' }, { label: 'Contracted', value: '1,000.000 t' }, { label: 'Delivered', value: '1,010.060 t' },
          { label: 'Over-delivered', value: '10.060 t' }, { label: 'Value', value: stock ? <Restricted /> : 'USD 2,861.06' }]} />
      <WbTable title="Goods received notes" count={1} objects="goods received notes" columns={[
        { key: 'ref', label: 'Goods received note', width: '180px', render: (r) => <RefCell>{r.ref}</RefCell> },
        { key: 'ticket', label: 'Ticket', width: '140px', render: (r) => <RefCell>{r.ticket}</RefCell> },
        { key: 'received', label: 'Received (t)', width: '120px', align: 'right' }, { key: 'source', label: 'Source', width: '130px' },
        { key: 'date', label: 'Finalised (CAT)', tabular: true },
      ]} rows={[{ id: 'n1', ref: 'GRN10000386', ticket: 'WBT10001608', received: '30.060', source: 'Weighbridge', date: '26 Sep 2026, 08:05' }]} />
      <Card title="Notice information">
        <WbFacts fields={[['Sent to', 'Owner, Trading and Stock control'], ['Sent', '26 Sep 2026, 08:05 CAT'], ['Escalates to', 'Owner, after 48 hours'],
          ...(acknowledged ? [['Acknowledged by', 'J. Tembo'], ['Acknowledged', '26 Sep 2026, 10:14 CAT'], ['Note', 'Cameron Estates agreed the extra at the leg price']] : [])]} />
      </Card>
      {dialog ? (
        <Dialog title="Acknowledge SYN4790 leg A?" width={480} sheet={narrow} onClose={busy ? undefined : () => {}}
          footer={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Acknowledge</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span>The notice closes for Owner, Trading and Stock control.</span>
            <Field label="Note"><Input multiline disabled={busy} defaultValue={busy ? 'Cameron Estates agreed the extra at the leg price' : ''} /></Field>
          </div>
        </Dialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Warehouse stock (CS-CLERK-08, S12 C6) */

const IN_STOCK = [
  { id: 's1', shed: 'Shed A', stack: 'A1', commodity: 'wheat', product: 'Wheat', owner: 'Own', tonnes: '2,140', bags: '', free: '1,740', committed: '400', hold: '0' },
  { id: 's2', shed: 'Shed A', stack: 'A2', commodity: 'wheat', product: 'Wheat', owner: 'Own', tonnes: '612', bags: '', free: '580', committed: '0', hold: '32' },
  { id: 's3', shed: 'Shed A', stack: 'A3', commodity: 'maize', product: 'Maize', owner: 'Own', tonnes: '1,420', bags: '', free: '1,040', committed: '300', hold: '80' },
  { id: 's4', shed: 'Shed A', stack: 'A4', commodity: 'maize', product: 'Maize', owner: 'Riverbend Milling', tonnes: '400', bags: '', free: '', committed: '', hold: '' },
  { id: 's5', shed: 'Shed B', stack: 'B1', commodity: 'fertilizer', product: 'Urea 50 kg', owner: 'Own', tonnes: '820', bags: '16,400', free: '520', committed: '300', hold: '0' },
  { id: 's6', shed: 'Shed B', stack: 'B2', commodity: 'fertilizer', product: 'Foliar Feed 10 L', owner: 'Own', tonnes: '46', bags: '3,833 containers', free: '39', committed: '7', hold: '0' },
];

/** The Clerk's stock by shed and stack, in tonnes and bags, with no value of any kind (UX-10). Stock held for another
    owner is its own row with that owner, never added into ours. */
export function WarehouseStock({ state = 'All' }) {
  const rows = state === 'Empty' ? [] : IN_STOCK;
  return (
    <Sections>
      <WbHead title="Warehouse stock" right={<Button variant="outline" size="small" icon="download" loading={state === 'Exporting'}>Export</Button>} />
      <ScrollRow><Capsule chevron>Site: Chisamba Shed</Capsule><Capsule chevron>Commodity: All</Capsule></ScrollRow>
      <WbTable columns={[
        { key: 'shed', label: 'Shed', width: '90px' }, { key: 'stack', label: 'Stack or bay', width: '110px' },
        { key: 'product', label: 'Commodity', width: '170px', render: (r) => <CommodityMarker commodity={r.commodity}>{r.product}</CommodityMarker> },
        { key: 'owner', label: 'Owner', width: 'minmax(150px, 1fr)' },
        { key: 'tonnes', label: 'In warehouse (t)', width: '140px', align: 'right' }, { key: 'bags', label: 'Bags or containers', width: '160px', align: 'right' },
        { key: 'free', label: 'Free (t)', width: '90px', align: 'right' }, { key: 'committed', label: 'Committed (t)', width: '120px', align: 'right' },
        { key: 'hold', label: 'On hold (t)', width: '110px', align: 'right' },
      ]} rows={rows} objects="stock" />
    </Sections>
  );
}
