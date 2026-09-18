const STACKS = [
  { id: 'A1', product: 'White maize', grade: 'comm.', owner: 'Own', mt: '8,204', count: '02 Jul', flag: '0.1% variance', flagKind: 'within' },
  { id: 'A2', product: 'White maize', grade: 'u/g', owner: 'Own', mt: '1,110', count: '02 Jul', flag: 'under-grade: not sellable as comm.', flagKind: 'attention' },
  { id: 'A3', product: 'White maize', grade: 'comm.', owner: 'Own', mt: '6,412', count: '02 Jul', flag: '' },
  { id: 'B1', product: 'Soya', grade: 'comm.', owner: 'LEGACY 3P', mt: '2,100', count: '02 Jul', flag: 'storage $4.50/t/mo', flagKind: 'awaiting' },
  { id: 'B2', product: 'Soya', grade: 'comm.', owner: 'Own', mt: '3,894', count: '02 Jul', flag: '' },
  { id: 'S-SILO', product: 'Wheat', grade: '—', owner: 'Own @ BRL', mt: '6,480', count: '30 Jun', flag: 'issuer: BRL', flagKind: 'awaiting' },
  { id: 'C1', product: 'Soya meal', grade: 'comm.', owner: 'Own', mt: '5,917', count: '12 May', flag: 'uncounted 82 days', flagKind: 'attention' },
];

/** 09 Stock board: Kafue Road, Lusaka (Stock). Owner and Stock Control views. */
export function StockBoard({ role = 'Owner', mobile = false }) {
  const compact = useCompact(mobile);
  const sectionGap = useMinWidth(1024) ? 32 : 24;
  const [owners, setOwners] = useState('All owners');
  const restricted = role !== 'Owner';

  const head = (
    <PageHead title="Stock: Kafue Road, Lusaka" meta="folded from 41,882 movements · to 03 Aug 2026 · 07:10"
      right={<><Capsule>Gate price today 6,800 ZMW/t</Capsule><Button variant="outline">Transfer</Button><Button variant="primary">Start count session</Button></>}
      intro="This board is a fold of every movement. There is no stored balance to correct." />
  );

  const figures = (
    <div style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0,1fr)' : 'repeat(2, minmax(0,1fr))', gap: 16 }}>
      <Card><Figure label="site total" value="34,117" unit="MT" size={compact ? 'display-4-condensed' : 'display-3-condensed'} derivation="across 7 stacks and silos" /></Card>
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: compact ? 'minmax(0,1fr)' : 'repeat(3, minmax(0,1fr))', gap: 16 }}>
          <Figure label="committed" value="6,900" unit="MT" size="heading-3-condensed" derivation="already sold" />
          <Figure label="third-party held" value="2,100" unit="MT" size="heading-3-condensed" derivation="in our shed, not our grain" />
          <Figure label="free to sell" value="25,117" unit="MT" size="heading-3-condensed" derivation="site total less committed and 3P"
            derivationRows={[{ label: 'Site total', value: '34,117' }, { label: 'Committed', value: '−6,900' }, { label: 'Third-party held', value: '−2,100' }, { label: 'Free to sell', value: '25,117', total: true }]} />
        </div>
      </Card>
      <Card style={{ gridColumn: compact ? undefined : 'span 2' }}>
        {restricted
          ? <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><Text variant="body-3" tone="secondary">book value at cost</Text><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><RestrictedCell /><Text variant="body-3" tone="tertiary">Not available to Stock Control</Text></div></div>
          : <Figure label="book value at cost" value="K190,790,400" size="heading-1-condensed" derivation="weighted average cost across stacks" />}
      </Card>
    </div>
  );

  const needs = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <SectionLabel>needs attention</SectionLabel>
      <Card padding={4}>
        <RailRow severity="critical" subject="Negative balance candidate: B2 soya" context="dispatch DN10000441 for 120 t would take B2 to −16 t · movement held" right={<Button size="xsmall" variant="outline">Investigate</Button>} style={{ padding: '10px 12px' }} />
        <RailRow severity="high" subject="C1 soya meal uncounted for 82 days" context="policy is monthly · 5,917 t unverified since 12 May" right={<Button size="xsmall" variant="outline">Count now</Button>} style={{ padding: '10px 12px' }} />
        <RailRow severity="normal" subject="Legacy 3P storage accruing since 14 Jun" context="2,100 t at $4.50/t/mo · $4,410 accrued, unbilled" right={<Button size="xsmall" variant="ghost">View accrual</Button>} style={{ padding: '10px 12px' }} />
      </Card>
    </div>
  );

  const cols = [
    { key: 'id', label: 'Stack', width: '90px', render: (r) => <RefCell>{r.id}</RefCell> },
    { key: 'product', label: 'Product' },
    { key: 'grade', label: 'Grade', width: '80px' },
    { key: 'owner', label: 'Owner', width: '110px' },
    { key: 'mt', label: 'MT', align: 'right' },
    { key: 'cost', label: 'Value at cost', align: 'right', render: (r) => restricted ? <RestrictedCell /> : <DerivedCell rows={[{ label: 'Tonnes', value: r.mt }, { label: 'Weighted avg cost', value: 'K5,590/t' }, { label: 'Value', value: 'K' + (+r.mt.replace(/,/g, '') * 5590).toLocaleString(), total: true }]}>{'K' + (+r.mt.replace(/,/g, '') * 5590).toLocaleString()}</DerivedCell> },
    { key: 'count', label: 'Last count', align: 'right', tone: 'secondary' },
    { key: 'flag', label: 'Flags', render: (r) => r.flag ? <StatusMark kind={r.flagKind} size="body-4" label={r.flag} /> : <Text variant="body-4" tone="quaternary">—</Text> },
  ];

  const table = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionLabel>stacks and silos</SectionLabel>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <CapsuleGroup value={owners} onChange={setOwners} options={[{ value: 'All owners', label: 'All owners', count: 7 }, { value: 'Own', label: 'Own', count: 6 }, { value: 'Third party', label: 'Third party', count: 1 }]} />
      </div>
      <Card padding={16}><DataTable columns={cols} rows={STACKS} footer="Showing 7 of 7 stacks · folded from 41,882 movements" /></Card>
      <Text variant="body-4" tone="tertiary">{restricted ? 'Cost columns and book value are not available to Stock Control. A restricted value is a dash with an eye-off, never zero or blank.' : 'Showing cost and book value for owner.'}</Text>
    </div>
  );

  if (mobile) return <>{head}{figures}{needs}{table}</>;
  return <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>{head}<WithRail rail={needs}>{figures}{table}</WithRail></div>;
}
