/** Transport (M4.DS.02 AC 1(a) and AC 8, UAG-184; Ashraf's canvas S59, Proposed): Ashraf's Home, his Loads that need a
    truck with the Assign truck dialog within and over the legal payload, Transport planning by farm and by contract,
    the Day plan by transporter and truck, Transporters, trucks and rates (read only) and the transporters and trucks
    upload preview. Missed loads are not drawn. Every screen takes `state`, one of its TRANSPORT_STATES entry, for
    ?screen=&state=.

    Ashraf gives each loading order Jacques or Ryan raised its transporter and truck (Map D-37); he never raises or
    commits one. Over the truck's legal payload, Assign needs a reason, recorded as a near-miss (RL-CAPACITY); the one
    boundary is LoadMeter's. Loading order and contract references are links (he opens both); customers and buyers are
    plain text (no Counterparties module). Fictional sample data only: SYN4702, SYN4790, Riverbend Milling, Lakeview
    Farms Ltd, Cameron Estates, Northside Haulage, Kafue Transport Ltd, Copperbelt Haulage Ltd, Lusaka Freight Ltd;
    the rates are examples, not UAG's. */

export const TRANSPORT_STATES = {
  TransportHome: ['Home', 'Empty'],
  LoadsNeedTruck: ['Needs a truck', 'Truck assigned', 'All', 'Assign truck', 'Over the legal payload', 'Assigning', 'Empty'],
  TransportPlanning: ['By farm', 'By contract', 'Day plan'],
  Transporters: ['Transporters', 'Trucks', 'Rates'],
  TransportersUpload: ['Ready to import', 'Row to fix', 'Importing', 'Imported'],
};

/** Ashraf's navigation (his canvas): Home, Trading, Logistics with Transport planning, Loading orders and Transporters,
    Reports. No Inventory or Finance. */
export const TRANSPORT_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'trade', label: 'Trading', icon: 'arrow-left-right' },
  { value: 'logistics', label: 'Logistics', icon: 'truck', sections: [{ value: 'planning', label: 'Transport planning' }, { value: 'loading', label: 'Loading orders' }, { value: 'transporters', label: 'Transporters' }] },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
] }];
export const TRANSPORT_USER = { initials: 'AM', name: 'A. Mwale', meta: 'Transport' };

export function transportFrame(screen, state) {
  if (screen === 'TransportHome') return { who: 'transport', module: 'home', breadcrumb: ['Home'] };
  if (screen === 'LoadsNeedTruck') return { who: 'transport', module: 'logistics', section: 'loading', breadcrumb: ['Logistics', 'Loading orders'] };
  if (screen === 'TransportPlanning') return { who: 'transport', module: 'logistics', section: 'planning', breadcrumb: ['Logistics', 'Transport planning'] };
  if (screen === 'TransportersUpload') return { who: 'transport', module: 'logistics', section: 'transporters', breadcrumb: ['Logistics', 'Transporters', 'Upload'] };
  return { who: 'transport', module: 'logistics', section: 'transporters', breadcrumb: ['Logistics', 'Transporters'] };
}

const tpMark = (kind, word) => <StatusMark kind={kind} label={word} size="body-4" />;

/** A Home tile: label, figure and the line under it; the tile opens Calculation details (UX-08). */
function TpTile({ label, value, unit, note }) {
  return (
    <Card interactive onClick={() => {}} padding={16}>
      <span data-figure-link="" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Figure label={label} value={value} unit={unit} size="heading-1-condensed" derivation={note} />
      </span>
    </Card>
  );
}

