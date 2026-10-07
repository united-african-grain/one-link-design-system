/** Weighbridge continuity (M2.DS.01, UAG-32): the Clerk's Home with its Problem rows, the Weighbridge tickets list
    view (UX-07) with its stalled, scanned slip site, closed and one-site-and-date states and the Close dialog, the
    Scanned slip screen with every reading state, the weighbridge ticket record page and the site's feed health.
    They sit beside Weighbridge.jsx, which keeps its own screens. Every screen takes `state`, one of its TICKETS_STATES
    entry, so the kit's index and the screenshot review open any state with ?screen=&state=.

    The weight's source is the labelled field Source (Weighbridge or Scanned slip), the ticket's readiness is its status
    (ReadinessChip) and counterparty agreement is the field Counterparty status: three things, never merged (P9). No
    price or money appears on any of these screens. No weight is entered without the slip photo beside it (R-08).
    Fictional sample data only: Chisamba Shed, Mpongwe Depot, Site A gate, Lakeview Farms Ltd, Cameron Estates. */

export const TICKETS_STATES = {
  ClerkHome: ['Inbound', 'Weighbridge offline', 'Close problem', 'Closing problem'],
  TicketsList: ['All', 'Delayed', 'Offline', 'Stalled', 'Scanned slip site', 'Closed', 'Close', 'Closing', 'One site and date', 'Exporting', 'Empty'],
  ScannedSlip: ['Read clearly', 'Check', 'Corrected', 'Net disagrees', 'Tare at or above gross', 'Photo already used', 'Confirming', 'Reading', 'Pending reading', 'Reading failed', 'Second confirmation', 'Second confirmation, first confirmer', 'Withdraw'],
  TicketRecord: ['Ready', 'Receiving', 'From scanned slip', 'History', 'Later scale record', 'Keeping weights', 'Closed'],
  FeedHealth: ['Connected', 'Delayed', 'Offline'],
};

/** The Clerk's navigation (canvas S13): Home, Logistics with its sections, Inventory, Reports. */
export const CLERK_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'logistics', label: 'Logistics', icon: 'truck', sections: [{ value: 'tickets', label: 'Weighbridge tickets' }, { value: 'received', label: 'Goods received' }] },
  { value: 'inventory', label: 'Inventory', icon: 'warehouse' },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
] }];
export const CLERK = { initials: 'SB', name: 'S. Banda', meta: 'Clerk, Chisamba Shed' };

/** Where a screen sits in the Clerk's frame: the module the navigation highlights (Logistics on ticket and slip
    pages, UX-04) and the breadcrumb. */
export function ticketsFrame(screen, state) {
  const crumbs = ['Logistics', 'Weighbridge tickets'];
  if (screen === 'ClerkHome') return { module: 'home', breadcrumb: ['Home'] };
  if (screen === 'ScannedSlip') return { module: 'logistics', section: 'tickets', breadcrumb: [...crumbs, 'Scanned slip'] };
  if (screen === 'TicketRecord') return { module: 'logistics', section: 'tickets', breadcrumb: [...crumbs, ticketRecordRef(state)] };
  // The last crumb is the phone toolbar's title, so it stays short: the page title names the site's weighbridge.
  if (screen === 'FeedHealth') return { module: 'logistics', section: 'tickets', breadcrumb: [...crumbs, 'Feed health'] };
  return { module: 'logistics', section: 'tickets', breadcrumb: crumbs };
}

function ticketRecordRef(state) {
  if (state === 'Closed') return 'WBT10001599';
  if (state === 'Ready' || state === 'Receiving') return 'WBT10001606';
  return 'WBT10001614';
}

const SLIP_PHOTO = '../../assets/samples/slip-chisamba-10001614.svg';
const SLIP_PRINT = '7C4E 19A2 D0B3 B21A';
const wbNarrow = () => !useMinWidth(768);

