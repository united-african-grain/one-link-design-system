const MILLS = [
  { name: 'Kafue Valley Milling (KVM)', target: '15,000', firm: '6,900', declared: '1,000', short: 'short 8,100', pct: '46%', window: '38d', trend: 'down', share: 0.46, dec: 0.07 },
  { name: 'Crest Milling', target: '25,000', firm: '10,939', declared: '2,500', short: 'short 14,061', pct: '44%', window: '45d', trend: 'flat', share: 0.44, dec: 0.1 },
  { name: 'Greenfield Agri', target: '44,000', firm: '23,061', declared: '7,000', short: 'short 20,939', pct: '52%', window: '96d', trend: 'up', share: 0.52, dec: 0.16 },
  { name: 'Horizon Milling', target: '22,000', firm: '30,039', declared: '0', short: '+8,039 over', pct: '137%', window: '—', trend: 'rebalance', share: 1, dec: 0 },
  { name: 'Impala Milling', target: '20,000', firm: '20,000', declared: '0', short: 'covered', pct: '100%', window: '54d', trend: 'flat', share: 1, dec: 0 },
  { name: 'LKM', target: '15,750', firm: '15,750', declared: '0', short: 'covered', pct: '100%', window: '61d', trend: 'flat', share: 1, dec: 0 },
  { name: 'Brightloaf Bakeries', target: '2,250', firm: '2,250', declared: '0', short: 'covered', pct: '100%', window: '30d', trend: 'flat', share: 1, dec: 0, closed: true },
];

/** The short figure's Calculation details (UX-18; corrected at source, M5.DS.02): Sold and Firm secured as rows, the gap
    as the bold total, sold minus firm secured. Declared supply is expected and non-binding: drawn dashed on each mill's
    bar and named here as not subtracted. Uncommitted stock and stock in transit are Could cover, never subtracted. */
export const COVERAGE_SHORT = {
  name: 'Short, wheat (local)', value: '35,061 MT',
  components: [{ label: 'Sold', value: '144,000 MT' }, { label: 'Firm secured', value: '-108,939 MT' }],
  total: { label: 'Short (MT)', value: '35,061' },
  basis: [{ label: 'Declared, expected and not subtracted', value: '10,500 MT' }, { label: 'Could cover, not subtracted', value: '1,840 MT' }, { label: 'Netted across mills, Horizon Milling over', value: '8,039 MT' }],
};

/** Supply on the way by mill (M7.DS.01, UAG-99): imported legs loaded and not yet offloaded, the same 640 MT as Could
    cover's stock in transit. Shown beside the gap and never subtracted from it. */
export const COVERAGE_IN_TRANSIT = [
  { id: 'kvm', mill: 'Kafue Valley Milling (KVM)', sold: '15,000', firm: '6,900', transit: '300', short: '8,100' },
  { id: 'crest', mill: 'Crest Milling', sold: '25,000', firm: '10,939', transit: '270', short: '14,061' },
  { id: 'greenfield', mill: 'Greenfield Agri', sold: '44,000', firm: '23,061', transit: '70', short: '20,939' },
  { id: 'total', total: true, mill: 'Total', sold: '', firm: '', transit: '640', short: '' },
];

/** 04 Coverage: Wheat (local) (Trade Desk). `state` 'Calculation details' opens the short figure's panel; 'In transit'
    (M7.DS.01) adds supply on the way beside the gap and the in-transit column by mill, the other states unchanged. */
