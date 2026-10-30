/** Invoice preparation and settlement: invoice preparation and receivables (M7.DS.02, UAG-200; S16 AL8, canvas S17
    "One Link Alka" screen 13 "Invoice preparation run", canvas S60 "One Link Sid" screens 2 to 4). The operations lead
    builds and submits the month's invoice preparation run; Finance reviews it, takes a disputed line out with a reason,
    marks it prepared and exports invoice-ready data, or withdraws it with a reason. Finance then records the invoice it
    raised outside One Link and each payment the mill makes, and follows each contract's two gaps, still to invoice and
    still to pay, on the receivables pipeline. Every screen takes `state`, one of its ST_INVOICING_STATES entry.

    The boundary words are fixed (Map D-02, D-12): invoice preparation, invoice-ready data, Not a tax invoice. One Link
    never issues, numbers, sends or fiscalises an invoice: Record invoiced takes UAG's own reference as free text and
    nothing here generates, suggests or sequences one. Money carries the Sell tier (UX-10): a viewer without it gets the
    same layout with the price and amount columns left out and the Restricted lock where a shared field must show.
    Weights carry three decimals on a line and the unit in the header (UX-12); money its code before the amount, two
    decimals (UX-11). Fictional sample data on the golden fixture names. */

export const ST_INVOICING_STATES = {
  InvoicePrepRuns: ['Runs', 'Start run', 'Starting', 'No runs', 'Loading', 'Error'],
  InvoicePrepRun: ['Lines prepared', 'Submitting', 'Awaiting destination weight', 'Waiting for review', 'Reference chain', 'Exclude line', 'Line excluded', 'Marking prepared', 'Prepared',
    'Exporting', 'Export preview', 'Withdraw', 'Withdrawn', 'Without the sell tier', 'History', 'Loading', 'Error'],
  ContractReceivables: ['Invoices and payments', 'Record invoiced', 'Amount differs', 'Recording invoice', 'Invoice recorded', 'Record payment', 'No rate for the day', 'Recording payment', 'Payment recorded', 'Without the sell tier', 'Loading'],
  SettlementPipeline: ['By contract', 'Gap to invoice', 'Gap to pay', 'Nothing outstanding', 'Without the sell tier', 'Loading', 'Error'],
};

/* ------------------------------------------------------------------ Frames */

/** Finance's navigation (canvas S60 menu): Finance holds invoice preparation, receivables, farmer settlement, settlement
    batches, statements due, farmer accounts, stock cost and exchange rates; Setup holds the GL cost categories. */
export const ST_FIN_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'finance', label: 'Finance', icon: 'landmark', sections: [
    { value: 'invoice-prep', label: 'Invoice preparation' }, { value: 'receivables', label: 'Receivables' }, { value: 'settlement', label: 'Farmer settlement' },
    { value: 'batches', label: 'Settlement batches' }, { value: 'due', label: 'Statements due' }, { value: 'accounts', label: 'Farmer accounts' },
    { value: 'stock-cost', label: 'Stock cost' }, { value: 'rates', label: 'Exchange rates' }] },
  { value: 'counterparties', label: 'Counterparties', icon: 'building-2' },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
  { value: 'setup', label: 'Setup', icon: 'settings', sections: [{ value: 'cost-categories', label: 'GL cost categories' }] },
] }];
export const ST_FIN_USER = { initials: 'NP', name: 'N. Phiri', meta: 'Finance' };
/** The operations lead (canvas S17): Finance holds Invoice preparation beside Import allocation. */
export const ST_OPS_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'logistics', label: 'Logistics', icon: 'truck' },
  { value: 'finance', label: 'Finance', icon: 'landmark', sections: [{ value: 'invoice-prep', label: 'Invoice preparation' }, { value: 'allocation', label: 'Import allocation' }] },
  { value: 'counterparties', label: 'Counterparties', icon: 'building-2' },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
] }];
export const ST_OPS_USER = { initials: 'MC', name: 'M. Chanda', meta: 'Operations' };
/** A reader without the Sell, Contract or Farmer account tier (stock control, Gate tier only): the same layouts with
    the money left out, and the Restricted lock where a shared field must show. */
export const ST_VIEW_NAV = [{ items: [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'finance', label: 'Finance', icon: 'landmark', sections: [{ value: 'invoice-prep', label: 'Invoice preparation' }, { value: 'receivables', label: 'Receivables' }, { value: 'accounts', label: 'Farmer accounts' }, { value: 'stock-cost', label: 'Stock cost' }] },
  { value: 'reports', label: 'Reports', icon: 'chart-column' },
] }];
export const ST_VIEW_USER = { initials: 'RD', name: 'R. Daka', meta: 'Stock control' };

export function stInvoicingFrame(screen, state) {
  const fin = (section, ...crumbs) => ({ who: state === 'Without the sell tier' ? 'view' : 'fin', module: 'finance', section, breadcrumb: ['Finance', ...crumbs] });
  if (screen === 'InvoicePrepRuns') return fin('invoice-prep', 'Invoice preparation');
  if (screen === 'InvoicePrepRun') {
    const f = fin('invoice-prep', 'Invoice preparation', ST_RUN.id);
    return ['Lines prepared', 'Submitting', 'Awaiting destination weight'].includes(state) ? { ...f, who: 'ops' } : f;
  }
  if (screen === 'ContractReceivables') return fin('receivables', 'Receivables', `${ST_CONTRACTS[0].id}, ${ST_CONTRACTS[0].buyer}`);
  return fin('receivables', 'Receivables');
}

/* ------------------------------------------------------------------ Parts these screens share */

