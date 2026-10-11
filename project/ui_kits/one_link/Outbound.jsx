/** Outbound (M4.DS.02, UAG-184; S12 C1, C4, C5, S14 R5, R6, R7, S47 JQ5, canvases S13 and S15): the Outbound tab of the
    Clerk's Home, the New loading order with its load builder (Ryan for fertiliser, Jacques for grain, never the
    clerk, Map D-37), the loading order record in every state, the New delivery note made from a committed order with
    its Reconcile card, legal payload and bag count, the delivery note record from weighed out to proof of delivery,
    Ryan's Delivery notes list and his direct delivery capture. Every screen takes `state`, one of its OUTBOUND_STATES
    entry, so the kit's index and the screenshot review open any state with ?screen=&state=.

    The Clerk and stock control (Ryan) see no price, value or margin anywhere (UX-10): the columns and fields are left
    out. On a layout shared with a viewer who holds the price tier, Trading sees them and a viewer without the tier sees
    the Restricted mark. A weight's source is the labelled field Source and counterparty agreement the separate field
    Counterparty status. A load against its limit uses one boundary (LoadMeter): Approaching from the payload approach
    setting (95%), At maximum at exactly the limit, Over above it. Every commit, ship, close and override button draws
    its working state. Fictional sample data only: SYN4702 (delivered basis), SYN4790 (collected basis), FRT-218-S,
    FRT-221-S, Riverbend Milling, Lakeview Farms Ltd, Cameron Estates, Chisamba Shed, Mpongwe Depot, Northside Haulage,
    Kafue Transport Ltd, Copperbelt Haulage Ltd; people are T. Mwila (owner), J. Tembo (trading), S. Banda (clerk),
    R. Daka (stock control), A. Mwale (transport) and G. Phiri (field staff). */

export const OUTBOUND_STATES = {
  ClerkOutbound: ['All', 'Loading orders due', 'Ready to dispatch', 'Proof missing', 'Empty'],
  NewLoadingOrder: ['Within maximum', 'Approaching', 'At maximum', 'Over', 'No truck yet', 'Saving draft', 'Committing', 'Grain', 'Commit refused'],
  LoadingOrder: ['Committed', 'Awaiting truck', 'Ready to load', 'Close short', 'Closing', 'Closed short', 'Closed within tolerance', 'Trading view', 'Transport view', 'Related', 'History'],
  NewDeliveryNote: ['Grain', 'Grain, at legal payload', 'Grain, over legal payload', 'Override payload', 'Overriding', 'Fertiliser', 'Bag count mismatch', 'Supervised recount', 'Saving draft', 'Shipping'],
  DeliveryNote: ['Ready to dispatch', 'Shipping', 'Superseded weighing', 'Variance flagged', 'Variance flagged, clerk', 'Override variance', 'Overriding variance', 'Within variance',
    'Shipped', 'Proof missing', 'Pending sync', 'In review', 'Delivery refused', 'Delivered', 'Received beside shipped', 'Superseded proof', 'Reversed', 'Closed', 'Trading view', 'Related', 'History'],
  DeliveryNotes: ['All', 'Physical', 'Virtual', 'Direct', 'Today', 'Exporting', 'Empty'],
  DirectDelivery: ['Counts match', 'Count difference', 'Finalising', 'Finalised', 'Virtual warehouse', 'On hold'],
};

/** Jacques's navigation (his canvas, S47): Home, Trading, Logistics with Loading orders and Delivery notes, Inventory,
    Counterparties, Reports. */
export const TRADING_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'trade', label: 'Trading', icon: 'arrow-left-right' },
  { value: 'logistics', label: 'Logistics', icon: 'truck', sections: [{ value: 'loading', label: 'Loading orders' }, { value: 'delivery', label: 'Delivery notes' }] },
  { value: 'inventory', label: 'Inventory', icon: 'warehouse' },
  { value: 'counterparties', label: 'Counterparties', icon: 'building-2' },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
] }];
export const TRADING_USER = { initials: 'JT', name: 'J. Tembo', meta: 'Trading' };

const OB_LO = ['Logistics', 'Loading orders'];
const OB_DN = ['Logistics', 'Delivery notes'];
const OB_STOCK_DN = ['Variance flagged', 'Override variance', 'Overriding variance'];

/** Where an outbound screen sits: whose frame (the Clerk's, stock control's for Ryan, Trading's for Jacques, or
    Transport's for Ashraf), the module the navigation highlights (Logistics on every form and record, UX-04) and the
    breadcrumb. */
export function outboundFrame(screen, state) {
  if (screen === 'ClerkOutbound') return { who: 'clerk', module: 'home', breadcrumb: ['Home'] };
  if (screen === 'NewLoadingOrder') return { who: state === 'Grain' || state === 'Commit refused' ? 'jacques' : 'stock', module: 'logistics', section: 'loading', breadcrumb: [...OB_LO, 'New'] };
  if (screen === 'LoadingOrder') {
    const o = obLoFor(state);
    const who = state === 'Ready to load' ? 'clerk' : state === 'Transport view' ? 'transport' : o.grain ? 'jacques' : 'stock';
    return { who, module: 'logistics', section: 'loading', breadcrumb: [...OB_LO, o.ref] };
  }
  if (screen === 'NewDeliveryNote') return { who: 'clerk', module: 'logistics', section: 'delivery', breadcrumb: [...OB_DN, 'New'] };
  if (screen === 'DeliveryNote') {
    const who = state === 'Trading view' ? 'jacques' : OB_STOCK_DN.includes(state) ? 'stock' : 'clerk';
    return { who, module: 'logistics', section: 'delivery', breadcrumb: [...OB_DN, obDnFor(state).ref] };
  }
  if (screen === 'DeliveryNotes') return { who: 'stock', module: 'logistics', section: 'delivery', breadcrumb: OB_DN };
  return { who: 'stock', module: 'logistics', section: 'direct', breadcrumb: ['Logistics', 'Direct deliveries', obDirectFor(state).ref] };
}

const OB_ACTOR = { clerk: 'S. Banda', stock: 'R. Daka', trading: 'J. Tembo', transport: 'A. Mwale', owner: 'T. Mwila', field: 'G. Phiri' };
const OB_TOL = '0.080';
const OB_APPROACH = 0.95;
const obMark = (kind, word) => <StatusMark kind={kind} label={word} size="body-4" />;

/** A loading order's status (UX-32, the Clerk batch): Draft, Committed, Ready to load, Closed. */
const OB_LO_STATUS = { draft: obMark('neutral', 'Draft'), committed: obMark('clean', 'Committed'), ready: obMark('clean', 'Ready to load'), closed: obMark('clean', 'Closed') };
/** A delivery note's status (UX-32, the Clerk batch): Draft, Ready to dispatch, Shipped, Proof missing, Delivered,
    Delivery refused, Variance flagged, Reversed, Closed; a held direct delivery's note is On hold (M4.OUT.02). */
const OB_DN_STATUS = {
  draft: obMark('neutral', 'Draft'), ready: obMark('clean', 'Ready to dispatch'), shipped: obMark('clean', 'Shipped'), 'proof-missing': obMark('attention', 'Proof missing'),
  delivered: obMark('clean', 'Delivered'), refused: obMark('breach', 'Delivery refused'), variance: obMark('attention', 'Variance flagged'), reversed: obMark('neutral', 'Reversed'),
  closed: obMark('clean', 'Closed'), 'on-hold': obMark('attention', 'On hold'),
};

/** A labelled read-only value inside a form grid, at the input's height. */
function ObValue({ label, children }) {
  return <Field label={label}><span style={{ ...textStyle('body-3', { tabular: true }), lineHeight: '32px', overflowWrap: 'anywhere' }}>{children}</span></Field>;
}

/** A card's title with its count (UX-07). */
const obCounted = (title, n) => <>{title} <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 8 }}><Count>{n}</Count></span></>;

/* ------------------------------------------------------------------ Clerk Home, Outbound tab (CS-CLERK-02, S12 C1) */

/** The Outbound queue in the order M4.QUE.02 sets (AC 8): Short load, Refused, Slip unconfirmed, Count mismatch,
    Variance flagged or Over legal payload, Proof missing, Price changed, Below plan, Window ended, Ready to load past
    its age, a transfer Ready to load, Ready to dispatch, In review, Pending sync, Ready to load. Each row says why it is
    there in its Detail, with no price, value or margin. */
