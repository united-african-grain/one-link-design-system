/** Captures in review (M4.DS.03, UAG-185; RL-CAPTURE-REVIEW): a field capture that arrives more than 24 hours late, or
    from a revoked phone, waits here. A user with the Stock control role approves or rejects it, with Operations as
    deputy; Reject needs a comment (S57, UX-22). The administrator reads the same list and record in Setup and cannot
    decide. Every screen takes `state`: CAPTURE_REVIEW_STATES in Setup (read-only), CAPTURE_DECISION_STATES in stock
    control's frame (the one_link kit), for ?screen=&state=.

    Each item shows its reason, its capture time and the phone's revocation time (blank when the phone is not revoked).
    Device numbers and user names are links only for the administrator, who can open them; capture numbers are links
    for both. Operations words only: quantities, never a price. Fictional sample data only. */

export const CAPTURE_REVIEW_STATES = {
  CapturesInReview: ['In review', 'Empty'],
  CaptureReview: ['Late capture', 'From a revoked phone'],
};
export const CAPTURE_DECISION_STATES = {
  CapturesToReview: ['In review', 'Empty'],
  CaptureDecision: ['Late capture', 'From a revoked phone', 'Approving', 'Reject', 'Rejecting', 'Approved', 'Rejected'],
};

export function captureReviewTitle(screen, state) {
  if (screen === 'CaptureReview' || screen === 'CaptureDecision') return captureFor(state).ref;
  return null;
}

/** Stock control's frame for the deciding screens: Inventory, Captures in review (canvas S15's navigation, added to). */
export function captureDecisionFrame(screen, state) {
  return { who: 'stock', module: 'inventory', section: 'review', decide: true, breadcrumb: ['Inventory', 'Captures in review', ...(screen === 'CaptureDecision' ? [captureFor(state).ref] : [])] };
}

const CAPTURE_STATUS = {
  pending: <StatusMark kind="pending" label="Pending approval" size="body-4" />,
  approved: <StatusMark kind="clean" label="Approved" size="body-4" />,
  rejected: <StatusMark kind="breach" label="Rejected" size="body-4" />,
};

/** The decision on a capture in review: Reject (with a comment) and Approve, as data (UX-33). */
export const CAPTURE_OUTCOMES = [
  { value: 'reject', label: 'Reject', variant: 'critical', comment: true },
  { value: 'approve', label: 'Approve', variant: 'primary' },
];

export const CAPTURES = [
  { id: 'c317', ref: 'CAP-000317', what: 'Proof of delivery, DN10000429', to: 'Lakeview Farms Ltd, Mkushi', load: 'D Compound 50 kg, 400 bags', receiver: 'J. Mwanza', received: '400', device: 'DEV-0011', by: 'G. Phiri', reason: 'Late capture', captured: '25 Sep 2026, 13:58', arrived: '26 Sep 2026, 15:10', revoked: '' },
  { id: 'c318', ref: 'CAP-000318', what: 'Proof of delivery, DN10000433', to: 'Cameron Estates, Chisamba', load: 'Urea 50 kg, 240 bags', receiver: 'K. Tembo', received: '240', device: 'DEV-0004', by: 'S. Banda', reason: 'From a revoked phone', captured: '25 Sep 2026, 11:05', arrived: '26 Sep 2026, 08:12', revoked: '25 Sep 2026, 10:30' },
];

function captureFor(state) {
  return state === 'Late capture' ? CAPTURES[0] : CAPTURES[1];
}

/** The list (UX-07): the capture first, Status last. Read-only in Setup; stock control opens a capture to decide it. */
export function CapturesInReview({ state = 'In review', onOpen, decide = false }) {
  const rows = state === 'Empty' ? [] : CAPTURES;
  const ref = (v) => (decide ? v : <RecordLink>{v}</RecordLink>);
  return (
    <ListView title="Captures in review" objects="captures" search="Search captures" view="All captures"
      columns={[
        { key: 'ref', label: 'Capture', width: '120px', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.ref}</RecordLink> },
        { key: 'what', label: 'Capture of', wrap: true },
        { key: 'device', label: 'Device', width: '100px', render: (r) => ref(r.device) },
        { key: 'by', label: 'Captured by', width: '110px', render: (r) => ref(r.by) },
        { key: 'reason', label: 'Reason', width: '150px', wrap: true },
        { key: 'captured', label: 'Captured (CAT)', width: '160px', tabular: true },
        { key: 'revoked', label: 'Revoked (CAT)', width: '160px', tabular: true },
        { key: 'status', label: 'Status', width: '150px', render: () => CAPTURE_STATUS.pending },
      ]} rows={rows} />
  );
}

