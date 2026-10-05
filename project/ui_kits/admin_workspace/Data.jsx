/** Setup, Data (M3.DS.01, UAG-41; S10): Templates, Upload history and Production readiness. The Templates list view,
    the New template form, the template version editor with its column mapping tested against a header row, the
    comparison of two versions, the Upload history list view, an upload's record page (Reversed, its reversal records,
    the warnings recorded at import, the Reverse dialog and its refused state), and the Production readiness record
    with the Records open switch. The template record itself is Records.jsx's TemplateBuilder, and the upload preview
    is Records.jsx's UploadPreview, which this card extends. Every screen takes `state`, one of its DATA_STATES entry,
    so the kit's index and the screenshot review open any state with ?screen=&state=.

    Setup shows no price figures (S10 control 4): templates show column names, types and tier tags, never a row's
    values. Fictional sample data only: SYN4702, Riverbend Milling, Lakeview Farms Ltd, Chisamba Shed, Mpongwe Depot,
    and people with initials. */

export const DATA_STATES = {
  TemplatesList: ['All', 'No match'],
  NewTemplate: ['Form', 'Missing fields', 'Saving'],
  TemplateVersion: ['From a headers file', 'From an upload', 'Remove a column', 'Make a column required', 'Saving'],
  TemplateCompare: ['Version 1 and version 2'],
  UploadHistory: ['All', 'Reversed', 'Discarded', 'No match'],
  UploadRecord: ['Reversed', 'Related', 'History', 'Imported', 'Reverse', 'Reversing', 'Reverse refused'],
  ProductionReadiness: ['Evidence missing', 'Ready to open', 'Propose opening', 'Submitting', 'Pending approval', 'Open'],
};

/** The record a Data screen's state shows, for the breadcrumb. */
export function dataTitle(screen, state) {
  if (screen === 'NewTemplate') return 'New template';
  if (screen === 'TemplateVersion') return 'Trade sheet, version 3';
  if (screen === 'TemplateCompare') return 'Trade sheet';
  if (screen === 'UploadRecord') return uploadFor(state).id;
  return null;
}

/** Template and upload statuses: an icon and a word (UX-14). */
const D_STATUS = {
  Active: <StatusMark kind="clean" label="Active" size="body-4" />,
  Draft: <StatusMark kind="neutral" label="Draft" size="body-4" />,
  Scheduled: <StatusMark kind="pending" label="Scheduled" size="body-4" />,
  Retired: <StatusMark kind="flat" label="Retired" size="body-4" />,
  Imported: <StatusMark kind="clean" label="Imported" size="body-4" />,
  Reversed: <StatusMark kind="neutral" label="Reversed" size="body-4" />,
  Discarded: <StatusMark kind="neutral" label="Discarded" size="body-4" />,
  Posted: <StatusMark kind="clean" label="Posted" size="body-4" />,
  Recorded: <StatusMark kind="clean" label="Recorded" size="body-4" />,
  Missing: <StatusMark kind="breach" label="Missing" size="body-4" />,
};

/* ------------------------------------------------------------------ Templates */

// Who may upload is set per template by the administrator (Map D-39). No person is named by default: a template with
// no bundle yet reads Not set, and nobody may upload it.
export const TEMPLATE_ROWS = [
  { id: 'trade', name: 'Trade sheet', loads: 'Trades, contracts and prices', version: '2', from: '08 Oct 2026', who: 'Trading, Trading support', status: 'Active' },
  { id: 'register', name: 'Contract register', loads: 'Contracts', version: '2', from: '01 Sep 2026', who: 'Trading, Trading support', status: 'Active' },
  { id: 'stock', name: 'Stock sheet', loads: 'Opening stock by site', version: '1', from: '01 Oct 2026', who: 'Stock control', status: 'Active' },
  { id: 'season', name: 'Season book', loads: 'Farmer accounts and inputs', version: '1', from: '15 Oct 2026', who: '', status: 'Scheduled' },
  { id: 'dispatch', name: 'Dispatch report', loads: 'Loads dispatched from port', version: '1', from: '', who: 'Operations', status: 'Draft' },
  { id: 'loads', name: 'Load register', loads: 'Loads delivered before One Link', version: '1', from: '01 Sep 2026', who: 'Operations', status: 'Retired' },
];

