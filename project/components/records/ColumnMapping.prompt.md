The template version editor's column mapping (M3.DS.01). One row per column of the file: the heading as written, the One Link field it is read into, its type, Required, its price tier, and the result of testing it against a header row (Found, cell F1, or Not in the header row). It shows column names, types and tags only, never a row's values, because Setup shows no price figures (S10 control 4).

```jsx
<ColumnMapping editable fields={['Contract', 'Counterparty', 'Purchase price']} onChange={(source, patch) => update(source, patch)}
  columns={[{ source: 'Buy price K/t', field: 'Purchase price', type: 'Money', required: true, tier: 'Contract', tierFrom: 'mapping', found: true, cell: 'F1' }]} />
```

A tier that comes from the figure-to-tier mapping (`tierFrom: 'mapping'`) is drawn read-only, with "From Figures and price tiers" under it and no control that removes it. A tier set by hand is a choice while editing, blank for none.

`mappingChanges(before, after)` names each change in words ("Comments is removed.", "Qty is read as Contracted tonnage, not Quantity."). A destructive change (removed, moved to another field, a type change, an optional column made required) opens the existing `ReasonDialog` with the change as its statement, and Save waits for the reason (map UX-22). On a phone the table scrolls in its own container.
