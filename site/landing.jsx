// Live demos for the landing page. Compiled by scripts/build.mjs into dist/landing.js.
// Uses only the real components from project/components (window.OneLinkDS). Sample data is fictional.
(function () {
  const DS = window.OneLinkDS;
  if (!DS || !window.React || !window.ReactDOM) return;
  const {
    Icon, Text, Avatar, Button, PressButton, PressToggle, Capsule, CapsuleGroup, Segmented, LineStepper,
    SearchField, Tabs, CommodityTabs, SyncStatus, StatusMark, ProvenanceChip, ConfirmationChip, SeverityTag,
    Banner, EmptyState, Skeleton, CardSkeleton, Card, CardRow, QuantityChip, ShareBar, Figure, RailRow,
    DataTable, RestrictedCell, DerivedCell, RefCell, ChartCard, ActionPanel, AmountRow, SummaryList,
    ReconcilePanel, EvidenceTile, Timeline,
  } = DS;
  const { useState, useEffect, useRef } = React;

  // ------------------------------------------------------------ shared state
  const COMMODITIES = {
    maize: { label: 'White maize', color: 'var(--commodity-maize)', tile: 'WM', ref: 'ZAM4702', buyer: 'Kafue Valley Milling', mt: 2000, sell: 6800, buy: 6600, delivered: 1400, gate: 6800 },
    wheat: { label: 'Wheat', color: 'var(--commodity-wheat)', tile: 'WH', ref: 'ZAM4698', buyer: 'Crest Milling', mt: 3000, sell: 9050, buy: 8720, delivered: 2220, gate: 9050 },
    soya: { label: 'Soya', color: 'var(--commodity-soya)', tile: 'SY', ref: 'ZAM4680', buyer: 'Kalulu Trading', mt: 1500, sell: 9400, buy: 9050, delivered: 900, gate: 9400 },
    'soya-meal': { label: 'Soya meal', color: 'var(--commodity-soya-meal)', tile: 'SM', ref: 'ZAM4676', buyer: 'Northstar Commodities', mt: 800, sell: 7900, buy: 7600, delivered: 800, gate: 7900 },
    fertilizer: { label: 'Fertilizer', color: 'var(--commodity-fertilizer)', tile: 'FE', ref: 'ZAM4671', buyer: 'Harvest Co-op', mt: 450, sell: 10700, buy: 10150, delivered: 300, gate: 10700 },
  };
  let current = 'maize';
  const listeners = new Set();
  window.addEventListener('onelink:commodity', (e) => { current = e.detail; listeners.forEach((fn) => fn(current)); });
  function useCommodity() {
    const [key, setKey] = useState(current);
    useEffect(() => { listeners.add(setKey); return () => listeners.delete(setKey); }, []);
    return [key, COMMODITIES[key]];
  }
  const setCommodity = (key) => {
    document.querySelectorAll('#commodity-picker [data-commodity]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.commodity === key)));
    window.dispatchEvent(new CustomEvent('onelink:commodity', { detail: key }));
  };

  const fmt = (n) => n.toLocaleString('en-US');
  const kwacha = (n) => (n >= 1e6 ? `K${+(n / 1e6).toFixed(1)}M` : `K${fmt(Math.round(n))}`);

  /** Any button that starts work: busy until the (simulated) action lands. */
  function useWork(ms = 1400) {
    const [busy, setBusy] = useState(false);
    const t = useRef();
    useEffect(() => () => clearTimeout(t.current), []);
    return [busy, () => { if (busy) return; setBusy(true); t.current = setTimeout(() => setBusy(false), ms); }];
  }
  const WorkButton = ({ children, ms, ...props }) => { const [busy, run] = useWork(ms); return <Button {...props} loading={busy} onClick={run}>{children}</Button>; };

  function useNarrow(max = 600) {
    const q = () => window.matchMedia(`(max-width:${max}px)`).matches;
    const [n, setN] = useState(q());
    useEffect(() => { const on = () => setN(q()); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on); }, []);
    return n;
  }

  const Row = ({ label, children, style }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', ...style }}>
      {label ? <Text variant="caption-1" tone="tertiary" style={{ minWidth: 88, flex: 'none' }}>{label}</Text> : null}
      {children}
    </div>
  );
  const Stack = ({ gap = 16, children, style }) => <div style={{ display: 'flex', flexDirection: 'column', gap, minWidth: 0, ...style }}>{children}</div>;

  // ------------------------------------------------------------ hero
  function HeroCard() {
    const [, c] = useCommodity();
    const share = c.delivered / c.mt;
    return (
      <Card interactive commodityColor={c.color} title={`${c.ref} · ${c.buyer}`} meta={[c.label, 'Contracted', 'Season 2026']}
        footer={`${fmt(c.delivered)} / ${fmt(c.mt)}t delivered · margin ${kwacha((c.sell - c.buy) * c.mt)}`}>
        <CardRow leading={<Avatar initials="A" commodityColor={c.color} />} name="Kabwe"
          bar={<ShareBar share={Math.min(1, share)} color={c.color} />} figure={`${fmt(Math.round(c.mt * 0.6))}t`}
          trailing={<><QuantityChip>{fmt(Math.round(c.delivered * 0.7))}t</QuantityChip><PressButton kind="figure">{Math.round(share * 100)}%</PressButton></>} />
        <CardRow leading={<Avatar initials="B" commodityColor={c.color} />} name="Mazabuka"
          bar={<ShareBar share={0.15} declared={0.25} color={c.color} />} figure={`~${fmt(Math.round(c.mt * 0.4))}t`}
          trailing={<><QuantityChip tone="secondary">{fmt(Math.round(c.delivered * 0.3))}t</QuantityChip><PressButton kind="figure">{Math.round(share * 40)}%</PressButton></>} />
      </Card>
    );
  }

  // ------------------------------------------------------------ rules
  const RuleSilence = () => <EmptyState tone="success" title="Nothing needs your attention" meta="Checked 07:02 · next digest 13:00" style={{ padding: 0, width: '100%' }} />;
  const RuleDerived = () => (
    <Figure label="your position right now" value="K125M" size="heading-1-condensed" delta="9.4%" deltaSuffix="margin, month to date"
      derivation="physical K80M · in-transit K45M"
      derivationRows={[{ label: 'Physical stock at cost', value: 'K80.0M' }, { label: 'In transit, dispatched not received', value: 'K45.0M' }, { label: 'Position', value: 'K125.0M', total: true }]} />
  );
  const RuleTrust = () => (<><ProvenanceChip kind="synced" /><ProvenanceChip kind="ocr-medium" /><ConfirmationChip kind="confirmed" /><ConfirmationChip kind="disputed" /></>);
  const RuleRestricted = () => (
    <Stack gap={6} style={{ width: '100%' }}>
      <Row><Text variant="body-3" tone="secondary" style={{ flex: 1 }}>Book value at cost · Owner</Text><Text variant="body-3" strong tabular>K190,790,400</Text></Row>
      <Row><Text variant="body-3" tone="secondary" style={{ flex: 1 }}>Book value at cost · Stock Control</Text><RestrictedCell tooltip="Not available to Stock Control" /></Row>
    </Stack>
  );
  const RuleOutcomes = () => (<><StatusMark kind="within" label="Within tolerance" /><StatusMark kind="attention" label="Held for review" /><StatusMark kind="block" label="Hard block" /></>);
  const RuleHistory = () => (
    <Timeline style={{ width: '100%' }} entries={[
      { text: 'Deduction 0.32 t applied from grading', actor: 'P. Zulu', time: '1 Aug 19:16' },
      { text: 'Deduction reversed: re-graded from retained sample', actor: 'David Mulenga', time: '3 Aug 10:02', compensating: true },
    ]} />
  );
  const RuleSync = () => (<Stack gap={8}><SyncStatus state="live" /><SyncStatus state="stalled" /><SyncStatus state="offline" /></Stack>);
  const RuleBusy = () => (<><WorkButton variant="primary">Approve</WorkButton><WorkButton variant="brand" icon="plus">Raise GRN</WorkButton><Text variant="caption-1" tone="tertiary">Press either one.</Text></>);

  // ------------------------------------------------------------ components
  function Buttons() {
    const [, c] = useCommodity();
    return (
      <Stack>
        <Row label="Variants"><WorkButton variant="brand" icon="plus">New trade</WorkButton><WorkButton variant="primary">Approve</WorkButton><WorkButton variant="outline">Query</WorkButton><Button variant="ghost">Cancel</Button><WorkButton variant="subtle" icon="download">Export CSV</WorkButton><WorkButton variant="critical">Decline</WorkButton><WorkButton variant="commodity" commodityColor={c.color}>Create trade</WorkButton></Row>
        <Row label="Sizes"><Button size="xsmall" variant="outline">Review</Button><Button size="small" variant="outline" icon="bell">Digest</Button><WorkButton size="medium" variant="outline" icon="refresh-cw">Sync tickets</WorkButton><WorkButton size="large" variant="primary">Finalise GRN</WorkButton></Row>
        <Row label="States"><Button variant="primary" loading>Approve</Button><Button variant="brand" disabled>Raise GRN</Button><Text variant="caption-1" tone="tertiary">Loading keeps the button's size and blocks a second press.</Text></Row>
      </Stack>
    );
  }

  function Press() {
    const [, c] = useCommodity();
    const [side, setSide] = useState('Sell');
    const [busy, run] = useWork(1600);
    return (
      <Stack>
        <Row label="Figure"><PressButton kind="figure">53%</PressButton><PressButton kind="figure">25.3%</PressButton><PressButton kind="figure" disabled>—</PressButton></Row>
        <Row label="Quick"><PressButton kind="quick">+100t</PressButton><PressButton kind="quick">+500t</PressButton><PressButton kind="quick">+1,000t</PressButton></Row>
        <Row label="Toggle"><div style={{ width: 260, maxWidth: '100%' }}><PressToggle options={['Sell', 'Buy']} value={side} onChange={setSide} selectedVariant="commodity" commodityColor={c.color} /></div></Row>
        <Row label="Large"><div style={{ width: 260, maxWidth: '100%' }}><PressButton kind="large" variant="primary" fullWidth loading={busy} onClick={run}>Resolve case</PressButton></div></Row>
      </Stack>
    );
  }

  function Controls() {
    const [key, c] = useCommodity();
    const [period, setPeriod] = useState('Month');
    const [stage, setStage] = useState('Contracted');
    const [view, setView] = useState('Overview');
    const [ready, setReady] = useState('ready');
    const [price, setPrice] = useState('$400');
    const [tab, setTab] = useState('Trade Board');
    return (
      <Stack>
        <Row label="Periods"><CapsuleGroup options={['Today', 'Week', 'Month', 'Quarter', 'Year', '6 months']} value={period} onChange={setPeriod} /></Row>
        <Row label="Pipeline"><CapsuleGroup value={stage} onChange={setStage} options={[{ value: 'Lead', label: 'Lead', count: 4 }, { value: 'Opportunity', label: 'Opportunity', count: 6 }, { value: 'Approved', label: 'Approved', count: 3 }, { value: 'Contracted', label: 'Contracted', count: 18 }, { value: 'Complete', label: 'Complete', count: 41 }]} /><Capsule chevron>Season 2026</Capsule></Row>
        <Row label="Segmented"><Segmented options={['Overview', 'Trends']} value={view} onChange={setView} /><Segmented value={ready} onChange={setReady} options={[{ value: 'ready', label: 'Ready', icon: 'check', count: 3 }, { value: 'problematic', label: 'Problematic', icon: 'triangle-alert', count: 1 }, { value: 'linked', label: 'Linked', icon: 'link', count: 0 }]} /></Row>
        <Row label="Stepper"><LineStepper values={['$360', '$380', '$400', '$420']} value={price} onChange={setPrice} activeColor={c.color} /></Row>
        <Row label="Nav tabs"><Tabs tabs={['Trade Board', 'Coverage', 'Approvals']} value={tab} onChange={setTab} height={44} /></Row>
        <Row label="Commodity"><CommodityTabs tabs={Object.entries(COMMODITIES).map(([value, v]) => ({ value, label: v.label, color: v.color }))} value={key} onChange={setCommodity} /></Row>
        <Row label="Search"><div style={{ flex: 1, minWidth: 220, maxWidth: 400 }}><SearchField placeholder="Search trades, tickets, counterparties" /></div></Row>
      </Stack>
    );
  }

  function Status() {
    return (
      <Stack>
        <Row label="Status"><StatusMark kind="clean" /><StatusMark kind="attention" /><StatusMark kind="breach" /><StatusMark kind="block" /><StatusMark kind="awaiting" /></Row>
        <Row label="Trend"><StatusMark kind="up" label="Improving" /><StatusMark kind="down" label="Worsening" /><StatusMark kind="flat" /><StatusMark kind="rebalance" /></Row>
        <Row label="Provenance"><ProvenanceChip kind="synced" /><ProvenanceChip kind="bridge" /><ProvenanceChip kind="ocr-high" /><ProvenanceChip kind="typed" /><ProvenanceChip kind="declared" /></Row>
        <Row label="Confirmation"><ConfirmationChip kind="confirmed" /><ConfirmationChip kind="awaiting" /><ConfirmationChip kind="disputed" /></Row>
        <Row label="Severity"><SeverityTag level="critical" /><SeverityTag level="high" /><SeverityTag level="normal" /></Row>
        <Row label="Sync"><SyncStatus state="live" /><SyncStatus state="stalled" /></Row>
        <Stack gap={8}>
          <Banner tone="success" title="Clean">books match reality · all reconciled</Banner>
          <Banner tone="warning" title="Attention">1 variance held for review</Banner>
          <Banner tone="error" title="Weighbridge feed silent" action={<WorkButton size="xsmall" variant="outline" icon="refresh-cw">Retry</WorkButton>}>position may look flat. Tickets can still be photographed.</Banner>
        </Stack>
      </Stack>
    );
  }

  function Cards() {
    const [, c] = useCommodity();
    const mills = [
      ['Kafue Valley Milling', 15000, 6900, 1000, '38d', 'down'], ['Crest Milling', 25000, 10939, 2500, '45d', 'flat'],
      ['Greenfield Agri', 44000, 23061, 7000, '96d', 'up'], ['Horizon Milling', 22000, 30039, 0, 'over', 'rebalance'],
    ];
    return (
      <Stack>
        <Card interactive commodityColor={c.color} title={`Coverage · ${c.label}`} meta={['Season 2026', 'Site: all']} footer="Short = target − firm − declared, netted across mills">
          {mills.map(([name, target, firm, declared, windowLabel, trend]) => (
            <CardRow key={name} leading={<Avatar initials={name.split(' ').map((w) => w[0]).join('').slice(0, 2)} commodityColor={c.color} />}
              name={name} sub={`target ${fmt(target)} · window ${windowLabel}`}
              bar={<ShareBar share={Math.min(1, firm / target)} declared={declared / target} color={c.color} />}
              trailing={<><StatusMark kind={trend} size="caption-1" label="" /><PressButton kind="figure">{Math.round((firm / target) * 100)}%</PressButton></>} />
          ))}
        </Card>
        <CardSkeleton />
      </Stack>
    );
  }

  function Figures() {
    return (
      <Stack>
        <Card title="Command Center" meta={['Tue 24 Jun', '07:02']}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
            <Figure label="your position right now" value="K125M" size="heading-1-condensed" derivation="physical K80M · in-transit K45M"
              derivationRows={[{ label: 'Physical', value: 'K80.0M' }, { label: 'In transit', value: 'K45.0M' }, { label: 'Position', value: 'K125.0M', total: true }]} />
            <Figure label="blended margin" value="K11.8M" size="heading-1-condensed" delta="9.4%" />
            <Figure label="net movement" value="+K3.2M" size="heading-1-condensed" delta="-K5.6M" deltaSuffix="out this month" />
          </div>
        </Card>
        <Card title="Loading">
          <Stack gap={10}><Skeleton width="55%" height={12} /><Skeleton width="80%" height={10} /><Skeleton width={120} height={40} radius="var(--radius-sm)" /></Stack>
        </Card>
      </Stack>
    );
  }

  function Table() {
    const rows = [
      { id: 1, ref: 'ZAM4702', cp: 'Kafue Valley Milling', commodity: 'White maize', mt: '2,000', sell: '6,800', margin: 'K400,000', delivered: '1,400 / 2,000t' },
      { id: 2, ref: 'ZAM4698', cp: 'Crest Milling', commodity: 'Wheat', mt: '3,000', sell: '9,050', margin: 'K990,000', delivered: '2,220 / 3,000t',
        correction: { reason: 'Sell price corrected from 9,500: contract addendum 2', actor: 'S. Lungu', time: '3 Aug 06:12' } },
      { id: 3, ref: 'ZAM4691', cp: 'Brightloaf Bakeries', commodity: 'White maize', mt: '2,250', sell: '6,780', margin: 'K540,000', delivered: '2,250 / 2,250t', closed: true },
    ];
    return (
      <DataTable rowKey="id" rows={rows} footer="Showing 3 of 72 trades · season 2026 · buy price restricted for Trader"
        columns={[
          { key: 'ref', label: 'Ref', width: '96px', render: (r) => <RefCell>{r.ref}</RefCell> },
          { key: 'cp', label: 'Counterparty', width: 'minmax(150px,1fr)' },
          { key: 'commodity', label: 'Commodity', width: '110px', tone: 'secondary' },
          { key: 'mt', label: 'MT', align: 'right', tabular: true, width: '72px' },
          { key: 'sell', label: 'Sell', align: 'right', tabular: true, width: '72px' },
          { key: 'buy', label: 'Buy', align: 'right', width: '64px', render: () => <RestrictedCell tooltip="Not available to Trader" /> },
          { key: 'margin', label: 'Margin', align: 'right', width: '104px', render: (r) => <DerivedCell rows={[{ label: 'Sell × MT', value: 'derived' }, { label: 'Buy × MT', value: 'derived' }, { label: 'Margin', value: r.margin, total: true }]}>{r.margin}</DerivedCell> },
          { key: 'delivered', label: 'Delivered', align: 'right', tabular: true, width: '120px' },
        ]} />
    );
  }

  function Chart() {
    const [, c] = useCommodity();
    const narrow = useNarrow();
    const [range, setRange] = useState('3M');
    const days = range === '1M' ? 30 : range === '3M' ? 90 : 180;
    const data = [];
    let v = c.gate * 0.93;
    const start = Date.UTC(2026, 6, 1) - days * 86400000;
    for (let i = 0; i < days; i++) {
      v += Math.sin(i / 6 + c.gate) * c.gate * 0.004 + c.gate * 0.0009;
      data.push({ time: new Date(start + i * 86400000).toISOString().slice(0, 10), value: Math.round(v) });
    }
    return (
      <ChartCard title={`${c.label} · gate price, ZMW/t`} ranges={['1M', '3M', '6M']} range={range} onRange={setRange} height={narrow ? 200 : 280}
        series={[{ type: 'line', data, color: c.color, name: c.label, format: (x) => fmt(x) }]}
        priceLines={[{ price: c.sell, color: '#23272d', title: `${fmt(c.sell)} sell` }]} />
    );
  }

  function Ticket() {
    const [key, c] = useCommodity();
    const narrow = useNarrow(960);
    const [side, setSide] = useState('Sell');
    const [mt, setMt] = useState(c.mt);
    const [busy, run] = useWork(1800);
    useEffect(() => setMt(c.mt), [key]);
    const price = side === 'Sell' ? c.sell : c.buy;
    return (
      <ActionPanel width={narrow ? '100%' : 350} tile={<Avatar initials={c.tile} commodityColor={c.color} />} context="New trade · Season 2026" subject={c.label}
        tabs={['Sell', 'Buy']} tab={side} onTab={setSide}>
        <PressToggle options={['Sell', 'Buy']} value={side} onChange={setSide} selectedVariant="commodity" commodityColor={c.color} />
        <AmountRow label="Tonnage" value={fmt(mt)} unit="MT" sub={`@ K${fmt(price)}/t`} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' }}>
          {[100, 500, 1000].map((n) => <PressButton key={n} kind="quick" onClick={() => setMt((m) => m + n)}>+{fmt(n)}t</PressButton>)}
        </div>
        <SummaryList items={[{ label: 'Counterparty', value: c.buyer }, { label: 'Value', value: kwacha(mt * price) }, { label: 'Margin preview', value: kwacha(mt * (c.sell - c.buy)), strong: true, color: 'var(--content-accent-up)' }]} />
        <PressButton kind="large" variant="commodity" commodityColor={c.color} fullWidth loading={busy} onClick={run}>Create trade</PressButton>
      </ActionPanel>
    );
  }

  function Reconcile() {
    const [outcome, setOutcome] = useState('within');
    const [busy, run] = useWork(1600);
    return (
      <Stack>
        <Segmented value={outcome} onChange={setOutcome} options={[{ value: 'within', label: 'Within', icon: 'check' }, { value: 'held', label: 'Held', icon: 'triangle-alert' }, { value: 'block', label: 'Hard block', icon: 'octagon-x' }]} />
        <ReconcilePanel outcome={outcome} loading={busy} onAction={run}
          columns={outcome === 'block'
            ? [{ label: 'Gross', value: '6.00', unit: 't', provenance: 'typed' }, { label: 'Tare', value: '7.50', unit: 't', provenance: 'synced' }, { label: 'Net', value: '—', unit: '' }]
            : [{ label: 'Weighed in', value: '30.02', unit: 't', provenance: 'synced' }, { label: 'Deduction', value: outcome === 'held' ? '1.20' : '0.32', unit: 't', provenance: 'ocr-medium' }, { label: 'Applied', value: outcome === 'held' ? '28.82' : '29.70', unit: 't' }]}
          evidence={<><EvidenceTile kind="receipt" caption="slip-gr10000356" time="14:22" /><EvidenceTile kind="photo" caption="photo-probe-1" time="19:16" /></>} />
      </Stack>
    );
  }

  function Records() {
    return (
      <Card title="GR10000377 · grading dispute" meta={['Kapiri Farms', 'Lodged 1 Aug 18:14']} headerRight={<ConfirmationChip kind="disputed" />}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <EvidenceTile kind="voice" caption="voice-dsp0219" duration="0:47" />
          <EvidenceTile kind="photo" caption="photo-farm-scale-ticket" time="1 Aug" />
          <EvidenceTile kind="document" caption="spec-v4" />
        </div>
        <Timeline entries={[
          { text: 'Delivery weighed in at 30.02 t', actor: 'Bridge feed', time: '1 Aug 18:02' },
          { text: 'Grading deduction 0.32 t (moisture 13.4%)', actor: 'P. Zulu', time: '1 Aug 19:16' },
          { text: 'Counterparty disputed the deduction', actor: 'Grace Kasonde', time: '1 Aug 18:14' },
          { text: 'Deduction reversed pending re-grade', actor: 'David Mulenga', time: '3 Aug 10:02', compensating: true },
        ]} />
      </Card>
    );
  }

  function Rail() {
    return (
      <Stack gap={0}>
        <RailRow severity="critical" subject="ZAM4702 short 1,400t" context="Kafue Valley Milling · window closes in 12 days" right={<WorkButton size="xsmall" variant="outline">Find supply</WorkButton>} />
        <RailRow severity="high" subject="2 trades awaiting approval" context="T-0142 · T-0141 · 3h / 1d4h" right={<Button size="xsmall" variant="outline">Review</Button>} />
        <RailRow severity="high" subject="Tembo Farms gone quiet" context="0 of 12 expected trucks this week · 6d" right={<Button size="xsmall" variant="outline">Call</Button>} />
      </Stack>
    );
  }

  // ------------------------------------------------------------ mount
  const mount = (id, el) => { const n = document.getElementById(id); if (n) ReactDOM.createRoot(n).render(el); };
  mount('demo-hero', <HeroCard />);
  mount('rule-silence', <RuleSilence />);
  mount('rule-derived', <RuleDerived />);
  mount('rule-trust', <RuleTrust />);
  mount('rule-restricted', <RuleRestricted />);
  mount('rule-outcomes', <RuleOutcomes />);
  mount('rule-history', <RuleHistory />);
  mount('rule-sync', <RuleSync />);
  mount('rule-busy', <RuleBusy />);
  mount('demo-buttons', <Buttons />);
  mount('demo-press', <Press />);
  mount('demo-controls', <Controls />);
  mount('demo-status', <Status />);
  mount('demo-cards', <Cards />);
  mount('demo-figures', <Figures />);
  mount('demo-table', <Table />);
  mount('demo-chart', <Chart />);
  mount('demo-ticket', <Ticket />);
  mount('demo-reconcile', <Reconcile />);
  mount('demo-records', <Records />);
  mount('demo-rail', <Rail />);
})();
