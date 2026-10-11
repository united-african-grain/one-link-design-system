/** Contract terms in the Trading workspace (M6.DS.01): (b) contract terms, (j) the amendment confirmation and (l) the
    lot definition with the lot picker used at capture. The quality specification editor, (k), is in Setup
    (../admin_workspace/QualitySpecs.jsx), under Reference data, as S10 places it. Every screen takes `state`, one of
    TRADING_WORKSPACE_STATES.

    The contract basis governs three things at once and says so on the contract: the weight the invoice is computed on,
    the price adjustment for grade, and who carries the loss in transit (D-21). A grade differential or a ladder price
    is contract tier: on a shared layout it is the Restricted lock (UX-09). A term changes only by an amendment that
    names the loads it touches, with a reason and an effective date, and needs an approval decision (M6.TRD.03, UX-22).
    A ladder price is generated from the price rule and never typed. */

/* ------------------------------------------------------------------ (b) Contract terms */

export const TW_SPEC_PARAMS = [
  { id: 'p1', parameter: 'Moisture', unit: '%', limit: '12.5', step: '0.5', deduction: '0.1', reject: '17.0' },
  { id: 'p2', parameter: 'Foreign matter', unit: '%', limit: '1.0', step: '1.0', deduction: '1.0', reject: '5.0' },
  { id: 'p3', parameter: 'Broken grain', unit: '%', limit: '4.0', step: '1.0', deduction: '0.5', reject: '10.0' },
];
const TW_DIFFERENTIALS = [
  { id: 'd1', grade: 'B1', role: 'Base grade', diff: '0.00' },
  { id: 'd2', grade: 'B2', role: '', diff: '\u221210.00' },
];
const TW_AMENDMENTS = [
  { id: 'a2', field: 'Price', old: 'USD 250.00 per t', next: 'USD 256.00 per t', effective: '01 Nov 2026', reason: 'Seller cost of drying, agreed with T. Mwila', by: 'J. Tembo', status: 'pending', date: '25 Sep 2026, 10:05' },
  { id: 'a1', field: 'Grade differential, B2', old: 'USD \u22128.00 per t', next: 'USD \u221210.00 per t', effective: '15 Sep 2026', reason: 'Mill offer for B2 changed', by: 'J. Tembo', status: 'approved', date: '12 Sep 2026, 14:22' },
];

/** What a contract basis governs, read back on the contract (M6.TRD.05 AC 1). */
export function twBasisFacts(basis) {
  return basis === 'Delivered'
    ? [['Contract basis', 'Delivered'], ['Invoice weight', 'Offloaded weight at the buyer'], ['Price adjustment for grade', 'This contract\u2019s grade differentials'], ['Transit loss', 'Carried by the seller']]
    : [['Contract basis', 'Collected'], ['Invoice weight', 'Collected weight at the farm'], ['Price adjustment for grade', 'This contract\u2019s grade differentials'], ['Transit loss', 'Carried by the buyer']];
}

