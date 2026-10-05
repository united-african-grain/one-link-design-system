/** Counterparties for Owen (M3.DS.01, UAG-41; S08 J7 and J3, canvas AB-OWEN-NMC): finding a counterparty from global
    search or the Counterparties list view, with "Did you mean" and "Also known as"; the Counterparty record page with
    its highlights, Details, Related and History tabs; the drill-down from a figure to Calculation details; a group's
    overview; a load awaiting offload with its over-delivery variance; and the opening stock with its source. Every
    screen takes `state`, one of its COUNTERPARTIES_STATES entry, so the kit's index and the screenshot review open any
    state with ?screen=&state=.

    Read-only by construction: no capture, edit, confirm or upload control (S08). Business language only: the source
    of a figure is the labelled field Source ("Trade sheet, 01 Oct 2026"), and freshness reads Last refreshed. A
    figure the viewer's price tier does not allow is the Restricted mark on a shared layout and is left out otherwise.
    Record references are blue links because Owen can open them. Fictional sample data only: Riverbend Milling,
    Lakeview Farms Ltd, SYN4702, Chisamba Shed, Mpongwe Depot. */

export const COUNTERPARTIES_STATES = {
  CounterpartyFind: ['Global search', 'Did you mean', 'Also known as', 'List view', 'No match'],
  CounterpartyView: ['Related', 'Details', 'History', 'Calculation details', 'Load awaiting offload', 'Without the sell tier', 'Farmer', 'Farmer, without the farmer account tier'],
  CounterpartyGroup: ['Group overview'],
};

/** Owen's navigation: the design system's modules with Counterparties added (UX-06: Owen and Alka only). */
export const OWEN_NAV = [{ items: [...MODULES.slice(0, 5), { value: 'counterparties', label: 'Counterparties', icon: 'building-2' }, ...MODULES.slice(5)] }];
export const OWEN = { initials: 'TM', name: 'T. Mwila', meta: 'Owner' };

/** Where a Counterparties screen sits in Owen's frame: the module and the breadcrumb. */
export function counterpartiesFrame(screen, state) {
  if (screen === 'CounterpartyView') return { module: 'counterparties', breadcrumb: ['Counterparties', cpFor(state).name] };
  if (screen === 'CounterpartyGroup') return { module: 'counterparties', breadcrumb: ['Counterparties', 'Riverbend Group'] };
  if (screen === 'CounterpartyFind' && (state === 'List view' || state === 'No match')) return { module: 'counterparties', breadcrumb: ['Counterparties'] };
  return { module: 'counterparties', breadcrumb: ['Search'] };
}

const CP_REFRESHED = 'Last refreshed 05 Oct 2026, 07:02 CAT';
const CP_ACTIVE = <StatusMark kind="clean" label="Active" size="body-4" />;
const cpLink = (ref) => <RefCell>{ref}</RefCell>;
/** A counterparty or group link: blue, because Owen can open it (UX-01). */
function CpLink({ children, onClick }) {
  return <a href="#" onClick={(e) => { e.preventDefault(); onClick && onClick(); }} style={{ ...textStyle('body-3', { strong: true, tone: 'brand' }), textDecoration: 'none' }}>{children}</a>;
}

const RIVERBEND = {
  id: 'riverbend', name: 'Riverbend Milling', type: 'Mill', group: 'Riverbend Group',
  figures: [
    { key: 'sales', label: 'Sales under contract', value: '10,200 t', asOf: '01 Oct 2026' },
    { key: 'delivered', label: 'Delivered', value: '4,200 t', asOf: '04 Oct 2026' },
    { key: 'left', label: 'Left to deliver', value: '6,000 t', asOf: '04 Oct 2026' },
    { key: 'receivables', label: 'Receivables', value: 'USD 574,000', asOf: '04 Oct 2026', tier: 'Sell' },
    { key: 'oldest', label: 'Oldest unpaid', value: '14 days', asOf: '04 Oct 2026' },
  ],
};
const LAKEVIEW = {
  id: 'lakeview', name: 'Lakeview Farms Ltd', type: 'Commercial farmer', group: '',
  figures: [
    { key: 'sales', label: 'Sales under contract', value: '120 t', asOf: '01 Oct 2026' },
    { key: 'delivered', label: 'Delivered', value: '80 t', asOf: '03 Oct 2026' },
    { key: 'left', label: 'Left to deliver', value: '40 t', asOf: '03 Oct 2026' },
    { key: 'receivables', label: 'Receivables', value: 'USD 21,600', asOf: '04 Oct 2026', tier: 'Sell' },
    { key: 'oldest', label: 'Oldest unpaid', value: '9 days', asOf: '04 Oct 2026' },
  ],
};
function cpFor(state) { return state && state.startsWith('Farmer') ? LAKEVIEW : RIVERBEND; }

