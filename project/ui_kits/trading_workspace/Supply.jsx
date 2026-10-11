/** Supply in the Trading workspace (M6.DS.01): (c) the monthly schedule grid, (d) the price ladder per lot, (e) a
    shipment and its allocations with a permit panel per mill, (f) long and short by origin and corridor, (m) the
    permits list and the permit-limit exception row, and (n) the diversion completion task. Every screen takes
    `state`, one of TRADING_WORKSPACE_STATES.

    The schedule grid and the ladder are compact tables with the unit in the header (UX-26); they are the only content
    wider than a phone, and they scroll inside their own container while the page does not. No ladder cell is an input:
    every price is generated from the price rule (M6.PRC.02). A refused allocation reads "Allocation is not allowed.
    Exceeds permit [permit] headroom of [n] t by [n] t." (UX-21). Tonnes on these screens are summary figures, whole
    tonnes, and weighbridge weights carry three decimals (UX-12). Month ranges read "Sep 2026 to Nov 2026" (UX-13). */

/* ------------------------------------------------------------------ (c) Monthly schedule grid */

const TW_MONTHS = ['Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027'];
const twMonthKey = (m) => m.replace(' ', '').toLowerCase();

/** Contracts down, months across: scheduled against delivered, with behind where delivered trails the schedule of a
    month that has passed. Delivered is counted by the movement's own date in CAT; nobody types it. */
export const TW_SCHEDULE = [
  { id: 'c1s', contract: 'SYN4702', cp: 'Riverbend Milling', marker: 'wheat', line: 'Scheduled', sep2026: '1,700', oct2026: '1,700', nov2026: '1,600', total: '5,000' },
  { id: 'c1d', contract: '', line: 'Delivered', sep2026: '1,712', oct2026: '1,488', nov2026: '', total: '3,200' },
  { id: 'c1b', contract: '', line: 'Behind', sep2026: '0', oct2026: '212', nov2026: '', total: '212' },
  { id: 'c2s', contract: 'SYN4845', cp: 'Riverbend Milling', marker: 'wheat', line: 'Scheduled', oct2026: '1,000', nov2026: '2,000', dec2026: '1,000', total: '4,000' },
  { id: 'c2d', contract: '', line: 'Delivered', oct2026: '0', nov2026: '', dec2026: '', total: '0' },
  { id: 'c2b', contract: '', line: 'Behind', oct2026: '1,000', total: '1,000' },
  { id: 'c3s', contract: 'SYN4815', cp: 'Kafue Valley Milling', marker: 'soya', line: 'Scheduled', dec2026: '200', jan2027: '200', feb2027: '200', total: '600' },
  { id: 'c3d', contract: '', line: 'Delivered', total: '0' },
];
/** An import allocation scheduled by month with its planned corridor, grouped under the mill. These rows never count as
    wanted or ordered. */
export const TW_ALLOC_SCHEDULE = [
  { id: 'g1', contract: 'Riverbend Milling', group: true },
  { id: 'a1s', contract: 'KAL-07, SYN4721', line: 'Scheduled', sep2026: '1,800', oct2026: '1,800', nov2026: '1,600', total: '5,200' },
  { id: 'a1c', contract: '', line: 'Corridor', sep2026: 'Aus-Walvis', oct2026: 'Aus-Walvis', nov2026: 'Aus-Beira', total: '' },
  { id: 'a1d', contract: '', line: 'Delivered', sep2026: '1,794', oct2026: '1,120', total: '2,914' },
  { id: 'g2', contract: 'Crestline Milling', group: true },
  { id: 'a2s', contract: 'KAL-11, SYN4730', line: 'Scheduled', oct2026: '2,400', nov2026: '2,400', total: '4,800' },
  { id: 'a2c', contract: '', line: 'Corridor', oct2026: 'Aus-Walvis', nov2026: 'Aus-Walvis', total: '' },
  { id: 'a2d', contract: '', line: 'Delivered', oct2026: '980', total: '980' },
];

