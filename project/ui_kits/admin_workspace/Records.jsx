/** Records and data (M1.DS.03): reference data (sites and storage units, corridors and routes, products, delivery
    points with their capture mode, operating calendars, counterparty classes, grades and seasons), the counterparty
    register and record, the name resolve step, the upload and import preview, the template builder, the Business
    changes log, a permanent record (the ledger) with Reverse, and the read-only contract view with the restricted
    treatment. Every screen takes `state`, one of its RECORDS_STATES entry. Fictional sample data only: SYN4702,
    Lakeview Farms Ltd, Riverbend Milling, Chisamba Shed, Mpongwe Depot, and people with initials. */

export const RECORDS_STATES = {
  SitesList: ['All', 'Inactive', 'No match'],
  SiteRecord: ['Details', 'Related', 'History', 'Edit', 'Conflict on save', 'Effective-dated change', 'Deactivate refused'],
  CorridorsList: ['All'],
  ProductsList: ['All'],
  DeliveryPointsList: ['All'],
  OperatingCalendar: ['Week', 'Holiday added'],
  ReferenceList: ['Counterparty classes', 'Grades', 'Seasons'],
  CounterpartiesList: ['All', 'Flagged', 'No match'],
  CounterpartyRecord: ['Details', 'Related', 'History', 'Without the contacts capability', 'Same name'],
  NameResolve: ['Suggestions', 'Remembered match', 'No match', 'Re-point'],
  UploadPreview: ['Validating', 'Preview with errors', 'Preview clean', 'Imported', 'Failed', 'Duplicate file', 'Without the price tier', 'Wrong type', 'Too large', 'Protected', 'Empty', 'Wrong sheet',
    'Heading not found', 'Columns not read', 'Price tier missing', 'Earlier version', 'Amendment', 'Confirm amendment', 'Confirming amendment', 'Already recorded', 'Differs from recorded', 'Sheet figure differs', 'Duplicate refused', 'Importing'],
  TemplateBuilder: ['Columns', 'Who may upload', 'Versions'],
  BusinessChanges: ['Business changes', 'Without the price tier', 'Exporting', 'No match'],
  LedgerView: ['Entries', 'Posted entry', 'Reverse', 'Reversed'],
  ContractView: ['With the contract tier', 'Without the contract tier'],
};

/** The record a screen's state shows, for the breadcrumb. */
export function recordsTitle(screen, state) {
  if (screen === 'SiteRecord') return 'Chisamba Shed';
  if (screen === 'OperatingCalendar') return 'Chisamba Shed';
  if (screen === 'CounterpartyRecord') return 'Lakeview Farms Ltd';
  if (screen === 'TemplateBuilder') return 'Contract register';
  if (screen === 'UploadPreview') return TRADE_PREVIEW_STATES.includes(state) ? 'Trade sheet 08 Oct 2026.xlsx' : 'Contract register 26 Sep 2026.xlsx';
  if (screen === 'NameResolve') return 'Contract register 26 Sep 2026.xlsx';
  if (screen === 'ReferenceList') return state;
  return null;
}

const R_ACTIVE = <StatusMark kind="clean" label="Active" size="body-4" />;
const R_INACTIVE = <StatusMark kind="neutral" label="Inactive" size="body-4" />;
const R_SCHEDULED = <StatusMark kind="pending" label="Scheduled" size="body-4" />;
const statusOf = (s) => (s === 'Inactive' ? R_INACTIVE : s === 'Scheduled' ? R_SCHEDULED : R_ACTIVE);
const narrowNow = () => !useMinWidth(768);

/** A titled card of label and value pairs (UX-19 Details): "Site information", "System information". A value that does
    not exist is blank, never "None"; a restricted one is the Restricted mark. */
