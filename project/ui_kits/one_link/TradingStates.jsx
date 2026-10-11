/** The M6 states of the existing kit screens (M6.DS.01, UAG-82), added beside their states and changing none of them
    (Henry, 30 Sep 2026: new work adds to the design and never deletes): the trade board's statuses, the trade
    approval record (S08 J4, canvas S09 "Trade SYN4810, pending approval" and its Reject dialog) with a deputy's
    decision and the authority snapshot, a grading dispute's re-test, a goods received note that failed quality and its
    three routes, and stock by stack, bay and silo across own and third-party sites. TradeBoard, Approval,
    GradingDispute, GRNFinalise and StockBoard hand one of these states to the functions here; any other state draws
    exactly as it always has. The trade record is shared with the Trading workspace kit (../trading_workspace).

    Words are the map's (S57, UX-32): a trade or contract is Draft, Pending approval, Approved, Active or Closed; an
    amendment waiting for a decision is a Pending approval item on the trade, and a suggested close is an exception on
    it, never a status. Money carries its code before the amount, two decimals on a record (UX-11); a gate purchase is
    priced in kwacha per tonne and rolled up in US dollars with the exchange rate and its date (Map D-38, D-16, D-40).
    A Clerk, Warehouse or stock control layout carries no price, value or margin: a shared field is the Restricted lock,
    otherwise it is left out (UX-09, UX-10). Fictional sample data on the golden fixture names. */

export const M6_STATES = {
  TradeBoard: ['Trades by status', 'Amendment pending approval', 'Close suggested', 'Closed with balance', 'Gate purchase'],
  Approval: ['Pending approval', 'Approving', 'Reject', 'Rejecting', 'Approved', 'Deputy decision', "Requester's view", 'History'],
  GradingDispute: ['Re-test recorded', 'Deciding', 'Decided'],
  GRNFinalise: ['Failed quality', 'Saving route', 'Held for drying', 'Awaiting diversion', 'Rejected and returned'],
  StockBoard: ['By storage unit', 'Third-party sites', 'Owned by others'],
};

/* ------------------------------------------------------------------ Shared words and data */

export const TW_RATE = 'ZMW 25.00 per USD';
export const TW_RATE_DATE = '26 Sep 2026';
export const TW_AS_OF = '26 Sep 2026, 07:02 CAT';

/** A trade's or contract's status (UX-14, UX-32): one icon and tone per word. */
export const TW_STATUS = {
  draft: { kind: 'neutral', label: 'Draft' },
  pending: { kind: 'pending', label: 'Pending approval' },
  approved: { kind: 'clean', label: 'Approved' },
  active: { kind: 'clean', label: 'Active' },
  closed: { kind: 'within', label: 'Closed' },
  rejected: { kind: 'breach', label: 'Rejected' },
  submitted: { kind: 'clean', label: 'Submitted' },
};
export function TwStatus({ status, size = 'body-4' }) {
  const s = TW_STATUS[status] || TW_STATUS.draft;
  return <StatusMark kind={s.kind} label={s.label} size={size} />;
}

/** A bold Total cell (UX-26). */
export const twStrong = (r, v) => (r.total ? <Text variant="body-3" strong tabular>{v}</Text> : v);

/** Trade SYN4810 as Owen's canvas draws it (S09 "Trade SYN4810, pending approval"), on the golden fixture: margin is
    sale less purchase less transport per leg, at the rates frozen when it was submitted. */
export const TW_SYN4810 = {
  id: 'SYN4810', type: 'Back-to-back', counterparty: 'Riverbend Milling', commodity: 'Maize', marker: 'maize', grade: 'White maize', quantity: '1,500',
  window: 'Jun 2027 to Aug 2027', location: 'Riverbend Mill Kitwe intake', basis: 'Delivered', price: '272.00', margin: '17,920.00', marginPerT: '11.95',
  owner: 'J. Tembo', submitted: '25 Sep 2026, 16:40', ratesAsOf: '25 Sep 2026',
  legs: [
    { id: 'A', ref: 'SYN4810-A', supplier: 'Lakeview Farms Ltd', pickup: 'Mkushi', basis: 'Collected', quantity: '700', price: '246.40', transport: '13.65', perT: '11.95', margin: '8,365.00' },
    { id: 'B', ref: 'SYN4810-B', supplier: 'Cameron Estates', pickup: 'Chisamba', basis: 'Collected', quantity: '500', price: '245.00', transport: '15.60', perT: '11.40', margin: '5,700.00' },
    { id: 'C', ref: 'SYN4810-C', supplier: 'Mpongwe Valley Farms', pickup: 'Mpongwe', basis: 'Collected', quantity: '300', price: '250.00', transport: '9.15', perT: '12.85', margin: '3,855.00' },
  ],
};
export const TW_LEG_TOTAL = { id: 'total', total: true, supplier: 'Total', quantity: '1,500', margin: '17,920.00' };

/** The trade approval decision (S08 J4): Reject with a comment, or Approve. Data, as every decision is. */
export const TW_TRADE_OUTCOMES = [
  { value: 'reject', label: 'Reject', variant: 'critical', comment: true },
  { value: 'approve', label: 'Approve', variant: 'primary' },
];