export function ScheduleGrid({ state = 'Contracts', onOpen }) {
  if (state === 'Loading') return <Sections><HmHead title="Delivery schedule" /><div aria-busy="true" style={{ display: 'contents' }}><CardSkeleton /><CardSkeleton /></div></Sections>;
  const allocations = state === 'Allocations';
  const editing = state === 'Not fully scheduled' || state === 'Saving';
  const rows = state === 'Empty' ? [] : allocations ? TW_ALLOC_SCHEDULE : TW_SCHEDULE;
  const monthCols = TW_MONTHS.map((m) => ({ key: twMonthKey(m), label: `${m} (t)`, width: allocations ? '120px' : '104px', align: 'right',
    render: (r) => (r.group ? '' : r.line === 'Behind' && r[twMonthKey(m)] && r[twMonthKey(m)] !== '0' ? <Text variant="body-3" strong tabular style={{ color: 'var(--warning-strong)' }}>{r[twMonthKey(m)]}</Text> : r[twMonthKey(m)]) }));
  return (
    <Sections>
      <HmHead title="Delivery schedule" count={state === 'Empty' ? 0 : allocations ? 2 : 3} meta={<HmRefreshed time={TW_AS_OF} />}
        right={<><Button variant="outline" size="small" icon="download">Export</Button><Button size="small">Edit schedule</Button></>} />
      <TwFilters view={allocations ? 'Import allocations' : 'Open contracts'}><Capsule chevron>Commodity</Capsule><Capsule chevron>Counterparty</Capsule></TwFilters>
      {editing ? (
        <Card title="Schedule, SYN4810" padding={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TwFields min={140}>
              <Field label="Jun 2027 (t)"><Input align="right" defaultValue="500" disabled={state === 'Saving'} /></Field>
              <Field label="Jul 2027 (t)"><Input align="right" defaultValue="500" disabled={state === 'Saving'} /></Field>
              <Field label="Aug 2027 (t)"><Input align="right" defaultValue="400" disabled={state === 'Saving'} /></Field>
            </TwFields>
            <HmFacts fields={[['Contract', '1,500 t'], ['Scheduled', '1,400 t'], ['Not scheduled', '100 t']]} />
            <StatusMark kind="attention" size="body-4" label="100 t of the contract is not scheduled" />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><Button variant="outline" size="small" disabled={state === 'Saving'}>Cancel</Button><Button size="small" loading={state === 'Saving'}>Save</Button></div>
          </div>
        </Card>
      ) : null}
      {rows.length ? (
        <Card padding={4}>
          <div data-scroll-grid="">
            <HmTable rows={rows} columns={[
              { key: 'contract', label: allocations ? 'Allocation' : 'Contract', width: '170px', wrap: true, render: (r) => (r.group ? <Text variant="body-3" strong>{r.contract}</Text> : r.contract && !allocations ? <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}><HmLink onOpen={() => onOpen && onOpen(r.contract)}>{r.contract}</HmLink><CommodityMarker commodity={r.marker}>{r.cp}</CommodityMarker></span> : r.contract) },
              { key: 'line', label: 'Line', width: '96px' },
              ...monthCols,
              { key: 'total', label: 'Total (t)', width: '96px', align: 'right', render: (r) => (r.group ? '' : <Text variant="body-3" strong tabular>{r.total}</Text>) },
            ]} />
          </div>
        </Card>
      ) : <Card><EmptyState title="No schedules to display." /></Card>}
    </Sections>
  );
}

/* ------------------------------------------------------------------ (d) Price ladder per lot */

/** The price ladder of lot SYN4666-L2 (M6.PRC.02): month and price, generated from the price rule, shown as the
    labelled field Source: Price rule. No cell is an input. Version 2 keeps version 1 beside it; loads delivered before
    its effective date keep version 1. A load with no lot has no ladder price and reads Lot not assigned. */
