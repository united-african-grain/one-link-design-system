/** Farmer accounts and finance's working screens (M5.DS.02, UAG-190; canvas S60 "One Link Sid", S16 for the layout
    approval): the farmer account under Farmer accounts (input debt, trade payable, expected recovery, exposure and the
    LTV band), the credit book's farmer detail with its LTV chart, the statement run with its PDF preview and its run
    history, the statement layout approval on sample data, and the exchange rate table with its correction dialog beside
    the Exchange rate source setting. Every screen takes `state`, one of its FINANCE_STATES entry, for ?screen=&state=.

    Farmer figures carry the Farmer account tier (UX-10): on a shared layout a viewer without it, such as Trading, sees
    the Restricted mark (a lock, no value, tooltip Restricted); elsewhere the column is left out (UX-09). Farmer finance
    is in US dollars with the code before the amount and two decimals on a record (UX-11). The price behind an LTV is
    the approved price, read only, with its approval date (M4.PRC.01); nothing here edits it or runs a what-if. Rates
    read "ZMW 25.00 per USD" with their date (Map D-40). Fictional sample data; the layout preview uses Sample Farm Ltd
    and sample amounts only (UAG-164). */

export const FINANCE_STATES = {
  FarmerAccount: ['Details', 'Calculation details', 'Without the farmer account tier', 'Related', 'History', 'Loading'],
  CreditBookFarmer: ['Red band', 'Amber band', 'Chart loading', 'Price history'],
  StatementRun: ['Preview', 'Running', 'Run history', 'Downloading', 'No approved layout'],
  StatementLayout: ['Pending approval', 'Approving', 'Reject', 'Rejecting', 'Approved', 'Rejected'],
  ExchangeRates: ['Rates', 'Enter rate', 'Saving', 'Rate already entered', 'Correct rate', 'Correcting', 'No rate today'],
};

/** Finance's navigation (canvas S60 menu): Finance holds Farmer accounts, the credit book, statements and exchange rates. */
export const FIN_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'finance', label: 'Finance', icon: 'landmark', sections: [
    { value: 'accounts', label: 'Farmer accounts' }, { value: 'credit', label: 'Credit book' }, { value: 'statements', label: 'Farmer statements' }, { value: 'rates', label: 'Exchange rates' },
  ] },
  { value: 'counterparties', label: 'Counterparties', icon: 'building-2' },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
] }];
export const FIN_USER = { initials: 'NP', name: 'N. Phiri', meta: 'Finance' };

/** Where a screen in this file sits. The layout approval is the operations lead's (UAG-164); the farmer account without
    the tier is drawn as Trading sees it. */
export function financeFrame(screen, state) {
  if (screen === 'FarmerAccount') return state === 'Without the farmer account tier'
    ? { who: 'trading-view', module: 'counterparties', breadcrumb: ['Counterparties', 'Lakeview Farms Ltd', 'Farmer account'] }
    : { who: 'fin', module: 'finance', section: 'accounts', breadcrumb: ['Finance', 'Farmer accounts', 'Lakeview Farms Ltd'] };
  if (screen === 'CreditBookFarmer') return { who: 'fin', module: 'finance', section: 'credit', breadcrumb: ['Finance', 'Credit book', 'Cameron Estates'] };
  if (screen === 'StatementRun') return { who: 'fin', module: 'finance', section: 'statements', breadcrumb: ['Finance', 'Farmer statements', 'Lakeview Farms Ltd'] };
  if (screen === 'StatementLayout') return { who: 'ops', module: 'home', breadcrumb: ['Home', 'Items to approve', 'Farmer statement v2'] };
  return { who: 'fin', module: 'finance', section: 'rates', breadcrumb: ['Finance', 'Exchange rates'] };
}

/* ------------------------------------------------------------------ Example data, on the golden fixture */