/** The trade approval step (R-01, R-02): Managing Director, then Trading, then Finance, never the requester. */
export const TW_APPROVAL_STEPS = {
  pending: [
    { id: 's1', step: 'Submitted', who: 'J. Tembo', status: 'submitted', date: '25 Sep 2026, 16:40', comment: '' },
    { id: 's2', step: 'Managing Director approval', who: 'T. Mwila', status: 'pending', date: '', comment: '' },
  ],
  approved: [
    { id: 's1', step: 'Submitted', who: 'J. Tembo', status: 'submitted', date: '25 Sep 2026, 16:40', comment: '' },
    { id: 's2', step: 'Managing Director approval', who: 'T. Mwila', status: 'approved', date: '26 Sep 2026, 07:20', comment: '' },
  ],
  deputy: [
    { id: 's1', step: 'Submitted', who: 'J. Tembo', status: 'submitted', date: '25 Sep 2026, 16:40', comment: '' },
    { id: 's2', step: 'Managing Director approval', who: 'T. Mwila', status: 'pending', date: '', comment: 'No decision after 24 h; passed to the next deputy' },
    { id: 's3', step: 'Deputy, Finance', who: 'N. Phiri', status: 'approved', date: '26 Sep 2026, 17:05', comment: 'Trading skipped: J. Tembo submitted this trade' },
  ],
  rejected: [
    { id: 's1', step: 'Submitted', who: 'J. Tembo', status: 'submitted', date: '25 Sep 2026, 16:40', comment: '' },
    { id: 's2', step: 'Managing Director approval', who: 'T. Mwila', status: 'rejected', date: '26 Sep 2026, 07:24', comment: 'Margin per t is below this season’s minimum for maize.' },
  ],
};

/** The authority snapshot (C2-6): written once at the decision and never edited, so it shows what the decider held
    then, not now. */
export const TW_SNAPSHOT = {
  approver: [['Decided by', 'T. Mwila'], ['Acting as', 'Approver'], ['On behalf of', ''], ['Bundles', 'Managing Director'], ['Price tiers', 'Gate, Contract, Sell, Farmer account'],
    ['Approval step', 'Trade, version 3'], ['Trade version', '2, submitted 25 Sep 2026, 16:40'], ['Decided', '26 Sep 2026, 07:20 CAT']],
  deputy: [['Decided by', 'N. Phiri'], ['Acting as', 'Deputy'], ['On behalf of', 'Managing Director'], ['Basis', 'After 24 h without a decision, requester excluded'], ['Bundles', 'Finance, Administrator'],
    ['Price tiers', 'Gate, Contract, Sell, Farmer account'], ['Approval step', 'Trade, version 3'], ['Trade version', '2, submitted 25 Sep 2026, 16:40'], ['Decided', '26 Sep 2026, 17:05 CAT']],
};

/** A trade's history (UX-28): the decision with the person, the role they acted in and the time. */
export const TW_TRADE_HISTORY = [
  { id: 'h3', field: 'Status', user: 'T. Mwila', role: 'Managing Director', old: 'Pending approval', next: 'Approved', date: '26 Sep 2026, 07:20', note: 'Approved as approver' },
  { id: 'h2', field: 'Status', user: 'J. Tembo', role: 'Trading', old: 'Draft', next: 'Pending approval', date: '25 Sep 2026, 16:40', note: 'Submitted for approval' },
  { id: 'h1', field: 'Trade', user: 'J. Tembo', role: 'Trading', old: '', next: 'Created', date: '03 Sep 2026, 10:12', note: 'Source: Teams, 03 Sep 2026' },
];

/** The purchase legs of a trade with the bold Total row (canvas S09): leg, supplier, pickup district, basis, quantity;
    with the contract tier also the price, the transport rate, and the margin per tonne and per leg. */
export function TwLegsTable({ trade = TW_SYN4810, tier = true, onMargin, onOpen }) {
  const rows = [...trade.legs, TW_LEG_TOTAL];
  return (
    <HmTable rows={rows} columns={[
      { key: 'id', label: 'Leg', width: '64px', render: (r) => (r.total ? <Text variant="body-3" strong>Total</Text> : r.id) },
      { key: 'supplier', label: 'Supplier', width: 'minmax(160px, 1fr)', wrap: true, render: (r) => (r.total ? '' : <HmLink onOpen={() => onOpen && onOpen(r.supplier)}>{r.supplier}</HmLink>) },
      { key: 'pickup', label: 'Pickup district', width: '120px' },
      { key: 'basis', label: 'Basis', width: '100px' },
      { key: 'quantity', label: 'Quantity (t)', width: '104px', align: 'right', render: (r) => twStrong(r, r.quantity) },
      ...(tier ? [
        { key: 'price', label: 'Price (USD per t)', width: '128px', align: 'right' },
        { key: 'transport', label: 'Transport (USD per t)', width: '150px', align: 'right' },
        { key: 'perT', label: 'Margin (USD per t)', width: '140px', align: 'right', render: (r) => (r.total ? '' : <MarginCell value={r.perT} size="body-3" />) },
        { key: 'margin', label: 'Margin (USD)', width: '124px', align: 'right', render: (r) => (r.total ? <Text variant="body-3" strong tabular>{r.margin}</Text> : <MarginCell value={r.margin} onOpen={onMargin ? () => onMargin(r) : undefined} />) },
      ] : []),
    ]} />
  );
}

/** Calculation details for a trade's margin (UX-18): each leg as a row, the total, and the rates it was frozen at. */
export function twMarginCalc(trade = TW_SYN4810) {
  return {
    name: `Margin, ${trade.id}`, value: `USD ${trade.margin}`,
    components: trade.legs.map((l) => ({ label: `Leg ${l.id}, ${l.supplier}: (${trade.price} less ${l.price} less ${l.transport}) × ${l.quantity} t`, value: l.margin })),
    total: { label: 'Margin (USD)', value: trade.margin },
    basis: [{ label: 'Rates as of', value: trade.ratesAsOf }, { label: 'Exchange rate', value: TW_RATE }, { label: 'Frozen at', value: `Submission, ${trade.submitted} CAT` }],
  };
}

