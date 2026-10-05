An uploaded file opens a preview page (map UX-25): the File card (file name, uploader or dispatch date, rows), summary tiles, and the rows with their number and a Result column. A row error says what is wrong and the row carries its number. Discard and Import are at the top right, and Import stays disabled while any row has an error. Statuses are Validating, Ready to import, Imported and Failed; uploads never say Commit.

```jsx
<ImportPreview
  file={{ name: 'Port schedule 14 Oct.xlsx', by: ['Ayla Banda', '14 Oct 2026 08:12'], rows: 3 }}
  status="ready"
  tiles={[{ label: 'Rows', value: '3' }, { label: 'Errors', value: '1' }]}
  columns={[{ key: 'contract', label: 'Contract' }, { key: 'tonnes', label: 'Tonnes', align: 'right', tabular: true }]}
  rows={[{ row: 2, contract: 'ZAM 9101', tonnes: '30.000' }, { row: 3, contract: 'ZAM 9199', tonnes: '28.500', error: 'Unknown contract' }]}
/>
```

The preview's checks (M3.DS.01). Each one cites its cell or record, and only some stop Import:

- A required heading not in the file: `file.missing` lists it with its sheet and row under Headings not found, the status reads "1 heading not found", and Import waits. The editor's New version starts from these headings.
- Columns the template does not name: `file.notRead` lists them, with their cells, under Not read. They never stop Import.
- A file staged on an older version while a newer one is in force: `file.template` names the version it was read under and `file.inForce` the newer one. It is never read again silently.
- A file refused before it is read (a price column for a tier the uploader does not hold, a file already imported): `refusal` draws "Import is not allowed. [Reason]." and no rows.
- Row checks: `check: 'amendment'` reads "Cell D4: amendment, confirm before import" and stops Import until the amendments are confirmed (then `amendment-confirmed`); `already-recorded` (skipped), `differs-from-recorded` (not applied) and `sheet-figure-differs` are warnings and never stop it. Show an amendment's Old value and New value as columns.

`PREVIEW_STATES` lists the nine states with the reference each cites and whether Import is enabled.
