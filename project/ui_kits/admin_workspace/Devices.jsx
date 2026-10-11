/** Devices (M4.DS.03, UAG-185; S10 Users and access, M4 round): the phones the UAG One Link app runs on, in the four
    Setup patterns. The list view with Status and a Connection status column, New device with the enrolment code shown
    once in the same show-once code dialog as the activation code (S10), the device's record page with last contact,
    last sync, app version and Pending sync, Revoke confirmed in a dialog with a reason, and the History that Audit logs
    also carries. Every screen takes `state`, one of its DEVICES_STATES entry, for ?screen=&state=.

    A device's status is Active, Revoked or Spare. Silent is not a status: an Active phone that has stopped reporting
    shows Offline in its Connection status, as an icon and a word with no badge, and is counted on Setup Home's Silent
    devices card. Device numbers and user names are links, dates read DD MMM YYYY and times are 24-hour in CAT, and a
    value that does not exist yet (no last sync on a spare phone) is a blank cell. Fictional sample data only. */

export const DEVICES_STATES = {
  DevicesList: ['All', 'Silent', 'No match'],
  NewDevice: ['Form', 'Missing fields', 'Saving', 'Enrolment code shown once'],
  DeviceRecord: ['Active', 'Delayed', 'Offline', 'Code closed', 'Reissued code', 'Revoke', 'Revoking', 'Revoked', 'Related', 'History'],
};

export function devicesTitle(screen, state) {
  if (screen === 'NewDevice') return 'New device';
  if (screen === 'DeviceRecord') return deviceFor(state).ref;
  return null;
}

/** Device status (S10): Active, Revoked or Spare, each an icon and a word (UX-14). */
export const DEVICE_STATUS = {
  Active: <StatusMark kind="clean" label="Active" size="body-4" />,
  Revoked: <StatusMark kind="locked" label="Revoked" size="body-4" />,
  Spare: <StatusMark kind="neutral" label="Spare" size="body-4" />,
};
/** Connection status (S57 integrations: Connected, Delayed, Offline), an icon and a word, never a badge. Offline is the
    same mark the phone's own CaptureStatus draws, so web and phone agree. A revoked or spare phone has none: a blank cell. */
export const CONNECTION_STATUS = {
  Connected: <StatusMark kind="clean" label="Connected" size="body-4" />,
  Delayed: <StatusMark kind="pending" label="Delayed" size="body-4" />,
  Offline: <StatusMark kind="neutral" label="Offline" size="body-4" />,
};
const connection = (c) => (c ? CONNECTION_STATUS[c] : '');

export const DEVICES = [
  { id: 'dev-0007', ref: 'DEV-0007', user: 'P. Sakala', site: 'Chisamba Shed', version: '1.4.2', contact: '26 Sep 2026, 09:12', sync: '26 Sep 2026, 09:12', pending: '0', connection: 'Connected', status: 'Active' },
  { id: 'dev-0009', ref: 'DEV-0009', user: 'E. Mwale', site: 'Mpongwe Depot', version: '1.4.2', contact: '26 Sep 2026, 08:31', sync: '26 Sep 2026, 08:05', pending: '2', connection: 'Delayed', status: 'Active' },
  { id: 'dev-0010', ref: 'DEV-0010', user: 'B. Chanda', site: 'Mpongwe Depot', version: '1.4.2', contact: '25 Sep 2026, 16:48', sync: '25 Sep 2026, 16:48', pending: '1', connection: 'Offline', status: 'Active' },
  { id: 'dev-0011', ref: 'DEV-0011', user: 'G. Phiri', site: 'Chisamba Shed', version: '1.4.1', contact: '25 Sep 2026, 14:02', sync: '25 Sep 2026, 13:40', pending: '3', connection: 'Offline', status: 'Active' },
  { id: 'dev-0004', ref: 'DEV-0004', user: 'S. Banda', site: 'Mpongwe Depot', version: '1.3.9', contact: '25 Sep 2026, 10:12', sync: '25 Sep 2026, 10:12', pending: '', connection: '', status: 'Revoked' },
  { id: 'dev-0012', ref: 'DEV-0012', user: '', site: 'Chisamba Shed', version: '', contact: '', sync: '', pending: '', connection: '', status: 'Spare' },
];