export function PriceLadder({ state = 'Ladder', onOpen }) {
  if (state === 'Loading') return <TwLoading title="SYN4666-L2" />;
  const tier = state !== 'Without the contract tier';
  const v2 = state === 'Version 2';
  const price = (v) => (tier ? v : <Restricted />);
  return (
    <Sections>
      <HmHead title="SYN4666-L2" />
      <RecordHighlights kind="Lot" title="SYN4666-L2" status={<TwStatus status="active" />} tabs={[]}
        fields={[{ label: 'Contract', value: 'SYN4666', link: tier ? '#' : undefined }, { label: 'Commodity', value: <CommodityMarker commodity="wheat">Wheat</CommodityMarker> },
          { label: 'Quantity', value: '8,000 t' }, { label: 'On this lot', value: '2,410 t' },
          { label: 'Base price', value: tier ? (v2 ? 'USD 555.00 per t' : 'USD 560.00 per t') : <Restricted /> }, { label: 'Base month', value: 'May 2026' },
          { label: 'Months', value: 'May 2026 to Dec 2026' }, { label: 'Source', value: `Price rule, ${TW_PRICE_RULE}` }]} />
      {state === 'Lot not assigned' ? (
        <HmCard title="Loads without a lot" count={2} objects="loads">
          <HmTable rows={[
            { id: 'n1', truck: 'BAP 9229', grn: 'GRN10000398', date: '22 Sep 2026', weight: '29.880', grade: 'B1' },
            { id: 'n2', truck: 'ACE 4473', grn: 'GRN10000399', date: '23 Sep 2026', weight: '30.120', grade: 'B2' },
          ]} columns={[
            { key: 'truck', label: 'Truck', width: '100px' }, { key: 'grn', label: 'Goods received note', width: 'minmax(150px, 1fr)', render: (r) => <HmLink>{r.grn}</HmLink> },
            { key: 'date', label: 'Delivered', width: '120px', tabular: true }, { key: 'weight', label: 'Weight (t)', width: '100px', align: 'right' }, { key: 'grade', label: 'Grade', width: '70px' },
            { key: 'price', label: 'Price (USD per t)', width: '170px', align: 'right', render: () => <StatusMark kind="attention" label="Lot not assigned" size="body-4" /> },
          ]} />
        </HmCard>
      ) : null}
      <HmCard title="Ladder" count={TW_LADDER.length} objects="months">
        <div data-scroll-grid="">
          <HmTable rows={TW_LADDER} columns={[
            { key: 'month', label: 'Month', width: 'minmax(120px, 1fr)', tabular: true },
            { key: 'v1', label: v2 ? 'Version 1 (USD per t)' : 'Price (USD per t)', width: '170px', align: 'right', render: (r) => price(r.v1) },
            ...(v2 ? [{ key: 'v2', label: 'Version 2 (USD per t)', width: '170px', align: 'right', render: (r) => (r.v2 ? price(r.v2) : '') }] : []),
            { key: 'source', label: 'Source', width: '220px', render: () => 'Price rule' },
          ]} />
        </div>
      </HmCard>
      {v2 ? (
        <Card title="Versions" padding={16}>
          <HmFacts fields={[['Version 1', 'Base USD 560.00 per t, from 01 May 2026'], ['Version 2', 'Base USD 555.00 per t, from 01 Aug 2026'], ['Approved by', 'T. Mwila'], ['Loads on version 1', 'Delivered to 31 Jul 2026']]} />
        </Card>
      ) : null}
    </Sections>
  );
}

/* ------------------------------------------------------------------ (e) Shipment and allocations */