export function ContractTerms({ state = 'Sale', onOpen }) {
  const leg = state === 'Purchase leg';
  const missing = state === 'Basis missing';
  const tier = state !== 'Without the contract tier';
  const id = leg ? 'SYN4702-A' : missing ? 'SYN4810-B' : 'SYN4702';
  const basis = leg || missing ? 'Collected' : 'Delivered';
  return (
    <Sections>
      <HmHead title={id} />
      {missing ? <Refusal action="Submit for approval" reason="Choose collected or delivered for SYN4810-B" /> : null}
      <RecordHighlights kind="Contract" title={id} status={<TwStatus status={missing ? 'draft' : 'active'} />} tabs={[]}
        actions={tier && !missing ? <Button variant="outline" size="small" icon="download">Export</Button> : null}
        fields={[
          { label: 'Counterparty', value: leg ? 'Cameron Estates' : missing ? 'Cameron Estates' : 'Riverbend Milling', link: tier ? '#' : undefined },
          { label: 'Commodity', value: <CommodityMarker commodity={missing ? 'maize' : 'wheat'}>{missing ? 'Maize' : 'Wheat'}</CommodityMarker> },
          { label: 'Type', value: leg || missing ? 'Purchase' : 'Sale' },
          { label: 'Quantity', value: leg ? '1,700 t' : missing ? '500 t' : '5,000 t' },
          { label: 'Price', value: tier ? (leg ? 'USD 250.00 per t' : missing ? 'USD 245.00 per t' : 'USD 284.40 per t') : <Restricted /> },
          { label: 'Trade', value: missing ? 'SYN4810' : 'SYN4702', link: tier ? '#' : undefined },
        ]} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
        <Card title="Contract basis" padding={16}>
          {missing ? (
            <Field label="Contract basis" required error="Choose collected or delivered.">
              <RadioList options={[{ value: 'collected', label: 'Collected', hint: 'Invoice on the collected weight; the buyer carries transit loss' }, { value: 'delivered', label: 'Delivered', hint: 'Invoice on the offloaded weight; the seller carries transit loss' }]} />
            </Field>
          ) : <HmFacts min={160} fields={twBasisFacts(basis)} />}
        </Card>
        <Card title="Quality specification" padding={16}>
          <HmFacts min={160} fields={[['Specification', <HmLink onOpen={() => onOpen && onOpen('spec')}>{missing ? 'White maize, ZAMACE grade 1' : 'Wheat, ZAMACE grade 1'}</HmLink>], ['Version', '3'], ['Product default', 'Yes'], ['Effective from', '01 Aug 2026']]} />
        </Card>
      </div>
      <HmCard title="Quality parameters" count={TW_SPEC_PARAMS.length} objects="parameters">
        <HmTable rows={TW_SPEC_PARAMS} columns={[
          { key: 'parameter', label: 'Parameter', width: 'minmax(140px, 1fr)' },
          { key: 'limit', label: 'Limit (%)', width: '96px', align: 'right' },
          { key: 'step', label: 'Step (points)', width: '116px', align: 'right' },
          { key: 'deduction', label: 'Deduction per step (% of weight)', width: '230px', align: 'right' },
          { key: 'reject', label: 'Reject limit (%)', width: '130px', align: 'right' },
        ]} />
      </HmCard>
      <HmCard title="Grade differentials" count={TW_DIFFERENTIALS.length} objects="grades">
        <HmTable rows={TW_DIFFERENTIALS} columns={[
          { key: 'grade', label: 'Grade', width: '96px' },
          { key: 'role', label: 'Note', width: 'minmax(140px, 1fr)' },
          { key: 'diff', label: 'Differential (USD per t)', width: '190px', align: 'right', render: (r) => (tier ? r.diff : <Restricted />) },
        ]} />
      </HmCard>
      <HmCard title="Amendment history" count={missing ? 0 : TW_AMENDMENTS.length} objects="amendments">
        <HmTable rows={TW_AMENDMENTS} columns={[
          { key: 'field', label: 'Term', width: '170px', wrap: true },
          { key: 'old', label: 'Old value', width: '140px', render: (r) => (tier ? r.old : <Restricted />) },
          { key: 'next', label: 'New value', width: '140px', render: (r) => (tier ? r.next : <Restricted />) },
          { key: 'effective', label: 'Effective', width: '120px', tabular: true },
          { key: 'reason', label: 'Reason', width: 'minmax(180px, 1fr)', wrap: true },
          { key: 'by', label: 'By', width: '96px' },
          { key: 'date', label: 'Date (CAT)', width: '150px', tabular: true },
          { key: 'status', label: 'Status', width: '160px', render: (r) => <TwStatus status={r.status} /> },
        ]} />
      </HmCard>
    </Sections>
  );
}

/* ------------------------------------------------------------------ (j) Amendment confirmation */

/** The loads already delivered on SYN4702-A, which keep the price they were delivered at. */
export const TW_AFFECTED_LOADS = Array.from({ length: 12 }, (_, i) => {
  const day = 2 + i * 2;
  return { id: `l${i + 1}`, truck: ['ABZ 4521', 'BAL 6750', 'BAL 1940', 'BAP 9229', 'ACE 4471', 'ACE 4473'][i % 6], grn: `GRN100003${String(40 + i).padStart(2, '0')}`, date: `${String(day).padStart(2, '0')} Sep 2026`, weight: ['30.180', '29.960', '31.040', '28.720', '30.500', '29.880'][i % 6] };
});