export const FF_RATE = 'ZMW 25.00 per USD';
export const FF_RATE_DATE = '26 Sep 2026';
const ffBasis = [{ label: 'Exchange rate', value: FF_RATE }, { label: 'Rates as of', value: FF_RATE_DATE }, { label: 'Source', value: 'Finance, Exchange rates' }];

/** Lakeview Farms Ltd, winter wheat 2026: what the farmer owes for inputs, what UAG owes for grain (the mill's offloaded
    weight and grade on FD-0142, Map D-36), what the rest of the crop is expected to recover, and what is left at risk. */
export const FF_ACCOUNT = {
  farmer: 'Lakeview Farms Ltd', programme: 'Winter wheat 2026',
  debt: '23,760.00', payable: '15,990.00', recovery: '4,000.00', exposure: '3,770.00', ltv: '18.38%', band: 'Green',
  net: 'USD 7,770.00 owed by the farmer',
};
export const FF_DEBT_LINES = [
  { id: 'd1', date: '01 Aug 2026', item: 'Cash prepayment', ref: 'PAY-0401', debt: '4,000.00', payable: '' },
  { id: 'd2', date: '12 Aug 2026', item: 'Fertiliser, Urea 50 kg', ref: 'DN 3310', debt: '9,420.00', payable: '' },
  { id: 'd3', date: '19 Aug 2026', item: 'Fertiliser, Compound D', ref: 'DN 3318', debt: '6,150.00', payable: '' },
  { id: 'd4', date: '20 Aug 2026', item: 'Seed, wheat', ref: 'DN 3321', debt: '4,190.00', payable: '' },
  { id: 'd5', date: '25 Sep 2026', item: 'Wheat delivered, 31.980 t at grade 2', ref: 'FD-0142', debt: '', payable: '15,990.00' },
  { id: 'total', total: true, date: '', item: 'Total', ref: '', debt: '23,760.00', payable: '15,990.00' },
];

export function ffExposureCalc() {
  return { name: 'Exposure, Lakeview Farms Ltd', value: 'USD 3,770.00',
    components: [{ label: 'Input debt', value: '23,760.00' }, { label: 'Trade payable', value: '-15,990.00' }, { label: 'Expected recovery', value: '-4,000.00' }],
    total: { label: 'Exposure (USD)', value: '3,770.00' }, basis: ffBasis };
}

/** The credit book's farmer detail (UAG-163): LTV is the facility over the crop value at the approved price; amber from
    20.00%, red from 22.00% (CFG-LTV-RED, to confirm at UAT). */
export const FF_CREDIT = {
  red: { farmer: 'Cameron Estates', facility: '84,000.00', hectares: '200', yield: '7.0 t per ha', price: 'USD 272.00 per t', approved: '15 Sep 2026', crop: '380,800.00', ltv: '22.06%', band: 'Red', exposure: '61,240.00' },
  amber: { farmer: 'Cameron Estates', facility: '84,000.00', hectares: '200', yield: '7.0 t per ha', price: 'USD 288.00 per t', approved: '25 Sep 2026', crop: '403,200.00', ltv: '20.83%', band: 'Amber', exposure: '61,240.00' },
};
export const FF_PRICE_HISTORY = [
  { id: 'p3', price: 'USD 288.00 per t', approved: '25 Sep 2026', by: 'T. Mwila', status: 'Approved' },
  { id: 'p2', price: 'USD 272.00 per t', approved: '15 Sep 2026', by: 'T. Mwila', status: 'Approved' },
  { id: 'p1', price: 'USD 264.00 per t', approved: '01 Sep 2026', by: 'J. Tembo', status: 'Approved' },
];
const FF_BAND = { Green: 'clean', Amber: 'attention', Red: 'breach' };
export function FfBand({ band, ltv, size = 'body-4' }) {
  return <StatusMark kind={FF_BAND[band]} label={ltv ? `${band}, ${ltv}` : band} size={size} />;
}

/** A statement's lines: dated, with what, its reference, tonnes and rate where grain was delivered, and the amount on the
    side it falls (owed to the farmer, owed by the farmer). */