/** Label and value pairs: the Ticket source card, a record's Details cards, feed health. Blank when a value does not exist. */
function WbFacts({ fields, min = 180 }) {
  return (
    <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 16 }}>
      {fields.map(([label, value]) => (
        <div key={label} data-fact={label} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <dt style={textStyle('body-4', { tone: 'secondary' })}>{label}</dt>
          <dd style={{ margin: 0, minHeight: 20, ...textStyle('body-3', { tabular: true }), overflowWrap: 'anywhere' }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Sentence-case title with its count and the actions on the right (UX-07). */
function WbHead({ title, count, meta, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <Text as="h1" variant="heading-2" strong style={{ margin: 0, overflowWrap: 'anywhere' }}>{title}</Text>
          {count != null ? <Count>{count}</Count> : null}
        </span>
        {meta ? <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, ...textStyle('body-3', { tone: 'secondary' }), fontVariantNumeric: 'tabular-nums' }}>{meta}</span> : null}
      </span>
      {right ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{right}</div> : null}
    </div>
  );
}

/** The view selector, filters and search row of a list view (UX-07). */
function WbFilters({ view, filters, search }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <ScrollRow><Capsule chevron selected>{view}</Capsule>{filters}</ScrollRow>
      <SearchField placeholder={search} hint={null} maxWidth={320} />
    </div>
  );
}

/** A table inside a titled card, edge to edge, scrolling on a phone; text wraps and is never cut; nothing to show reads
    "No [objects] to display." */
function WbTable({ title, count, objects, action, columns: given, rows }) {
  // Wording, names and references wrap rather than being cut; figures stay on one line.
  // A flexible column keeps the 160px floor the scroll width assumes, so wrapped words are never squeezed to letters.
  const columns = given.map((c) => ({ wrap: c.align !== 'right', width: c.width || 'minmax(160px, 1fr)', ...c }));
  const min = columns.reduce((n, c) => n + (c.width && /px$/.test(c.width) ? parseInt(c.width, 10) : 160), 0);
  const table = rows.length ? <DataTable rowKey="id" columns={columns} rows={rows} minWidth={min} /> : <EmptyState title={`No ${objects} to display.`} style={{ padding: '16px 0 8px' }} />;
  if (!title) return <Card padding={rows.length ? 4 : 16}>{table}</Card>;
  return <Card gap={8} title={<>{title}{count != null ? <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 8 }}><Count>{count}</Count></span> : null}</>} headerRight={action}>{rows.length ? <div style={{ margin: '0 -16px -16px' }}>{table}</div> : table}</Card>;
}

/** A total row's cell: strong, so the Total row reads apart from the rows above it (UX-26). */
const wbStrong = (r, v) => (r.total ? <Text variant="body-3" strong tabular>{v}</Text> : v);

/** Connection status (S57 Integrations: Connected, Delayed, Offline), an icon and a word. */
export function ConnectionStatus({ status = 'Connected' }) {
  const kind = status === 'Offline' ? 'breach' : status === 'Delayed' ? 'pending' : 'clean';
  return <StatusMark kind={kind} label={status} size="body-4" />;
}

/** The banner of a silent weighbridge (UX-24, S57 "[Source] is offline since [time]."), naming the site and CAT. */
function OfflineBanner() {
  return <Banner tone="error">Chisamba Shed weighbridge is offline since 09:10 CAT.</Banner>;
}

/* ------------------------------------------------------------------ Clerk Home (CS-CLERK-01) */

const QUEUE = [
  { id: 'q1', item: 'WBT10001603', link: true, type: 'Ticket', commodity: 'wheat', product: 'Wheat', detail: 'Net differs from the printed slip', status: 'problem', age: '1 h', action: 'Review' },
  { id: 'q2', item: 'Slip photo, 08:40', type: 'Slip photo', commodity: 'maize', product: 'Maize', detail: 'Not read yet', status: 'problem', age: '50 min', action: 'Close' },
  { id: 'q3', item: 'Weighbridge record 10001611', type: 'Weighbridge record', commodity: 'maize', product: 'Maize', detail: 'Refused: ticket number already received', status: 'problem', age: '2 h', action: 'Close' },
  { id: 'q4', item: 'WBT10001599', link: true, type: 'Ticket', commodity: 'maize', product: 'Maize', detail: 'Weighed in, not weighed out', status: 'stalled', age: '3 h', action: 'Close' },
  { id: 'q5', item: 'WBT10001606', link: true, type: 'Ticket', commodity: 'wheat', product: 'Wheat', detail: 'Truck ABZ 4412, net 32.140 t', status: 'ready', age: '12 min', action: 'Receive' },
  { id: 'q6', item: 'WBT10001608', link: true, type: 'Ticket', commodity: 'maize', product: 'Maize', detail: 'Truck BCA 2210, net 30.060 t', status: 'ready', age: '20 min', action: 'Receive' },
  { id: 'q7', item: 'WBT10001609', link: true, type: 'Ticket', commodity: 'soya', product: 'Soya', detail: 'Truck ALB 7714, net 8.420 t', status: 'ready', age: '25 min', action: 'Receive' },
];