/* ------------------------------------------------------------------ Find a counterparty */

const CP_LIST = [
  { id: 'riverbend', name: 'Riverbend Milling', type: 'Mill', sales: '10,200', left: '6,000', receivables: '574,000' },
  { id: 'riverbend-feeds', name: 'Riverbend Feeds Ltd', type: 'Feed mill', sales: '1,400', left: '500', receivables: '96,400' },
  { id: 'lakeview', name: 'Lakeview Farms Ltd', type: 'Commercial farmer', sales: '120', left: '40', receivables: '21,600' },
  { id: 'cameron', name: 'Cameron Estates', type: 'Commercial farmer', sales: '60', left: '60', receivables: '0' },
];

/** A search result row: the counterparty as a link, its type, and the name it is also known as when the search
    matched a remembered spelling. */
function CpResult({ name, type, aka, onOpen }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 16px', minWidth: 0 }}>
      <CpLink onClick={onOpen}>{name}</CpLink>
      <span style={textStyle('body-4', { tone: 'secondary' })}>{type}</span>
      {aka ? <span data-aka="" style={textStyle('body-4', { tone: 'secondary' })}>Also known as {aka}</span> : null}
    </div>
  );
}

export function CounterpartyFind({ state = 'Global search', onOpen }) {
  const open = () => onOpen && onOpen('riverbend');
  if (state === 'List view' || state === 'No match') {
    const rows = state === 'No match' ? [] : CP_LIST;
    return (
      <Sections>
        <WbHead title="Counterparties" count={rows.length} meta={CP_REFRESHED} />
        <WbFilters view="All counterparties" search="Search counterparties" />
        {rows.length ? (
          <Card padding={4}>
            <DataTable rowKey="id" minWidth={840} rows={rows} columns={[
              { key: 'name', label: 'Counterparty', width: 'minmax(180px, 1fr)', render: (r) => <CpLink onClick={open}>{r.name}</CpLink> },
              { key: 'type', label: 'Type', width: '170px' },
              { key: 'sales', label: 'Sales under contract (t)', width: '190px', align: 'right' },
              { key: 'left', label: 'Left to deliver (t)', width: '160px', align: 'right' },
              { key: 'receivables', label: 'Receivables (USD)', width: '160px', align: 'right' },
              { key: 'status', label: 'Status', width: '110px', render: () => CP_ACTIVE },
            ]} />
          </Card>
        ) : <Card><EmptyState title="No counterparties to display." /></Card>}
      </Sections>
    );
  }
  const query = state === 'Did you mean' ? 'Riverbed Miling' : state === 'Also known as' ? 'RB Mills' : 'Riverbend';
  return (
    <Sections>
      <WbHead title="Search" meta={`Results for ${query}`} />
      <SearchField placeholder="Search contracts, loads, counterparties" value={query} hint={null} maxWidth={480} onChange={() => {}} />
      {state === 'Did you mean' ? (
        <Card padding={16}>
          <span data-did-you-mean="" style={textStyle('body-3')}>No results for {query}. Did you mean <CpLink onClick={open}>Riverbend Milling</CpLink>?</span>
        </Card>
      ) : (
        <Card title={<>Counterparties <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 4 }}><Count>{state === 'Also known as' ? 1 : 2}</Count></span></>} gap={4}>
          <div style={{ margin: '0 -16px -16px' }}>
            <CpResult name="Riverbend Milling" type="Mill" aka={state === 'Also known as' ? 'RB Mills' : null} onOpen={open} />
            {state === 'Also known as' ? null : <div style={{ boxShadow: 'inset 0 1px 0 var(--border-light)' }}><CpResult name="Riverbend Feeds Ltd" type="Feed mill" onOpen={open} /></div>}
          </div>
        </Card>
      )}
      {state === 'Global search' ? (
        <Card title={<>Contracts <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 4 }}><Count>3</Count></span></>} gap={8}>
          <div style={{ margin: '0 -12px -12px' }}>
            <DataTable rowKey="ref" minWidth={520} rows={CP_CONTRACTS} columns={[
              { key: 'ref', label: 'Contract', width: '120px', render: (r) => cpLink(r.ref) },
              { key: 'cp', label: 'Counterparty', width: 'minmax(160px, 1fr)', render: () => 'Riverbend Milling' },
              { key: 'remaining', label: 'Remaining (t)', width: '130px', align: 'right' },
              { key: 'status', label: 'Status', width: '110px', render: () => CP_ACTIVE },
            ]} />
          </div>
        </Card>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ The Counterparty record page */

