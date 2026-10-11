/** Trading in the UAG One Link app (M6.DS.01 AC 9, UAG-82; M6.APP.01), drawn at 390: Trading's contracts by status and
    commodity, the short list with the suppliers to call, and the day's trucks for Transport. The trade approval on the
    phone is the Managing Director's approval (`OwnerApproval` in OwnerApp.jsx), which this card does not redraw. Every
    screen takes `state`, one of its TRADING_APP_STATES entry, for ?screen=&state=, and draws the whole phone.

    The rows are the web's (../trading_workspace/Workspace.jsx and the Trading kit), so the phone and the web agree.
    With no signal the phone shows the last refreshed time with the warning icon and keeps what it last loaded; nothing
    is decided offline. Tonnes only: the phone's trading screens carry no price. Fictional sample data only. */

export const TRADING_APP_STATES = {
  AppContracts: ['By status', 'Wheat', 'No signal'],
  AppShortList: ['Short contracts', 'Suppliers to call', 'No signal'],
  AppDayPlan: ['Today', 'No signal', 'No loads'],
};

/** Trading's areas on the phone: Contracts and the Short list. Transport's: the Day plan. */
export const TRADING_AREAS = [
  { value: 'contracts', label: 'Contracts', icon: 'file-text' },
  { value: 'short', label: 'Short list', icon: 'triangle-alert' },
];
export const TRANSPORT_AREAS = [
  { value: 'day', label: 'Day plan', icon: 'truck' },
  { value: 'loading', label: 'Loading orders', icon: 'file-text' },
];

function TaPhone({ title, initials, areas, area, children }) {
  return <MobileShell title={title} initials={initials} height={844} modules={areas} module={area}>{children}</MobileShell>;
}

/** Last refreshed, amber with the warning icon and the words No signal when the phone is offline (UX-24, UX-31). */
function TaFresh({ offline }) {
  return offline ? <StatusMark kind="attention" size="body-4" label="No signal. Last refreshed 07:02 CAT" /> : <HmRefreshed time="07:02 CAT" />;
}

/** A row of a phone card: the record as a link, a line under it, a figure on the right. */
function TaRow({ title, sub, marker, right, first }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', boxShadow: first ? 'none' : 'inset 0 1px 0 var(--border-light)' }}>
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <HmLink>{title}</HmLink>
        {marker ? <CommodityMarker commodity={marker.commodity}><Text variant="body-4" tone="secondary">{marker.text}</Text></CommodityMarker> : null}
        {sub ? <Text variant="body-4" tone="secondary" style={{ overflowWrap: 'anywhere' }}>{sub}</Text> : null}
      </span>
      {right ? <span style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>{right}</span> : null}
    </div>
  );
}

function TaCard({ title, count, objects, children }) {
  return (
    <Card gap={8} padding={16} title={<>{title}<span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 8 }}><Count>{count}</Count></span></>}>
      {count ? <div style={{ margin: '0 -16px -8px', display: 'flex', flexDirection: 'column' }}>{children}</div> : <EmptyState title={`No ${objects} to display.`} style={{ padding: '8px 0' }} />}
    </Card>
  );
}

const TA_STATUS_ORDER = ['pending', 'approved', 'active', 'draft'];

/** Trading's contracts on the phone (M6.APP.01 AC 1): by status, the commodity on every row, tonnes left and cover. */
export function AppContracts({ state = 'By status' }) {
  const wheat = state === 'Wheat';
  const rows = TW_CONTRACTS.filter((c) => c.status !== 'closed' && (!wheat || c.commodity === 'Wheat'));
  return (
    <TaPhone title="Contracts" initials="JT" areas={TRADING_AREAS} area="contracts">
      <TaFresh offline={state === 'No signal'} />
      <ScrollRow><Capsule chevron selected={wheat}>{wheat ? 'Commodity: Wheat' : 'Commodity'}</Capsule><Capsule chevron>Kind</Capsule></ScrollRow>
      {TA_STATUS_ORDER.map((s) => {
        const group = rows.filter((r) => r.status === s);
        if (!group.length) return null;
        return (
          <TaCard key={s} title={TW_STATUS[s].label} count={group.length} objects="contracts">
            {group.map((r, i) => (
              <TaRow key={r.id} first={!i} title={r.id} marker={{ commodity: r.marker, text: `${r.commodity}, ${r.kind.toLowerCase()}, ${r.cp}` }}
                right={<><Text variant="body-4" strong tabular>{`${r.left} t left`}</Text>{r.cover ? <Text variant="body-4" tone="secondary" tabular>{r.cover} t</Text> : null}</>} />
            ))}
          </TaCard>
        );
      })}
    </TaPhone>
  );
}

