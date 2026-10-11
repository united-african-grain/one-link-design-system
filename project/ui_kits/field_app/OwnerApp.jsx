/** The Managing Director in the UAG One Link app (M5.DS.01, UAG-139; S08 J11, canvas S09 "Mobile Home" and "Mobile
    approval, Trade SYN4810"), drawn at 390: Home with the KPI tiles, Items to approve and Exceptions; the two lists the
    bottom bar opens; an approval with Approve and Reject, Reject asking for a comment first; and an exception with
    Acknowledge. No other action appears on the phone (S08 J11). Every screen takes `state`, one of its OWNER_APP_STATES
    entry, for ?screen=&state=, and draws the whole phone.

    The figures and records are Home's (../one_link/Home.jsx, HM_*), so the phone and the web agree. Approve, Reject and
    Acknowledge draw their working state until the decision lands. Task screens (an approval, an exception) hide the
    bottom bar, carry the back chevron and put the main actions full width at the bottom (UX-31). Business language
    only, no word on the M5 banned-word list; Owen holds every tier, so nothing is restricted. Fictional data only. */

export const OWNER_APP_STATES = {
  OwnerHome: ['With items', 'No items', 'Stale data'],
  OwnerList: ['Items to approve', 'Exceptions', 'No items'],
  OwnerApproval: ['Pending approval', 'Approving', 'Reject', 'Rejecting', 'Approved'],
  OwnerMobileException: ['Open', 'Acknowledging', 'Acknowledged'],
};

/** Owen's areas on the phone (S08 J11, canvas): Home, Approvals, Exceptions. */
export const OWNER_AREAS = [
  { value: 'home', label: 'Home', icon: 'house' },
  { value: 'approvals', label: 'Approvals', icon: 'square-check' },
  { value: 'exceptions', label: 'Exceptions', icon: 'triangle-alert' },
];
const OWNER_PHONE = 844;

/** The signed-in phone for Owen: his areas in the bottom bar on Home and the lists, the back chevron and no bar on a
    task screen (UX-31). */
function OwnerPhone({ title, area, task = false, children, overlay }) {
  return (
    <MobileShell title={title} initials={MD_USER.initials} height={OWNER_PHONE} modules={OWNER_AREAS} module={area}
      showBottomBar={!task} onBack={task ? () => {} : undefined}>
      {children}
      {overlay}
    </MobileShell>
  );
}

/** A row of a phone card: the record as a link, a line under it, a figure on the right and the chevron. */
function OwnerRow({ title, sub, right, first }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', boxShadow: first ? 'none' : 'inset 0 1px 0 var(--border-light)' }}>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <HmLink>{title}</HmLink>
        <Text variant="body-4" tone="secondary" style={{ overflowWrap: 'anywhere' }}>{sub}</Text>
      </span>
      {right ? <span style={{ flex: 'none' }}>{right}</span> : null}
      <Icon name="chevron-right" size={16} color="var(--content-tertiary)" />
    </div>
  );
}

/** A phone card: title with count; empty keeps the title and count 0 and reads "No [objects] to display." */
function OwnerCard({ title, count, objects, footer, children }) {
  return (
    <Card gap={8} padding={16} title={<>{title}<span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 8 }}><Count>{count}</Count></span></>}>
      {count ? <div style={{ margin: '0 -16px', display: 'flex', flexDirection: 'column' }}>{children}</div> : <EmptyState title={`No ${objects} to display.`} style={{ padding: '8px 0' }} />}
      {count && footer ? <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, boxShadow: 'inset 0 1px 0 var(--border-light)', margin: '0 -16px -8px' }}>{footer}</div> : null}
    </Card>
  );
}

/** Home on the phone (S08 J11 step 1): Last refreshed, the KPI tiles, Items to approve and the three largest
    exceptions by value at risk, with View all. */
export function OwnerHome({ state = 'With items' }) {
  const empty = state === 'No items';
  const approvals = empty ? [] : HM_APPROVALS;
  const exceptions = empty ? [] : hmByValue(HM_EXCEPTIONS);
  return (
    <OwnerPhone title="Home" area="home">
      <HmRefreshed stale={state === 'Stale data'} time={state === 'Stale data' ? '04:15 CAT' : '07:02 CAT'} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
        {kpiTiles(HM_TILES.map((t) => <KpiTile key={t.key} label={t.label} value={t.value} size="heading-2-condensed" />))}
      </div>
      <OwnerCard title="Items to approve" count={approvals.length} objects="items">
        {approvals.map((r, i) => <OwnerRow key={r.id} first={!i} title={r.item} sub={r.summary} />)}
      </OwnerCard>
      <OwnerCard title="Exceptions" count={exceptions.length} objects="exceptions" footer={<HmLink>View all {exceptions.length}</HmLink>}>
        {exceptions.slice(0, 3).map((r, i) => <OwnerRow key={r.id} first={!i} title={r.business} sub={r.businessRecord} right={<Text variant="body-4" strong tabular>USD {r.value}</Text>} />)}
      </OwnerCard>
    </OwnerPhone>
  );
}

