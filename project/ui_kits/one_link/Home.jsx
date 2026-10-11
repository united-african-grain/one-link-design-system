/** The Managing Director's Home and the records he works from (M5.DS.01, UAG-139; S08 J2 to J6, canvas S09 "One
    Link Owen 1"). Home is added beside the Command Center screen, which stays (Henry, 30 Sep 2026). Home is the page header with Last refreshed, the
    three KPI tiles (Total exposure, Uncovered exposure, Coverage), Position by commodity, Inventory by site with each
    row expanding to its contracts, Items to approve, Exceptions grouped by type and sorted by value at risk, and Recent
    changes. Calculation details opens from every tile and figure. Items to approve and Exceptions are list views; an
    exception record carries Acknowledge. Every screen takes `state`, one of its HOME_STATES entry, for ?screen=&state=.

    Read only (S08, C8-2): Home has no breadcrumb and no action button; Owen acts from Items to approve, the Exceptions
    list and the records they open, and no edit control appears anywhere. Business language only, including accessible
    labels: no word on the M5 banned-word list (guidelines/banned-words.json, `m5`) and no left-column term of the S57
    glossary. Owen holds every price tier, so no Restricted field appears on his screens. Money carries its currency
    code before the amount, K or M only in KPI tiles; every USD roll-up is the weighted average cost in US dollars
    (Map D-16) at the latest exchange rate in force, whose date is always shown (Map D-40); with no rate at all a
    dependent figure is Not set, naming the setting and its owner. Fictional sample data only: the S08 example data on
    the golden fixture names (Riverbend Milling, Lakeview Farms Ltd, Cameron Estates, Chisamba Shed, Mpongwe Depot). */

export const HOME_STATES = {
  Home: ['With items', 'No items', 'Stale data', 'Calculation details', 'Rate not set', 'Row expanded', 'Loading'],
  ItemsToApproveList: ['With items', 'No items'],
  OwnerExceptions: ['Open', 'Acknowledged', 'Exporting', 'No items'],
  OwnerException: ['Open', 'Acknowledge', 'Acknowledging', 'Acknowledged', 'Related', 'History'],
};

/** Owen's navigation (UX-06, S08): Home, Trading, Logistics, Inventory, Finance, Counterparties, Reports, Assistant. The
    frame is the design system's AppShell, unchanged; only its items are Owen's. */
export const MD_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'trading', label: 'Trading', icon: 'arrow-left-right' },
  { value: 'logistics', label: 'Logistics', icon: 'truck' },
  { value: 'inventory', label: 'Inventory', icon: 'warehouse' },
  { value: 'finance', label: 'Finance', icon: 'hand-coins' },
  { value: 'counterparties', label: 'Counterparties', icon: 'building-2' },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
  { value: 'assistant', label: 'Assistant', icon: 'message-square' },
] }];
export const MD_USER = { initials: 'TM', name: 'T. Mwila', meta: 'Managing Director', detail: 'Last sign-in 26 Sep 2026, 06:55 CAT, Lusaka' };

/** Owen's frame: the AppShell with his navigation, the global header's Notifications and Help, and no connection pill
    or digest bell, whose words are not his (S57 glossary). `breadcrumb` is empty on Home (UX-05). */
export function MdFrame({ module = 'home', breadcrumb = [], onNavigate, children }) {
  return (
    <AppShell nav={MD_NAV} module={module} onNavigate={onNavigate} home="home" breadcrumb={breadcrumb} sync={null} showDigest={false}
      searchPlaceholder="Search contracts, loads, counterparties" user={MD_USER}
      right={<><IconButton icon="bell" label="Notifications" /><IconButton icon="circle-help" label="Help" /></>}>
      {children}
    </AppShell>
  );
}

/** Where a screen in this file sits: Owen's frame, the module it highlights and the toolbar breadcrumb. */
export function homeFrame(screen) {
  if (screen === 'Home') return { who: 'md', module: 'home', breadcrumb: [] };
  if (screen === 'ItemsToApproveList') return { who: 'md', module: 'home', breadcrumb: ['Home', 'Items to approve'] };
  if (screen === 'OwnerExceptions') return { who: 'md', module: 'home', breadcrumb: ['Home', 'Exceptions'] };
  return { who: 'md', module: 'home', breadcrumb: ['Home', 'Exceptions', 'EXC-000184'] };
}

/* ------------------------------------------------------------------ The S08 example data, on the golden fixture */

export const HM_AS_OF = '26 Sep 2026, 07:02 CAT';
export const HM_STALE_AS_OF = '26 Sep 2026, 04:15 CAT';
export const HM_RATE = 'ZMW 25.00 per USD';
export const HM_RATE_DATE = '26 Sep 2026';

