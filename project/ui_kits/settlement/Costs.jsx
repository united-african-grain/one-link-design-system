/** Invoice preparation and settlement: costs (M7.DS.02, UAG-200; F7.1 to F7.3, F8.5; canvas S60 "One Link Sid" screens
    9 and 10): the GL cost categories with their account codes and the applicability matrix by trade pattern; stock cost
    per lot in US dollars with the weighted-average roll-up, always indicative; and a supplier cash prepayment with its
    tonnage equivalence. Every screen takes `state`, one of its ST_COST_STATES entry.

    GL codes are vocabulary, never a ledger link (RL-GL-VOCAB): nothing here posts. Trade costs are never capitalised
    into stock cost (RL-NO-LANDED-COST), so the indicative cost names the categories it leaves out. The weighted-average
    cost is an IndicativeFigure: labelled Indicative, opening Calculation details with the basis, what it leaves out and
    the rate with its date (Map D-16, D-17, D-40). Cost figures carry the Contract tier and the prepayment the Farmer
    account tier (UX-10): without it the columns are left out, or the Restricted lock shows on a shared field. Fictional
    sample data; the account codes are sample codes. */

export const ST_COST_STATES = {
  CostCategories: ['Categories', 'Change account code', 'Saving code', 'Change where it applies', 'Saving change', 'Saved', 'Loading', 'Error'],
  StockCost: ['Holdings', 'Lots', 'Calculation details', 'Cost withheld', 'Without the contract tier', 'Exporting', 'No stock', 'Loading', 'Error'],
  SupplierPrepayment: ['Open', 'Calculation details', 'Delivered in full', 'Reverse', 'Reversing', 'Reversed', 'Without the farmer account tier', 'Loading'],
};

export function stCostFrame(screen, state) {
  const view = /^Without the/.test(state);
  if (screen === 'CostCategories') return { who: 'fin', module: 'setup', section: 'cost-categories', breadcrumb: ['Setup', 'GL cost categories'] };
  if (screen === 'StockCost') return { who: view ? 'view' : 'fin', module: 'finance', section: 'stock-cost', breadcrumb: ['Finance', 'Stock cost'] };
  return { who: view ? 'view' : 'fin', module: 'finance', section: 'accounts', breadcrumb: ['Finance', 'Farmer accounts', 'Lakeview Farms Ltd', ST_PREPAYMENT.id] };
}

/* ------------------------------------------------------------------ GL cost categories and where each applies (j) */

/** The twelve contract cost categories (F7.1), each with a sample account code. */
export const ST_CATEGORIES = [
  { id: 'product', name: 'Product', code: '610000' },
  { id: 'transport', name: 'Transport', code: '610100' },
  { id: 'transport-recovered', name: 'Transport to be Recovered', code: '610110' },
  { id: 'advances', name: 'Advances to Transporter', code: '610120' },
  { id: 'wages', name: 'Contract Specific Wages', code: '610200' },
  { id: 'phyto', name: 'Phyto Certificates', code: '610210' },
  { id: 'clearing', name: 'Clearing Docs', code: '610300' },
  { id: 'bagging', name: 'Contract Specific Bagging', code: '610500' },
  { id: 'prefinance', name: 'Prepayments on Prefinance', code: '620100', next: '620150 from 01 Jan 2027' },
  { id: 'offset', name: 'Offset of Invoice', code: '630100' },
  { id: 'discount', name: 'Price Discount', code: '640100' },
  { id: 'commissions', name: 'Commissions', code: '610400' },
];
export const ST_PATTERNS = ['Back-to-back', 'Financing', 'Import', 'Long'];
/** Where each category applies (CFG-GL-MATRIX): a back-to-back trade leaves out Prepayments on Prefinance; Product is
    the purchase itself and is never a tagged cost; an import carries Clearing Docs and Phyto Certificates. */
export function stApplies(cat, pattern) {
  if (cat.id === 'product') return false;
  if (cat.id === 'prefinance') return pattern === 'Financing';
  if (cat.id === 'clearing' || cat.id === 'phyto') return pattern === 'Import' || pattern === 'Back-to-back';
  if (cat.id === 'transport-recovered' || cat.id === 'advances') return pattern !== 'Long';
  return true;
}
export function StApplies({ on }) { return <StatusMark kind={on ? 'clean' : 'neutral'} label={on ? 'Applies' : 'Not applicable'} size="body-4" />; }