export const OUTBOUND_QUEUE = [
  { id: 'o1', item: 'LO-2236', type: 'Loading order', commodity: 'wheat', product: 'Wheat', detail: 'Riverbend Milling, SYN4702, closed with 498.000 t of 500.000 t shipped', status: 'short-load', age: '1 day', waiting: 'J. Tembo' },
  { id: 'o2', item: 'DN-0886', type: 'Delivery note', commodity: 'maize', product: 'Maize', detail: 'Riverbend Milling, refused at offload: damaged bags', status: 'refused', age: '3 h', action: 'Review' },
  { id: 'o3', item: 'DN-0887', type: 'Delivery note', commodity: 'wheat', product: 'Wheat', detail: 'Scanned slip for WBT10001625 not confirmed', status: 'slip-unconfirmed', age: '40 min', action: 'Continue' },
  { id: 'o4', item: 'DN-0889', type: 'Delivery note', commodity: 'fertilizer', product: 'Fertiliser', detail: 'Lakeview Farms Ltd, LO-2231: bag count 399, count sheet 400', status: 'count-mismatch', age: '25 min', action: 'Continue' },
  { id: 'o5', item: 'DN-0884', type: 'Delivery note', commodity: 'fertilizer', product: 'Fertiliser', detail: 'Lakeview Farms Ltd, net 27.610 t against 27.240 t theoretical, 1.4%', status: 'variance-flagged', age: '30 min', waiting: 'R. Daka' },
  { id: 'o6', item: 'DN-0890', type: 'Delivery note', commodity: 'wheat', product: 'Wheat', detail: 'Truck BAP 9229, net 36.200 t, legal payload 34.000 t', status: 'over-payload', age: '15 min', action: 'Continue' },
  { id: 'o7', item: 'DN-0875', type: 'Delivery note', commodity: 'maize', product: 'Maize', detail: 'Riverbend Milling, shipped 25 Sep 2026', status: 'proof-missing', age: '1 day', action: 'Review' },
  { id: 'o8', item: 'LO-2238', type: 'Loading order', commodity: 'wheat', product: 'Wheat', detail: 'Riverbend Milling, SYN4702: check with Trading before loading', status: 'price-changed', age: '2 h', action: 'Review' },
  { id: 'o9', item: 'DN-0872', type: 'Delivery note', commodity: 'wheat', product: 'Wheat', detail: 'LO-2236, shipped 32.000 t of 34.000 t planned', status: 'below-plan', age: '1 day', action: 'Review' },
  { id: 'o10', item: 'LO-2233', type: 'Loading order', commodity: 'maize', product: 'Maize', detail: 'Riverbend Milling, SYN4790, delivery window ended with 12.000 t left', status: 'window-ended', age: '2 days', action: 'Review' },
  { id: 'o11', item: 'LO-2235', type: 'Loading order', commodity: 'wheat', product: 'Wheat', detail: 'Riverbend Milling, SYN4702, 34.000 t. Truck BAP 9229, Copperbelt Haulage Ltd', status: 'ready-to-load', age: '3 days', aged: true, action: 'Create delivery note' },
  { id: 'o12', item: 'TR-0007', type: 'Transfer', commodity: 'fertilizer', product: 'Urea 25 kg', detail: 'To Mpongwe Depot, 24.000 t. Truck BCA 2214, Kafue Transport Ltd', status: 'ready-to-load', age: '5 h', action: 'Create delivery note' },
  { id: 'o13', item: 'DN-0881', type: 'Delivery note', commodity: 'wheat', product: 'Wheat', detail: 'Riverbend Milling, SYN4702, weighed out and loaded 34.120 t', status: 'ready-to-dispatch', age: '20 min', action: 'Continue' },
  { id: 'o14', item: 'DN-0883', type: 'Delivery note', commodity: 'fertilizer', product: 'Fertiliser', detail: 'Lakeview Farms Ltd, proof captured late, in Captures in review', status: 'in-review', age: '1 day', waiting: 'Stock control' },
  { id: 'o15', item: 'DN-0885', type: 'Delivery note', commodity: 'maize', product: 'Maize', detail: 'Cameron Estates, proof captured, waiting on the phone', status: 'pending-sync', age: '2 h' },
  { id: 'o16', item: 'LO-2240', type: 'Loading order', commodity: 'wheat', product: 'Wheat', detail: 'Riverbend Milling, SYN4702, 34.000 t. Truck AAZ 3310, Northside Haulage', status: 'ready-to-load', age: '1 h', action: 'Create delivery note' },
  { id: 'o17', item: 'LO-2231', type: 'Loading order', commodity: 'fertilizer', product: 'Fertiliser', detail: 'Lakeview Farms Ltd, FRT-218-S, maximum 30.000 t. Truck ABZ 4412, Kafue Transport Ltd', status: 'ready-to-load', age: '2 h', action: 'Create delivery note' },
];

/** Each outbound queue status, one or two words with its icon (UX-14, UX-32; M4.QUE.02's words as recorded in the
    Clerk batch): a problem is the red circle, a warning the amber triangle, waiting the amber clock, ready the check. */
export const OUTBOUND_MARKS = {
  'short-load': { kind: 'breach', word: 'Short load' },
  refused: { kind: 'breach', word: 'Refused' },
  'slip-unconfirmed': { kind: 'attention', word: 'Slip unconfirmed' },
  'count-mismatch': { kind: 'breach', word: 'Count mismatch' },
  'variance-flagged': { kind: 'attention', word: 'Variance flagged' },
  'over-payload': { kind: 'attention', word: 'Over legal payload' },
  'proof-missing': { kind: 'attention', word: 'Proof missing' },
  'price-changed': { kind: 'attention', word: 'Price changed' },
  'below-plan': { kind: 'attention', word: 'Below plan' },
  'window-ended': { kind: 'attention', word: 'Window ended' },
  'ready-to-dispatch': { kind: 'clean', word: 'Ready to dispatch' },
  'in-review': { kind: 'pending', word: 'In review' },
  'pending-sync': { kind: 'pending', word: 'Pending sync' },
  'ready-to-load': { kind: 'clean', word: 'Ready to load' },
};
export function OutboundStatus({ status }) {
  const m = OUTBOUND_MARKS[status];
  return <StatusMark kind={m.kind} label={m.word} size="body-4" />;
}

/** The three counts of S12 C1, each a filter on the list below (UX-08), never a tile: Loading orders due are the
    orders Ready to load (a transfer and an aged order included); Ready to dispatch; Proof missing. */
export const OUTBOUND_FILTERS = [['Loading orders due', 'ready-to-load'], ['Ready to dispatch', 'ready-to-dispatch'], ['Proof missing', 'proof-missing']];

export function ClerkOutbound({ state = 'All', onOpen }) {
  const narrow = inNarrow();
  const all = state === 'Empty' ? [] : OUTBOUND_QUEUE;
  const filter = OUTBOUND_FILTERS.find(([label]) => label === state);
  const rows = filter ? all.filter((q) => q.status === filter[1]) : all;
  const count = (s) => all.filter((q) => q.status === s).length;
  const meta = <>
    <span>Chisamba Shed</span><Dot style={{ margin: 0 }} />
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Weighbridge <ConnectionStatus status="Connected" /></span><Dot style={{ margin: 0 }} />
    <span>Last ticket 07:48 CAT</span><Dot style={{ margin: 0 }} /><span>Last refreshed 09:14</span>
  </>;
  return (
    <Sections>
      <WbHead title="Home" meta={meta} right={<Button variant="outline" size="small" icon="scan-line">Scan slip</Button>} />
      <Tabs tabs={[{ value: 'Inbound', label: 'Inbound', count: QUEUE.length }, { value: 'Outbound', label: 'Outbound', count: all.length }]} value="Outbound" onChange={(v) => v === 'Inbound' && onOpen && onOpen('inbound')} />
      <ScrollRow>
        <Capsule selected={!filter} count={all.length}>All</Capsule>
        {OUTBOUND_FILTERS.map(([label, s]) => <Capsule key={s} selected={!!filter && filter[1] === s} count={count(s)}>{label}</Capsule>)}
      </ScrollRow>
      <WbTable columns={[
        { key: 'item', label: 'Item', width: '130px', render: (r) => <span onClick={() => onOpen && onOpen(r.item)}><RefCell>{r.item}</RefCell></span> },
        { key: 'type', label: 'Type', width: '130px' },
        { key: 'product', label: 'Commodity', width: '130px', render: (r) => <CommodityMarker commodity={r.commodity}>{r.product}</CommodityMarker> },
        { key: 'detail', label: 'Detail', width: narrow ? '300px' : undefined },
        { key: 'status', label: 'Status', width: '170px', render: (r) => <OutboundStatus status={r.status} /> },
        // An order past its age threshold stays Ready to load and its Age shows with the warning icon (M4.QUE.02 AC 4).
        { key: 'age', label: 'Age', width: '100px', tabular: true, render: (r) => (r.aged ? <StatusMark kind="attention" label={r.age} size="body-4" strong={false} /> : r.age) },
        { key: 'action', label: '', width: '200px', align: 'right', wrap: true, render: (r) => (r.waiting ? <span data-waiting="" style={textStyle('body-4', { tone: 'secondary' })}>Waiting for: {r.waiting}</span>
          : r.action ? <Button size="xsmall" variant={r.action === 'Create delivery note' ? 'primary' : 'outline'}>{r.action}</Button> : null) },
      ]} rows={rows} objects="items" />
    </Sections>
  );
}

/* ------------------------------------------------------------------ New loading order, the load builder (ryan__09, ryan__10, S14 R5) */

const OB_PACKS = ['50 kg bag', '20 kg bag', '10 L container', '25 kg bag'];
/** Each line's theoretical weight: count times the pack weight including packaging, or a liquid's volume times its
    density plus its container (Weight from). */
const OB_LINES = {
  within: [
    { id: 'u1', product: 'Urea', pack: '50 kg bag', from: 'Pack weight', unit: '50.10', count: '400', weight: '20.040', bay: 'B1' },
    { id: 'f1', product: 'Foliar Feed', pack: '10 L container', from: 'Volume and density', unit: '12.00', count: '600', weight: '7.200', bay: 'B2' },
  ],
  approaching: [
    { id: 'u1', product: 'Urea', pack: '50 kg bag', from: 'Pack weight', unit: '50.10', count: '400', weight: '20.040', bay: 'B1' },
    { id: 'f1', product: 'Foliar Feed', pack: '10 L container', from: 'Volume and density', unit: '12.00', count: '780', weight: '9.360', bay: 'B2' },
  ],
  at: [
    { id: 'u1', product: 'Urea', pack: '50 kg bag', from: 'Pack weight', unit: '50.10', count: '400', weight: '20.040', bay: 'B1' },
    { id: 'f1', product: 'Foliar Feed', pack: '10 L container', from: 'Volume and density', unit: '12.00', count: '830', weight: '9.960', bay: 'B2' },
  ],
  over: [
    { id: 'u1', product: 'Urea', pack: '50 kg bag', from: 'Pack weight', unit: '50.10', count: '400', weight: '20.040', bay: 'B1' },
    { id: 'f1', product: 'Foliar Feed', pack: '10 L container', from: 'Volume and density', unit: '12.00', count: '600', weight: '7.200', bay: 'B2' },
    { id: 'u2', product: 'Urea', pack: '20 kg bag', from: 'Pack weight', unit: '20.10', count: '150', weight: '3.015', bay: 'B1' },
  ],
};
const obSum = (lines) => tonnes(lines.reduce((n, l) => n + thousandths(l.weight), 0));

