Dense register (36px header, 48px rows). Refs as RefCell; restricted values as RestrictedCell (never blank); derived values as DerivedCell.

```jsx
<DataTable total={360} pageSize={5}
  columns={[{key:'ref',label:'Ref',render:r=><RefCell>{r.ref}</RefCell>},{key:'mt',label:'MT',align:'right'},{key:'margin',label:'Margin',align:'right',render:r=>r.restricted?<RestrictedCell/>:<DerivedCell rows={r.calc}>{r.margin}</DerivedCell>}]}
  rows={rows} />
```

A column that carries long wording (an exception, a record in words, a reason) sets `wrap: true`: its text runs onto more lines instead of being cut, and that table's rows grow from 48px. Never leave text cut mid-word.
