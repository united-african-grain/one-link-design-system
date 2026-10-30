/** Invoice preparation and settlement: farmer settlement (M7.DS.02, UAG-200; F8.6, F8.7, SJ3, SJ4; canvas S60 "One Link
    Sid" screens 5 and 6): the statements-due queue, a settlement proposal with both sides in netting order, the
    exchange rate with its date, a partial netting with its reason, its approval, the payment Finance records and a
    reversal, the settlement statement, and the settlement batches with their stopping states (incomplete without the
    day's exchange rate, out of date, nothing to net, nothing to settle). Every screen takes `state`, one of its
    ST_SETTLE_STATES entry.

    One Link proposes and Finance confirms; nothing is paid from One Link (F8.7). The document is titled Settlement
    statement; it is never called anything else and carries no bank detail. A payment uses the day's rate and never an
    earlier one (Map D-40), so a proposal without that rate is incomplete and cannot be submitted. Farmer money carries
    the Farmer account tier (UX-10). Fictional sample data on the golden fixture names. */

export const ST_SETTLE_STATES = {
  StatementsDue: ['Due', 'Overdue', 'Nothing due', 'Loading', 'Error'],
  SettlementProposal: ['Proposal', 'Net less', 'Net less with a reason', 'Netted less', 'Submitting', 'Pending approval', 'Approver view', 'Approved', 'Record payment', 'Recording payment', 'Paid',
    'Reverse', 'Reversed', 'Settlement statement', 'Incomplete', 'Out of date', 'Nothing to net', 'Without the farmer account tier', 'Loading'],
  SettlementBatches: ['Batches', 'Batch', 'Incomplete', 'Out of date', 'Nothing to net', 'Nothing to settle', 'Loading', 'Error'],
};

export function stSettleFrame(screen, state) {
  if (screen === 'StatementsDue') return { who: 'fin', module: 'finance', section: 'due', breadcrumb: ['Finance', 'Statements due'] };
  if (screen === 'SettlementBatches') return { who: 'fin', module: 'finance', section: 'batches', breadcrumb: ['Finance', 'Settlement batches', ...(state === 'Batches' || state === 'Nothing to settle' || state === 'Loading' || state === 'Error' ? [] : [ST_BATCHES[0].id])] };
  if (state === 'Approver view') return { who: 'md', module: 'home', breadcrumb: ['Home', 'Items to approve', ST_PROPOSAL.id] };
  if (state === 'Without the farmer account tier') return { who: 'view', module: 'finance', section: 'accounts', breadcrumb: ['Finance', 'Farmer accounts', ST_PROPOSAL.farmer, ST_PROPOSAL.id] };
  return { who: 'fin', module: 'finance', section: 'settlement', breadcrumb: ['Finance', 'Farmer settlement', ST_PROPOSAL.id] };
}

/* ------------------------------------------------------------------ Example data: Lakeview Farms Ltd, winter wheat 2026 */

export const ST_PROPOSAL = { id: 'STL-0142', farmer: 'Lakeview Farms Ltd', contract: 'SYN4811 P A', due: '27 Sep 2026', terms: '7 days from delivery', built: '27 Sep 2026, 06:00', rate: 'ZMW 25.00 per USD', rateDate: '27 Sep 2026',
  approver: 'T. Mwila', partialReason: 'Seed DN 3321 carries to the next season, agreed with the farmer on 26 Sep', partial: '19,570.00' };