/** Silent: an Active phone whose Connection status is Offline (S10). The Setup Home card counts these. */
export const silentDevices = (list = DEVICES) => list.filter((d) => d.status === 'Active' && d.connection === 'Offline');

function deviceFor(state) {
  if (state === 'Delayed') return DEVICES[1];
  if (state === 'Active') return DEVICES[0];
  if (state === 'Code closed' || state === 'Reissued code') return DEVICES[5];
  if (state === 'Revoked') return DEVICES[4];
  return DEVICES[3];
}

export function DevicesList({ state = 'All', onOpen }) {
  const rows = state === 'No match' ? [] : state === 'Silent' ? silentDevices() : DEVICES;
  return (
    <ListView title="Devices" objects="devices" search="Search devices" view={state === 'Silent' ? 'Silent devices' : 'All devices'}
      primary={<Button size="small" icon="plus">New</Button>}
      columns={[
        { key: 'ref', label: 'Device', width: '120px', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.ref}</RecordLink> },
        { key: 'user', label: 'Assigned to', width: '140px', render: (r) => (r.user ? <RecordLink>{r.user}</RecordLink> : '') },
        { key: 'site', label: 'Site', width: '150px' },
        { key: 'version', label: 'App version', width: '120px', tabular: true },
        { key: 'contact', label: 'Last contact (CAT)', width: '170px', tabular: true },
        { key: 'connection', label: 'Connection status', width: '160px', render: (r) => connection(r.connection) },
        { key: 'status', label: 'Status', width: '120px', render: (r) => DEVICE_STATUS[r.status] },
      ]} rows={rows} />
  );
}

const FIELD_STAFF = ['', 'P. Sakala', 'E. Mwale', 'B. Chanda', 'G. Phiri'];

/** Register a phone: its serial number and site, and who carries it (left blank, it is a spare). Save issues the
    enrolment code, shown once in the show-once code dialog the activation code uses (S10), and never again. */
export function NewDevice({ state = 'Form' }) {
  const missing = state === 'Missing fields';
  const busy = state === 'Saving';
  return (
    <Sections>
      <SetupHead title="New device" right={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Save</Button></>} />
      <Card title="Device information" padding={16}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <Field label="Serial number" required error={missing ? 'Serial number is required.' : null}><Input defaultValue={missing ? '' : 'R58W40KQ2LM'} invalid={missing} disabled={busy} /></Field>
          <Field label="Site" required><Select options={['Chisamba Shed', 'Mpongwe Depot']} disabled={busy} /></Field>
          <Field label="Assigned to"><Select options={FIELD_STAFF} defaultValue="" disabled={busy} /></Field>
        </div>
      </Card>
      {state === 'Enrolment code shown once' ? <OneTimeCode title="Enrolment code" code="H6T-3RW-9KD" expires="28 Sep 2026, 09:15 CAT" /> : null}
    </Sections>
  );
}

const DEVICE_HISTORY = [
  { id: 'h3', field: 'Status', user: 'N. Phiri', old: 'Active', next: 'Revoked', date: '25 Sep 2026, 10:30', reason: 'Phone reported lost' },
  { id: 'h2', field: 'Enrolment code', user: 'N. Phiri', old: '', next: 'Issued', date: '02 Sep 2026, 08:10', reason: '' },
  { id: 'h1', field: 'Device', user: 'N. Phiri', old: '', next: 'Created', date: '02 Sep 2026, 08:10', reason: '' },
];

/** The device's record page (UX-19): highlights with last contact, last sync, app version and Pending sync, the
    Details, Related and History tabs, Revoke as the destructive action (UX-17) confirmed with a reason (UX-22). The
    enrolment code is shown once, and once closed the record offers Reissue enrolment code, never the code. */