/* ------------------------------------------------------------------ The trade record (UX-19), Owen's approval record */

/** Trade SYN4810's record as Owen's canvas draws it (S09, AC 10): the highlights panel with Counterparty, Commodity,
    Quantity, Margin, Owner and Submitted, and Waiting for while it is pending; Details with Trade information (Rates as
    of and Exchange rate, the margin at the rates frozen at submission), Purchase legs with a Total row and Approval
    history; Approve the primary button and Reject red on an outline, Reject asking "Reject trade SYN4810?" with a
    comment before it is enabled. A deputy's decision reads Approved by and On behalf of; the requester never sees
    Approve. `viewer` is 'md' (the decider), 'deputy' (Finance after escalation), 'requester' (J. Tembo) or 'no-tier'
    (a viewer without the contract tier: the margin is the Restricted lock and the price columns are left out). */
export function TwTradeApproval({ state = 'Pending approval', onOpen }) {
  const narrow = !useMinWidth(768);
  const initial = state === 'History' ? 'History' : 'Details';
  const [tab, setTab] = useState(initial);
  const [calc, setCalc] = useState(false);
  useEffect(() => setTab(initial), [state]);
  const t = TW_SYN4810;
  const deputy = state === 'Deputy decision';
  const approved = state === 'Approved' || state === 'History' || deputy;
  const requester = state === "Requester's view";
  const busy = state === 'Approving' ? 'approve' : state === 'Rejecting' ? 'reject' : null;
  const status = approved ? 'approved' : 'pending';
  const steps = deputy ? TW_APPROVAL_STEPS.deputy : approved ? TW_APPROVAL_STEPS.approved : TW_APPROVAL_STEPS.pending;
  const fields = [
    { label: 'Counterparty', value: t.counterparty, link: '#' },
    { label: 'Commodity', value: <CommodityMarker commodity={t.marker}>{t.commodity}</CommodityMarker> },
    { label: 'Quantity', value: `${t.quantity} t` },
    { label: 'Margin', value: <MarginCell value={t.margin} currency="USD" onOpen={() => setCalc(true)} /> },
    { label: 'Owner', value: t.owner },
    { label: 'Submitted', value: t.submitted },
    ...(approved ? [{ label: 'Approved by', value: deputy ? 'N. Phiri' : 'T. Mwila' }, ...(deputy ? [{ label: 'On behalf of', value: 'Managing Director' }] : [])]
      : [{ label: 'Waiting for', value: 'T. Mwila' }]),
  ];
  const actions = approved || requester ? null : <DecisionActions outcomes={TW_TRADE_OUTCOMES} busy={busy} />;
  return (
    <Sections>
      <HmHead title={t.id} />
      <RecordHighlights kind="Trade" title={t.id} status={<TwStatus status={status} />} actions={actions} fields={fields} tab={tab} onTab={setTab} />
      {tab === 'History' ? (
        <HmCard title="History" count={TW_TRADE_HISTORY.length} objects="changes">
          <HmTable rows={TW_TRADE_HISTORY} columns={[
            { key: 'field', label: 'Field', width: '90px' }, { key: 'user', label: 'User', width: '100px' }, { key: 'role', label: 'Role', width: '150px' },
            { key: 'old', label: 'Old value', width: '140px' }, { key: 'next', label: 'New value', width: '140px' },
            { key: 'date', label: 'Date (CAT)', width: '150px', tabular: true }, { key: 'note', label: 'Note', width: 'minmax(170px, 1fr)', wrap: true },
          ]} />
        </HmCard>
      ) : tab === 'Related' ? (
        <HmCard title="Purchase legs" count={t.legs.length} objects="purchase legs"><TwLegsTable trade={t} onOpen={onOpen} /></HmCard>
      ) : (
        <>
          <Card title="Trade information" padding={16}>
            <HmFacts fields={[['Trade number', t.id], ['Type', t.type], ['Buyer', t.counterparty], ['Commodity', t.commodity], ['Grade', t.grade], ['Quantity', `${t.quantity} t`],
              ['Delivery window', t.window], ['Delivery location', t.location], ['Sale price', `USD ${t.price} per t`], ['Margin', <MarginCell value={t.margin} currency="USD" onOpen={() => setCalc(true)} />],
              ['Margin per t', <MarginCell value={t.marginPerT} currency="USD" />], ['Rates as of', t.ratesAsOf], ['Exchange rate', TW_RATE], ['Basis', t.basis]]} />
          </Card>
          <HmCard title="Purchase legs" count={t.legs.length} objects="purchase legs"><TwLegsTable trade={t} onMargin={() => setCalc(true)} onOpen={onOpen} /></HmCard>
          <HmCard title="Approval history" count={steps.length} objects="steps">
            <HmTable rows={steps} columns={[
              { key: 'step', label: 'Step', width: 'minmax(170px, 1fr)', wrap: true }, { key: 'who', label: 'Assigned to', width: '120px' },
              { key: 'status', label: 'Status', width: '160px', render: (r) => <TwStatus status={r.status} /> },
              { key: 'date', label: 'Date (CAT)', width: '150px', tabular: true }, { key: 'comment', label: 'Comment', width: 'minmax(180px, 1fr)', wrap: true },
            ]} />
          </HmCard>
          {approved ? (
            <Card title="Authority snapshot" padding={16}>
              <HmFacts fields={deputy ? TW_SNAPSHOT.deputy : TW_SNAPSHOT.approver} />
            </Card>
          ) : null}
        </>
      )}
      {state === 'Reject' || state === 'Rejecting' ? (
        <ReasonDialog title={`Reject trade ${t.id}?`} label="Comment" minLength={1} confirmLabel="Reject" confirmVariant="critical" busy={state === 'Rejecting'} sheet={narrow}
          defaultReason={state === 'Rejecting' ? TW_APPROVAL_STEPS.rejected[1].comment : ''}>
          {`${t.counterparty}, ${t.commodity.toLowerCase()}, ${t.quantity} t, submitted by ${t.owner}. The trade goes back to ${t.owner} with your comment.`}
        </ReasonDialog>
      ) : null}
      {calc ? (() => { const c = twMarginCalc(t); return <CalculationDetails open onClose={() => setCalc(false)} name={c.name} value={c.value} components={c.components} total={c.total} basis={c.basis} />; })() : null}
    </Sections>
  );
}

