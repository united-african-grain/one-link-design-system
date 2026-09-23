One Link signed-in frame: sidebar, toolbar, account menu and page column. Every internal screen renders inside it; the Partner Portal keeps `Header`, phones add the `MobileShell` bar.

The `ticker` slot is the last row of the column, after `footer`, and it is the only row that is not inset: `main` and `footer` sit at `--shell-max` with side padding, while the ticker is full bleed with no max-width and no padding, because the `Ticker`'s inverted top corners only read if they meet the screen edges. It is a block in normal flow, so it scrolls with the page rather than covering the last row of a table.

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