export const TW_ALLOCATIONS = [
  { id: 'AL-0141', mill: 'Riverbend Milling', contract: 'SYN4721', obl: 'KAL-07', corridor: 'Aus-Walvis', lot: 'L3', start: 'Jun 2026', tonnes: '5,200' },
  { id: 'AL-0142', mill: 'Riverbend Milling', contract: 'SYN4721', obl: 'KAL-09', corridor: 'Aus-Beira', lot: 'L3', start: 'Jul 2026', tonnes: '4,750' },
  { id: 'AL-0143', mill: 'Crestline Milling', contract: 'SYN4730', obl: 'KAL-11', corridor: 'Aus-Walvis', lot: 'L1', start: 'Jun 2026', tonnes: '4,800' },
  { id: 'AL-0144', mill: 'Kafue Valley Milling', contract: 'SYN4734', obl: 'KAL-12', corridor: 'Aus-Beira', lot: 'L2', start: 'Aug 2026', tonnes: '12,650' },
  { id: 'AL-0145', mill: 'Copperhill Mills', contract: 'SYN4738', obl: 'KAL-14', corridor: 'Aus-Walvis', lot: 'L2', start: 'Sep 2026', tonnes: '14,000' },
];
const TW_ALLOC_FULL = { id: 'AL-0146', mill: 'Crestline Milling', contract: 'SYN4730', obl: 'KAL-15', corridor: 'Aus-Walvis', lot: 'L1', start: 'Oct 2026', tonnes: '1,100' };
/** Each mill's import permit (DP-PERMIT): allowed, booked from its allocations, and wanted from its monthly orders. */
export const TW_PERMITS = [
  { id: 'SI-2026-014', mill: 'Riverbend Milling', holder: 'Riverbend Milling', commodity: 'Wheat', marker: 'wheat', period: 'May 2026 to Apr 2027', wanted: '10,400', allowed: '10,000', booked: '9,950' },
  { id: 'SI-2026-021', mill: 'Crestline Milling', holder: 'Own', commodity: 'Wheat', marker: 'wheat', period: 'May 2026 to Apr 2027', wanted: '5,900', allowed: '6,000', booked: '4,800' },
  { id: 'SI-2026-030', mill: 'Kafue Valley Milling', holder: 'Kafue Valley Milling', commodity: 'Wheat', marker: 'wheat', period: 'May 2026 to Apr 2027', wanted: '13,000', allowed: '13,000', booked: '12,650' },
  { id: 'SI-2026-033', mill: 'Copperhill Mills', holder: 'Own', commodity: 'Wheat', marker: 'wheat', period: 'Jun 2026 to May 2027', wanted: '14,000', allowed: '15,000', booked: '14,000' },
];

export function ShipmentAllocations({ state = 'Allocations', onOpen }) {
  const full = state === 'Fully allocated';
  const ops = state === 'Operations, read only';
  const form = state === 'Allocate' || state === 'Allocating' || state === 'Refused allocation' || full;
  const rows = full ? [...TW_ALLOCATIONS, TW_ALLOC_FULL] : TW_ALLOCATIONS;
  const allocated = full ? '42,500' : '41,400';
  const typed = state === 'Refused allocation' || full ? '100' : '50';
  const riverbend = TW_PERMITS[0];
  const permits = TW_PERMITS.map((p) => (full && p.id === 'SI-2026-021' ? { ...p, booked: '5,900' } : p));
  return (
    <Sections>
      <HmHead title="MV Kalahari" />
      <RecordHighlights kind="Shipment" title="MV Kalahari" status={<TwStatus status="active" />} tabs={[]}
        actions={ops || form ? null : <Button size="small">Allocate</Button>}
        fields={[{ label: 'Commodity', value: <CommodityMarker commodity="wheat">Wheat (Australia)</CommodityMarker> }, { label: 'Quantity', value: '42,500 t' },
          { label: 'Allocated', value: `${allocated} t` }, { label: 'Unallocated', value: full ? '0 t' : '1,100 t' },
          { label: 'Import purchase', value: 'SYN4700', link: '#' }, { label: 'Origin', value: 'Australia' }]} />
      {form ? (
        <Card title="Allocate from MV Kalahari" padding={16}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TwFields min={180}>
                <Field label="Mill" required><Select defaultValue="Riverbend Milling" disabled={state === 'Allocating'} options={['Riverbend Milling', 'Crestline Milling', 'Kafue Valley Milling', 'Copperhill Mills']} /></Field>
                <Field label="Sale contract" required><Select defaultValue="SYN4721" disabled={state === 'Allocating'} options={['SYN4721']} /></Field>
                <Field label="OBL" required><Input defaultValue="KAL-16" disabled={state === 'Allocating'} /></Field>
                <Field label="Corridor" required><Select defaultValue="Aus-Walvis" disabled={state === 'Allocating'} options={['Aus-Walvis', 'Aus-Beira', 'Baltic-Beira', 'Baltic-Walvis', 'RSA-Road']} /></Field>
                <Field label="Lot" required><Select defaultValue="L3" disabled={state === 'Allocating'} options={['L1', 'L2', 'L3']} /></Field>
                <Field label="Delivery start" required><Select defaultValue="Nov 2026" disabled={state === 'Allocating'} options={['Oct 2026', 'Nov 2026', 'Dec 2026']} /></Field>
                <Field label="Allocate (t)" required><Input align="right" defaultValue={typed} invalid={state === 'Refused allocation' || full} disabled={state === 'Allocating'} /></Field>
              </TwFields>
              {full ? <Refusal action="Allocation" reason="MV Kalahari is fully allocated, 42,500 t of 42,500 t. This allocation would exceed it by 100 t" /> : null}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button variant="outline" size="small" disabled={state === 'Allocating'}>Cancel</Button>
                <Button size="small" loading={state === 'Allocating'} disabled={state === 'Refused allocation' || full}>Allocate</Button>
              </div>
            </div>
            <PermitHeadroom permit={riverbend.id} mill={riverbend.mill} holder={riverbend.holder} period={riverbend.period} wanted={riverbend.wanted} allowed={riverbend.allowed} booked={riverbend.booked} adding={full ? undefined : typed} onOpen={() => onOpen && onOpen(riverbend.id)} />
          </div>
        </Card>
      ) : null}
      <HmCard title="Allocations" count={rows.length} objects="allocations">
        <HmTable rows={[...rows, { id: 'total', total: true, mill: 'Total', tonnes: allocated }]} columns={[
          { key: 'id', label: 'Allocation', width: '110px', render: (r) => (r.total ? <Text variant="body-3" strong>Total</Text> : <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink>) },
          { key: 'mill', label: 'Mill', width: 'minmax(150px, 1fr)', wrap: true, render: (r) => (r.total ? '' : r.mill) },
          { key: 'contract', label: 'Contract', width: '100px', render: (r) => (r.total ? '' : <HmLink onOpen={() => onOpen && onOpen(r.contract)}>{r.contract}</HmLink>) },
          { key: 'obl', label: 'OBL', width: '90px' }, { key: 'corridor', label: 'Corridor', width: '110px' }, { key: 'lot', label: 'Lot', width: '60px' },
          { key: 'start', label: 'Delivery start', width: '120px', tabular: true },
          { key: 'tonnes', label: 'Allocated (t)', width: '116px', align: 'right', render: (r) => twStrong(r, r.tonnes) },
        ]} />
      </HmCard>
      <SectionLabel>Permits by mill</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
        {permits.map((p) => <PermitHeadroom key={p.id} permit={p.id} mill={p.mill} holder={p.holder} period={p.period} wanted={p.wanted} allowed={p.allowed} booked={p.booked} onOpen={() => onOpen && onOpen(p.id)} />)}
      </div>
    </Sections>
  );
}

