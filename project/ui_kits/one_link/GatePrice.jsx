/** Gate price (M4.DS.01, UAG-53; M4.PRC.01, Map D-38, S08 J4): the gate prices list with the no price in force
    state, the New gate price form, and the gate price record in the approval record layout a trade uses (S08 J4):
    the highlights with Reject and Approve, the Approval card, and the price history on the History tab. Every screen
    takes `state`, one of its GATE_PRICE_STATES entry, for ?screen=&state=.

    The gate price is set and shown in kwacha a tonne as a unit price, "ZMW 6,800.00 per t" (UX-11, Map D-38). Its
    commercial owner (Trading, and the Owner) proposes it; it never applies before its approval; history is permanent.
    No price in force is a state that names who sets the price, never a zero, a blank or a stale price. These screens
    are drawn for viewers with the gate price tier; the Clerk never meets them (UX-10). Fictional sample data only. */

export const GATE_PRICE_STATES = {
  GatePrices: ['All', 'No price in force', 'Pending approval'],
  NewGatePrice: ['Form', 'Missing price', 'Submitting'],
  GatePriceRecord: ['Pending approval', 'Approving', 'Reject', 'Rejecting', 'Approved', 'Rejected', 'History', 'Own proposal'],
};

export function gatePriceFrame(screen, state) {
  const crumbs = ['Trade Desk', 'Gate prices'];
  if (screen === 'NewGatePrice') return { who: 'owner', module: 'trade', breadcrumb: [...crumbs, 'New'] };
  if (screen === 'GatePriceRecord') return { who: state === 'Own proposal' ? 'trading' : 'owner', module: 'trade', breadcrumb: [...crumbs, 'Maize, Chisamba Shed'] };
  return { who: 'owner', module: 'trade', breadcrumb: crumbs };
}

const GP_STATUS = {
  approved: <StatusMark kind="clean" label="Approved" size="body-4" />,
  pending: <StatusMark kind="pending" label="Pending approval" size="body-4" />,
  rejected: <StatusMark kind="breach" label="Rejected" size="body-4" />,
};

/** The prices in force and waiting, one row per product and site. A product and site with no price in force reads
    No price in force with the owner who sets it, in the price's own column. */
const GP_ROWS = [
  { id: 'g1', product: 'Maize', commodity: 'maize', site: 'Chisamba Shed', price: '6,800.00', from: '29 Sep 2026, 06:00', by: 'T. Mwila', status: 'approved' },
  { id: 'g2', product: 'Maize', commodity: 'maize', site: 'Chisamba Shed', price: '7,050.00', from: '06 Oct 2026, 06:00', by: '', status: 'pending' },
  { id: 'g3', product: 'Soya', commodity: 'soya', site: 'Chisamba Shed', price: '9,400.00', from: '29 Sep 2026, 06:00', by: 'T. Mwila', status: 'approved' },
  { id: 'g4', product: 'Maize', commodity: 'maize', site: 'Mpongwe Depot', price: '', from: '', by: '', status: 'none' },
];

export function GatePrices({ state = 'All', onOpen }) {
  const rows = state === 'No price in force' ? GP_ROWS.filter((r) => r.status === 'none') : state === 'Pending approval' ? GP_ROWS.filter((r) => r.status === 'pending') : GP_ROWS;
  return (
    <Sections>
      <WbHead title="Gate prices" count={rows.length} right={<Button size="small">New</Button>} />
      <WbFilters view="All gate prices" search="Search this list" filters={<>
        <Capsule selected={state === 'Pending approval'}>Pending approval</Capsule>
        <Capsule selected={state === 'No price in force'}>No price in force</Capsule>
      </>} />
      <WbTable columns={[
        { key: 'product', label: 'Product', width: '130px', render: (r) => <CommodityMarker commodity={r.commodity}>{r.product}</CommodityMarker> },
        { key: 'site', label: 'Site', width: 'minmax(150px, 1fr)' },
        { key: 'price', label: 'Gate price (ZMW per t)', width: '230px', align: 'right', render: (r) => (r.status === 'none' ? <NoPriceInForce /> : <span onClick={() => onOpen && onOpen(r.id)}><RefCell>{r.price}</RefCell></span>) },
        { key: 'from', label: 'Effective from (CAT)', width: '180px', tabular: true },
        { key: 'by', label: 'Approved by', width: '120px' },
        { key: 'status', label: 'Status', width: '150px', render: (r) => GP_STATUS[r.status] || null },
      ]} rows={rows} objects="gate prices" />
    </Sections>
  );
}

export function NewGatePrice({ state = 'Form' }) {
  const busy = state === 'Submitting';
  const missing = state === 'Missing price';
  return (
    <Sections>
      <WbHead title="New gate price" right={<>
        <Button variant="outline" size="small" disabled={busy}>Cancel</Button>
        <Button size="small" loading={busy} disabled={missing}>Submit for approval</Button>
      </>} />
      <Card title="Gate price">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 16 }}>
          <Field label="Product" required><Select options={['Maize', 'Soya', 'Wheat']} disabled={busy} /></Field>
          <Field label="Site" required><Select options={['Chisamba Shed', 'Mpongwe Depot']} disabled={busy} /></Field>
          <Field label="Gate price (ZMW per t)" required error={missing ? 'Gate price must be a number.' : null}>
            <Input align="right" invalid={missing} defaultValue={missing ? '' : '7,050.00'} disabled={busy} />
          </Field>
          <Field label="Effective from" required hint="Applies from this time or from approval, whichever is later.">
            <Input defaultValue="06 Oct 2026, 06:00 CAT" disabled={busy} />
          </Field>
        </div>
      </Card>
      <Card title="Approval">
        <WbFacts fields={[['Approval step', 'Gate price'], ['Approvers', 'Owner'], ['Deputies', 'Trading, then Finance'], ['Escalation', '24 hours']]} />
      </Card>
    </Sections>
  );
}

