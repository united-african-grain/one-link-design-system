One Link signed-in frame: sidebar, toolbar, account menu and page column. Every internal screen renders inside it; the Partner Portal keeps `Header`, phones add the `MobileShell` bar.

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
>
  …page…
</AppShell>
```
