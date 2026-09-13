/** 05 Approval — trade T-0141 (detail page + decision panel). */
export function Approval({ mobile = false }) {
  const [busy, setBusy] = useState(true);
  const wheat = 'var(--commodity-wheat)';
  const price = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ time: '2026-07-' + String(i + 1).padStart(2, '0'), value: 8950 + i * 9 + Math.cos(i / 3) * 70 })), []);

  const legs = (
    <Card title="Sale" meta={['SELL 900 MT @ 9,150', 'Crest Milling']}>
      <CardRow leading={<Avatar initials="CM" commodityColor={wheat} />} name="A · Kabwe 600 MT" bar={<ShareBar share={0.67} color={wheat} />} figure="67% of sale" trailing={<QuantityChip>firm</QuantityChip>} />
      <CardRow leading={<Avatar initials="KF" commodityColor={wheat} />} name="B · Mazabuka ~300 MT" bar={<ShareBar share={0} declared={0.33} color={wheat} />} figure="33% of sale" trailing={<QuantityChip dimmed>declared</QuantityChip>} />
      <Banner tone="info">Kapiri's 300 is declared — non-binding. Approving does not make it firm.</Banner>
    </Card>
  );

  const figures = (
    <FigureStrip cells={[
      <Figure label="blended margin" value="K148,500" size="heading-2-condensed" delta="3.8%" deltaDirection="down" deltaSuffix=" vs 5.1% blended, 30d" />,
      <Figure label="terms" value="pay 7d / receive 30d" size="heading-3-condensed" derivation="policy is 14d receive" />,
      <Figure label="coverage" value="firm 600 · declared 300" size="heading-3-condensed" derivation="short 0 ~declared" />,
    ]} />
  );

  const note = (
    <Card>
      <CardRow leading={<Avatar initials="SL" />} name="S. Lungu asks" sub="raised 3 Aug 06:00" />
      <Text variant="body-3" tone="secondary" style={{ textWrap: 'pretty' }}>Closes part of the Crest gap. Terms sit outside the 14-day receive policy — flagging for sign-off.</Text>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><StatusMark kind="attention" label="receive 30d — outside 14d policy" /><ConfirmationChip kind="awaiting" /></div>
      <Text variant="body-4" tone="tertiary">raised 3 Aug 06:00 · T-0141 · corr ref TR-2026-0141</Text>
    </Card>
  );

  const chart = <Card title="Wheat price" meta="30 days"><ChartCard height={mobile ? 200 : 240} series={[{ type: 'line', color: '#7A6937', name: 'Wheat', format: (v) => Math.round(v).toLocaleString(), data: price }]} priceLines={[{ price: 9150, color: '#7A6937', title: '9,150 sell' }]} style={{ boxShadow: 'none', padding: 0 }} /></Card>;

  const panel = (
    <ActionPanel tile="SL" context="T-0141 · Crest Milling · Wheat" subject="Decision" width={mobile ? '100%' : 350}>
      <SummaryList items={[{ label: 'Blended margin', value: 'K148,500', strong: true }, { label: 'vs 30d blended', value: <><Icon name="trending-down" size={12} color="var(--content-accent-down)" />3.8%</> }, { label: 'Terms', value: 'pay 7d / receive 30d' }, { label: 'Waiting', value: '1d 4h' }]} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PressButton kind="large" variant="primary" fullWidth loading={busy} onClick={() => setBusy(true)}>Approve</PressButton>
        <Button variant="outline" fullWidth onClick={() => setBusy(false)}>Query</Button>
        <Button variant="critical-ghost" fullWidth>Decline</Button>
      </div>
      <Text variant="body-4" tone="tertiary" style={{ textAlign: 'center' }}>{busy ? 'Approving — this stays busy until it lands.' : 'Query returns it to S. Lungu with your note.'}</Text>
    </ActionPanel>
  );

  const head = (
    <PageHead breadcrumb={['Trade Desk', 'Approvals']} title="T-0141 · Crest Milling · Wheat" meta="waiting 1d 4h"
      right={<SeverityTag level="high" />} />
  );

  if (mobile) return <>{head}{legs}{figures}{note}{chart}<div style={{ position: 'sticky', bottom: 0, background: 'var(--surface)', paddingTop: 12 }}><PressButton kind="large" variant="primary" fullWidth loading={busy}>Approve</PressButton></div></>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--section-gap-desktop)' }}>
      {head}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 350px', gap: 'var(--rail-gap)', alignItems: 'start' }}>
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 'var(--section-gap-desktop)' }}>{legs}{figures}{note}{chart}</div>
        <div style={{ position: 'sticky', top: 24 }}>{panel}</div>
      </div>
    </div>
  );
}
