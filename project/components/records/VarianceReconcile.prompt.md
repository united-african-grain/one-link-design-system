The weighbridge variance on a fertiliser delivery note (M4.DS.02; S14 R6, M4.CAP.01 AC 11, ryan__12).

```jsx
<VarianceReconcile theoretical="27.240" net="27.610" allowedPct={1} extra={[{ label: 'Count sheet', value: 'Matches' }]} />
```

- Within the allowed variance (a UAG setting) the note ships and the card reads Within tolerance; beyond it the card reads Variance flagged and the page refuses Ship: "Ship is not allowed. Weighbridge net is beyond the allowed variance."
- Only Ryan (Stock control) overrides, from the record's Override variance, in a `ReasonDialog` whose Override is enabled once a reason is entered. The clerk never sees Override variance.
- Difference reads tonnes and per cent ("+0.370 t, 1.4%"), one decimal unless the allowed variance is below 1% (UX-13).
