/** Imports in the UAG One Link app (M7.DS.01, UAG-99), drawn at 390: the operations lead's import schedule and a truck
    leg with its checkpoints, Record offload when the mill calls (S16 AL4, canvas S17 "Record offload on the app"),
    Finance's pipeline with Payables ageing and Receivables ageing, and stock control's stock position. Every screen
    takes `state`, one of its IMPORTS_APP_STATES entry, for ?screen=&state=, and draws the whole phone.

    The legs, checkpoints and the loss allowance are the web kit's (../imports/Schedule.jsx, IM_*), so the phone and
    the web agree. Record offload is a capture screen (UX-31): the connection status and Pending sync (count), the back
    chevron, no bottom bar and the full-width 48 px button at the bottom, busy until the offload has synced however long
    the phone is offline. The difference is computed, never typed. The schedule and stock control's screens carry no
    money; Finance holds the price tiers, so its pipeline shows USD. Fictional sample data only. */

export const IMPORTS_APP_STATES = {
  ImportScheduleApp: ['Schedule', 'Leg KAL-11', 'Offline', 'No legs'],
  RecordOffloadApp: ['Weight entered', 'Missing weight', 'Beyond allowance', 'Recording', 'Queued', 'Recorded'],
  PipelineApp: ['Pipeline', 'No rate today', 'Loading'],
  StockApp: ['Position', 'On the road', 'Loading'],
};

/** Each person's areas in the bottom bar (UX-31): the operations lead, Finance and stock control. */
export const IM_APP_AREAS = {
  ops: [{ value: 'home', label: 'Home', icon: 'house' }, { value: 'schedule', label: 'Schedule', icon: 'truck' }, { value: 'sync', label: 'Pending sync', icon: 'refresh-cw' }],
  fin: [{ value: 'home', label: 'Home', icon: 'house' }, { value: 'pipeline', label: 'Pipeline', icon: 'landmark' }],
  stock: [{ value: 'home', label: 'Home', icon: 'house' }, { value: 'road', label: 'On the road', icon: 'truck' }],
};
const IM_APP_PHONE = 844;

/** The signed-in phone: the person's areas in the bottom bar on a list, the back chevron and no bar on a task (UX-31). */
function ImAppPhone({ title, who = 'ops', area, task = false, initials = 'MC', children }) {
  return (
    <MobileShell title={title} initials={initials} height={IM_APP_PHONE} modules={IM_APP_AREAS[who]} module={area}
      showBottomBar={!task} onBack={task ? () => {} : undefined}>
      {children}
    </MobileShell>
  );
}

/** A phone row: the record as a link, a line under it, and what sits at the right. */
function ImAppRow({ title, sub, right, first }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', boxShadow: first ? 'none' : 'inset 0 1px 0 var(--border-light)' }}>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {title}
        <Text variant="body-4" tone="secondary" tabular style={{ overflowWrap: 'anywhere' }}>{sub}</Text>
      </span>
      {right ? <span style={{ flex: 'none', maxWidth: '50%', display: 'flex', justifyContent: 'flex-end' }}>{right}</span> : null}
    </div>
  );
}

/** A phone card with its title and count; empty keeps the title and reads "No [objects] to display." */
function ImAppCard({ title, count, objects, children }) {
  return (
    <Card gap={8} padding={16} title={<>{title}{count != null ? <span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 8 }}><Count>{count}</Count></span> : null}</>}>
      {count === 0 ? <EmptyState title={`No ${objects} to display.`} style={{ padding: '8px 0' }} /> : <div style={{ margin: '0 -16px', display: 'flex', flexDirection: 'column' }}>{children}</div>}
    </Card>
  );
}

/* ------------------------------------------------------------------ The import schedule on the phone (S16 AL3) */

export function ImportScheduleApp({ state = 'Schedule' }) {
  const offline = state === 'Offline';
  if (state === 'Leg KAL-11') {
    const leg = IM_LEGS.find((l) => l.id === 'KAL-11');
    return (
      <ImAppPhone title={leg.id} task>
        <CaptureStatus online pending={0} />
        <ConditionBanner>Arrived at Kazungula border 24 Sep 2026, 11:20. Not departed.</ConditionBanner>
        <Card padding={16} gap={8}>
          <SummaryList items={[{ label: 'Mill', value: 'Riverbend Milling, Lusaka' }, { label: 'Truck', value: leg.truck }, { label: 'Transporter', value: leg.transporter }, { label: 'Loaded', value: `${leg.loaded} t` }]} />
        </Card>
        <Card title="Checkpoints" padding={16} gap={0}><CheckpointTimeline variant="list" checkpoints={IM_CHECKPOINTS['KAL-11']} /></Card>
        <div style={{ marginTop: 'auto', paddingTop: 16 }}><PressButton kind="large" variant="primary" fullWidth>Record offload</PressButton></div>
      </ImAppPhone>
    );
  }
  const legs = state === 'No legs' ? [] : IM_LEGS;
  return (
    <ImAppPhone title="Import schedule" area="schedule">
      <CaptureStatus online={!offline} pending={offline ? 1 : 0} />
      {legs.length ? IM_MILLS.map((m) => {
        const ls = legs.filter((l) => l.mill === m.id);
        const b = imBlocking(ls);
        return (
          <ImAppCard key={m.id} title={m.mill} count={ls.length} objects="legs">
            <div style={{ padding: '0 16px 8px' }}><SummaryList items={[{ label: 'Vessel', value: m.vessel }, { label: 'Allocation', value: `${m.allocation} t` }, { label: 'Cannot invoice yet', value: b.words }]} /></div>
            {ls.map((l) => (
              <ImAppRow key={l.id} first={false} title={<HmLink>{l.id}</HmLink>} sub={`${l.truck}, loaded ${l.loaded} t${l.offloaded ? `, offloaded ${l.offloaded} t` : ''}`} right={<ImCheckpointCell leg={l} />} />
            ))}
          </ImAppCard>
        );
      }) : <Card><EmptyState title="No legs to display." /></Card>}
    </ImAppPhone>
  );
}

