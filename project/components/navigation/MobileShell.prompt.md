Phone frame for every 390px artboard.

```jsx
<MobileShell title="Trade Desk" subTabs={['Trade Board','Coverage','Approvals']} subTab="Coverage" module="trade">…</MobileShell>
```

A persona whose main areas are not the owner's modules passes its own `modules` (the UAG One Link app: Tasks and Pending sync). A detail or task screen passes `onBack` for the back chevron and hides the bar (map UX-31):

```jsx
<MobileShell title="Prove delivery" onBack={back} showBottomBar={false} initials="PS">…</MobileShell>
<MobileShell title="Field tasks" modules={FIELD_AREAS} module="tasks" initials="PS">…</MobileShell>
```

Both are opt-in: left out, the shell is drawn exactly as before. The Flutter twin `OlMobileShell` already takes `modules`; `onBack` is new there too.