/** The grain order's stock by stack: in stack, on the road, committed and free. Commit needs the tonnes received and
    free in the Physical warehouse (RL-LO-RECEIVED); stock on the road never counts. */
const OB_GRAIN_STOCK = [
  { id: 'a1', stack: 'Shed A, A1', product: 'Wheat, grade 1', stacked: '2,140.000', road: '0.000', committed: '400.000', free: '1,740.000' },
  { id: 'a4', stack: 'Shed A, A4', product: 'Wheat, grade 1', stacked: '0.000', road: '32.000', committed: '0.000', free: '0.000' },
];

export function NewLoadingOrder({ state = 'Within maximum' }) {
  const narrow = inNarrow();
  const saving = state === 'Saving draft';
  const committing = state === 'Committing';
  const busy = saving || committing;
  const grain = state === 'Grain' || state === 'Commit refused';
  const refused = state === 'Commit refused';
  const noTruck = state === 'No truck yet';
  const key = state === 'Approaching' ? 'approaching' : state === 'At maximum' ? 'at' : state === 'Over' ? 'over' : 'within';
  if (grain) {
    const lines = [{ id: 'g1', commodity: 'Wheat', grade: 'Grade 1', stack: refused ? 'Shed A, A4' : 'Shed A, A1', free: refused ? '0.000' : '1,740.000', quantity: '32.000' }];
    const total = '32.000';
    return (
      <Sections>
        <WbHead title="New loading order" right={<>
          <Button variant="outline" size="small">Save draft</Button>
          <Button size="small" disabled={refused}>Commit</Button>
        </>} />
        {refused ? <Refusal action="Commit" reason="Stock not received" /> : null}
        <InSide side={(
          <Card title="Load"><LoadMeter label={null} total={total} limit="34.000" approachShare={OB_APPROACH} rows={[{ label: 'Maximum order weight', value: '34.000 t' }, { label: 'Truck', value: '' }, { label: 'Truck loading weight', value: '' }]} /></Card>
        )}>
          <Card title="Loading order">
            <InFields>
              <Field label="Sale contract" required><Select options={['SYN4702', 'SYN4790']} defaultValue="SYN4702" /></Field>
              <ObValue label="Customer">Riverbend Milling</ObValue>
              <ObValue label="Basis">Delivered</ObValue>
              <Field label="Delivery point" required><Select options={['Riverbend Milling, Lusaka offload']} /></Field>
              <Field label="Maximum order weight (t)" required><Input align="right" defaultValue="34.000" /></Field>
              <Field label="Due" required><Input defaultValue="01 Oct 2026" /></Field>
            </InFields>
          </Card>
          <Card gap={8} title={obCounted('Lines', lines.length)}>
            <div style={{ margin: '0 -16px' }}>
              <DataTable rowKey="id" minWidth={narrow ? 760 : 700} rows={[...lines, { id: 'total', total: true, commodity: 'Total', quantity: total }]} columns={[
                { key: 'commodity', label: 'Commodity', width: 'minmax(120px, 1fr)', render: (r) => (r.total ? <Text variant="body-3" strong>Total</Text> : <CommodityMarker commodity="wheat">{r.commodity}</CommodityMarker>) },
                { key: 'grade', label: 'Grade', width: '100px' },
                { key: 'stack', label: 'Stack', width: '150px', render: (r) => (r.total ? '' : <Select options={['Shed A, A1', 'Shed A, A4']} defaultValue={r.stack} />) },
                { key: 'free', label: 'Free (t)', width: '110px', align: 'right' },
                { key: 'quantity', label: 'Quantity (t)', width: '130px', align: 'right', render: (r) => (r.total ? wbStrong(r, r.quantity) : <Input align="right" defaultValue={r.quantity} invalid={refused} />) },
              ]} />
            </div>
            <div><Button variant="outline" size="small" icon="plus">Add line</Button></div>
          </Card>
          <WbTable title="Stock" count={OB_GRAIN_STOCK.length} objects="stacks" columns={[
            { key: 'stack', label: 'Stack', width: '130px' }, { key: 'product', label: 'Product', width: '140px' },
            { key: 'stacked', label: 'In stack (t)', width: '120px', align: 'right' }, { key: 'road', label: 'On the road (t)', width: '130px', align: 'right' },
            { key: 'committed', label: 'Committed (t)', width: '130px', align: 'right' }, { key: 'free', label: 'Free (t)', width: '110px', align: 'right' },
          ]} rows={OB_GRAIN_STOCK} />
        </InSide>
      </Sections>
    );
  }
  const lines = OB_LINES[key];
  const total = obSum(lines);
  const limit = '30.000';
  const over = loadState(total, limit, OB_APPROACH) === 'over';
  return (
    <Sections>
      <WbHead title="New loading order" right={<>
        <Button variant="outline" size="small" loading={saving} disabled={committing}>Save draft</Button>
        <Button size="small" loading={committing} disabled={over || saving}>Commit</Button>
      </>} />
      <InSide side={(
        <Card title="Load">
          <LoadMeter label={null} total={total} limit={limit} approachShare={OB_APPROACH} rows={[
            { label: 'Maximum order weight', value: '30.000 t' },
            { label: 'Truck', value: noTruck ? '' : 'ABZ 4412' },
            { label: 'Assigned by', value: noTruck ? '' : 'A. Mwale' },
            { label: 'Truck loading weight', value: noTruck ? '' : '30.000 t' },
          ]} />
        </Card>
      )}>
        <Card title="Loading order">
          <InFields>
            <Field label="Customer" required><Select options={['Lakeview Farms Ltd', 'Cameron Estates']} defaultValue="Lakeview Farms Ltd" disabled={busy} /></Field>
            <Field label="Sale contract" required><Select options={['FRT-218-S']} disabled={busy} /></Field>
            <Field label="Delivery point" required><Select options={['Lakeview Farms farm gate']} disabled={busy} /></Field>
            <Field label="Maximum order weight (t)" required><Input align="right" defaultValue="30.000" disabled={busy} /></Field>
          </InFields>
        </Card>
        <Card gap={8} title={obCounted('Lines', lines.length)}>
          <div style={{ margin: '0 -16px' }}>
            <DataTable rowKey="id" minWidth={narrow ? 930 : 890} rows={[...lines, { id: 'total', total: true, product: 'Total', weight: total }]} columns={[
              { key: 'product', label: 'Product', width: 'minmax(120px, 1fr)', render: (r) => (r.total ? <Text variant="body-3" strong>Total</Text> : <CommodityMarker commodity="fertilizer">{r.product}</CommodityMarker>) },
              { key: 'pack', label: 'Pack', width: '180px', render: (r) => (r.total ? '' : <Select options={OB_PACKS} defaultValue={r.pack} disabled={busy} />) },
              { key: 'from', label: 'Weight from', width: '150px', wrap: true },
              { key: 'unit', label: 'Unit weight (kg)', width: '130px', align: 'right' },
              { key: 'count', label: 'Count', width: '100px', align: 'right', render: (r) => (r.total ? '' : <Input align="right" defaultValue={r.count} disabled={busy} />) },
              { key: 'weight', label: 'Theoretical (t)', width: '120px', align: 'right', render: (r) => wbStrong(r, r.weight) },
              { key: 'bay', label: 'Bay', width: '60px' },
            ]} />
          </div>
          <div><Button variant="outline" size="small" icon="plus" disabled={busy}>Add line</Button></div>
        </Card>
      </InSide>
    </Sections>
  );
}

/* ------------------------------------------------------------------ Loading order record (ryan__11, CS-CLERK-06) */

/** The order each state draws: Ryan's committed fertiliser order (ryan__11), one still waiting for a truck, the
    grain order the clerk opens Ready to load (CS-CLERK-06), and Jacques's grain orders closed short and within
    tolerance. */
function obLoFor(state) {
  if (state === 'Committed' || state === 'Related' || state === 'History') return { ref: 'LO-2231', status: 'committed' };
  if (state === 'Awaiting truck') return { ref: 'LO-2243', status: 'committed' };
  if (state === 'Close short' || state === 'Closing' || state === 'Closed short') return { ref: 'LO-2236', status: state === 'Closed short' ? 'closed' : 'committed', grain: true };
  if (state === 'Closed within tolerance') return { ref: 'LO-2237', status: 'closed', grain: true };
  if (state === 'Trading view' || state === 'Transport view') return { ref: 'LO-2240', status: 'ready', grain: true };
  return { ref: 'LO-2240', status: 'ready', grain: true };
}

const OB_LO_HISTORY = [
  { id: 'h3', field: 'Truck', user: 'A. Mwale', old: '', next: 'ABZ 4412', date: '26 Sep 2026, 08:10', reason: 'Assigned, Kafue Transport Ltd' },
  { id: 'h2', field: 'Status', user: 'R. Daka', old: 'Draft', next: 'Committed', date: '26 Sep 2026, 07:55', reason: 'Stock received and free in bays B1 and B2' },
  { id: 'h1', field: 'Status', user: 'R. Daka', old: '', next: 'Draft', date: '26 Sep 2026, 07:40', reason: '' },
];