/* ------------------------------------------------------------------ Record offload on the app (AB-ALKA-MOB, S16 AL4) */

export function RecordOffloadApp({ state = 'Weight entered' }) {
  const leg = IM_LEGS.find((l) => l.id === 'KAL-11');
  const missing = state === 'Missing weight';
  const weight = missing ? '' : state === 'Beyond allowance' ? '33.760' : '33.890';
  const queued = state === 'Queued';
  const sending = state === 'Recording' || queued;
  const recorded = state === 'Recorded';
  const after = { ...leg, offloaded: weight };
  const diff = imDifferenceWords(after);
  const outcome = imOutcome(after);
  return (
    <ImAppPhone title="Record offload" task>
      <CaptureStatus online={!queued} pending={sending ? 1 : 0} />
      <Card padding={16} gap={8}>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Text variant="body-4" tone="secondary">Truck leg</Text>
          <Text variant="heading-3" strong tabular>{leg.id}</Text>
        </span>
        <SummaryList items={[{ label: 'Mill', value: 'Riverbend Milling, Lusaka' }, { label: 'Loaded', value: `${leg.loaded} t` }]} />
      </Card>
      {recorded ? <Banner tone="success">Offload recorded.</Banner> : null}
      <Card padding={16} gap={16}>
        <Field label="Offloaded weight (t)" required error={missing ? 'Offloaded weight must be a weight in tonnes.' : null}>
          <Input size="large" inputMode="decimal" align="right" defaultValue={weight} invalid={missing} disabled={sending || recorded} />
        </Field>
        <Field label="Source" required><Select options={IM_OFFLOAD_SOURCES} defaultValue={CHECKPOINT_SOURCES['mill-call'].word} disabled={sending || recorded} /></Field>
      </Card>
      <Card padding={16} gap={8}>
        <SummaryList items={[{ label: 'Difference', value: diff, strong: true }, { label: 'Loss allowance', value: IM_LOSS_ALLOWANCE.words }]} />
        <ImOutcomeMark outcome={outcome} />
      </Card>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        {recorded ? <PressButton kind="large" variant="primary" fullWidth>Done</PressButton>
          : <PressButton kind="large" variant="primary" fullWidth loading={sending} disabled={missing}>Record offload</PressButton>}
      </div>
    </ImAppPhone>
  );
}

/* ------------------------------------------------------------------ Finance's pipeline (S60, SJ journeys) */

/** What Finance watches on the phone: tonnes still to invoice, and how old the money owed both ways is (S57 glossary:
    Payables ageing, Receivables ageing). Finance holds the price tiers, so the amounts show in USD. */
export const IM_APP_TO_INVOICE = [
  { id: 'i1', contract: 'SYN4845', mill: 'Riverbend Milling', tonnes: '102' },
  { id: 'i2', contract: 'SYN4852', mill: 'Crest Milling', tonnes: '68' },
];
export const IM_AGEING = {
  receivables: [{ id: 'r0', bucket: '0 to 30 days', value: '412,300' }, { id: 'r1', bucket: '31 to 60 days', value: '96,480' }, { id: 'r2', bucket: '61 to 90 days', value: '18,200' }, { id: 'r3', bucket: 'Over 90 days', value: '0' }],
  payables: [{ id: 'p0', bucket: '0 to 30 days', value: '188,900' }, { id: 'p1', bucket: '31 to 60 days', value: '42,600' }, { id: 'p2', bucket: '61 to 90 days', value: '0' }, { id: 'p3', bucket: 'Over 90 days', value: '0' }],
};
const imUsd = (rows) => rows.reduce((n, r) => n + (Number(r.value.replace(/,/g, '')) || 0), 0).toLocaleString('en-GB');

function ImAgeingCard({ title, rows }) {
  return (
    <ImAppCard title={title}>
      {rows.map((r, i) => <ImAppRow key={r.id} first={!i} title={<Text variant="body-3">{r.bucket}</Text>} sub="" right={<Text variant="body-3" tabular>USD {r.value}</Text>} />)}
      <ImAppRow title={<Text variant="body-3" strong>Total</Text>} sub="" right={<Text variant="body-3" strong tabular>USD {imUsd(rows)}</Text>} />
    </ImAppCard>
  );
}

