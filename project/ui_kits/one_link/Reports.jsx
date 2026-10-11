/** The Managing Director's reports, daily summary and Assistant (M5.DS.01, UAG-139; S08 J8 to J10, canvas S09 "One
    Link Owen 1"): the Reports list, the End-of-day report, Exposure by commodity (the report View report opens from
    Position by commodity on Home), the Daily summary email, and the Assistant page. Every screen takes `state`, one of
    its REPORTS_STATES entry, for ?screen=&state=. The data is Home's (HM_*), so every figure reconciles.

    Reports open with filters, a table and Export, and Export draws its working state. The daily summary arrives at the
    times set in Setup and never prints them; every item links to its record; statuses are an icon and a word, Pending
    approval in the email too; money carries its currency code, K or M only in the email's tiles. The Assistant reads
    the records and changes none: an answer shows the figure with links to the records it used, an answer it cannot
    confirm is withheld, and asking draws its working state. Business language only, no word on the M5 banned-word list.
    Fictional sample data only. */

export const REPORTS_STATES = {
  ReportsList: ['All', 'No match'],
  EndOfDayReport: ['With items', 'No items', 'Exporting'],
  ExposureReport: ['Report', 'Calculation details', 'Rate not set', 'Exporting'],
  DailySummary: ['With items', 'No items'],
  AssistantPage: ['Question', 'Working', 'Answer', 'Withheld answer'],
};

export function reportsFrame(screen, state) {
  if (screen === 'DailySummary') return { who: 'email' };
  if (screen === 'AssistantPage') return { who: 'md', module: 'assistant', breadcrumb: ['Assistant'] };
  if (screen === 'EndOfDayReport') return { who: 'md', module: 'reports', breadcrumb: ['Reports', 'End-of-day report'] };
  if (screen === 'ExposureReport') return { who: 'md', module: 'reports', breadcrumb: ['Reports', 'Exposure by commodity'] };
  return { who: 'md', module: 'reports', breadcrumb: ['Reports'] };
}

const RP_REPORTS = [
  { id: 'eod', name: 'End-of-day report', description: 'Open exceptions, pending approvals and loads not reconciled', run: '25 Sep 2026, 18:00', owner: 'Administrator' },
  { id: 'exposure', name: 'Exposure by commodity', description: 'Stock, open purchases, open sales and net position', run: '26 Sep 2026, 07:02', owner: 'Administrator' },
  { id: 'inventory', name: 'Inventory by site', description: 'Tonnes, average cost and value by site and commodity', run: '26 Sep 2026, 07:02', owner: 'Administrator' },
  { id: 'receivables', name: 'Receivables ageing', description: 'Invoiced amounts by counterparty and days outstanding', run: '26 Sep 2026, 07:02', owner: 'Administrator' },
  { id: 'risk', name: 'Contracts at risk', description: 'Contracts short of cover or behind delivery', run: '26 Sep 2026, 07:02', owner: 'Administrator' },
];

/** Reports (S08 J10, UX-07): name, description, last run and owner, the report name opening it. */
export function ReportsList({ state = 'All', onOpen }) {
  const rows = state === 'No match' ? [] : RP_REPORTS;
  return (
    <Sections>
      <HmHead title="Reports" count={rows.length} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <ScrollRow><Capsule chevron selected>All reports</Capsule></ScrollRow>
        <SearchField placeholder="Search reports" hint={null} maxWidth={320} value={state === 'No match' ? 'Margin' : ''} onChange={() => {}} />
      </div>
      {rows.length ? (
        <Card padding={4}>
          <HmTable rows={rows} columns={[
            { key: 'name', label: 'Report', width: 'minmax(180px, 1fr)', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.name}</HmLink> },
            { key: 'description', label: 'Description', width: 'minmax(260px, 2fr)', wrap: true },
            { key: 'run', label: 'Last run (CAT)', width: '160px', tabular: true },
            { key: 'owner', label: 'Owner', width: '130px' },
          ]} />
        </Card>
      ) : <Card><EmptyState title="No reports to display." /></Card>}
    </Sections>
  );
}

/** A report's filters and Export (S08 J10 step 3). Export spins until the file is ready. */
function RpFilters({ filters, exporting }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <ScrollRow>{filters.map((f) => <Capsule key={f} chevron selected>{f}</Capsule>)}</ScrollRow>
      <Button variant="outline" size="small" icon="download" loading={exporting}>Export</Button>
    </div>
  );
}

