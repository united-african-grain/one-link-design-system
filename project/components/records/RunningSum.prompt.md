The running sum of a goods received note's lines against the ticket net (M4.DS.01, M4.GRN.07). It sits under the Lines card of the New goods received note form and moves as the clerk adds a line. The target is the ticket net; nobody types it.

```jsx
<RunningSum total="32.060" target="32.140" tolerance="0.080" />
<RunningSum total="31.700" target="32.140" tolerance="0.080" />
<RunningSum total="30.060" target="30.060" targetLabel="Expected from count" />
```

- Three states, each an icon and a word: Exact, Within tolerance, Beyond tolerance. `runningSumState(total, target, tolerance)` says which.
- Weights are summed as thousandths of a tonne (`thousandths`, `tonnes`), so 0.1 plus 0.2 never reads 0.30000000000000004 and three decimals stay three decimals (UX-12).
- The full three-way check (ticket net, lines total and offload tally) is `ThreeWayReconcile`, in the Reconcile card at the right.
