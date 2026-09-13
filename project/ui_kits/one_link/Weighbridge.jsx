const TICKETS = [
  { ref: 'WBT10001605', cp: 'NORTHSTAR COMMODITIES', net: '28.20t', truck: 'BAX1234ZM', driver: 'Peter', weights: '34.2/6/28.2 MT', inAt: 'in 20 May 13:46', outAt: 'out 20 May 14:22' },
  { ref: 'WBT10001604', cp: 'NORTHSTAR COMMODITIES', net: '31.50t', truck: 'BAX5678ZM', driver: 'Joseph', weights: '38.5/7/31.5 MT', inAt: 'in 20 May 11:10', outAt: 'out 20 May 11:58' },
  { ref: 'WBT10001603', cp: 'KALULU TRADING', net: '26.80t', truck: 'CAX4410', driver: 'Musonda', weights: '33.8/7/26.8 MT', inAt: 'in 20 May 09:05', outAt: 'out 20 May 09:50' },
];

/** 06 Weighbridge Tickets (Warehouse · Clerk) — default, sync silent, empty. */
export function Weighbridge({ state = 'default', mobile = false }) {
  const compact = useCompact(mobile);
  const sectionGap = useMinWidth(1024) ? 32 : 24;
  const [syncing, setSyncing] = useState(false);
  const silent = state === 'silent';
  const empty = state === 'empty';
  const maize = 'var(--commodity-maize)';

  const head = (
    <PageHead title="Weighbridge tickets" meta={<SyncStatus state={silent ? 'stalled' : 'live'} style={{ padding: 0, height: 'auto' }} />}
      right={<Button variant="outline" icon="refresh-cw" loading={syncing} onClick={() => { setSyncing(true); setTimeout(() => setSyncing(false), 1800); }}>Sync tickets</Button>}>
      <ScrollRow><Segmented options={[{ value: 'ready', label: 'Ready', icon: 'check', count: empty ? 0 : 3 }, { value: 'prob', label: 'Problematic', icon: 'triangle-alert', count: empty ? 0 : 1 }, { value: 'linked', label: 'Linked', icon: 'link', count: 0 }, { value: 'done', label: 'Done', icon: 'circle-check', count: 0 }]} value="ready" /></ScrollRow>
    </PageHead>
  );

  const attention = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionLabel>needs attention</SectionLabel>
      <Card style={{ background: 'var(--warning-subtle)', boxShadow: 'none' }} title="WBT10001606 · SUNRISE GRAIN" meta={['Moses', 'BLX2290ZM']}
        headerRight={<Button size="xsmall" variant="primary">Complete</Button>}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}><ProvenanceChip kind="bridge" /><Text variant="body-3" tone="secondary">weighed in 11/05 · never weighed out → no net</Text></div>
      </Card>
    </div>
  );

  const ready = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionLabel>ready for a GRN</SectionLabel>
      {empty ? <Card><EmptyState tone="neutral" icon="clock" title="No tickets waiting" meta="Next batch lands when the feed runs" /></Card> : (
        <div style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0,1fr)' : 'repeat(2, minmax(0,1fr))', gap: 16 }}>
          {TICKETS.map((t) => (
            <Card key={t.ref} interactive commodityColor={maize} title={`${t.ref} · ${t.cp}`} meta={[t.truck, t.driver, t.weights]}
              headerRight={<Button size="xsmall" variant="brand">Raise GRN</Button>}>
              <CardRow leading={<Avatar initials={t.driver.slice(0, 2).toUpperCase()} commodityColor={maize} />} name={`net ${t.net}`} sub={`${t.inAt} · ${t.outAt}`}
                trailing={<><ProvenanceChip kind="synced" /><QuantityChip>{t.net}</QuantityChip></>} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const rail = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <SectionLabel>today</SectionLabel>
      <Card padding={4}>
        <RailRow subject="14 tickets in the last batch" context="2m ago" status={<StatusMark kind="clean" size="body-4" label="Synced" />} style={{ padding: '10px 12px' }} />
        <RailRow subject="3 ready for a GRN" context="Northstar Commodities · Kalulu" right={<Button size="xsmall" variant="ghost">Open</Button>} style={{ padding: '10px 12px' }} />
        <RailRow subject="1 problematic" context="never weighed out" status={<StatusMark kind="attention" size="body-4" />} style={{ padding: '10px 12px' }} />
      </Card>
    </div>
  );

  const body = <>{silent ? <Banner tone="error" title="Weighbridge feed silent">position may look flat. Tickets can still be photographed.</Banner> : null}{empty ? null : attention}{ready}</>;
  if (mobile) return <>{head}{body}{rail}</>;
  return <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>{head}<Tabs tabs={['Tickets', 'Goods received', 'Dispatch']} value="Tickets" /><WithRail rail={rail}>{body}</WithRail></div>;
}

/** 07 GRN finalise — three outcomes, GR10000356 · Maize (white) · Harvest Co-op. */
export function GRNFinalise({ mobile = false }) {
  const compact = useCompact(mobile);
  const sectionGap = useMinWidth(1024) ? 32 : 24;
  const [busy, setBusy] = useState(false);
  const variants = [
    { key: 'within', outcome: 'within', label: 'Within tolerance', cols: [{ label: 'Weighed in', value: '28.20', unit: 't', provenance: 'synced' }, { label: 'Deduction', value: '0.00', unit: 't', provenance: 'ocr-medium' }, { label: 'Applied', value: '28.20', unit: 't', provenance: 'typed' }] },
    { key: 'held', outcome: 'held', label: 'Held for review', cols: [{ label: 'Weighed in', value: '28.20', unit: 't', provenance: 'synced' }, { label: 'Deduction', value: '1.20', unit: 't', provenance: 'ocr-medium', color: 'var(--warning-strong)' }, { label: 'Applied', value: '27.00', unit: 't', provenance: 'typed' }] },
    { key: 'block', outcome: 'block', label: 'Hard block', cols: [{ label: 'Gross', value: '34.20', unit: 't', provenance: 'synced' }, { label: 'Tare', value: '36.00', unit: 't', provenance: 'typed', color: 'var(--error-strong)' }, { label: 'Net', value: '—', provenance: 'typed' }] },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
      <PageHead breadcrumb={['Warehouse', 'Goods received']} title="GR10000356 · Maize (white)" meta="Harvest Co-op · ticket weights gross 34.2 · tare 6 · net 28.2 MT"
        intro="Three outcomes from the same ticket. The clerk never types a net — it is folded from the weighbridge." />
      <div style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0,1fr)' : 'repeat(3, minmax(0,1fr))', gap: 16, alignItems: 'start' }}>
        {variants.map((v) => (
          <div key={v.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SectionLabel>{v.label}</SectionLabel>
            <ReconcilePanel outcome={v.outcome} columns={v.cols} loading={busy && v.key === 'within'} onAction={() => { setBusy(true); setTimeout(() => setBusy(false), 1800); }}
              evidence={<><EvidenceTile kind="receipt" caption="slip-gr10000356" time="14:22" /><EvidenceTile caption="photo-truck-bap9229" time="14:24" /></>} />
          </div>
        ))}
      </div>
      <Text variant="body-4" tone="tertiary">Choice made here: the tolerance is 0.5 MT and a held GRN names its reviewer (Thandiwe). Kept consistent on every reconcile surface.</Text>
    </div>
  );
}

/** 08 Grading dispute — GR10000377 · DSP-0219 (Warehouse). */
export function GradingDispute({ mobile = false }) {
  const compact = useCompact(mobile);
  const sectionGap = useMinWidth(1024) ? 32 : 24;
  const panelFull = !useMinWidth(1024);
  const [outcome, setOutcome] = useState('uphold');
  const [busy, setBusy] = useState(false);
  const rows = [
    { id: 1, p: 'Moisture', reading: '13.4%', limit: '12.5%', status: 'over' },
    { id: 2, p: 'Extraneous matter', reading: '2.6%', limit: '2.0%', status: 'over' },
    { id: 3, p: 'Damaged grain', reading: '1.3%', limit: '2.0%', status: 'within' },
  ];
  const claim = (
    <Card title="Their claim" meta={['Lodged 1 Aug 18:14', '42d 18h open']}>
      <CardRow leading={<Avatar initials="KF" commodityColor="var(--commodity-maize)" />} name="Grace Kasonde · Kapiri Farms" sub="verified portal user" trailing={<ConfirmationChip kind="disputed" />} />
      <Text variant="body-2" style={{ textWrap: 'pretty' }}>“I delivered 30.0 t and my farm scale agreed. Nobody told me about a deduction on the day.”</Text>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <EvidenceTile kind="voice" duration="0:47" caption="voice-dsp0219-bemba-47s" />
        <EvidenceTile caption="photo-dsp0219-farm-scale-ticket" />
      </div>
    </Card>
  );
  const figures = <FigureStrip cells={[
    <Figure label="claimed" value="30.00" unit="t" size="heading-2-condensed" />,
    <Figure label="booked" value="29.70" unit="t" size="heading-2-condensed" />,
    <Figure label="in dispute" value="0.32" unit="t" size="heading-2-condensed" derivation="K2,176 at gate price" valueColor="var(--warning-strong)" />,
  ]} />;
  const pack = (
    <Card title="Our evidence pack" meta={['Spec version v4', 'Assessor P. Zulu']}>
      <div style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0,1fr)' : 'repeat(3, minmax(0,1fr))', gap: 16 }}>
        <Figure label="weighed in" value="30.02" unit="t" size="heading-3-condensed" />
        <Figure label="deduction" value="0.32" unit="t" size="heading-3-condensed" derivation="1.05% of weighed" />
        <Figure label="applied" value="29.70" unit="t" size="heading-3-condensed" />
      </div>
      <DataTable rows={rows} columns={[{ key: 'p', label: 'Parameter' }, { key: 'reading', label: 'Reading', align: 'right' }, { key: 'limit', label: 'Limit', align: 'right' }, { key: 'status', label: 'Status', align: 'right', render: (r) => <StatusMark kind={r.status} size="body-4" /> }]} />
      <Text variant="body-4" tone="tertiary">Spec version v4 · Assessor P. Zulu · Instrument GAC2500 #DJ-114 · Calibrated 2026-06-14 · Reading taken 19:16</Text>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><EvidenceTile caption="photo-dsp0219-probe-1" time="19:16" /><EvidenceTile caption="photo-dsp0219-probe-2" time="19:17" /></div>
      <Text variant="body-3" style={{ textWrap: 'pretty' }}>Both sides are close on weight — 30.0 t claimed against 30.02 t weighed at the bridge. The dispute is not about weighing. It is about whether the 0.32 t deduction was explained on the day.</Text>
    </Card>
  );
  const panel = (
    <ActionPanel tile="KF" context="GR10000377 · DSP-0219" subject="Resolve dispute" width={mobile || panelFull ? '100%' : 350}>
      <RadioList value={outcome} onChange={setOutcome} options={[{ value: 'uphold', label: 'Uphold deduction' }, { value: 'credit', label: 'Credit the difference', hint: '0.32 t · K2,176' }, { value: 'regrade', label: 'Re-grade from retained sample' }, { value: 'dismiss', label: 'Dismiss' }]} />
      <Text variant="body-4" tone="secondary" style={{ textWrap: 'pretty' }}>The retained sample is still inside its 30-day window, so a re-grade is available until 31 Aug.</Text>
      <PressButton kind="large" variant="primary" fullWidth loading={busy} onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 1800); }}>Resolve case</PressButton>
    </ActionPanel>
  );
  const head = (
    <PageHead breadcrumb={['Warehouse', 'Disputes']} title="GR10000377 · DSP-0219" meta="Lodged 1 Aug 18:14 · 42d 18h open"
      right={<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><StatusMark kind="awaiting" label="Awaiting resolution" /><ConfirmationChip kind="disputed" /></div>}
      intro="Grading dispute · 1 Aug delivery · BAX7720ZM · CTR-2026-0058 · resolver David Mulenga, escalates to Thandiwe at 3d." />
  );
  const history = <Card title="History"><Timeline entries={[{ text: 'Delivery weighed in at 30.02 t', actor: 'bridge', time: '1 Aug 18:02' }, { text: 'Grading: moisture 13.4% · deduction 0.32 t applied', actor: 'P. Zulu', time: '1 Aug 19:16' }, { text: 'Dispute lodged by Kapiri Farms', actor: 'C. Musonda', time: '1 Aug 18:14' }, { text: 'Escalated to Thandiwe', actor: 'system', time: '4 Aug 18:14' }]} /></Card>;
  if (mobile) return <>{head}{claim}{figures}{pack}{history}{panel}</>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
      {head}
      <WithPanel panel={panel}>{claim}{figures}{pack}{history}</WithPanel>
    </div>
  );
}