/** The three KPI tiles (S08 scope: three, no placeholders; a fourth, Price sensitivity, waits on U-14). `rate` says
    whether the tile rests on the exchange rate: with no rate at all it is Not set, and so is its panel (S08 J3). */
export const HM_TILES = [
  { key: 'total', label: 'Total exposure', value: 'USD 2.66M', full: 'USD 2,657,660', caption: `As of ${HM_AS_OF}`, rate: true },
  { key: 'uncovered', label: 'Uncovered exposure', value: 'USD 579.8K', full: 'USD 579,806', caption: '21.8% of total exposure', rate: false },
  { key: 'coverage', label: 'Coverage', value: '78.2%', full: '78.2%', caption: `As of ${HM_AS_OF}`, rate: true },
];

/** Each tile's Calculation details (UX-18): its components in order, the bold total, then the basis. */
export const HM_CALC = {
  total: { name: 'Total exposure', value: 'USD 2,657,660', components: [
    { label: 'Inventory at cost', value: '1,842,300', rate: false }, { label: 'Open purchases', value: '217,600', rate: false },
    { label: 'Receivables', value: '574,000', rate: true }, { label: 'Advances', value: '23,760', rate: true },
  ], total: { label: 'Total (USD)', value: '2,657,660' } },
  uncovered: { name: 'Uncovered exposure', value: 'USD 579,806', components: [
    { label: 'Net position short, wheat', value: '341,280' }, { label: 'Net position long, maize', value: '108,800' },
    { label: 'Net position short, Urea 50 kg', value: '116,126' }, { label: 'Stock on hold', value: '13,600' },
  ], total: { label: 'Total (USD)', value: '579,806' } },
  coverage: { name: 'Coverage', value: '78.2%', components: [
    { label: 'Total exposure (USD)', value: '2,657,660', rate: true }, { label: 'Uncovered exposure (USD)', value: '579,806' },
  ], total: { label: 'Coverage, 1 less uncovered over total', value: '78.2%' } },
};

/** The basis rows every USD figure carries: the latest rate in force and its date (Map D-40), or, with no rate at all,
    Not set with the setting that is missing and its owner (UX-16). */
export function hmBasis(rateSet = true) {
  return rateSet
    ? [{ label: 'Exchange rate', value: HM_RATE }, { label: 'Rates as of', value: HM_RATE_DATE }, { label: 'Source', value: 'Setup, Exchange rates' }]
    : [{ label: 'Exchange rate', value: <NotSet size="body-3" /> }, { label: 'Setting', value: 'Exchange rate source' }, { label: 'Setting owner', value: 'Owner' }];
}

/** A tile's panel, in the state the rate leaves it. */
export function hmCalcFor(key, rateSet = true) {
  const c = HM_CALC[key];
  const missing = !rateSet && HM_TILES.find((t) => t.key === key).rate;
  return {
    name: c.name,
    value: missing ? <NotSet size="body-2" /> : c.value,
    components: c.components.map((r) => ({ label: r.label, value: !rateSet && r.rate ? <NotSet size="body-3" /> : r.value })),
    total: { label: c.total.label, value: missing ? <NotSet size="body-3" /> : c.total.value },
    basis: hmBasis(rateSet),
  };
}

/** Position by commodity (S08 J2 step 3): stock, open purchases (grain paid for and not yet delivered counts here, Map
    D-41), open sales, net position as Long, Short or Flat, and value in USD at weighted average cost. */
export const HM_POSITION = [
  { id: 'wheat', commodity: 'Wheat', marker: 'wheat', stock: '4,000', purchases: '800', sales: '6,000', net: 'Short 1,200', value: '341,280', cost: '284.40' },
  { id: 'maize', commodity: 'Maize', marker: 'maize', stock: '1,420', purchases: '0', sales: '780', net: 'Long 640', value: '108,800', cost: '170.00' },
  { id: 'soya', commodity: 'Soya', marker: 'soya', stock: '1,000', purchases: '0', sales: '1,000', net: 'Flat', value: '0', cost: '271.88' },
  { id: 'urea', commodity: 'Urea 50 kg', marker: 'fertilizer', stock: '820', purchases: '0', sales: '1,000', net: 'Short 180', value: '116,126', cost: '645.15' },
];

/** Where each figure in a Position row comes from, for its Calculation details. Open purchases include the tonnage
    paid for and not yet delivered (Map D-41); the money paid shows in Total exposure as an advance. */