export const FF_STATEMENT = [
  { id: 's1', date: '01 Aug 2026', what: 'Cash prepayment, paid by bank transfer', ref: 'PAY-0401', t: '', rate: '', to: '', by: '4,000.00' },
  { id: 's2', date: '12 Aug 2026', what: 'Fertiliser, Urea 50 kg', ref: 'DN 3310', t: '', rate: '', to: '', by: '9,420.00' },
  { id: 's3', date: '19 Aug 2026', what: 'Fertiliser, Compound D', ref: 'DN 3318', t: '', rate: '', to: '', by: '6,150.00' },
  { id: 's4', date: '20 Aug 2026', what: 'Seed, wheat', ref: 'DN 3321', t: '', rate: '', to: '', by: '4,190.00' },
  { id: 's5', date: '25 Sep 2026', what: 'Wheat delivered, grade 2, paid on the mill offload', ref: 'FD-0142', t: '31.980', rate: '500.00', to: '15,990.00', by: '' },
  { id: 'total', total: true, date: '', what: 'Balance', ref: '', t: '', rate: '', to: '', by: '7,770.00' },
];
/** Sample Farm Ltd, sample amounts only: the layout approval never shows a real counterparty or amount (UAG-164 AC 2). */
export const FF_SAMPLE = [
  { id: 'x1', date: '01 Jan 2026', what: 'Fertiliser, sample item', ref: 'SAMPLE-1', t: '', rate: '', to: '', by: '1,000.00' },
  { id: 'x2', date: '15 Jan 2026', what: 'Grain delivered, sample grade', ref: 'SAMPLE-2', t: '10.000', rate: '200.00', to: '2,000.00', by: '' },
  { id: 'total', total: true, date: '', what: 'Balance', ref: '', t: '', rate: '', to: '1,000.00', by: '' },
];

export const FF_RUNS = [
  { id: 'r2', run: 'Run 2', at: '30 Sep 2026, 16:20', by: 'N. Phiri', layout: 'Farmer statement v2', language: 'English', fingerprint: '7C4E 19A2 D0B3', status: 'Issued' },
  { id: 'r1', run: 'Run 1', at: '30 Sep 2026, 11:05', by: 'N. Phiri', layout: 'Farmer statement v2', language: 'English', fingerprint: '3A90 E1C7 55F2', status: 'Superseded', superseded: true },
];

/** The sections a statement layout must carry (UAG-164). */
export const FF_LAYOUT_SECTIONS = ['Deliveries', 'Deductions at offloading', 'Amounts owing and paid', 'Fertiliser offsets', 'Payments and exchange rate'];

export const FF_RATES = [
  { id: 'x26', date: '26 Sep 2026', rate: 'ZMW 25.00 per USD', source: 'Bank of Zambia mid', by: 'N. Phiri', at: '26 Sep 2026, 08:14', status: 'Active' },
  { id: 'x25b', date: '25 Sep 2026', rate: 'ZMW 25.02 per USD', source: 'Bank of Zambia mid', by: 'N. Phiri', at: '25 Sep 2026, 09:30', status: 'Active', note: 'Correction: keyed wrong' },
  { id: 'x25', date: '25 Sep 2026', rate: 'ZMW 25.20 per USD', source: 'Bank of Zambia mid', by: 'N. Phiri', at: '25 Sep 2026, 08:02', status: 'Corrected' },
  { id: 'x24', date: '24 Sep 2026', rate: 'ZMW 24.98 per USD', source: 'Bank of Zambia mid', by: 'N. Phiri', at: '24 Sep 2026, 08:40', status: 'Active' },
];

/* ------------------------------------------------------------------ Parts these screens share */

