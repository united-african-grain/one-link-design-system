The highlights panel of the Counterparty record page for Owen (M3.DS.01, S08 J7): read-only. It shows the kind (Counterparty), the name and status, the Type, then each figure (Sales under contract, Delivered, Left to deliver, Receivables, Oldest unpaid) with a line saying the date it is as of. It never draws a button, an input or an upload control.

```jsx
<CounterpartyOverview name="Riverbend Milling" type="Mill" status={<StatusMark kind="clean" label="Active" size="body-4" />}
  onFigure={(key) => openCalculation(key)}
  figures={[{ key: 'left', label: 'Left to deliver', value: '6,000 t', asOf: '01 Oct 2026' }, { key: 'receivables', label: 'Receivables', restricted: true, asOf: '01 Oct 2026' }]} />
```

A figure with `onFigure` opens Calculation details (map UX-18), where the components, the source and its date are listed; the figure is a link, not a button. A figure the viewer's price tier does not allow is `Restricted`: a lock, no value, the tooltip Restricted, never a dash, a zero or a made-up figure. Where no viewer of the layout holds the tier, leave the figure out instead. Business words only: no batch, upload, template or sync.