const CP_CONTRACTS = [
  { ref: 'SYN4702', commodity: 'Wheat', contracted: '5,000', delivered: '4,200', remaining: '800' },
  { ref: 'SYN4790', commodity: 'Wheat', contracted: '1,200', delivered: '0', remaining: '1,200' },
  { ref: 'SYN4845', commodity: 'Wheat', contracted: '4,000', delivered: '0', remaining: '4,000' },
];
// Load statuses follow S57 (UX-32): Loading, In transit, Delivered, Reconciled. A load awaiting offload is In transit.
const CP_LOADS = [
  { ref: 'KAL-07', contract: 'SYN4702', loaded: '34.100', offloaded: '34.020', status: 'Reconciled' },
  { ref: 'KAL-11', contract: 'SYN4702', loaded: '33.960', offloaded: '33.940', status: 'Delivered' },
  { ref: 'KAL-14', contract: 'SYN4702', loaded: '34.300', offloaded: '', status: 'In transit' },
];
const LOAD_MARK = { Reconciled: 'clean', Delivered: 'clean', 'In transit': 'pending', Loading: 'pending' };
const CP_INVOICES = [
  { ref: 'INV-0412', contract: 'SYN4702', amount: '212,000', days: '14' },
  { ref: 'INV-0418', contract: 'SYN4702', amount: '196,000', days: '9' },
  { ref: 'INV-0425', contract: 'SYN4702', amount: '166,000', days: '3' },
];

/** A Related card (UX-03): title, count and View all, its table edge to edge. */
function CpRelated({ title, count, children }) {
  return (
    <Card gap={8} title={<>{title}{' '}<span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 4 }}><Count>{count}</Count></span></>} headerRight={<Button variant="ghost" size="xsmall">View all</Button>}>
      <div style={{ margin: '0 -12px -12px' }}>{children}</div>
    </Card>
  );
}

function CpRelatedTab({ sellTier, loadFocus }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
      <CpRelated title="Contracts" count={CP_CONTRACTS.length}>
        <DataTable rowKey="ref" minWidth={520} rows={CP_CONTRACTS} columns={[
          { key: 'ref', label: 'Contract', width: '96px', render: (r) => cpLink(r.ref) },
          { key: 'commodity', label: 'Commodity', width: 'minmax(90px, 1fr)', render: (r) => <CommodityMarker commodity="wheat">{r.commodity}</CommodityMarker> },
          { key: 'contracted', label: 'Contracted (t)', width: '116px', align: 'right' },
          { key: 'delivered', label: 'Delivered (t)', width: '106px', align: 'right' },
          { key: 'remaining', label: 'Remaining (t)', width: '112px', align: 'right' },
        ]} />
      </CpRelated>
      <CpRelated title="Loads" count={CP_LOADS.length}>
        <DataTable rowKey="ref" minWidth={560} rows={CP_LOADS} columns={[
          { key: 'ref', label: 'Load', width: '80px', render: (r) => cpLink(r.ref) },
          { key: 'contract', label: 'Contract', width: '100px', render: (r) => cpLink(r.contract) },
          { key: 'loaded', label: 'Loaded (t)', width: '100px', align: 'right' },
          { key: 'offloaded', label: 'Offloaded (t)', width: '120px', align: 'right' },
          { key: 'status', label: 'Status', width: 'minmax(120px, 1fr)', render: (r) => <StatusMark kind={LOAD_MARK[r.status]} label={r.status} size="body-4" /> },
        ]} />
      </CpRelated>
      {loadFocus ? (
        <Card title="Load KAL-14" headerRight={<StatusMark kind="pending" label="In transit" size="body-4" />} padding={16}>
          <WbFacts min={150} fields={[['Contract', cpLink('SYN4702')], ['Loaded', '34.300 t'], ['Offloaded', ''], ['Remaining on contract', '800.000 t'], ['In transit on contract', '850.000 t'], ['Over-delivery variance', '+50.000 t']]} />
        </Card>
      ) : null}
      <CpRelated title="Invoices" count={CP_INVOICES.length}>
        <DataTable rowKey="ref" minWidth={sellTier ? 520 : 400} rows={CP_INVOICES} footer={sellTier ? 'Total USD 574,000' : undefined} columns={[
          { key: 'ref', label: 'Invoice', width: '100px', render: (r) => cpLink(r.ref) },
          { key: 'contract', label: 'Contract', width: '100px', render: (r) => cpLink(r.contract) },
          // Without the sell tier the amount column is left out: no viewer of this table needs it drawn restricted.
          ...(sellTier ? [{ key: 'amount', label: 'Amount (USD)', width: '120px', align: 'right' }] : []),
          { key: 'days', label: 'Days outstanding', width: '140px', align: 'right' },
          { key: 'status', label: 'Status', width: 'minmax(100px, 1fr)', render: () => <StatusMark kind="pending" label="Invoiced" size="body-4" /> },
        ]} />
      </CpRelated>
      <CpRelated title="Collateral" count={1}>
        <DataTable rowKey="id" minWidth={520} rows={[{ id: 'c1', site: 'Chisamba Shed', held: '2,400', released: '1,100', remaining: '1,300' }]} columns={[
          { key: 'site', label: 'Location', width: 'minmax(120px, 1fr)', wrap: true },
          { key: 'commodity', label: 'Commodity', width: '110px', render: () => <CommodityMarker commodity="wheat">Wheat</CommodityMarker> },
          { key: 'held', label: 'Held (t)', width: '90px', align: 'right' },
          { key: 'released', label: 'Released (t)', width: '110px', align: 'right' },
          { key: 'remaining', label: 'Remaining (t)', width: '120px', align: 'right' },
        ]} />
      </CpRelated>
    </div>
  );
}

