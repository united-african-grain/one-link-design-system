The buttons a decider sees on a record waiting for a decision (M4.DS.01): a variance hold (S08 J5), a gate price or a trade (S08 J4). The outcomes are data, so the screen passes exactly what the approval step offers and a later card adds one without redrawing anything.

```jsx
const VARIANCE_HOLD = [
  { value: 'reject', label: 'Reject', variant: 'critical', comment: true },
  { value: 'release', label: 'Release hold', variant: 'primary' },
];
<RecordHighlights kind="Load" title="ABZ 4501" actions={<DecisionActions outcomes={VARIANCE_HOLD} busy={saving} onDecide={decide} />} ... />
```

- Draws exactly the outcomes given, never a fixed set. One primary at most (UX-17); Reject is red text on an outline.
- `busy` names the outcome being saved: its button shows the spinner (rule 8) and the others wait.
- An outcome with `comment` needs a comment first: the screen opens `ReasonDialog` (label Comment, Reject disabled until there is one, UX-22).
- Shown only to someone who may decide. A clerk or stock control never sees it (M4.GRN.08).