/** Approval's M6 states (S08 J4, M6.TRD.03): Owen's approval record for trade SYN4810. */
export function ApprovalM6({ state, onOpen }) {
  return <TwTradeApproval state={state} onOpen={onOpen} />;
}

/* ------------------------------------------------------------------ Trade board (TradeBoard's M6 states) */

/** The trades on Trading's board, one row each, Status last (UX-07). An amendment waiting for a decision is a Pending
    approval item on its trade and a suggested close an exception on it: the trade's own status does not change. */
export const TW_TRADES = [
  { id: 'SYN4813', type: 'Back-to-back', cp: 'Riverbend Milling', commodity: 'Wheat', marker: 'wheat', quantity: '900', delivered: '0', margin: '', owner: 'J. Tembo', status: 'draft' },
  { id: 'SYN4810', type: 'Back-to-back', cp: 'Riverbend Milling', commodity: 'Maize', marker: 'maize', quantity: '1,500', delivered: '0', margin: '17,920.00', owner: 'J. Tembo', status: 'pending' },
  { id: 'SYN4815', type: 'Back-to-back', cp: 'Kafue Valley Milling', commodity: 'Soya', marker: 'soya', quantity: '600', delivered: '0', margin: '-1,440.00', owner: 'J. Tembo', status: 'approved' },
  { id: 'SYN4702', type: 'Back-to-back', cp: 'Riverbend Milling', commodity: 'Wheat', marker: 'wheat', quantity: '5,000', delivered: '4,200', margin: '61,200.00', owner: 'J. Tembo', status: 'active', amendment: 'SYN4702-A price from USD 250.00 to USD 256.00 per t, from 01 Nov 2026' },
  { id: 'SYN4790', type: 'Back-to-back', cp: 'Riverbend Milling', commodity: 'Wheat', marker: 'wheat', quantity: '1,200', delivered: '1,196', margin: '14,280.00', owner: 'J. Tembo', status: 'active', closeSuggested: true },
  { id: 'SYN4822', type: 'Gate purchase', cp: 'Chongwe Growers Ltd', commodity: 'Maize', marker: 'maize', quantity: '31', delivered: '31', margin: '', owner: 'R. Daka', status: 'active', gate: true },
  { id: 'SYN4798', type: 'Back-to-back', cp: 'Kafue Valley Milling', commodity: 'Maize', marker: 'maize', quantity: '1,000', delivered: '962', margin: '9,620.00', owner: 'J. Tembo', status: 'closed', remaining: '38' },
];

/** What the closed trade SYN4798 recorded when it was closed with a balance (M6.TRD.01 AC 7). */
export const TW_CLOSED_LEGS = [
  { id: 'A', ref: 'SYN4798-A', supplier: 'Chongwe Growers Ltd', contracted: '600', delivered: '600', remaining: '0' },
  { id: 'B', ref: 'SYN4798-B', supplier: 'Mpongwe Valley Farms', contracted: '400', delivered: '362', remaining: '38' },
  { id: 'total', total: true, supplier: 'Total', contracted: '1,000', delivered: '962', remaining: '38' },
];

/** The gate purchase on a trading screen (Map D-38, D-16, D-40, RL-GATE-TRADE): the gate price in kwacha per tonne;
    the value rolled up in US dollars at the exchange rate in force, with its date. */
export const TW_GATE = [
  { id: 'SYN4822', type: 'Gate purchase', grn: 'GRN10000391', farmer: 'Chongwe Growers Ltd', commodity: 'Maize', marker: 'maize', site: 'Chisamba Shed', received: '31.420', gate: '4,300.00', zmw: '135,106.00', usd: '5,404.24' },
];

function TwClosedFacts() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 16px 16px' }}>
      <HmFacts fields={[['Closed', '24 Sep 2026, 15:10'], ['Closed by', 'J. Tembo'], ['Reason', 'Mpongwe Valley Farms cannot supply the last 38 t this season'], ['Remaining balance', '38 t']]} />
      <HmTable rows={TW_CLOSED_LEGS} columns={[
        { key: 'ref', label: 'Leg', width: '110px', render: (r) => (r.total ? <Text variant="body-3" strong>Total</Text> : <HmLink>{r.ref}</HmLink>) },
        { key: 'supplier', label: 'Supplier', width: 'minmax(160px, 1fr)', render: (r) => (r.total ? '' : r.supplier) },
        { key: 'contracted', label: 'Contracted (t)', width: '120px', align: 'right', render: (r) => twStrong(r, r.contracted) },
        { key: 'delivered', label: 'Delivered (t)', width: '110px', align: 'right', render: (r) => twStrong(r, r.delivered) },
        { key: 'remaining', label: 'Remaining (t)', width: '120px', align: 'right', render: (r) => twStrong(r, r.remaining) },
      ]} />
    </div>
  );
}

