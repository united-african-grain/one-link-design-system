A load against its limit (M4.DS.02; S14 R5, M4.OUT.03, M4.CAP.01). Ryan's load builder draws it in the Load card of a New loading order; the grain delivery note draws it in its Legal payload card; Ashraf's Assign truck dialog draws it against the truck's legal payload.

```jsx
<Card title="Load"><LoadMeter total="27.240" limit="30.000" rows={[
  { label: 'Maximum order weight', value: '30.000 t' },
  { label: 'Truck', value: 'ABZ 4412' },
  { label: 'Assigned by', value: 'A. Mwale' },
  { label: 'Truck loading weight', value: '30.000 t' },
]} /></Card>
<LoadMeter kind="payload" label="Ticket net" total="36.200" limit="34.000" rows={[{ label: 'Legal payload', value: '34.000 t' }, { label: 'Excess', value: '2.200 t', strong: true }]} />
```

- One boundary everywhere (S14 R5): Within below the approach share, Approaching from it, At maximum (or At legal payload) at exactly the limit, a warning that needs no override, and Over above it. `loadState(total, limit, approachShare)` says which; weights compare as thousandths of a tonne, so the limit is never crossed by rounding.
- The approach share and the limit are inputs: the payload approach setting (95% by default) and the vehicle's payload stay data.
- On a loading order, Over reads "Over by 0.255 t" and the page disables Commit. On a grain delivery note, Over legal payload needs an override with a reason, recorded as a near-miss; the page draws that with `ReasonDialog`.
- Used is whole per cent and never reads 100% unless the load is exactly at the limit (`loadUsed`).
- No price, value or margin: a load is tonnes.
