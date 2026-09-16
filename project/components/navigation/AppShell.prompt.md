One Link signed-in frame: sidebar, toolbar, account menu and page column. Every internal screen renders inside it; the Partner Portal keeps `Header`, phones add the `MobileShell` bar.

```jsx
<AppShell
  nav={[{ items: MODULES.map((m) => (m.value === 'trade' ? { ...m, count: 3, sections: [{ value: 'board', label: 'Trade Board' }, { value: 'coverage', label: 'Coverage' }, { value: 'approvals', label: 'Approvals', count: 2 }] } : m)) }]}
  module="trade" section="coverage" onNavigate={go}
  breadcrumb={['Trade Desk', 'Coverage']}
  sync="live"
  user={{ initials: 'TM', name: 'T. Mwila', email: 't.mwila@example.com', meta: 'Owner' }}
  menu={<MenuRow icon="settings" label="Preferences" />}
  signingOut={busy} onSignOut={signOut}
  footer={<ChartAttribution />}
>
  …page…
</AppShell>
```