/** The statement page as its PDF prints it, in the preview slot of a decision page (the Approval kit's layout). */
export function FfStatementPreview({ farmer, period, lines, rateLine }) {
  return (
    <Card title="Preview" padding={16}>
      <div style={{ background: 'var(--grouped)', borderRadius: 'var(--radius-md)', padding: 16, minWidth: 0 }}>
        <div data-statement-preview style={{ background: 'var(--elevated)', boxShadow: 'var(--shadow-minimal-soft)', maxWidth: 720, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Text variant="heading-4" strong>Farmer statement</Text>
              <Text variant="body-3" tone="secondary">{farmer}</Text>
            </span>
            <Logo markOnly product="One Link" />
          </span>
          <HmFacts min={140} fields={[['Period', period], ['Currency', 'USD']]} />
          <HmTable rows={lines} columns={[
            { key: 'date', label: 'Date', width: '110px', tabular: true },
            { key: 'what', label: 'What', width: 'minmax(180px, 1fr)', wrap: true, render: (r) => (r.total ? <Text variant="body-3" strong>{r.what}</Text> : r.what) },
            { key: 'ref', label: 'Reference', width: '100px' },
            { key: 't', label: 'Weight (t)', width: '90px', align: 'right' },
            { key: 'rate', label: 'Rate (USD per t)', width: '130px', align: 'right' },
            { key: 'to', label: 'Owed to farmer (USD)', width: '160px', align: 'right', render: (r) => (r.total ? <Text variant="body-3" strong tabular>{r.to}</Text> : r.to) },
            { key: 'by', label: 'Owed by farmer (USD)', width: '160px', align: 'right', render: (r) => (r.total ? <Text variant="body-3" strong tabular>{r.by}</Text> : r.by) },
          ]} />
          <HmFacts min={180} fields={[['Deductions at offloading', 'None recorded in this period'], ['Payments', 'No payments in this period'], ['Exchange rate', rateLine]]} />
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ Farmer account (record page, UX-19) */

export function FarmerAccount({ state = 'Details', onOpen }) {
  const tier = state !== 'Without the farmer account tier';
  const initial = state === 'Related' ? 'Related' : state === 'History' ? 'History' : 'Details';
  const [tab, setTab] = useState(initial);
  const [calc, setCalc] = useState(state === 'Calculation details');
  useEffect(() => { setTab(initial); setCalc(state === 'Calculation details'); }, [state]);
  const a = FF_ACCOUNT;
  // On this shared layout a figure the viewer's bundle does not carry is the lock, never a value or a zero (UX-09).
  const money = (v) => (tier ? `USD ${v}` : <Restricted />);
  if (state === 'Loading') return <Sections><HmHead title={a.farmer} /><div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}><CardSkeleton /><CardSkeleton /></div></Sections>;
  return (
    <Sections>
      <HmHead title={a.farmer} />
      <RecordHighlights kind="Farmer account" title={a.farmer} status={<StatusMark kind="clean" label="Active" size="body-3" />} tab={tab} onTab={setTab}
        fields={[
          { label: 'Input debt', value: money(a.debt) },
          { label: 'Trade payable', value: money(a.payable) },
          { label: 'Expected recovery', value: money(a.recovery) },
          { label: 'Exposure', value: tier ? <HmLink onOpen={() => setCalc(true)}>USD {a.exposure}</HmLink> : <Restricted /> },
          { label: 'LTV band', value: tier ? <FfBand band={a.band} ltv={a.ltv} size="body-3" /> : <Restricted /> },
          { label: 'Programme', value: a.programme },
        ]} />
      {tab === 'History' ? (
        <HmCard title="History" count={2} objects="changes">
          <HmTable rows={[{ id: 'h2', field: 'Trade payable', user: 'System', old: tier ? '0.00' : '', next: tier ? '15,990.00' : '', date: '25 Sep 2026, 16:02' }, { id: 'h1', field: 'Status', user: 'N. Phiri', old: '', next: 'Active', date: '30 Sep 2026, 09:00' }]} columns={[
            { key: 'field', label: 'Field', width: '130px' }, { key: 'user', label: 'User', width: '110px' },
            ...(tier ? [{ key: 'old', label: 'Old value', width: '110px', align: 'right' }, { key: 'next', label: 'New value', width: '110px', align: 'right' }] : []),
            { key: 'date', label: 'Date (CAT)', width: 'minmax(160px, 1fr)', tabular: true },
          ]} />
        </HmCard>
      ) : tab === 'Related' ? (
        <>
          <HmCard title="Farm-direct consignments" count={1} objects="consignments">
            <HmTable rows={[{ id: 'FD-0142', offloaded: '31.980', grade: 'Grade 2', status: 'delivered' }]} columns={[
              { key: 'id', label: 'Consignment', width: 'minmax(120px, 1fr)', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
              { key: 'offloaded', label: 'Offloaded (t)', width: '120px', align: 'right' },
              { key: 'grade', label: 'Grade', width: '100px' },
              { key: 'status', label: 'Status', width: '130px', render: (r) => <OpsLoadStatus status={r.status} /> },
            ]} />
          </HmCard>
          <HmCard title="Statement runs" count={FF_RUNS.length} objects="statement runs">
            <HmTable rows={FF_RUNS} columns={[
              { key: 'run', label: 'Run', width: 'minmax(90px, 1fr)', render: (r) => <HmLink onOpen={() => onOpen && onOpen('statement')}>{r.run}</HmLink> },
              { key: 'at', label: 'Generated (CAT)', width: '170px', tabular: true },
              { key: 'status', label: 'Status', width: '130px', render: (r) => <StatusMark kind={r.superseded ? 'neutral' : 'clean'} label={r.status} size="body-4" /> },
            ]} />
          </HmCard>
        </>
      ) : (
        <>
          <HmCard title="Balances" count={FF_DEBT_LINES.length - 1} objects="entries">
            <HmTable rows={FF_DEBT_LINES} columns={[
              { key: 'date', label: 'Date', width: '120px', tabular: true },
              { key: 'item', label: 'Entry', width: 'minmax(200px, 1fr)', wrap: true, render: (r) => (r.total ? <Text variant="body-3" strong>{r.item}</Text> : r.item) },
              { key: 'ref', label: 'Reference', width: '100px', render: (r) => (r.ref === 'FD-0142' ? <HmLink onOpen={() => onOpen && onOpen(r.ref)}>{r.ref}</HmLink> : r.ref) },
              // Without the Farmer account tier the money columns are left out of the table (UX-09).
              ...(tier ? [
                { key: 'debt', label: 'Input debt (USD)', width: '140px', align: 'right', render: (r) => (r.total ? <Text variant="body-3" strong tabular>{r.debt}</Text> : r.debt) },
                { key: 'payable', label: 'Trade payable (USD)', width: '150px', align: 'right', render: (r) => (r.total ? <Text variant="body-3" strong tabular>{r.payable}</Text> : r.payable) },
              ] : []),
            ]} />
          </HmCard>
          <Card title="Farmer account information" padding={16}>
            <HmFacts fields={[['Net if settled today, indicative', tier ? a.net : <Restricted />], ['Exchange rate', `${FF_RATE}, ${FF_RATE_DATE}`], ['Owner', 'N. Phiri'], ['Created by', 'N. Phiri'], ['Created date', '30 Sep 2026, 09:00 CAT']]} />
          </Card>
        </>
      )}
      {calc && tier ? (() => { const p = ffExposureCalc(); return <CalculationDetails open onClose={() => setCalc(false)} name={p.name} value={p.value} components={p.components} total={p.total} basis={p.basis} />; })() : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Credit book, farmer detail (UAG-163) */

export function CreditBookFarmer({ state = 'Red band' }) {
  const c = state === 'Amber band' ? FF_CREDIT.amber : FF_CREDIT.red;
  const ltvSeries = useMemo(() => [{ type: 'baseline', baseValue: 22, name: 'LTV', format: (v) => `${v.toFixed(2)}%`,
    data: Array.from({ length: 26 }, (_, i) => ({ time: `2026-09-${String(i + 1).padStart(2, '0')}`, value: 19.4 + i * 0.1 + Math.sin(i / 4) * 0.4 })).map((p, i, all) => (i === all.length - 1 ? { ...p, value: Number(c.ltv.replace('%', '')) } : p)) }], [c.ltv]);
  const chartState = state === 'Chart loading' ? 'loading' : 'ready';
  return (
    <Sections>
      <HmHead title={c.farmer} />
      <RecordHighlights kind="Credit book" title={c.farmer} status={<FfBand band={c.band} size="body-3" />} tabs={[]}
        fields={[
          { label: 'Facility', value: `USD ${c.facility}` },
          { label: 'Crop value', value: `USD ${c.crop}` },
          { label: 'LTV', value: c.ltv },
          { label: 'Exposure', value: `USD ${c.exposure}` },
          { label: 'Hectares', value: c.hectares },
          { label: 'Expected yield', value: c.yield },
        ]} />
      <WithRail rail={<>
        <Card title="Price" padding={16}>
          <div data-price-control="read-only"><HmFacts min={140} fields={[['Wheat price in force', c.price], ['Approved', c.approved], ['Approved by', 'T. Mwila'], ['Changed by', 'Approval of a new price']]} /></div>
        </Card>
        {state === 'Price history' ? (
          <HmCard title="Price history" count={FF_PRICE_HISTORY.length} objects="prices">
            <HmTable rows={FF_PRICE_HISTORY} columns={[
              { key: 'price', label: 'Price', width: 'minmax(130px, 1fr)' },
              { key: 'approved', label: 'Approved', width: '110px', tabular: true },
              { key: 'status', label: 'Status', width: '110px', render: (r) => <StatusMark kind="clean" label={r.status} size="body-4" /> },
            ]} />
          </HmCard>
        ) : null}
      </>}>
        <Card title="LTV" meta="Amber from 20.00%, red from 22.00%" padding={16}>
          <ChartCard height={240} state={chartState} series={ltvSeries}
            priceLines={[{ price: 22, color: 'var(--content-accent-down)', title: '22.00%' }, { price: 20, color: 'var(--warning-strong)', title: '20.00%' }]} style={{ boxShadow: 'none', padding: 0 }} />
        </Card>
        <Card title="How the LTV is reached" padding={16}>
          <HmFacts min={160} fields={[['Facility', `USD ${c.facility}`], ['Crop value', `USD ${c.crop}`], ['Hectares', c.hectares], ['Expected yield', c.yield], ['Price', `${c.price}, approved ${c.approved}`], ['LTV', c.ltv]]} />
        </Card>
      </WithRail>
    </Sections>
  );
}

/* ------------------------------------------------------------------ Statement run (UAG-165) */

export function StatementRun({ state = 'Preview', onOpen }) {
  const initial = state === 'Run history' || state === 'Downloading' ? 'Run history' : 'Preview';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const refused = state === 'No approved layout';
  const panel = (
    <ActionPanel subject="Run statement" context="Lakeview Farms Ltd, 01 Aug to 30 Sep 2026" menu={false} width="100%">
      <SummaryList items={[{ label: 'Layout', value: refused ? '' : 'Farmer statement v2' }, { label: 'Language', value: refused ? 'Afrikaans' : 'English' }, { label: 'Exchange rate', value: `${FF_RATE}, ${FF_RATE_DATE}` }]} />
      {refused ? <Refusal action="Run statement" reason="No approved statement layout in Afrikaans" /> : null}
      <Button variant="primary" fullWidth loading={state === 'Running'} disabled={refused}>Run statement</Button>
    </ActionPanel>
  );
  return (
    <Sections>
      <HmHead title="Lakeview Farms Ltd" />
      <RecordHighlights kind="Farmer statement" title="Lakeview Farms Ltd" status={<StatusMark kind="clean" label="Issued" size="body-3" />} tab={tab} onTab={setTab} tabs={['Preview', 'Run history']}
        fields={[{ label: 'Period', value: '01 Aug to 30 Sep 2026' }, { label: 'Layout', value: 'Farmer statement v2' }, { label: 'Language', value: 'English' }, { label: 'Latest run', value: '30 Sep 2026, 16:20 CAT' }, { label: 'Owner', value: 'N. Phiri' }]} />
      {tab === 'Run history' ? (
        <HmCard title="Run history" count={FF_RUNS.length} objects="statement runs">
          <HmTable rows={FF_RUNS} columns={[
            { key: 'run', label: 'Run', width: '80px' },
            { key: 'at', label: 'Generated (CAT)', width: '160px', tabular: true },
            { key: 'by', label: 'By', width: '100px' },
            { key: 'layout', label: 'Layout', width: 'minmax(150px, 1fr)' },
            { key: 'language', label: 'Language', width: '100px' },
            { key: 'fingerprint', label: 'Fingerprint', width: '140px', tabular: true },
            { key: 'download', label: 'File', width: '130px', render: (r) => <Button variant="outline" size="xsmall" icon="download" loading={state === 'Downloading' && r.superseded}>Download</Button> },
            { key: 'status', label: 'Status', width: '130px', render: (r) => <span data-run-status={r.superseded ? 'superseded' : 'issued'}><StatusMark kind={r.superseded ? 'neutral' : 'clean'} label={r.status} size="body-4" /></span> },
          ]} />
        </HmCard>
      ) : (
        <WithPanel panel={panel}>
          <FfStatementPreview farmer="Lakeview Farms Ltd" period="01 Aug to 30 Sep 2026" lines={FF_STATEMENT} rateLine={`Indicative at ${FF_RATE}, latest rate on or before 30 Sep 2026`} />
        </WithPanel>
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Statement layout approval (UAG-164) */

export const FF_LAYOUT_OUTCOMES = [
  { value: 'reject', label: 'Reject', variant: 'critical', comment: true },
  { value: 'approve', label: 'Approve', variant: 'primary' },
];

export function StatementLayout({ state = 'Pending approval' }) {
  const narrow = !useMinWidth(768);
  const approved = state === 'Approved';
  const rejected = state === 'Rejected';
  const decided = approved || rejected;
  const status = approved ? <StatusMark kind="clean" label="Approved" size="body-3" /> : rejected ? <StatusMark kind="breach" label="Rejected" size="body-3" /> : <StatusMark kind="pending" label="Pending approval" size="body-3" />;
  const panel = (
    <ActionPanel subject="Decision" context="Farmer statement v2, English" menu={false} width="100%">
      <SummaryList items={[{ label: 'Language', value: 'English' }, { label: 'Version', value: '2' }, { label: 'Sections', value: String(FF_LAYOUT_SECTIONS.length) }]} />
      {decided ? status : <DecisionActions outcomes={FF_LAYOUT_OUTCOMES} busy={state === 'Approving' ? 'approve' : null} />}
    </ActionPanel>
  );
  return (
    <Sections>
      <HmHead title="Farmer statement v2" />
      <RecordHighlights kind="Statement layout" title="Farmer statement v2" status={status} tabs={[]}
        fields={[
          { label: 'Language', value: 'English' },
          { label: 'Version', value: '2' },
          { label: 'Submitted by', value: 'N. Phiri' },
          { label: 'Submitted', value: '26 Sep 2026, 09:40 CAT' },
          { label: 'Waiting for', value: decided ? '' : 'Operations' },
          ...(rejected ? [{ label: 'Comment', value: 'The exchange rate line must sit under payments.' }] : []),
          { label: 'In force', value: approved ? 'Farmer statement v2' : 'Farmer statement v1' },
        ]} />
      <WithPanel panel={panel}>
        <Card title="Sections" padding={16}>
          <HmFacts min={180} fields={FF_LAYOUT_SECTIONS.map((s, i) => [`Section ${i + 1}`, s])} />
        </Card>
        <FfStatementPreview farmer="Sample Farm Ltd" period="01 Jan to 31 Jan 2026" lines={FF_SAMPLE} rateLine="Indicative at ZMW 20.00 per USD, sample rate" />
      </WithPanel>
      {state === 'Reject' || state === 'Rejecting' ? (
        <ReasonDialog open title="Reject Farmer statement v2?" label="Comment" minLength={1} confirmLabel="Reject" confirmVariant="critical" busy={state === 'Rejecting'} sheet={narrow}
          defaultReason={state === 'Rejecting' ? 'The exchange rate line must sit under payments.' : ''}>
          Farmer statement v1 stays in force.
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Exchange rates (Map D-40, UAG-160) */

export function ExchangeRates({ state = 'Rates', onOpen }) {
  const narrow = !useMinWidth(768);
  const entering = state === 'Enter rate' || state === 'Saving';
  const correcting = state === 'Correct rate' || state === 'Correcting';
  const rows = FF_RATES;
  const source = (
    <Card title="Exchange rate source" padding={16}>
      <HmFacts min={140} fields={[['Setting', <HmLink onOpen={() => onOpen && onOpen('setting')}>Exchange rate source</HmLink>], ['Value', 'Bank of Zambia mid'], ['Setting owner', 'Owner'], ['Rates entered by', 'Finance']]} />
    </Card>
  );
  return (
    <Sections>
      <HmHead title="Exchange rates" count={rows.length} right={<Button size="small" icon="plus">New</Button>} />
      {state === 'No rate today' ? <ConditionBanner>No rate for 27 Sep 2026. Payments dated 27 Sep 2026 wait for that day's rate.</ConditionBanner> : null}
      <WithRail rail={source}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <ScrollRow><Capsule chevron selected>USD to ZMW</Capsule></ScrollRow>
          <SearchField placeholder="Search this list" hint={null} maxWidth={320} />
        </div>
        {state === 'Rate already entered' ? <Refusal action="Save" reason="A rate for 26 Sep 2026 already exists. Correct it instead" /> : null}
        <Card padding={4}>
          <HmTable rows={rows} columns={[
            { key: 'date', label: 'Date', width: '120px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.date}</HmLink> },
            { key: 'rate', label: 'Rate', width: 'minmax(170px, 1fr)', tabular: true },
            { key: 'source', label: 'Source', width: '170px' },
            { key: 'by', label: 'Entered by', width: '110px' },
            { key: 'at', label: 'Entered (CAT)', width: '160px', tabular: true },
            { key: 'note', label: 'Reason', width: '170px', wrap: true },
            { key: 'status', label: 'Status', width: '120px', render: (r) => <StatusMark kind={r.status === 'Corrected' ? 'neutral' : 'clean'} label={r.status} size="body-4" /> },
          ]} />
        </Card>
      </WithRail>
      {entering ? (
        <Dialog open title="New rate" width={480} sheet={narrow}
          footer={<><Button variant="ghost" size="small" disabled={state === 'Saving'}>Cancel</Button><Button size="small" loading={state === 'Saving'}>Save</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Date" required><Input defaultValue="27 Sep 2026" disabled={state === 'Saving'} /></Field>
            <Field label="Rate (ZMW per USD)" required><Input align="right" defaultValue="25.04" disabled={state === 'Saving'} /></Field>
            <Field label="Source"><Input defaultValue="Bank of Zambia mid" disabled /></Field>
          </div>
        </Dialog>
      ) : null}
      {correcting ? (
        <ReasonDialog open title="Correct rate, 26 Sep 2026" label="Reason" minLength={1} confirmLabel="Correct rate" busy={state === 'Correcting'} sheet={narrow}
          defaultReason={state === 'Correcting' ? 'Keyed wrong' : ''}>
          ZMW 25.00 per USD changes to ZMW 25.05 per USD for 26 Sep 2026. Statements already run keep the rate they used.
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}