function CpDetailsTab({ cp, farmerTier }) {
  const farmer = cp === LAKEVIEW;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
      <Card title="Identity" padding={16}>
        <WbFacts min={170} fields={farmer
          ? [['Legal name', 'Lakeview Farms Ltd'], ['Trading name', 'Lakeview Farms'], ['Type', 'Commercial farmer'], ['Registration number', '120190004217'], ['District', 'Chisamba'], ['Group', '']]
          : [['Legal name', 'Riverbend Milling Ltd'], ['Trading name', 'Riverbend Milling'], ['Type', 'Mill'], ['Registration number', '120180002931'], ['District', 'Lusaka'], ['Group', <CpLink>Riverbend Group</CpLink>]]} />
      </Card>
      {farmer ? (
        <Card title="Farmer account" padding={16}>
          <WbFacts min={170} fields={[
            ['Balance', farmerTier ? 'USD 4,850.00' : <Restricted />],
            ['Inputs on credit', farmerTier ? 'USD 3,200.00' : <Restricted />],
            ['As of', '04 Oct 2026'],
            ['Source', sourceWords('farmer-ledger', '04 Oct 2026')],
          ]} />
        </Card>
      ) : (
        <Card title="Stock held for Riverbend Milling" padding={16}>
          <WbFacts min={170} fields={[['Opening stock', '1,300.000 t'], ['Site', 'Chisamba Shed'], ['Commodity', 'Wheat']]} />
          <SourceLine kind="stock-sheet" date="30 Sep 2026" />
        </Card>
      )}
    </div>
  );
}

const CP_HISTORY = [
  { id: 'h1', field: 'Group', user: 'N. Phiri', old: '', next: 'Riverbend Group', date: '18 Sep 2026, 10:40', reason: 'Parent company confirmed' },
  { id: 'h2', field: 'Trading name', user: 'J. Tembo', old: 'RB Mills', next: 'Riverbend Milling', date: '12 Sep 2026, 09:05', reason: 'Name on the signed contract' },
  { id: 'h3', field: 'Counterparty', user: 'J. Tembo', old: '', next: 'Created', date: '02 Sep 2026, 09:14', reason: 'First contract' },
];