export const HM_POSITION_PARTS = {
  wheat: {
    stock: [['Chisamba Shed', '2,140 t'], ['Mpongwe Depot', '1,860 t']],
    purchases: [['SYN4788, contracted, not yet delivered', '600 t'], ['SYN4795, paid for, not yet delivered', '200 t']],
    sales: [['SYN4702', '800 t'], ['SYN4790', '1,200 t'], ['SYN4845', '4,000 t']],
  },
  maize: { stock: [['Chisamba Shed', '1,420 t']], purchases: [], sales: [['SYN4812', '780 t']] },
  soya: { stock: [['Hired store, Mkushi', '1,000 t']], purchases: [], sales: [['SYN4833', '1,000 t']] },
  urea: { stock: [['Mpongwe Depot', '820 t']], purchases: [], sales: [['Farmer programme orders', '1,000 t']] },
};

const HM_COLUMN_NAMES = { stock: 'Stock', purchases: 'Open purchases', sales: 'Open sales', net: 'Net position', value: 'Value' };

/** Calculation details for one figure of Position by commodity. */
export function hmPositionCalc(row, column, rateSet = true) {
  const parts = HM_POSITION_PARTS[row.id];
  const name = `${HM_COLUMN_NAMES[column]}, ${row.commodity}`;
  if (column === 'value') {
    const tonnes = row.net === 'Flat' ? '0 t' : `${row.net.replace(/^(Short|Long) /, '')} t`;
    // Lots are costed in US dollars, so the value stands with or without a rate; the basis names the rate in force.
    return { name, value: `USD ${row.value}`,
      components: [{ label: 'Net position', value: row.net === 'Flat' ? 'Flat' : `${row.net} t` }, { label: 'Tonnes at risk', value: tonnes }, { label: 'Weighted average cost (USD per t)', value: row.cost }],
      total: { label: 'Value (USD)', value: row.value }, basis: hmBasis(rateSet) };
  }
  if (column === 'net') {
    return { name, value: row.net === 'Flat' ? 'Flat' : `${row.net} t`,
      components: [{ label: 'Stock', value: `${row.stock} t` }, { label: 'Open purchases', value: `${row.purchases} t` }, { label: 'Open sales', value: `-${row.sales} t` }],
      total: { label: 'Net position', value: row.net === 'Flat' ? 'Flat' : `${row.net} t` }, basis: [{ label: 'As of', value: HM_AS_OF }] };
  }
  const rows = parts[column].map(([label, value]) => ({ label, value }));
  return { name, value: `${row[column]} t`, components: rows.length ? rows : [{ label: 'No open contracts', value: '0 t' }],
    total: { label: `${HM_COLUMN_NAMES[column]} (t)`, value: row[column] }, basis: [{ label: 'As of', value: HM_AS_OF }] };
}

/** Inventory by site (S08 J2 step 4): weighted average cost and value in USD, each row expanding to its contracts. */
export const HM_INVENTORY = [
  { id: 'i1', site: 'Chisamba Shed', commodity: 'Wheat', marker: 'wheat', tonnes: '2,140', cost: '200.00', value: '428,000', contracts: [
    { id: 'c1', ref: 'SYN4760', cp: 'Lakeview Farms Ltd', tonnes: '1,200', cost: '200.00', value: '240,000' },
    { id: 'c2', ref: 'SYN4771', cp: 'Cameron Estates', tonnes: '940', cost: '200.00', value: '188,000' }] },
  { id: 'i2', site: 'Mpongwe Depot', commodity: 'Wheat', marker: 'wheat', tonnes: '1,860', cost: '200.00', value: '372,000', contracts: [
    { id: 'c3', ref: 'SYN4776', cp: 'Lakeview Farms Ltd', tonnes: '1,860', cost: '200.00', value: '372,000' }] },
  { id: 'i3', site: 'Chisamba Shed', commodity: 'Maize', marker: 'maize', tonnes: '1,420', cost: '170.00', value: '241,400', contracts: [
    { id: 'c4', ref: 'SYN4781', cp: 'Cameron Estates', tonnes: '1,000', cost: '170.00', value: '170,000' },
    { id: 'c5', ref: 'SYN4783', cp: 'Mpongwe Valley Farms', tonnes: '420', cost: '170.00', value: '71,400' }] },
  { id: 'i4', site: 'Hired store, Mkushi', commodity: 'Soya', marker: 'soya', tonnes: '1,000', cost: '271.88', value: '271,880', contracts: [
    { id: 'c6', ref: 'SYN4803', cp: 'Lakeview Farms Ltd', tonnes: '1,000', cost: '271.88', value: '271,880' }] },
  { id: 'i5', site: 'Mpongwe Depot', commodity: 'Urea 50 kg', marker: 'fertilizer', tonnes: '820', cost: '645.15', value: '529,020', contracts: [
    { id: 'c7', ref: 'SYN4799', cp: 'Northfield Agro Supplies', tonnes: '420', cost: '640.00', value: '268,800' },
    { id: 'c8', ref: 'SYN4806', cp: 'Northfield Agro Supplies', tonnes: '400', cost: '650.55', value: '260,220' }] },
  { id: 'total', total: true, site: 'Total', tonnes: '7,240', value: '1,842,300' },
];