export function Coverage({ mobile = false, state = 'Board' }) {
  const compact = useCompact(mobile);
  const sectionGap = useMinWidth(1024) ? 32 : 24;
  const [com, setCom] = useState('wheat-local');
  const [calc, setCalc] = useState(state === 'Calculation details');
  useEffect(() => setCalc(state === 'Calculation details'), [state]);
  const transit = state === 'In transit';
  const wheat = 'var(--commodity-wheat)';
  const series = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ time: '2026-06-' + String(i + 1).padStart(2, '0'), value: 92000 + i * 700 + Math.sin(i / 3) * 1200 })), []);
  const initials = (s) => s.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const figures = (
    <FigureStrip cells={[
      <Figure label="sold" value="144,000" unit="MT" size="heading-2-condensed" />,
      <Figure label="firm secured" value="108,939" unit="MT" size="heading-2-condensed" derivation="signed purchase legs" />,
      <Figure label="declared" value="10,500" unit="MT" size="heading-2-condensed" derivation="expected, non-binding, never subtracted" />,
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
        <Figure label="short" value="35,061" unit="MT" size="heading-2-condensed" derivation="sold minus firm secured" />
        <Button size="xsmall" variant="outline" onClick={() => setCalc(true)}>View details</Button>
      </div>,
      ...(transit ? [<Figure label="supply on the way" value="640" unit="MT" size="heading-2-condensed" derivation="imported legs loaded, not yet offloaded, never subtracted"
        derivationRows={COVERAGE_IN_TRANSIT.filter((m) => !m.total).map((m) => ({ label: m.mill, value: m.transit })).concat([{ label: 'Supply on the way', value: '640', total: true }])} />] : []),
      <Figure label="could cover" value="1,840" unit="MT" size="heading-2-condensed" derivation="uncommitted stock and stock in transit, never subtracted"
        derivationRows={[{ label: 'Uncommitted stock', value: '1,200' }, { label: 'Stock in transit', value: '640' }, { label: 'Could cover', value: '1,840', total: true }]} />,
    ]} />
  );

  const strong = (r, v) => (r.total ? <Text variant="body-3" strong tabular>{v}</Text> : v);
  const inTransit = transit ? (
    <Card title="In transit by mill" meta="imported legs loaded, not yet offloaded" padding={16}>
      <DataTable rowKey="id" rows={COVERAGE_IN_TRANSIT} minWidth={560} columns={[
        { key: 'mill', label: 'Mill', width: 'minmax(170px, 1fr)', render: (r) => strong(r, r.mill) },
        { key: 'sold', label: 'Sold (MT)', width: '100px', align: 'right', render: (r) => strong(r, r.sold) },
        { key: 'firm', label: 'Firm secured (MT)', width: '140px', align: 'right', render: (r) => strong(r, r.firm) },
        { key: 'short', label: 'Short (MT)', width: '100px', align: 'right', render: (r) => strong(r, r.short) },
        { key: 'transit', label: 'In transit (MT)', width: '120px', align: 'right', render: (r) => strong(r, r.transit) },
      ]} />
    </Card>
  ) : null;

  const cards = (
    <div style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0,1fr)' : 'repeat(2, minmax(0,1fr))', gap: 16 }}>
      {MILLS.map((m) => (
        <Card key={m.name} interactive commodityColor={wheat} closed={m.closed} title={m.name} meta={[`sold ${m.target}`, `window ${m.window}`]}>
          <CardRow closed={m.closed} leading={<Avatar initials={initials(m.name)} commodityColor={wheat} dimmed={m.closed} />}
            name={`Firm ${m.firm}`} sub={m.declared !== '0' ? `declared ${m.declared}` : null}
            bar={<ShareBar share={m.share} declared={m.dec} color={wheat} dimmed={m.closed} />} figure={m.short}
            trailing={<><StatusMark kind={m.trend} size="body-4" /><PressButton kind="figure" disabled={m.closed}>{m.pct}</PressButton></>} />
        </Card>
      ))}
    </div>
  );

  const rail = (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SectionLabel>needs you</SectionLabel>
        <Card padding={4}>
          <RailRow severity="high" subject="Tembo: 0 of 12 trucks against schedule this week" context="gone quiet · 6d" right={<Button size="xsmall" variant="outline">Call</Button>} style={{ padding: '10px 12px' }} />
          <RailRow severity="normal" subject="ZAM4698 window ends in 9 days" context="780t still open · ends 11 Aug" right={<Button size="xsmall" variant="outline">Open</Button>} style={{ padding: '10px 12px' }} />
        </Card>
      </div>
      <Card title="Coverage over the season" meta="firm legs against sold">
        <ChartCard height={200} series={[{ type: 'line', color: '#7A6937', name: 'Firm', format: (v) => Math.round(v).toLocaleString(), data: series }]} priceLines={[{ price: 144000, color: '#7A6937', title: 'Sold' }]} style={{ boxShadow: 'none', padding: 0 }} />
      </Card>
    </>
  );

  const head = (
    <PageHead title="Coverage" meta="Tue 24 Jun · 07:02" intro="Nobody types a balance. Every figure below is derived from signed legs, declarations and movement.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ScrollRow><CommodityTabs value={com} onChange={setCom} tabs={[{ value: 'white-maize', label: 'White maize' }, { value: 'wheat-local', label: 'Wheat (local)' }, { value: 'soya', label: 'Soya' }, { value: 'se-meal', label: 'SE meal' }]} /></ScrollRow>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Capsule selected>Season 2026</Capsule><Capsule chevron>Site: all</Capsule></div>
      </div>
    </PageHead>
  );

  const foot = <Text variant="body-4" tone="tertiary">Firm secured = signed purchase legs · Declared = expected supply, non-binding, drawn dashed and never subtracted · Short = sold minus firm secured, netted across mills · Could cover = uncommitted stock and stock in transit, never subtracted.</Text>;
  const panel = calc ? <CalculationDetails open onClose={() => setCalc(false)} name={COVERAGE_SHORT.name} value={COVERAGE_SHORT.value} components={COVERAGE_SHORT.components} total={COVERAGE_SHORT.total} basis={COVERAGE_SHORT.basis} /> : null;

  if (mobile) return <>{head}{figures}{inTransit}{cards}{rail}{foot}{panel}</>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
      {head}
      <Tabs tabs={['Trade Board', 'Coverage', 'Approvals']} value="Coverage" />
      <WithRail rail={rail}>{figures}{inTransit}{cards}{foot}</WithRail>
      {panel}
    </div>
  );
}