/* ------------------------------------------------------------------ (f) Long and short by origin and corridor */

export const TW_ORIGINS = [
  { id: 'o1', origin: 'Australia', ordered: '60,000', booked: '61,200', gap: 'Long 1,200' },
  { id: 'o2', origin: 'Baltic', ordered: '45,080', booked: '44,486', gap: 'Short 594' },
  { id: 'o3', origin: 'South Africa', ordered: '26,000', booked: '26,000', gap: 'Flat' },
  { id: 'total', total: true, origin: 'Total', ordered: '131,080', booked: '131,686', gap: 'Long 606' },
];
export const TW_CORRIDORS = [
  { id: 'r1', origin: 'Australia', corridor: 'Aus-Walvis', planned: '32,000', allocated: '30,500', gap: 'Short 1,500' },
  { id: 'r2', origin: '', corridor: 'Aus-Beira', planned: '28,000', allocated: '29,500', gap: 'Long 1,500' },
  { id: 'r3', origin: '', corridor: 'Booked, not yet allocated', planned: '', allocated: '', gap: 'Long 1,200' },
  { id: 'r4', origin: 'Baltic', corridor: 'Baltic-Beira', planned: '25,080', allocated: '24,486', gap: 'Short 594' },
  { id: 'r5', origin: '', corridor: 'Baltic-Walvis', planned: '18,000', allocated: '18,000', gap: 'Flat' },
  { id: 'r6', origin: '', corridor: 'Corridor not planned', planned: '2,000', allocated: '2,000', gap: 'Flat' },
  { id: 'r7', origin: 'South Africa', corridor: 'RSA-Road', planned: '26,000', allocated: '26,000', gap: 'Flat' },
];

/** Long and short by origin and corridor (M6.COV.02, S47 JQ3): ordered by the mills against booked, then planned
    against allocated by corridor. Every figure opens what it is made of; none can be changed. Tonnes only. */
