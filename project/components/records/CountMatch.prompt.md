The bag count against the signed count sheet (M4.DS.02; RL-BAG-MATCH, M4.OUT.06). It closes the Reconcile card of a fertiliser delivery note through ReconcileCard's `mark`.

```jsx
<ReconcileCard rows={rows} mark={<CountMatch sheet="400" loaded="399" />} />
<Refusal action="Ship" reason={bagCountReason('400', '399')} />
```

- Two states, each an icon and a word: Count sheet matches, Count mismatch. There is no warn mode: the tolerance stays at 0 and any difference blocks Ship, so 399 against 400 is never a match.
- On a mismatch the page disables Ship and shows "Ship is not allowed. Bag count 399 does not match count sheet 400." (`Refusal`, UX-21).
- A recount is a further count beside the earlier one; nothing is overwritten. Counts name the role (Stock control), not a person.