export function LoadingOrder({ state = 'Committed' }) {
  const narrow = inNarrow();
  const initial = state === 'History' ? 'History' : state === 'Related' ? 'Related' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const o = obLoFor(state);
  const clerk = state === 'Ready to load';
  const trading = state === 'Trading view';
  const transport = state === 'Transport view';
  const noTruck = state === 'Awaiting truck';
  const closing = state === 'Close short' || state === 'Closing';
  const closedShort = state === 'Closed short';
  const withinTol = state === 'Closed within tolerance';
  let fields;
  let actions = null;
  let details;
  if (o.grain) {
    // CS-CLERK-06: Customer and Sale contract are plain text for the clerk and for Transport (UX-01); Jacques can open
    // the contract. Committed value is Trading's figure: drawn for Jacques, the Restricted mark for Transport on the
    // same layout, and left out of the clerk's (UX-09, UX-10).
    const contract = trading ? { label: 'Sale contract', value: 'SYN4702', link: '#' } : { label: 'Sale contract', value: 'SYN4702' };
    const qty = o.ref === 'LO-2236' ? '500.000 t' : o.ref === 'LO-2237' ? '500.000 t' : '34.000 t';
    fields = [{ label: 'Customer', value: 'Riverbend Milling' }, contract, { label: 'Basis', value: 'Delivered' }, { label: 'Quantity', value: qty },
      ...(o.ref === 'LO-2240' ? [{ label: 'Transporter', value: 'Northside Haulage' }, { label: 'Truck', value: 'AAZ 3310' }, { label: 'Due', value: '26 Sep 2026' }] : [{ label: 'Shipped', value: o.ref === 'LO-2236' ? '498.000 t' : '499.950 t' }]),
      ...(closedShort ? [{ label: 'Shortfall', value: '2.000 t' }] : []),
      ...(trading ? [{ label: 'Committed value', value: 'USD 9,669.60' }] : transport ? [{ label: 'Committed value', value: <Restricted /> }] : [])];
    if (clerk) actions = <Button size="small">Create delivery note</Button>;
    if (state === 'Close short' || state === 'Closing') actions = <Button variant="outline" size="small">Close</Button>;
    const info = [['Raised by', 'J. Tembo'], ['Raised', '25 Sep 2026, 15:10'], ['Committed by', 'J. Tembo'], ['Delivery point', 'Riverbend Milling, Lusaka offload'],
      ['Commodity', <CommodityMarker commodity="wheat">Wheat</CommodityMarker>], ['Grade', 'Grade 1'], ['From', 'Shed A, stack A1'],
      ...(o.ref === 'LO-2240' ? [['Committed', '34.000 t'], ['Truck assigned by', 'A. Mwale']] : []),
      ...(closedShort ? [['Closed by', 'J. Tembo'], ['Closed', '27 Sep 2026, 16:20 CAT'], ['Reason', 'Customer took less'], ['Released', '2.000 t']] : []),
      ...(withinTol ? [['Closed by', 'One Link, within the outbound tolerance'], ['Closed', '27 Sep 2026, 11:02 CAT'], ['Shortfall', '0.050 t'], ['Tolerance', '0.080 t']] : [])];
    const priced = trading ? [{ key: 'price', label: 'Sell price', width: '160px', align: 'right' }] : transport ? [{ key: 'price', label: 'Sell price', width: '110px', align: 'right', render: (r) => (r.total ? '' : <Restricted />) }] : [];
    details = <>
      {closedShort ? <ConditionBanner>Closed short by 2.000 t. The Short load exception is open for Trading.</ConditionBanner> : null}
      <Card title="Loading order information"><WbFacts min={170} fields={info} /></Card>
      {trading || transport ? (
        <WbTable title="Lines" count={1} objects="lines" columns={[
          { key: 'commodity', label: 'Commodity', width: '130px', render: (r) => (r.total ? wbStrong(r, 'Total') : <CommodityMarker commodity="wheat">{r.commodity}</CommodityMarker>) },
          { key: 'stack', label: 'Stack', width: '140px' }, { key: 'quantity', label: 'Quantity (t)', width: '120px', align: 'right', render: (r) => wbStrong(r, r.quantity) }, ...priced,
        ]} rows={[{ id: 'l1', commodity: 'Wheat', stack: 'Shed A, A1', quantity: '34.000', price: 'USD 284.40 per t' }, { id: 'total', total: true, quantity: '34.000' }]} />
      ) : null}
      {o.ref !== 'LO-2240' ? (
        <WbTable title="Delivery notes" count={3} objects="delivery notes" columns={[
          { key: 'ref', label: 'Delivery note', width: '130px', render: (r) => <RefCell>{r.ref}</RefCell> }, { key: 'truck', label: 'Truck', width: '110px' },
          { key: 'shipped', label: 'Shipped (t)', width: '120px', align: 'right' }, { key: 'status', label: 'Status', render: () => OB_DN_STATUS.delivered },
        ]} rows={[{ id: 'd1', ref: 'DN-0870', truck: 'AAZ 3310', shipped: '34.020' }, { id: 'd2', ref: 'DN-0872', truck: 'BAP 9229', shipped: '32.000' }, { id: 'd3', ref: 'DN-0879', truck: 'AAZ 3310', shipped: withinTol ? '433.930' : '431.980' }]} />
      ) : null}
      {closing ? (
        <ReasonDialog title={`Close ${o.ref} short?`} confirmLabel="Close" minLength={1} busy={state === 'Closing'} sheet={narrow} defaultReason={state === 'Closing' ? 'Customer took less' : ''}>
          498.000 t of 500.000 t shipped. Closing releases the 2.000 t still committed and opens a Short load exception for Trading.
        </ReasonDialog>
      ) : null}
    </>;
  } else {
    // ryan__11: Ryan's committed fertiliser order. The customer is plain text (UX-01); the truck and its loading weight
    // come from Ashraf's assignment, in the Transport card. Until a truck is assigned the order waits for Transport.
    fields = [{ label: 'Customer', value: 'Lakeview Farms Ltd' }, { label: 'Delivery point', value: 'Lakeview Farms farm gate' }, { label: 'Theoretical weight', value: '27.240 t' },
      { label: 'Maximum', value: '30.000 t' }, { label: 'Truck', value: noTruck ? '' : 'ABZ 4412' }, { label: 'Raised by', value: 'R. Daka' },
      ...(noTruck ? [{ label: 'Waiting for', value: 'Transport' }] : [])];
    const lines = OB_LINES.within.map((l) => ({ ...l, committed: true }));
    details = <>
      <WbTable title="Lines" count={lines.length} objects="lines" columns={[
        { key: 'product', label: 'Product', width: 'minmax(130px, 1fr)', render: (r) => (r.total ? wbStrong(r, 'Total') : <CommodityMarker commodity="fertilizer">{r.product}</CommodityMarker>) },
        { key: 'pack', label: 'Pack', width: '140px' }, { key: 'count', label: 'Count', width: '90px', align: 'right' },
        { key: 'weight', label: 'Theoretical (t)', width: '130px', align: 'right', render: (r) => wbStrong(r, r.weight) }, { key: 'bay', label: 'Bay', width: '70px' },
        { key: 'committed', label: 'Committed', width: '120px', render: (r) => (r.total ? '' : obMark('clean', 'Yes')) },
      ]} rows={[...lines, { id: 'total', total: true, weight: '27.240' }]} />
      <Card title="Transport">
        <WbFacts min={160} fields={noTruck ? [['Transporter', ''], ['Truck', ''], ['Loading weight', ''], ['Assigned by', '']]
          : [['Transporter', 'Kafue Transport Ltd'], ['Truck', 'ABZ 4412'], ['Loading weight', '30.000 t'], ['Assigned by', 'A. Mwale, 26 Sep 2026, 08:10']]} />
      </Card>
    </>;
  }
  return (
    <Sections>
      <WbHead title={o.ref} />
      <RecordHighlights kind="Loading order" title={o.ref} status={OB_LO_STATUS[o.status]} actions={actions} fields={fields} tab={tab} onTab={setTab} />
      {tab === 'History' ? (
        <WbTable title="History" count={OB_LO_HISTORY.length} objects="changes" columns={[
          { key: 'field', label: 'Field', width: '130px' }, { key: 'user', label: 'User', width: '110px' },
          { key: 'old', label: 'Old value', width: '110px' }, { key: 'next', label: 'New value', width: '120px' },
          { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true }, { key: 'reason', label: 'Reason' },
        ]} rows={OB_LO_HISTORY} />
      ) : tab === 'Related' ? (
        <WbTable title="Delivery notes" count={1} objects="delivery notes" columns={[
          { key: 'ref', label: 'Delivery note', width: '140px', render: (r) => <RefCell>{r.ref}</RefCell> }, { key: 'truck', label: 'Truck', width: '110px' },
          { key: 'loaded', label: 'Loaded (t)', width: '110px', align: 'right' }, { key: 'status', label: 'Status', render: () => OB_DN_STATUS.variance },
        ]} rows={[{ id: 'r1', ref: 'DN-0884', truck: 'ABZ 4412', loaded: '27.240' }]} />
      ) : details}
    </Sections>
  );
}

/* ------------------------------------------------------------------ New delivery note (CS-CLERK-07, clerk__13, clerk__14) */

/** The grain note each state draws: LO-2240 on AAZ 3310 (legal payload 34.500 t), or LO-2244 on BAP 9229 (34.000 t)
    at and over its legal payload (M4.CAP.01). */
function obGrainFor(state) {
  if (state === 'Grain, at legal payload') return { lo: 'LO-2244', truck: 'BAP 9229', transporter: 'Copperbelt Haulage Ltd', ticket: 'WBT10001626', ordered: '34.000', tare: '14.180', gross: '48.180', net: '34.000', payload: '34.000' };
  if (state === 'Grain, over legal payload' || state === 'Override payload' || state === 'Overriding') return { lo: 'LO-2244', truck: 'BAP 9229', transporter: 'Copperbelt Haulage Ltd', ticket: 'WBT10001627', ordered: '36.200', tare: '14.000', gross: '50.200', net: '36.200', payload: '34.000' };
  return { lo: 'LO-2240', truck: 'AAZ 3310', transporter: 'Northside Haulage', ticket: 'WBT10001621', ordered: '34.000', tare: '14.020', gross: '48.140', net: '34.120', payload: '34.500' };
}

