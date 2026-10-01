/** The Setup view's frame and the parts every Setup screen shares. Setup is a view inside One Link, not a product:
    the design system's AppShell with "Setup" beside the product name, "Search Setup", Exit Setup and Help in the
    toolbar, and the grouped Setup navigation starting with Setup Home (map UX-06). All sample data is fictional. */

/** The Setup navigation, grouped. Only the items whose milestone has shipped are drawn: pass `shipped` to hide the rest. */
export const SETUP_NAV = [
  { items: [{ value: 'home', label: 'Setup Home' }] },
  { label: 'Users and access', items: [{ value: 'users', label: 'Users' }, { value: 'bundles', label: 'Bundles' }] },
  { label: 'Configuration', items: [{ value: 'settings', label: 'Settings' }, { value: 'switches', label: 'Switches' }, { value: 'steps', label: 'Approval steps' }, { value: 'policies', label: 'Policy methods' }] },
  { label: 'Reference data', items: [{ value: 'sites', label: 'Sites and storage units' }, { value: 'corridors', label: 'Corridors and routes' }, { value: 'products', label: 'Products' }, { value: 'points', label: 'Delivery points' }, { value: 'calendars', label: 'Operating calendars' }] },
  { label: 'Security and audit', items: [{ value: 'audit', label: 'Audit logs' }] },
];

export const ADMIN = { initials: 'NP', name: 'N. Phiri', email: 'n.phiri@example.com', meta: 'Administrator' };
export const OWNER = { initials: 'TM', name: 'T. Mwila', email: 't.mwila@example.com', meta: 'Owner' };

export function shippedNav(shipped) {
  if (!shipped) return SETUP_NAV;
  return SETUP_NAV.map((g) => ({ ...g, items: g.items.filter((i) => shipped.includes(i.value)) })).filter((g) => g.items.length);
}

/** The Setup frame. `section` is the active navigation item; `crumbs` follow "Setup" (UX-04). */
export function SetupFrame({ section = 'home', onSection, crumbs = [], shipped, onExit, children }) {
  return (
    <AppShell nav={shippedNav(shipped)} module={section} onNavigate={onSection} home="home" context="Setup"
      breadcrumb={['Setup', ...crumbs]} sync={null} showDigest={false} searchPlaceholder="Search Setup" user={ADMIN}
      right={<><Button variant="outline" size="xsmall" onClick={onExit}>Exit Setup</Button><IconButton icon="circle-help" label="Help" /></>}>
      {children}
    </AppShell>
  );
}

/** A count beside a title or in a card header: body-4-strong secondary on grouped, pill. */
export function CountBadge({ children }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, padding: '0 6px', boxSizing: 'border-box', borderRadius: 'var(--radius-max)', background: 'var(--grouped)', ...textStyle('body-4', { strong: true, tone: 'secondary' }), fontVariantNumeric: 'tabular-nums' }}>{children}</span>;
}

/** Sentence-case page title with its count, and at most one primary button on the right (UX-04, UX-07). */
export function SetupHead({ title, count, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <Text as="h1" variant="heading-2" strong style={{ margin: 0, overflowWrap: 'anywhere' }}>{title}</Text>
        {count != null ? <CountBadge>{count}</CountBadge> : null}
      </span>
      {right ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{right}</div> : null}
    </div>
  );
}

/** A titled card with a count and an optional View all; an empty card keeps its title and count 0 and shows the
    green check over "No [objects] to display." (UX-08, UX-15). Its table or rows run edge to edge under the header. */
export function CountCard({ title, count, objects, action, children }) {
  return (
    <Card gap={8} title={<>{title}{' '}<span style={{ display: 'inline-flex', verticalAlign: 'text-bottom', marginLeft: 4 }}><CountBadge>{count}</CountBadge></span></>} headerRight={action}>
      {count === 0 ? <EmptyState title={`No ${objects} to display.`} style={{ padding: '16px 0 8px' }} /> : <div style={{ margin: '0 -16px -16px' }}>{children}</div>}
    </Card>
  );
}

/** A text-button link in a card header: View all, View audit log. */
export function HeaderLink({ children, onClick }) {
  return <Button variant="ghost" size="xsmall" onClick={onClick}>{children}</Button>;
}

/** The list view (UX-07): title with count, the view selector and filters, search, then the compact table with the
    record link first and Status last. A list with nothing to show keeps its count 0 and says "No [objects] to display." */
export function ListView({ title, objects, view, filters, search, columns, rows, primary }) {
  return (
    <Sections>
      <SetupHead title={title} count={rows.length} right={primary} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <ScrollRow>{view ? <Capsule chevron selected>{view}</Capsule> : null}{filters}</ScrollRow>
        <SearchField placeholder={search} hint={null} maxWidth={320} />
      </div>
      {rows.length ? <SetupTable columns={columns} rows={rows} /> : <Card><EmptyState title={`No ${objects} to display.`} /></Card>}
    </Sections>
  );
}

/** DataTable with a minimum width from its columns (fixed widths, plus 160px for each flexible column), so on a phone
    it scrolls inside its own container instead of squeezing the columns over each other. */
export function SetupTable(props) {
  const min = props.columns.reduce((n, c) => n + (c.width && /px$/.test(c.width) ? parseInt(c.width, 10) : 160), 0);
  return <DataTable rowKey="id" {...props} minWidth={min} />;
}

/** A record link inside a table or a card list. */
export function RecordLink({ children, onClick }) {
  return <a href="#" onClick={(e) => { e.preventDefault(); onClick && onClick(); }} style={{ ...textStyle('body-3', { strong: true, tone: 'brand' }), textDecoration: 'none' }}>{children}</a>;
}

/** A Setup screen that this section does not draw: people and access (M1.DS.02), records and data (M1.DS.03). */
export function DrawnElsewhere({ title, card }) {
  return <Sections><SetupHead title={title} /><Card><EmptyState tone="neutral" icon="layout-grid" title={`${title} is drawn in ${card}.`} /></Card></Sections>;
}
