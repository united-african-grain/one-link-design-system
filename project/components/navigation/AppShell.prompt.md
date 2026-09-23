One Link signed-in frame: sidebar, toolbar, account menu and page column. Every internal screen renders inside it; the Partner Portal keeps `Header`, phones add the `MobileShell` bar.

The `ticker` slot runs along the foot of the whole frame, not the page column: it spans every column, under the sidebar as well, because the `Ticker`'s inverted top corners only read as the bar flowing off the screen if they meet the window's own edges. It is `position: sticky; bottom: 0`, so it stays at the foot of the window on a page long enough to scroll while still taking its own space at the end of the document; a fixed bar would sit over the last row of whatever is on screen, and One Link is full of wide tables. The sidebar's height is cut by the strip's own height (`--ticker-h` plus `--ticker-corner`), so the rail ends where the bar starts and the foot rows and the collapse toggle stay reachable, and the page column carries the same value as bottom padding so nothing is ever hidden behind it. It sits below the drawer and its scrim in the stack, so between 768 and 1024 an open sidebar covers the strip rather than the other way round.

From 1024px the sidebar collapses to 64px of module icons. The labels stay for a screen reader, a count becomes a dot on the icon, and hovering or focusing a module opens a flyout with its name, its count in full and, for the active module, its sections: those sections are reachable nowhere else, so the flyout is what makes collapsing safe. The toggle is the last row of the foot. Below 1024px `collapsed` is ignored.

```jsx
<AppShell
  nav={[{ items: MODULES.map((m) => (m.value === 'trade' ? { ...m, count: 3, sections: [{ value: 'board', label: 'Trade Board' }, { value: 'coverage', label: 'Coverage' }, { value: 'approvals', label: 'Approvals', count: 2 }] } : m)) }]}
  module="trade" section="coverage" onNavigate={go}
  breadcrumb={['Trade Desk', 'Coverage']}
  sync="live"
  user={{ initials: 'TM', name: 'T. Mwila', email: 't.mwila@example.com', meta: 'Owner' }}
  menu={<MenuRow icon="settings" label="Preferences" />}
  signingOut={busy} onSignOut={signOut}
  collapsed={collapsed} onCollapsedChange={setCollapsed}
  foot={<><RailLink icon="settings" label="Settings" collapsed={collapsed} /><RailLink icon="circle-help" label="Help" collapsed={collapsed} /></>}
  footer={<ChartAttribution />}
  ticker={<Ticker anchor={{ icon: 'gauge', text: 'As at 12 March, 08:40' }} items={items} onItemClick={go} />}
>
  …page…
</AppShell>
```
