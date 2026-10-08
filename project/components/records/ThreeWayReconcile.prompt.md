The Reconcile card of a goods received note (M4.DS.01, M4.GRN.01, RL-THREE-WAY): ticket net, lines total and offload tally, checked pair by pair against the tolerance. It composes `ReconcileCard`, so it adds no look of its own.

```jsx
<ThreeWayReconcile tolerance="0.080" figures={[
  { label: 'Ticket net', value: '32.140' },
  { label: 'Lines total', value: '31.700' },
  { label: 'Offload tally', value: '31.700' },
]} />
```

- Rows: the three figures, Variance in bold (the largest difference), Tolerance, then one row for each pair that is out, naming the pair and the difference: "Ticket net against lines total, 0.440 t".
- The closing line is the status Within tolerance or Beyond tolerance. Beyond tolerance means the note goes On hold and stock does not move; the card never says so in a sentence (UX-20).
- `threeWayCheck(values, tolerance)` is the rule itself, in thousandths of a tonne. Pass `extra` for Bags counted when the tally was counted in bags.
- Fertiliser checks two figures (ticket net against expected from count, zero tolerance on bags): use `ReconcileCard` directly.