/** Items to approve (S08 J4): what waits for Owen's decision, Pending approval. */
export const HM_APPROVALS = [
  { id: 'a1', item: 'Trade SYN4810', type: 'Trade', summary: 'Riverbend Milling, maize, 1,500 t', by: 'J. Tembo', at: '25 Sep 2026, 16:40' },
  { id: 'a2', item: 'Gate price, maize', type: 'Gate price', summary: 'Chisamba Shed, ZMW 4,300.00 per t', by: 'R. Daka', at: '26 Sep 2026, 06:30' },
];

/** Owen's exceptions (S08 example data): business wording, value at risk in USD, sorted by value at risk. Severity
    shows through the type and the order, never a coloured tag. */
export const HM_EXCEPTIONS = [
  { id: 'EXC-000193', type: 'Position', business: 'Net position short', businessRecord: 'Wheat, 1,200 t', value: '341,280', owner: 'J. Tembo', age: '3 days', status: 'open', isNew: false },
  { id: 'EXC-000194', type: 'Inventory', business: 'Stock shortfall', businessRecord: 'Urea 50 kg, 180 t', value: '116,126', owner: 'R. Daka', age: '5 days', status: 'open', isNew: false },
  { id: 'EXC-000195', type: 'Position', business: 'Net position long', businessRecord: 'Maize, 640 t', value: '108,800', owner: 'J. Tembo', age: '2 days', status: 'open', isNew: false },
  { id: 'EXC-000184', type: 'Execution', business: 'Delivery overdue', businessRecord: 'SYN4702 leg C, Lakeview Farms Ltd, 300 t', businessRecordLink: true, value: '81,600', owner: 'J. Tembo', age: '10 days', status: 'open', isNew: false },
  { id: 'EXC-000196', type: 'Execution', business: 'Offload missing', businessRecord: 'KAL-11, 33.960 t', businessRecordLink: true, value: '9,658', owner: 'M. Chanda', age: '1 day', status: 'open', isNew: true },
  { id: 'EXC-000197', type: 'Inventory', business: 'Variance hold', businessRecord: 'Truck ABZ 4412, Chisamba Shed', businessRecordLink: true, value: '6,428', owner: 'Clerk, Chisamba Shed', age: 'Today', status: 'open', isNew: true },
].map((r) => ({ ...r, title: r.business, record: r.businessRecord }));

/** The exception types in the order Home groups them (S08 J2 step 6). A type with nothing open is not drawn. */
export const HM_EXCEPTION_TYPES = ['Position', 'Inventory', 'Counterparty', 'Execution'];

/** Sorted by value at risk, largest first (S08 J2 step 6, J9). */
export function hmByValue(rows) {
  const n = (v) => Number(String(v).replace(/,/g, '')) || 0;
  return [...rows].sort((a, b) => n(b.value) - n(a.value));
}

/** Home's Exceptions card: one group per type, in HM_EXCEPTION_TYPES order, each sorted by value at risk. */
export function hmExceptionGroups(rows) {
  return HM_EXCEPTION_TYPES.map((type) => ({ type, rows: hmByValue(rows.filter((r) => r.type === type)) })).filter((g) => g.rows.length);
}

/** Recent changes (UX-29, S08 J2 step 7): approvals, holds and contract status changes since the last daily summary,
    newest first. */
export const HM_CHANGES = [
  { id: 'r1', record: 'Load ABZ 4412', change: 'Put on hold', by: 'System', date: '26 Sep 2026, 06:48' },
  { id: 'r2', record: 'Gate price, maize', change: 'Submitted for approval', by: 'R. Daka', date: '26 Sep 2026, 06:30' },
  { id: 'r3', record: 'Trade SYN4810', change: 'Submitted for approval', by: 'J. Tembo', date: '25 Sep 2026, 16:40' },
  { id: 'r4', record: 'Contract SYN4833', change: 'Status changed to Active', by: 'A. Mwale', date: '25 Sep 2026, 15:05' },
  { id: 'r5', record: 'Trade SYN4798', change: 'Approved', by: 'T. Mwila', date: '25 Sep 2026, 11:20' },
];

/* ------------------------------------------------------------------ Parts these screens share */

const HM_PENDING = <StatusMark kind="pending" label="Pending approval" size="body-4" />;