export function LongShort({ state = 'By origin', onOpen }) {
  const [calc, setCalc] = useState(state === 'Calculation details');
  useEffect(() => setCalc(state === 'Calculation details'), [state]);
  if (state === 'Loading') return <Sections><HmHead title="Long and short" /><div aria-busy="true" style={{ display: 'contents' }}><CardSkeleton /><CardSkeleton /></div></Sections>;
  const corridor = state === 'By corridor';
  const gapCell = (r) => (r.total ? <Text variant="body-3" strong tabular>{r.gap}</Text> : r.gap === 'Flat' ? r.gap : <HmLink onOpen={() => setCalc(true)}>{r.gap}</HmLink>);
  return (
    <Sections>
      <HmHead title="Long and short" meta={<HmRefreshed time={TW_AS_OF} />} right={<Button variant="outline" size="small" icon="download">Export</Button>} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <ScrollRow>
          <Capsule chevron selected>{state === 'Import wheat' ? 'Import wheat' : 'All imports'}</Capsule>
          <Capsule selected={!corridor}>By origin</Capsule><Capsule selected={corridor}>By corridor</Capsule><Capsule chevron>Season: 2026</Capsule>
        </ScrollRow>
      </div>
      {corridor ? (
        <HmCard title="By corridor" count={TW_CORRIDORS.length} objects="routes">
          <HmTable rows={TW_CORRIDORS} columns={[
            { key: 'origin', label: 'Origin', width: '130px', render: (r) => (r.origin ? <Text variant="body-3" strong>{r.origin}</Text> : '') },
            { key: 'corridor', label: 'Corridor', width: 'minmax(170px, 1fr)', wrap: true },
            { key: 'planned', label: 'Planned (t)', width: '120px', align: 'right' },
            { key: 'allocated', label: 'Allocated (t)', width: '120px', align: 'right' },
            { key: 'gap', label: 'Long or short (t)', width: '150px', align: 'right', render: gapCell },
          ]} />
        </HmCard>
      ) : (
        <HmCard title="By origin" count={3} objects="origins">
          <HmTable rows={TW_ORIGINS} columns={[
            { key: 'origin', label: 'Origin', width: 'minmax(150px, 1fr)', render: (r) => twStrong(r, r.origin) },
            { key: 'commodity', label: 'Commodity', width: '120px', render: (r) => (r.total ? '' : <CommodityMarker commodity="wheat">Wheat</CommodityMarker>) },
            { key: 'ordered', label: 'Ordered by mills (t)', width: '160px', align: 'right', render: (r) => twStrong(r, r.ordered) },
            { key: 'booked', label: 'Booked (t)', width: '120px', align: 'right', render: (r) => twStrong(r, r.booked) },
            { key: 'gap', label: 'Long or short (t)', width: '150px', align: 'right', render: gapCell },
          ]} />
        </HmCard>
      )}
      <CalculationDetails open={calc} onClose={() => setCalc(false)} name="Short, Baltic" value="594 t"
        components={[{ label: 'Ordered: Riverbend Milling', value: '20,000 t' }, { label: 'Ordered: Kafue Valley Milling', value: '15,080 t' }, { label: 'Ordered: Copperhill Mills', value: '10,000 t' },
          { label: 'Booked: MV Baltic Star', value: '-24,486 t' }, { label: 'Booked: MV Nordic Grace', value: '-20,000 t' }]}
        total={{ label: 'Short (t)', value: '594' }} basis={[{ label: 'Orders', value: 'Monthly orders on import sale contracts' }, { label: 'Last refreshed', value: TW_AS_OF }]} />
    </Sections>
  );
}

/* ------------------------------------------------------------------ (m) Permits list and the permit-limit exception */

/** The permit-limit exception (M6.COV.01 AC 9): one open per mill, in business words, owned by Finance. */
export const TW_PERMIT_EXCEPTION = {
  id: 'EXC-000214', type: 'Position', title: 'Permit limit', record: 'SI-2026-014', recordLink: true,
  business: 'Riverbend Milling at permit limit: cannot allocate more', businessRecord: 'SI-2026-014, Riverbend Milling', businessRecordLink: true,
  owner: 'N. Phiri', age: 'Today', status: 'open',
};