const TP_CONTRACTS = [
  { id: 'c1', contract: 'SYN4702', buyer: 'Riverbend Milling', left: '800', planned: '204', still: '596', delivery: 'From the shed' },
  { id: 'c2', contract: 'SYN4790', buyer: 'Riverbend Milling', left: '1,400', planned: '736', still: '664', delivery: 'Farm-direct' },
  { id: 'c3', contract: 'SYN4811', buyer: 'Cameron Estates', left: '250', planned: '250', still: '0', delivery: 'From the shed' },
];
const TP_ORDERS = [
  { id: 'o1', ref: 'LO-2241', raised: 'J. Tembo', customer: 'Riverbend Milling', commodity: 'wheat', product: 'Wheat', from: 'Shed A, stack A1', qty: '32.000', due: '01 Oct 2026', truck: '' },
  { id: 'o2', ref: 'LO-2242', raised: 'J. Tembo', customer: 'Cameron Estates', commodity: 'soya', product: 'Soya', from: 'Shed A, stack A2', qty: '30.000', due: '01 Oct 2026', truck: '' },
  { id: 'o3', ref: 'LO-2243', raised: 'R. Daka', customer: 'Lakeview Farms Ltd', commodity: 'fertilizer', product: 'Urea, Foliar Feed', from: 'Bays B1, B2', qty: '27.240', due: '02 Oct 2026', truck: '' },
  { id: 'o4', ref: 'LO-2240', raised: 'J. Tembo', customer: 'Riverbend Milling', commodity: 'wheat', product: 'Wheat', from: 'Shed A, stack A1', qty: '34.000', due: '26 Sep 2026', truck: 'AAZ 3310, Northside Haulage' },
  { id: 'o5', ref: 'LO-2231', raised: 'R. Daka', customer: 'Lakeview Farms Ltd', commodity: 'fertilizer', product: 'Urea, Foliar Feed', from: 'Bays B1, B2', qty: '27.240', due: '26 Sep 2026', truck: 'ABZ 4412, Kafue Transport Ltd' },
];

/* ------------------------------------------------------------------ Home (AB-ASHRAF-HOME) */

export function TransportHome({ state = 'Home', onOpen }) {
  const empty = state === 'Empty';
  const contracts = empty ? [] : TP_CONTRACTS;
  const need = empty ? [] : TP_ORDERS.filter((o) => !o.truck);
  return (
    <Sections>
      <WbHead title="Home" meta={<span>Last refreshed 30 Sep 2026, 06:02 CAT</span>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 'var(--card-gap)' }}>
        <TpTile label="Loads without a truck" value={empty ? '0' : '3'} note={empty ? '' : '2 grain, 1 fertiliser'} />
        <TpTile label="Trucks planned today" value={empty ? '0' : '9'} note={empty ? '' : '4 transporters'} />
        <TpTile label="Tonnes still to plan" value={empty ? '0' : '1,260'} unit="t" note={empty ? '' : 'Across 3 contracts'} />
      </div>
      <WbTable title="Contracts to move" count={contracts.length} objects="contracts" action={<span onClick={() => onOpen && onOpen('planning')}><RefCell>View all</RefCell></span>} columns={[
        { key: 'contract', label: 'Contract', width: '110px', render: (r) => <RefCell>{r.contract}</RefCell> },
        { key: 'buyer', label: 'Buyer', width: 'minmax(150px, 1fr)' },
        { key: 'left', label: 'Left to deliver (t)', width: '140px', align: 'right' },
        { key: 'planned', label: 'Planned (t)', width: '110px', align: 'right' },
        { key: 'still', label: 'Still to plan (t)', width: '130px', align: 'right' },
        { key: 'delivery', label: 'Delivery', width: '130px' },
      ]} rows={contracts} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
        <Card gap={8} title={<>Needs a truck <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 8 }}><Count>{need.length}</Count></span></>} headerRight={<span onClick={() => onOpen && onOpen('loading')}><RefCell>View all</RefCell></span>}>
          {need.length ? need.map((o) => <CardRow key={o.id} name={<RefCell>{o.ref}</RefCell>} sub={o.customer} figure={<span style={textStyle('body-3', { tabular: true })}>{o.qty} t</span>} stacked />)
            : <EmptyState title="No loading orders to display." style={{ padding: '8px 0' }} />}
        </Card>
        <Card gap={8} title={<>Contract notes <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 8 }}><Count>{empty ? 0 : 1}</Count></span></>}>
          {empty ? <EmptyState title="No contract notes to display." style={{ padding: '8px 0' }} />
            : <CardRow name={<RefCell>SYN4790</RefCell>} sub="Hold loading until the grade is confirmed. From T. Mwila, 29 Sep 2026." stacked />}
        </Card>
      </div>
    </Sections>
  );
}

