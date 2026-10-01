The Restricted state (map UX-09). Use it where a value the viewer may not see has to sit on a shared layout: a lock icon, no value, the tooltip "Restricted". Never a dash, a zero, a blank that looks like "no value", or a loading state. Where a whole column is restricted for every viewer of a layout, leave the column out instead.

```jsx
<td><Restricted /></td>
```

`RestrictedCell` (a dash and eye-off) is kept for the screens built before the map's convention; new screens use `Restricted`.