export function PermitsList({ state = 'All', onOpen }) {
  const ops = state === 'Operations, read only';
  const atLimit = state === 'At limit' || state === 'Permit limit exception';
  const rows = state === 'No match' ? [] : atLimit ? [{ ...TW_PERMITS[0], booked: '10,000' }] : TW_PERMITS;
  return (
    <Sections>
      <HmHead title="Permits" count={rows.length} right={ops ? <Button variant="outline" size="small" icon="download">Export</Button> : <><Button variant="outline" size="small" icon="download">Export</Button><Button size="small">New</Button></>} />
      <TwFilters view={atLimit ? 'At limit' : 'All permits'}><Capsule chevron>Mill</Capsule><Capsule chevron>Holder</Capsule><Capsule chevron>Commodity</Capsule></TwFilters>
      {state === 'Permit limit exception' ? (
        <HmCard title="Exceptions" count={1} objects="exceptions">
          <ExceptionList rows={[TW_PERMIT_EXCEPTION]} variant="owner" onOpen={onOpen} onOpenRecord={onOpen} />
        </HmCard>
      ) : null}
      {rows.length ? (
        <Card padding={4}>
          <HmTable rows={rows} columns={[
            { key: 'id', label: 'Permit', width: '120px', render: (r) => <HmLink onOpen={() => onOpen && onOpen(r.id)}>{r.id}</HmLink> },
            { key: 'mill', label: 'Mill', width: 'minmax(140px, 1fr)', wrap: true },
            { key: 'holder', label: 'Holder', width: '130px', wrap: true },
            { key: 'commodity', label: 'Commodity', width: '110px', render: (r) => <CommodityMarker commodity={r.marker}>{r.commodity}</CommodityMarker> },
            { key: 'period', label: 'Period', width: '170px', tabular: true },
            { key: 'allowed', label: 'Allowed (t)', width: '100px', align: 'right' },
            { key: 'booked', label: 'Booked (t)', width: '100px', align: 'right' },
            { key: 'headroom', label: 'Headroom (t)', width: '110px', align: 'right', render: (r) => permitHeadroom(r).headroom.toLocaleString('en-US') },
            { key: 'status', label: 'Status', width: '110px', render: (r) => (permitHeadroom(r).headroom === 0 ? <StatusMark kind="attention" label="At limit" size="body-4" /> : <TwStatus status="active" />) },
          ]} />
        </Card>
      ) : <Card><EmptyState title="No permits to display." /></Card>}
    </Sections>
  );
}

/* ------------------------------------------------------------------ (n) Diversion completion task */

const TW_DIVERSION_STEPS = (status, comment = '') => [
  { id: 's1', step: 'Submitted', who: 'J. Tembo', status: 'submitted', date: '26 Sep 2026, 11:30', comment: '' },
  { id: 's2', step: 'Managing Director approval', who: 'T. Mwila', status, date: status === 'pending' ? '' : '26 Sep 2026, 12:05', comment },
];

/** Complete a diversion (M6.GRN.04): the new buyer, both prices, the route's transport rate filling itself, the margin,
    and the approval state. The diversion is a new trade, SYN4855, with sale SYN4855 and purchase leg SYN4855-A; until
    it is approved the load stays Awaiting diversion and nothing closes. Only Trading completes it; the Clerk reads the
    task with no price and no action. */
