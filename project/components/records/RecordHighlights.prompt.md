Every record page in Setup opens with `RecordHighlights`: what the record is, its name with a `StatusMark`, its actions (at most one primary), and its key fields. The Details, Related and History tabs sit under it, and the tab's cards follow.

```jsx
<RecordHighlights kind="Setting" title="GRN reconcile tolerance" status={<StatusMark kind="clean" label="Active" size="body-4" />}
  actions={<><Button variant="outline" size="small">Add override</Button><Button size="small">Schedule change</Button></>}
  fields={[{ label: 'In force', value: '80 kg' }, { label: 'Next change', value: '100 kg from 28 Sep 2026, 00:00 CAT' }, { label: 'Area', value: 'Intake' }, { label: 'Type', value: 'Mass (kg)' }, { label: 'Owner', value: 'Administrator' }]}
  tab={tab} onTab={setTab} />
```

A field whose value does not exist is left blank, never "None" (UX-09). A pending proposal is a `ConditionBanner` above the panel, not text inside it (UX-23).

A field can lead to another record: give it a `link` and its value is drawn as the blue reference link (`RefCell`), as the map draws an exception's Linked record. It is a real link, so Tab reaches it and Enter opens it; `onLink` is told which field was opened. A blank value is never a link.

```jsx
<RecordHighlights kind="Exception" title="EXC-000191" status={<ExceptionStatus status="open" />} tabs={[]}
  fields={[{ label: 'Type', value: 'Intake' }, { label: 'Owner', value: 'Clerk, Chisamba Shed' }, { label: 'Linked record', value: 'WBT10001599', link: '#/tickets/WBT10001599' }]}
  onLink={(f) => open(f.link)} />
```
