Where a record or form checks one quantity against another (map UX-20). Rows of label and value, the key difference in bold, then the status line: Within tolerance, Within allowance, Beyond tolerance or Beyond allowance. No explanatory sentence: the rows say it.

```jsx
<ReconcileCard
  rows={[
    { label: 'Loaded', value: '32.000 t' },
    { label: 'Offloaded', value: '31.950 t' },
    { label: 'Difference', value: '0.050 t', strong: true },
    { label: 'Allowance', value: '0.100 t' },
  ]}
  outcome="allowance"
/>
```

Two pairs, never mixed: `within` and `beyond` for a tolerance (Within tolerance, Beyond tolerance), `allowance` and `beyond-allowance` for an allowance (Within allowance, Beyond allowance; M7.IMP.05, a truck leg against its loss allowance). Beyond either is the attention look, `triangle-alert` and the word. `RECONCILE_OUTCOMES` holds the words; a screen passes the outcome and never retypes them in `status`.

```jsx
<ReconcileCard
  rows={[
    { label: 'Loaded', value: '32.000 t' },
    { label: 'Offloaded', value: '31.200 t' },
    { label: 'Difference', value: '0.800 t (2.50%)', strong: true },
    { label: 'Loss allowance', value: '80 kg' },
  ]}
  outcome="beyond-allowance"
/>
```

`mark` puts a check's own closing line in place of the outcome's: the bag count's `CountMatch` (M4.DS.02). The outbound figures (ordered, loaded, ticket net) are `OutboundReconcile`, and the fertiliser weighbridge check is `VarianceReconcile`; both compose this card.

`ReconcilePanel` (within, held, block) is kept for the screens built before the map's convention.