/** Stock control's list, the same list with the capture to decide. */
export function CapturesToReview(props) {
  return <CapturesInReview {...props} decide />;
}

/** A capture's record (UX-19): its reason, capture time and revocation time in the highlights, who decides it as the
    labelled field Waiting for, and what was captured. Approve and Reject only for stock control; Reject asks for a
    comment before it is enabled (UX-22); the decision being saved shows its working state. */
export function CaptureReview({ state = 'Late capture', decide = false }) {
  const c = captureFor(state === 'Late capture' ? state : 'From a revoked phone');
  const [tab, setTab] = useState('Details');
  const decided = state === 'Approved' ? 'approved' : state === 'Rejected' ? 'rejected' : null;
  const busy = state === 'Approving' ? 'approve' : null;
  const actions = decide && !decided ? <DecisionActions outcomes={CAPTURE_OUTCOMES} busy={busy} /> : null;
  const ref = (v) => (decide ? v : <RecordLink>{v}</RecordLink>);
  const fields = [
    { label: 'Reason', value: c.reason },
    { label: 'Captured', value: `${c.captured} CAT` },
    { label: 'Revoked', value: c.revoked },
    { label: 'Device', value: ref(c.device) },
    { label: 'Captured by', value: ref(c.by) },
    decided ? { label: 'Decided by', value: 'R. Daka, 26 Sep 2026, 09:40' } : { label: 'Waiting for', value: 'Stock control or Operations' },
  ];
  const history = [
    ...(decided ? [{ id: 'h2', field: 'Status', user: 'R. Daka', old: 'Pending approval', next: decided === 'approved' ? 'Approved' : 'Rejected', date: '26 Sep 2026, 09:40', reason: decided === 'rejected' ? 'Signature does not match the receiver on file.' : '' }] : []),
    { id: 'h1', field: 'Capture', user: c.by, old: '', next: 'Pending approval', date: c.arrived, reason: c.reason },
  ];
  return (
    <Sections>
      <SetupHead title={c.ref} />
      <RecordHighlights kind="Capture" title={c.ref} status={CAPTURE_STATUS[decided || 'pending']} actions={actions} fields={fields} tab={tab} onTab={setTab} />
      {tab === 'History' ? (
        <CountCard title="History" objects="changes" count={history.length}>
          <SetupTable columns={[
            { key: 'field', label: 'Field', width: '110px' }, { key: 'user', label: 'User', width: '110px' },
            { key: 'old', label: 'Old value', width: '150px' }, { key: 'next', label: 'New value', width: '150px' },
            { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true }, { key: 'reason', label: 'Comment', wrap: true },
          ]} rows={history} />
        </CountCard>
      ) : tab === 'Related' ? (
        <CountCard title="Delivery notes" objects="delivery notes" count={1}>
          <SetupTable columns={[{ key: 'note', label: 'Delivery note', width: '150px' }, { key: 'to', label: 'Deliver to' }, { key: 'load', label: 'Load' }]}
            rows={[{ id: c.id, note: c.what.split(', ')[1], to: c.to, load: c.load }]} />
        </CountCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
          <Card title="Capture information" padding={16}>
            <SummaryList items={[{ label: 'Capture of', value: c.what }, { label: 'Deliver to', value: c.to }, { label: 'Load', value: c.load },
              { label: 'Receiver name', value: c.receiver }, { label: 'Received (bags)', value: c.received }, { label: 'Arrived', value: `${c.arrived} CAT` }]} />
          </Card>
          <Card title="Proof" padding={16}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <EvidenceTile caption={`photo-${c.what.split(', ')[1].toLowerCase()}`} time={c.captured.slice(-5)} />
              <EvidenceTile kind="document" caption={`signature-${c.what.split(', ')[1].toLowerCase()}`} time={c.captured.slice(-5)} />
            </div>
          </Card>
        </div>
      )}
      {state === 'Reject' || state === 'Rejecting' ? (
        <ReasonDialog title={`Reject ${c.ref}?`} label="Comment" minLength={1} confirmLabel="Reject" confirmVariant="critical" busy={state === 'Rejecting'}
          defaultReason={state === 'Rejecting' ? 'Signature does not match the receiver on file.' : ''}>
          The delivery note stays without proof of delivery.
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}

/** Stock control's record, the same record with Approve and Reject. */
export function CaptureDecision(props) {
  return <CaptureReview {...props} decide />;
}
