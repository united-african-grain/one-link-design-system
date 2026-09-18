const MILLS = [
  { name: 'Kafue Valley Milling (KVM)', target: '15,000', firm: '6,900', declared: '1,000', short: 'short 7,100', pct: '53%', window: '38d', trend: 'down', share: 0.46, dec: 0.07 },
  { name: 'Crest Milling', target: '25,000', firm: '10,939', declared: '2,500', short: 'short 11,561', pct: '54%', window: '45d', trend: 'flat', share: 0.44, dec: 0.1 },
  { name: 'Greenfield Agri', target: '44,000', firm: '23,061', declared: '7,000', short: 'short 13,939', pct: '68%', window: '96d', trend: 'up', share: 0.52, dec: 0.16 },
  { name: 'Horizon Milling', target: '22,000', firm: '30,039', declared: '0', short: '+8,039 over', pct: '137%', window: '—', trend: 'rebalance', share: 1, dec: 0 },
  { name: 'Impala Milling', target: '20,000', firm: '20,000', declared: '0', short: 'covered', pct: '100%', window: '54d', trend: 'flat', share: 1, dec: 0 },
  { name: 'LKM', target: '15,750', firm: '15,750', declared: '0', short: 'covered', pct: '100%', window: '61d', trend: 'flat', share: 1, dec: 0 },
  { name: 'Brightloaf Bakeries', target: '2,250', firm: '2,250', declared: '0', short: 'covered', pct: '100%', window: '30d', trend: 'flat', share: 1, dec: 0, closed: true },
];

/** 04 Coverage: Wheat (local) (Trade Desk). */
export function Coverage({ mobile = false }) {
  const compact = useCompact(mobile);
  const sectionGap = useMinWidth(1024) ? 32 : 24;
  const [com, setCom] = useState('wheat-local');
  const wheat = 'var(--commodity-wheat)';
  const series = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ time: '2026-06-' + String(i + 1).padStart(2, '0'), value: 92000 + i * 700 + Math.sin(i / 3) * 1200 })), []);
  const initials = (s) => s.replace(/[^A-Za-z ]/g, '').split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const figures = (
    <FigureStrip cells={[
      <Figure label="target" value="144,000" unit="MT" size="heading-2-condensed" />,
      <Figure label="firm" value="108,939" unit="MT" size="heading-2-condensed" derivation="signed purchase legs" />,
      <Figure label="declared" value="10,500" unit="MT" size="heading-2-condensed" derivation="expected supply, non-binding" />,
      <Figure label="short" value="24,561" unit="MT" size="heading-2-condensed" derivation="shortfall 32,600 less 8,039 over-covered at Horizon"
        derivationRows={[{ label: 'Shortfall across mills', value: '32,600' }, { label: 'Over-covered at Horizon', value: '−8,039' }, { label: 'Short', value: '24,561', total: true }]} />,
    ]} />
  );

  const cards = (
    <div style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0,1fr)' : 'repeat(2, minmax(0,1fr))', gap: 16 }}>
      {MILLS.map((m) => (
        <Card key={m.name} interactive commodityColor={wheat} closed={m.closed} title={m.name} meta={[`target ${m.target}`, `window ${m.window}`]}>
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
      <Card title="Coverage over the season" meta="firm legs against target">
        <ChartCard height={200} series={[{ type: 'line', color: '#7A6937', name: 'Firm', format: (v) => Math.round(v).toLocaleString(), data: series }]} priceLines={[{ price: 144000, color: '#7A6937', title: 'Target' }]} style={{ boxShadow: 'none', padding: 0 }} />
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

  const foot = <Text variant="body-4" tone="tertiary">Firm = signed purchase legs · Declared = expected supply, non-binding; it overlays coverage, it never creates a leg · Short = target − firm − declared, netted across mills.</Text>;

  if (mobile) return <>{head}{figures}{cards}{rail}{foot}</>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
      {head}
      <Tabs tabs={['Trade Board', 'Coverage', 'Approvals']} value="Coverage" />
      <WithRail rail={rail}>{figures}{cards}{foot}</WithRail>
    </div>
  );
}