export function CounterpartyView({ state = 'Related' }) {
  const cp = cpFor(state);
  const initial = state === 'Details' || state.startsWith('Farmer') ? 'Details' : state === 'History' ? 'History' : 'Related';
  const [tab, setTab] = useState(initial);
  const [calc, setCalc] = useState(state === 'Calculation details');
  useEffect(() => { setTab(initial); setCalc(state === 'Calculation details'); }, [state]);
  const sellTier = state !== 'Without the sell tier';
  const figures = cp.figures.map((f) => ({ ...f, restricted: f.tier === 'Sell' && !sellTier }));
  return (
    <Sections>
      <WbHead title={cp.name} meta={CP_REFRESHED} />
      <CounterpartyOverview name={cp.name} type={cp.type} status={CP_ACTIVE} figures={figures} onFigure={() => setCalc(true)} />
      <Tabs tabs={['Details', 'Related', 'History']} value={tab} onChange={setTab} height={44} variant="panel" />
      {tab === 'History' ? (
        <Card padding={4}>
          <DataTable rowKey="id" minWidth={900} rows={CP_HISTORY} columns={[
            { key: 'field', label: 'Field', width: '140px' }, { key: 'user', label: 'User', width: '110px' },
            { key: 'old', label: 'Old value', width: '150px' }, { key: 'next', label: 'New value', width: '160px' },
            { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true }, { key: 'reason', label: 'Reason', width: 'minmax(160px, 1fr)', wrap: true },
          ]} />
        </Card>
      ) : tab === 'Details' ? <CpDetailsTab cp={cp} farmerTier={state !== 'Farmer, without the farmer account tier'} />
        : <CpRelatedTab sellTier={sellTier} loadFocus={state === 'Load awaiting offload'} />}
      <CalculationDetails open={calc} onClose={() => setCalc(false)} name="Left to deliver" value="6,000 t"
        components={CP_CONTRACTS.map((c) => ({ label: c.ref, value: `${c.remaining} t` }))} total={{ label: 'Left to deliver', value: '6,000 t' }}
        basis={[{ label: 'Source', value: sourceWords('trade-sheet', '01 Oct 2026') }, { label: 'Delivered from', value: sourceWords('weighbridge', '04 Oct 2026') }, { label: 'Last refreshed', value: '05 Oct 2026, 07:02 CAT' }]} />
    </Sections>
  );
}

/* ------------------------------------------------------------------ Group overview */

const GROUP_ROWS = [
  { id: 'g1', member: 'Riverbend Milling', ref: 'SYN4702', product: 'Wheat', contracted: '5,000', remaining: '800' },
  { id: 'g2', member: 'Riverbend Milling', ref: 'SYN4790', product: 'Wheat', contracted: '1,200', remaining: '1,200' },
  { id: 'g3', member: 'Riverbend Milling', ref: 'SYN4845', product: 'Wheat', contracted: '4,000', remaining: '4,000' },
  { id: 'g4', member: 'Riverbend Feeds Ltd', ref: 'SYN4811', product: 'Wheat', contracted: '900', remaining: '500' },
  { id: 'g5', member: 'Riverbend Feeds Ltd', ref: 'SYN4812', product: 'White maize', contracted: '500', remaining: '500' },
];

export function CounterpartyGroup({ onOpen }) {
  const cell = (label, value, asOf) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={textStyle('body-4', { tone: 'secondary' })}>{label}</span>
      <span style={textStyle('heading-3-condensed', { tabular: true })}>{value}</span>
      <span data-as-of="" style={textStyle('body-4', { tone: 'secondary' })}>As of {asOf}</span>
    </div>
  );
  return (
    <Sections>
      <WbHead title="Riverbend Group" meta={CP_REFRESHED} />
      <SectionLabel>Remaining under contract, by product</SectionLabel>
      <FigureStrip cells={[cell('Wheat', '6,500 t', '04 Oct 2026'), cell('White maize', '500 t', '04 Oct 2026'), cell('Members', '2', '05 Oct 2026')]} />
      <Card gap={8} title={<>Members' contracts <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 4 }}><Count>{GROUP_ROWS.length}</Count></span></>}>
        <div style={{ margin: '0 -12px -12px' }}>
          <DataTable rowKey="id" minWidth={720} rows={GROUP_ROWS} columns={[
            { key: 'member', label: 'Member', width: 'minmax(180px, 1fr)', render: (r) => <CpLink onClick={() => onOpen && onOpen('riverbend')}>{r.member}</CpLink> },
            { key: 'ref', label: 'Contract', width: '110px', render: (r) => cpLink(r.ref) },
            { key: 'product', label: 'Product', width: '140px', render: (r) => <CommodityMarker commodity={r.product === 'Wheat' ? 'wheat' : 'white-maize'}>{r.product}</CommodityMarker> },
            { key: 'contracted', label: 'Contracted (t)', width: '130px', align: 'right' },
            { key: 'remaining', label: 'Remaining (t)', width: '130px', align: 'right' },
          ]} />
        </div>
      </Card>
    </Sections>
  );
}