export function TemplatesList({ state = 'All', onOpen }) {
  return (
    <ListView title="Templates" objects="templates" search="Search templates" view="All templates" primary={<Button size="small">New</Button>}
      filters={<Capsule chevron>Status: All</Capsule>}
      columns={[
        { key: 'name', label: 'Template', width: 'minmax(160px, 1fr)', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.name}</RecordLink> },
        { key: 'loads', label: 'Loads', width: 'minmax(200px, 1fr)', wrap: true },
        { key: 'version', label: 'Version', width: '100px', align: 'right', tabular: true },
        { key: 'from', label: 'Effective from', width: '150px', tabular: true },
        { key: 'who', label: 'Who may upload', width: '200px', wrap: true, render: (r) => (r.who ? r.who : <NotSet size="body-4" />) },
        { key: 'status', label: 'Status', width: '140px', render: (r) => D_STATUS[r.status] },
      ]} rows={state === 'No match' ? [] : TEMPLATE_ROWS} />
  );
}

const D_BUNDLES = ['Trading', 'Trading support', 'Operations', 'Stock control', 'Finance'];

export function NewTemplate({ state = 'Form' }) {
  const missing = state === 'Missing fields';
  const busy = state === 'Saving';
  return (
    <Sections>
      <SetupHead title="New template" right={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Save</Button></>} />
      <Card title="Template information" padding={16}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Field label="Name" required error={missing ? 'Name is required.' : null}><Input defaultValue={missing ? '' : 'Season book'} invalid={missing} disabled={busy} /></Field>
          <Field label="Loads" required><Select options={['Farmer accounts and inputs', 'Trades, contracts and prices', 'Opening stock by site', 'Loads dispatched from port']} disabled={busy} /></Field>
          <Field label="Sheet" required hint="The name of the sheet in the workbook."><Input defaultValue="Season book" disabled={busy} /></Field>
          <Field label="Effective from" required><Input defaultValue="15 Oct 2026, 00:00 CAT" disabled={busy} /></Field>
        </div>
      </Card>
      <Card title="Header row" padding={16}>
        <Field label="File" required hint="A file with the header row only. The first version maps its headings." error={missing ? 'File must have a header row.' : null}>
          <Input defaultValue={missing ? 'Season book blank.xlsx' : 'Season book headers.xlsx'} invalid={missing} disabled={busy} />
        </Field>
      </Card>
      <Card title="Who may upload" padding={16}>
        <Field label="Bundles" hint="Nobody may upload until a bundle is named here.">
          <CheckboxList options={D_BUNDLES} values={[]} disabled={busy} />
        </Field>
      </Card>
    </Sections>
  );
}

// The trade sheet's versions. A tier that comes from the figure-to-tier mapping is read-only (tierFrom: 'mapping').
export const TRADE_V1 = [
  { source: 'Contract no', field: 'Contract', type: 'Reference', required: true },
  { source: 'Buyer', field: 'Counterparty', type: 'Name', required: true },
  { source: 'Product', field: 'Product', type: 'List', required: true },
  { source: 'Qty', field: 'Quantity', type: 'Tonnes', required: true },
  { source: 'Buy price K/t', field: 'Purchase price', type: 'Money', required: true, tier: 'Contract', tierFrom: 'mapping' },
  { source: 'Sell price USD/t', field: 'Sale price', type: 'Money', required: true, tier: 'Sell', tierFrom: 'mapping' },
  { source: 'Comments', field: 'Note', type: 'Text', required: false },
];
export const TRADE_V2 = [
  ...TRADE_V1.slice(0, 3),
  { source: 'Qty', field: 'Contracted tonnage', type: 'Tonnes', required: true },
  ...TRADE_V1.slice(4, 6),
  { source: 'Delivery window', field: 'Delivery window', type: 'Month range', required: true },
  { source: 'Transport rate', field: 'Transport rate', type: 'Money', required: false, tier: 'Contract', tierFrom: 'mapping' },
];
const TRADE_FIELDS = ['Contract', 'Counterparty', 'Product', 'Quantity', 'Contracted tonnage', 'Purchase price', 'Sale price', 'Delivery window', 'Transport rate', 'Sheet delivered to date', 'Note'];
const CELLS = 'ABCDEFGHIJ';