/** Confirm amendment, SYN4702-A (M6.TRD.05 AC 7 and 8, UX-22): the change, the loads it names, the effective date and
    a reason before Submit for approval is enabled. Loads delivered before the effective date keep the old price; no
    blended price appears anywhere. */
export function AmendmentConfirm({ state = 'Confirm' }) {
  const narrow = !useMinWidth(768);
  const busy = state === 'Submitting';
  const pending = state === 'Pending approval';
  const reason = state === 'Submitting' || pending ? 'Seller cost of drying, agreed with T. Mwila' : '';
  return (
    <Sections>
      <HmHead title="SYN4702-A" />
      <RecordHighlights kind="Contract" title="SYN4702-A" status={<TwStatus status="active" />} tabs={[]}
        actions={pending ? null : <Button variant="outline" size="small">Edit</Button>}
        fields={[{ label: 'Counterparty', value: 'Cameron Estates', link: '#' }, { label: 'Commodity', value: <CommodityMarker commodity="wheat">Wheat</CommodityMarker> },
          { label: 'Quantity', value: '1,700 t' }, { label: 'Delivered', value: '1,700 t' }, { label: 'Price', value: 'USD 250.00 per t' },
          ...(pending ? [{ label: 'Waiting for', value: 'T. Mwila' }] : [])]} />
      {pending ? (
        <HmCard title="Items to approve" count={1} objects="items">
          <RailRow subject={<HmLink>Amendment, SYN4702-A</HmLink>} context="Price from USD 250.00 to USD 256.00 per t, from 01 Nov 2026; 12 delivered loads keep USD 250.00 per t" right={<TwStatus status="pending" />} style={{ padding: '10px 16px' }} />
        </HmCard>
      ) : null}
      <Card title="Contract information" padding={16}>
        <HmFacts fields={[['Contract number', 'SYN4702-A'], ['Sale', 'SYN4702'], ['Supplier', 'Cameron Estates'], ['Basis', 'Collected'], ['Price', 'USD 250.00 per t'], ['Delivery window', 'Sep 2026 to Nov 2026']]} />
      </Card>
      {pending ? null : (
        <Dialog title="Confirm amendment, SYN4702-A" width={480} sheet={narrow} onClose={busy ? undefined : () => {}}
          footer={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy} disabled={!reason}>Submit for approval</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span>Price changes from USD 250.00 per t to USD 256.00 per t. These 12 delivered loads keep USD 250.00 per t.</span>
            <div style={{ margin: '0 -16px', maxHeight: 220, overflowY: 'auto', overflowX: 'hidden' }}>
              <HmTable rows={TW_AFFECTED_LOADS} columns={[
                { key: 'truck', label: 'Truck', width: '84px' }, { key: 'grn', label: 'Goods received note', width: '156px' },
                { key: 'date', label: 'Delivered', width: '100px', tabular: true }, { key: 'weight', label: 'Weight (t)', width: '80px', align: 'right' },
              ]} />
            </div>
            <Field label="Effective date" required><Input defaultValue="01 Nov 2026" disabled={busy} /></Field>
            <Field label="Reason" required error={state === 'Missing reason' ? 'Give a reason for this amendment.' : null}>
              <Input multiline invalid={state === 'Missing reason'} disabled={busy} defaultValue={reason} />
            </Field>
          </div>
        </Dialog>
      )}
    </Sections>
  );
}

/* ------------------------------------------------------------------ (l) Lot definition and the lot picker */

/** The ladder a lot generates from its base price and base month under the price rule (M6.PRC.02 AC 1). */
export const TW_LADDER = [
  { id: 'm05', month: 'May 2026', v1: '560.00', v2: '' },
  { id: 'm06', month: 'Jun 2026', v1: '564.65', v2: '' },
  { id: 'm07', month: 'Jul 2026', v1: '569.33', v2: '' },
  { id: 'm08', month: 'Aug 2026', v1: '574.06', v2: '568.93' },
  { id: 'm09', month: 'Sep 2026', v1: '578.82', v2: '573.66' },
  { id: 'm10', month: 'Oct 2026', v1: '583.63', v2: '578.42' },
  { id: 'm11', month: 'Nov 2026', v1: '588.47', v2: '583.22' },
  { id: 'm12', month: 'Dec 2026', v1: '593.36', v2: '588.06' },
];
export const TW_PRICE_RULE = 'Storage carry, 0.83% monthly, compounding';
const TW_OPEN_LOTS = [
  { value: 'SYN4666-L1', label: 'SYN4666-L1', hint: 'Base month Apr 2026, 7,000 t, 6,120 t on it' },
  { value: 'SYN4666-L2', label: 'SYN4666-L2', hint: 'Base month May 2026, 8,000 t, 2,410 t on it' },
];

