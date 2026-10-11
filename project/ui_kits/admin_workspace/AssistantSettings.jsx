/** Setup: Assistant settings (M5.DS.01, UAG-139; S10 Security and audit, M5 round; the controls are M5.AI.01's). Not
    designed on any canvas: drawn as Proposed in the Setup record pattern (sid-switch-admin 13, 14). The record holds
    the Assistant allowlist and the Assistant log. The log has two views: the Managing Director's, which carries each
    question and response, and the administrator's, which carries metadata only (user, time, model, duration and
    outcome), with the question and response columns left out rather than drawn restricted. Export draws its working
    state. Every screen takes `state`, one of its ASSISTANT_SETTINGS_STATES entry, for ?screen=&state=.

    Configuration words only; no explanatory text. The Managing Director's view is an Owen-facing screen, so its words
    keep the M5 banned-word list. Fictional sample data only. */

export const ASSISTANT_SETTINGS_STATES = {
  AssistantSettings: ['Allowlist', 'Log, administrator view', 'Log, Managing Director view', 'Exporting log'],
};

/** The models the Assistant may call: chosen only from the catalogue, each reached in the region or through the
    EU-only routing profile, and none sharing data with the provider (M5.AI.01 AC 2, 9). */
const AS_MODELS = [
  { id: 'm1', model: 'Claude Haiku 4.5', provider: 'Anthropic, through Amazon Bedrock', route: 'In region, eu-west-1', sharing: 'Off', added: '12 Oct 2026', status: 'Active' },
  { id: 'm2', model: 'Claude Sonnet 4.5', provider: 'Anthropic, through Amazon Bedrock', route: 'EU-only routing profile', sharing: 'Off', added: '12 Oct 2026', status: 'Active' },
];

/** The Assistant log: one row per question asked. Question and Response are the Managing Director's columns only. */
const AS_LOG = [
  { id: 'q1', user: 'T. Mwila', time: '26 Sep 2026, 10:14', model: 'Claude Haiku 4.5', duration: '2.4 s', outcome: 'Answered', question: 'Long or short on SYN4702?', response: 'SYN4702 is short 800 t.' },
  { id: 'q2', user: 'T. Mwila', time: '26 Sep 2026, 09:52', model: 'Claude Haiku 4.5', duration: '3.1 s', outcome: 'Withheld', question: 'What will the maize price be next month?', response: 'Answer withheld.' },
  { id: 'q3', user: 'J. Tembo', time: '26 Sep 2026, 08:40', model: 'Claude Sonnet 4.5', duration: '5.8 s', outcome: 'Answered', question: 'Which contracts are short of cover?', response: 'SYN4702 and SYN4845 are short of cover: 800 t and 1,200 t.' },
];
const AS_OUTCOME = { Answered: 'clean', Withheld: 'attention' };

export function AssistantSettings({ state = 'Allowlist' }) {
  const log = state !== 'Allowlist';
  const md = state === 'Log, Managing Director view' || state === 'Exporting log';
  const [tab, setTab] = useState(log ? 'Log' : 'Allowlist');
  useEffect(() => setTab(log ? 'Log' : 'Allowlist'), [state]);
  const columns = [
    { key: 'user', label: 'User', width: '110px' },
    { key: 'time', label: 'Time (CAT)', width: '160px', tabular: true },
    { key: 'model', label: 'Model', width: '150px' },
    { key: 'duration', label: 'Duration', width: '90px', align: 'right' },
    // The administrator's view leaves the text out (M5.AI.01 AC 8): the columns are not drawn at all.
    ...(md ? [{ key: 'question', label: 'Question', width: 'minmax(200px, 1fr)', wrap: true }, { key: 'response', label: 'Response', width: 'minmax(220px, 1.2fr)', wrap: true }] : []),
    { key: 'outcome', label: 'Outcome', width: '130px', render: (r) => <StatusMark kind={AS_OUTCOME[r.outcome]} label={r.outcome} size="body-4" /> },
  ];
  return (
    <Sections>
      <SetupHead title="Assistant settings" />
      <RecordHighlights kind="Setting" title="Assistant settings" status={<StatusMark kind="clean" label="Active" size="body-4" />} tab={tab} onTab={setTab}
        tabs={['Allowlist', 'Log', 'History']}
        actions={tab === 'Log' ? <Button variant="outline" size="small" icon="download" loading={state === 'Exporting log'}>Export</Button> : <Button size="small">Add model</Button>}
        fields={[{ label: 'Assistant', value: 'On' }, { label: 'Route in force', value: 'In region, eu-west-1' }, { label: 'Models allowed', value: String(AS_MODELS.length) }, { label: 'Log kept for', value: '8 years' }, { label: 'Owner', value: 'Owner' }]} />
      {tab === 'Log' ? (
        <CountCard title={md ? 'Assistant log, Managing Director view' : 'Assistant log'} objects="questions" count={AS_LOG.length}>
          <div data-log-view={md ? 'managing-director' : 'administrator'}><SetupTable rowKey="id" columns={columns} rows={AS_LOG} /></div>
        </CountCard>
      ) : tab === 'History' ? (
        <CountCard title="History" objects="changes" count={1}>
          <SetupTable rowKey="id" columns={[{ key: 'change', label: 'Change' }, { key: 'user', label: 'User', width: '130px' }, { key: 'date', label: 'Date (CAT)', width: '170px' }]}
            rows={[{ id: 'h1', change: 'Assistant switched on', user: 'T. Mwila', date: '12 Oct 2026, 09:00' }]} />
        </CountCard>
      ) : (
        <CountCard title="Assistant allowlist" objects="models" count={AS_MODELS.length}>
          <SetupTable rowKey="id" columns={[
            { key: 'model', label: 'Model', width: '160px', render: (r) => <RecordLink>{r.model}</RecordLink> },
            { key: 'provider', label: 'Provider' },
            { key: 'route', label: 'Reached through', width: '200px' },
            { key: 'sharing', label: 'Provider data sharing', width: '170px' },
            { key: 'added', label: 'Added', width: '120px' },
            { key: 'status', label: 'Status', width: '110px', render: (r) => <StatusMark kind="clean" label={r.status} size="body-4" /> },
          ]} rows={AS_MODELS} />
        </CountCard>
      )}
    </Sections>
  );
}
