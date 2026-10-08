/** Exceptions (M2.DS.01, UAG-32; canvas S09): the list view of the open exceptions for the viewer's roles, in the
    Clerk's operational wording and the owner's business wording, and the exception record page with Acknowledge and
    its History tab. Every screen takes `state`, one of its EXCEPTIONS_STATES entry, for ?screen=&state=.

    Severity shows through the type and the order of the rows, never a coloured tag. Value at risk (USD) is a column
    only for a viewer with the price tier. A record reference is a blue link only where the viewer can open that record.
    The owner's wording is business language only, from rule configuration (M2.ALR.01). Fictional sample data only. */

export const EXCEPTIONS_STATES = {
  ExceptionsList: ['Clerk', 'Owner', 'Acknowledged', 'Closed', 'Empty'],
  ExceptionRecord: ['Open', 'Acknowledge', 'Acknowledging', 'Acknowledged', 'History', 'Closed'],
};

/** Where an Exceptions screen sits: the Clerk's frame, or the owner's (the design system's own modules). */
export function exceptionsFrame(screen, state) {
  if (screen === 'ExceptionsList' && state === 'Owner') return { owner: true, module: 'command', breadcrumb: ['Command Center', 'Exceptions'] };
  if (screen === 'ExceptionRecord') return { module: 'home', breadcrumb: ['Home', 'Exceptions', 'EXC-000191'] };
  return { module: 'home', breadcrumb: ['Home', 'Exceptions'] };
}

// Ordered by severity, most severe first. The clerk sees the intake exceptions of his site; the owner sees every
// exception, in business words, with Value at risk because he holds the price tiers.
export const EXCEPTION_ROWS = [
  { id: 'EXC-000192', type: 'Intake', title: 'Weighbridge offline', record: 'Chisamba Shed weighbridge', business: 'Chisamba Shed weighbridge is offline since 09:10 CAT.', businessRecord: 'Chisamba Shed', value: '', owner: 'Clerk, Chisamba Shed', age: '2 h', status: 'open', clerk: true },
  { id: 'EXC-000191', type: 'Intake', title: 'Weighed in, not weighed out', record: 'WBT10001599', recordLink: true, business: 'Delivery not completed', businessRecord: 'Cameron Estates, maize', businessRecordLink: true, value: '9,640', owner: 'Clerk, Chisamba Shed', age: '3 h', status: 'open', clerk: true },
  { id: 'EXC-000190', type: 'Intake', title: 'Net differs from the printed slip', record: 'WBT10001603', recordLink: true, business: 'Delivered weight under review', businessRecord: 'Lakeview Farms Ltd, wheat', businessRecordLink: true, value: '1,220', owner: 'Clerk, Chisamba Shed', age: '1 h', status: 'open', clerk: true },
  { id: 'EXC-000189', type: 'Intake', title: 'Weighbridge record refused', record: 'Weighbridge record 10001611', business: 'Delivery not recorded', businessRecord: 'Chisamba Shed', value: '', owner: 'Clerk, Chisamba Shed', age: '2 h', status: 'open', clerk: true },
  { id: 'EXC-000188', type: 'Intake', title: 'Slip photo not read yet', record: 'Slip photo, Site A gate', business: 'Delivery waiting to be recorded', businessRecord: 'Site A gate', value: '', owner: 'Clerk, Site A gate', age: '50 min', status: 'open', clerk: true },
  { id: 'EXC-000184', type: 'Execution', title: 'Delivery overdue', record: 'SYN4702 leg C', business: 'Delivery overdue', businessRecord: 'SYN4702 leg C, Lakeview Farms Ltd', businessRecordLink: true, value: '81,600', owner: 'J. Mulenga', age: '10 days', status: 'open', clerk: false },
];
const ACKNOWLEDGED_ROWS = [
  { id: 'EXC-000187', type: 'Intake', title: 'Weighed in, not weighed out', record: 'WBT10001597', recordLink: true, business: 'Delivery not completed', businessRecord: 'Lakeview Farms Ltd, maize', value: '', owner: 'Clerk, Chisamba Shed', age: '1 day', status: 'acknowledged' },
];
const CLOSED_ROWS = [
  { id: 'EXC-000180', type: 'Intake', title: 'Weighed in, not weighed out', record: 'WBT10001588', recordLink: true, business: 'Delivery not completed', businessRecord: 'Lakeview Farms Ltd, maize', value: '', owner: 'Clerk, Chisamba Shed', age: '2 days', status: 'closed' },
  { id: 'EXC-000176', type: 'Intake', title: 'Weighbridge offline', record: 'Chisamba Shed weighbridge', business: 'Chisamba Shed weighbridge is offline since 06:40 CAT.', businessRecord: 'Chisamba Shed', value: '', owner: 'Clerk, Chisamba Shed', age: '3 days', status: 'closed' },
];