const TA_SHORT = [
  { id: 'SYN4702', buyer: 'Riverbend Milling', short: '800', severity: 'High', reason: 'Delivery overdue on SYN4702-C',
    suppliers: [{ name: 'Lakeview Farms Ltd', reason: '300 t undelivered on SYN4702-C', contact: '+260 97 555 0142' }, { name: 'Chongwe Growers Ltd', reason: 'Declared 80 t expected, not yet firm', contact: null }] },
  { id: 'SYN4845', buyer: 'Riverbend Milling', short: '400', severity: 'Medium', reason: 'Window starts 20 Oct 2026',
    suppliers: [{ name: 'Kapiri Farms', reason: '100 t undelivered on SYN4845-B', contact: '+260 96 555 0187' }] },
];

/** The short list on the phone (M6.APP.01 AC 1): short contracts by severity, each opening its suppliers to call with
    the reason and a contact or "no contact on record", matching the web. */
export function AppShortList({ state = 'Short contracts' }) {
  const open = state === 'Suppliers to call';
  return (
    <TaPhone title="Short list" initials="JT" areas={TRADING_AREAS} area="short">
      <TaFresh offline={state === 'No signal'} />
      <TaCard title="Short contracts" count={TA_SHORT.length} objects="short contracts">
        {TA_SHORT.map((r, i) => (
          <div key={r.id}>
            <TaRow first={!i} title={r.id} marker={{ commodity: 'wheat', text: `Wheat, ${r.buyer}` }} sub={r.reason}
              right={<><Text variant="body-4" strong tabular>{`Short ${r.short} t`}</Text><Text variant="body-4" tone="secondary">{r.severity}</Text></>} />
            {open && i === 0 ? (
              <div data-suppliers={r.id} style={{ background: 'var(--grouped-light)' }}>
                {r.suppliers.map((s) => (
                  <TaRow key={s.name} title={s.name} sub={s.reason}
                    right={s.contact ? <Text variant="body-4" tabular>{s.contact}</Text> : <Text variant="body-4" tone="secondary">no contact on record</Text>} />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </TaCard>
    </TaPhone>
  );
}

const TA_LOAD_MARK = { planned: { kind: 'neutral', label: 'Planned' }, loading: { kind: 'pending', label: 'Loading' }, transit: { kind: 'clean', label: 'In transit' } };
export const TA_DAY = [
  { id: 'SYN4702', buyer: 'Riverbend Milling', from: 'Chisamba Shed', loads: [
    { id: 'd1', transporter: 'Northside Haulage', truck: 'AAZ 3310', order: 'LO-2241', tonnes: '34.000', status: 'transit' },
    { id: 'd2', transporter: 'Kafue Transport Ltd', truck: 'BCA 2210', order: 'LO-2244', tonnes: '30.000', status: 'loading' }] },
  { id: 'SYN4845', buyer: 'Riverbend Milling', from: 'Farm 2, Mpongwe', loads: [
    { id: 'd3', transporter: 'Copperbelt Haulage Ltd', truck: 'BAP 9229', order: '', tonnes: '34.000', status: 'planned' }] },
];

/** Transport's day on the phone (M6.APP.01 AC 4; canvas "One Link Ashraf", Day plan): today's planned loads per
    contract, each with its transporter, truck and whether it has loaded. */
export function AppDayPlan({ state = 'Today' }) {
  const groups = state === 'No loads' ? [] : TA_DAY;
  return (
    <TaPhone title="Day plan" initials="AM" areas={TRANSPORT_AREAS} area="day">
      <TaFresh offline={state === 'No signal'} />
      <Text variant="heading-4" strong>01 Oct 2026</Text>
      {groups.length ? groups.map((g) => (
        <TaCard key={g.id} title={`${g.id}, ${g.buyer}`} count={g.loads.length} objects="loads">
          {g.loads.map((l, i) => (
            <TaRow key={l.id} first={!i} title={l.truck} sub={`${l.transporter}, from ${g.from}${l.order ? `, ${l.order}` : ''}`}
              right={<><Text variant="body-4" strong tabular>{`${l.tonnes} t`}</Text><StatusMark kind={TA_LOAD_MARK[l.status].kind} label={TA_LOAD_MARK[l.status].label} size="caption-1" /></>} />
          ))}
        </TaCard>
      )) : <Card padding={16}><EmptyState title="No loads to display." /></Card>}
    </TaPhone>
  );
}