export function DiversionTask({ state = 'Task', onOpen }) {
  const clerk = state === 'Clerk view';
  const submitted = state === 'Pending approval' || state === 'Completed' || state === 'Rejected';
  const completed = state === 'Completed';
  const rejected = state === 'Rejected';
  const loadStatus = completed ? { kind: 'clean', label: 'Diverted' } : { kind: 'pending', label: 'Awaiting diversion' };
  const approval = completed ? 'approved' : rejected ? 'rejected' : 'pending';
  const fields = [
    { label: 'Load', value: '26.040 t' }, { label: 'Supplier', value: 'Cameron Estates' }, { label: 'From leg', value: 'SYN4702-A', link: clerk ? undefined : '#' },
    { label: 'Held at', value: 'Mpongwe Depot, drying bay D1' },
    ...(completed ? [{ label: 'New trade', value: 'SYN4855', link: '#' }] : [{ label: 'Waiting for', value: submitted && !rejected ? 'T. Mwila' : 'J. Tembo' }]),
  ];
  return (
    <Sections>
      <HmHead title="BAD 1187" />
      {rejected ? <ConditionBanner>Diversion to Kafue Stockfeeds Ltd was rejected: transport to Kafue is above this season's rate. The load stays awaiting diversion.</ConditionBanner> : null}
      <RecordHighlights kind="Diversion" title="BAD 1187" status={<StatusMark kind={loadStatus.kind} label={loadStatus.label} size="body-4" />} tabs={[]} fields={fields}
        actions={clerk || (submitted && !rejected) ? null : <Button size="small" loading={state === 'Submitting'}>Submit for approval</Button>} />
      <Card title="New buyer" padding={16}>
        {clerk ? (
          <HmFacts fields={[['Buyer', 'Kafue Stockfeeds Ltd'], ['Basis', 'Delivered'], ['Quantity', '26.040 t']]} />
        ) : submitted ? (
          <HmFacts fields={[['Buyer', 'Kafue Stockfeeds Ltd'], ['Basis', 'Delivered'], ['Sale price', 'ZMW 5,900.00 per t'], ['Purchase price, Cameron Estates', 'ZMW 5,200.00 per t'],
            ['Transport', 'ZMW 250.00 per t'], ['Margin per t', <MarginCell value="450.00" currency="ZMW" />], ['Margin', <MarginCell value="11,718.00" currency="ZMW" />], ['Quantity', '26.040 t']]} />
        ) : (
          <TwFields>
            <Field label="Buyer" required><Select defaultValue="Kafue Stockfeeds Ltd" disabled={state === 'Submitting'} options={['Kafue Stockfeeds Ltd', 'Riverbend Milling']} /></Field>
            <Field label="Basis" required><Select defaultValue="Delivered" disabled={state === 'Submitting'} options={['Delivered', 'Collected']} /></Field>
            <Field label="Sale price (ZMW per t)" required><Input align="right" defaultValue="5,900.00" disabled={state === 'Submitting'} /></Field>
            <Field label="Purchase price, Cameron Estates (ZMW per t)" required><Input align="right" defaultValue="5,200.00" disabled={state === 'Submitting'} /></Field>
            <Field label="Transport (ZMW per t)"><span style={{ ...textStyle('body-3', { tabular: true }), minHeight: 32, display: 'inline-flex', alignItems: 'center' }}>250.00, Mpongwe to Kafue Stockfeeds Ltd</span></Field>
            <Field label="Margin"><span style={{ minHeight: 32, display: 'inline-flex', alignItems: 'center', gap: 12 }}><MarginCell value="450.00" currency="ZMW" unit="per t" /><MarginCell value="11,718.00" currency="ZMW" /></span></Field>
          </TwFields>
        )}
      </Card>
      {clerk ? null : (
        <Card title="What completing it does" padding={16}>
          <HmFacts fields={[['New trade', 'SYN4855'], ['Sale', 'SYN4855, Kafue Stockfeeds Ltd, 26.040 t'], ['Purchase leg', 'SYN4855-A, Cameron Estates, 26.040 t'],
            ['Closes', completed ? 'SYN4702-A at 1,662 t of 1,700 t; 38 t closed with balance' : 'SYN4702-A at 1,662 t of 1,700 t, once approved']]} />
        </Card>
      )}
      {submitted && !clerk ? (
        <HmCard title="Approval history" count={2} objects="steps">
          <HmTable rows={TW_DIVERSION_STEPS(approval, rejected ? 'Transport to Kafue is above this season’s rate.' : '')} columns={[
            { key: 'step', label: 'Step', width: 'minmax(170px, 1fr)', wrap: true }, { key: 'who', label: 'Assigned to', width: '120px' },
            { key: 'status', label: 'Status', width: '160px', render: (r) => <TwStatus status={r.status} /> },
            { key: 'date', label: 'Date (CAT)', width: '150px', tabular: true }, { key: 'comment', label: 'Comment', width: 'minmax(180px, 1fr)', wrap: true },
          ]} />
        </HmCard>
      ) : null}
    </Sections>
  );
}
