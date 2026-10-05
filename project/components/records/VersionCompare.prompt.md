Two versions of a template side by side (M3.DS.01), lined up by the heading in the file. Each row shows what the older version read the column as and what the newer one reads it as (field, then type, Required and tier), and the change as an icon and a word: Added, Removed, Remapped (read into another field) or Changed (type, required or tier). An unchanged column has no mark.

```jsx
<VersionCompare before={{ label: 'Version 1', columns: V1 }} after={{ label: 'Version 2', columns: V2 }} />
```

Column names, types and tags only, never a row's values. On a phone the table scrolls in its own container.