export function PipelineApp({ state = 'Pipeline' }) {
  if (state === 'Loading') {
    return <ImAppPhone title="Pipeline" who="fin" area="pipeline" initials="NP"><div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><CardSkeleton /><CardSkeleton /></div></ImAppPhone>;
  }
  return (
    <ImAppPhone title="Pipeline" who="fin" area="pipeline" initials="NP">
      <HmRefreshed time="30 Sep 2026, 06:02 CAT" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
        {kpiTiles([
          <KpiTile key="inv" label="Still to invoice (t)" value="170" caption="2 contracts" size="heading-2-condensed" />,
          <KpiTile key="rate" label="Today's USD rate" value="ZMW 25.00" notSet={state === 'No rate today'} caption={state === 'No rate today' ? 'Exchange rate source' : '30 Sep 2026'} size="heading-2-condensed" />,
        ])}
      </div>
      <ImAppCard title="Still to invoice" count={IM_APP_TO_INVOICE.length} objects="contracts">
        {IM_APP_TO_INVOICE.map((r, i) => <ImAppRow key={r.id} first={!i} title={<HmLink>{r.contract}</HmLink>} sub={r.mill} right={<Text variant="body-3" tabular>{r.tonnes} t</Text>} />)}
      </ImAppCard>
      <ImAgeingCard title="Receivables ageing" rows={IM_AGEING.receivables} />
      <ImAgeingCard title="Payables ageing" rows={IM_AGEING.payables} />
    </ImAppPhone>
  );
}

/* ------------------------------------------------------------------ Stock control's stock at 390 (S14 R2, R3) */

export const IM_APP_STOCK = [
  { id: 's1', product: 'Urea', pack: '50 kg bag', physical: '820', road: '200', free: '520' },
  { id: 's2', product: 'Urea', pack: '20 kg bag', physical: '40', road: '10', free: '30' },
  { id: 's3', product: 'Urea', pack: '10 kg bag', physical: '12', road: '0', free: '12' },
  { id: 's4', product: 'Foliar Feed', pack: '10 L container', physical: '46', road: '0', free: '39' },
  { id: 's5', product: 'Foliar Feed', pack: '5 L container', physical: '6', road: '0', free: '6' },
];
export const IM_APP_ROAD = [
  { id: 'LEG-5088', route: 'Physical', load: 'Urea 20 kg bag, 10.000 t', dispatched: '17 Sep 2026', age: '9 days', past: true },
  { id: 'LEG-5101', route: 'Physical', load: 'Urea 50 kg bag, 30.000 t', dispatched: '22 Sep 2026', age: '4 days' },
  { id: 'LEG-5105', route: 'Virtual', load: 'Urea 50 kg bag, 40.000 t', dispatched: '22 Sep 2026', age: '4 days' },
  { id: 'LEG-5106', route: 'Direct', load: 'Urea 50 kg bag, 40.000 t', dispatched: '22 Sep 2026', age: '4 days' },
];

export function StockApp({ state = 'Position' }) {
  if (state === 'Loading') {
    return <ImAppPhone title="Home" who="stock" area="home" initials="RD"><div aria-busy="true" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><CardSkeleton /><CardSkeleton /></div></ImAppPhone>;
  }
  if (state === 'On the road') {
    return (
      <ImAppPhone title="On the road" who="stock" area="road" initials="RD">
        <ImAppCard title="On the road" count={IM_APP_ROAD.length} objects="legs">
          {IM_APP_ROAD.map((r, i) => (
            <ImAppRow key={r.id} first={!i} title={<HmLink>{r.id}</HmLink>} sub={`${r.route}, ${r.load}, dispatched ${r.dispatched}`}
              right={r.past ? <StatusMark kind="attention" label={`${r.age}, past window`} size="body-4" /> : <Text variant="body-4" tone="secondary">{r.age}</Text>} />
          ))}
        </ImAppCard>
      </ImAppPhone>
    );
  }
  return (
    <ImAppPhone title="Home" who="stock" area="home" initials="RD">
      <HmRefreshed time="26 Sep 2026, 07:48 CAT" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
        {kpiTiles([
          <KpiTile key="p" label="Physical warehouse (t)" value="924" size="heading-2-condensed" />,
          <KpiTile key="v" label="Virtual warehouse (t)" value="0" size="heading-2-condensed" />,
          <KpiTile key="r" label="On the road (t)" value="210" caption="7 legs" size="heading-2-condensed" />,
          <KpiTile key="f" label="Free (t)" value="607" size="heading-2-condensed" />,
        ])}
      </div>
      <ImAppCard title="Position by product" count={IM_APP_STOCK.length} objects="products">
        {IM_APP_STOCK.map((r, i) => (
          <ImAppRow key={r.id} first={!i} title={<CommodityMarker commodity="fertilizer">{`${r.product}, ${r.pack}`}</CommodityMarker>}
            sub={`Physical warehouse ${r.physical} t, on the road ${r.road} t`} right={<Text variant="body-3" tabular>Free {r.free} t</Text>} />
        ))}
      </ImAppCard>
    </ImAppPhone>
  );
}