const RP_LOADS = [
  { id: 'l1', load: 'KAL-11', contract: 'SYN4845', loaded: '33.960', offloaded: '', status: 'In transit' },
  { id: 'l2', load: 'KAL-14', contract: 'SYN4845', loaded: '34.300', offloaded: '', status: 'In transit' },
  { id: 'l3', load: 'ABZ 4412', contract: 'SYN4702 leg B', loaded: '32.140', offloaded: '31.700', status: 'On hold' },
];
const RP_LOAD_MARK = { 'In transit': 'pending', 'On hold': 'attention' };

/** The End-of-day report (S08 J10, AB-OWEN-EOD): open exceptions, pending approvals and loads not yet reconciled,
    generated from recorded data. Each section keeps its title and count 0 when it has nothing. */
export function EndOfDayReport({ state = 'With items', onOpen }) {
  const empty = state === 'No items';
  const exceptions = empty ? [] : hmByValue(HM_EXCEPTIONS);
  const approvals = empty ? [] : HM_APPROVALS;
  const loads = empty ? [] : RP_LOADS;
  return (
    <Sections>
      <HmHead title="End-of-day report" meta={<span>Generated 26 Sep 2026, 18:00 CAT</span>} />
      <RpFilters filters={['Date: 26 Sep 2026', 'Site: All sites']} exporting={state === 'Exporting'} />
      <HmCard title="Open exceptions" count={exceptions.length} objects="exceptions">
        <HmTable rows={exceptions} columns={[
          { key: 'type', label: 'Type', width: '110px' },
          { key: 'business', label: 'Exception', width: 'minmax(170px, 1fr)', wrap: true, render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.business}</HmLink> },
          { key: 'businessRecord', label: 'Record', width: 'minmax(200px, 1.4fr)', wrap: true },
          { key: 'value', label: 'Value at risk (USD)', width: '150px', align: 'right' },
          { key: 'owner', label: 'Owner', width: '170px', wrap: true },
        ]} />
      </HmCard>
      <HmCard title="Pending approvals" count={approvals.length} objects="approvals">
        <HmTable rows={approvals} columns={[
          { key: 'item', label: 'Item', width: 'minmax(160px, 1fr)', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.item}</HmLink> },
          { key: 'summary', label: 'Summary', width: 'minmax(220px, 1.6fr)', wrap: true },
          { key: 'by', label: 'Submitted by', width: '120px' },
          { key: 'at', label: 'Submitted (CAT)', width: '160px', tabular: true },
          { key: 'status', label: 'Status', width: '160px', render: () => <StatusMark kind="pending" label="Pending approval" size="body-4" /> },
        ]} />
      </HmCard>
      <HmCard title="Loads not reconciled" count={loads.length} objects="loads">
        <HmTable rows={loads} columns={[
          { key: 'load', label: 'Load', width: '110px', render: (r) => <HmLink>{r.load}</HmLink> },
          { key: 'contract', label: 'Contract', width: 'minmax(140px, 1fr)', render: (r) => <HmLink>{r.contract}</HmLink> },
          { key: 'loaded', label: 'Loaded (t)', width: '110px', align: 'right' },
          { key: 'offloaded', label: 'Offloaded (t)', width: '120px', align: 'right' },
          { key: 'status', label: 'Status', width: '130px', render: (r) => <StatusMark kind={RP_LOAD_MARK[r.status]} label={r.status} size="body-4" /> },
        ]} />
      </HmCard>
    </Sections>
  );
}

/** Stock shown apart from the position (C8-10): committed to loading orders, in transit, and held for other owners,
    which is never added into ours. */
const RP_APART = [
  { id: 'wheat', commodity: 'Wheat', marker: 'wheat', committed: '850', transit: '34', held: '1,300' },
  { id: 'maize', commodity: 'Maize', marker: 'maize', committed: '120', transit: '0', held: '0' },
  { id: 'soya', commodity: 'Soya', marker: 'soya', committed: '0', transit: '0', held: '0' },
  { id: 'urea', commodity: 'Urea 50 kg', marker: 'fertilizer', committed: '310', transit: '210', held: '120' },
];

/** Exposure by commodity (S08 J10; opened by View report on Home's Position by commodity): per commodity stock, open
    purchases, open sales and net position (Long, Short or Flat) in tonnes, and value in US dollars, with Committed, In
    transit and Held for others shown apart. Every figure opens Calculation details with its components, the exchange
    rate and its date. Tonnage paid for and not yet delivered counts as an open purchase (Map D-41). */
