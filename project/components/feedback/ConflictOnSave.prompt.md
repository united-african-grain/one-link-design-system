Use `ConflictOnSave` when a save is refused because someone else saved the record first (the server answers Conflict). It is the one way every record page shows it, so no screen invents its own "someone else is editing" banner.

```jsx
<ConflictOnSave user="L. Mulenga" time="26 Sep 2026, 09:10 CAT" yours={[{ label: 'Owner', value: 'Lakeview Farms Ltd' }]} onReload={reload} />
// This record was changed by L. Mulenga at 26 Sep 2026, 09:10 CAT. Reload to see the latest version.
```

Keep the edit form open with the person's values in it, and the record's current values in its highlights. Reload replaces the form with the latest version. Nobody is locked out while a record is open. The web app's twin is `ol-conflict-on-save`.
