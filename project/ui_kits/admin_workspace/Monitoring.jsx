/** Setup: the key-upload list and the list of exception rules (M5.DS.02, UAG-190; S10 A6 "Change a setting", the
    M5 round; UAG-147 and UAG-151). Not designed on any canvas: drawn as Proposed in the Setup list view (UX-07,
    sid-switch-admin 13). Key uploads sits in the Data group after Upload history, Exception rules in Configuration
    after Figures and price tiers; nothing above them moves. Every screen takes `state`, one of its MONITORING_STATES
    entry, for ?screen=&state=.

    A key upload is an upload template whose figures other screens read: its staleness threshold, the bundle that owns
    it, who may upload it (set per template by the administrator, Map D-39; the supply forecast's is Not set until UAG
    says who, U-29), when it was last imported, past its threshold with the warning icon (UX-24), and the latest
    upload's status in S57's import words (Validating, Ready to import, Imported, Failed). An exception rule shows its
    threshold, owner and whether it goes in the Daily summary and the End-of-day report (S57 glossary). Configuration
    words only, no explanatory text; a missing value is a blank cell. Fictional sample data only. */

export const MONITORING_STATES = {
  KeyUploadsList: ['All', 'Past threshold', 'Add key upload', 'Saving', 'No match'],
  ExceptionRulesList: ['All', 'Switched off', 'No match'],
};

/** The S57 import statuses an upload shows (UX-25, UX-32), from the design system's own list. */
export const MN_IMPORT = ['validating', 'ready', 'imported', 'failed'];

export const MN_KEY_UPLOADS = [
  { id: 'k1', name: 'Trade sheet', owner: 'Trading', threshold: '1 operating day', uploader: 'Trading', last: '26 Sep 2026, 06:50', past: false, status: 'imported' },
  { id: 'k2', name: 'Supply forecast, wheat', owner: 'Trading', threshold: '2 operating days', uploader: null, last: '23 Sep 2026, 08:10', past: true, status: 'imported' },
  { id: 'k3', name: 'Supply forecast, soya', owner: 'Trading', threshold: '2 operating days', uploader: null, last: '25 Sep 2026, 08:05', past: false, status: 'validating' },
  { id: 'k4', name: 'Port schedule', owner: 'Operations', threshold: '1 operating day', uploader: 'Operations', last: '26 Sep 2026, 09:12', past: false, status: 'ready' },
  { id: 'k5', name: 'Farm-direct loads', owner: 'Operations', threshold: '1 operating day', uploader: 'Operations', last: '26 Sep 2026, 08:30', past: false, status: 'imported' },
  { id: 'k6', name: 'Mill offload sheet', owner: 'Operations', threshold: '1 operating day', uploader: 'Operations', last: '24 Sep 2026, 12:10', past: true, status: 'failed' },
  { id: 'k7', name: 'Opening balances', owner: 'Finance', threshold: '30 days', uploader: 'Finance', last: '30 Sep 2026, 09:00', past: false, status: 'imported' },
];

/** The exception rules with their thresholds and routing (UAG-151, UX-34 names). */
export const MN_RULES = [
  { id: 'e1', rule: 'Weighbridge not reporting', threshold: '3 hours, operating hours', owner: 'Managing Director', summary: 'On', eod: 'On', status: 'Active' },
  { id: 'e2', rule: 'Missing mill side', threshold: '24 hours', owner: 'Operations', summary: 'Off', eod: 'On', status: 'Active' },
  { id: 'e3', rule: 'Missing loaded side', threshold: '24 hours', owner: 'Operations', summary: 'Off', eod: 'On', status: 'Active' },
  { id: 'e4', rule: 'Missing mill offload', threshold: '7 days', owner: 'Operations', summary: 'Off', eod: 'On', status: 'Active' },
  { id: 'e5', rule: 'Weight difference beyond allowance', threshold: '1.0%', owner: 'Managing Director, Trading', summary: 'On', eod: 'On', status: 'Active' },
  { id: 'e6', rule: 'Grade below contract', threshold: 'Any grade below contract', owner: 'Operations', summary: 'On', eod: 'On', status: 'Active' },
  { id: 'e7', rule: 'Documents not released', threshold: '24 hours', owner: 'Operations', summary: 'Off', eod: 'On', status: 'Active' },
  { id: 'e8', rule: 'Supplier quiet', threshold: '7 days without a delivery', owner: 'Trading', summary: 'On', eod: 'On', status: 'Active' },
  { id: 'e9', rule: 'Delivery overdue', threshold: 'Window end', owner: 'Trading', summary: 'On', eod: 'On', status: 'Active' },
  { id: 'e10', rule: 'Input out of date', threshold: 'Key upload threshold', owner: 'Trading, Operations', summary: 'On', eod: 'On', status: 'Active' },
  { id: 'e11', rule: 'Farmer exposure red band', threshold: '22.00%', owner: 'Managing Director, Finance', summary: 'On', eod: 'Off', status: 'Active' },
  { id: 'e12', rule: 'Stock take difference', threshold: '0.20%', owner: 'Stock control', summary: 'Off', eod: 'On', status: 'Active' },
];