/** A record reference or a figure that opens: blue, because Owen can open it (UX-01). */
export function HmLink({ children, onOpen }) {
  return <RefCell onOpen={onOpen}>{children}</RefCell>;
}

/** Page title with its count and, on lists and records, the actions on the right (UX-04, UX-07). */
export function HmHead({ title, count, meta, right }) {
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

/** Last refreshed with its status icon (UX-05, UX-24): the green check while current, the amber warning past its
    threshold. Freshness reads Last refreshed and nothing else. */
export function HmRefreshed({ stale = false, time }) {
  return <StatusMark kind={stale ? 'attention' : 'clean'} label={`Last refreshed ${time || (stale ? HM_STALE_AS_OF : HM_AS_OF)}`} size="body-3" />;
}

/** A titled card with its count and a link at the right; an empty card keeps its title with count 0 and reads
    "No [objects] to display." (UX-15). Its table or rows run edge to edge under the header. */
export function HmCard({ title, count, objects, link, onLink, children }) {
  const empty = count === 0;
  return (
    <Card gap={8} title={<>{title}{count != null ? <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 8 }}><Count>{count}</Count></span> : null}</>}
      headerRight={link && !empty ? <HmLink onOpen={onLink}>{link}</HmLink> : null}>
      {empty ? <EmptyState title={`No ${objects} to display.`} style={{ padding: '16px 0 8px' }} /> : <div style={{ margin: '0 -16px -16px' }}>{children}</div>}
    </Card>
  );
}

/** DataTable with a scroll width from its columns, so a phone scrolls the table instead of squeezing it. */
export function HmTable(props) {
  const min = props.columns.reduce((n, c) => n + (c.width && /^\d+px$/.test(c.width) ? parseInt(c.width, 10) : 150), props.expand ? 40 : 0);
  return <DataTable rowKey="id" {...props} minWidth={min} />;
}

