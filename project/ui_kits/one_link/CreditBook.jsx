const FARMERS = [
  { id: 1, farmer: 'Kapiri Estates', facility: '$850,000', drawn: '$376,400', ltv: '25.3%', kind: 'breach' },
  { id: 2, farmer: 'Musamba Estates', facility: '$214,000', drawn: '$140,100', ltv: '12.5%' },
  { id: 3, farmer: 'Greenfield Agri (Z) Ltd', facility: '$106,150', drawn: '$106,150', ltv: '6.9%' },
  { id: 4, farmer: 'Lunda Farms – North', facility: '$96,500', drawn: '$24,100', ltv: '11.1%' },
  { id: 5, farmer: 'Chisomo Agri', facility: '$88,400', drawn: '$0', ltv: '9.3%' },
  { id: 6, farmer: 'Lunda Farms – West', facility: '$74,000', drawn: '$0', ltv: '10.9%' },
  { id: 7, farmer: 'Meridian Farming Ltd', facility: '$61,600', drawn: '$61,600', ltv: '10.0%' },
  { id: 8, farmer: 'Mulungu Farming', facility: '$52,500', drawn: 'set %', drawnWarn: true, ltv: '20.8%', kind: 'attention' },
  { id: 9, farmer: 'Riverbend Farm', facility: '$43,700', drawn: '$24,600', ltv: '12.0%' },
  { id: 10, farmer: 'Highveld Cropping', facility: '$39,800', drawn: '$39,800', ltv: '11.1%' },
  { id: 11, farmer: 'Stonebridge', facility: '$37,000', drawn: '$37,000', ltv: '12.8%' },
];

/** 10 Farmer Finance: Credit book (Programmes). */
export function CreditBook({ mobile = false }) {
  const compact = useCompact(mobile);
  const sectionGap = useMinWidth(1024) ? 32 : 24;
  const [price, setPrice] = useState('$400');
  const wheat = 'var(--commodity-wheat)';
  const ltv = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ time: '2026-07-' + String(i + 1).padStart(2, '0'), value: 17.5 + Math.sin(i / 4) * 2.6 + i * 0.28 })), []);

  const head = <PageHead title="Credit book: Winter Wheat 2026" meta="12 farmers · season 2026" right={<Capsule selected>Season 2026</Capsule>} />;

  const figures = <FigureStrip cells={[
    <Figure label="total facility" value="$1,663,250" size="heading-2-condensed" derivation="12 farmers" />,
    <Figure label="drawn exposure" value="$1,041,900" size="heading-2-condensed" derivation="62.6% utilised" />,
    <Figure label="weighted live LTV" value="12.6%" size="heading-2-condensed" derivation="at $400/MT planning price" />,
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Figure label="breaches" value="1 red · 3 amber" size="heading-3-condensed" />
      <Button size="xsmall" variant="outline">View alerts</Button>
    </div>,
  ]} />;

  const cols = [
    { key: 'farmer', label: 'Farmer', render: (r) => <RefCell>{r.farmer}</RefCell> },
    { key: 'facility', label: 'Facility', align: 'right' },
    { key: 'drawn', label: 'Drawn', align: 'right', render: (r) => r.drawnWarn ? <QuantityChip tone="warning">set %</QuantityChip> : r.drawn },
    { key: 'ltv', label: 'Live LTV', align: 'right', render: (r) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {r.kind ? <StatusMark kind={r.kind} size="body-4" label={r.kind === 'breach' ? 'Breach' : 'Attention'} /> : null}
        <PressButton kind="figure">{r.ltv}</PressButton>
      </span>
    ) },
  ];

  const table = <Card padding={16}><DataTable columns={cols} rows={FARMERS} footer="Showing 11 of 12 farmers · one facility pending signature" /></Card>;

  const rail = (
    <>
      <Card title="Market price" meta="Wheat $400/MT">
        <LineStepper values={['$360', '$380', '$400', '$420']} value={price} onChange={setPrice} activeColor={wheat} />
        <Text variant="body-3" tone="secondary" style={{ textWrap: 'pretty' }}>Planning price locked at upload. Editing rescores the whole book instantly.</Text>
        <Text variant="body-4" tone="tertiary">Last change: none</Text>
      </Card>
      <Card title="Concentration · top 5">
        {[['Kapiri Estates', '$376,400', '36%', 0.36], ['Musamba Estates', '$140,100', '13%', 0.13], ['Greenfield Agri (Z) Ltd', '$106,150', '10%', 0.1], ['Meridian Farming Ltd', '$61,600', '6%', 0.06], ['Highveld Cropping', '$39,800', '4%', 0.04]].map(([n, v, p, s]) => (
          <CardRow key={n} name={n} bar={<ShareBar share={s} color={wheat} maxWidth={140} />} figure={v} trailing={<QuantityChip>{p}</QuantityChip>} />
        ))}
      </Card>
      <Card title="Season memory" meta="3 prior seasons on file">
        <SummaryList items={[{ label: 'Side-selling flags', value: '2' }, { label: 'Security instruments', value: '1' }]} />
      </Card>
      <Card title="Kapiri Estates LTV" meta="against its 20% line and 22% cap">
        <ChartCard height={200} series={[{ type: 'baseline', baseValue: 20, name: 'LTV', format: (v) => v.toFixed(1) + '%', color: '#df0c10', data: ltv }]}
          priceLines={[{ price: 22, color: '#df0c10', title: '22% cap' }, { price: 20, color: '#a16207', title: '20% line' }]} style={{ boxShadow: 'none', padding: 0 }} />
      </Card>
    </>
  );

  const foot = <Text variant="body-4" tone="tertiary">Every number here is derived from the ledger. Nothing on this screen is typed.</Text>;
  if (mobile) return <>{head}{figures}{table}{rail}{foot}</>;
  return <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>{head}<WithRail rail={rail}>{figures}{table}{foot}</WithRail></div>;
}