function DetailsCard({ title, fields }) {
  return (
    <Card title={title} padding={16}>
      <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {fields.map(([label, value]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <dt style={textStyle('body-4', { tone: 'secondary' })}>{label}</dt>
            <dd style={{ margin: 0, minHeight: 20, ...textStyle('body-3'), overflowWrap: 'anywhere' }}>{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function ChangesCard({ rows }) {
  return (
    <CountCard title="History" objects="changes" count={rows.length}>
      <SetupTable rowKey="id" columns={[
        { key: 'field', label: 'Field', width: '170px' }, { key: 'user', label: 'User', width: '130px' },
        { key: 'old', label: 'Old value', width: '170px' }, { key: 'next', label: 'New value', width: '170px' },
        { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true }, { key: 'reason', label: 'Reason', wrap: true },
      ]} rows={rows} />
    </CountCard>
  );
}

/* ------------------------------------------------------------------ Sites and storage units */

const SITES = [
  { id: 'chisamba', name: 'Chisamba Shed', type: 'Warehouse', owner: 'United African Grain', units: 7, status: 'Active' },
  { id: 'mpongwe', name: 'Mpongwe Depot', type: 'Depot', owner: 'United African Grain', units: 4, status: 'Active' },
  { id: 'kabwe', name: 'Kabwe Hired Store', type: 'Hired store', owner: 'Lakeview Farms Ltd', units: 2, status: 'Active' },
  { id: 'mkushi', name: 'Mkushi Collection Point', type: 'Collection point', owner: 'United African Grain', units: 0, status: 'Inactive' },
];

export function SitesList({ state = 'All', onOpen }) {
  const rows = state === 'Inactive' ? SITES.filter((s) => s.status === 'Inactive') : state === 'No match' ? [] : SITES;
  return (
    <ListView title="Sites and storage units" objects="sites" search="Search sites" view="All sites" primary={<Button size="small">New site</Button>}
      filters={<Capsule selected={state === 'Inactive'}>Inactive</Capsule>}
      columns={[
        { key: 'name', label: 'Site', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink> },
        { key: 'type', label: 'Type', width: '150px' }, { key: 'owner', label: 'Owner' },
        { key: 'units', label: 'Storage units', width: '130px', align: 'right', tabular: true },
        { key: 'status', label: 'Status', width: '130px', render: (r) => statusOf(r.status) },
      ]} rows={rows} />
  );
}

const UNITS = [
  { id: 'a1', unit: 'A1', shed: 'Shed A', type: 'Stack', use: 'Grain' }, { id: 'a2', unit: 'A2', shed: 'Shed A', type: 'Stack', use: 'Grain' },
  { id: 'a3', unit: 'A3', shed: 'Shed A', type: 'Stack', use: 'Grain' }, { id: 'a4', unit: 'A4', shed: 'Shed A', type: 'Stack', use: 'Grain' },
  { id: 'b1', unit: 'B1', shed: 'Shed B', type: 'Bay', use: 'Fertiliser' }, { id: 'b2', unit: 'B2', shed: 'Shed B', type: 'Bay', use: 'Fertiliser' },
  { id: 'b3', unit: 'B3', shed: 'Shed B', type: 'Bay', use: 'Fertiliser' },
];
const SITE_HISTORY = [
  { id: 'h1', field: 'Owner, from 01 Oct 2026', user: 'N. Phiri', old: 'United African Grain', next: 'Riverbend Milling', date: '26 Sep 2026, 09:10', reason: 'Lease transfers with the new season' },
  { id: 'h2', field: 'Storage units', user: 'N. Phiri', old: '6', next: '7', date: '12 Sep 2026, 14:02', reason: 'Bay B3 built' },
  { id: 'h3', field: 'Site', user: 'T. Mwila', old: '', next: 'Created', date: '01 Sep 2026, 08:00', reason: 'Opening register' },
];

export function SiteRecord({ state = 'Details' }) {
  const initial = state === 'Related' ? 'Related' : state === 'History' ? 'History' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const conflict = state === 'Conflict on save';
  const editing = state === 'Edit' || conflict;
  const scheduled = state === 'Effective-dated change';
  return (
    <Sections>
      <SetupHead title="Chisamba Shed" />
      {scheduled ? <ConditionBanner>Owner changes from United African Grain to Riverbend Milling on 01 Oct 2026, 00:00 CAT.</ConditionBanner> : null}
      {state === 'Deactivate refused' ? <Refusal action="Deactivate" reason="Chisamba Shed holds 1,240 t in 5 storage units. Move or count the stock out first" /> : null}
      {conflict ? <ConflictOnSave user="L. Mulenga" time="26 Sep 2026, 09:10 CAT" yours={[{ label: 'Owner', value: 'Lakeview Farms Ltd' }, { label: 'Weighbridge', value: 'No' }]} /> : null}
      <RecordHighlights kind="Site" title="Chisamba Shed" status={R_ACTIVE} tab={tab} onTab={setTab}
        actions={editing ? <><Button variant="ghost" size="small">Cancel</Button><Button size="small">Save</Button></> : <><Button variant="outline" size="small">Deactivate</Button><Button variant="outline" size="small">Edit</Button></>}
        fields={[{ label: 'Type', value: 'Warehouse' }, { label: 'Owner', value: conflict ? 'Riverbend Milling' : 'United African Grain' }, { label: 'Storage units', value: '7' }, { label: 'Weighbridge', value: 'Yes' }, { label: 'Operating calendar', value: 'Chisamba Shed' }]} />
      {editing ? (
        <Card title="Edit site" padding={16}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <Field label="Site" required><Input defaultValue="Chisamba Shed" /></Field>
            <Field label="Type" required><Select options={['Warehouse', 'Depot', 'Hired store', 'Collection point']} /></Field>
            <Field label="Owner" required><Select options={['United African Grain', 'Riverbend Milling', 'Lakeview Farms Ltd']} defaultValue={conflict ? 'Lakeview Farms Ltd' : undefined} /></Field>
            <Field label="Weighbridge" required><Select options={['Yes', 'No']} defaultValue={conflict ? 'No' : undefined} /></Field>
            <Field label="Effective from" required hint="A change takes effect at this date and time, never earlier."><Input defaultValue="01 Oct 2026, 00:00 CAT" /></Field>
            <Field label="Reason" required><Input multiline defaultValue="Lease transfers with the new season" /></Field>
          </div>
        </Card>
      ) : tab === 'History' ? <ChangesCard rows={SITE_HISTORY} /> : tab === 'Related' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
          <CountCard title="Storage units" objects="storage units" count={UNITS.length}>
            <SetupTable rowKey="id" columns={[{ key: 'unit', label: 'Unit', width: '80px' }, { key: 'shed', label: 'Shed', width: '110px' }, { key: 'type', label: 'Type', width: '100px' }, { key: 'use', label: 'Use' }, { key: 'status', label: 'Status', width: '120px', render: () => R_ACTIVE }]} rows={UNITS} />
          </CountCard>
          <CountCard title="Delivery points" objects="delivery points" count={1}>
            <SetupTable rowKey="id" columns={[{ key: 'name', label: 'Delivery point' }, { key: 'mode', label: 'Capture mode', width: '150px' }]} rows={[{ id: 'd1', name: 'Chisamba Shed weighbridge', mode: 'Weighbridge' }]} />
          </CountCard>
        </div>
      ) : (
        <>
          <DetailsCard title="Site information" fields={[['Site', 'Chisamba Shed'], ['Type', 'Warehouse'], ['Owner', scheduled ? 'United African Grain, then Riverbend Milling from 01 Oct 2026' : 'United African Grain'], ['District', 'Chisamba'], ['Weighbridge', 'Yes'], ['Operating calendar', 'Chisamba Shed']]} />
          <DetailsCard title="System information" fields={[['Created by', 'T. Mwila'], ['Created date', '01 Sep 2026, 08:00 CAT'], ['Last modified by', 'N. Phiri'], ['Last modified date', '26 Sep 2026, 09:10']]} />
        </>
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Corridors, products, delivery points */

export function CorridorsList({ onOpen }) {
  return (
    <ListView title="Corridors and routes" objects="routes" search="Search routes" view="All routes" primary={<Button size="small">New route</Button>}
      columns={[
        { key: 'route', label: 'Route', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.route}</RecordLink> },
        { key: 'corridor', label: 'Corridor', width: '170px' }, { key: 'from', label: 'From', width: '160px' }, { key: 'to', label: 'To', width: '160px' },
        { key: 'days', label: 'Expected transit', width: '150px', tabular: true }, { key: 'status', label: 'Status', width: '120px', render: () => R_ACTIVE },
      ]} rows={[
        { id: 'r1', route: 'Mpongwe Depot to Chisamba Shed', corridor: 'Copperbelt', from: 'Mpongwe Depot', to: 'Chisamba Shed', days: '1 day' },
        { id: 'r2', route: 'Chisamba Shed to Riverbend Milling', corridor: 'Central', from: 'Chisamba Shed', to: 'Riverbend Milling', days: '6 hours' },
        { id: 'r3', route: 'Beira port to Chisamba Shed', corridor: 'Beira', from: 'Beira port', to: 'Chisamba Shed', days: '5 days' },
      ]} />
  );
}

export function ProductsList({ onOpen }) {
  return (
    <ListView title="Products" objects="products" search="Search products" view="All products" primary={<Button size="small">New product</Button>}
      columns={[
        { key: 'name', label: 'Product', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink> },
        { key: 'commodity', label: 'Commodity', width: '140px' }, { key: 'form', label: 'Form', width: '110px' }, { key: 'grade', label: 'Grade', width: '120px' },
        { key: 'unit', label: 'Unit', width: '90px' }, { key: 'status', label: 'Status', width: '120px', render: (r) => statusOf(r.status) },
      ]} rows={[
        { id: 'p1', name: 'White maize, bulk', commodity: 'Maize', form: 'Bulk', grade: 'Grade A', unit: 't', status: 'Active' },
        { id: 'p2', name: 'White maize, bagged', commodity: 'Maize', form: 'Bagged', grade: 'Grade A', unit: 'bags', status: 'Active' },
        { id: 'p3', name: 'Soya beans, bulk', commodity: 'Soya', form: 'Bulk', grade: 'Standard', unit: 't', status: 'Active' },
        { id: 'p4', name: 'Wheat, bulk', commodity: 'Wheat', form: 'Bulk', grade: 'Grade 1', unit: 't', status: 'Active' },
        { id: 'p5', name: 'Fertiliser, compound D', commodity: 'Fertiliser', form: 'Bagged', grade: '', unit: 'bags', status: 'Inactive' },
      ]} />
  );
}

export function DeliveryPointsList({ onOpen }) {
  return (
    <ListView title="Delivery points" objects="delivery points" search="Search delivery points" view="All delivery points" primary={<Button size="small">New delivery point</Button>}
      columns={[
        { key: 'name', label: 'Delivery point', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink> },
        { key: 'site', label: 'Site or counterparty', width: '200px' }, { key: 'mode', label: 'Capture mode', width: '150px' },
        { key: 'status', label: 'Status', width: '120px', render: () => R_ACTIVE },
      ]} rows={[
        { id: 'd1', name: 'Chisamba Shed weighbridge', site: 'Chisamba Shed', mode: 'Weighbridge' },
        { id: 'd2', name: 'Mpongwe Depot gate', site: 'Mpongwe Depot', mode: 'Scanned slip' },
        { id: 'd3', name: 'Riverbend Milling intake', site: 'Riverbend Milling', mode: 'Mill figure' },
        { id: 'd4', name: 'Lakeview Farms Ltd farm gate', site: 'Lakeview Farms Ltd', mode: 'Field capture' },
      ]} />
  );
}

/* ------------------------------------------------------------------ Operating calendars */

export function OperatingCalendar({ state = 'Week' }) {
  const added = state === 'Holiday added';
  const days = [['Monday', '06:00', '18:00'], ['Tuesday', '06:00', '18:00'], ['Wednesday', '06:00', '18:00'], ['Thursday', '06:00', '18:00'], ['Friday', '06:00', '18:00'], ['Saturday', '06:00', '13:00'], ['Sunday', '', '']];
  const holidays = [
    ...(added ? [{ id: 'x0', day: '18 Oct 2026', name: 'Annual stock count', hours: 'Closed' }] : []),
    { id: 'x1', day: '24 Oct 2026', name: 'Independence Day', hours: 'Closed' },
    { id: 'x2', day: '25 Dec 2026', name: 'Christmas Day', hours: 'Closed' },
  ];
  return (
    <Sections>
      <SetupHead title="Operating calendar, Chisamba Shed" right={<Button size="small">Add closed day</Button>} />
      {added ? <Banner tone="success">Closed day added: 18 Oct 2026, Annual stock count.</Banner> : null}
      <Card title="Opening hours (CAT)" gap={8}>
        <div style={{ margin: '0 -16px -16px' }}>
          <SetupTable rowKey="day" columns={[{ key: 'day', label: 'Day' }, { key: 'opens', label: 'Opens', width: '120px', tabular: true }, { key: 'closes', label: 'Closes', width: '120px', tabular: true }, { key: 'note', label: 'Note', width: '140px' }]}
            rows={days.map(([day, opens, closes]) => ({ day, opens, closes, note: opens ? '' : 'Closed' }))} />
        </div>
      </Card>
      <CountCard title="Closed days" objects="closed days" count={holidays.length}>
        <SetupTable rowKey="id" columns={[{ key: 'day', label: 'Date', width: '150px', tabular: true }, { key: 'name', label: 'Closed for' }, { key: 'hours', label: 'Hours', width: '120px' }]} rows={holidays} />
      </CountCard>
      <span style={textStyle('body-4', { tone: 'secondary' })}>Alert times at this site count only these hours, in Zambian time.</span>
    </Sections>
  );
}

/* ------------------------------------------------------------------ Counterparty classes, grades and seasons */

export function ReferenceList({ state = 'Counterparty classes', onOpen }) {
  const link = (v) => <RecordLink onClick={() => onOpen && onOpen(v)}>{v}</RecordLink>;
  if (state === 'Grades') {
    return <ListView title="Grades" objects="grades" search="Search grades" view="All grades" primary={<Button size="small">New grade</Button>}
      columns={[{ key: 'name', label: 'Grade', render: (r) => link(r.name) }, { key: 'commodity', label: 'Commodity', width: '140px' }, { key: 'spec', label: 'Specification' }, { key: 'status', label: 'Status', width: '120px', render: () => R_ACTIVE }]}
      rows={[{ id: 'g1', name: 'Grade A', commodity: 'Maize', spec: 'Moisture up to 12.5%, foreign matter up to 1%' }, { id: 'g2', name: 'Grade B', commodity: 'Maize', spec: 'Moisture up to 13.5%, foreign matter up to 2%' }, { id: 'g3', name: 'Grade 1', commodity: 'Wheat', spec: 'Protein from 12%, falling number from 250' }]} />;
  }
  if (state === 'Seasons') {
    return <ListView title="Seasons" objects="seasons" search="Search seasons" view="All seasons" primary={<Button size="small">New season</Button>}
      columns={[{ key: 'name', label: 'Season', render: (r) => link(r.name) }, { key: 'from', label: 'From', width: '150px', tabular: true }, { key: 'to', label: 'To', width: '150px', tabular: true }, { key: 'status', label: 'Status', width: '130px', render: (r) => statusOf(r.status) }]}
      rows={[{ id: 's1', name: '2026/27', from: '01 May 2026', to: '30 Apr 2027', status: 'Active' }, { id: 's2', name: '2027/28', from: '01 May 2027', to: '30 Apr 2028', status: 'Scheduled' }]} />;
  }
  return <ListView title="Counterparty classes" objects="classes" search="Search classes" view="All classes" primary={<Button size="small">New class</Button>}
    columns={[{ key: 'name', label: 'Class', render: (r) => link(r.name) }, { key: 'meaning', label: 'Meaning' }, { key: 'count', label: 'Counterparties', width: '150px', align: 'right', tabular: true }, { key: 'status', label: 'Status', width: '120px', render: () => R_ACTIVE }]}
    rows={[{ id: 'c1', name: 'Commercial farmer', meaning: 'Sells grain at contract terms', count: 42 }, { id: 'c2', name: 'Outgrower', meaning: 'Grows under a season programme with inputs', count: 318 }, { id: 'c3', name: 'Miller', meaning: 'Buys grain for milling', count: 9 }, { id: 'c4', name: 'Transporter', meaning: 'Moves loads on a corridor', count: 14 }]} />;
}

/* ------------------------------------------------------------------ Counterparties */

const COUNTERPARTIES = [
  { id: 'lakeview', name: 'Lakeview Farms Ltd', cls: 'Commercial farmer', district: 'Chisamba', flags: '', status: 'Active' },
  { id: 'lakeview2', name: 'Lakeview Farms Ltd', cls: 'Outgrower', district: 'Mkushi', flags: 'Same name', status: 'Active' },
  { id: 'riverbend', name: 'Riverbend Milling', cls: 'Miller', district: 'Lusaka', flags: '', status: 'Active' },
  { id: 'kafue', name: 'Kafue Haulage', cls: 'Transporter', district: 'Kafue', flags: 'Documents expiring', status: 'Active' },
];

export function CounterpartiesList({ state = 'All', onOpen }) {
  const rows = state === 'Flagged' ? COUNTERPARTIES.filter((c) => c.flags) : state === 'No match' ? [] : COUNTERPARTIES;
  return (
    <ListView title="Counterparties" objects="counterparties" search="Search counterparties" view="All counterparties" primary={<Button size="small">New counterparty</Button>}
      filters={<><Capsule chevron>Class: All</Capsule><Capsule selected={state === 'Flagged'}>Flagged</Capsule></>}
      columns={[
        { key: 'name', label: 'Counterparty', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink> },
        { key: 'cls', label: 'Class', width: '170px' }, { key: 'district', label: 'District', width: '130px' }, { key: 'flags', label: 'Flags', width: '170px' },
        { key: 'status', label: 'Status', width: '120px', render: () => R_ACTIVE },
      ]} rows={rows} />
  );
}

function NewCounterpartyDialog({ onClose }) {
  const narrow = narrowNow();
  return (
    <Dialog title="New counterparty" width={480} sheet={narrow} onClose={onClose}
      footer={<><Button variant="ghost" size="small" onClick={onClose}>Cancel</Button><Button size="small">Save</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Name" required><Input defaultValue="Lakeview Farms Ltd" /></Field>
        <Field label="Class" required><Select options={['Commercial farmer', 'Outgrower', 'Miller', 'Transporter']} /></Field>
        <Field label="District" required error="District must tell this Lakeview Farms Ltd apart from the one in Chisamba."><Input defaultValue="Chisamba" invalid /></Field>
        <Field label="Farm" hint="The farm name or plot, when two counterparties share a name and a district."><Input defaultValue="" /></Field>
      </div>
    </Dialog>
  );
}

export function CounterpartyRecord({ state = 'Details' }) {
  const initial = state === 'Related' ? 'Related' : state === 'History' ? 'History' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const contacts = state !== 'Without the contacts capability';
  return (
    <Sections>
      <SetupHead title="Lakeview Farms Ltd" />
      <RecordHighlights kind="Counterparty" title="Lakeview Farms Ltd" status={R_ACTIVE} tab={tab} onTab={setTab}
        actions={<Button variant="outline" size="small">Edit</Button>}
        fields={[{ label: 'Class', value: 'Commercial farmer' }, { label: 'District', value: 'Chisamba' }, { label: 'Open contracts', value: '1' }, { label: 'Flags', value: '' }, { label: 'Owner', value: 'J. Tembo' }]} />
      {tab === 'History' ? <ChangesCard rows={[
        { id: 'h1', field: 'District', user: 'L. Mulenga', old: '', next: 'Chisamba', date: '12 Sep 2026, 10:20', reason: 'Two counterparties share this name' },
        { id: 'h2', field: 'Counterparty', user: 'J. Tembo', old: '', next: 'Created', date: '02 Sep 2026, 09:14', reason: 'First contract' },
      ]} /> : tab === 'Related' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
          <CountCard title="Contracts" objects="contracts" count={1}>
            <SetupTable rowKey="id" columns={[{ key: 'ref', label: 'Contract', width: '110px', render: (r) => <RecordLink>{r.ref}</RecordLink> }, { key: 'commodity', label: 'Commodity' }, { key: 'qty', label: 'Quantity', width: '110px', align: 'right', tabular: true }, { key: 'status', label: 'Status', width: '110px', render: () => R_ACTIVE }]}
              rows={[{ id: 'k1', ref: 'SYN4702', commodity: 'White maize', qty: '5,000 t' }]} />
          </CountCard>
          <CountCard title="Names it goes by" objects="names" count={2}>
            <SetupTable rowKey="id" columns={[{ key: 'name', label: 'Name as written' }, { key: 'source', label: 'Source', width: '200px' }]}
              rows={[{ id: 'n1', name: 'Lakeview Farm Ltd', source: 'Contract register upload' }, { id: 'n2', name: 'LAKEVIEW FARMS', source: 'Weighbridge ticket' }]} />
          </CountCard>
        </div>
      ) : (
        <>
          <DetailsCard title="Identity" fields={[['Legal name', 'Lakeview Farms Ltd'], ['Trading name', 'Lakeview Farms'], ['Registration number', '120190004217'], ['Class', 'Commercial farmer'], ['District', 'Chisamba'], ['Farm', 'Plot 14, Chisamba South']]} />
          {contacts ? (
            <CountCard title="Contacts" objects="contacts" count={2}>
              <SetupTable rowKey="id" columns={[{ key: 'name', label: 'Name', width: '150px' }, { key: 'role', label: 'Role', width: '150px' }, { key: 'phone', label: 'Phone', width: '160px', tabular: true }, { key: 'email', label: 'Email' }]}
                rows={[{ id: 'p1', name: 'M. Banda', role: 'Owner', phone: '+260 97 000 0101', email: 'm.banda@example.com' }, { id: 'p2', name: 'S. Lungu', role: 'Farm manager', phone: '+260 96 000 0202', email: '' }]} />
            </CountCard>
          ) : null}
          <CountCard title="Flags" objects="flags" count={0} />
        </>
      )}
      {state === 'Same name' ? <NewCounterpartyDialog /> : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Name resolve */

export function NameResolve({ state = 'Suggestions' }) {
  const narrow = narrowNow();
  const written = <DetailsCard title="Row 7 of the contract register" fields={[['Name as written', 'Lakeview Farm Ltd'], ['Contract', 'SYN4702'], ['District as written', 'Chisamba']]} />;
  if (state === 'Remembered match') {
    return (
      <Sections>
        <SetupHead title="Who is Lakeview Farm Ltd?" />
        {written}
        <DetailsCard title="Matched" fields={[['Counterparty', <RecordLink>Lakeview Farms Ltd, Chisamba</RecordLink>], ['Source', 'Remembered from the 12 Sep 2026 upload, matched by L. Mulenga']]} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}><Button variant="outline" size="small">Re-point</Button><Button size="small">Keep this match</Button></div>
      </Sections>
    );
  }
  if (state === 'No match') {
    return (
      <Sections>
        <SetupHead title="Who is Lakeview Farm Ltd?" />
        {written}
        <Card><EmptyState tone="neutral" icon="search" title="No counterparty has a name like this." /></Card>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Button size="small">New counterparty</Button></div>
      </Sections>
    );
  }
  return (
    <Sections>
      <SetupHead title="Who is Lakeview Farm Ltd?" />
      {written}
      <Card title="Closest names first" padding={16}>
        <RadioList name="resolve" value="lakeview" options={[
          { value: 'lakeview', label: 'Lakeview Farms Ltd', hint: 'Commercial farmer, Chisamba' },
          { value: 'lakeview2', label: 'Lakeview Farms Ltd', hint: 'Outgrower, Mkushi' },
          { value: 'lakeshore', label: 'Lakeshore Estates', hint: 'Commercial farmer, Kabwe' },
        ]} />
      </Card>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}><Button variant="outline" size="small">New counterparty</Button><Button size="small">Match</Button></div>
      {state === 'Re-point' ? (
        <Dialog title="Re-point Lakeview Farm Ltd" width={480} sheet={narrow}
          footer={<><Button variant="ghost" size="small">Cancel</Button><Button size="small">Re-point</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span style={textStyle('body-3')}>Rows already imported keep their counterparty. The next rows written as Lakeview Farm Ltd go to the one you choose.</span>
            <Field label="Counterparty" required><Select options={['Lakeview Farms Ltd, Mkushi', 'Lakeview Farms Ltd, Chisamba']} /></Field>
            <Field label="Reason" required><Input multiline defaultValue="The Chisamba farm trades under its own name" /></Field>
          </div>
        </Dialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Upload and import preview */

const UPLOAD_ROWS = [
  { row: 2, contract: 'SYN4702', counterparty: 'Riverbend Milling', commodity: 'White maize', qty: '5,000', price: '284.40' },
  { row: 3, contract: 'SYN4703', counterparty: 'Lakeview Farms Ltd', commodity: 'Soya beans', qty: '1,200', price: '512.00' },
  { row: 4, contract: 'SYN4704', counterparty: 'Riverbend Milling', commodity: 'Wheat', qty: '800', price: '338.10' },
];

const REFUSED = {
  'Wrong type': 'File must be an Excel workbook (.xlsx).',
  'Too large': 'File must be 10 MB or smaller.',
  Protected: 'File must not be protected by a password.',
  Empty: 'File must have at least one row under the headings.',
  'Wrong sheet': 'Sheet must be named Contract register.',
};

// The upload preview additions (M3.DS.01, AC 1(f) and (g)), on the trade sheet. Each check cites its cell; the
// warnings never stop Import, and an amendment does until it is confirmed (ImportPreview's PREVIEW_CHECKS).
const TRADE_PREVIEW_STATES = ['Heading not found', 'Columns not read', 'Price tier missing', 'Earlier version', 'Amendment', 'Confirm amendment', 'Confirming amendment', 'Already recorded', 'Differs from recorded', 'Sheet figure differs', 'Duplicate refused', 'Importing'];
const TRADE_ROWS = [
  { row: 2, contract: 'SYN4702-A', counterparty: 'Riverbend Milling', product: 'White maize', tonnes: '1,200.000' },
  { row: 3, contract: 'SYN4702-B', counterparty: 'Riverbend Milling', product: 'White maize', tonnes: '800.000' },
  { row: 4, contract: 'SYN4702-C', counterparty: 'Lakeview Farms Ltd', product: 'White maize', tonnes: '180.000' },
  { row: 5, contract: 'SYN4790', counterparty: 'Riverbend Milling', product: 'Wheat', tonnes: '1,200.000' },
  { row: 6, contract: 'SYN4845', counterparty: 'Riverbend Milling', product: 'Wheat', tonnes: '4,000.000' },
];
const TRADE_CHECK = {
  'Already recorded': { row: 3, check: 'already-recorded', cell: 'A3' },
  'Differs from recorded': { row: 6, check: 'differs-from-recorded', cell: 'D6' },
  'Sheet figure differs': { row: 5, check: 'sheet-figure-differs', cell: 'K5' },
  Amendment: { row: 4, check: 'amendment', cell: 'D4', old: '150.000', next: '180.000' },
};

function TradeSheetPreview({ state }) {
  const narrow = narrowNow();
  const amending = state === 'Amendment' || state === 'Confirm amendment' || state === 'Confirming amendment';
  const c = TRADE_CHECK[amending ? 'Amendment' : state];
  // A refused file is not read, and without its required headings no row is: neither shows rows.
  const unread = state === 'Heading not found' || state === 'Price tier missing' || state === 'Duplicate refused';
  const rows = unread ? [] : TRADE_ROWS.map((r) => (c && r.row === c.row ? { ...r, ...c } : r));
  const file = {
    name: 'Trade sheet 08 Oct 2026.xlsx', by: state === 'Price tier missing' ? ['K. Zulu', '09:40'] : ['L. Mulenga', '09:40'], rows: unread ? '' : 5,
    template: state === 'Earlier version' ? 'Trade sheet, version 1' : 'Trade sheet, version 2',
    inForce: state === 'Earlier version' ? 'Version 2, from 08 Oct 2026' : undefined,
    missing: state === 'Heading not found' ? ['Delivery window (Trades, row 1)'] : undefined,
    notRead: state === 'Columns not read' ? ['Comments (H1)', 'Officer (I1)'] : undefined,
  };
  const refusal = state === 'Price tier missing' ? { reason: 'Trade sheet version 2 reads Buy price K/t (cell F1) for the Contract tier, which K. Zulu does not hold' }
    : state === 'Duplicate refused' ? { reason: 'This file was imported as UPL-000240 on 01 Oct 2026, 09:12 CAT' } : undefined;
  const tiles = unread ? [] : state === 'Importing'
    ? [{ label: 'Rows', value: '1,240' }, { label: 'Imported so far', value: '412 of 1,240' }]
    : [{ label: 'Rows', value: '5' }, { label: 'New contracts', value: '2' }, { label: 'Amendments', value: amending ? '1' : '0' }, { label: 'Warnings', value: c && !amending ? '1' : '0' }];
  return (
    <Sections>
      <SetupHead title="Trade sheet preview" right={state === 'Heading not found' ? <Button variant="outline" size="small">New version</Button> : amending ? <Button variant="outline" size="small">Confirm amendments</Button> : null} />
      <ImportPreview status="ready" importing={state === 'Importing'} file={file} refusal={refusal} tiles={tiles}
        columns={[
          { key: 'contract', label: 'Contract', width: '120px' }, { key: 'counterparty', label: 'Counterparty', width: '170px' }, { key: 'product', label: 'Product', width: '120px' },
          { key: 'tonnes', label: 'Contracted (t)', width: '130px', align: 'right', tabular: true },
          ...(amending ? [{ key: 'old', label: 'Old value', width: '110px', align: 'right', tabular: true }, { key: 'next', label: 'New value', width: '110px', align: 'right', tabular: true }] : []),
        ]} rows={rows} />
      {state === 'Confirm amendment' || state === 'Confirming amendment' ? (
        <Dialog title="Confirm 1 amendment" width={480} sheet={narrow}
          footer={<><Button variant="ghost" size="small" disabled={state === 'Confirming amendment'}>Cancel</Button><Button size="small" loading={state === 'Confirming amendment'}>Confirm</Button></>}>
          <div style={{ margin: '0 -8px' }}>
            <SetupTable rowKey="id" columns={[{ key: 'field', label: 'Field', wrap: true }, { key: 'old', label: 'Old value', width: '96px', align: 'right', tabular: true }, { key: 'next', label: 'New value', width: '96px', align: 'right', tabular: true }]}
              rows={[{ id: 'a1', field: 'SYN4702-C, Contracted (t)', old: '150.000', next: '180.000' }]} />
          </div>
        </Dialog>
      ) : null}
    </Sections>
  );
}

export function UploadPreview({ state = 'Preview with errors' }) {
  if (TRADE_PREVIEW_STATES.includes(state)) return <TradeSheetPreview state={state} />;
  if (REFUSED[state]) {
    return (
      <Sections>
        <SetupHead title="Upload contract register" />
        <Card title="File" padding={16}>
          <Field label="File" required error={REFUSED[state]}><Input defaultValue={state === 'Wrong type' ? 'Contract register 26 Sep 2026.pdf' : 'Contract register 26 Sep 2026.xlsx'} invalid /></Field>
        </Card>
      </Sections>
    );
  }
  const errors = state === 'Preview with errors';
  const status = state === 'Validating' ? 'validating' : state === 'Imported' ? 'imported' : state === 'Failed' ? 'failed' : 'ready';
  const tier = state !== 'Without the price tier';
  const rows = errors ? [...UPLOAD_ROWS, { row: 5, contract: 'SYN4999', counterparty: 'Lakeview Farm Ltd', commodity: 'White maize', qty: '600', price: '279.00', error: 'Row 5, cell A5: SYN4999 is not a contract' }] : UPLOAD_ROWS;
  return (
    <Sections>
      <SetupHead title="Contract register preview" />
      {state === 'Duplicate file' ? <ConditionBanner>This file was imported on 25 Sep 2026, 14:10 CAT by L. Mulenga. Importing it again adds only rows not already recorded.</ConditionBanner> : null}
      {state === 'Failed' ? <Banner tone="error">Import failed at row 4. Nothing was imported; the file can be imported again.</Banner> : null}
      <ImportPreview status={status} file={{ name: 'Contract register 26 Sep 2026.xlsx', by: ['L. Mulenga', '09:12'], rows: rows.length }}
        tiles={[{ label: 'Rows', value: String(rows.length) }, { label: 'New contracts', value: errors ? '3' : '2' }, { label: 'Already recorded', value: '1' }, { label: 'Errors', value: errors ? '1' : '0' }]}
        columns={[
          { key: 'contract', label: 'Contract', width: '110px' }, { key: 'counterparty', label: 'Counterparty', width: '180px' }, { key: 'commodity', label: 'Commodity', width: '120px' },
          { key: 'qty', label: 'Quantity (t)', width: '120px', align: 'right', tabular: true },
          ...(tier ? [{ key: 'price', label: 'Price (USD per t)', width: '150px', align: 'right', tabular: true }] : []),
        ]} rows={rows} />
    </Sections>
  );
}

/* ------------------------------------------------------------------ Template builder */

export function TemplateBuilder({ state = 'Columns' }) {
  const [tab, setTab] = useState(state === 'Versions' ? 'History' : 'Details');
  useEffect(() => setTab(state === 'Versions' ? 'History' : 'Details'), [state]);
  const columns = [
    { id: 'c1', header: 'Contract no', field: 'Contract', type: 'Reference', required: 'Yes', check: 'Must be a contract or new', tier: '' },
    { id: 'c2', header: 'Buyer', field: 'Counterparty', type: 'Name', required: 'Yes', check: 'Resolved to a counterparty', tier: '' },
    { id: 'c3', header: 'Product', field: 'Commodity', type: 'List', required: 'Yes', check: 'One of the products', tier: '' },
    { id: 'c4', header: 'Tonnes', field: 'Quantity', type: 'Tonnes', required: 'Yes', check: 'More than 0', tier: '' },
    { id: 'c5', header: 'Price USD', field: 'Price', type: 'Money', required: 'Yes', check: 'More than 0', tier: 'Contract' },
    { id: 'c6', header: 'Delivery', field: 'Delivery window', type: 'Month range', required: '', check: 'From before To', tier: '' },
  ];
  return (
    <Sections>
      <SetupHead title="Contract register" />
      <RecordHighlights kind="Template" title="Contract register" status={R_ACTIVE} tab={tab} onTab={setTab}
        actions={state === 'Who may upload' ? <><Button variant="ghost" size="small">Cancel</Button><Button size="small">Save</Button></> : <><Button variant="outline" size="small">New version</Button><Button variant="outline" size="small">Edit</Button></>}
        fields={[{ label: 'Sheet', value: 'Contract register' }, { label: 'Columns', value: String(columns.length) }, { label: 'Version', value: '2, from 01 Sep 2026' }, { label: 'Who may upload', value: 'Trading, Trading support' }]} />
      {tab === 'History' ? (
        <CountCard title="Versions" objects="versions" count={2}>
          <SetupTable rowKey="id" columns={[{ key: 'v', label: 'Version', width: '90px', tabular: true }, { key: 'from', label: 'Effective from', width: '190px', tabular: true }, { key: 'change', label: 'Change', wrap: true }, { key: 'by', label: 'By', width: '120px' }]}
            rows={[{ id: 'v2', v: '2', from: '01 Sep 2026, 00:00', change: 'Delivery added, as a month range', by: 'N. Phiri' }, { id: 'v1', v: '1', from: '15 Aug 2026, 00:00', change: 'Created from the file\'s own headings', by: 'N. Phiri' }]} />
        </CountCard>
      ) : state === 'Who may upload' ? (
        <Card title="Who may upload" padding={16}>
          <Field label="Bundles" hint="Nobody may upload until the administrator names a bundle here.">
            <CheckboxList options={['Trading', 'Trading support', 'Operations', 'Finance']} values={['Trading', 'Trading support']} />
          </Field>
        </Card>
      ) : (
        <CountCard title="Columns" objects="columns" count={columns.length}>
          <SetupTable rowKey="id" columns={[
            { key: 'header', label: 'Heading in the file', width: '160px' }, { key: 'field', label: 'One Link field', width: '160px' }, { key: 'type', label: 'Type', width: '120px' },
            { key: 'required', label: 'Required', width: '100px' }, { key: 'check', label: 'Check', wrap: true }, { key: 'tier', label: 'Price tier', width: '110px' },
          ]} rows={columns} />
        </CountCard>
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Business changes */

const CHANGES = [
  { id: 'b1', time: '26 Sep 2026, 09:10', user: 'N. Phiri', record: 'Site Chisamba Shed', field: 'Owner, from 01 Oct 2026', old: 'United African Grain', next: 'Riverbend Milling', reason: 'Lease transfers with the new season' },
  { id: 'b2', time: '26 Sep 2026, 08:40', user: 'N. Phiri', record: 'Setting GRN reconcile tolerance', field: 'Value, from 28 Sep 2026', old: '80 kg', next: '100 kg', reason: 'Agreed tolerance for the new season' },
  { id: 'b3', time: '25 Sep 2026, 16:05', user: 'J. Tembo', record: 'Contract SYN4702', field: 'Price', old: 'USD 280.00 per t', next: 'USD 284.40 per t', reason: 'Addendum signed', guarded: true },
  { id: 'b4', time: '25 Sep 2026, 11:30', user: 'L. Mulenga', record: 'Counterparty Lakeview Farms Ltd', field: 'District', old: '', next: 'Chisamba', reason: 'Two counterparties share this name' },
];

/** The Business changes log: what changed across the platform, with user, time, old value, new value and reason. For
    a reader without a value's tier, the value is the Restricted mark (S10 control 4); the row stays. */
export function BusinessChangesLog({ restricted = false, empty = false }) {
  const value = (r, k) => (r.guarded && restricted ? <Restricted /> : r[k]);
  return empty ? <Card><EmptyState title="No changes to display." /></Card> : (
    <SetupTable rowKey="id" columns={[
      { key: 'time', label: 'Time (CAT)', width: '170px', tabular: true }, { key: 'user', label: 'User', width: '120px' }, { key: 'record', label: 'Record', width: '220px' },
      { key: 'field', label: 'Field', width: '170px' }, { key: 'old', label: 'Old value', width: '170px', render: (r) => value(r, 'old') },
      { key: 'next', label: 'New value', width: '170px', render: (r) => value(r, 'next') }, { key: 'reason', label: 'Reason' },
    ]} rows={CHANGES} />
  );
}

export function BusinessChanges({ state = 'Business changes' }) {
  return (
    <Sections>
      <SetupHead title="Audit logs" right={<Button variant="outline" size="small" icon="download" loading={state === 'Exporting'}>Export</Button>} />
      <Tabs tabs={['Access log', 'Business changes', 'Cloud activity']} value="Business changes" height={44} variant="panel" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 220px))', gap: 12 }}>
        <Field label="From"><Input type="date" defaultValue="2026-09-25" /></Field>
        <Field label="To"><Input type="date" defaultValue="2026-09-26" /></Field>
        <Field label="User"><Select options={['All users', 'N. Phiri', 'J. Tembo', 'L. Mulenga']} /></Field>
      </div>
      <BusinessChangesLog restricted={state === 'Without the price tier'} empty={state === 'No match'} />
    </Sections>
  );
}

/* ------------------------------------------------------------------ A permanent record: the ledger */

const ENTRIES = [
  { id: 'je412', ref: 'JE-2026-000412', date: '25 Sep 2026', account: 'Farmer advances', counterparty: 'Lakeview Farms Ltd', debit: '1,500.00', credit: '', status: 'Posted' },
  { id: 'je411', ref: 'JE-2026-000411', date: '24 Sep 2026', account: 'Input loans', counterparty: 'Lakeview Farms Ltd', debit: '820.00', credit: '', status: 'Posted' },
  { id: 'je410', ref: 'JE-2026-000410', date: '22 Sep 2026', account: 'Grain receivable', counterparty: 'Riverbend Milling', debit: '', credit: '12,300.00', status: 'Posted' },
];

function LedgerTable({ rows, onOpen }) {
  return (
    <SetupTable rowKey="id" columns={[
      { key: 'ref', label: 'Entry', width: '170px', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.ref}</RecordLink> },
      { key: 'date', label: 'Date', width: '120px', tabular: true }, { key: 'account', label: 'Account', width: '160px' }, { key: 'counterparty', label: 'Counterparty' },
      { key: 'debit', label: 'Debit (USD)', width: '130px', align: 'right', tabular: true }, { key: 'credit', label: 'Credit (USD)', width: '130px', align: 'right', tabular: true },
      { key: 'status', label: 'Status', width: '120px', render: (r) => (r.status === 'Reversed' ? <StatusMark kind="neutral" label="Reversed" size="body-4" /> : <StatusMark kind="clean" label={r.status} size="body-4" />) },
    ]} rows={rows} />
  );
}

export function LedgerView({ state = 'Entries', onOpen }) {
  if (state === 'Entries') {
    return (
      <Page module="finance" breadcrumb={['Farmer Finance', 'Ledger']}>
        <Sections>
          <SetupHead title="Ledger" count={ENTRIES.length} />
          <Card padding={0}><LedgerTable rows={ENTRIES} onOpen={onOpen} /></Card>
        </Sections>
      </Page>
    );
  }
  const reversed = state === 'Reversed';
  return (
    <Page module="finance" breadcrumb={['Farmer Finance', 'Ledger', 'JE-2026-000412']}>
      <Sections>
        <SetupHead title="JE-2026-000412" />
        <RecordHighlights kind="Ledger entry" title="JE-2026-000412" status={reversed ? <StatusMark kind="neutral" label="Reversed" size="body-4" /> : <StatusMark kind="clean" label="Posted" size="body-4" />}
          actions={reversed ? null : <Button variant="outline" size="small">Reverse</Button>}
          fields={[{ label: 'Date', value: '25 Sep 2026' }, { label: 'Account', value: 'Farmer advances' }, { label: 'Counterparty', value: <RecordLink>Lakeview Farms Ltd</RecordLink> }, { label: 'Debit (USD)', value: '1,500.00' }, { label: 'Posted by', value: 'S. Mwale' }]} />
        {reversed ? (
          <CountCard title="Entries for this advance" objects="entries" count={3}>
            <LedgerTable rows={[
              { id: 'o', ref: 'JE-2026-000412', date: '25 Sep 2026', account: 'Farmer advances', counterparty: 'Original', debit: '1,500.00', credit: '', status: 'Reversed' },
              { id: 'r', ref: 'JE-2026-000431', date: '26 Sep 2026', account: 'Farmer advances', counterparty: 'Reversal of JE-2026-000412', debit: '', credit: '1,500.00', status: 'Posted' },
              { id: 'n', ref: 'JE-2026-000432', date: '26 Sep 2026', account: 'Farmer advances', counterparty: 'Replacement', debit: '1,050.00', credit: '', status: 'Posted' },
            ]} />
          </CountCard>
        ) : <DetailsCard title="Entry" fields={[['Entry', 'JE-2026-000412'], ['Narrative', 'Cash advance against the 2026/27 crop'], ['Source', 'Farmer finance, advance FA-2026-0098'], ['Reverses', '']]} />}
        {state === 'Reverse' ? <ReverseDialog record="JE-2026-000412" sheet={false} /> : null}
      </Sections>
    </Page>
  );
}

/* ------------------------------------------------------------------ The read-only contract view */

export function ContractView({ state = 'With the contract tier' }) {
  const tier = state === 'With the contract tier';
  const money = (v) => (tier ? v : <Restricted />);
  return (
    <Page module="trade" breadcrumb={['Trade Desk', 'Contracts', 'SYN4702']}>
      <Sections>
        <SetupHead title="SYN4702" />
        <RecordHighlights kind="Contract" title="SYN4702" status={R_ACTIVE} actions={<Button variant="outline" size="small" icon="download">Export</Button>}
          fields={[{ label: 'Counterparty', value: <RecordLink>Riverbend Milling</RecordLink> }, { label: 'Commodity', value: 'White maize' }, { label: 'Type', value: 'Sale' }, { label: 'Quantity', value: '5,000 t' }, { label: 'Delivered', value: '4,200 t' }, { label: 'Price', value: money('USD 284.40 per t') }]} />
        <DetailsCard title="Contract information" fields={[['Contract number', 'SYN4702'], ['Counterparty', <RecordLink>Riverbend Milling</RecordLink>], ['Type', 'Sale'], ['Commodity', 'White maize'], ['Grade', 'Grade A'], ['Price', money('USD 284.40 per t')], ['Margin', money('USD 18.20 per t')], ['Basis', 'Delivered'], ['Delivery window', 'Sep 2026 to Nov 2026'], ['Delivery location', 'Riverbend Milling intake']]} />
        <DetailsCard title="Delivery and coverage" fields={[['Quantity', '5,000 t'], ['Delivered', '4,200 t'], ['Left to deliver', '800 t'], ['Coverage', 'Short 230 t']]} />
        <DetailsCard title="System information" fields={[['Created by', 'R. Daka'], ['Created date', '02 Sep 2026, 09:14 CAT'], ['Last modified by', 'L. Mulenga'], ['Last modified date', '25 Sep 2026, 17:22']]} />
      </Sections>
    </Page>
  );
}