export function ExceptionsList({ state = 'Clerk', onOpen }) {
  const owner = state === 'Owner';
  const rows = state === 'Empty' ? [] : state === 'Acknowledged' ? ACKNOWLEDGED_ROWS : state === 'Closed' ? CLOSED_ROWS : owner ? EXCEPTION_ROWS : EXCEPTION_ROWS.filter((r) => r.clerk);
  const view = state === 'Closed' ? 'Closed exceptions' : state === 'Acknowledged' ? 'Acknowledged exceptions' : 'Open exceptions';
  return (
    <Sections>
      <WbHead title="Exceptions" count={rows.length} />
      <WbFilters view={view} search="Search this list" filters={<>
        <Capsule selected={state !== 'Acknowledged' && state !== 'Closed'}>Open</Capsule>
        <Capsule selected={state === 'Acknowledged'}>Acknowledged</Capsule>
        <Capsule selected={state === 'Closed'}>Closed</Capsule>
      </>} />
      <Card padding={rows.length ? 4 : 16}>
        <ExceptionList rows={rows} variant={owner ? 'owner' : 'clerk'} priceTier={owner} onOpen={onOpen} />
      </Card>
    </Sections>
  );
}

const EXC_HISTORY = [
  { id: 'x1', field: 'Status', user: 'One Link', old: '', next: 'Open', date: '26 Sep 2026, 08:12', note: '' },
];
const EXC_ACK = { id: 'x2', field: 'Status', user: 'S. Banda', old: 'Open', next: 'Acknowledged', date: '26 Sep 2026, 08:30', note: 'Driver called, truck coming back' };
const EXC_CLOSE = { id: 'x3', field: 'Status', user: 'S. Banda', old: 'Acknowledged', next: 'Closed', date: '26 Sep 2026, 11:02', note: 'Ticket WBT10001599 closed: truck left without weighing out' };

export function ExceptionRecord({ state = 'Open' }) {
  const narrow = wbNarrow();
  const initial = state === 'History' || state === 'Closed' ? 'History' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const acknowledged = state === 'Acknowledged' || state === 'History';
  const closed = state === 'Closed';
  const status = closed ? 'closed' : acknowledged ? 'acknowledged' : 'open';
  const history = [...(closed ? [EXC_CLOSE] : []), ...(acknowledged || closed ? [EXC_ACK] : []), ...EXC_HISTORY];
  const dialog = state === 'Acknowledge' || state === 'Acknowledging';
  const busy = state === 'Acknowledging';
  return (
    <Sections>
      <WbHead title="EXC-000191" />
      <RecordHighlights kind="Exception" title="EXC-000191" status={<ExceptionStatus status={status} />} tab={tab} onTab={setTab}
        actions={status === 'open' ? <Button size="small">Acknowledge</Button> : status === 'acknowledged' ? <Button variant="outline" size="small">Close</Button> : null}
        fields={[{ label: 'Type', value: 'Intake' }, { label: 'Owner', value: 'Clerk, Chisamba Shed' }, { label: 'Age', value: '3 h' }, { label: 'Linked record', value: 'WBT10001599', link: '#' }, { label: 'Counterparty', value: 'Cameron Estates' }]} />
      {tab === 'History' ? (
        <WbTable title="History" count={history.length} objects="changes" columns={[
          { key: 'field', label: 'Field', width: '120px' }, { key: 'user', label: 'User', width: '130px' },
          { key: 'old', label: 'Old value', width: '140px' }, { key: 'next', label: 'New value', width: '140px' },
          { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true }, { key: 'note', label: 'Note' },
        ]} rows={history} />
      ) : tab === 'Related' ? (
        <WbTable title="Weighbridge tickets" count={1} objects="weighbridge tickets" columns={[
          { key: 'ref', label: 'Ticket', width: '140px', render: (r) => <RefCell>{r.ref}</RefCell> }, { key: 'truck', label: 'Truck', width: '110px' },
          { key: 'gross', label: 'Gross (t)', width: '100px', align: 'right' }, { key: 'status', label: 'Status', render: () => <ReadinessChip kind="stalled" /> },
        ]} rows={[{ id: 'r1', ref: 'WBT10001599', truck: 'BAX 1234', gross: '38.500' }]} />
      ) : (
        <>
          <Card title="Exception information">
            <WbFacts fields={[['Exception', 'Weighed in, not weighed out'], ['Rule', 'Weigh-out expected within 2 operating hours'], ['Detected', '26 Sep 2026, 08:12 CAT'], ['Site', 'Chisamba Shed'], ['Truck', 'BAX 1234'], ['Weighed in', '26 Sep 2026, 06:12 CAT']]} />
          </Card>
          <Card title="System information">
            <WbFacts fields={[['Created by', 'One Link'], ['Created date', '26 Sep 2026, 08:12 CAT'], ['Last modified by', acknowledged ? 'S. Banda' : 'One Link'], ['Last modified date', acknowledged ? '26 Sep 2026, 08:30 CAT' : '26 Sep 2026, 08:12 CAT']]} />
          </Card>
        </>
      )}
      {dialog ? (
        <Dialog title="Acknowledge EXC-000191?" width={480} sheet={narrow} onClose={busy ? undefined : () => {}}
          footer={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Acknowledge</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span>The exception stays open.</span>
            <Field label="Note"><Input multiline disabled={busy} defaultValue={busy ? 'Driver called, truck coming back' : ''} /></Field>
          </div>
        </Dialog>
      ) : null}
    </Sections>
  );
}