/** The lists the bottom bar opens: Items to approve and Exceptions, each item opening its record. */
export function OwnerList({ state = 'Items to approve' }) {
  const exceptions = state === 'Exceptions';
  const empty = state === 'No items';
  const rows = empty ? [] : exceptions ? hmByValue(HM_EXCEPTIONS) : HM_APPROVALS;
  return (
    <OwnerPhone title={exceptions ? 'Exceptions' : 'Items to approve'} area={exceptions ? 'exceptions' : 'approvals'}>
      <OwnerCard title={exceptions ? 'Exceptions' : 'Items to approve'} count={rows.length} objects={exceptions ? 'exceptions' : 'items'}>
        {rows.map((r, i) => (exceptions
          ? <OwnerRow key={r.id} first={!i} title={r.business} sub={`${r.businessRecord}, ${r.owner}`} right={<Text variant="body-4" strong tabular>USD {r.value}</Text>} />
          : <OwnerRow key={r.id} first={!i} title={r.item} sub={r.summary} right={<StatusMark kind="pending" label="Pending approval" size="caption-1" />} />))}
      </OwnerCard>
    </OwnerPhone>
  );
}

/** The main actions of a task screen, full width at the bottom (UX-31). */
function OwnerActions({ children }) {
  return <div style={{ marginTop: 'auto', paddingTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))', gap: 8 }}>{children}</div>;
}

/** Label and value rows of a record on the phone. */
function OwnerFacts({ rows }) {
  return <Card padding={16}><SummaryList items={rows.map(([label, value]) => ({ label, value }))} /></Card>;
}

/** The approval on the phone (S08 J4, J11 step 2): Trade SYN4810 with its buyer, tonnage, margin at the rates frozen
    at submission and purchase legs; Approve, or Reject, which asks for a comment before it is enabled (UX-22). Each
    draws its working state until the decision lands. */
export function OwnerApproval({ state = 'Pending approval' }) {
  const approved = state === 'Approved';
  const approving = state === 'Approving';
  const rejecting = state === 'Rejecting';
  const dialog = state === 'Reject' || rejecting;
  return (
    <OwnerPhone title="Approval" task
      overlay={dialog ? <ReasonDialog contained sheet title="Reject Trade SYN4810" label="Comment" minLength={1} confirmLabel="Reject" confirmVariant="critical" busy={rejecting}
        defaultReason={rejecting ? 'Margin per t is below the agreed floor for maize' : ''}>Riverbend Milling, maize, 1,500 t, submitted by J. Tembo.</ReasonDialog> : null}>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text variant="body-4" tone="secondary">Trade</Text>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text variant="heading-3" strong tabular>SYN4810</Text>
          <StatusMark kind={approved ? 'clean' : 'pending'} label={approved ? 'Approved' : 'Pending approval'} size="body-4" />
        </span>
      </span>
      <OwnerFacts rows={[['Buyer', 'Riverbend Milling'], ['Commodity', 'Maize'], ['Quantity', '1,500 t'], ['Delivery window', 'Jun to Aug 2027'], ['Margin', 'USD 17,920'], ['Margin per t', 'USD 11.95'],
        ['Submitted by', 'J. Tembo'], ['Submitted', '25 Sep 2026, 16:40 CAT'], ...(approved ? [['Approved by', 'T. Mwila'], ['Approved', '26 Sep 2026, 07:20 CAT']] : [])]} />
      <OwnerCard title="Purchase legs" count={3} objects="purchase legs">
        <div style={{ padding: '0 16px' }}><SummaryList items={[{ label: 'A, Lakeview Farms Ltd', value: '700 t' }, { label: 'B, Cameron Estates', value: '500 t' }, { label: 'C, Mpongwe Valley Farms', value: '300 t' }]} /></div>
      </OwnerCard>
      {approved ? null : (
        <OwnerActions>
          <Button variant="critical-ghost" size="large" fullWidth disabled={approving || rejecting}>Reject</Button>
          <PressButton kind="large" variant="primary" fullWidth loading={approving} disabled={rejecting}>Approve</PressButton>
        </OwnerActions>
      )}
    </OwnerPhone>
  );
}

/** An exception on the phone (S08 J6, J11 step 3): its type, value at risk, owner, age and linked record, and
    Acknowledge, its one action here. It stays open once acknowledged. */
export function OwnerMobileException({ state = 'Open' }) {
  const acknowledged = state === 'Acknowledged';
  return (
    <OwnerPhone title="Exception" task>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Text variant="body-4" tone="secondary">Exception</Text>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text variant="heading-3" strong tabular>EXC-000184</Text>
          <ExceptionStatus status={acknowledged ? 'acknowledged' : 'open'} />
        </span>
      </span>
      <OwnerFacts rows={[['Exception', 'Delivery overdue'], ['Type', 'Execution'], ['Value at risk', 'USD 81,600'], ['Owner', 'J. Tembo'], ['Age', '10 days'],
        ['Linked record', <HmLink>SYN4702 leg C</HmLink>], ['Counterparty', <HmLink>Lakeview Farms Ltd</HmLink>], ['Left to deliver', '300 t']]} />
      {acknowledged ? null : (
        <OwnerActions>
          <PressButton kind="large" variant="primary" fullWidth loading={state === 'Acknowledging'}>Acknowledge</PressButton>
        </OwnerActions>
      )}
    </OwnerPhone>
  );
}