/** New lot on SYN4666 (M6.PRC.02): base price, base month and the price rule's label as the field Source: Price rule;
    the ladder it will generate is shown, read only. At capture the clerk picks the lot from the open lots, with no
    price shown; a contract with one open lot assigns it. */
export function LotDefinition({ state = 'New lot' }) {
  if (state === 'Lot picker' || state === 'One open lot') {
    const one = state === 'One open lot';
    return (
      <Sections>
        <HmHead title="New goods received note" right={<><Button variant="outline" size="small">Save draft</Button><Button size="small">Finalise</Button></>} />
        <Card title="Contract and lot" padding={16}>
          <TwFields>
            <Field label="Contract leg" required><Select defaultValue={one ? 'SYN4790-A' : 'SYN4666-B'} options={['SYN4666-B', 'SYN4790-A']} /></Field>
            {one ? (
              <Field label="Lot"><span style={{ ...textStyle('body-3', { tabular: true }), minHeight: 32, display: 'inline-flex', alignItems: 'center' }}>SYN4790-L1, the only open lot</span></Field>
            ) : (
              <Field label="Lot" required><RadioList value="SYN4666-L2" options={TW_OPEN_LOTS} /></Field>
            )}
          </TwFields>
        </Card>
        <Card title="Load" padding={16}>
          <HmFacts fields={[['Truck', 'BAL 6750'], ['Ticket', 'WBT10001631'], ['Net', '30.180 t'], ['Grade', 'B2']]} />
        </Card>
      </Sections>
    );
  }
  const busy = state === 'Saving';
  const missing = state === 'Missing base month';
  return (
    <Sections>
      <HmHead title="New lot" right={<><Button variant="outline" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy} disabled={missing}>Save</Button></>} />
      <Card title="Lot" padding={16}>
        <TwFields>
          <Field label="Contract" required><Select defaultValue="SYN4666" disabled={busy} options={['SYN4666', 'SYN4721']} /></Field>
          <Field label="Lot"><span style={{ ...textStyle('body-3', { tabular: true }), minHeight: 32, display: 'inline-flex', alignItems: 'center' }}>SYN4666-L2</span></Field>
          <Field label="Quantity (t)" required><Input align="right" defaultValue="8,000" disabled={busy} /></Field>
          <Field label="Base price (USD per t)" required><Input align="right" defaultValue="560.00" disabled={busy} /></Field>
          <Field label="Base month" required error={missing ? 'Choose a base month.' : null}>
            <Select invalid={missing} disabled={busy} defaultValue={missing ? '' : 'May 2026'} options={[{ value: '', label: 'Choose a month' }, 'Apr 2026', 'May 2026', 'Jun 2026']} />
          </Field>
          <Field label="Last month" required><Select defaultValue="Dec 2026" disabled={busy} options={['Nov 2026', 'Dec 2026', 'Jan 2027']} /></Field>
        </TwFields>
      </Card>
      <Card title="Price rule" padding={16}>
        <HmFacts fields={[['Source', `Price rule, ${TW_PRICE_RULE}`], ['Setting', 'Storage carry rule, wheat'], ['Setting owner', 'Finance']]} />
      </Card>
      {missing ? null : (
        <HmCard title="Ladder" count={TW_LADDER.length} objects="months">
          <HmTable rows={TW_LADDER} columns={[
            { key: 'month', label: 'Month', width: 'minmax(120px, 1fr)', tabular: true },
            { key: 'v1', label: 'Price (USD per t)', width: '150px', align: 'right' },
          ]} />
        </HmCard>
      )}
    </Sections>
  );
}