/** The Weighbridge ticket card: each weighing with its weight, time and Source, the net on a grey band, and any
    superseded weighing kept with its reason (UAG-64 AC 5). */
function ObWeighings({ ticket, rows }) {
  return (
    <WbTable title="Weighbridge ticket" action={<RefCell>{ticket}</RefCell>} columns={[
      { key: 'weighing', label: 'Weighing', width: 'minmax(170px, 1fr)', render: (r) => wbStrong(r, r.weighing) },
      { key: 'weight', label: 'Weight (t)', width: '110px', align: 'right', render: (r) => wbStrong(r, r.weight) },
      { key: 'time', label: 'Time (CAT)', width: '170px', tabular: true },
      { key: 'source', label: 'Source', width: '130px' },
      // A Status column only once a weighing has been superseded: the earlier one is kept, never deleted.
      ...(rows.some((r) => r.superseded) ? [{ key: 'state', label: 'Status', width: '150px', render: (r) => (r.total ? '' : r.superseded ? obMark('neutral', 'Superseded') : obMark('clean', 'Current')) }] : []),
    ]} rows={rows} />
  );
}

/** The legal payload card of a grain note (M4.CAP.01): the ticket net against the vehicle's legal payload, with the
    excess in bold when over, and the override with its reason once recorded. */
function ObPayload({ g, override, action }) {
  const over = loadState(g.net, g.payload, OB_APPROACH) === 'over';
  const excess = tonnes(thousandths(g.net) - thousandths(g.payload));
  return (
    <Card title="Legal payload">
      <LoadMeter kind="payload" label="Ticket net" total={g.net} limit={g.payload} approachShare={OB_APPROACH}
        rows={[{ label: 'Legal payload', value: `${g.payload} t` }, ...(over ? [{ label: 'Excess', value: `${excess} t`, strong: true }] : [])]} />
      {override ? <WbFacts min={140} fields={[['Override reason', override], ['Near-miss', 'Recorded']]} /> : null}
      {action ? <div>{action}</div> : null}
    </Card>
  );
}

const OB_FERT_LOADED = [
  { id: 'u1', product: 'Urea', pack: '50 kg bag', sheet: '400', loaded: '400', weight: '20.040', bay: 'B1' },
  { id: 'f1', product: 'Foliar Feed', pack: '10 L container, 1.20 kg/L', sheet: '600', loaded: '600', weight: '7.200', bay: 'B2' },
];

