Dense register (36px header, 48px rows). Refs as RefCell; restricted values as RestrictedCell (never blank); derived values as DerivedCell.

```jsx
<DataTable total={360} pageSize={5}
  columns={[{key:'ref',label:'Ref',render:r=><RefCell>{r.ref}</RefCell>},{key:'mt',label:'MT',align:'right'},{key:'margin',label:'Margin',align:'right',render:r=>r.restricted?<RestrictedCell/>:<DerivedCell rows={r.calc}>{r.margin}</DerivedCell>}]}
  rows={rows} />
```