/** Last imported, with the warning icon once it is past its threshold (UX-24). */
function MnLast({ row }) {
  return row.past ? <StatusMark kind="attention" label={row.last} size="body-4" /> : row.last;
}

export function KeyUploadsList({ state = 'All', onOpen }) {
  const narrow = !useMinWidth(768);
  const rows = state === 'No match' ? [] : state === 'Past threshold' ? MN_KEY_UPLOADS.filter((r) => r.past) : MN_KEY_UPLOADS;
  const adding = state === 'Add key upload' || state === 'Saving';
  return (
    <>
      <ListView title="Key uploads" objects="key uploads" view={state === 'Past threshold' ? 'Past threshold' : 'All key uploads'} search="Search this list"
        filters={<Capsule chevron>Owner</Capsule>} primary={<Button size="small" icon="plus">New</Button>} rows={rows}
        columns={[
          { key: 'name', label: 'Upload', width: 'minmax(180px, 1fr)', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink> },
          { key: 'owner', label: 'Owner', width: '120px' },
          { key: 'uploader', label: 'Who may upload', width: '150px', render: (r) => (r.uploader ? r.uploader : <NotSet size="body-4" />) },
          { key: 'threshold', label: 'Threshold', width: '150px' },
          { key: 'last', label: 'Last imported (CAT)', width: '190px', render: (r) => <MnLast row={r} /> },
          { key: 'status', label: 'Status', width: '150px', render: (r) => <StatusMark kind={UPLOAD_STATUS[r.status].kind} label={UPLOAD_STATUS[r.status].word} size="body-4" /> },
        ]} />
      {adding ? (
        <Dialog open title="New key upload" width={480} sheet={narrow}
          footer={<><Button variant="ghost" size="small" disabled={state === 'Saving'}>Cancel</Button><Button size="small" loading={state === 'Saving'}>Save</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Upload" required><Select options={['Collateral site report', 'Opening balances']} defaultValue="Collateral site report" disabled={state === 'Saving'} /></Field>
            <Field label="Threshold" required><Input defaultValue="2 operating days" disabled={state === 'Saving'} /></Field>
            <Field label="Owner" required><Select options={['Finance', 'Operations', 'Trading']} defaultValue="Finance" disabled={state === 'Saving'} /></Field>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}

export function ExceptionRulesList({ state = 'All', onOpen }) {
  const rows = state === 'No match' ? [] : state === 'Switched off' ? MN_RULES.map((r) => (r.id === 'e12' ? { ...r, status: 'Off' } : r)).filter((r) => r.status === 'Off') : MN_RULES;
  return (
    <ListView title="Exception rules" objects="exception rules" view={state === 'Switched off' ? 'Switched off' : 'All exception rules'} search="Search this list"
      filters={<Capsule chevron>Owner</Capsule>} rows={rows}
      columns={[
        { key: 'rule', label: 'Rule', width: 'minmax(200px, 1fr)', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.rule}</RecordLink> },
        { key: 'threshold', label: 'Threshold', width: '190px', wrap: true },
        { key: 'owner', label: 'Owner', width: '190px', wrap: true },
        { key: 'summary', label: 'Daily summary', width: '120px' },
        { key: 'eod', label: 'End-of-day report', width: '140px' },
        { key: 'status', label: 'Status', width: '110px', render: (r) => <StatusMark kind={r.status === 'Off' ? 'neutral' : 'clean'} label={r.status} size="body-4" /> },
      ]} />
  );
}