export function NewDeliveryNote({ state = 'Grain' }) {
  const narrow = inNarrow();
  const saving = state === 'Saving draft';
  const shipping = state === 'Shipping';
  const busy = saving || shipping;
  const fert = state === 'Fertiliser' || state === 'Bag count mismatch' || state === 'Supervised recount';
  if (fert) {
    const mismatch = state === 'Bag count mismatch';
    const recount = state === 'Supervised recount';
    const lines = OB_FERT_LOADED.map((l) => (l.id === 'u1' && mismatch ? { ...l, loaded: '399', weight: '19.990' } : l));
    const total = obSum(lines);
    const loadedBags = lines.find((l) => l.id === 'u1').loaded;
    const blocked = bagCountState('400', loadedBags) !== 'matches';
    return (
      <Sections>
        <WbHead title="New delivery note" right={<>
          <Button variant="outline" size="small" loading={saving} disabled={shipping}>Save draft</Button>
          <Button size="small" loading={shipping} disabled={blocked || saving}>Ship</Button>
        </>} />
        {blocked ? <Refusal action="Ship" reason={bagCountReason('400', loadedBags)} /> : null}
        <InSide side={<>
          <ReconcileCard rows={[
            { label: 'Order maximum', value: '30.000 t' }, { label: 'Loaded', value: `${total} t`, strong: true }, { label: 'Payload used', value: loadUsed(total, '30.000') },
            { label: 'Bags, count sheet', value: '400' }, { label: 'Bags, loaded', value: loadedBags },
          ]} mark={<CountMatch sheet="400" loaded={loadedBags} />} />
        </>}>
          <Card title="Delivery details">
            <WbFacts min={150} fields={[['Loading order', <RefCell>LO-2231</RefCell>], ['Customer', 'Lakeview Farms Ltd'], ['Delivery point', 'Lakeview Farms farm gate'],
              ['Order maximum', '30.000 t'], ['Truck', 'ABZ 4412'], ['Truck loading weight', '30.000 t']]} />
          </Card>
          <Card gap={8} title={obCounted('Loaded lines', lines.length)}>
            <div style={{ margin: '0 -16px' }}>
              <DataTable rowKey="id" minWidth={narrow ? 780 : 720} rows={[...lines, { id: 'total', total: true, product: 'Total', weight: total }]} columns={[
                { key: 'product', label: 'Product', width: 'minmax(120px, 1fr)', render: (r) => (r.total ? <Text variant="body-3" strong>Total</Text> : <CommodityMarker commodity="fertilizer">{r.product}</CommodityMarker>) },
                { key: 'pack', label: 'Pack', width: '190px', wrap: true },
                { key: 'sheet', label: 'Count sheet', width: '110px', align: 'right' },
                { key: 'loaded', label: 'Loaded', width: '110px', align: 'right', render: (r) => (r.total ? '' : <Input align="right" defaultValue={r.loaded} invalid={r.loaded !== r.sheet} disabled={busy} />) },
                { key: 'weight', label: 'Weight (t)', width: '110px', align: 'right', render: (r) => wbStrong(r, r.weight) },
                { key: 'bay', label: 'Bay', width: '60px' },
              ]} />
            </div>
          </Card>
          <Card title="Count sheet">
            <WbFacts min={150} fields={[['Counted by', 'Stock control'], ['Counted', '26 Sep 2026, 09:40'], ['Urea 50 kg', '400 bags'], ['Foliar Feed 10 L', '600 containers']]} />
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><EvidenceTile kind="document" caption="count-sheet-lo-2231" time="09:40" /></div>
          </Card>
          {recount || mismatch ? (
            <WbTable title="Counts" count={recount ? 2 : 1} objects="counts" columns={[
              { key: 'count', label: 'Count', width: '170px' }, { key: 'by', label: 'Counted by', width: '140px' },
              { key: 'bags', label: 'Urea 50 kg loaded', width: '150px', align: 'right' }, { key: 'date', label: 'Counted (CAT)', tabular: true },
            ]} rows={[
              { id: 'c1', count: 'Loading count', by: 'Clerk', bags: '399', date: '26 Sep 2026, 09:52' },
              ...(recount ? [{ id: 'c2', count: 'Supervised recount', by: 'Stock control', bags: '400', date: '26 Sep 2026, 10:20' }] : []),
            ]} />
          ) : null}
        </InSide>
      </Sections>
    );
  }
  const g = obGrainFor(state);
  const over = loadState(g.net, g.payload, OB_APPROACH) === 'over';
  const dialog = state === 'Override payload' || state === 'Overriding';
  const overriding = state === 'Overriding';
  return (
    <Sections>
      <WbHead title="New delivery note" right={<>
        <Button variant="outline" size="small" loading={saving} disabled={shipping || overriding}>Save draft</Button>
        <Button size="small" loading={shipping} disabled={over || saving}>Ship</Button>
      </>} />
      {over ? <Refusal action="Ship" reason="Ticket net is over the legal payload. Override with a reason, or reduce the load" /> : null}
      <InSide side={<>
        <OutboundReconcile ordered={g.ordered} loaded={g.net} net={g.net} tolerance={OB_TOL} />
        <ObPayload g={g} action={over ? <Button variant="outline" size="small" disabled={overriding}>Override</Button> : null} />
      </>}>
        <Card title="Delivery details">
          <WbFacts min={150} fields={[['Loading order', <RefCell>{g.lo}</RefCell>], ['Customer', 'Riverbend Milling'], ['Sale contract', 'SYN4702'], ['Basis', 'Delivered'],
            ['Delivery point', 'Riverbend Milling, Lusaka offload'], ['Truck', g.truck], ['Confirmed from', <RefCell>{g.ticket}</RefCell>], ['Transporter', g.transporter],
            ['Counterparty status', <ConfirmationChip kind="pending" />]]} />
        </Card>
        <ObWeighings ticket={g.ticket} rows={[
          { id: 'w1', weighing: 'First weighing, tare', weight: g.tare, time: '26 Sep 2026, 07:55', source: 'Weighbridge' },
          { id: 'w2', weighing: 'Second weighing, gross', weight: g.gross, time: '26 Sep 2026, 08:21', source: 'Weighbridge' },
          { id: 'net', total: true, weighing: 'Net', weight: g.net },
        ]} />
        <Card gap={8} title={obCounted('Loaded lines', 1)}>
          <div style={{ margin: '0 -16px' }}>
            <DataTable rowKey="id" minWidth={600} rows={[{ id: 'l1', commodity: 'Wheat', grade: 'Grade 1', shed: 'Shed A', stack: 'A1', loaded: g.net }]} columns={[
              { key: 'commodity', label: 'Commodity', width: 'minmax(120px, 1fr)', render: () => <CommodityMarker commodity="wheat">Wheat</CommodityMarker> },
              { key: 'grade', label: 'Grade', width: '100px' }, { key: 'shed', label: 'Shed', width: '90px' }, { key: 'stack', label: 'Stack', width: '80px' },
              { key: 'loaded', label: 'Loaded (t)', width: '130px', align: 'right', render: (r) => <Input align="right" defaultValue={r.loaded} disabled={busy} /> },
            ]} />
          </div>
        </Card>
      </InSide>
      {dialog ? (
        <ReasonDialog title={`Override legal payload on ${g.lo}?`} confirmLabel="Override" minLength={1} busy={overriding} sheet={narrow}
          defaultReason={overriding ? 'Customer instruction, re-check at the mill' : ''}>
          Ticket net 36.200 t, legal payload 34.000 t, excess 2.200 t. The override is recorded as a near-miss against Copperbelt Haulage Ltd.
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Delivery note record (clerk__12, ryan__12, ryan__13) */

/** The note each state draws: the grain note weighed out and shipped (DN-0881), Ryan's fertiliser note against the
    weighbridge variance (DN-0884, DN-0891), and the shipped notes in each proof state. */
function obDnFor(state) {
  if (['Variance flagged', 'Variance flagged, clerk', 'Override variance', 'Overriding variance'].includes(state)) return { ref: 'DN-0884', status: 'variance', fert: true };
  if (state === 'Within variance') return { ref: 'DN-0891', status: 'ready', fert: true };
  if (state === 'Proof missing') return { ref: 'DN-0875', status: 'proof-missing', proof: true };
  if (state === 'Pending sync') return { ref: 'DN-0885', status: 'shipped', proof: true };
  if (state === 'In review') return { ref: 'DN-0883', status: 'shipped', proof: true };
  if (state === 'Delivery refused') return { ref: 'DN-0886', status: 'refused', proof: true };
  if (state === 'Delivered' || state === 'Received beside shipped' || state === 'Superseded proof') return { ref: 'DN-0878', status: 'delivered', proof: true };
  if (state === 'Reversed') return { ref: 'DN-0874', status: 'reversed' };
  if (state === 'Closed') return { ref: 'DN-0880', status: 'closed' };
  if (state === 'Shipped' || state === 'Trading view') return { ref: 'DN-0881', status: 'shipped', proof: true };
  return { ref: 'DN-0881', status: 'ready' };
}

const OB_PROOF_BY = (t) => `26 Sep 2026, ${t}, G. Phiri`;
function obProof(state) {
  const all = (status) => [
    { item: 'Photograph', status, captured: status === 'missing' || status === 'awaiting' ? '' : OB_PROOF_BY('14:40') },
    { item: 'Receiver signature', status, captured: status === 'missing' || status === 'awaiting' ? '' : OB_PROOF_BY('14:41') },
    { item: 'Receiver name', status, captured: status === 'missing' || status === 'awaiting' ? '' : OB_PROOF_BY('14:41') },
  ];
  if (state === 'Proof missing') return { items: all('missing') };
  if (state === 'Pending sync') return { items: all('pending-sync') };
  if (state === 'In review') return { items: all('in-review'), facts: [['Review', 'Captured more than 24 hours late'], ['Waiting for', 'Stock control']] };
  if (state === 'Delivery refused') return { items: [{ item: 'Photograph', status: 'received', captured: OB_PROOF_BY('15:10') }, { item: 'Receiver signature', status: 'refused', captured: OB_PROOF_BY('15:10') }, { item: 'Receiver name', status: 'received', captured: OB_PROOF_BY('15:10') }],
    facts: [['Refusal reason', 'Damaged bags'], ['Refused', '26 Sep 2026, 15:10 CAT'], ['Received', '0.000 t']] };
  if (state === 'Received beside shipped') return { items: all('received'), facts: [['Shipped', '34.020 t'], ['Received', '33.880 t'], ['Difference', '0.140 t'], ['Source', 'Scanned slip'], ['Counterparty status', <ConfirmationChip kind="confirmed" />]] };
  if (state === 'Superseded proof') return { items: [{ item: 'Photograph', status: 'superseded', captured: OB_PROOF_BY('14:38') }, ...all('received')], facts: [['Superseded', 'Photograph too dark to read, captured again']] };
  if (state === 'Delivered') return { items: all('received'), facts: [['Shipped', '34.020 t'], ['Received', '34.020 t']] };
  return { items: all('awaiting') };
}

const OB_DN_HISTORY = [
  { id: 'h4', field: 'Status', user: 'S. Banda', old: 'Ready to dispatch', next: 'Shipped', date: '26 Sep 2026, 08:30', reason: '' },
  { id: 'h3', field: 'Second weighing, gross (t)', user: 'S. Banda', old: '48.400', next: '48.140', date: '26 Sep 2026, 08:21', reason: 'Re-weighed: tarpaulin left on the scale' },
  { id: 'h2', field: 'Loaded (t)', user: 'S. Banda', old: '', next: '34.120', date: '26 Sep 2026, 08:18', reason: '' },
  { id: 'h1', field: 'Status', user: 'S. Banda', old: '', next: 'Draft', date: '26 Sep 2026, 07:50', reason: 'Created from LO-2240' },
];

/** A note's loaded lines, read only, with the commodity colour square (UX-27) and the Total on a grey band. */
function ObLines({ commodity, name, stack, weight }) {
  return (
    <WbTable title="Loaded lines" count={1} objects="lines" columns={[
      { key: 'name', label: 'Commodity', width: '140px', render: (r) => (r.total ? wbStrong(r, 'Total') : <CommodityMarker commodity={commodity}>{r.name}</CommodityMarker>) },
      { key: 'grade', label: 'Grade or pack', width: '140px' }, { key: 'stack', label: 'Stack or bay', width: '120px' },
      { key: 'weight', label: 'Weight (t)', width: '110px', align: 'right', render: (r) => wbStrong(r, r.weight) },
    ]} rows={[{ id: 'l1', name, grade: commodity === 'fertilizer' ? '50 kg bag' : 'Grade 1', stack, weight }, { id: 'total', total: true, weight }]} />
  );
}

/** Override variance, Ryan only (S14 R6, UX-22): Override is enabled once a reason is entered. */
export function DeliveryNote({ state = 'Ready to dispatch' }) {
  const narrow = inNarrow();
  const initial = state === 'History' ? 'History' : state === 'Related' ? 'Related' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const d = obDnFor(state);
  const ryan = OB_STOCK_DN.includes(state);
  const trading = state === 'Trading view';
  let fields;
  let actions = null;
  let banner = null;
  let details;
  if (d.fert) {
    const within = state === 'Within variance';
    const net = within ? '27.380' : '27.610';
    const tare = '13.900';
    const gross = within ? '41.280' : '41.510';
    const flagged = weighbridgeVariance('27.240', net, 1).flagged;
    fields = [{ label: 'Loading order', value: 'LO-2231', link: '#' }, { label: 'Customer', value: 'Lakeview Farms Ltd' }, { label: 'Truck', value: 'ABZ 4412' },
      { label: 'Theoretical', value: '27.240 t' }, { label: 'Weighbridge net', value: `${net} t` }, { label: 'Created from', value: 'LO-2231' },
      ...(flagged && !ryan ? [{ label: 'Waiting for', value: 'R. Daka' }] : [])];
    if (ryan) actions = <Button size="small" loading={state === 'Overriding variance'}>Override variance</Button>;
    else actions = <Button size="small" disabled={flagged}>Ship</Button>;
    details = (
      <InSide side={<>
        <VarianceReconcile theoretical="27.240" net={net} allowedPct={1} extra={[{ label: 'Count sheet', value: 'Matches' }]} />
        {flagged ? <Refusal action="Ship" reason="Weighbridge net is beyond the allowed variance" /> : null}
      </>}>
        <WbTable title="Loaded lines" count={2} objects="lines" columns={[
          { key: 'product', label: 'Product', width: 'minmax(120px, 1fr)', render: (r) => (r.total ? wbStrong(r, 'Total') : <CommodityMarker commodity="fertilizer">{r.product}</CommodityMarker>) },
          { key: 'pack', label: 'Pack', width: '130px' }, { key: 'sheet', label: 'Count sheet', width: '110px', align: 'right', render: (r) => wbStrong(r, r.sheet) },
          { key: 'loaded', label: 'Loaded', width: '90px', align: 'right', render: (r) => wbStrong(r, r.loaded) },
          { key: 'weight', label: 'Theoretical (t)', width: '120px', align: 'right', render: (r) => wbStrong(r, r.weight) },
        ]} rows={[...OB_FERT_LOADED.map((l) => ({ ...l, pack: l.pack.split(',')[0] })), { id: 'total', total: true, sheet: '1,000', loaded: '1,000', weight: '27.240' }]} />
        <ObWeighings ticket="WBT10001623" rows={[
          { id: 'w1', weighing: 'First weighing, tare', weight: tare, time: '26 Sep 2026, 09:20', source: 'Weighbridge' },
          { id: 'w2', weighing: 'Second weighing, gross', weight: gross, time: '26 Sep 2026, 09:52', source: 'Weighbridge' },
          { id: 'net', total: true, weighing: 'Net', weight: net },
        ]} />
        <Card title="Delivery note information">
          <WbFacts min={160} fields={[['Source', 'Weighbridge'], ['Counterparty status', <ConfirmationChip kind="pending" />], ['Allowed variance', '1.0%'], ['Overrides', 'Stock control only']]} />
        </Card>
      </InSide>
    );
    if (state === 'Override variance' || state === 'Overriding variance') {
      details = <>{details}
        <ReasonDialog title="Override variance, DN-0884" confirmLabel="Override" minLength={1} busy={state === 'Overriding variance'} sheet={narrow}
          defaultReason={state === 'Overriding variance' ? 'Foliar Feed containers from the new supplier batch are heavier than the pack weight on record.' : ''}>
          DN-0884 ships at the weighbridge weight of 27.610 t.
        </ReasonDialog>
      </>;
    }
  } else {
    const grain = { lo: 'LO-2240', truck: 'AAZ 3310', net: '34.120', payload: '34.500', ordered: '34.000', tare: '14.020', gross: '48.140' };
    const shippedOn = '26 Sep 2026, 08:30';
    const commodity = d.ref === 'DN-0875' || d.ref === 'DN-0886' || d.ref === 'DN-0885' ? 'maize' : d.ref === 'DN-0883' ? 'fertilizer' : 'wheat';
    const name = { maize: 'Maize', fertilizer: 'Fertiliser', wheat: 'Wheat' }[commodity];
    const customer = d.ref === 'DN-0885' ? 'Cameron Estates' : d.ref === 'DN-0883' ? 'Lakeview Farms Ltd' : 'Riverbend Milling';
    const shipped = d.ref === 'DN-0875' ? '33.880' : d.ref === 'DN-0878' ? '34.020' : '34.120';
    const lo = trading ? { label: 'Loading order', value: 'LO-2240', link: '#' } : { label: 'Loading order', value: d.ref === 'DN-0875' ? 'LO-2226' : 'LO-2240', link: '#' };
    fields = [{ label: 'Customer', value: customer }, lo, { label: 'Commodity', value: <CommodityMarker commodity={commodity}>{name}</CommodityMarker> }];
    if (d.status === 'ready') {
      fields = [...fields, { label: 'Truck', value: grain.truck }, { label: 'Ticket net', value: `${grain.net} t` }, { label: 'Loaded', value: `${grain.net} t` }];
      actions = <Button size="small" loading={state === 'Shipping'}>Ship</Button>;
    } else if (d.status === 'closed') {
      fields = [...fields, { label: 'Truck', value: 'BCA 2216' }, { label: 'Closed', value: '26 Sep 2026, 07:40' }];
    } else {
      fields = [...fields, { label: 'Shipped', value: `${shipped} t` }, { label: 'Shipped on', value: d.ref === 'DN-0875' ? '25 Sep 2026, 14:02' : shippedOn }, { label: 'Truck', value: d.ref === 'DN-0875' ? 'ACE 1190' : grain.truck }];
    }
    // The same note opened by Trading shows the money from the same layout (UX-11); the clerk's has no such field.
    if (trading) fields = [...fields, { label: 'Sell price', value: 'USD 284.40 per t' }, { label: 'Value', value: 'USD 9,703.73' }];
    if (state === 'Proof missing') banner = <ConditionBanner>Proof of delivery not received after 1 day.</ConditionBanner>;
    if (state === 'Delivery refused') banner = <ConditionBanner>Refused by the receiver at Riverbend Milling, 26 Sep 2026, 15:10 CAT. The load comes back on a return ticket.</ConditionBanner>;
    if (state === 'Reversed') banner = <ConditionBanner>Returned on WBT10001630, 27 Sep 2026, 10:05 CAT. Stock and the delivery are reversed.</ConditionBanner>;
    const superseded = state === 'Superseded weighing';
    const weighings = [
      { id: 'w1', weighing: 'First weighing, tare', weight: grain.tare, time: '26 Sep 2026, 07:55', source: 'Weighbridge' },
      ...(superseded ? [{ id: 'w0', superseded: true, weighing: 'Second weighing, gross: tarpaulin left on the scale', weight: '48.400', time: '26 Sep 2026, 08:12', source: 'Weighbridge' }] : []),
      { id: 'w2', weighing: 'Second weighing, gross', weight: grain.gross, time: '26 Sep 2026, 08:21', source: 'Weighbridge' },
      { id: 'net', total: true, weighing: 'Net', weight: grain.net },
    ];
    const info = <Card title="Delivery note information">
      <WbFacts min={160} fields={[['Source', 'Weighbridge'], ['Counterparty status', <ConfirmationChip kind={d.status === 'delivered' ? 'confirmed' : 'pending'} />], ['Delivery point', `${customer}, ${customer === 'Riverbend Milling' ? 'Lusaka offload' : 'farm gate'}`],
        ['Site', 'Chisamba Shed'], ...(d.status === 'closed' ? [['Closed by', 'S. Banda'], ['Reason', 'Truck withdrawn by the transporter before loading'], ['Ticket', 'Freed for another note']] : [['Created by', 'S. Banda']])]} />
    </Card>;
    if (d.status === 'ready' || state === 'Superseded weighing') {
      details = (
        <InSide side={<><OutboundReconcile ordered={grain.ordered} loaded={grain.net} net={grain.net} tolerance={OB_TOL} /><ObPayload g={grain} /></>}>
          <ObWeighings ticket="WBT10001621" rows={weighings} />
          <ObLines commodity="wheat" name="Wheat" stack="Shed A, A1" weight={grain.net} />
          {info}
        </InSide>
      );
    } else if (d.status === 'reversed') {
      details = <>
        <WbTable title="Results" count={3} objects="results" columns={[
          { key: 'result', label: 'Result', width: '200px' }, { key: 'detail', label: 'Detail' }, { key: 'status', label: 'Status', width: '140px', render: (r) => r.status },
        ]} rows={[
          { id: 'r1', result: 'Stock movement', detail: 'Wheat grade 1, -34.120 t, Shed A, stack A1, 26 Sep 2026', status: obMark('clean', 'Posted') },
          { id: 'r2', result: 'Reversal', detail: 'Wheat grade 1, +34.120 t, Shed A, stack A1, from WBT10001630', status: obMark('clean', 'Posted') },
          { id: 'r3', result: 'Contract leg delivery', detail: 'SYN4702: shipped 34.120 t, reversed by a compensating entry', status: obMark('clean', 'Reversed') },
        ]} />
        {info}
      </>;
    } else if (d.status === 'closed') {
      details = info;
    } else {
      const p = obProof(state);
      details = <>
        <ProofOfDelivery items={p.items} facts={p.facts || []} />
        <ObLines commodity={commodity} name={name} stack={commodity === 'maize' ? 'Shed A, A3' : commodity === 'fertilizer' ? 'Shed B, B1' : 'Shed A, A1'} weight={shipped} />
        {info}
      </>;
    }
  }
  return (
    <Sections>
      <WbHead title={d.ref} />
      {banner}
      <RecordHighlights kind="Delivery note" title={d.ref} status={OB_DN_STATUS[d.status]} actions={actions} fields={fields} tab={tab} onTab={setTab} />
      {tab === 'History' ? (
        <WbTable title="History" count={OB_DN_HISTORY.length} objects="changes" columns={[
          { key: 'field', label: 'Field', width: '190px' }, { key: 'user', label: 'User', width: '110px' },
          { key: 'old', label: 'Old value', width: '130px' }, { key: 'next', label: 'New value', width: '130px' },
          { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true }, { key: 'reason', label: 'Reason' },
        ]} rows={OB_DN_HISTORY} />
      ) : tab === 'Related' ? (
        <Sections>
          <WbTable title="Loading orders" count={1} objects="loading orders" columns={[
            { key: 'ref', label: 'Loading order', width: '140px', render: (r) => <RefCell>{r.ref}</RefCell> }, { key: 'customer', label: 'Customer', width: '170px' },
            { key: 'qty', label: 'Quantity (t)', width: '120px', align: 'right' }, { key: 'status', label: 'Status', render: () => OB_LO_STATUS.ready },
          ]} rows={[{ id: 'l1', ref: 'LO-2240', customer: 'Riverbend Milling', qty: '34.000' }]} />
          <WbTable title="Weighbridge tickets" count={1} objects="weighbridge tickets" columns={[
            { key: 'ref', label: 'Ticket', width: '140px', render: (r) => <RefCell>{r.ref}</RefCell> }, { key: 'truck', label: 'Truck', width: '110px' },
            { key: 'net', label: 'Net (t)', width: '100px', align: 'right' }, { key: 'source', label: 'Source', width: '130px' },
          ]} rows={[{ id: 't1', ref: 'WBT10001621', truck: 'AAZ 3310', net: '34.120', source: 'Weighbridge' }]} />
        </Sections>
      ) : details}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Delivery notes, Ryan's list (ryan__08, S14 R4) */

const OB_NOTES = [
  { id: 'n1', ref: 'DN-0884', date: '26 Sep 2026, 09:55', lo: 'LO-2231', customer: 'Lakeview Farms Ltd', route: 'Physical', tonnes: '27.610', grn: '', status: 'variance', today: true },
  { id: 'n2', ref: 'DN-0883', date: '26 Sep 2026, 06:55', lo: '', customer: 'Lakeview Farms Ltd', route: 'Virtual', tonnes: '20.020', grn: 'GRN10000391', status: 'delivered', today: true },
  { id: 'n3', ref: 'DN-0882', date: '26 Sep 2026, 06:10', lo: 'LO-2228', customer: 'Cameron Estates', route: 'Physical', tonnes: '12.040', grn: '', status: 'shipped', today: true },
  { id: 'n4', ref: 'DN-0879', date: '25 Sep 2026, 15:10', lo: '', customer: 'Cameron Estates', route: 'Direct', tonnes: '40.000', grn: 'GRN10000386', status: 'delivered' },
];

export function DeliveryNotes({ state = 'All' }) {
  const routes = ['Physical', 'Virtual', 'Direct'];
  const rows = state === 'Empty' ? [] : routes.includes(state) ? OB_NOTES.filter((n) => n.route === state) : state === 'Today' ? OB_NOTES.filter((n) => n.today) : OB_NOTES;
  return (
    <Sections>
      <WbHead title="Delivery notes" count={rows.length} right={<Button variant="outline" size="small" icon="download" loading={state === 'Exporting'}>Export</Button>} />
      <ScrollRow>
        {['All', ...routes, 'Today'].map((f) => <Capsule key={f} selected={state === f || (f === 'All' && !['Physical', 'Virtual', 'Direct', 'Today'].includes(state))}>{f}</Capsule>)}
      </ScrollRow>
      <WbTable columns={[
        { key: 'ref', label: 'Delivery note', width: '130px', render: (r) => <RefCell>{r.ref}</RefCell> },
        { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true },
        { key: 'lo', label: 'Loading order', width: '130px', render: (r) => (r.lo ? <RefCell>{r.lo}</RefCell> : '') },
        { key: 'customer', label: 'Customer', width: 'minmax(160px, 1fr)' },
        // Route is plain text, never a coloured tag (UX-26).
        { key: 'route', label: 'Route', width: '100px' },
        { key: 'tonnes', label: 'Tonnes', width: '100px', align: 'right' },
        // A linked goods received note is a field of its own, never part of the status word (UX-32).
        { key: 'grn', label: 'Goods received note', width: '170px', render: (r) => (r.grn ? <RefCell>{r.grn}</RefCell> : '') },
        { key: 'status', label: 'Status', width: '160px', render: (r) => OB_DN_STATUS[r.status] },
      ]} rows={rows} objects="delivery notes" />
    </Sections>
  );
}

/* ------------------------------------------------------------------ Direct delivery, Ryan's capture (AB-CLERK-DIRECT, S14 R7) */

function obDirectFor(state) {
  if (state === 'Virtual warehouse' || state === 'On hold') return { ref: 'WBT10001631' };
  return { ref: 'LEG-5106' };
}

export function DirectDelivery({ state = 'Counts match' }) {
  const finalising = state === 'Finalising';
  const virtual = state === 'Virtual warehouse';
  const held = state === 'On hold';
  const differ = state === 'Count difference';
  if (state === 'Finalised' || held) {
    // One capture, two linked notes (RL-DIRECT-LINKED). Held: no movement, contract delivery or margin until Managing
    // Director or Trading decides; the delivery note still exists, On hold, so proof can be captured (M4.OUT.02).
    const notes = held ? [
      { id: 'n1', type: 'Goods received note', ref: 'GRN10000393', into: 'Virtual warehouse', tonnes: '29.100', status: 'on-hold' },
      { id: 'n2', type: 'Delivery note', ref: 'DN-0893', into: 'Lakeview Farms farm gate', tonnes: '29.100', status: 'on-hold' },
    ] : [
      { id: 'n1', type: 'Goods received note', ref: 'GRN10000392', into: 'Direct, no warehouse', tonnes: '40.000', status: 'booked' },
      { id: 'n2', type: 'Delivery note', ref: 'DN-0892', into: 'Cameron Estates farm gate', tonnes: '40.000', status: 'delivered' },
    ];
    const noteStatus = (s) => (s === 'on-hold' ? obMark('attention', 'On hold') : s === 'booked' ? obMark('clean', 'Booked') : OB_DN_STATUS.delivered);
    return (
      <Sections>
        <WbHead title={held ? 'WBT10001631' : 'LEG-5106'} />
        <RecordHighlights kind={held ? 'Virtual warehouse capture' : 'Direct delivery'} title={held ? 'WBT10001631' : 'LEG-5106'} tab="Details" tabs={null}
          status={held ? obMark('attention', 'On hold') : obMark('clean', 'Delivered')}
          fields={held ? [{ label: 'Route', value: 'Virtual' }, { label: 'Farmer', value: 'Lakeview Farms Ltd' }, { label: 'Ticket net', value: '30.000 t' }, { label: 'Lines total', value: '29.100 t' }, { label: 'Waiting for', value: 'T. Mwila or J. Tembo' }]
            : [{ label: 'Route', value: 'Direct' }, { label: 'Farmer', value: 'Cameron Estates' }, { label: 'Tonnes', value: '40.000 t' }, { label: 'Quantity source', value: 'Supplier document, Farmer confirmation' }, { label: 'Finalised by', value: 'R. Daka' }]} />
        <WbTable title="Linked notes" count={notes.length} objects="notes" columns={[
          { key: 'type', label: 'Note', width: '170px' }, { key: 'ref', label: 'Reference', width: '140px', render: (r) => <RefCell>{r.ref}</RefCell> },
          { key: 'into', label: 'Into or to', width: 'minmax(160px, 1fr)' }, { key: 'tonnes', label: 'Tonnes', width: '100px', align: 'right' },
          { key: 'status', label: 'Status', width: '130px', render: (r) => noteStatus(r.status) },
        ]} rows={notes} />
        {held ? (
          <ReconcileCard title="Reconcile" outcome="beyond" rows={[{ label: 'Ticket net', value: '30.000 t' }, { label: 'Lines total', value: '29.100 t' }, { label: 'Variance', value: '0.900 t', strong: true }, { label: 'Tolerance', value: '0.080 t' }]} />
        ) : (
          <WbTable title="Results" count={3} objects="results" columns={[
            { key: 'result', label: 'Result', width: '200px' }, { key: 'detail', label: 'Detail' }, { key: 'status', label: 'Status', width: '140px', render: (r) => r.status },
          ]} rows={[
            { id: 'r1', result: 'Physical warehouse', detail: 'Unchanged: a direct delivery never enters a warehouse', status: obMark('clean', 'Recorded') },
            { id: 'r2', result: 'On the road', detail: 'LEG-5106 cleared by GRN10000392', status: obMark('clean', 'Cleared') },
            { id: 'r3', result: 'Contract deliveries', detail: 'FRT-221-A received 40.000 t; FRT-221-S shipped 40.000 t', status: obMark('clean', 'Recorded') },
          ]} />
        )}
      </Sections>
    );
  }
  const received = differ ? '780' : '800';
  const diff = 800 - parseInt(received, 10);
  return (
    <Sections>
      <WbHead title={virtual ? 'Virtual warehouse capture' : 'Direct delivery'} right={<>
        <Button variant="ghost" size="small" disabled={finalising}>Cancel</Button>
        <Button size="small" loading={finalising}>Finalise</Button>
      </>} />
      <InSide side={virtual ? (
        <ReconcileCard rows={[{ label: 'Ticket net', value: '30.000 t' }, { label: 'Lines total', value: '30.000 t' }, { label: 'Variance', value: '0.000 t', strong: true }, { label: 'Tolerance', value: '0.080 t' }]} outcome="within" />
      ) : (
        <ReconcileCard status={diff ? 'Count difference' : 'Counts match'} outcome={diff ? 'beyond' : 'within'} rows={[
          { label: 'Bags dispatched', value: '800' }, { label: 'Bags received', value: received }, { label: 'Difference', value: String(diff), strong: true },
          { label: 'Tonnes', value: differ ? '39.000 t' : '40.000 t' }, { label: 'Quantity source', value: 'Supplier document, Farmer confirmation' },
          ...(diff ? [{ label: 'Exception', value: 'Count difference, owner Stock control' }] : []),
        ]} />
      )}>
        {virtual ? <>
          <Card title="Ticket">
            <WbFacts min={130} fields={[['Ticket', <RefCell>WBT10001631</RefCell>], ['Truck', 'BCA 2240'], ['Net', '30.000 t'], ['Source', 'Weighbridge'], ['Counterparty status', <ConfirmationChip kind="pending" />]]} />
          </Card>
          <Card title="Pass-through">
            <WbFacts min={150} fields={[['Route', 'Virtual'], ['Supplier leg', 'FRT-219-A'], ['Farmer', 'Lakeview Farms Ltd'], ['Sale leg', 'FRT-219-S'], ['Delivery point', 'Lakeview Farms farm gate'], ['Offloaded', 'No']]} />
          </Card>
          <WbTable title="Lines" count={1} objects="lines" columns={[
            { key: 'product', label: 'Product', width: '140px', render: (r) => (r.total ? wbStrong(r, 'Total') : <CommodityMarker commodity="fertilizer">{r.product}</CommodityMarker>) },
            { key: 'pack', label: 'Pack', width: '120px' }, { key: 'bags', label: 'Bags', width: '90px', align: 'right', render: (r) => wbStrong(r, r.bags) },
            { key: 'weight', label: 'Weight (t)', width: '110px', align: 'right', render: (r) => wbStrong(r, r.weight) },
          ]} rows={[{ id: 'l1', product: 'Urea', pack: '50 kg bag', bags: '600', weight: '30.000' }, { id: 'total', total: true, bags: '600', weight: '30.000' }]} />
        </> : <>
          <Card title="Dispatch leg">
            <WbFacts min={150} fields={[['Leg', <RefCell>LEG-5106</RefCell>], ['Route', 'Direct'], ['Farmer', 'Cameron Estates'], ['Dispatched', '22 Sep 2026, truck BCA 2231'], ['Supplier leg', 'FRT-221-A'], ['Sale leg', 'FRT-221-S']]} />
          </Card>
          <Card title="Dispatched side">
            <InFields>
              <Field label="Supplier delivery document" required><Input defaultValue="SD-77410" disabled={finalising} /></Field>
              <Field label="Product and pack" required><Select options={['Urea, 50 kg bag']} disabled={finalising} /></Field>
              <Field label="Bags dispatched" required><Input align="right" defaultValue="800" disabled={finalising} /></Field>
            </InFields>
          </Card>
          <Card title="Received side">
            <InFields>
              <Field label="Confirmed by" required><Input defaultValue="M. Banda, Cameron Estates" disabled={finalising} /></Field>
              <Field label="Received" required><Input defaultValue="25 Sep 2026, 14:40" disabled={finalising} /></Field>
              <Field label="Bags received" required><Input align="right" defaultValue={received} invalid={!!diff} disabled={finalising} /></Field>
            </InFields>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><EvidenceTile kind="receipt" caption="signed-receipt-cameron-estates" time="14:40" /></div>
          </Card>
        </>}
      </InSide>
    </Sections>
  );
}