/** Label and value pairs for a record's Details cards. A value that does not exist is blank. */
export function HmFacts({ fields, min = 180 }) {
  return (
    <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`, gap: 16 }}>
      {fields.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <dt style={textStyle('body-4', { tone: 'secondary' })}>{label}</dt>
          <dd style={{ margin: 0, minHeight: 20, ...textStyle('body-3', { tabular: true }), overflowWrap: 'anywhere' }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A bold Total cell (UX-26). */
const hmStrong = (r, v) => (r.total ? <Text variant="body-3" strong tabular>{v}</Text> : v);

/* ------------------------------------------------------------------ Home */

function HmTiles({ rateSet, stale, onOpen }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 'var(--card-gap)' }}>
      {kpiTiles(HM_TILES.map((t) => <KpiTile key={t.key} label={t.label} value={t.value} caption={stale ? t.caption.replace(HM_AS_OF, HM_STALE_AS_OF) : t.caption} notSet={!rateSet && t.rate} onOpen={() => onOpen(t.key)} />))}
    </div>
  );
}

function HmPositionCard({ onFigure, onReport }) {
  const fig = (col) => (r) => <HmLink onOpen={() => onFigure(r, col)}>{r[col]}</HmLink>;
  return (
    <HmCard title="Position by commodity" link="View report" onLink={onReport}>
      <HmTable rows={HM_POSITION} columns={[
        { key: 'commodity', label: 'Commodity', width: 'minmax(110px, 1fr)', render: (r) => <CommodityMarker commodity={r.marker}>{r.commodity}</CommodityMarker> },
        { key: 'stock', label: 'Stock (t)', width: '80px', align: 'right', render: fig('stock') },
        { key: 'purchases', label: 'Open purchases (t)', width: '140px', align: 'right', render: fig('purchases') },
        { key: 'sales', label: 'Open sales (t)', width: '110px', align: 'right', render: fig('sales') },
        { key: 'net', label: 'Net position (t)', width: '120px', align: 'right', render: fig('net') },
        { key: 'value', label: 'Value (USD)', width: '100px', align: 'right', render: fig('value') },
      ]} />
    </HmCard>
  );
}

function HmContracts({ row }) {
  return (
    <HmTable rows={row.contracts} columns={[
      { key: 'ref', label: 'Contract', width: '110px', render: (c) => <HmLink>{c.ref}</HmLink> },
      { key: 'cp', label: 'Counterparty', width: 'minmax(160px, 1fr)', wrap: true },
      { key: 'tonnes', label: 'Tonnes', width: '90px', align: 'right' },
      { key: 'cost', label: 'Cost (USD/t)', width: '110px', align: 'right' },
      { key: 'value', label: 'Value (USD)', width: '110px', align: 'right' },
    ]} />
  );
}

function HmInventoryCard({ expanded, onReport }) {
  return (
    <HmCard title="Inventory by site" link="View report" onLink={onReport}>
      <HmTable rows={HM_INVENTORY} expanded={expanded} expandLabel={(r) => `Show contracts, ${r.site}, ${r.commodity}`}
        expand={(r) => (r.total ? null : <HmContracts row={r} />)} columns={[
          { key: 'site', label: 'Site', width: 'minmax(150px, 1fr)', wrap: true, render: (r) => hmStrong(r, r.site) },
          { key: 'commodity', label: 'Commodity', width: '130px', render: (r) => (r.total ? '' : <CommodityMarker commodity={r.marker}>{r.commodity}</CommodityMarker>) },
          { key: 'tonnes', label: 'Tonnes', width: '84px', align: 'right', render: (r) => hmStrong(r, r.tonnes) },
          { key: 'cost', label: 'Avg cost (USD/t)', width: '130px', align: 'right', render: (r) => (r.total ? '' : r.cost) },
          { key: 'value', label: 'Value (USD)', width: '110px', align: 'right', render: (r) => hmStrong(r, r.value) },
        ]} />
    </HmCard>
  );
}

function HmChangesCard({ rows }) {
  return (
    <HmCard title="Recent changes" objects="changes" count={rows.length ? undefined : 0}>
      <HmTable rows={rows} columns={[
        { key: 'record', label: 'Record', width: 'minmax(160px, 1fr)', render: (r) => <HmLink>{r.record}</HmLink> },
        { key: 'change', label: 'Change', width: 'minmax(180px, 1.4fr)', wrap: true },
        { key: 'by', label: 'By', width: '110px' },
        { key: 'date', label: 'Date (CAT)', width: '160px', tabular: true },
      ]} />
    </HmCard>
  );
}

/** Items to approve on Home: each item a link, its summary, Pending approval. */
export function HmApprovalsCard({ rows, onOpen }) {
  return (
    <HmCard title="Items to approve" count={rows.length} objects="items" link="View all" onLink={() => onOpen && onOpen('approvals')}>
      {rows.map((r, i) => (
        <RailRow key={r.id} subject={<HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.item}</HmLink>} context={r.summary} right={HM_PENDING}
          style={{ padding: '10px 16px', boxShadow: i ? 'inset 0 1px 0 var(--border-light)' : 'none' }} />
      ))}
    </HmCard>
  );
}

/** Exceptions on Home: grouped by type, each group sorted by value at risk, value and owner on the right. */
export function HmExceptionsCard({ rows, onOpen }) {
  const groups = hmExceptionGroups(rows);
  return (
    <HmCard title="Exceptions" count={rows.length} objects="exceptions" link="View all" onLink={() => onOpen && onOpen('exceptions')}>
      {groups.map((g) => (
        <div key={g.type} data-exception-group={g.type}>
          <div style={{ padding: '8px 16px', background: 'var(--grouped-light)', boxShadow: 'inset 0 1px 0 var(--border-light)' }}>
            <SectionLabel right={<Text variant="body-4" tone="secondary" tabular>{g.rows.length}</Text>}>{g.type}</SectionLabel>
          </div>
          {g.rows.map((r) => (
            <RailRow key={r.id} subject={<HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.business}</HmLink>} context={r.businessRecord}
              right={<span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}><Text variant="body-3" strong tabular>USD {r.value}</Text><Text variant="body-4" tone="secondary">{r.owner}</Text></span>}
              style={{ padding: '10px 16px', boxShadow: 'inset 0 1px 0 var(--border-light)' }} />
          ))}
        </div>
      ))}
    </HmCard>
  );
}

/** Home (S08 J2, UX-05): read only, no breadcrumb and no action button. */
export function Home({ state = 'With items', onOpen, mobile = false }) {
  const compact = useCompact(mobile);
  const empty = state === 'No items';
  const stale = state === 'Stale data';
  const rateSet = state !== 'Rate not set';
  const initialCalc = state === 'Calculation details' || state === 'Rate not set' ? { tile: 'total' } : null;
  const [calc, setCalc] = useState(initialCalc);
  useEffect(() => setCalc(initialCalc), [state]);
  const head = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <Text as="h1" variant="heading-2" strong style={{ margin: 0 }}>Home</Text>
      <HmRefreshed stale={stale} />
    </div>
  );
  if (state === 'Loading') {
    return (
      <Sections>
        {head}
        <div aria-busy="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 'var(--card-gap)' }}>
          {HM_TILES.map((t) => <Card key={t.key} padding={16} gap={8}><Skeleton width={110} height={14} /><Skeleton width={150} height={28} /><Skeleton width={170} height={12} /></Card>)}
        </div>
        <WithRail rail={<><CardSkeleton /><CardSkeleton /></>}><CardSkeleton /><CardSkeleton /><CardSkeleton /></WithRail>
      </Sections>
    );
  }
  const rail = <>
    <HmApprovalsCard rows={empty ? [] : HM_APPROVALS} onOpen={onOpen} />
    <HmExceptionsCard rows={empty ? [] : HM_EXCEPTIONS} onOpen={onOpen} />
  </>;
  const main = <>
    <HmPositionCard onFigure={(row, column) => setCalc({ row, column })} onReport={() => onOpen && onOpen('exposure')} />
    <HmInventoryCard expanded={state === 'Row expanded' ? ['i1'] : undefined} onReport={() => onOpen && onOpen('inventory-report')} />
    <HmChangesCard rows={HM_CHANGES} />
  </>;
  const panel = calc ? (calc.tile ? hmCalcFor(calc.tile, rateSet) : hmPositionCalc(calc.row, calc.column, rateSet)) : null;
  return (
    <Sections>
      {head}
      {stale ? <ConditionBanner>Chisamba Shed weighbridge is offline since 04:15 CAT.</ConditionBanner> : null}
      <HmTiles rateSet={rateSet} stale={stale} onOpen={(tile) => setCalc({ tile })} />
      {compact ? <>{rail}{main}</> : <WithRail rail={rail}>{main}</WithRail>}
      {panel ? <CalculationDetails open onClose={() => setCalc(null)} name={panel.name} value={panel.value} components={panel.components} total={panel.total} basis={panel.basis} /> : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Items to approve (list view, UX-07) */

export function ItemsToApproveList({ state = 'With items', onOpen }) {
  const rows = state === 'No items' ? [] : HM_APPROVALS;
  return (
    <Sections>
      <HmHead title="Items to approve" count={rows.length} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <ScrollRow><Capsule chevron selected>Assigned to me</Capsule></ScrollRow>
        <SearchField placeholder="Search this list" hint={null} maxWidth={320} />
      </div>
      {rows.length ? (
        <Card padding={4}>
          <HmTable rows={rows} columns={[
            { key: 'item', label: 'Item', width: 'minmax(170px, 1fr)', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.item}</HmLink> },
            { key: 'type', label: 'Type', width: '110px' },
            { key: 'summary', label: 'Summary', width: 'minmax(220px, 1.6fr)', wrap: true },
            { key: 'by', label: 'Submitted by', width: '120px' },
            { key: 'at', label: 'Submitted (CAT)', width: '160px', tabular: true },
            { key: 'status', label: 'Status', width: '160px', render: () => HM_PENDING },
          ]} />
        </Card>
      ) : <Card><EmptyState title="No items to display." /></Card>}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Exceptions (list view and record, S08 J6) */

export function OwnerExceptions({ state = 'Open', onOpen }) {
  const rows = state === 'No items' ? [] : hmByValue(HM_EXCEPTIONS).map((r) => (state === 'Acknowledged' && r.id === 'EXC-000184' ? { ...r, status: 'acknowledged' } : r));
  return (
    <Sections>
      <HmHead title="Exceptions" count={rows.length} right={<Button variant="outline" size="small" icon="download" loading={state === 'Exporting'}>Export</Button>} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <ScrollRow><Capsule chevron selected>All open exceptions</Capsule><Capsule chevron>Type</Capsule><Capsule chevron>Owner</Capsule></ScrollRow>
        <SearchField placeholder="Search this list" hint={null} maxWidth={320} />
      </div>
      <Card padding={rows.length ? 4 : 16}>
        <ExceptionList rows={rows} variant="owner" priceTier onOpen={onOpen} onOpenRecord={onOpen} />
      </Card>
    </Sections>
  );
}

const HM_EXC_HISTORY = [{ id: 'h1', field: 'Status', user: 'System', old: '', next: 'Open', date: '16 Sep 2026, 06:00', note: '' }];
const HM_EXC_ACK = { id: 'h2', field: 'Status', user: 'T. Mwila', old: 'Open', next: 'Acknowledged', date: '26 Sep 2026, 08:12', note: 'Asked J. Tembo for a delivery date' };

/** The exception record (UX-19, S08 J6): highlights with type, value at risk, owner, age, the linked record and the
    counterparty; Acknowledge while it is Open (it stays open), Close once acknowledged, with its reason. */
export function OwnerException({ state = 'Open', onOpen }) {
  const narrow = !useMinWidth(768);
  const initial = state === 'History' ? 'History' : state === 'Related' ? 'Related' : 'Details';
  const [tab, setTab] = useState(initial);
  const [calc, setCalc] = useState(false);
  useEffect(() => setTab(initial), [state]);
  const acknowledged = state === 'Acknowledged' || state === 'History';
  const dialog = state === 'Acknowledge' || state === 'Acknowledging';
  const busy = state === 'Acknowledging';
  const history = acknowledged ? [HM_EXC_ACK, ...HM_EXC_HISTORY] : HM_EXC_HISTORY;
  return (
    <Sections>
      <HmHead title="EXC-000184" />
      <RecordHighlights kind="Exception" title="EXC-000184" status={<ExceptionStatus status={acknowledged ? 'acknowledged' : 'open'} />} tab={tab} onTab={setTab}
        actions={acknowledged ? <Button variant="outline" size="small">Close</Button> : <Button size="small" loading={busy}>Acknowledge</Button>}
        fields={[
          { label: 'Type', value: 'Execution' },
          { label: 'Value at risk', value: <HmLink onOpen={() => setCalc(true)}>USD 81,600</HmLink> },
          { label: 'Owner', value: 'J. Tembo' },
          { label: 'Age', value: '10 days' },
          { label: 'Linked record', value: 'SYN4702 leg C', link: '#' },
          { label: 'Counterparty', value: 'Lakeview Farms Ltd', link: '#' },
        ]} />
      {tab === 'History' ? (
        <HmCard title="History" count={history.length} objects="changes">
          <HmTable rows={history} columns={[
            { key: 'field', label: 'Field', width: '110px' }, { key: 'user', label: 'User', width: '110px' },
            { key: 'old', label: 'Old value', width: '120px' }, { key: 'next', label: 'New value', width: '130px' },
            { key: 'date', label: 'Date (CAT)', width: '160px', tabular: true }, { key: 'note', label: 'Note', width: 'minmax(180px, 1fr)', wrap: true },
          ]} />
        </HmCard>
      ) : tab === 'Related' ? (
        <HmCard title="Purchase legs" count={1} objects="purchase legs">
          <HmTable rows={[{ id: 'l1', ref: 'SYN4702 leg C', cp: 'Lakeview Farms Ltd', contracted: '700', delivered: '400', left: '300' }]} columns={[
            { key: 'ref', label: 'Purchase leg', width: '140px', render: (r) => <HmLink onOpen={() => onOpen && onOpen('SYN4702')}>{r.ref}</HmLink> },
            { key: 'cp', label: 'Counterparty', width: 'minmax(160px, 1fr)', render: (r) => <HmLink>{r.cp}</HmLink> },
            { key: 'contracted', label: 'Contracted (t)', width: '120px', align: 'right' },
            { key: 'delivered', label: 'Delivered (t)', width: '110px', align: 'right' },
            { key: 'left', label: 'Left to deliver (t)', width: '140px', align: 'right' },
            { key: 'status', label: 'Status', width: '110px', render: () => <StatusMark kind="clean" label="Active" size="body-4" /> },
          ]} />
        </HmCard>
      ) : (
        <>
          <Card title="Exception information" padding={16}>
            <HmFacts fields={[['Exception', 'Delivery overdue'], ['Rule', 'No delivery on an open purchase leg'], ['Detected', '16 Sep 2026, 06:00 CAT'], ['Last delivery', '16 Sep 2026, 14:12'],
              ['Contracted', '700 t'], ['Delivered', '400 t'], ['Left to deliver', '300 t'], ['Delivery window ends', '30 Nov 2026']]} />
          </Card>
          <Card title="System information" padding={16}>
            <HmFacts fields={[['Created by', 'System'], ['Created date', '16 Sep 2026, 06:00 CAT'], ['Last modified by', acknowledged ? 'T. Mwila' : 'System'], ['Last modified date', acknowledged ? '26 Sep 2026, 08:12 CAT' : '16 Sep 2026, 06:00 CAT']]} />
          </Card>
        </>
      )}
      {dialog ? (
        <Dialog title="Acknowledge EXC-000184?" width={480} sheet={narrow} onClose={busy ? undefined : () => {}}
          footer={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Acknowledge</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span>The exception stays open.</span>
            <Field label="Note"><Input multiline disabled={busy} defaultValue={busy ? HM_EXC_ACK.note : ''} /></Field>
          </div>
        </Dialog>
      ) : null}
      <CalculationDetails open={calc} onClose={() => setCalc(false)} name="Value at risk, EXC-000184" value="USD 81,600"
        components={[{ label: 'Left to deliver', value: '300 t' }, { label: 'Contract price (USD per t)', value: '272.00' }]} total={{ label: 'Value at risk (USD)', value: '81,600' }}
        basis={hmBasis(true)} />
    </Sections>
  );
}
