Dense register (36px header, 48px rows). Refs as RefCell; restricted values as RestrictedCell (never blank); derived values as DerivedCell.

```jsx
<DataTable total={360} pageSize={5}
  columns={[{key:'ref',label:'Ref',render:r=><RefCell>{r.ref}</RefCell>},{key:'mt',label:'MT',align:'right'},{key:'margin',label:'Margin',align:'right',render:r=>r.restricted?<RestrictedCell/>:<DerivedCell rows={r.calc}>{r.margin}</DerivedCell>}]}
  rows={rows} />
```

A column that carries long wording (an exception, a record in words, a reason) sets `wrap: true`: its text runs onto more lines instead of being cut, and that table's rows grow from 48px. Never leave text cut mid-word.

A row that opens to more rows (Inventory by site: each site's contracts, map UX-08) passes `expand`: a function of the row that returns what it opens to, or nothing for a row that does not expand, such as a Total. A chevron button leads the row and turns down when open, with `aria-expanded` and the accessible name `expandLabel`; the content sits under the row. Left out, the table is drawn exactly as before.

```jsx
<DataTable rows={sites} expandLabel={(r) => `Show contracts, ${r.site}`} expand={(r) => (r.total ? null : <DataTable rows={r.contracts} columns={contractColumns} />)} columns={siteColumns} />
```