/* ------------------------------------------------------------------ Loads that need a truck and Assign truck (AB-ASHRAF-QUEUE, AB-ASHRAF-ASSIGN) */

export function LoadsNeedTruck({ state = 'Needs a truck', onOpen }) {
  const narrow = inNarrow();
  const dialog = state === 'Assign truck' || state === 'Over the legal payload' || state === 'Assigning';
  const over = state === 'Over the legal payload' || state === 'Assigning';
  const assigning = state === 'Assigning';
  const all = state === 'Empty' ? [] : TP_ORDERS;
  const tab = state === 'Truck assigned' ? 'assigned' : state === 'All' ? 'all' : 'need';
  const rows = tab === 'all' ? all : all.filter((o) => (tab === 'assigned' ? !!o.truck : !o.truck));
  const truck = over ? { reg: 'BCK 1180', payload: '30.800', transporter: 'Lusaka Freight Ltd' } : { reg: 'AAZ 3310', payload: '34.500', transporter: 'Northside Haulage' };
  const excess = tonnes(thousandths('32.000') - thousandths(truck.payload));
  return (
    <Sections>
      <WbHead title="Loading orders" />
      <Tabs tabs={[{ value: 'need', label: 'Needs a truck', count: all.filter((o) => !o.truck).length }, { value: 'assigned', label: 'Truck assigned', count: all.filter((o) => o.truck).length }, { value: 'all', label: 'All', count: all.length }]} value={tab} />
      <WbTable columns={[
        { key: 'ref', label: 'Loading order', width: '130px', render: (r) => <span onClick={() => onOpen && onOpen(r.ref)}><RefCell>{r.ref}</RefCell></span> },
        { key: 'raised', label: 'Raised by', width: '110px' },
        { key: 'customer', label: 'Customer', width: 'minmax(150px, 1fr)' },
        { key: 'product', label: 'Commodity', width: '160px', render: (r) => <CommodityMarker commodity={r.commodity}>{r.product}</CommodityMarker> },
        { key: 'from', label: 'From', width: '140px' },
        { key: 'qty', label: 'Quantity (t)', width: '110px', align: 'right' },
        { key: 'due', label: 'Due', width: '120px', tabular: true },
        { key: 'truck', label: 'Truck', width: '200px', wrap: true, render: (r) => (r.truck ? r.truck : <Button size="xsmall" variant="outline">Assign truck</Button>) },
      ]} rows={rows} objects="loading orders" />
      {dialog ? (
        <Dialog title="Assign truck, LO-2241" width={480} sheet={narrow} onClose={assigning ? undefined : () => {}}
          footer={<><Button variant="ghost" size="small" disabled={assigning}>Cancel</Button><Button size="small" loading={assigning} disabled={state === 'Over the legal payload'}>Assign</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Transporter" required><Select options={[truck.transporter]} disabled={assigning} /></Field>
            <Field label="Truck" required><Select options={[`${truck.reg}, legal payload ${truck.payload} t`]} disabled={assigning} /></Field>
            <WbFacts min={150} fields={[['Load on this order', '32.000 t of wheat'], ['Road loss allowed', '0.080 t a truck']]} />
            <LoadMeter kind="payload" label="Loading weight" total="32.000" limit={truck.payload} approachShare={0.95}
              rows={[{ label: 'Legal payload', value: `${truck.payload} t` }, ...(over ? [{ label: 'Excess', value: `${excess.replace('-', '')} t`, strong: true }] : [])]} />
            {over ? <Field label="Reason" required><Input multiline disabled={assigning} defaultValue={assigning ? 'Only truck free on 1 Oct; the order is reduced at loading if needed' : ''} /></Field> : null}
          </div>
        </Dialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Transport planning and Day plan (AB-ASHRAF-PLAN, AB-ASHRAF-DAY) */

const TP_FARMS = [
  { id: 'f1', farm: 'Farm 1', pickup: 'Mpongwe', left: '420', planned: '238', still: '182', trucks: '4', transporters: 'Kafue Transport Ltd', next: '01 Oct 2026' },
  { id: 'f2', farm: 'Farm 2', pickup: 'Mpongwe', left: '310', planned: '170', still: '140', trucks: '3', transporters: 'Copperbelt Haulage Ltd', next: '01 Oct 2026' },
  { id: 'f3', farm: 'Farm 3', pickup: 'Mpongwe', left: '280', planned: '136', still: '144', trucks: '2', transporters: 'Northside Haulage', next: '02 Oct 2026' },
  { id: 'f4', farm: 'Farm 4', pickup: 'Mpongwe', left: '240', planned: '102', still: '138', trucks: '2', transporters: '', next: '02 Oct 2026' },
  { id: 'f5', farm: 'Farm 5', pickup: 'Mpongwe', left: '150', planned: '90', still: '60', trucks: '1', transporters: 'Copperbelt Haulage Ltd', next: '03 Oct 2026' },
];
const TP_DAY = [
  { id: 'd1', transporter: 'Northside Haulage', truck: 'AAZ 3310', pickup: 'Chisamba Shed', to: 'Riverbend Milling', load: '32.000', ref: 'LO-2241', status: 'planned' },
  { id: 'd2', transporter: 'Kafue Transport Ltd', truck: 'ABZ 4412', pickup: 'Farm 1, Mpongwe', to: 'Riverbend Milling', load: '30.000', ref: 'SYN4790', status: 'planned' },
  { id: 'd3', transporter: 'Copperbelt Haulage Ltd', truck: 'BAP 9229', pickup: 'Farm 2, Mpongwe', to: 'Riverbend Milling', load: '34.000', ref: 'SYN4790', status: 'clash' },
  { id: 'd4', transporter: 'Copperbelt Haulage Ltd', truck: '', pickup: 'Farm 5, Mpongwe', to: 'Riverbend Milling', load: '30.000', ref: 'SYN4790', status: 'none' },
];
const TP_DAY_MARKS = { planned: ['clean', 'Planned'], clash: ['attention', 'Booked elsewhere'], none: ['attention', 'No truck'] };

export function TransportPlanning({ state = 'By farm' }) {
  const tab = state;
  const farms = [...TP_FARMS, { id: 'total', total: true, farm: 'Total', left: '1,400', planned: '736', still: '664', trucks: '12' }];
  return (
    <Sections>
      <WbHead title="Transport planning" />
      <Card title="SYN4790" headerRight={tpMark('clean', 'Active')}>
        <WbFacts min={140} fields={[['Contract', <RefCell>SYN4790</RefCell>], ['Buyer', 'Riverbend Milling'], ['Basis', 'Collected'], ['Route', 'Mpongwe farms to the mill'], ['Left to deliver', '1,400 t'], ['Planned', '736 t'], ['Still to plan', '664 t']]} />
      </Card>
      <Tabs tabs={[{ value: 'By farm', label: 'By farm' }, { value: 'By contract', label: 'By contract' }, { value: 'Day plan', label: 'Day plan' }]} value={tab} />
      {tab === 'By farm' ? (
        <WbTable columns={[
          { key: 'farm', label: 'Farm', width: '110px', render: (r) => wbStrong(r, r.farm) }, { key: 'pickup', label: 'Pick-up', width: '110px' },
          { key: 'left', label: 'Left (t)', width: '100px', align: 'right', render: (r) => wbStrong(r, r.left) },
          { key: 'planned', label: 'Planned (t)', width: '110px', align: 'right', render: (r) => wbStrong(r, r.planned) },
          { key: 'still', label: 'Still to plan (t)', width: '130px', align: 'right', render: (r) => wbStrong(r, r.still) },
          { key: 'trucks', label: 'Trucks a day', width: '110px', align: 'right', render: (r) => wbStrong(r, r.trucks) },
          { key: 'transporters', label: 'Transporters', width: 'minmax(170px, 1fr)', render: (r) => (r.total ? '' : r.transporters || tpMark('attention', 'Not planned')) },
          { key: 'next', label: 'Next load', width: '120px', tabular: true },
          { key: 'action', label: '', width: '120px', align: 'right', render: (r) => (r.total ? '' : <Button size="xsmall" variant="outline">Plan trucks</Button>) },
        ]} rows={farms} objects="farms" />
      ) : tab === 'By contract' ? (
        <WbTable columns={[
          { key: 'contract', label: 'Contract', width: '110px', render: (r) => <RefCell>{r.contract}</RefCell> }, { key: 'buyer', label: 'Buyer', width: 'minmax(150px, 1fr)' },
          { key: 'left', label: 'Left to deliver (t)', width: '150px', align: 'right' }, { key: 'planned', label: 'Planned (t)', width: '110px', align: 'right' },
          { key: 'still', label: 'Still to plan (t)', width: '130px', align: 'right' }, { key: 'delivery', label: 'Delivery', width: '130px' },
        ]} rows={TP_CONTRACTS} objects="contracts" />
      ) : (
        <WbTable title="Day plan, 01 Oct 2026" count={TP_DAY.length} objects="trucks" columns={[
          { key: 'transporter', label: 'Transporter', width: 'minmax(160px, 1fr)' }, { key: 'truck', label: 'Truck', width: '100px' },
          { key: 'pickup', label: 'Pick-up', width: '150px' }, { key: 'to', label: 'Goes to', width: '150px' },
          { key: 'load', label: 'Load (t)', width: '90px', align: 'right' },
          { key: 'ref', label: 'Order or contract', width: '140px', render: (r) => <RefCell>{r.ref}</RefCell> },
          { key: 'status', label: 'Status', width: '160px', render: (r) => tpMark(...TP_DAY_MARKS[r.status]) },
        ]} rows={TP_DAY} />
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Transporters, trucks and rates, read only (AB-ASHRAF-TRANSPORTERS) */

const TP_TRANSPORTERS = [
  { id: 't1', name: 'Northside Haulage', trucks: '6', flag: '' },
  { id: 't2', name: 'Copperbelt Haulage Ltd', trucks: '4', flag: '' },
  { id: 't3', name: 'Kafue Transport Ltd', trucks: '3', flag: '' },
  { id: 't4', name: 'Lusaka Freight Ltd', trucks: '2', flag: 'shortages' },
];
const TP_TRUCKS = [
  { id: 'k1', reg: 'AAZ 3310', transporter: 'Northside Haulage', config: 'Interlink', payload: '34.500', status: 'Active' },
  { id: 'k2', reg: 'BAP 9229', transporter: 'Copperbelt Haulage Ltd', config: 'Interlink', payload: '34.000', status: 'Active' },
  { id: 'k3', reg: 'ABZ 4412', transporter: 'Kafue Transport Ltd', config: 'Tri-axle', payload: '30.000', status: 'Active' },
  { id: 'k4', reg: 'BCK 1180', transporter: 'Lusaka Freight Ltd', config: 'Tri-axle', payload: '30.800', status: 'Unverified' },
];
const TP_RATES = [
  { id: 'r1', from: 'Serenje', lusaka: '30.00', ndola: '25.00' },
  { id: 'r2', from: 'Mkushi', lusaka: '26.00', ndola: '21.00' },
  { id: 'r3', from: 'Kabwe', lusaka: '14.00', ndola: '16.00' },
  { id: 'r4', from: 'Chisamba', lusaka: '9.00', ndola: '12.00' },
  { id: 'r5', from: 'Mpongwe', lusaka: '', ndola: '14.00' },
];

export function Transporters({ state = 'Transporters' }) {
  return (
    <Sections>
      <WbHead title="Transporters and trucks" />
      <Tabs tabs={[{ value: 'Transporters', label: 'Transporters', count: TP_TRANSPORTERS.length }, { value: 'Trucks', label: 'Trucks', count: TP_TRUCKS.length }, { value: 'Rates', label: 'Rates' }]} value={state} />
      {state === 'Transporters' ? (
        <WbTable columns={[
          { key: 'name', label: 'Transporter', width: 'minmax(180px, 1fr)' }, { key: 'trucks', label: 'Trucks', width: '90px', align: 'right' },
          { key: 'flag', label: 'Note', width: '200px', render: (r) => (r.flag ? tpMark('attention', 'Shortages flagged') : '') },
        ]} rows={TP_TRANSPORTERS} objects="transporters" />
      ) : state === 'Trucks' ? (
        <WbTable columns={[
          { key: 'reg', label: 'Registration', width: '130px' }, { key: 'transporter', label: 'Transporter', width: 'minmax(170px, 1fr)' },
          { key: 'config', label: 'Configuration', width: '130px' }, { key: 'payload', label: 'Legal payload (t)', width: '140px', align: 'right' },
          { key: 'status', label: 'Status', width: '130px', render: (r) => (r.status === 'Unverified' ? tpMark('attention', 'Unverified') : tpMark('clean', 'Active')) },
        ]} rows={TP_TRUCKS} objects="trucks" />
      ) : (
        <WbTable title="Rate card, USD per t, VAT included" count={TP_RATES.length} objects="rates" columns={[
          { key: 'from', label: 'Pick-up', width: 'minmax(140px, 1fr)' }, { key: 'lusaka', label: 'To Lusaka', width: '120px', align: 'right' }, { key: 'ndola', label: 'To Ndola', width: '120px', align: 'right' },
        ]} rows={TP_RATES} />
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Transporters and trucks upload preview (UX-25) */

const TP_UPLOAD = [
  { row: 2, transporter: 'Northside Haulage', reg: 'AAZ 3310', config: 'Interlink', payload: '34.500' },
  { row: 3, transporter: 'Northside Haulage', reg: 'AAZ 3311', config: 'Interlink', payload: '34.500' },
  { row: 4, transporter: 'Lusaka Freight Ltd', reg: 'BCK 1180', config: 'Tri-axle', payload: '30.800' },
  { row: 5, transporter: 'Lusaka Freight Ltd', reg: 'BCK 1181', config: 'Tri-axle', payload: '30.800' },
];

export function TransportersUpload({ state = 'Ready to import' }) {
  const fix = state === 'Row to fix';
  const rows = TP_UPLOAD.map((r) => (fix && r.row === 5 ? { ...r, config: 'Quad-axle', error: 'Cell C5: unknown configuration Quad-axle' } : r));
  const status = state === 'Imported' ? 'imported' : 'ready';
  return (
    <Sections>
      <WbHead title="Transporters and trucks preview" />
      <ImportPreview status={status} statusWord="map" importing={state === 'Importing'} rows={rows}
        file={{ name: 'Transporters and trucks 30 Sep 2026.xlsx', by: ['A. Mwale', '08:40'], rows: rows.length, template: 'Transporters and trucks, version 1' }}
        tiles={[{ label: 'Rows', value: String(rows.length) }, { label: 'New trucks', value: '2' }, { label: 'Updated trucks', value: '2' }, { label: 'Errors', value: fix ? '1' : '0' }]}
        columns={[
          { key: 'transporter', label: 'Transporter', width: '180px' }, { key: 'reg', label: 'Registration', width: '120px' },
          { key: 'config', label: 'Configuration', width: '120px' }, { key: 'payload', label: 'Legal payload (t)', width: '140px', align: 'right', tabular: true },
        ]} />
    </Sections>
  );
}