export function CostCategories({ state = 'Categories' }) {
  const sheet = useStSheet();
  if (state === 'Loading') return <Sections><HmHead title="GL cost categories" /><StLoading cards={2} /></Sections>;
  const changed = state === 'Saved';
  return (
    <Sections>
      <HmHead title="GL cost categories" count={ST_CATEGORIES.length} meta={<span>Account names used to tag costs on a trade. Nothing is posted to a ledger.</span>} />
      {state === 'Error' ? <StError action="Loading the categories" /> : null}
      {changed ? <Banner tone="success">Prepayments on Prefinance applies to Import trades from now.</Banner> : null}
      <HmCard title="Categories" count={ST_CATEGORIES.length} objects="categories">
        <HmTable rows={ST_CATEGORIES} columns={[
          { key: 'name', label: 'Category', width: 'minmax(190px, 1fr)', wrap: true },
          { key: 'code', label: 'Account code', width: '120px', tabular: true },
          { key: 'from', label: 'From', width: '120px', render: () => 'From the start' },
          { key: 'next', label: 'Next change', width: '200px', wrap: true, render: (r) => r.next || '' },
          { key: 'action', label: '', width: '130px', align: 'right', render: () => <Button variant="ghost" size="xsmall">Change code</Button> },
        ]} />
      </HmCard>
      <StCard title="Where each category applies" meta="Changing a cell is a high-impact change and needs a reason">
        <HmTable rows={ST_CATEGORIES} columns={[
          { key: 'name', label: 'Category', width: 'minmax(190px, 1fr)', wrap: true },
          ...ST_PATTERNS.map((p) => ({ key: p, label: p, width: '140px', render: (r) => <StApplies on={stApplies(r, p) || (changed && r.id === 'prefinance' && p === 'Import')} /> })),
        ]} />
      </StCard>
      {state === 'Change account code' || state === 'Saving code' ? (
        <Dialog open title="Change account code" width={480} sheet={sheet} footer={<><Button variant="ghost" size="small" disabled={state === 'Saving code'}>Cancel</Button><Button size="small" loading={state === 'Saving code'}>Save</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Text variant="body-3">Transport uses 610100. Costs recorded before the new code starts keep 610100.</Text>
            <Field label="New account code" required hint="Six digits"><Input inputMode="numeric" defaultValue="610150" disabled={state === 'Saving code'} /></Field>
            <Field label="Effective from" required><Input defaultValue="01 Nov 2026" disabled={state === 'Saving code'} /></Field>
            <Field label="Reason"><Input multiline defaultValue="" disabled={state === 'Saving code'} /></Field>
          </div>
        </Dialog>
      ) : null}
      {state === 'Change where it applies' || state === 'Saving change' ? (
        <ReasonDialog busy={state === 'Saving change'} sheet={sheet} defaultReason={state === 'Saving change' ? 'Import prefinance agreed with the mill for 2027' : ''}>
          Prepayments on Prefinance applies to Import trades from now. Costs already recorded keep their category.
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Stock cost: lots and the weighted-average roll-up (k) */

const ST_COST_RATE = 'ZMW 25.00 per USD';
/** What the indicative cost leaves out: every cost category tagged to a trade (RL-NO-LANDED-COST). */
export const ST_LEAVES_OUT = ST_CATEGORIES.filter((c) => c.id !== 'product').map((c) => c.name);
/** Each lot keeps its own purchase contract cost, in the currency agreed, converted at the rate in force on the lot's own
    date (Map D-17); the weighted average rolls the lots up in US dollars (RL-WA-ROLLUP). A lot with no purchase price
    withholds the holding's cost, never a zero. */
export const ST_HOLDINGS = [
  { id: 'h1', site: 'Chisamba Shed', stack: 'B1', product: 'Wheat', marker: 'wheat', grade: 'Grade 1', lots: [
    { id: 'L-0412', received: '20 Sep 2026', onHand: '412.500', agreed: 'ZMW 12,500.00 per t', rate: ST_COST_RATE, asAt: '20 Sep 2026', perT: '500.00', cost: '206,250.00' },
    { id: 'L-0418', received: '25 Sep 2026', onHand: '284.880', agreed: 'USD 512.00 per t', rate: 'Agreed in US dollars', asAt: '', perT: '512.00', cost: '145,858.56' },
  ] },
  { id: 'h2', site: 'Mpongwe Depot', stack: 'S2', product: 'Soya', marker: 'soya', grade: 'Grade 1', lots: [
    { id: 'L-0420', received: '22 Sep 2026', onHand: '640.000', agreed: 'ZMW 11,750.00 per t', rate: ST_COST_RATE, asAt: '22 Sep 2026', perT: '470.00', cost: '300,800.00' },
  ] },
  { id: 'h3', site: 'Chisamba Shed', stack: 'A2', product: 'White maize', marker: 'maize', grade: 'Grade 1', lots: [
    { id: 'L-0431', received: '26 Sep 2026', onHand: '31.420', agreed: '', rate: '', asAt: '', perT: '', cost: '' },
  ], withheld: 'No purchase price for a lot on hand' },
];
/** A holding's roll-up: tonnes on hand, cost in US dollars and the weighted average, from its lots. */
export function stHolding(h) {
  const t = h.lots.reduce((n, l) => n + thousandths(l.onHand), 0);
  const c = h.lots.reduce((n, l) => n + centsOf(l.cost), 0);
  return { lotCount: String(h.lots.length), onHand: tonnes(t), cost: fromCents(c), average: t ? fromCents(Math.round((c * 1000) / t)) : '' };
}

export function StockCost({ state = 'Holdings' }) {
  const [calc, setCalc] = useState(state === 'Calculation details');
  useEffect(() => setCalc(state === 'Calculation details'), [state]);
  const tier = state !== 'Without the contract tier';
  const head = <HmHead title="Stock cost" meta={<><span>{INDICATIVE_LABEL}</span><HmRefreshed time="01 Oct 2026, 07:02 CAT" /></>}
    right={<Button variant="outline" size="small" icon="download" loading={state === 'Exporting'}>Export</Button>} />;
  const bar = <ScrollRow><Capsule chevron selected>As at: now</Capsule><Capsule chevron>Site: All sites</Capsule><Capsule chevron>Product: All products</Capsule></ScrollRow>;
  if (state === 'Loading') return <Sections>{head}{bar}<StLoading cards={2} /></Sections>;
  const holdings = state === 'No stock' ? [] : state === 'Cost withheld' ? ST_HOLDINGS : ST_HOLDINGS.slice(0, 2);
  const wheat = ST_HOLDINGS[0];
  const w = stHolding(wheat);
  const calcProps = indicativeCalc({ name: 'Weighted average cost, wheat, Chisamba Shed B1', value: `USD ${w.average} per t`, leavesOut: ST_LEAVES_OUT, rate: ST_COST_RATE, rateDate: '20 Sep 2026',
    components: wheat.lots.map((l) => ({ label: `${l.id}, ${l.onHand} t at USD ${l.perT} per t`, value: `USD ${l.cost}` })),
    total: { label: `Cost (USD) over ${w.onHand} t`, value: `${w.cost}, USD ${w.average} per t` } });
  const rows = holdings.map((h) => ({ ...h, ...stHolding(h) }));
  const total = { id: 'total', total: true, site: 'Total', lotCount: String(rows.reduce((n, r) => n + Number(r.lotCount), 0)), onHand: tonnes(rows.reduce((n, r) => n + thousandths(r.onHand), 0)),
    cost: fromCents(rows.filter((r) => !r.withheld).reduce((n, r) => n + centsOf(r.cost), 0)) };
  return (
    <Sections>
      {head}
      {state === 'Error' ? <StError action="Loading stock cost" /> : null}
      {bar}
      {tier ? (
        <Card title="What cost is" padding={16}>
          <HmFacts min={220} fields={[['Basis', INDICATIVE_BASIS], ['Leaves out', ST_LEAVES_OUT.join(', ')], ['Month end', 'The source of record for month end stays outside One Link']]} />
        </Card>
      ) : null}
      {rows.length ? (
        <HmCard title="Holdings" count={rows.length} objects="holdings">
          <HmTable rows={[...rows, total]} expanded={state === 'Lots' || state === 'Calculation details' ? ['h1'] : undefined}
            expandLabel={(r) => `Show lots, ${r.site}, ${r.stack}, ${r.product}, ${r.grade}`}
            expand={(r) => (r.total ? null : (
              <div style={{ padding: '8px 16px 12px' }}>
                <HmTable rows={r.lots} columns={[
                  { key: 'id', label: 'Lot', width: '90px' }, { key: 'received', label: 'Received', width: '116px', tabular: true },
                  { key: 'onHand', label: 'On hand (t)', width: '100px', align: 'right' },
                  ...(tier ? [
                    { key: 'agreed', label: 'Agreed a tonne', width: '160px', align: 'right' },
                    { key: 'rate', label: 'Rate', width: '160px', wrap: true },
                    { key: 'asAt', label: 'Rate as at', width: '116px', tabular: true },
                    { key: 'perT', label: 'Cost (USD/t)', width: '106px', align: 'right' },
                    { key: 'cost', label: 'Cost (USD)', width: '116px', align: 'right' },
                  ] : []),
                ]} />
              </div>
            ))}
            columns={[
              { key: 'site', label: 'Site', width: 'minmax(130px, 1fr)', render: (r) => stStrong(r, r.site) },
              { key: 'stack', label: 'Stack', width: '72px', render: (r) => (r.total ? '' : r.stack) },
              { key: 'product', label: 'Product', width: '130px', render: (r) => (r.total ? '' : <CommodityMarker commodity={r.marker}>{r.product}</CommodityMarker>) },
              { key: 'grade', label: 'Grade', width: '90px', render: (r) => (r.total ? '' : r.grade) },
              { key: 'lotCount', label: 'Lots', width: '60px', align: 'right', render: (r) => stStrong(r, r.lotCount) },
              { key: 'onHand', label: 'On hand (t)', width: '110px', align: 'right', render: (r) => stStrong(r, r.onHand) },
              ...(tier ? [
                { key: 'average', label: 'Weighted average cost (USD/t)', width: '210px', align: 'right', render: (r) => (r.total ? '' : r.withheld ? <StatusMark kind="attention" label={r.withheld} size="body-4" /> : <IndicativeFigure variant="inline" value={r.average} onOpen={r.id === 'h1' ? () => setCalc(true) : () => {}} />) },
                { key: 'cost', label: 'Indicative cost (USD)', width: '160px', align: 'right', render: (r) => (r.withheld ? '' : stStrong(r, r.cost)) },
              ] : []),
            ]} />
        </HmCard>
      ) : <Card><EmptyState title="No stock on hand to display." /></Card>}
      {tier && rows.length ? (
        <StPair min={260}>
          <Card padding={16}><IndicativeFigure name="Weighted average cost, wheat" value={`USD ${w.average} per t`} onOpen={() => setCalc(true)} /></Card>
          <Card padding={16}><IndicativeFigure name="Indicative cost" value={`USD ${total.cost}`} onOpen={() => setCalc(true)} /></Card>
        </StPair>
      ) : null}
      {!tier ? <HmFacts fields={[['Indicative cost', <Restricted />]]} /> : null}
      {calc && tier ? <CalculationDetails open onClose={() => setCalc(false)} {...calcProps} /> : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Supplier prepayment with tonnage equivalence (m) */

/** A cash prepayment to a supplier (F8.5, DP-PREPAY-T): its tonnage equivalence is locked at the contract's price for
    the month it was paid, deliveries in its scope convert it to stock, and what remains is recovered first at settlement
    (RL-NET-ORDER). Nothing is posted as a recovery until a settlement is confirmed. */
export const ST_PREPAYMENT = { id: 'LE-0002', reference: 'LV prepay 1', farmer: 'Lakeview Farms Ltd', contract: 'SYN4811 P A', paid: '20 Aug 2026', amount: 'ZMW 340,000.00', price: 'ZMW 6,800.00 per t',
  equivalence: '50.000', delivered: '12.500', remaining: '37.500', owed: 'ZMW 255,000.00', recovery: 'ZMW 85,000.00' };
export const ST_CONVERSIONS = [
  { id: 'v1', time: '05 Oct 2026, 10:20', delivery: 'GRN10000416', lot: 'L-0425', tonnes: '12.500', amount: '85,000.00' },
];

export function SupplierPrepayment({ state = 'Open', onOpen }) {
  const sheet = useStSheet();
  const p = ST_PREPAYMENT;
  const [calc, setCalc] = useState(state === 'Calculation details');
  useEffect(() => setCalc(state === 'Calculation details'), [state]);
  if (state === 'Loading') return <Sections><HmHead title={p.id} /><StLoading cards={2} /></Sections>;
  if (state === 'Without the farmer account tier') {
    return (
      <Sections>
        <HmHead title={p.id} />
        <RecordHighlights kind="Prepayment" title={`${p.id}, ${p.reference}`} tabs={[]} status={<StatusMark kind="pending" label="Open" size="body-3" />}
          fields={[{ label: 'Paid on', value: p.paid }, { label: 'Contract', value: p.contract }, { label: 'Amount', value: <Restricted /> }, { label: 'Tonnage equivalence', value: <Restricted /> }]} />
      </Sections>
    );
  }
  const full = state === 'Delivered in full';
  const reversed = state === 'Reversed';
  const status = full ? { kind: 'neutral', word: 'Delivered in full' } : reversed ? { kind: 'neutral', word: 'Reversed' } : { kind: 'pending', word: 'Open' };
  const delivered = full ? p.equivalence : p.delivered;
  const remaining = full ? '0.000' : p.remaining;
  const conversions = full ? [...ST_CONVERSIONS, { id: 'v2', time: '19 Oct 2026, 08:45', delivery: 'GRN10000437', lot: 'L-0441', tonnes: '37.500', amount: '255,000.00' }] : ST_CONVERSIONS;
  return (
    <Sections>
      <HmHead title={p.id} />
      {reversed ? <Banner tone="info">Reversed by LE-0009: Paid against the wrong contract; recorded again as LE-0010.</Banner> : null}
      <RecordHighlights kind="Prepayment" title={`${p.id}, ${p.reference}`} tabs={['Details', 'Related', 'History']} tab="Details" onTab={() => {}} status={<StatusMark kind={status.kind} label={status.word} size="body-3" />}
        actions={full || reversed ? null : <Button variant="outline" size="small" loading={state === 'Reversing'}>Reverse</Button>}
        fields={[
          { label: 'Farmer', value: p.farmer, link: '#' }, { label: 'Paid on', value: p.paid }, { label: 'Contract', value: p.contract, link: '#' },
          { label: 'Amount', value: p.amount }, { label: 'Price', value: p.price }, { label: 'Tonnage equivalence', value: `${p.equivalence} t` },
          { label: 'Delivered against it', value: `${delivered} t` }, { label: 'Remaining', value: `${remaining} t` },
        ]} />
      <StPair>
        <Card title="Expected recovery" padding={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Text variant="heading-3-condensed" tabular><HmLink onOpen={() => setCalc(true)}>{full ? 'ZMW 0.00' : p.owed}</HmLink></Text>
            <StatusMark kind="pending" label="Expected, final at settlement" size="body-4" />
            <Text variant="body-4" tone="secondary">Recovered first at settlement, from deliveries in its scope. Nothing is posted as a recovery until a settlement is confirmed.</Text>
          </div>
        </Card>
        <Card title="Paid, not yet delivered" padding={16}>
          <HmFacts min={140} fields={[['Tonnes', `${remaining} t`], ['Money', full ? 'ZMW 0.00' : p.owed]]} />
        </Card>
      </StPair>
      <HmCard title="Conversions" count={conversions.length} objects="conversions">
        <HmTable rows={conversions} columns={[
          { key: 'time', label: 'Time (CAT)', width: '160px', tabular: true }, { key: 'delivery', label: 'Delivery', width: 'minmax(130px, 1fr)' },
          { key: 'lot', label: 'Lot', width: '90px' }, { key: 'tonnes', label: 'Tonnes (t)', width: '100px', align: 'right' },
          { key: 'amount', label: 'Amount (ZMW)', width: '130px', align: 'right' },
          { key: 'status', label: 'Status', width: '160px', render: () => <StatusMark kind="clean" label="Converted to stock" size="body-4" /> },
        ]} />
      </HmCard>
      {calc ? <CalculationDetails open onClose={() => setCalc(false)} name="Expected recovery" value={p.owed}
        components={[{ label: 'Amount prepaid', value: p.amount }, { label: 'Price used', value: `${p.price}, the contract price in force on ${p.paid}` }, { label: 'Tonnage equivalence', value: `${p.equivalence} t` },
          { label: 'Delivered against it', value: `-${p.delivered} t` }, { label: 'Remaining', value: `${p.remaining} t` }]}
        total={{ label: 'Expected recovery', value: p.owed }}
        basis={[{ label: 'Recovery order', value: 'Deliveries in its scope recover it first, before any other debt' }, { label: 'Each delivery is valued', value: 'At its own price and grade' }, { label: 'Becomes final', value: 'Only when a settlement is confirmed' }]} /> : null}
      {state === 'Reverse' || state === 'Reversing' ? (
        <ReasonDialog title={`Reverse ${p.id}`} confirmLabel="Reverse" confirmVariant="critical" busy={state === 'Reversing'} sheet={sheet} defaultReason={state === 'Reversing' ? 'Paid against the wrong contract' : ''}>
          A compensating entry reverses it, with its conversions. Both stay visible. Record the right prepayment afterwards.
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}
