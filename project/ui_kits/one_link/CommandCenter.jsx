/** 01 Command Center — Calm and Exception (owner). */
export function CommandCenter({ state = 'calm', mobile = false }) {
  const exception = state === 'exception';
  const [period, setPeriod] = useState('Month');
  const [view, setView] = useState('Overview');
  const pos = useMemo(() => Array.from({ length: 24 }, (_, i) => ({ time: '2026-06-' + String(i + 1).padStart(2, '0'), value: 108 + i * 0.75 + Math.sin(i / 2) * 2.2 })), []);

  const banner = exception
    ? <Banner tone="warning" title="Attention">1 counterparty dispute open</Banner>
    : <Banner tone="success" title="Clean">books match reality · all reconciled</Banner>;

  const hero = (
    <Card padding={mobile ? 16 : 20} gap={20}>
      <div style={{ display: mobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: mobile ? undefined : 'minmax(0,1fr) 1px minmax(0,1fr)', gap: mobile ? 20 : 24, alignItems: 'start' }}>
        <Figure label="your position right now" value="K125M" size={mobile ? 'display-2-condensed' : 'display-1-condensed'} derivation="physical K80M · in-transit K45M"
          derivationRows={[{ label: 'Physical stock', value: 'K80M' }, { label: 'In transit', value: 'K45M' }, { label: 'Position', value: 'K125M', total: true }]} />
        {mobile ? null : <span style={{ alignSelf: 'stretch', background: 'var(--border-light)' }} />}
        <Figure label="blended margin" value="K11.8M" size={mobile ? 'heading-1-condensed' : 'display-3-condensed'} delta="9.4%" derivation="margin on delivered tonnes, month to date" />
      </div>
      <ChartCard title="Position over the month" height={mobile ? 200 : 280} ranges={['1M', '3M', '1Y']} range="1M"
        series={[{ type: 'area', color: '#2563EB', name: 'Position', format: (v) => 'K' + Math.round(v) + 'M', data: pos }]}
        style={{ boxShadow: 'none', padding: 0 }} />
    </Card>
  );

  const tiles = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionLabel>month to date</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3, minmax(0,1fr))', gap: 16 }}>
        <Card><Figure label="in" value="+K8.8M" delta="12 receipts" deltaDirection="up" derivation="goods received, month to date" /></Card>
        <Card><Figure label="out" value="K5.6M" derivation="8 dispatches" /></Card>
        <Card><Figure label="net" value="+K3.2M" delta="net movement" deltaDirection="up" derivation="in K8.8M less out K5.6M" /></Card>
      </div>
    </div>
  );

  const rail = (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SectionLabel>what needs you</SectionLabel>
        <Card padding={exception ? 4 : 0}>
          {exception ? (
            <>
              <RailRow severity="critical" subject="GR10000377 · counterparty dispute" context="Kapiri Farms says 30.0t vs 29.7t" right={<Button size="xsmall" variant="outline">Review</Button>} style={{ padding: '10px 12px' }} />
              <RailRow severity="high" subject="Weighbridge feed silent" context="last batch 3h 12m ago · tickets can still be photographed" right={<Button size="xsmall" variant="outline">Open tickets</Button>} style={{ padding: '10px 12px' }} />
            </>
          ) : <EmptyState meta="Checked 07:02 · next digest 13:00" />}
        </Card>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SectionLabel>movements today</SectionLabel>
        <Card padding={4}>
          <RailRow subject="GR10000377 · Kapiri Farms" context="30.02t received" status={<StatusMark kind={exception ? 'attention' : 'clean'} size="body-4" />} right={<Text variant="heading-3-condensed">30.02t</Text>} style={{ padding: '10px 12px' }} />
          <RailRow subject="GR10000360 · Northstar Commodities" context="28.20t received" status={<StatusMark kind="clean" size="body-4" />} right={<Text variant="heading-3-condensed">28.20t</Text>} style={{ padding: '10px 12px' }} />
          <RailRow subject="DN10000441 · Crest Milling" context="120t dispatched" status={<StatusMark kind="awaiting" size="body-4" />} right={<Text variant="heading-3-condensed">120t</Text>} style={{ padding: '10px 12px' }} />
          <RailRow subject="WBT10001605 · Northstar Commodities" context="net 28.20t · ready for a GRN" status={<ProvenanceChip kind="synced" />} style={{ padding: '10px 12px' }} />
        </Card>
      </div>
    </>
  );

  const head = (
    <PageHead title="Command Center" meta="Tue 24 Jun · 07:02" right={mobile ? null : <Segmented options={['Overview', 'Trends']} value={view} onChange={setView} />}>
      <CapsuleGroup mobile={mobile} options={['Today', 'Week', 'Month', 'Quarter', 'Year', '6 months']} value={period} onChange={setPeriod} />
    </PageHead>
  );

  if (mobile) {
    return (
      <>
        {head}
        {exception ? <Banner tone="error" title="Weighbridge feed silent">position may look flat. Tickets can still be photographed.</Banner> : null}
        {banner}
        {hero}
        {tiles}
        {rail}
      </>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--section-gap-desktop)' }}>
      {head}
      <WithRail rail={rail}>
        {exception ? <Banner tone="error" title="Weighbridge feed silent">position may look flat. Tickets can still be photographed.</Banner> : null}
        {banner}
        {hero}
        {tiles}
      </WithRail>
    </div>
  );
}