/** Version 3 of the trade sheet as the editor draws it in each state, tested against its header row. */
function versionThree(state) {
  const headers = [...TRADE_V2, { source: 'Delivered to date', field: 'Sheet delivered to date', type: 'Tonnes', required: false }]
    .map((c, i) => ({ ...c, found: true, cell: `${CELLS[i]}1` }));
  if (state === 'From a headers file') return headers;
  if (state === 'Make a column required') return headers.map((c) => (c.source === 'Transport rate' ? { ...c, required: true } : c));
  // Captured from an upload whose headers did not match: the file says Delivery month where version 2 says
  // Delivery window, so Delivery window is not in the header row and Delivery month is a new column.
  const fromUpload = [...TRADE_V2.filter((c) => c.source !== 'Delivery window'), { source: 'Delivery month', field: 'Delivery window', type: 'Month range', required: true }]
    .map((c, i) => ({ ...c, found: true, cell: `${CELLS[i]}1` }));
  if (state === 'Remove a column' || state === 'Saving') return fromUpload;
  return [...fromUpload, { ...TRADE_V2.find((c) => c.source === 'Delivery window'), found: false }];
}

export function TemplateVersion({ state = 'From a headers file' }) {
  const [columns, setColumns] = useState(versionThree(state));
  useEffect(() => setColumns(versionThree(state)), [state]);
  const change = (source, patch) => setColumns((cs) => cs.map((c) => (c.source === source ? { ...c, ...patch } : c)));
  const fromUpload = state !== 'From a headers file' && state !== 'Make a column required';
  const destructive = mappingChanges(TRADE_V2, columns).filter((c) => c.destructive);
  const confirming = state === 'Remove a column' || state === 'Make a column required' || state === 'Saving';
  return (
    <Sections>
      <SetupHead title="Trade sheet, version 3" right={<><Button variant="ghost" size="small">Cancel</Button><Button size="small">Save version</Button></>} />
      <Card title="Version" padding={16}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Field label="Effective from" required><Input defaultValue="15 Oct 2026, 00:00 CAT" /></Field>
          <Field label="Header row from" hint={fromUpload ? 'The headings of an upload that did not match version 2.' : 'A file with the header row only.'}>
            <Input defaultValue={fromUpload ? 'Trade sheet 08 Oct 2026.xlsx, UPL-000245' : 'Trade sheet headers.xlsx'} disabled />
          </Field>
          <Field label="Sheet"><Input defaultValue="Trades" disabled /></Field>
        </div>
      </Card>
      <CountCard title="Columns" objects="columns" count={columns.length}>
        <ColumnMapping editable fields={TRADE_FIELDS} columns={columns} onChange={change} />
      </CountCard>
      {confirming ? (
        <ReasonDialog title="Confirm template change" confirmLabel="Save version" busy={state === 'Saving'} sheet={narrowNow()}
          defaultReason={state === 'Saving' ? 'The trade sheet now names the delivery month' : ''}>
          {`Version 3 of Trade sheet, from 15 Oct 2026, 00:00 CAT: ${destructive.map((c) => c.words).join(' ')}`}
        </ReasonDialog>
      ) : null}
    </Sections>
  );
}

export function TemplateCompare() {
  const rows = compareVersions(TRADE_V1, TRADE_V2);
  return (
    <Sections>
      <SetupHead title="Trade sheet, version 1 and version 2" right={<Button variant="outline" size="small">New version</Button>} />
      <CountCard title="Columns" objects="columns" count={rows.length}>
        <VersionCompare before={{ label: 'Version 1, from 01 Sep 2026', columns: TRADE_V1 }} after={{ label: 'Version 2, from 08 Oct 2026', columns: TRADE_V2 }} />
      </CountCard>
    </Sections>
  );
}

/* ------------------------------------------------------------------ Upload history */