/** A view and filters on a list (UX-07): the saved view first, filters after it, search at the right. */
export function StListBar({ view, filters, search = 'Search this list' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <ScrollRow><Capsule chevron selected>{view}</Capsule>{filters}</ScrollRow>
      <SearchField placeholder={search} hint={null} maxWidth={320} />
    </div>
  );
}
/** Loading: a skeleton in the page's footprint, no text (S57). */
export function StLoading({ cards = 2 }) {
  return <div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)' }}>{Array.from({ length: cards }, (_, i) => <CardSkeleton key={i} />)}</div>;
}
/** A system error (S57): "[Action] failed. Try again." */
export function StError({ action = 'Loading' }) {
  return <Banner tone="error" action={<Button variant="outline" size="small">Try again</Button>}>{action} failed. Try again.</Banner>;
}
/** A bold Total cell (UX-26). */
export const stStrong = (r, v) => (r.total ? <Text variant="body-3" strong tabular>{v}</Text> : v);
/** A phone draws a dialog as a sheet. */
export function useStSheet() { return !useMinWidth(768); }
/** A titled card with its count and a meta line, its table running edge to edge under the header (HmCard's anatomy
    with a meta line). */
export function StCard({ title, count, meta, children }) {
  return (
    <Card gap={8} meta={meta ? [meta] : undefined} title={<>{title}{count != null ? <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 8 }}><Count>{count}</Count></span> : null}</>}>
      <div style={{ margin: '0 -16px -16px' }}>{children}</div>
    </Card>
  );
}
/** Two cards side by side, stacked on a phone. */
export function StPair({ children, min = 340 }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`, gap: 'var(--card-gap)', alignItems: 'start' }}>{children}</div>;
}

/* ------------------------------------------------------------------ Invoice preparation: example data (S16 AL8) */

/** A run's status (the app's set, UAG-113 and UAG-201): Draft while it is built and reviewed, Prepared once Finance has
    marked it prepared, Withdrawn with a reason. A line is Ready, Blocked (no mill offload: blocked, not missing) or
    Excluded with a reason. */
export const ST_RUN_STATUS = { draft: { kind: 'pending', word: 'Draft' }, prepared: { kind: 'clean', word: 'Prepared' }, withdrawn: { kind: 'neutral', word: 'Withdrawn' } };
export const ST_LINE_STATUS = { ready: { kind: 'clean', word: 'Ready' }, blocked: { kind: 'block', word: 'Blocked: no mill offload' }, excluded: { kind: 'neutral', word: 'Excluded' } };
export function StRunStatus({ status, size = 'body-4' }) { const s = ST_RUN_STATUS[status]; return <StatusMark kind={s.kind} label={s.word} size={size} />; }
export function StLineStatus({ status }) { const s = ST_LINE_STATUS[status]; return <StatusMark kind={s.kind} label={s.word} size="body-4" />; }

export const ST_RUN = { id: 'IPR-0009', period: 'September 2026', preparedBy: 'M. Chanda', reviewer: 'N. Phiri', submitted: '30 Sep 2026, 17:10', prepared: '01 Oct 2026, 09:40', withdrawn: '01 Oct 2026, 10:05',
  withdrawReason: 'Riverbend Milling disputes the September price; rebuild once the amendment is approved' };
/** The run's lines, each on its contract's basis (AL8 step 2): the offloaded weight on a delivered contract, the
    collected weight on a collected one, at the contract price, with the grade adjustment on a local farmer contract. */
export const ST_LINES = [
  { id: 'KAL-07', contract: 'SYN4845', buyer: 'Riverbend Milling', basis: 'Delivered, offloaded weight', weight: '34.020', price: '284.40', amount: '9,675.29', status: 'ready',
    chain: [['Truck leg', 'KAL-07'], ['Truck', 'ACE 4412'], ['Port schedule', 'MV Kalahari, row 7'], ['Mill delivery note', 'RBM 5521'], ['Offloaded', '23 Sep 2026, 11:30, Mill offload sheet']] },
  { id: 'KAL-09', contract: 'SYN4845', buyer: 'Riverbend Milling', basis: 'Delivered, offloaded weight', weight: '34.050', price: '284.40', amount: '9,683.82', status: 'ready',
    chain: [['Truck leg', 'KAL-09'], ['Truck', 'ACE 4418'], ['Port schedule', 'MV Kalahari, row 9'], ['Mill delivery note', 'RBM 5534'], ['Offloaded', '25 Sep 2026, 09:10, Mill call']] },
  { id: 'KAL-11', contract: 'SYN4845', buyer: 'Riverbend Milling', basis: 'Delivered, offloaded weight', weight: '', price: '', amount: '', status: 'blocked', chain: [['Truck leg', 'KAL-11'], ['Truck', 'ACE 4431']] },
  { id: 'ZBS-03', contract: 'SYN4852', buyer: 'Crest Milling', basis: 'Delivered, offloaded weight', weight: '33.700', price: '284.40', amount: '9,584.28', status: 'ready',
    chain: [['Truck leg', 'ZBS-03'], ['Truck', 'NSH 2207'], ['Mill delivery note', 'CRM 0918'], ['Offloaded', '24 Sep 2026, 14:05, Mill offload sheet']] },
  { id: 'FD-0139', contract: 'SYN4870', buyer: 'Kafue Valley Milling', basis: 'Collected, collected weight, grade 1', weight: '33.200', price: '272.00', amount: '9,030.40', status: 'ready',
    chain: [['Consignment', 'FD-0139'], ['Delivery note', 'DN 3342'], ['Goods received note', 'GRN10000418'], ['Weighbridge ticket', 'WBT 7781'], ['Truck', 'ACF 5524'], ['Grade', 'Grade 1, at contract']] },
];
export const ST_EXCLUDE_REASON = 'Shortage claim SC-0007 is open with Crest Milling';
/** The lines as a state draws them: from Line excluded on, ZBS-03 is Excluded with Finance's reason. */
export function stLinesFor(state) {
  const out = ['Line excluded', 'Marking prepared', 'Prepared', 'Exporting', 'Export preview', 'Withdraw', 'Withdrawn'].includes(state);
  return ST_LINES.map((l) => (out && l.id === 'ZBS-03' ? { ...l, status: 'excluded', reason: ST_EXCLUDE_REASON } : l));
}
/** The run's figures, worked out from its lines: only Ready lines count; a blocked or excluded line is in no total. */
export function stRunFigures(lines) {
  const ready = lines.filter((l) => l.status === 'ready');
  return { contracts: new Set(ready.map((l) => l.contract)).size, prepared: ready.length, blocked: lines.filter((l) => l.status === 'blocked').length, excluded: lines.filter((l) => l.status === 'excluded').length,
    weight: tonnes(ready.reduce((n, l) => n + thousandths(l.weight), 0)), amount: fromCents(ready.reduce((n, l) => n + centsOf(l.amount), 0)) };
}
/** Costs on the run's contracts, for reference only: they are not in any line or amount (RL-NO-LANDED-COST). */
export const ST_RUN_COSTS = [
  { id: 'c1', contract: 'SYN4845', category: 'Transport', code: '610100', amount: '2,271.50', reference: 'Kazungula Freight inv 7781', on: '24 Sep 2026' },
  { id: 'c2', contract: 'SYN4845', category: 'Clearing Docs', code: '610300', amount: '640.00', reference: 'Corridor Clearing Ltd inv 0412', on: '22 Sep 2026' },
  { id: 'c3', contract: 'SYN4870', category: 'Contract Specific Bagging', code: '610500', amount: '310.00', reference: 'Mkushi Sacks inv 118', on: '26 Sep 2026' },
];
const ST_RUN_HISTORY = [
  { id: 'h5', field: 'Status', user: 'N. Phiri', old: 'Draft', next: 'Prepared', date: '01 Oct 2026, 09:40' },
  { id: 'h4', field: 'ZBS-03', user: 'N. Phiri', old: 'Ready', next: `Excluded: ${ST_EXCLUDE_REASON}`, date: '01 Oct 2026, 09:31' },
  { id: 'h3', field: 'Waiting for', user: 'M. Chanda', old: '', next: 'N. Phiri', date: '30 Sep 2026, 17:10' },
  { id: 'h2', field: 'Lines', user: 'System', old: '', next: '5 loads, 1 blocked', date: '30 Sep 2026, 16:58' },
  { id: 'h1', field: 'Status', user: 'M. Chanda', old: '', next: 'Draft', date: '30 Sep 2026, 16:58' },
];

/* ------------------------------------------------------------------ Invoice preparation runs (list) */

export const ST_RUNS = [
  { id: 'IPR-0009', period: 'September 2026', status: 'draft', contracts: '3', prepared: '4', blocked: '1', amount: '37,973.79', by: 'M. Chanda', waiting: 'N. Phiri' },
  { id: 'IPR-0008', period: 'August 2026', status: 'prepared', contracts: '4', prepared: '11', blocked: '0', amount: '104,512.66', by: 'M. Chanda', waiting: '' },
  { id: 'IPR-0007', period: 'August 2026', status: 'withdrawn', contracts: '4', prepared: '9', blocked: '2', amount: '85,104.30', by: 'M. Chanda', waiting: '' },
];

export function InvoicePrepRuns({ state = 'Runs', onOpen }) {
  const sheet = useStSheet();
  const rows = state === 'No runs' ? [] : ST_RUNS;
  const head = <HmHead title="Invoice preparation" count={state === 'Loading' ? undefined : rows.length} right={<Button size="small" icon="plus">Start run</Button>} />;
  const bar = <StListBar view="All runs" filters={<><Capsule chevron>Period: All</Capsule><Capsule chevron>Status: All</Capsule></>} search="Search runs" />;
  if (state === 'Loading') return <Sections>{head}{bar}<StLoading cards={1} /></Sections>;
  return (
    <Sections>
      {head}
      {state === 'Error' ? <StError action="Loading the runs" /> : null}
      {bar}
      {rows.length ? (
        <Card padding={4}>
          <HmTable rows={rows} columns={[
            { key: 'id', label: 'Run', width: '100px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
            { key: 'period', label: 'Period', width: '130px' },
            { key: 'status', label: 'Status', width: '110px', render: (r) => <StRunStatus status={r.status} /> },
            { key: 'contracts', label: 'Contracts', width: '90px', align: 'right' },
            { key: 'prepared', label: 'Loads prepared', width: '120px', align: 'right' },
            { key: 'blocked', label: 'Loads blocked', width: '110px', align: 'right' },
            { key: 'amount', label: 'Amount (USD)', width: '120px', align: 'right' },
            { key: 'by', label: 'Prepared by', width: '110px' },
            { key: 'waiting', label: 'Waiting for', width: 'minmax(100px, 1fr)' },
          ]} />
        </Card>
      ) : <Card><EmptyState icon="file-text" title="No invoice preparation runs to display." /></Card>}
      {state === 'Start run' || state === 'Starting' ? (
        <Dialog open title="Start run" width={400} sheet={sheet} footer={<><Button variant="ghost" size="small" disabled={state === 'Starting'}>Cancel</Button><Button size="small" loading={state === 'Starting'}>Start run</Button></>}>
          <Field label="Period" required hint="Each sale contract's proven loads not yet prepared, on the contract's basis"><Select options={['September 2026', 'August 2026', 'October 2026']} defaultValue="September 2026" disabled={state === 'Starting'} /></Field>
        </Dialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Invoice preparation run (f, u) */

export function StLineDetails({ line, onClose, sheet }) {
  return (
    <Dialog open title={`${line.id}, ${line.contract}`} width={480} sheet={sheet} onClose={onClose} footer={<Button variant="ghost" size="small" onClick={onClose}>Close</Button>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <StLineStatus status={line.status} />
        <Text variant="body-3" strong>Basis</Text>
        <HmFacts min={150} fields={[['Contract', line.contract], ['Contract basis applied', line.basis], ['Weight (t)', line.weight], ['Buyer', line.buyer]]} />
        <Text variant="body-3" strong>Price</Text>
        <HmFacts min={150} fields={[['Price', line.price ? `USD ${line.price} per t` : ''], ['Amount', line.amount ? `USD ${line.amount}` : '']]} />
        <Text variant="body-3" strong>Reference chain</Text>
        <HmFacts min={150} fields={line.chain} />
      </div>
    </Dialog>
  );
}

export function InvoicePrepRun({ state = 'Waiting for review', onOpen }) {
  const sheet = useStSheet();
  const alka = ['Lines prepared', 'Submitting', 'Awaiting destination weight'].includes(state);
  const tier = state !== 'Without the sell tier';
  const prepared = ['Prepared', 'Exporting', 'Export preview'].includes(state);
  const withdrawn = state === 'Withdrawn';
  const status = prepared ? 'prepared' : withdrawn ? 'withdrawn' : 'draft';
  const lines = stLinesFor(state);
  const f = stRunFigures(lines);
  const reviewing = !alka && !prepared && !withdrawn;
  const busy = ['Submitting', 'Marking prepared', 'Exporting'].includes(state);
  const tab = state === 'History' ? 'History' : 'Details';
  if (state === 'Loading') return <Sections><HmHead title={ST_RUN.id} /><StLoading cards={2} /></Sections>;
  const actions = alka ? <Button size="small" loading={state === 'Submitting'}>Submit for approval</Button>
    : withdrawn || !tier ? null : <>
      {reviewing ? <Button size="small" loading={state === 'Marking prepared'} disabled={busy && state !== 'Marking prepared'}>Mark prepared</Button> : null}
      {reviewing || prepared ? <Button variant="outline" size="small" disabled={busy}>Withdraw</Button> : null}
      <Button variant="outline" size="small" icon="download" loading={state === 'Exporting'} disabled={!prepared}>Export</Button>
    </>;
  const shown = state === 'Awaiting destination weight' ? lines.filter((l) => l.status === 'blocked') : lines;
  const total = { id: 'total', total: true, contract: 'Total', weight: f.weight, amount: f.amount };
  const rowAction = (r) => {
    if (r.total || withdrawn) return '';
    if (r.status === 'blocked') return <Button variant="outline" size="xsmall" onClick={() => onOpen && onOpen(r.id)}>Record offload</Button>;
    if (r.status === 'ready' && reviewing && tier) return <Button variant="outline" size="xsmall">Exclude line</Button>;
    return '';
  };
  const linesTable = (
    <HmCard title="Lines" count={shown.length} objects="lines">
      <HmTable rows={state === 'Awaiting destination weight' ? shown : [...shown, total]} columns={[
        { key: 'contract', label: 'Contract', width: '96px', render: (r) => stStrong(r, r.contract) },
        { key: 'id', label: 'Load', width: '96px', render: (r) => (r.total ? '' : r.status === 'blocked' ? <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> : r.id) },
        { key: 'basis', label: 'Basis', width: 'minmax(190px, 1fr)', wrap: true },
        { key: 'weight', label: 'Weight (t)', width: '96px', align: 'right', render: (r) => stStrong(r, r.weight) },
        ...(tier ? [
          { key: 'price', label: 'Price (USD/t)', width: '108px', align: 'right' },
          { key: 'amount', label: 'Amount (USD)', width: '116px', align: 'right', render: (r) => stStrong(r, r.amount) },
        ] : []),
        { key: 'status', label: 'Status', width: '190px', wrap: true, render: (r) => (r.total ? '' : <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><StLineStatus status={r.status} />{r.reason ? <Text variant="body-4" tone="secondary">{r.reason}</Text> : null}</span>) },
        { key: 'action', label: '', width: '240px', align: 'right', render: (r) => (r.total ? '' : <span style={{ display: 'inline-flex', gap: 4, whiteSpace: 'nowrap' }}>{rowAction(r)}<Button variant="ghost" size="xsmall" onClick={() => onOpen && onOpen(`details:${r.id}`)}>View details</Button></span>) },
      ]} />
    </HmCard>
  );
  const contracts = [...new Set(lines.map((l) => l.contract))].map((c) => {
    const ls = lines.filter((l) => l.contract === c);
    const g = stRunFigures(ls);
    return { id: c, buyer: ls[0].buyer, basis: ls[0].basis.split(',')[0], prepared: String(g.prepared), blocked: String(g.blocked), weight: g.weight, amount: g.amount };
  });
  return (
    <Sections>
      <HmHead title={ST_RUN.id} />
      {state === 'Error' ? <StError action="Mark prepared" /> : null}
      {prepared ? <Banner tone="info" title={MONEY_DOCUMENTS['invoice-ready'].title}>{MONEY_DOCUMENTS['invoice-ready'].label}. Raise the tax invoice outside One Link, then record it here.</Banner> : null}
      {withdrawn ? <Banner tone="warning">{`Withdrawn by ${ST_RUN.reviewer} on ${ST_RUN.withdrawn}: ${ST_RUN.withdrawReason}`}</Banner> : null}
      <RecordHighlights kind="Invoice preparation" title={ST_RUN.id} status={<StRunStatus status={status} size="body-3" />} tab={tab} onTab={() => {}} tabs={['Details', 'Related', 'History']} actions={actions}
        fields={[
          { label: 'Period', value: ST_RUN.period },
          { label: 'Contracts', value: String(f.contracts) },
          { label: 'Loads prepared', value: String(f.prepared) },
          { label: 'Loads blocked', value: String(f.blocked) },
          ...(f.excluded ? [{ label: 'Loads excluded', value: String(f.excluded) }] : []),
          { label: 'Amount', value: tier ? `USD ${f.amount}` : <Restricted /> },
          { label: 'Prepared by', value: ST_RUN.preparedBy },
          ...(reviewing ? [{ label: 'Waiting for', value: ST_RUN.reviewer }] : []),
          ...(prepared ? [{ label: 'Marked prepared', value: `${ST_RUN.reviewer}, ${ST_RUN.prepared}` }] : []),
        ]} />
      {tab === 'History' ? (
        <HmCard title="History" count={ST_RUN_HISTORY.length} objects="changes">
          <HmTable rows={ST_RUN_HISTORY} columns={[
            { key: 'field', label: 'Field', width: '110px' }, { key: 'user', label: 'User', width: '110px' },
            { key: 'old', label: 'Old value', width: '110px' }, { key: 'next', label: 'New value', width: 'minmax(220px, 1fr)', wrap: true },
            { key: 'date', label: 'Date (CAT)', width: '160px', tabular: true },
          ]} />
        </HmCard>
      ) : <>
        <ScrollRow>
          <Capsule chevron selected>{state === 'Awaiting destination weight' ? 'Awaiting destination weight' : 'All lines'}</Capsule>
          <Capsule>{`Awaiting destination weight ${f.blocked}`}</Capsule>
          {f.excluded ? <Capsule>{`Excluded ${f.excluded}`}</Capsule> : null}
        </ScrollRow>
        {linesTable}
        {state !== 'Awaiting destination weight' ? <>
          {prepared && tier ? (
            <HmCard title="Contracts" count={contracts.length} objects="contracts">
              <HmTable rows={contracts} columns={[
                { key: 'id', label: 'Contract', width: '100px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(`receivables:${r.id}`)}>{r.id}</HmLink> },
                { key: 'buyer', label: 'Buyer', width: 'minmax(150px, 1fr)', wrap: true },
                { key: 'basis', label: 'Basis', width: '96px' },
                { key: 'prepared', label: 'Loads prepared', width: '120px', align: 'right' },
                { key: 'weight', label: 'Weight (t)', width: '96px', align: 'right' },
                { key: 'amount', label: 'Amount (USD)', width: '116px', align: 'right' },
                { key: 'record', label: '', width: '150px', align: 'right', render: (r) => (r.prepared !== '0' ? <Button variant="outline" size="xsmall" onClick={() => onOpen && onOpen(`invoiced:${r.id}`)}>Record invoiced</Button> : '') },
              ]} />
            </HmCard>
          ) : null}
          {tier ? (
            <StCard title="Contract costs" count={ST_RUN_COSTS.length} meta="For reference: not in any line or amount">
              <HmTable rows={ST_RUN_COSTS} columns={[
                { key: 'contract', label: 'Contract', width: '96px' }, { key: 'category', label: 'Category', width: 'minmax(160px, 1fr)', wrap: true },
                { key: 'code', label: 'Account code', width: '110px' }, { key: 'amount', label: 'Amount (USD)', width: '116px', align: 'right' },
                { key: 'reference', label: 'Reference', width: 'minmax(170px, 1fr)', wrap: true }, { key: 'on', label: 'Incurred on', width: '116px', tabular: true },
              ]} />
            </StCard>
          ) : null}
        </> : null}
      </>}
      {state === 'Export preview' ? (
        <MoneyDocument kind="invoice-ready" counterparty="Riverbend Milling, Crest Milling, Kafue Valley Milling" reference={ST_RUN.id} generated="01 Oct 2026, 09:46 CAT"
          fields={[['Period', ST_RUN.period], ['Contracts', String(f.contracts)], ['Loads', String(f.prepared)], ['Weight', `${f.weight} t`], ['Amount', `USD ${f.amount}`]]}
          rows={[...lines.filter((l) => l.status === 'ready'), total]} columns={[
            { key: 'contract', label: 'Contract', width: '96px' }, { key: 'id', label: 'Load', width: '90px' },
            { key: 'basis', label: 'Basis', width: 'minmax(170px, 1fr)', wrap: true }, { key: 'weight', label: 'Weight (t)', width: '96px', align: 'right' },
            { key: 'price', label: 'Price (USD/t)', width: '106px', align: 'right' }, { key: 'amount', label: 'Amount (USD)', width: '110px', align: 'right' },
          ]} />
      ) : null}
      {state === 'Reference chain' ? <StLineDetails line={ST_LINES[4]} sheet={sheet} /> : null}
      {state === 'Exclude line' ? (
        <ReasonDialog title="Exclude line" confirmLabel="Exclude line" defaultReason="" sheet={sheet}>
          {`ZBS-03 on SYN4852, 33.700 t, leaves this run and its total. It stays on the run with your reason and stays to be invoiced.`}
        </ReasonDialog>
      ) : null}
      {state === 'Withdraw' ? (
        <ReasonDialog title="Withdraw run" confirmLabel="Withdraw" confirmVariant="critical" sheet={sheet}>
          {`${ST_RUN.id} is withdrawn and its loads are free for a later run. The run stays, with your reason, in its History.`}
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Receivables: record invoiced and record payment (g) */

/** Each sale contract's pipeline (M7.SET.04; Sid's canvas, screen 3): loads awaiting destination weight, then the
    collected (invoice-ready) tonnes on the contract's basis, invoiced and paid. The two gaps are never stored: `gapsOf`
    works them out from these three, and their value is the gap at the contract price. Terms are the mill's own. */
export const ST_CONTRACTS = [
  { id: 'SYN4845', buyer: 'Riverbend Milling', basis: 'Delivered', price: '284.40', awaiting: '33.96', collected: '4,812.40', invoiced: '3,460.00', paid: '2,888.46', terms: '30 days', oldest: '31 Aug 2026', overdue: true },
  { id: 'SYN4852', buyer: 'Crest Milling', basis: 'Delivered', price: '284.40', awaiting: '0.00', collected: '1,240.00', invoiced: '1,240.00', paid: '940.00', terms: '14 days', oldest: '15 Sep 2026', overdue: true },
  { id: 'SYN4870', buyer: 'Kafue Valley Milling', basis: 'Collected', price: '272.00', awaiting: '0.00', collected: '250.00', invoiced: '0.00', paid: '0.00', terms: '7 days', oldest: '', overdue: false },
  { id: 'SYN4811', buyer: 'Antelope Mills', basis: 'Delivered', price: '284.40', awaiting: '0.00', collected: '2,000.00', invoiced: '2,000.00', paid: '2,000.00', terms: '60 days', oldest: '', overdue: false },
];
/** A gap's value: its tonnes at the contract price, worked out, never typed. */
export function stGapValue(t, price) { return fromCents(Math.round((centsOf(t) * centsOf(price)) / 100)); }
/** An invoice's status (S57 invoices and payments): Invoiced, Paid, Overdue. */
export const ST_INVOICE_STATUS = { invoiced: { kind: 'pending', word: 'Invoiced' }, paid: { kind: 'clean', word: 'Paid' }, overdue: { kind: 'attention', word: 'Overdue' } };
export function StInvoiceStatus({ status }) { const s = ST_INVOICE_STATUS[status]; return <StatusMark kind={s.kind} label={s.word} size="body-4" />; }
export const ST_INVOICES = [
  { id: 'i3', ref: '9012', date: '05 Oct 2026', weight: '68.070', invoiced: '19,359.11', paid: '', outstanding: '19,359.11', by: 'N. Phiri', status: 'invoiced', payments: [] },
  { id: 'i2', ref: '8986', date: '31 Aug 2026', weight: '466.680', invoiced: '132,723.79', paid: '0.00', outstanding: '132,723.79', by: 'N. Phiri', status: 'overdue', payments: [] },
  { id: 'i1', ref: '8693', date: '31 Jul 2026', weight: '2,925.250', invoiced: '831,941.10', paid: '821,478.24', outstanding: '10,462.86', by: 'N. Phiri', status: 'invoiced',
    payments: [{ id: 'p2', ref: 'Riverbend RTGS 4471', date: '05 Aug 2026', amount: '821,478.24', rate: 'Received ZMW 20,536,956.00 at ZMW 25.00 per USD on 05 Aug 2026', by: 'N. Phiri' }] },
];
const ST_RATE = 'ZMW 25.00 per USD';
const ST_RATE_DATE = '05 Oct 2026';

/** Record invoiced (M7.DS.02 AC 5): the invoice UAG raised through its own process, recorded against the run's lines.
    The UAG invoice reference is a free-text field with no default, no suggestion and no sequence; One Link keeps the
    record and the issued document only. A different amount needs a reason. */
export function StRecordInvoicedDialog({ contract = ST_CONTRACTS[0], differs = false, busy = false, sheet = false }) {
  const prepared = '19,359.11';
  return (
    <Dialog open title={`Record invoiced, ${contract.id}`} width={480} sheet={sheet}
      footer={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Record invoiced</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Text variant="body-3">An invoice already raised outside One Link. One Link keeps the record and the document only.</Text>
        <Field label="Lines this invoice covers" required>
          <CheckboxList values={['KAL-07', 'KAL-09']} disabled={busy} options={[{ value: 'KAL-07', label: 'KAL-07, September 2026, 34.020 t', hint: 'USD 9,675.29' }, { value: 'KAL-09', label: 'KAL-09, September 2026, 34.050 t', hint: 'USD 9,683.82' }]} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16 }}>
          <Field label="UAG invoice reference" required><Input type="text" autoComplete="off" defaultValue="" disabled={busy} /></Field>
          <Field label="Invoice date" required><Input defaultValue="05 Oct 2026" disabled={busy} /></Field>
        </div>
        <Field label="Amount (USD)" required><Input align="right" inputMode="decimal" defaultValue={differs ? '19,100.00' : prepared} disabled={busy} /></Field>
        <HmFacts min={120} fields={[['Prepared', `USD ${prepared}`], ['Invoiced', `USD ${differs ? '19,100.00' : prepared}`], ...(differs ? [['Difference', 'USD 259.11']] : [])]} />
        {differs ? <Field label="Reason" required><Input multiline defaultValue="" disabled={busy} /></Field> : null}
        <Field label="Issued document" required hint="PDF, PNG or JPEG"><span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Button variant="outline" size="small" icon="paperclip" disabled={busy}>Choose file</Button><Text variant="body-4" tone="secondary">No file chosen</Text></span></Field>
      </div>
    </Dialog>
  );
}

/** Record payment (M7.DS.02 AC 1g; Sid's canvas screen 4): a payment the mill made, on the day's exchange rate. A
    payment never falls back to an earlier rate (Map D-40): with no rate for that day the dialog asks for it. */
export function StRecordPaymentDialog({ invoice = ST_INVOICES[0], noRate = false, busy = false, sheet = false }) {
  return (
    <Dialog open title={`Record payment, ${invoice.ref}`} width={480} sheet={sheet}
      footer={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Record payment</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <HmFacts min={140} fields={[['Outstanding', `USD ${invoice.outstanding}`], ['Invoice date', invoice.date]]} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16 }}>
          <Field label="Date paid" required><Input defaultValue={noRate ? '30 Oct 2026' : ST_RATE_DATE} disabled={busy} /></Field>
          <Field label="Currency" required><Select options={['ZMW', 'USD', 'ZAR']} defaultValue="ZMW" disabled={busy} /></Field>
        </div>
        <Field label="Amount (ZMW)" required><Input align="right" inputMode="decimal" defaultValue="483,977.75" disabled={busy} /></Field>
        <Field label="Reference"><Input defaultValue="Riverbend RTGS 4520" disabled={busy} /></Field>
        {noRate ? <>
          <Banner tone="warning">No exchange rate USD/ZMW for 30 Oct 2026. Enter the rate for that day: it is kept in Exchange rates.</Banner>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: 16 }}>
            <Field label="Rate (ZMW per USD)" required><Input align="right" inputMode="decimal" defaultValue="" disabled={busy} /></Field>
            <Field label="Source" required><Select options={['Choose a source', 'Bank of Zambia mid']} defaultValue="Choose a source" disabled={busy} /></Field>
          </div>
        </> : <HmFacts min={140} fields={[['Exchange rate', ST_RATE], ['Rate for', ST_RATE_DATE], ['Paid (USD)', '19,359.11']]} />}
      </div>
    </Dialog>
  );
}

export function ContractReceivables({ state = 'Invoices and payments', onOpen }) {
  const sheet = useStSheet();
  const c = ST_CONTRACTS[0];
  const tier = state !== 'Without the sell tier';
  const g = gapsOf(c);
  if (state === 'Loading') return <Sections><HmHead title={`${c.id}, ${c.buyer}`} /><StLoading cards={2} /></Sections>;
  const recorded = state === 'Invoice recorded';
  const paid = state === 'Payment recorded';
  const invoices = ST_INVOICES.map((i) => (paid && i.id === 'i3' ? { ...i, paid: '19,359.11', outstanding: '0.00', status: 'paid', payments: [{ id: 'p9', ref: 'Riverbend RTGS 4520', date: ST_RATE_DATE, amount: '19,359.11', rate: `Received ZMW 483,977.75 at ${ST_RATE} on ${ST_RATE_DATE}`, by: 'N. Phiri' }] } : i));
  const rows = recorded || paid ? invoices : invoices.filter((i) => i.id !== 'i3');
  return (
    <Sections>
      <HmHead title={`${c.id}, ${c.buyer}`} meta={<span>{`Wheat, 5,000 t sold, ${c.basis} basis`}</span>}
        right={tier ? <><Button variant="outline" size="small" onClick={() => onOpen && onOpen('invoiced')}>Record invoiced</Button></> : null} />
      {recorded ? <Banner tone="success">Invoice 9012 recorded against SYN4845.</Banner> : null}
      {paid ? <Banner tone="success">Payment recorded against 9012.</Banner> : null}
      <Card title="Position" padding={16}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <HmFacts min={130} fields={[[`${GAP_WORDS.awaiting} (t)`, c.awaiting], ['Collected (t)', c.collected], ['Invoiced (t)', c.invoiced], ['Paid (t)', c.paid], [`${GAP_WORDS.toInvoice} (t)`, g.toInvoice], [`${GAP_WORDS.toPay} (t)`, g.toPay],
            ...(tier ? [[`${GAP_WORDS.toInvoice} (USD)`, stGapValue(g.toInvoice, c.price)], [`${GAP_WORDS.toPay} (USD)`, stGapValue(g.toPay, c.price)]] : [])]} />
          <GapBar row={c} figures={false} maxWidth={480} />
        </div>
      </Card>
      <HmCard title="Invoices" count={rows.length} objects="invoices">
        <HmTable rows={rows} expanded={rows.filter((r) => r.payments.length).map((r) => r.id)} expandLabel={(r) => `Show the payments, ${r.ref}`}
          expand={(r) => (r.payments.length ? (
            <div style={{ padding: '8px 16px 12px' }}>
              <HmTable rows={r.payments} columns={[
                { key: 'ref', label: 'Payment', width: 'minmax(150px, 1fr)', wrap: true }, { key: 'date', label: 'Date paid', width: '116px', tabular: true },
                ...(tier ? [{ key: 'amount', label: 'Paid (USD)', width: '110px', align: 'right' }, { key: 'rate', label: 'Exchange rate', width: 'minmax(220px, 1.4fr)', wrap: true }] : []),
                { key: 'by', label: 'Recorded by', width: '110px' }, { key: 'status', label: 'Status', width: '110px', render: () => <StatusMark kind="clean" label="Recorded" size="body-4" /> },
              ]} />
            </div>
          ) : null)}
          columns={[
            { key: 'ref', label: 'Invoice', width: '96px', render: (r) => <Text variant="body-3" strong tabular>{r.ref}</Text> },
            { key: 'date', label: 'Date', width: '116px', tabular: true },
            { key: 'weight', label: 'Weight (t)', width: '100px', align: 'right' },
            ...(tier ? [
              { key: 'invoiced', label: 'Invoiced (USD)', width: '120px', align: 'right' },
              { key: 'paid', label: 'Paid (USD)', width: '110px', align: 'right' },
              { key: 'outstanding', label: 'Outstanding (USD)', width: '136px', align: 'right' },
            ] : []),
            { key: 'by', label: 'Recorded by', width: '110px' },
            { key: 'status', label: 'Status', width: '110px', render: (r) => <StInvoiceStatus status={r.status} /> },
            ...(tier ? [{ key: 'action', label: '', width: '140px', align: 'right', render: (r) => (r.outstanding !== '0.00' ? <Button variant="outline" size="xsmall" onClick={() => onOpen && onOpen('payment')}>Record payment</Button> : '') }] : []),
          ]} />
      </HmCard>
      {['Record invoiced', 'Amount differs', 'Recording invoice'].includes(state) ? <StRecordInvoicedDialog differs={state === 'Amount differs'} busy={state === 'Recording invoice'} sheet={sheet} /> : null}
      {['Record payment', 'No rate for the day', 'Recording payment'].includes(state) ? <StRecordPaymentDialog invoice={invoices[0]} noRate={state === 'No rate for the day'} busy={state === 'Recording payment'} sheet={sheet} /> : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Receivables pipeline, both gaps by contract (h) */

/** The pipeline (M7.SET.04): one row a contract with awaiting destination weight, collected, invoiced and paid, and the
    two gaps side by side on the same row, in tonnes and, with the Sell tier, in value. An invoice unpaid beyond the
    mill's terms reads Overdue. */
export function SettlementPipeline({ state = 'By contract', onOpen }) {
  const tier = state !== 'Without the sell tier';
  const view = { 'Gap to invoice': 'toInvoice', 'Gap to pay': 'toPay' }[state];
  const rows = state === 'Nothing outstanding' ? [] : view ? ST_CONTRACTS.filter((c) => centsOf(gapsOf(c)[view]) > 0) : ST_CONTRACTS;
  const head = <HmHead title="Receivables" count={state === 'Loading' ? undefined : rows.length} meta={<HmRefreshed time="01 Oct 2026, 07:02 CAT" />} right={<Button variant="outline" size="small" icon="download">Export</Button>} />;
  const bar = <StListBar view={view ? `${state} above zero` : 'All contracts'} filters={<><Capsule chevron>Buyer: All</Capsule><Capsule chevron>Commodity: All</Capsule></>} search="Search contracts" />;
  if (state === 'Loading') return <Sections>{head}{bar}<StLoading cards={1} /></Sections>;
  const sum = (k) => fromCents(rows.reduce((n, c) => n + centsOf(gapsOf(c)[k]), 0));
  const sumValue = (k) => fromCents(rows.reduce((n, c) => n + centsOf(stGapValue(gapsOf(c)[k], c.price)), 0));
  return (
    <Sections>
      {head}
      {state === 'Error' ? <StError action="Loading receivables" /> : null}
      {bar}
      {rows.length ? <>
        <HmFacts min={160} fields={[[`${GAP_WORDS.toInvoice} (t)`, sum('toInvoice')], [`${GAP_WORDS.toPay} (t)`, sum('toPay')], ...(tier ? [[`${GAP_WORDS.toInvoice} (USD)`, sumValue('toInvoice')], [`${GAP_WORDS.toPay} (USD)`, sumValue('toPay')]] : [])]} />
        <Card padding={4}>
          <HmTable rows={rows} columns={[
            { key: 'id', label: 'Contract', width: '96px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(`receivables:${r.id}`)}>{r.id}</HmLink> },
            { key: 'buyer', label: 'Buyer', width: 'minmax(140px, 1fr)', wrap: true },
            { key: 'awaiting', label: 'Awaiting destination weight (t)', width: '130px', align: 'right', wrap: true },
            { key: 'collected', label: 'Collected (t)', width: '104px', align: 'right' },
            { key: 'invoiced', label: 'Invoiced (t)', width: '100px', align: 'right' },
            { key: 'paid', label: 'Paid (t)', width: '92px', align: 'right' },
            { key: 'toInvoice', label: `${GAP_WORDS.toInvoice} (t)`, width: '116px', align: 'right', render: (r) => gapsOf(r).toInvoice },
            { key: 'toPay', label: `${GAP_WORDS.toPay} (t)`, width: '104px', align: 'right', render: (r) => gapsOf(r).toPay },
            { key: 'bar', label: 'Gaps', width: '130px', render: (r) => <GapBar row={r} figures={false} maxWidth={110} /> },
            ...(tier ? [
              { key: 'invoiceValue', label: `${GAP_WORDS.toInvoice} (USD)`, width: '136px', align: 'right', render: (r) => stGapValue(gapsOf(r).toInvoice, r.price) },
              { key: 'payValue', label: `${GAP_WORDS.toPay} (USD)`, width: '124px', align: 'right', render: (r) => stGapValue(gapsOf(r).toPay, r.price) },
            ] : []),
            { key: 'terms', label: 'Terms', width: '80px' },
            { key: 'oldest', label: 'Oldest unpaid', width: '140px', render: (r) => (r.overdue ? <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><Text variant="body-3" tabular>{r.oldest}</Text><StatusMark kind="attention" label="Overdue" size="body-4" /></span> : centsOf(r.invoiced) === 0 ? <StatusMark kind="pending" label="Ready to invoice" size="body-4" /> : '') },
          ]} />
        </Card>
      </> : <Card><EmptyState title="No contracts to display." /></Card>}
    </Sections>
  );
}