/** The gate price decision (S08 J4): Reject with a comment, or Approve. Data, as every decision is. */
export const GATE_PRICE_OUTCOMES = [
  { value: 'reject', label: 'Reject', variant: 'critical', comment: true },
  { value: 'approve', label: 'Approve', variant: 'primary' },
];

const GP_HISTORY = [
  { id: 'h3', field: 'Gate price', user: 'T. Mwila', old: 'ZMW 6,500.00 per t', next: 'ZMW 6,800.00 per t', date: '28 Sep 2026, 17:20', reason: 'Approved, effective 29 Sep 2026, 06:00' },
  { id: 'h2', field: 'Gate price', user: 'T. Mwila', old: '', next: 'ZMW 6,900.00 per t', date: '21 Sep 2026, 15:02', reason: 'Rejected: above the mills\' offer this week' },
  { id: 'h1', field: 'Gate price', user: 'T. Mwila', old: '', next: 'ZMW 6,500.00 per t', date: '14 Sep 2026, 16:45', reason: 'Approved, effective 15 Sep 2026, 06:00' },
];

export function GatePriceRecord({ state = 'Pending approval' }) {
  const narrow = !useMinWidth(768);
  const initial = state === 'History' ? 'History' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const approved = state === 'Approved' || state === 'History';
  const rejected = state === 'Rejected';
  const own = state === 'Own proposal';
  const decided = approved || rejected;
  const busy = state === 'Approving' ? 'approve' : state === 'Rejecting' ? 'reject' : null;
  const status = approved ? GP_STATUS.approved : rejected ? GP_STATUS.rejected : GP_STATUS.pending;
  const steps = [
    { id: 's1', step: 'Submitted', who: 'J. Tembo', status: <StatusMark kind="clean" label="Submitted" size="body-4" />, date: '05 Oct 2026, 16:40', comment: '' },
    { id: 's2', step: 'Gate price', who: 'T. Mwila', status, date: decided ? '05 Oct 2026, 18:05' : '', comment: rejected ? 'Hold at 6,800.00 until the mills move.' : '' },
  ];
  return (
    <Sections>
      <WbHead title="Gate price, maize" />
      {own ? <Refusal action="Approve" reason="You submitted this gate price" /> : null}
      <RecordHighlights kind="Gate price" title="Maize, Chisamba Shed" status={status} tab={tab} onTab={setTab}
        actions={decided || own ? null : <DecisionActions outcomes={GATE_PRICE_OUTCOMES} busy={busy} />}
        fields={[{ label: 'Gate price', value: 'ZMW 7,050.00 per t' }, { label: 'In force now', value: 'ZMW 6,800.00 per t' },
          { label: 'Effective from', value: approved ? '06 Oct 2026, 06:00' : '06 Oct 2026, 06:00, or at approval if later' },
          { label: 'Submitted by', value: 'J. Tembo' }, { label: 'Submitted', value: '05 Oct 2026, 16:40' },
          ...(decided || own ? [] : [{ label: 'Waiting for', value: 'T. Mwila' }])]} />
      {tab === 'History' ? (
        <WbTable title="History" count={GP_HISTORY.length + (approved ? 1 : 0)} objects="changes" columns={[
          { key: 'field', label: 'Field', width: '120px' }, { key: 'user', label: 'User', width: '110px' },
          { key: 'old', label: 'Old value', width: '170px' }, { key: 'next', label: 'New value', width: '170px' },
          { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true }, { key: 'reason', label: 'Reason' },
        ]} rows={[...(approved ? [{ id: 'h4', field: 'Gate price', user: 'T. Mwila', old: 'ZMW 6,800.00 per t', next: 'ZMW 7,050.00 per t', date: '05 Oct 2026, 18:05', reason: 'Approved, effective 06 Oct 2026, 06:00' }] : []), ...GP_HISTORY]} />
      ) : (
        <>
          <WbTable title="Approval" count={steps.length} objects="steps" columns={[
            { key: 'step', label: 'Step', width: '160px' }, { key: 'who', label: 'Assigned to', width: '140px' },
            { key: 'status', label: 'Status', width: '160px', render: (r) => r.status },
            { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true }, { key: 'comment', label: 'Comment' },
          ]} rows={steps} />
          <Card title="Gate price information">
            <WbFacts fields={[['Product', 'Maize'], ['Site', 'Chisamba Shed'], ['Unit', 'ZMW per t'], ['Approval step', 'Gate price'], ['Deputies', 'Trading, then Finance'], ['Escalation', '24 hours']]} />
          </Card>
        </>
      )}
      {state === 'Reject' || state === 'Rejecting' ? (
        <ReasonDialog title="Reject gate price, maize?" label="Comment" minLength={1} confirmLabel="Reject" confirmVariant="critical" busy={state === 'Rejecting'} sheet={narrow}
          defaultReason={state === 'Rejecting' ? 'Hold at 6,800.00 until the mills move.' : ''}>
          ZMW 7,050.00 per t at Chisamba Shed, submitted by J. Tembo. ZMW 6,800.00 per t stays in force.
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}