export const UPLOAD_ROWS_HISTORY = [
  { id: 'UPL-000245', file: 'Trade sheet 08 Oct 2026.xlsx', print: '9F2A 41C0 7B3E', version: 'Trade sheet v2', by: 'L. Mulenga', time: '08 Oct 2026, 09:40', rows: '42', imported: '0', status: 'Discarded' },
  { id: 'UPL-000240', file: 'Trade sheet 01 Oct 2026.xlsx', print: '3B71 C2E8 0D94', version: 'Trade sheet v2', by: 'L. Mulenga', time: '01 Oct 2026, 09:12', rows: '40', imported: '38', status: 'Imported' },
  { id: 'UPL-000236', file: 'Stock sheet 30 Sep 2026.xlsx', print: '77D0 1A9B 52C6', version: 'Stock sheet v1', by: 'K. Zulu', time: '30 Sep 2026, 16:05', rows: '24', imported: '24', status: 'Imported' },
  { id: 'UPL-000231', file: 'Trade sheet 24 Sep 2026.xlsx', print: 'C04E 88F1 6A27', version: 'Trade sheet v1', by: 'L. Mulenga', time: '24 Sep 2026, 10:02', rows: '39', imported: '37', status: 'Reversed' },
  { id: 'UPL-000228', file: 'Contract register 22 Sep 2026.xlsx', print: '5E19 B07A 3F82', version: 'Contract register v2', by: 'J. Tembo', time: '22 Sep 2026, 14:30', rows: '12', imported: '0', status: 'Discarded' },
];

export function UploadHistory({ state = 'All', onOpen }) {
  const rows = state === 'Reversed' || state === 'Discarded' ? UPLOAD_ROWS_HISTORY.filter((r) => r.status === state) : state === 'No match' ? [] : UPLOAD_ROWS_HISTORY;
  return (
    <ListView title="Upload history" objects="uploads" search="Search uploads" view="All uploads" primary={<Button size="small" icon="upload">Import</Button>}
      filters={<><Capsule chevron>Template: All</Capsule><Capsule selected={state === 'Reversed'}>Reversed</Capsule><Capsule selected={state === 'Discarded'}>Discarded</Capsule></>}
      columns={[
        { key: 'id', label: 'Upload', width: '130px', render: (r) => <RecordLink onClick={() => onOpen && onOpen(r.id)}>{r.id}</RecordLink> },
        { key: 'file', label: 'File', width: 'minmax(200px, 1fr)', wrap: true },
        { key: 'print', label: 'Fingerprint', width: '150px', tabular: true },
        { key: 'version', label: 'Template version', width: '190px', wrap: true },
        { key: 'by', label: 'Uploaded by', width: '130px' },
        { key: 'time', label: 'Time (CAT)', width: '170px', tabular: true },
        { key: 'rows', label: 'Rows', width: '80px', align: 'right', tabular: true },
        { key: 'imported', label: 'Imported', width: '100px', align: 'right', tabular: true },
        { key: 'status', label: 'Status', width: '130px', render: (r) => D_STATUS[r.status] },
      ]} rows={rows} />
  );
}

function uploadFor(state) {
  return state === 'Reversed' || state === 'Related' || state === 'History' ? UPLOAD_ROWS_HISTORY[3] : UPLOAD_ROWS_HISTORY[1];
}

const UPLOAD_WARNINGS = [
  { id: 'w1', row: '5', cell: 'K5', warning: 'Sheet figure differs: delivered to date 4,180.000 t, recorded 4,200.000 t' },
  { id: 'w2', row: '12', cell: 'A12', warning: 'Already recorded, skipped: SYN4702-B' },
];
const REVERSAL_ROWS = [
  { id: 'r1', record: 'SYN4702-C', change: 'Contracted tonnage back to 150.000 t', date: '26 Sep 2026, 11:30', status: 'Posted' },
  { id: 'r2', record: 'SYN4790', change: 'Contract reversed', date: '26 Sep 2026, 11:30', status: 'Posted' },
  { id: 'r3', record: 'SYN4791', change: 'Contract reversed', date: '26 Sep 2026, 11:30', status: 'Posted' },
];
const DEPENDENTS = [
  { id: 'd1', record: 'KAL-07', what: 'Load delivered against SYN4845', date: '03 Oct 2026' },
  { id: 'd2', record: 'INV-0425', what: 'Invoice raised on SYN4845', date: '04 Oct 2026' },
];