/** UAG owes for grain: each delivery at its own grade and price, on the mill's offloaded weight for a farm-direct load. */
export const ST_PAYABLE = [
  { id: 'p1', what: 'FD-0142, 25 Sep 2026, grade 2', weight: '31.980', rate: '500.00', amount: '15,990.00' },
  { id: 'p2', what: 'GRN10000419, 20 Sep 2026, grade 1', weight: '28.020', rate: '520.00', amount: '14,570.40' },
];
/** Farmer owes UAG, oldest first; the cash prepayment on the farmer's own contract nets first (RL-NET-ORDER). */
export const ST_OWED = [
  { id: 'o2', what: 'Fertiliser, Urea 50 kg, DN 3310, 12 Aug 2026', amount: '9,420.00' },
  { id: 'o1', what: 'Cash prepayment not yet recovered, PAY-0401, 01 Aug 2026', amount: '4,000.00', kind: 'prepayment' },
  { id: 'o3', what: 'Fertiliser, Compound D, DN 3318, 19 Aug 2026', amount: '6,150.00' },
  { id: 'o4', what: 'Seed, wheat, DN 3321, 20 Aug 2026', amount: '4,190.00' },
];
const ST_SETTLE_HISTORY = [
  { id: 'h4', field: 'Status', user: 'T. Mwila', old: 'Pending approval', next: 'Approved', date: '27 Sep 2026, 11:05' },
  { id: 'h3', field: 'Status', user: 'N. Phiri', old: 'Draft', next: 'Pending approval', date: '27 Sep 2026, 09:20' },
  { id: 'h2', field: 'Offset', user: 'N. Phiri', old: 'USD 23,760.00', next: `USD 19,570.00: ${'Seed DN 3321 carries to the next season, agreed with the farmer on 26 Sep'}`, date: '27 Sep 2026, 09:12' },
  { id: 'h1', field: 'Status', user: 'System', old: '', next: 'Draft', date: '27 Sep 2026, 06:00' },
];

/* ------------------------------------------------------------------ Statements due (l) */

/** The statements-due queue (M7.SET.08): when a period closes, every farmer owed a statement, by the cadence of their
    contract type (weekly for a collected contract delivered direct to the client, fortnightly for other farmer purchase
    contracts, monthly available). A farmer holding contracts on two cadences follows the most frequent, and the queue
    says why. The settlement cycle follows the same cadence, so each item shows its settlement's own state. Due until
    the due date, Overdue after 2 operating days. Tonnes and money are not on the queue, so it needs no price tier. */
export const ST_DUE = [
  { id: 'd1', farmer: 'Chongwe Growers Ltd', type: 'Collected, direct to the client', cadence: 'Weekly', period: '21 Sep to 27 Sep 2026', due: '28 Sep 2026', settlement: 'pending', status: 'overdue', why: '' },
  { id: 'd2', farmer: 'Lakeview Farms Ltd', type: 'Farmer purchase', cadence: 'Weekly', period: '21 Sep to 27 Sep 2026', due: '28 Sep 2026', settlement: 'draft', status: 'overdue', why: 'Holds a weekly and a fortnightly contract: the most frequent applies' },
  { id: 'd3', farmer: 'Cameron Estates', type: 'Farmer purchase', cadence: 'Fortnightly', period: '14 Sep to 27 Sep 2026', due: '30 Sep 2026', settlement: 'approved', status: 'due', why: '' },
  { id: 'd4', farmer: 'Mpongwe Valley Farms', type: 'Farmer purchase', cadence: 'Monthly', period: '01 Sep to 30 Sep 2026', due: '01 Oct 2026', settlement: '', status: 'due', why: '' },
];
const ST_DUE_MARK = { due: { kind: 'pending', word: 'Due' }, overdue: { kind: 'attention', word: 'Overdue' } };