export function ClerkHome({ state = 'Inbound', onOpen }) {
  const offline = state === 'Weighbridge offline';
  const closing = state === 'Closing problem';
  const narrow = wbNarrow();
  const meta = <>
    <span>Chisamba Shed</span><Dot style={{ margin: 0 }} />
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Weighbridge <ConnectionStatus status={offline ? 'Offline' : 'Connected'} /></span><Dot style={{ margin: 0 }} />
    <span>Last ticket 07:48 CAT</span><Dot style={{ margin: 0 }} /><span>Last refreshed 09:14</span>
  </>;
  const count = (s) => QUEUE.filter((q) => q.status === s).length;
  return (
    <Sections>
      <WbHead title="Home" meta={meta} right={<Button variant="outline" size="small" icon="scan-line">Scan slip</Button>} />
      {offline ? <OfflineBanner /> : null}
      <Tabs tabs={[{ value: 'Inbound', label: 'Inbound', count: QUEUE.length }, { value: 'Outbound', label: 'Outbound', count: 4 }]} value="Inbound" />
      <ScrollRow>
        <Capsule selected count={QUEUE.length}>All</Capsule>
        <Capsule count={count('ready')}>Ready</Capsule>
        <Capsule count={count('problem')}>Problem</Capsule>
        <Capsule count={count('stalled')}>Stalled</Capsule>
      </ScrollRow>
      <WbTable columns={[
        { key: 'item', label: 'Item', width: '220px', render: (r) => (r.link ? <span onClick={() => onOpen && onOpen(r.item)}><RefCell>{r.item}</RefCell></span> : r.item) },
        { key: 'type', label: 'Type', width: '160px' },
        { key: 'product', label: 'Commodity', width: '120px', render: (r) => <CommodityMarker commodity={r.commodity}>{r.product}</CommodityMarker> },
        { key: 'detail', label: 'Detail', width: narrow ? '280px' : undefined },
        { key: 'status', label: 'Status', width: '120px', render: (r) => <ReadinessChip kind={r.status} /> },
        { key: 'age', label: 'Age', width: '80px', tabular: true },
        { key: 'action', label: '', width: '110px', align: 'right', render: (r) => <Button size="xsmall" variant={r.action === 'Receive' ? 'primary' : 'outline'}>{r.action}</Button> },
      ]} rows={QUEUE} objects="items" />
      {state === 'Close problem' || closing ? (
        <ReasonDialog title="Close weighbridge record 10001611?" confirmLabel="Close" minLength={1} busy={closing} sheet={narrow}
          defaultReason={closing ? 'Duplicate of WBT10001605, received yesterday' : ''} />
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Weighbridge tickets list view (UX-07) */

const WB_ROWS = [
  { id: 't1', ref: 'WBT10001606', truck: 'ABZ 4412', direction: 'Inbound', counterparty: 'Lakeview Farms Ltd', gross: '46.280', tare: '14.140', net: '32.140', source: 'Weighbridge', status: 'ready' },
  { id: 't2', ref: 'WBT10001608', truck: 'BCA 2210', direction: 'Inbound', counterparty: 'Cameron Estates', gross: '44.020', tare: '13.960', net: '30.060', source: 'Weighbridge', status: 'ready' },
  { id: 't3', ref: 'WBT10001609', truck: 'ALB 7714', direction: 'Inbound', counterparty: 'Lakeview Farms Ltd', gross: '22.400', tare: '13.980', net: '8.420', source: 'Weighbridge', status: 'ready' },
  { id: 't4', ref: 'WBT10001614', truck: 'ABZ 4610', direction: 'Inbound', counterparty: 'Lakeview Farms Ltd', gross: '45.900', tare: '13.880', net: '32.020', source: 'Scanned slip', status: 'received' },
  { id: 't5', ref: 'WBT10001599', truck: 'BAX 1234', direction: 'Inbound', counterparty: 'Cameron Estates', gross: '38.500', tare: '', net: '', source: 'Weighbridge', status: 'weighed-in-only' },
];
const WB_STALLED = [
  { id: 's1', ref: 'WBT10001599', truck: 'BAX 1234', direction: 'Inbound', weighedIn: '26 Sep 2026, 06:12', gross: '38.500', age: '3 operating hours', status: 'stalled' },
  { id: 's2', ref: 'WBT10001612', truck: 'CAX 4410', direction: 'Inbound', weighedIn: '26 Sep 2026, 08:05', gross: '41.020', age: '1 operating hour', status: 'weighed-in-only' },
];
const WB_CLOSED = [
  { id: 'c1', ref: 'WBT10001588', truck: 'BLX 2290', direction: 'Inbound', closed: '25 Sep 2026, 16:40', by: 'S. Banda', reason: 'Truck left without weighing out', status: 'closed' },
  { id: 'c2', ref: 'WBT10001571', truck: 'ABZ 4501', direction: 'Outbound', closed: '24 Sep 2026, 11:05', by: 'S. Banda', reason: 'Load cancelled at the gate', status: 'closed' },
];
const WB_SLIP_SITE = [
  { id: 'm1', ref: 'WBT20000412', truck: 'BCA 9120', direction: 'Inbound', counterparty: 'Cameron Estates', gross: '42.300', tare: '13.700', net: '28.600', source: 'Scanned slip', status: 'ready' },
  { id: 'm2', ref: 'WBT20000411', truck: 'ALB 3305', direction: 'Inbound', counterparty: 'Lakeview Farms Ltd', gross: '', tare: '', net: '', source: 'Scanned slip', status: 'pending-reading' },
];
const WB_DAY = [
  { id: 'd1', ref: 'WBT10001606', truck: 'ABZ 4412', direction: 'Inbound', gross: '46.280', tare: '14.140', net: '32.140', source: 'Weighbridge', status: 'ready' },
  { id: 'd2', ref: 'WBT10001608', truck: 'BCA 2210', direction: 'Inbound', gross: '44.020', tare: '13.960', net: '30.060', source: 'Weighbridge', status: 'ready' },
  { id: 'd3', ref: 'WBT10001609', truck: 'ALB 7714', direction: 'Inbound', gross: '22.400', tare: '13.980', net: '8.420', source: 'Weighbridge', status: 'ready' },
  { id: 'd4', ref: 'WBT10001614', truck: 'ABZ 4610', direction: 'Inbound', gross: '45.900', tare: '13.880', net: '32.020', source: 'Scanned slip', status: 'received' },
  { id: 'total', total: true, ref: 'Total', truck: '', direction: '', gross: '158.600', tare: '55.960', net: '102.640', source: '', status: '' },
];

export function TicketsList({ state = 'All', onOpen }) {
  const narrow = wbNarrow();
  const slipSite = state === 'Scanned slip site';
  const day = state === 'One site and date' || state === 'Exporting';
  const stalled = state === 'Stalled' || state === 'Close' || state === 'Closing';
  const closedView = state === 'Closed';
  const connection = state === 'Offline' ? 'Offline' : state === 'Delayed' ? 'Delayed' : 'Connected';
  const site = slipSite ? 'Mpongwe Depot' : 'Chisamba Shed';
  const ref = (r) => (r.total ? <Text variant="body-3" strong>Total</Text> : <span onClick={() => onOpen && onOpen(r.ref)}><RefCell>{r.ref}</RefCell></span>);
  const truck = (r) => (r.truck ? <RefCell>{r.truck}</RefCell> : '');
  const status = (r) => (r.status ? <ReadinessChip kind={r.status} /> : '');
  const weights = [
    { key: 'gross', label: 'Gross (t)', width: '100px', align: 'right', render: (r) => wbStrong(r, r.gross) },
    { key: 'tare', label: 'Tare (t)', width: '100px', align: 'right', render: (r) => wbStrong(r, r.tare) },
    { key: 'net', label: 'Net (t)', width: '100px', align: 'right', render: (r) => wbStrong(r, r.net) },
  ];
  let view = 'All tickets';
  let columns = [
    { key: 'ref', label: 'Ticket', width: '140px', render: ref },
    { key: 'truck', label: 'Truck', width: '110px', render: truck },
    { key: 'direction', label: 'Direction', width: '100px' },
    { key: 'counterparty', label: 'Counterparty' },
    ...weights,
    { key: 'source', label: 'Source', width: '130px' },
    { key: 'status', label: 'Status', width: '170px', render: status },
  ];
  let rows = state === 'Empty' ? [] : slipSite ? WB_SLIP_SITE : WB_ROWS;
  if (stalled) {
    view = 'Problematic tickets';
    rows = WB_STALLED;
    columns = [
      { key: 'ref', label: 'Ticket', width: '140px', render: ref },
      { key: 'truck', label: 'Truck', width: '110px', render: truck },
      { key: 'direction', label: 'Direction', width: '100px' },
      { key: 'weighedIn', label: 'Weighed in', width: '170px', tabular: true },
      { key: 'gross', label: 'Gross (t)', width: '100px', align: 'right' },
      { key: 'age', label: 'Age', tabular: true },
      { key: 'close', label: '', width: '90px', align: 'right', render: () => <Button size="xsmall" variant="outline">Close</Button> },
      { key: 'status', label: 'Status', width: '170px', render: status },
    ];
  } else if (closedView) {
    view = 'Closed tickets';
    rows = WB_CLOSED;
    columns = [
      { key: 'ref', label: 'Ticket', width: '140px', render: ref },
      { key: 'truck', label: 'Truck', width: '110px', render: truck },
      { key: 'direction', label: 'Direction', width: '100px' },
      { key: 'closed', label: 'Closed', width: '170px', tabular: true },
      { key: 'by', label: 'Closed by', width: '110px' },
      { key: 'reason', label: 'Reason' },
      { key: 'status', label: 'Status', width: '120px', render: status },
    ];
  } else if (day) {
    view = 'All tickets';
    rows = WB_DAY;
    columns = [
      { key: 'ref', label: 'Ticket', width: '140px', render: ref },
      { key: 'truck', label: 'Truck', width: '110px', render: truck },
      { key: 'direction', label: 'Direction', width: '100px' },
      ...weights,
      { key: 'source', label: 'Source', width: '130px' },
      { key: 'status', label: 'Status', width: '150px', render: status },
    ];
  }
  const count = rows.filter((r) => !r.total).length;
  const meta = slipSite ? <><span>{site}</span><Dot style={{ margin: 0 }} /><span>Weight source Scanned slip</span></> : <>
    <span>{site}</span><Dot style={{ margin: 0 }} />
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Connection status <ConnectionStatus status={connection} /></span><Dot style={{ margin: 0 }} />
    <span>Last ticket 07:48 CAT</span>
  </>;
  const right = <>
    {day ? <Button variant="outline" size="small" icon="download" loading={state === 'Exporting'}>Export</Button> : null}
    <Button variant="outline" size="small" icon="scan-line">Scan slip</Button>
  </>;
  const filters = day ? <><Capsule chevron>Chisamba Shed</Capsule><Capsule chevron>26 Sep 2026</Capsule></>
    : <><Capsule selected={stalled}>Problematic</Capsule><Capsule selected={closedView}>Closed</Capsule></>;
  return (
    <Sections>
      <WbHead title="Weighbridge tickets" count={count} meta={meta} right={right} />
      {state === 'Offline' ? <OfflineBanner /> : null}
      <WbFilters view={view} filters={filters} search="Search this list" />
      <WbTable columns={columns} rows={rows} objects="weighbridge tickets" />
      {state === 'Close' || state === 'Closing' ? (
        <ReasonDialog title="Close WBT10001599?" confirmLabel="Close" minLength={1} busy={state === 'Closing'} sheet={narrow}
          defaultReason={state === 'Closing' ? 'Truck left without weighing out' : ''} />
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Scanned slip (CS-CLERK-09) */

const SLIP_FIELDS = [
  { key: 'ticket', label: 'Ticket number', read: '10001614', value: '10001614', numeric: true },
  { key: 'direction', label: 'Direction', read: 'Inbound', value: 'Inbound' },
  { key: 'vehicle', label: 'Vehicle', read: 'ABZ 4610', value: 'ABZ 4610' },
  { key: 'driver', label: 'Driver', read: 'P. Daka', value: 'P. Daka' },
  { key: 'supplier', label: 'Supplier as printed', read: 'LAKEVIEW FARMS', value: 'LAKEVIEW FARMS' },
  { key: 'in', label: 'Weigh-in time', read: '09:31', value: '09:31', numeric: true },
  { key: 'out', label: 'Weigh-out time', read: '09:52', value: '09:52', numeric: true },
  { key: 'gross', label: 'Gross (t)', read: '45.900', value: '45.900', numeric: true },
  { key: 'tare', label: 'Tare (t)', read: '13.880', value: '13.880', numeric: true },
  { key: 'net', label: 'Printed net (t)', read: '32.020', value: '32.020', numeric: true },
];
const slipFields = (patches) => SLIP_FIELDS.map((f) => ({ ...f, ...(patches[f.key] || {}) }));
const SLIP_STATE_FIELDS = {
  Check: { tare: { read: '13.380', value: '13.380', doubtful: true }, net: { read: '32.520', value: '32.520', doubtful: true } },
  Corrected: { tare: { read: '13.380', value: '13.880', doubtful: true }, net: { read: '32.520', value: '32.520', doubtful: true, checked: true } },
  'Net disagrees': { net: { read: '32.120', value: '32.120' } },
  'Tare at or above gross': { gross: { read: '13.880', value: '13.880' }, tare: { read: '45.900', value: '45.900' }, net: { read: '-32.020', value: '-32.020' } },
  'Second confirmation': { tare: { read: '13.380', value: '13.880', doubtful: true } },
};

export function ScannedSlip({ state = 'Read clearly' }) {
  const narrow = wbNarrow();
  const two = useMinWidth(1024);
  const second = state.startsWith('Second confirmation') || state === 'Withdraw';
  const [fields, setFields] = useState(() => slipFields(SLIP_STATE_FIELDS[second ? 'Second confirmation' : state] || {}));
  useEffect(() => setFields(slipFields(SLIP_STATE_FIELDS[second ? 'Second confirmation' : state] || {})), [state]);
  const change = (key, patch) => setFields((fs) => fs.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  const confirming = state === 'Confirming';
  const reading = state === 'Reading';
  const pending = state === 'Pending reading';
  const failed = state === 'Reading failed';
  const unread = reading || pending || failed;
  const tareBlock = state === 'Tare at or above gross';
  const used = state === 'Photo already used';
  const netNote = state === 'Net disagrees';
  const blocked = tareBlock || used || unread || (netNote) || !fieldsReady(fields);
  const viewer = state === 'Second confirmation' ? 'M. Zulu' : 'S. Banda';
  const head = (
    <WbHead title="Scanned slip" right={second ? <Button variant="outline" size="small">Cancel</Button> : <>
      <Button variant="outline" size="small" disabled={confirming}>Cancel</Button>
      <Button size="small" disabled={blocked && !confirming} loading={confirming}>Confirm weights</Button>
    </>} />
  );
  const photo = (
    <Card title="Slip photo">
      <EvidenceViewer src={SLIP_PHOTO} fingerprint={SLIP_PRINT} height={narrow ? 260 : 420} />
    </Card>
  );
  const weights = (
    <Card title="Weights" headerRight={pending ? <ReadinessChip kind="pending-reading" /> : null}>
      {reading ? <div aria-busy="true" style={{ display: 'flex', justifyContent: 'center', padding: '48px 0', color: 'var(--content-secondary)' }}><Icon name="loader-circle" size={24} stroke={1.75} spin /></div>
        : pending ? null
        : failed ? <Banner tone="error">Reading failed. Take the photo again.</Banner>
        : <div style={{ margin: '0 -16px' }}><FieldCheck fields={fields} onChange={change} evidence={SLIP_PRINT} disabled={confirming || second} /></div>}
      {netNote ? (
        <Field label="Note" required hint="Printed net 32.120 t. Gross minus tare 32.020 t.">
          <Input multiline placeholder="Why the printed net differs" />
        </Field>
      ) : null}
    </Card>
  );
  const source = (
    <Card title="Ticket source">
      <WbFacts min={160} fields={[['Source', 'Scanned slip'], ['Photographed by', 'S. Banda'], ['Photographed', '26 Sep 2026, 09:55 CAT'], ['Direction', 'Inbound']]} />
    </Card>
  );
  const refusal = tareBlock ? <Refusal action="Confirm weights" reason="Tare must be less than gross" />
    : used ? <Refusal action="Confirm weights" reason="This photo is already used on WBT10001588" /> : null;
  const confirmation = second ? (
    <SecondConfirmation field="Tare (t)" reading="13.380" entered="13.880" firstBy="S. Banda" firstAt="26 Sep 2026, 09:58 CAT" viewer={viewer} />
  ) : null;
  const right = <Sections>{refusal}{confirmation}{weights}{source}</Sections>;
  return (
    <Sections>
      {head}
      {two ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.25fr)', gap: 'var(--card-gap)', alignItems: 'start' }}>{photo}{right}</div>
      ) : <>{photo}{right}</>}
      {state === 'Withdraw' ? <ReasonDialog title="Withdraw correction?" confirmLabel="Withdraw" minLength={1} sheet={narrow}>Tare (t) goes back to the reading, 13.380.</ReasonDialog> : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Weighbridge ticket record page (CS-CLERK-03) */

const HISTORY_SLIP = [
  { id: 'h5', field: 'Status', user: 'S. Banda', old: 'Ready', next: 'Received', date: '26 Sep 2026, 10:20', reason: '' },
  { id: 'h4', field: 'Counterparty status', user: 'Lakeview Farms Ltd', old: 'Pending', next: 'Confirmed', date: '26 Sep 2026, 10:12', reason: '' },
  { id: 'h3', field: 'Tare (t)', user: 'S. Banda', old: '13.380', next: '13.880', date: '26 Sep 2026, 09:58', reason: 'Corrected from photo' },
  { id: 'h2', field: 'Source', user: 'S. Banda', old: 'Weighbridge', next: 'Scanned slip', date: '26 Sep 2026, 09:58', reason: 'Completed from a scanned slip' },
  { id: 'h1', field: 'Status', user: 'Chisamba Shed weighbridge', old: '', next: 'Weighed in', date: '26 Sep 2026, 09:31', reason: 'Arrived from the weighbridge' },
];
const HISTORY_CLOSED = [
  { id: 'k3', field: 'Status', user: 'S. Banda', old: 'Stalled', next: 'Closed', date: '26 Sep 2026, 11:02', reason: 'Truck left without weighing out' },
  { id: 'k2', field: 'Status', user: 'One Link', old: 'Weighed in', next: 'Stalled', date: '26 Sep 2026, 08:12', reason: '' },
  { id: 'k1', field: 'Status', user: 'Chisamba Shed weighbridge', old: '', next: 'Weighed in', date: '26 Sep 2026, 06:12', reason: 'Arrived from the weighbridge' },
];

export function TicketRecord({ state = 'Ready' }) {
  const fromSlip = !['Ready', 'Receiving', 'Closed'].includes(state);
  const closed = state === 'Closed';
  const initial = state === 'History' || closed ? 'History' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const later = state === 'Later scale record' || state === 'Keeping weights';
  const t = closed ? { ref: 'WBT10001599', truck: 'BAX 1234', gross: '38.500', tare: '', net: '', source: 'Weighbridge', readiness: 'closed' }
    : fromSlip ? { ref: 'WBT10001614', truck: 'ABZ 4610', gross: '45.900', tare: '13.880', net: '32.020', source: 'Scanned slip', readiness: 'received' }
    : { ref: 'WBT10001606', truck: 'ABZ 4412', gross: '46.280', tare: '14.140', net: '32.140', source: 'Weighbridge', readiness: 'ready' };
  const unit = (v) => (v ? `${v} t` : '');
  const weighings = [
    { id: 'w1', weighing: 'First weighing, gross', weight: t.gross, time: fromSlip ? '26 Sep 2026, 09:31' : closed ? '26 Sep 2026, 06:12' : '26 Sep 2026, 07:36', source: t.source },
    ...(closed ? [] : [{ id: 'w2', weighing: 'Second weighing, tare', weight: t.tare, corrected: fromSlip, time: fromSlip ? '26 Sep 2026, 09:52' : '26 Sep 2026, 07:48', source: t.source }]),
    ...(closed ? [] : [{ id: 'total', total: true, weighing: 'Net', weight: t.net, time: '', source: '' }]),
  ];
  const actions = closed ? null : later ? null : fromSlip ? null : <Button size="small" loading={state === 'Receiving'}>Receive</Button>;
  return (
    <Sections>
      <WbHead title={t.ref} />
      {later ? (
        <ConditionBanner action={<Button size="xsmall" loading={state === 'Keeping weights'}>Keep recorded weights</Button>}>A later scale record for ABZ 4610 differs from the confirmed slip weights.</ConditionBanner>
      ) : null}
      <RecordHighlights kind="Weighbridge ticket" title={t.ref} status={<ReadinessChip kind={t.readiness} />} actions={actions} tab={tab} onTab={setTab}
        fields={[{ label: 'Truck', value: <RefCell>{t.truck}</RefCell> }, { label: 'Direction', value: 'Inbound' }, { label: 'Gross', value: unit(t.gross) }, { label: 'Tare', value: unit(t.tare) }, { label: 'Net', value: unit(t.net) }, { label: 'Source', value: t.source }]} />
      {tab === 'History' ? (
        <WbTable title="History" count={(closed ? HISTORY_CLOSED : HISTORY_SLIP).length} objects="changes" columns={[
          { key: 'field', label: 'Field', width: '170px' }, { key: 'user', label: 'User', width: '200px' },
          { key: 'old', label: 'Old value', width: '140px' }, { key: 'next', label: 'New value', width: '140px' },
          { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true }, { key: 'reason', label: 'Reason' },
        ]} rows={closed ? HISTORY_CLOSED : HISTORY_SLIP} />
      ) : tab === 'Related' ? (
        <WbTable title="Goods received notes" count={0} objects="goods received notes" columns={[{ key: 'ref', label: 'Goods received note' }]} rows={[]} />
      ) : (
        <>
          <WbTable title="Weighings" count={weighings.filter((w) => !w.total).length} objects="weighings" columns={[
            { key: 'weighing', label: 'Weighing', render: (r) => (r.corrected ? <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px 8px' }}><span>{r.weighing}</span><StatusMark kind="flat" label="Corrected from photo" size="body-4" /></span> : wbStrong(r, r.weighing)) },
            { key: 'weight', label: 'Weight (t)', width: '120px', align: 'right', render: (r) => wbStrong(r, r.weight) },
            { key: 'time', label: 'Time (CAT)', width: '180px', tabular: true },
            { key: 'source', label: 'Source', width: '140px' },
          ]} rows={weighings} />
          {later ? (
            <Card title="Later scale record">
              <WbFacts min={140} fields={[['Gross', '45.960 t'], ['Tare', '13.880 t'], ['Net', '32.080 t'], ['Weighed', '26 Sep 2026, 11:40 CAT'], ['Source', 'Weighbridge']]} />
            </Card>
          ) : null}
          {fromSlip ? (
            <Card title="Ticket information">
              <WbFacts fields={[['Counterparty', 'Lakeview Farms Ltd'], ['Counterparty status', <ConfirmationChip kind="confirmed" />], ['Site', 'Chisamba Shed'], ['Commodity', 'Maize']]} />
            </Card>
          ) : null}
          {fromSlip ? <Card title="Slip photo"><EvidenceViewer src={SLIP_PHOTO} fingerprint={SLIP_PRINT} height={300} /></Card> : null}
        </>
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Feed health (a site whose Weight source is Weighbridge) */

export function FeedHealth({ state = 'Connected' }) {
  const offline = state === 'Offline';
  const delayed = state === 'Delayed';
  return (
    <Sections>
      <WbHead title="Chisamba Shed weighbridge" right={<Button variant="outline" size="small" icon="scan-line">Scan slip</Button>} />
      {offline ? <OfflineBanner /> : null}
      <Card title="Connection">
        <WbFacts min={160} fields={[['Weight source', 'Weighbridge'], ['Connection status', <ConnectionStatus status={state} />], ['Last ticket', offline ? '26 Sep 2026, 09:04 CAT' : '26 Sep 2026, 09:12 CAT'], ['Last batch', offline ? '26 Sep 2026, 09:10 CAT' : delayed ? '26 Sep 2026, 08:40 CAT' : '26 Sep 2026, 09:14 CAT']]} />
      </Card>
      <FigureStrip cells={[
        <Figure label="Imported today" value="14" size="heading-2-condensed" />,
        <Figure label="Duplicate" value="1" size="heading-2-condensed" />,
        <Figure label="Failed" value={offline ? '2' : '1'} size="heading-2-condensed" />,
      ]} />
    </Sections>
  );
}