export function ExposureReport({ state = 'Report' }) {
  const rateSet = state !== 'Rate not set';
  const initial = state === 'Calculation details' ? { row: HM_POSITION[0], column: 'purchases' } : state === 'Rate not set' ? { row: HM_POSITION[0], column: 'value' } : null;
  const [calc, setCalc] = useState(initial);
  useEffect(() => setCalc(initial), [state]);
  const fig = (col) => (r) => <HmLink onOpen={() => setCalc({ row: r, column: col })}>{r[col]}</HmLink>;
  const panel = calc ? hmPositionCalc(calc.row, calc.column, rateSet) : null;
  return (
    <Sections>
      <HmHead title="Exposure by commodity" meta={<>
        <span>Last refreshed {HM_AS_OF}</span>
        <span>{rateSet ? `${HM_RATE}, rates as of ${HM_RATE_DATE}` : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>Exchange rate <NotSet owner="Owner" size="body-4" /></span>}</span>
      </>} />
      <RpFilters filters={['Date: 26 Sep 2026', 'Commodity: All']} exporting={state === 'Exporting'} />
      <HmCard title="Position by commodity" count={HM_POSITION.length} objects="commodities">
        <HmTable rows={HM_POSITION} columns={[
          { key: 'commodity', label: 'Commodity', width: 'minmax(120px, 1fr)', render: (r) => <CommodityMarker commodity={r.marker}>{r.commodity}</CommodityMarker> },
          { key: 'stock', label: 'Stock (t)', width: '92px', align: 'right', render: fig('stock') },
          { key: 'purchases', label: 'Open purchases (t)', width: '150px', align: 'right', render: fig('purchases') },
          { key: 'sales', label: 'Open sales (t)', width: '120px', align: 'right', render: fig('sales') },
          { key: 'net', label: 'Net position (t)', width: '130px', align: 'right', render: fig('net') },
          { key: 'value', label: 'Value (USD)', width: '110px', align: 'right', render: fig('value') },
        ]} />
      </HmCard>
      <HmCard title="Shown apart" count={RP_APART.length} objects="commodities">
        <HmTable rows={RP_APART} columns={[
          { key: 'commodity', label: 'Commodity', width: 'minmax(120px, 1fr)', render: (r) => <CommodityMarker commodity={r.marker}>{r.commodity}</CommodityMarker> },
          { key: 'committed', label: 'Committed (t)', width: '130px', align: 'right' },
          { key: 'transit', label: 'In transit (t)', width: '120px', align: 'right' },
          { key: 'held', label: 'Held for others (t)', width: '150px', align: 'right' },
        ]} />
      </HmCard>
      {panel ? <CalculationDetails open onClose={() => setCalc(null)} name={panel.name} value={panel.value} components={panel.components} total={panel.total} basis={panel.basis} /> : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ The daily summary email (S08 J9) */

/** One item of the email: the record as a link, a line under it, and its figure or status on the right. */
function RpEmailRow({ title, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', boxShadow: 'inset 0 -1px 0 var(--border-light)' }}>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <HmLink>{title}</HmLink>
        <Text variant="body-4" tone="secondary" style={{ overflowWrap: 'anywhere' }}>{sub}</Text>
      </span>
      {right ? <span style={{ flex: 'none' }}>{right}</span> : null}
    </div>
  );
}

/** An email section: its title with the count in brackets (acceptable in email), then its items, or "No [objects] to
    display." under a title that stays. */
function RpEmailSection({ title, count, objects, children }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Text as="h2" variant="body-1" strong style={{ margin: 0 }}>{title} ({count})</Text>
      {count ? children : <Text variant="body-3" tone="secondary" style={{ padding: '8px 0' }}>No {objects} to display.</Text>}
    </section>
  );
}

/** The Daily summary email (S08 J9, UX-29): KPI tiles, new and open exceptions sorted by value at risk, items to approve
    and recent changes, every item linking to its record, then Open One Link. It arrives at the times set in Setup
    and does not print them. */
export function DailySummary({ state = 'With items' }) {
  const empty = state === 'No items';
  const exceptions = empty ? [] : hmByValue(HM_EXCEPTIONS);
  const fresh = exceptions.filter((r) => r.isNew);
  const open = exceptions.filter((r) => !r.isNew);
  const approvals = empty ? [] : HM_APPROVALS;
  const changes = empty ? [] : HM_CHANGES;
  const exc = (r) => <RpEmailRow key={r.id} title={r.business} sub={`${r.businessRecord}, ${r.owner}`} right={<Text variant="body-3" strong tabular>USD {r.value}</Text>} />;
  return (
    <div style={{ background: 'var(--grouped)', padding: '24px 16px', minHeight: '100vh', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card padding={24} gap={24}>
          <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 16, boxShadow: 'inset 0 -1px 0 var(--border-light)' }}><Logo /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text as="h1" variant="heading-3" strong style={{ margin: 0 }}>Daily summary</Text>
            <Text variant="body-3" tone="secondary" tabular>26 Sep 2026, data as of 07:02 CAT</Text>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
            {kpiTiles(HM_TILES.map((t) => <KpiTile key={t.key} label={t.label} value={t.value} size="heading-2-condensed" style={{ boxShadow: 'inset 0 0 0 1px var(--border-light)' }} />))}
          </div>
          <RpEmailSection title="Items to approve" count={approvals.length} objects="items">
            {approvals.map((r) => <RpEmailRow key={r.id} title={r.item} sub={r.summary} right={<StatusMark kind="pending" label="Pending approval" size="body-4" />} />)}
          </RpEmailSection>
          <RpEmailSection title="New exceptions" count={fresh.length} objects="exceptions">{fresh.map(exc)}</RpEmailSection>
          <RpEmailSection title="Open exceptions" count={open.length} objects="exceptions">{open.map(exc)}</RpEmailSection>
          <RpEmailSection title="Recent changes" count={changes.length} objects="changes">
            {changes.map((r) => <RpEmailRow key={r.id} title={r.record} sub={`${r.change}, ${r.by}, ${r.date}`} />)}
          </RpEmailSection>
          <div><Button size="medium">Open One Link</Button></div>
        </Card>
        <div style={{ textAlign: 'center' }}><HmLink>Manage email settings</HmLink></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ The Assistant (S08 J8) */

const RP_QUESTION = 'Long or short on SYN4702?';

/** The records an answer used, as blue links (UX-01): each opens its record. */
function RpSources({ onOpen }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Text variant="body-4" tone="secondary">Sources</Text>
      <span data-sources="" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
        <HmLink onOpen={() => onOpen && onOpen('SYN4702')}>Contract SYN4702</HmLink>
        <HmLink onOpen={() => onOpen && onOpen('SYN4702-legs')}>Purchase legs A to H</HmLink>
      </span>
    </span>
  );
}

/** The Assistant (S08 J8): a full page from the Assistant item in Owen's navigation. It reads the records Owen can
    open and changes none. An answer shows the figure, with the records it used as links; an answer whose figures
    cannot be confirmed against the records is withheld, never guessed; asking draws the working state. */
export function AssistantPage({ state = 'Answer', onOpen }) {
  const asked = state !== 'Question';
  const working = state === 'Working';
  return (
    <AssistantPanel title="Assistant" subtitle="Answers from the records you can open" footer="" placeholder="Ask a question"
      value={state === 'Question' ? RP_QUESTION : ''} sending={working} width="100%" maxHeight={760} style={{ minHeight: 560 }}>
      {asked ? <AssistantQuestion>{RP_QUESTION}</AssistantQuestion> : null}
      {working ? <AssistantWorking label="Reading the records" /> : null}
      {state === 'Answer' ? (
        <AssistantAnswer sources={<RpSources onOpen={onOpen} />}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span>SYN4702 is short 800 t.</span>
            <Card padding={4}>
              <HmTable rows={[{ id: 'm1', measure: 'Sold', tonnes: '5,000' }, { id: 'm2', measure: 'Firm secured', tonnes: '4,200' }, { id: 'm3', measure: 'Short', tonnes: '800', total: true }]} columns={[
                { key: 'measure', label: 'Measure', width: 'minmax(140px, 1fr)', render: (r) => hmStrong(r, r.measure) },
                { key: 'tonnes', label: 'Tonnes', width: '100px', align: 'right', render: (r) => hmStrong(r, r.tonnes) },
              ]} />
            </Card>
            <Text variant="body-4" tone="secondary" tabular>Data as of {HM_AS_OF}</Text>
          </span>
        </AssistantAnswer>
      ) : null}
      {state === 'Withheld answer' ? (
        <AssistantAnswer sources={<RpSources onOpen={onOpen} />}>
          <span data-withheld="" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <StatusMark kind="attention" label="Answer withheld" size="body-3" />
            <span>The figures could not be confirmed against the records. Open the records below.</span>
          </span>
        </AssistantAnswer>
      ) : null}
    </AssistantPanel>
  );
}