/** TradeBoard's M6 states: Trading's trades in the list view layout (UX-07), with Items to approve and Exceptions beside
    them, a closed trade's Remaining balance under its row, and gate purchases valued as the map rules. */
export function TradeBoardM6({ state, onOpen }) {
  const gateView = state === 'Gate purchase';
  const rows = gateView ? TW_TRADES.filter((r) => r.gate) : state === 'Closed with balance' ? TW_TRADES.filter((r) => r.status === 'closed') : TW_TRADES;
  const approvals = [{ id: 'am1', item: 'Amendment, SYN4702', summary: TW_TRADES[3].amendment }, { id: 'ap1', item: 'Trade SYN4810', summary: 'Riverbend Milling, maize, 1,500 t' }];
  const exceptions = [{ id: 'EXC-000211', business: 'Close suggested', businessRecord: 'SYN4790: every leg delivered within 1.0%', owner: 'J. Tembo' }];
  const rail = <>
    <HmCard title="Items to approve" count={approvals.length} objects="items">
      {approvals.map((r, i) => (
        <RailRow key={r.id} subject={<HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.item}</HmLink>} context={r.summary}
          right={<TwStatus status="pending" />} style={{ padding: '10px 16px', boxShadow: i ? 'inset 0 1px 0 var(--border-light)' : 'none', background: state === 'Amendment pending approval' && r.id === 'am1' ? 'var(--grouped-light)' : undefined }} />
      ))}
    </HmCard>
    <HmCard title="Exceptions" count={exceptions.length} objects="exceptions">
      {exceptions.map((r) => (
        <RailRow key={r.id} subject={<HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.business}</HmLink>} context={r.businessRecord}
          right={<span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}><ExceptionStatus status="open" /><Text variant="body-4" tone="secondary">{r.owner}</Text></span>}
          style={{ padding: '10px 16px', background: state === 'Close suggested' ? 'var(--grouped-light)' : undefined }} />
      ))}
    </HmCard>
  </>;
  const columns = gateView ? [
    { key: 'id', label: 'Trade', width: '100px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
    { key: 'type', label: 'Type', width: '120px' },
    { key: 'farmer', label: 'Farmer', width: 'minmax(160px, 1fr)', wrap: true },
    { key: 'commodity', label: 'Commodity', width: '110px', render: (r) => <CommodityMarker commodity={r.marker}>{r.commodity}</CommodityMarker> },
    { key: 'site', label: 'Site', width: '130px' },
    { key: 'received', label: 'Received (t)', width: '110px', align: 'right' },
    { key: 'gate', label: 'Gate price (ZMW per t)', width: '170px', align: 'right' },
    { key: 'usd', label: 'Value (USD)', width: '110px', align: 'right' },
    { key: 'status', label: 'Status', width: '110px', render: () => <TwStatus status="active" /> },
  ] : [
    { key: 'id', label: 'Trade', width: '100px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
    { key: 'type', label: 'Type', width: '120px' },
    { key: 'cp', label: 'Counterparty', width: 'minmax(160px, 1fr)', wrap: true },
    { key: 'commodity', label: 'Commodity', width: '110px', render: (r) => <CommodityMarker commodity={r.marker}>{r.commodity}</CommodityMarker> },
    { key: 'quantity', label: 'Quantity (t)', width: '104px', align: 'right' },
    { key: 'delivered', label: 'Delivered (t)', width: '110px', align: 'right' },
    { key: 'margin', label: 'Margin (USD)', width: '124px', align: 'right', render: (r) => (r.margin ? <MarginCell value={r.margin} /> : '') },
    { key: 'owner', label: 'Owner', width: '100px' },
    { key: 'status', label: 'Status', width: '160px', render: (r) => <TwStatus status={r.status} /> },
  ];
  const table = (
    <Card padding={4}>
      <HmTable rows={gateView ? TW_GATE : rows} columns={columns}
        expanded={state === 'Closed with balance' ? ['SYN4798'] : undefined} expandLabel={(r) => `Show the closing, ${r.id}`}
        expand={gateView ? undefined : (r) => (r.status === 'closed' ? <TwClosedFacts /> : null)} />
    </Card>
  );
  return (
    <Sections>
      <HmHead title="Trades" count={gateView ? TW_GATE.length : rows.length} meta={<HmRefreshed time={TW_AS_OF} />}
        right={<><Button variant="outline" size="small" icon="download">Export</Button><Button size="small">New</Button></>} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <ScrollRow><Capsule chevron selected>{gateView ? 'Gate purchases' : state === 'Closed with balance' ? 'Closed trades' : 'All trades'}</Capsule><Capsule chevron>Commodity</Capsule><Capsule chevron>Status</Capsule></ScrollRow>
        <SearchField placeholder="Search this list" hint={null} maxWidth={320} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>{rail}</div>
      {table}
      {gateView ? (
          <Card title="Gate purchase value" padding={16}>
            <HmFacts fields={[['Gate price', 'ZMW 4,300.00 per t'], ['Value', 'ZMW 135,106.00'], ['Value in US dollars', 'USD 5,404.24'], ['Exchange rate', TW_RATE], ['Rates as of', TW_RATE_DATE]]} />
          </Card>
        ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Goods received note: failed quality (GRNFinalise's M6 states) */

/** The three routes for a load that failed quality (M6.GRN.02): data, so the screen draws exactly these. */
export const TW_ROUTES = [
  { value: 'return', label: 'Return to farmer', hint: 'Nothing is booked; the contract balance is unchanged' },
  { value: 'dry', label: 'Dry on site', hint: 'Booked to a drying bay, owned by the farmer until it passes' },
  { value: 'divert', label: 'Divert', hint: 'Trading sells it to another buyer' },
];
const TW_GRN_STATUS = {
  failed: { kind: 'breach', label: 'Failed quality' },
  drying: { kind: 'pending', label: 'Held for drying' },
  diversion: { kind: 'pending', label: 'Awaiting diversion' },
  rejected: { kind: 'breach', label: 'Rejected' },
};
const TW_GRADING = [
  { id: 'q1', parameter: 'Moisture', reading: '18.2', limit: '12.5', reject: '17.0', result: 'Above reject limit' },
  { id: 'q2', parameter: 'Foreign matter', reading: '0.8', limit: '1.0', reject: '5.0', result: 'Within limit' },
];

/** GRNFinalise's M6 states: goods received note GRN10000402 for truck BAD 1187, failed quality, routed and never deleted.
    The Clerk's layout: tonnes and quality only, no price or value (UX-10). */
export function GRNFinaliseM6({ state }) {
  const key = state === 'Held for drying' ? 'drying' : state === 'Awaiting diversion' ? 'diversion' : state === 'Rejected and returned' ? 'rejected' : 'failed';
  const s = TW_GRN_STATUS[key];
  const routing = key === 'failed';
  const busy = state === 'Saving route';
  const fields = [
    { label: 'Supplier', value: 'Cameron Estates' }, { label: 'Contract leg', value: 'SYN4702-A' }, { label: 'Truck', value: 'BAD 1187' },
    { label: 'Ticket', value: 'WBT10001621', link: '#' }, { label: 'Net', value: '26.040 t' },
    ...(key === 'drying' ? [{ label: 'Held at', value: 'Mpongwe Depot, drying bay D1' }, { label: 'Owner', value: 'Cameron Estates' }] : []),
    ...(key === 'diversion' ? [{ label: 'Waiting for', value: 'J. Tembo' }] : []),
    ...(key === 'rejected' ? [{ label: 'Route', value: 'Return to farmer' }] : []),
  ];
  return (
    <Sections>
      <HmHead title="GRN10000402" />
      {routing ? <ConditionBanner>Failed quality: moisture 18.2% is above the reject limit of 17.0%. Choose a route for this load.</ConditionBanner> : null}
      <RecordHighlights kind="Goods received note" title="GRN10000402" status={<StatusMark kind={s.kind} label={s.label} size="body-4" />} tabs={[]} fields={fields}
        actions={routing ? <Button size="small" loading={busy}>Save</Button> : null} />
      {routing ? (
        <Card title="Route" padding={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <RadioList value={busy ? 'dry' : undefined} disabled={busy} options={TW_ROUTES} />
            <Field label="Reason" required><Input multiline disabled={busy} defaultValue={busy ? 'Farmer asked to dry it here and redeliver' : ''} /></Field>
          </div>
        </Card>
      ) : null}
      <HmCard title="Quality" count={TW_GRADING.length} objects="readings">
        <HmTable rows={TW_GRADING} columns={[
          { key: 'parameter', label: 'Parameter', width: 'minmax(140px, 1fr)' },
          { key: 'reading', label: 'Reading (%)', width: '110px', align: 'right' },
          { key: 'limit', label: 'Limit (%)', width: '100px', align: 'right' },
          { key: 'reject', label: 'Reject limit (%)', width: '130px', align: 'right' },
          { key: 'result', label: 'Result', width: '180px', render: (r) => <StatusMark kind={r.result === 'Within limit' ? 'within' : 'breach'} label={r.result} size="body-4" /> },
        ]} />
      </HmCard>
      <Card title="Goods received note information" padding={16}>
        <HmFacts fields={[['Site', key === 'drying' ? 'Mpongwe Depot' : 'Chisamba Shed'], ['Commodity', 'Wheat'], ['Assessor', 'P. Zulu'], ['Instrument', 'Moisture meter DJ-114'], ['Graded', '26 Sep 2026, 10:42'],
          ['Stock moved', key === 'drying' ? '26.040 t to drying bay D1, owned by Cameron Estates' : '0 t'],
          ['Counts in position', 'No'], ['Contract balance', key === 'drying' || key === 'rejected' || routing ? 'Unchanged' : 'Unchanged until the diversion completes']]} />
      </Card>
    </Sections>
  );
}

/* ------------------------------------------------------------------ Grading dispute: a re-test (GradingDispute's M6 states) */

const TW_RESULTS = [
  { id: 'r1', result: 'Result 1', moisture: '14.5', deduction: '0.4', deducted: '0.098', payable: '24.402', assessor: 'P. Zulu', instrument: 'Moisture meter DJ-114', taken: '24 Sep 2026, 09:15', mark: 'superseded' },
  { id: 'r2', result: 'Re-test of result 1', moisture: '13.6', deduction: '0.2', deducted: '0.049', payable: '24.451', assessor: 'Kitwe Grain Laboratory', instrument: 'Certificate KGL-2210', taken: '25 Sep 2026, 14:30', mark: 'retest' },
];
export const TW_DISPUTE_OUTCOMES = [
  { value: 'keep', label: 'Keep result 1', variant: 'outline' },
  { value: 'retest', label: 'Apply the re-test', variant: 'primary' },
];

/** GradingDispute's M6 states: a challenged grade re-tested and decided, never overwritten (M6.GRN.03). Both results
    stay with their assessor, instrument and time; the decision applies one, with its authority snapshot, and the money
    is corrected beside the original, which stays. */
export function GradingDisputeM6({ state }) {
  const decided = state === 'Decided';
  const markOf = (r) => (r.mark === 'retest' ? (decided ? <StatusMark kind="clean" label="Applies" size="body-4" /> : <StatusMark kind="pending" label="Waiting for a decision" size="body-4" />)
    : decided ? <StatusMark kind="neutral" label="Superseded by re-test" size="body-4" /> : <StatusMark kind="attention" label="Disputed" size="body-4" />);
  return (
    <Sections>
      <HmHead title="DSP-0231" />
      <RecordHighlights kind="Grading dispute" title="DSP-0231" status={decided ? <StatusMark kind="within" label="Closed" size="body-4" /> : <ExceptionStatus status="open" />} tabs={[]}
        actions={decided ? null : <DecisionActions outcomes={TW_DISPUTE_OUTCOMES} busy={state === 'Deciding' ? 'retest' : null} />}
        fields={[{ label: 'Load', value: 'ABZ 4521', link: '#' }, { label: 'Supplier', value: 'Lakeview Farms Ltd', link: '#' }, { label: 'Contract leg', value: 'SYN4702-C', link: '#' },
          { label: 'Net', value: '24.500 t' }, { label: 'Opened by', value: 'S. Banda' }, decided ? { label: 'Decided by', value: 'J. Tembo' } : { label: 'Waiting for', value: 'T. Mwila or J. Tembo' }]} />
      <HmCard title="Quality results" count={TW_RESULTS.length} objects="results">
        <HmTable rows={TW_RESULTS} columns={[
          { key: 'result', label: 'Result', width: 'minmax(140px, 1fr)', wrap: true },
          { key: 'moisture', label: 'Moisture (%)', width: '104px', align: 'right' },
          { key: 'deduction', label: 'Deduction (%)', width: '112px', align: 'right' },
          { key: 'deducted', label: 'Deducted (t)', width: '104px', align: 'right' },
          { key: 'payable', label: 'Payable (t)', width: '100px', align: 'right' },
          { key: 'assessor', label: 'Assessor and instrument', width: '200px', wrap: true, render: (r) => `${r.assessor}, ${r.instrument}` },
          { key: 'taken', label: 'Taken (CAT)', width: '150px', tabular: true },
          { key: 'mark', label: 'Status', width: '190px', render: markOf },
        ]} />
      </HmCard>
      {decided ? (
        <>
          <HmCard title="Money" count={2} objects="entries">
            <HmTable rows={[
              { id: 'm1', entry: 'Deduction at result 1, 0.098 t at ZMW 6,800.00 per t', amount: '\u2212666.40', date: '24 Sep 2026, 09:20' },
              { id: 'm2', entry: 'Correction: the re-test applies, 0.049 t returned', amount: '333.20', date: '26 Sep 2026, 11:05' },
            ]} columns={[
              { key: 'entry', label: 'Entry', width: 'minmax(260px, 1fr)', wrap: true },
              { key: 'amount', label: 'Amount (ZMW)', width: '130px', align: 'right' },
              { key: 'date', label: 'Date (CAT)', width: '150px', tabular: true },
            ]} />
          </HmCard>
          <Card title="Authority snapshot" padding={16}>
            <HmFacts fields={[['Decided by', 'J. Tembo'], ['Acting as', 'Deputy'], ['On behalf of', 'Managing Director'], ['Bundles', 'Trading'], ['Price tiers', 'Gate, Contract, Sell'], ['Approval step', 'Grading dispute, version 1'], ['Decided', '26 Sep 2026, 11:05 CAT']]} />
          </Card>
        </>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Stock by stack, bay and silo (StockBoard's M6 states) */

/** Stock by storage unit (M6.STK.05), stock control's view: tonnes only, no price or value. Owner is a column of its
    own; another owner's grain is shown apart and never counts in UAG's position; capacity counts every owner. */
export const TW_STOCK = [
  { id: 'u1', site: 'Mpongwe Depot', siteType: 'Own', unit: 'S1', kind: 'Stack', commodity: 'Wheat', marker: 'wheat', grade: 'B1', owner: 'Own', tonnes: '2,140', capacity: '3,000', flag: '' },
  { id: 'u2', site: 'Mpongwe Depot', siteType: 'Own', unit: 'S2', kind: 'Stack', commodity: 'Wheat', marker: 'wheat', grade: 'B2', owner: 'Own', tonnes: '1,060', capacity: '2,500', flag: '' },
  { id: 'u3', site: 'Mpongwe Depot', siteType: 'Own', unit: 'S2', kind: 'Stack', commodity: 'Wheat', marker: 'wheat', grade: 'B1', owner: 'Riverbend Milling', tonnes: '800', capacity: '2,500', flag: 'others' },
  { id: 'u4', site: 'Mpongwe Depot', siteType: 'Own', unit: 'SL1', kind: 'Silo', commodity: 'Wheat', marker: 'wheat', grade: 'B1', owner: 'Own', tonnes: '900', capacity: '1,000', flag: 'over' },
  { id: 'u5', site: 'Mpongwe Depot', siteType: 'Own', unit: 'SL1', kind: 'Silo', commodity: 'Wheat', marker: 'wheat', grade: 'B1', owner: 'Riverbend Milling', tonnes: '120', capacity: '1,000', flag: 'over' },
  { id: 'u6', site: 'Mpongwe Depot', siteType: 'Own', unit: 'D1', kind: 'Drying bay', commodity: 'Wheat', marker: 'wheat', grade: '', owner: 'Cameron Estates', tonnes: '26', capacity: '200', flag: 'others' },
  { id: 'u7', site: 'Chisamba Shed', siteType: 'Own', unit: 'B1', kind: 'Bay', commodity: 'Urea 50 kg', marker: 'fertilizer', grade: '', owner: 'Own', tonnes: '820', capacity: '1,200', flag: '' },
  { id: 'u8', site: 'Riverbend Milling Kitwe', siteType: 'Third party', unit: 'SL2', kind: 'Silo', commodity: 'White maize', marker: 'white-maize', grade: 'Grade 1', owner: 'Own', tonnes: '1,250', capacity: '4,000', flag: 'third' },
  { id: 'u9', site: 'Hired store, Mkushi', siteType: 'Third party', unit: 'H1', kind: 'Bay', commodity: 'Soya', marker: 'soya', grade: 'Commercial', owner: 'Own', tonnes: '1,000', capacity: '1,500', flag: 'third' },
];

/** The five owner and site situations, each named, with what counts in UAG's position (M6.STK.05 AC 10). */
export const TW_SITUATIONS = [
  { id: 'p1', situation: 'Own grain in own sheds', tonnes: '4,920', counts: 'Yes' },
  { id: 'p2', situation: 'Own grain in hired storage', tonnes: '1,000', counts: 'Yes' },
  { id: 'p3', situation: 'Own grain at the seller’s farm or premises', tonnes: '0', counts: 'Yes' },
  { id: 'p4', situation: 'Own grain in a mill silo', tonnes: '1,250', counts: 'Yes' },
  { id: 'p5', situation: 'Another owner’s grain in own sheds', tonnes: '946', counts: 'No' },
];

function twStockFlag(r) {
  if (r.flag === 'over') return <StatusMark kind="attention" label="Over capacity" size="body-4" />;
  if (r.flag === 'others') return <StatusMark kind="flat" label="Not own stock" size="body-4" />;
  if (r.flag === 'third') return <StatusMark kind="flat" label="Third-party site" size="body-4" />;
  return '';
}

/** StockBoard's M6 states: stack, bay and silo grouping, third-party sites, and stock owned by others shown apart. */
export function StockBoardM6({ state }) {
  const rows = state === 'Third-party sites' ? TW_STOCK.filter((r) => r.siteType === 'Third party') : state === 'Owned by others' ? TW_STOCK.filter((r) => r.owner !== 'Own') : TW_STOCK;
  const total = rows.reduce((n, r) => n + Number(r.tonnes.replace(/,/g, '')), 0).toLocaleString('en-US');
  return (
    <Sections>
      <HmHead title="Stock by storage unit" count={rows.length} meta={<HmRefreshed time={TW_AS_OF} />} right={<Button variant="outline" size="small" icon="download">Export</Button>} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <ScrollRow>
          <Capsule chevron selected>{state === 'Third-party sites' ? 'Third-party sites' : state === 'Owned by others' ? 'Owned by others' : 'All storage units'}</Capsule>
          <Capsule chevron>Site</Capsule><Capsule chevron>Owner</Capsule><Capsule chevron>Grade</Capsule>
        </ScrollRow>
        <SearchField placeholder="Search this list" hint={null} maxWidth={320} />
      </div>
      {state === 'By storage unit' ? (
        <HmCard title="Where the stock is" count={TW_SITUATIONS.length} objects="situations">
          <HmTable rows={TW_SITUATIONS} columns={[
            { key: 'situation', label: 'Situation', width: 'minmax(220px, 1fr)', wrap: true },
            { key: 'tonnes', label: 'Tonnes (t)', width: '110px', align: 'right' },
            { key: 'counts', label: 'Counts in own position', width: '200px' },
          ]} />
        </HmCard>
      ) : null}
      <Card padding={4}>
        <HmTable rows={[...rows, { id: 'total', total: true, site: 'Total', tonnes: total }]} columns={[
          { key: 'site', label: 'Site', width: 'minmax(150px, 1fr)', wrap: true, render: (r) => twStrong(r, r.site) },
          { key: 'siteType', label: 'Site type', width: '100px' },
          { key: 'unit', label: 'Storage unit', width: '140px', render: (r) => (r.total ? '' : <HmLink>{`${r.kind} ${r.unit}`}</HmLink>) },
          { key: 'commodity', label: 'Commodity', width: '124px', render: (r) => (r.total ? '' : <CommodityMarker commodity={r.marker}>{r.commodity}</CommodityMarker>) },
          { key: 'grade', label: 'Grade', width: '96px' },
          { key: 'owner', label: 'Owner', width: '140px', wrap: true },
          { key: 'tonnes', label: 'In store (t)', width: '96px', align: 'right', render: (r) => twStrong(r, r.tonnes) },
          { key: 'capacity', label: 'Capacity (t)', width: '104px', align: 'right' },
          { key: 'flag', label: 'Status', width: '150px', render: (r) => (r.total ? '' : twStockFlag(r)) },
        ]} />
      </Card>
    </Sections>
  );
}
