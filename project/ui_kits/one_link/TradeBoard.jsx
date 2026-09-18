const TRADES = [
  { id: 1, ref: 'ZAM4702', cp: 'Kafue Valley Milling', com: 'White maize', color: 'var(--commodity-maize)', mt: '2,000', sell: '6,800', buy: '6,600', margin: 'K400,000', del: '1,400 / 2,000t', share: 0.7, chip: '1,400t' },
  { id: 2, ref: 'ZAM4698', cp: 'Crest Milling', com: 'Wheat', color: 'var(--commodity-wheat)', mt: '3,000', sell: '9,050', buy: '8,720', margin: 'K990,000', del: '2,220 / 3,000t', share: 0.74, chip: '2,220t' },
  { id: 3, ref: 'ZAM4691', cp: 'Brightloaf Bakeries', com: 'Maize', color: 'var(--commodity-maize)', mt: '2,250', sell: '6,780', buy: '6,540', margin: 'K540,000', del: '2,250 / 2,250t', share: 1, chip: '2,250t', closed: true },
  { id: 4, ref: 'ZAM4688', cp: 'Impala Milling', com: 'Wheat (import)', color: 'var(--commodity-wheat)', mt: '5,200', sell: '506', buy: '488', margin: 'K93,600', del: '5,141 / 5,200t offloaded', share: 0.99, chip: '5,141t' },
];

/** 03 Trade Board (Trade Desk): owner, restricted and loading variants. */
export function TradeBoard({ state = 'default', mobile = false }) {
  const compact = useCompact(mobile);
  const sectionGap = useMinWidth(1024) ? 32 : 24;
  const [stage, setStage] = useState('Contracted');
  const [layout, setLayout] = useState('Cards');
  const restricted = state === 'restricted';
  const loading = state === 'loading';
  const initials = (s) => s.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const strip = (
    <FigureStrip cells={[
      <Figure label="White maize" value="long 606t" size="heading-2-condensed" delta="606t" deltaDirection="up" derivation="signed legs less dispatches" />,
      <Figure label="Wheat (local)" value="short 24,561t" size="heading-2-condensed" delta="24,561t" deltaDirection="down" derivation="target less firm and declared" />,
      <Figure label="Soya" value="flat" size="heading-2-condensed" delta="0t" deltaDirection="flat" derivation="no open position" />,
      <Figure label="Blended margin MTD" value="8.1%" size="heading-2-condensed" derivation="K11.8M on delivered tonnes" />,
    ]} />
  );

  const needs = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <SectionLabel>needs you</SectionLabel>
      <Card padding={4}>
        <RailRow severity="critical" subject="ZAM4702 short 1,400t for Kafue Valley Milling" context="window closes in 12 days · 2d" right={<Button size="xsmall" variant="outline">Find supply</Button>} style={{ padding: '10px 12px' }} />
        <RailRow severity="high" subject="2 trades awaiting approval" context="T-0142 · T-0141 · 3h / 1d4h" right={<Button size="xsmall" variant="outline">Review</Button>} style={{ padding: '10px 12px' }} />
        <RailRow severity="high" subject="Tembo Farms gone quiet" context="0 of 12 expected trucks this week · 6d" right={<div style={{ display: 'flex', gap: 6 }}><Button size="xsmall" variant="outline">Call</Button><Button size="xsmall" variant="ghost">Flag</Button></div>} style={{ padding: '10px 12px' }} />
      </Card>
    </div>
  );

  const cards = (
    <div style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0,1fr)' : 'repeat(2, minmax(0,1fr))', gap: 16 }}>
      {loading ? [0, 1, 2, 3].map((i) => <CardSkeleton key={i} />) : TRADES.map((t) => (
        <Card key={t.id} interactive commodityColor={t.color} closed={t.closed} onClick={() => {}}
          title={`${t.ref} · ${t.cp}`} meta={[t.com, `${t.mt} MT`, restricted ? `sell ${t.sell}` : `sell ${t.sell} → buy ${t.buy}`]}>
          <CardRow closed={t.closed} leading={<Avatar initials={initials(t.cp)} commodityColor={t.color} dimmed={t.closed} />}
            name="Delivered" bar={<ShareBar share={t.share} color={t.color} dimmed={t.closed} />} figure={t.del}
            trailing={<><QuantityChip dimmed={t.closed}>{t.chip}</QuantityChip>{restricted ? <RestrictedCell tooltip="Not available to Stock Control" /> : <PressButton kind="figure" disabled={t.closed}>{t.margin}</PressButton>}</>} />
        </Card>
      ))}
    </div>
  );

  const cols = [
    { key: 'ref', label: 'Ref', width: '110px', render: (r) => <RefCell>{r.ref}</RefCell> },
    { key: 'cp', label: 'Counterparty' },
    { key: 'com', label: 'Commodity' },
    { key: 'mt', label: 'MT', align: 'right' },
    { key: 'sell', label: 'Sell', align: 'right' },
    { key: 'buy', label: 'Buy', align: 'right', render: (r) => restricted ? <RestrictedCell /> : r.buy },
    { key: 'margin', label: 'Margin', align: 'right', render: (r) => restricted ? <RestrictedCell /> : <DerivedCell rows={[{ label: 'Sell × MT', value: 'K' + (+r.sell.replace(/,/g, '') * +r.mt.replace(/,/g, '')).toLocaleString() }, { label: 'Buy × MT', value: '−K' + (+r.buy.replace(/,/g, '') * +r.mt.replace(/,/g, '')).toLocaleString() }, { label: 'Margin', value: r.margin, total: true }]}>{r.margin}</DerivedCell> },
    { key: 'del', label: 'Delivered', align: 'right', tone: 'secondary' },
  ];

  const pipeline = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionLabel right={mobile ? null : <Segmented options={['Cards', 'Table']} value={layout} onChange={setLayout} />}>pipeline</SectionLabel>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <CapsuleGroup mobile={mobile} value={stage} onChange={setStage} options={[{ value: 'Lead', label: 'Lead', count: 4 }, { value: 'Opportunity', label: 'Opportunity', count: 6 }, { value: 'Approved', label: 'Approved', count: 3 }, { value: 'Contracted', label: 'Contracted', count: 18 }, { value: 'Complete', label: 'Complete', count: 41 }]} />
        <Capsule chevron>Season 2026</Capsule>
        <Capsule chevron>All commodities</Capsule>
      </div>
      {layout === 'Table' && !mobile && !loading ? <Card padding={16}><DataTable columns={cols} rows={TRADES} footer="Showing 4 of 72 trades · season 2026" /></Card> : cards}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text variant="body-3" tone="tertiary">Showing 4 of 72 trades · season 2026</Text>
        <Text variant="body-4" tone="tertiary">{restricted ? 'Buy prices and margins are not available to your role.' : 'Showing buy prices and margins for owner.'}</Text>
      </div>
    </div>
  );

  const head = (
    <PageHead title="Trade Desk" meta="Tue 24 Jun · 07:02 · season 2026"
      right={<><Button variant="subtle" icon="eye-off">{restricted ? 'Restricted view' : 'Owner view'}</Button><Button variant="brand" icon="plus">New trade</Button></>} />
  );

  if (mobile) return <>{head}<Tabs tabs={['Trade Board', 'Coverage', 'Approvals']} value="Trade Board" />{strip}{needs}{pipeline}</>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
      {head}
      <Tabs tabs={['Trade Board', 'Coverage', 'Approvals']} value="Trade Board" />
      <WithRail rail={needs}>{strip}{pipeline}</WithRail>
    </div>
  );
}