export function StatementsDue({ state = 'Due', onOpen }) {
  const rows = state === 'Nothing due' ? [] : state === 'Overdue' ? ST_DUE.filter((r) => r.status === 'overdue') : ST_DUE;
  const head = <HmHead title="Statements due" count={state === 'Loading' ? undefined : rows.length} meta={<HmRefreshed time="01 Oct 2026, 06:00 CAT" />} />;
  const bar = <StListBar view={state === 'Overdue' ? 'Overdue' : 'All due'} filters={<><Capsule chevron>Cadence: All</Capsule><Capsule chevron>Contract type: All</Capsule></>} search="Search farmers" />;
  if (state === 'Loading') return <Sections>{head}{bar}<StLoading cards={1} /></Sections>;
  return (
    <Sections>
      {head}
      {state === 'Error' ? <StError action="Loading statements due" /> : null}
      {bar}
      {rows.length ? (
        <Card padding={4}>
          <HmTable rows={rows} columns={[
            { key: 'farmer', label: 'Farmer', width: 'minmax(170px, 1fr)', wrap: true, render: (r) => <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><HmLink onOpen={() => onOpen && onOpen('proposal')}>{r.farmer}</HmLink>{r.why ? <Text variant="body-4" tone="secondary">{r.why}</Text> : null}</span> },
            { key: 'type', label: 'Contract type', width: '150px', wrap: true },
            { key: 'cadence', label: 'Cadence', width: '104px' },
            { key: 'period', label: 'Period', width: '170px', wrap: true },
            { key: 'due', label: 'Due on', width: '116px', tabular: true },
            { key: 'settlement', label: 'Settlement', width: '150px', render: (r) => (r.settlement ? <SettlementStatus status={r.settlement} /> : '') },
            { key: 'status', label: 'Status', width: '100px', render: (r) => <StatusMark kind={ST_DUE_MARK[r.status].kind} label={ST_DUE_MARK[r.status].word} size="body-4" /> },
            { key: 'action', label: '', width: '130px', align: 'right', render: () => <Button variant="outline" size="xsmall">Run statement</Button> },
          ]} />
        </Card>
      ) : <Card><EmptyState title="No statements due to display." /></Card>}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Settlement proposal and confirmation (n) */

const ST_PROPOSAL_STATUS = {
  Proposal: 'draft', 'Net less': 'draft', 'Net less with a reason': 'draft', 'Netted less': 'draft', Submitting: 'draft', Incomplete: 'draft', 'Out of date': 'draft', 'Nothing to net': 'draft',
  'Pending approval': 'pending', 'Approver view': 'pending', Approved: 'approved', 'Record payment': 'approved', 'Recording payment': 'approved', Paid: 'paid', Reverse: 'paid', Reversed: 'reversed', 'Settlement statement': 'paid',
};

export function SettlementProposal({ state = 'Proposal', onOpen }) {
  const sheet = useStSheet();
  const p = ST_PROPOSAL;
  if (state === 'Loading') return <Sections><HmHead title={p.id} /><StLoading cards={3} /></Sections>;
  if (state === 'Without the farmer account tier') {
    return (
      <Sections>
        <HmHead title={p.id} />
        <RecordHighlights kind="Settlement proposal" title={p.id} tabs={[]} status={<SettlementStatus status="pending" size="body-3" />}
          fields={[{ label: 'Farmer', value: p.farmer }, { label: 'Contract', value: p.contract }, { label: 'Payment due', value: p.due }, { label: 'Grain payable', value: <Restricted /> }, { label: 'Net to pay the farmer', value: <Restricted /> }]} />
      </Sections>
    );
  }
  const status = ST_PROPOSAL_STATUS[state];
  const draft = status === 'draft';
  const noRate = state === 'Incomplete';
  const stale = state === 'Out of date';
  const nothing = state === 'Nothing to net';
  const partial = ['Netted less', 'Submitting', 'Pending approval', 'Approver view', 'Approved', 'Record payment', 'Recording payment', 'Paid', 'Reverse', 'Reversed', 'Settlement statement'].includes(state) ? p.partial : undefined;
  const owed = nothing ? [] : ST_OWED;
  const n = nettingOf({ payable: ST_PAYABLE, owed, partial });
  const blocked = noRate || stale;
  const tab = state === 'Settlement statement' ? 'Statement' : 'Details';
  const actions = state === 'Approver view'
    ? <><Button variant="outline" size="small">Reject</Button><Button size="small">Approve</Button></>
    : draft ? <>
      <Button variant="outline" size="small" disabled={blocked || nothing || state === 'Submitting'}>{NETTING_WORDS.partial}</Button>
      <Button size="small" loading={state === 'Submitting'} disabled={blocked}>Submit for approval</Button>
    </> : status === 'approved' ? <Button size="small" loading={state === 'Recording payment'}>Record payment</Button>
    : status === 'paid' ? <><Button variant="outline" size="small">Reverse</Button><Button variant="outline" size="small" icon="download">Download</Button></> : null;
  return (
    <Sections>
      <HmHead title={p.id} />
      {state === 'Paid' ? <Banner tone="success">Payment recorded. The farmer was paid by bank transfer outside One Link.</Banner> : null}
      {state === 'Reversed' ? <Banner tone="info">Reversed by STL-0142-R on 28 Sep 2026: Net paid twice; the second transfer is being returned. The debts it netted are owed again.</Banner> : null}
      {noRate ? <ConditionBanner>{`Incomplete: no exchange rate for ${p.rateDate}. A settlement uses the day's rate, never an earlier one.`}</ConditionBanner> : null}
      {stale ? <ConditionBanner action={<Button variant="outline" size="small">Refresh</Button>}>Out of date: GRN10000422 was received after this proposal was built.</ConditionBanner> : null}
      {noRate ? <Refusal action="Submit for approval" reason={`The exchange rate for ${p.rateDate} is not entered`} /> : null}
      {stale ? <Refusal action="Submit for approval" reason="The proposal is out of date; refresh it first" /> : null}
      <RecordHighlights kind="Settlement proposal" title={p.id} status={<SettlementStatus status={status} size="body-3" />} actions={actions}
        tabs={['Details', 'Statement', 'History']} tab={tab} onTab={() => {}}
        fields={[
          { label: 'Farmer', value: p.farmer, link: '#' },
          { label: 'Contract', value: p.contract, link: '#' },
          { label: 'Payment due', value: `${p.due}, ${p.terms}` },
          { label: 'Exchange rate', value: noRate ? <NotSet owner="Finance" /> : p.rate },
          { label: 'Rate date', value: p.rateDate },
          { label: 'Built', value: p.built },
          ...(status === 'pending' ? [{ label: 'Waiting for', value: p.approver }] : []),
          ...(partial ? [{ label: 'Reason for netting less', value: p.partialReason }] : []),
        ]} />
      {tab === 'Statement' ? (
        <MoneyDocument kind="settlement-statement" counterparty={`${p.farmer}, ${p.contract}`} reference={p.id} generated="27 Sep 2026, 14:30 CAT"
          fields={[['Period', '01 Aug 2026 to 30 Sep 2026'], ['Currency', 'USD'], ['Exchange rate', `${p.rate}, ${p.rateDate}`]]}
          rows={[
            ...ST_PAYABLE.map((l) => ({ id: l.id, what: l.what, weight: l.weight, rate: l.rate, to: l.amount, by: '' })),
            ...n.lines.map((l) => ({ id: l.id, what: `${l.what}, netted ${l.recovered}`, weight: '', rate: '', to: '', by: l.amount })),
            { id: 'off', what: 'Offset against grain', weight: '', rate: '', to: `(${n.offset})`, by: `(${n.offset})` },
            { id: 'pay', what: `Paid by bank transfer, ${p.rate} on ${p.rateDate}`, weight: '', rate: '', to: `(${n.net})`, by: '' },
            { id: 'total', total: true, what: 'Balance', weight: '', rate: '', to: '0.00', by: n.stillOwed },
          ]}
          columns={[
            { key: 'what', label: 'What', width: 'minmax(220px, 1fr)', wrap: true }, { key: 'weight', label: 'Weight (t)', width: '90px', align: 'right' },
            { key: 'rate', label: 'Rate (USD per t)', width: '120px', align: 'right' }, { key: 'to', label: 'Owed to farmer (USD)', width: '150px', align: 'right' },
            { key: 'by', label: 'Owed by farmer (USD)', width: '150px', align: 'right' },
          ]} />
      ) : <>
        {nothing ? <Banner tone="info">Nothing to net: the farmer owes nothing on this account. The whole grain payable is the net.</Banner> : null}
        <NettingSides payable={ST_PAYABLE} owed={owed} partial={partial} />
        {status === 'paid' || status === 'reversed' ? (
          <Card title="Payment" padding={16}>
            <HmFacts min={150} fields={[['Paid on', p.due], ['Amount', `USD ${n.net}`], ['Paid in', 'ZMW 274,760.00'], ['Exchange rate', `${p.rate}, ${p.rateDate}`], ['Reference', 'Lakeview transfer 0433'], ['Recorded by', 'N. Phiri']]} />
          </Card>
        ) : null}
      </>}
      {state === 'Net less' || state === 'Net less with a reason' ? (
        <PartialNettingDialog full={n.full} sheet={sheet} defaultOffset={state === 'Net less with a reason' ? p.partial : ''} defaultReason={state === 'Net less with a reason' ? p.partialReason : ''} />
      ) : null}
      {state === 'Record payment' || state === 'Recording payment' ? (
        <Dialog open title={`Record payment, ${p.id}`} width={480} sheet={sheet} footer={<><Button variant="ghost" size="small" disabled={state === 'Recording payment'}>Cancel</Button><Button size="small" loading={state === 'Recording payment'}>Record payment</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <HmFacts min={140} fields={[['Net to pay the farmer', `USD ${n.net}`], ['Exchange rate', `${p.rate}, ${p.rateDate}`]]} />
            <Field label="Date paid" required><Input defaultValue={p.rateDate} disabled={state === 'Recording payment'} /></Field>
            <Field label="Amount (ZMW)" required><Input align="right" inputMode="decimal" defaultValue="274,760.00" disabled={state === 'Recording payment'} /></Field>
            <Field label="Reference" required><Input defaultValue="Lakeview transfer 0433" disabled={state === 'Recording payment'} /></Field>
          </div>
        </Dialog>
      ) : null}
      {state === 'Reverse' ? (
        <ReasonDialog title={`Reverse ${p.id}`} confirmLabel="Reverse" confirmVariant="critical" sheet={sheet}>
          A compensating entry reverses the settlement and its payment record. The debts it netted are owed again. Both stay visible.
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Settlement batches (t) */

/** A settlement batch is the day's proposals built together (S57: Settlement batch, never Settlement run). Statuses are
    the approval set and Paid. A batch without the day's exchange rate is incomplete; one built before a delivery or
    debt changed is out of date; a farmer with no debt has nothing to net; a day with no grain payable has nothing to
    settle. */
export const ST_BATCHES = [
  { id: 'STB-0032', built: '30 Sep 2026, 06:00', farmers: '3', grain: '47,341.20', offset: '23,760.00', net: '23,581.20', rate: '', rateDate: '30 Sep 2026', status: 'draft', waiting: '', condition: 'incomplete' },
  { id: 'STB-0031', built: '27 Sep 2026, 06:00', farmers: '2', grain: '39,590.80', offset: '19,570.00', net: '20,020.80', rate: 'ZMW 25.00 per USD', rateDate: '27 Sep 2026', status: 'pending', waiting: 'T. Mwila', condition: '' },
  { id: 'STB-0030', built: '24 Sep 2026, 06:00', farmers: '4', grain: '52,118.00', offset: '30,240.00', net: '21,878.00', rate: 'ZMW 24.98 per USD', rateDate: '24 Sep 2026', status: 'approved', waiting: '', condition: '' },
  { id: 'STB-0029', built: '20 Sep 2026, 06:00', farmers: '2', grain: '18,900.00', offset: '6,150.00', net: '12,750.00', rate: 'ZMW 25.10 per USD', rateDate: '20 Sep 2026', status: 'rejected', waiting: '', condition: '' },
  { id: 'STB-0028', built: '13 Sep 2026, 06:00', farmers: '3', grain: '33,404.10', offset: '14,820.00', net: '18,584.10', rate: 'ZMW 25.05 per USD', rateDate: '13 Sep 2026', status: 'paid', waiting: '', condition: '' },
];
const ST_BATCH_PROPOSALS = [
  { id: 'STL-0142', farmer: 'Lakeview Farms Ltd', grain: '30,560.40', offset: '19,570.00', net: '10,990.40', note: '' },
  { id: 'STL-0143', farmer: 'Cameron Estates', grain: '9,030.40', offset: '0.00', net: '9,030.40', note: 'Nothing to net' },
];

export function SettlementBatches({ state = 'Batches', onOpen }) {
  const head = <HmHead title="Settlement batches" count={state === 'Loading' || state === 'Nothing to settle' ? (state === 'Nothing to settle' ? 0 : undefined) : ST_BATCHES.length} meta={<HmRefreshed time="30 Sep 2026, 06:02 CAT" />} />;
  const bar = <StListBar view="All batches" filters={<Capsule chevron>Status: All</Capsule>} search="Search batches" />;
  if (state === 'Loading') return <Sections>{head}{bar}<StLoading cards={1} /></Sections>;
  if (state === 'Nothing to settle') return <Sections>{head}{bar}<Card><EmptyState icon="circle-check" title="No settlement batches to display." /></Card><Text variant="body-4" tone="secondary">Nothing to settle: no grain payable is due on 30 Sep 2026.</Text></Sections>;
  const openId = state === 'Batches' || state === 'Error' ? null : state === 'Incomplete' ? 'STB-0032' : 'STB-0031';
  const rows = ST_BATCHES.map((b) => (state === 'Out of date' && b.id === 'STB-0031' ? { ...b, status: 'draft', waiting: '', condition: 'stale' } : b));
  const conditionText = (b) => (b.condition === 'incomplete' ? `Incomplete: no exchange rate for ${b.rateDate}` : b.condition === 'stale' ? 'Out of date: GRN10000422 received after it was built' : '');
  return (
    <Sections>
      {head}
      {state === 'Error' ? <StError action="Loading the settlement batches" /> : null}
      {state === 'Incomplete' ? <ConditionBanner>STB-0032 is incomplete: no exchange rate for 30 Sep 2026. It cannot be submitted until the day's rate is entered.</ConditionBanner> : null}
      {state === 'Out of date' ? <ConditionBanner action={<Button variant="outline" size="small">Refresh</Button>}>STB-0031 is out of date: GRN10000422 was received after it was built.</ConditionBanner> : null}
      {bar}
      <Card padding={4}>
        <HmTable rows={rows} expanded={openId ? [openId] : undefined} expandLabel={(r) => `Show the proposals, ${r.id}`}
          expand={(r) => (r.id === openId ? (
            <div style={{ padding: '8px 16px 12px' }}>
              <HmTable rows={state === 'Nothing to net' ? ST_BATCH_PROPOSALS : ST_BATCH_PROPOSALS.slice(0, 1).concat(state === 'Incomplete' ? [] : ST_BATCH_PROPOSALS.slice(1))} columns={[
                { key: 'id', label: 'Proposal', width: '100px', render: (x) => <HmLink onOpen={() => onOpen && onOpen('proposal')}>{x.id}</HmLink> },
                { key: 'farmer', label: 'Farmer', width: 'minmax(150px, 1fr)', wrap: true },
                { key: 'grain', label: 'Grain payable (USD)', width: '150px', align: 'right' },
                { key: 'offset', label: 'Offset (USD)', width: '110px', align: 'right' },
                { key: 'net', label: 'Net to pay (USD)', width: '130px', align: 'right' },
                { key: 'note', label: '', width: '130px', render: (x) => (x.note ? <StatusMark kind="neutral" label={x.note} size="body-4" /> : '') },
              ]} />
            </div>
          ) : null)}
          columns={[
            { key: 'id', label: 'Batch', width: '100px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
            { key: 'built', label: 'Built (CAT)', width: '160px', tabular: true },
            { key: 'farmers', label: 'Farmers', width: '76px', align: 'right' },
            { key: 'grain', label: 'Grain payable (USD)', width: '150px', align: 'right' },
            { key: 'offset', label: 'Offset (USD)', width: '110px', align: 'right' },
            { key: 'net', label: 'Net to pay (USD)', width: '130px', align: 'right' },
            { key: 'rate', label: 'Exchange rate', width: '170px', wrap: true, render: (r) => (r.rate ? `${r.rate}, ${r.rateDate}` : <NotSet size="body-4" owner="Finance" />) },
            { key: 'status', label: 'Status', width: 'minmax(170px, 1fr)', wrap: true, render: (r) => <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><SettlementStatus status={r.status} />{conditionText(r) ? <Text variant="body-4" tone="secondary">{conditionText(r)}</Text> : null}</span> },
            { key: 'waiting', label: 'Waiting for', width: '110px' },
          ]} />
      </Card>
    </Sections>
  );
}