export function DeviceRecord({ state = 'Offline' }) {
  const d = deviceFor(state);
  const initial = state === 'History' ? 'History' : state === 'Related' ? 'Related' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const revoked = d.status === 'Revoked';
  const spare = d.status === 'Spare';
  const actions = revoked ? null : spare
    ? <><Button variant="outline" size="small">Edit</Button><Button size="small">Reissue enrolment code</Button></>
    : <><Button variant="critical-ghost" size="small">Revoke</Button><Button variant="outline" size="small">Edit</Button></>;
  const user = d.user ? <RecordLink>{d.user}</RecordLink> : '';
  const fields = spare
    ? [{ label: 'Assigned to', value: '' }, { label: 'Site', value: d.site }, { label: 'Enrolment code', value: state === 'Reissued code' ? 'Reissued, expires 29 Sep 2026, 10:00' : 'Issued, expires 28 Sep 2026, 09:15' }, { label: 'Last contact', value: '' }, { label: 'Last sync', value: '' }]
    : [{ label: 'Assigned to', value: user }, { label: 'Connection status', value: connection(d.connection) }, { label: 'Last contact', value: d.contact },
      { label: 'Last sync', value: d.sync }, { label: 'App version', value: d.version }, { label: 'Pending sync', value: d.pending }];
  const history = spare
    ? [{ id: 's2', field: 'Enrolment code', user: 'N. Phiri', old: '', next: state === 'Reissued code' ? 'Reissued' : 'Issued', date: state === 'Reissued code' ? '26 Sep 2026, 10:00' : '25 Sep 2026, 09:15', reason: '' },
      { id: 's1', field: 'Device', user: 'N. Phiri', old: '', next: 'Created', date: '25 Sep 2026, 09:15', reason: '' }]
    : revoked ? DEVICE_HISTORY : DEVICE_HISTORY.slice(1);
  return (
    <Sections>
      <SetupHead title={d.ref} />
      {revoked ? <ConditionBanner>Revoked by N. Phiri, 25 Sep 2026, 10:30 CAT. Captures from this phone go to Captures in review.</ConditionBanner> : null}
      <RecordHighlights kind="Device" title={d.ref} status={DEVICE_STATUS[d.status]} actions={actions} fields={fields} tab={tab} onTab={setTab} />
      {tab === 'History' ? (
        <CountCard title="History" objects="changes" count={history.length}>
          <SetupTable columns={[
            { key: 'field', label: 'Field', width: '150px' }, { key: 'user', label: 'User', width: '120px' },
            { key: 'old', label: 'Old value', width: '120px' }, { key: 'next', label: 'New value', width: '120px' },
            { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true }, { key: 'reason', label: 'Reason', wrap: true },
          ]} rows={history} />
        </CountCard>
      ) : tab === 'Related' ? (
        <CountCard title="Captures in review" objects="captures" count={d.ref === 'DEV-0011' ? 1 : 0}>
          <SetupTable columns={[
            { key: 'ref', label: 'Capture', width: '130px', render: (r) => <RecordLink>{r.ref}</RecordLink> },
            { key: 'reason', label: 'Reason' }, { key: 'captured', label: 'Captured (CAT)', width: '170px', tabular: true },
            { key: 'status', label: 'Status', width: '160px', render: () => <StatusMark kind="pending" label="Pending approval" size="body-4" /> },
          ]} rows={[{ id: 'c317', ref: 'CAP-000317', reason: 'Late capture', captured: '25 Sep 2026, 13:58' }]} />
        </CountCard>
      ) : (
        <Card title="Device information" padding={16}>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[['Device', d.ref], ['Serial number', spare ? 'R58W40KQ2LM' : 'R58T21MX7PA'], ['Site', d.site], ['Status', d.status],
              ...(revoked ? [['Revoked', '25 Sep 2026, 10:30'], ['Reason', 'Phone reported lost']] : []), ['Enrolled', spare ? '' : '02 Sep 2026, 08:42']].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}><dt style={textStyle('body-4', { tone: 'secondary' })}>{l}</dt><dd style={{ margin: 0, minHeight: 20, ...textStyle('body-3'), overflowWrap: 'anywhere' }}>{v}</dd></div>
            ))}
          </dl>
        </Card>
      )}
      {state === 'Reissued code' ? <OneTimeCode title="Enrolment code" code="M2V-7QX-4HN" expires="29 Sep 2026, 10:00 CAT" /> : null}
      {state === 'Revoke' || state === 'Revoking' ? (
        <ReasonDialog title={`Revoke ${d.ref}?`} label="Reason" minLength={1} confirmLabel="Revoke" confirmVariant="critical" busy={state === 'Revoking'} defaultReason={state === 'Revoking' ? 'Phone reported lost' : ''}>
          Captures from this phone go to Captures in review.
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}