export function UploadRecord({ state = 'Reversed' }) {
  const u = uploadFor(state);
  const reversed = u.status === 'Reversed';
  const initial = state === 'Related' ? 'Related' : state === 'History' ? 'History' : 'Details';
  const [tab, setTab] = useState(initial);
  useEffect(() => setTab(initial), [state]);
  const narrow = narrowNow();
  return (
    <Sections>
      <SetupHead title={u.id} />
      <RecordHighlights kind="Upload" title={u.id} status={D_STATUS[u.status]} tab={tab} onTab={setTab}
        actions={reversed ? null : <Button variant="outline" size="small">Reverse</Button>}
        fields={[{ label: 'File', value: u.file }, { label: 'Template version', value: u.version }, { label: 'Uploaded by', value: u.by }, { label: 'Time', value: `${u.time} CAT` }, { label: 'Rows', value: u.rows }, { label: 'Imported', value: u.imported }]} />
      {tab === 'History' ? (
        <ChangesCard rows={[
          { id: 'h1', field: 'Status', user: 'N. Phiri', old: 'Imported', next: 'Reversed', date: '26 Sep 2026, 11:30', reason: 'Rows read under the wrong delivery months' },
          { id: 'h2', field: 'Status', user: 'L. Mulenga', old: 'Ready to import', next: 'Imported', date: '24 Sep 2026, 10:06', reason: '' },
        ]} />
      ) : tab === 'Related' ? (
        <CountCard title="Reversal records" objects="reversal records" count={REVERSAL_ROWS.length}>
          <SetupTable rowKey="id" columns={[
            { key: 'record', label: 'Record', width: '130px', render: (r) => <RecordLink>{r.record}</RecordLink> },
            { key: 'change', label: 'Change', wrap: true }, { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true },
            { key: 'status', label: 'Status', width: '120px', render: (r) => D_STATUS[r.status] },
          ]} rows={REVERSAL_ROWS} />
        </CountCard>
      ) : (
        <>
          {reversed ? <DetailsCard title="Reversal" fields={[['Reversed by', 'N. Phiri'], ['Reversed', '26 Sep 2026, 11:30 CAT'], ['Reason', 'Rows read under the wrong delivery months'], ['Reversal records', '3']]} /> : null}
          <DetailsCard title="File" fields={[['File', u.file], ['Fingerprint', u.print], ['Template version', u.version], ['Sheet', 'Trades']]} />
          <CountCard title="Warnings at import" objects="warnings" count={UPLOAD_WARNINGS.length}>
            <SetupTable rowKey="id" columns={[{ key: 'row', label: 'Row', width: '72px', align: 'right', tabular: true }, { key: 'cell', label: 'Cell', width: '90px', tabular: true }, { key: 'warning', label: 'Warning', wrap: true }]} rows={UPLOAD_WARNINGS} />
          </CountCard>
        </>
      )}
      {state === 'Reverse' || state === 'Reversing' ? <ReverseDialog record={u.id} busy={state === 'Reversing'} sheet={narrow} /> : null}
      {state === 'Reverse refused' ? (
        <Dialog title={`Reverse ${u.id}?`} width={480} sheet={narrow} footer={<Button variant="ghost" size="small">Close</Button>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Refusal action="Reverse" reason="Records made after this upload depend on what it imported" />
            <div style={{ margin: '0 -8px' }}>
              <SetupTable rowKey="id" columns={[{ key: 'record', label: 'Record', width: '100px', render: (r) => <RecordLink>{r.record}</RecordLink> }, { key: 'what', label: 'Depends on it', wrap: true }, { key: 'date', label: 'Date', width: '110px', tabular: true }]} rows={DEPENDENTS} />
            </div>
          </div>
        </Dialog>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ Production readiness */

const EVIDENCE = [
  { id: 'e1', item: 'Production in its own account, with no root credentials or user accounts', by: 'N. Phiri', at: '22 Sep 2026', where: 'Release log, entry 14' },
  { id: 'e2', item: 'Key policies decrypt only for named service roles', by: 'N. Phiri', at: '22 Sep 2026', where: 'Release log, entry 15' },
  { id: 'e3', item: 'Policy simulator refuses engineers records, files, secrets and log events', by: 'N. Phiri', at: '23 Sep 2026', where: 'Release log, entry 16' },
  { id: 'e4', item: 'Organisation rules and their change notification', by: 'N. Phiri', at: '23 Sep 2026', where: 'Release log, entry 17' },
  { id: 'e5', item: 'Reviewer role for the company', by: 'T. Mwila', at: '24 Sep 2026', where: 'Access review, 24 Sep 2026' },
  { id: 'e6', item: 'Release log', by: 'N. Phiri', at: '24 Sep 2026', where: 'Release log' },
  { id: 'e7', item: 'AI services opt-out', by: 'N. Phiri', at: '25 Sep 2026', where: 'Release log, entry 19' },
  { id: 'e8', item: 'Break-glass drill', by: 'N. Phiri', at: '29 Sep 2026', where: 'Drill report, 29 Sep 2026' },
  { id: 'e9', item: 'Witnessed bootstrap', by: 'T. Mwila', at: '30 Sep 2026', where: 'Bootstrap record, 30 Sep 2026' },
  { id: 'e10', item: 'Failover rehearsal', by: 'N. Phiri', at: '02 Oct 2026', where: 'Rehearsal report, 02 Oct 2026', late: true },
  { id: 'e11', item: 'Restore rehearsal', by: 'N. Phiri', at: '03 Oct 2026', where: 'Rehearsal report, 03 Oct 2026', late: true },
  { id: 'e12', item: 'Data residency decision, recorded by the company as controller', by: 'T. Mwila', at: '05 Oct 2026', where: 'Board minute 2026-41', late: true },
];

export function ProductionReadiness({ state = 'Evidence missing' }) {
  const missing = state === 'Evidence missing';
  const open = state === 'Open';
  const pending = state === 'Pending approval';
  const busy = state === 'Submitting';
  const narrow = narrowNow();
  const rows = EVIDENCE.map((e) => (missing && e.late ? { ...e, by: '', at: '', where: '', status: 'Missing' } : { ...e, status: 'Recorded' }));
  const missingCount = rows.filter((r) => r.status === 'Missing').length;
  return (
    <Sections>
      <SetupHead title="Production readiness" />
      {open ? null : <ConditionBanner>Records open is off. Production does not accept uploads or counterparty changes.</ConditionBanner>}
      {pending ? <ConditionBanner>Change to On submitted for approval by N. Phiri, 05 Oct 2026, 10:20 CAT. Waiting for T. Mwila.</ConditionBanner> : null}
      <RecordHighlights kind="Switch" title="Records open" status={pending ? <StatusMark kind="pending" label="Pending approval" size="body-4" /> : <StatusMark kind="clean" label="Active" size="body-4" />} tabs={[]}
        actions={pending || open ? null : <Button size="small">Propose change</Button>}
        fields={[{ label: 'Scope', value: 'Production' }, { label: 'In force', value: open ? 'On' : 'Off' }, { label: 'Values', value: 'Off, On' }, { label: 'Approver', value: 'Owner' }, { label: 'Owner bundle', value: 'Administrator' },
          ...(open ? [{ label: 'Opened by', value: 'T. Mwila' }, { label: 'Opened', value: '06 Oct 2026, 08:00 CAT' }] : [{ label: 'Evidence missing', value: String(missingCount) }])]} />
      <CountCard title="Evidence" objects="evidence" count={rows.length}>
        <SetupTable rowKey="id" columns={[
          { key: 'item', label: 'Evidence', width: 'minmax(240px, 1fr)', wrap: true },
          { key: 'by', label: 'Recorded by', width: '130px' },
          { key: 'at', label: 'Recorded', width: '130px', tabular: true },
          { key: 'where', label: 'Where it sits', width: '220px', wrap: true },
          { key: 'status', label: 'Status', width: '130px', render: (r) => D_STATUS[r.status] },
        ]} rows={rows} />
      </CountCard>
      {state === 'Propose opening' || busy ? (
        <Dialog title="Propose change" width={480} sheet={narrow} onClose={busy ? undefined : () => {}}
          footer={<><Button variant="ghost" size="small" disabled={busy}>Cancel</Button><Button size="small" loading={busy}>Submit for approval</Button></>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}><dt style={textStyle('body-4', { tone: 'secondary' })}>Current value</dt><dd style={{ margin: 0, ...textStyle('body-3') }}>Off</dd></dl>
            <Field label="New value" required><Select options={['On', 'Off']} disabled={busy} /></Field>
            <Field label="Reason" required><Input multiline defaultValue="Every piece of readiness evidence is recorded" disabled={busy} /></Field>
          </div>
        </Dialog>
      ) : null}
    </Sections>
  );
}
