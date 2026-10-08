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
- Row checks: `check: 'amendment'` reads "Cell D4: amendment, confirm before import" and stops Import until the amendments are confirmed (then `amendment-confirmed`); `already-recorded` (skipped), `differs-from-recorded` (not applied) and `sheet-figure-differs` are warnings and never stop it. A load register's rows add three, none of which stops Import: `skipped-before-cutover` ("Cell A3: skipped, before cutover date"), `purchase-side-only` ("Cell I3: purchase side only") and `carried` ("Cell P2: carried at the cutover date, unverified"). `check: 'note'` carries free text in `note` and shows it as a warning ("Cell F7: grade read as 2, contract says 1", or the text alone without a `cell`); it never stops Import either. Show an amendment's Old value and New value as columns.

A workbook with more than one sheet (a load register has one tab per supplier) repeats row numbers, so each row carries its `sheet` and rows are told apart by sheet and row (`previewRowKey`: "Lakeview Farms Ltd!3"). A single-sheet file leaves `sheet` out and rows are told apart by row number, as before.

`PREVIEW_STATES` lists the nine states with the reference each cites and whether Import is enabled.

Per template, each opt-in; leave them out and the preview is drawn as before:

- `tiles[].note`: a sub-line under the tile's value, as the canvases draw "Rows 14 In file", "New legs 12 Loaded at origin", "Already recorded 1 Recognised, not duplicated", "Errors 1 Fix before import".
- `readyWord`: the Result word for a clean row, the template's own word ("New leg"), or a function of the row ("Creates consignment", "Completes consignment"). Default "Ready".
- `actions`: `'beside'` (default) draws Discard and Import beside the File card; `'inline'` puts them in the File card's title row after the status; `'none'` leaves them to the page's own title row, as the canvases draw them next to "Port schedule preview". Import's rule stays `previewBlocked` and the status.
- `statusWord="map"`: the status reads the map's word (Validating, Ready to import, Imported, Failed) and the computed phrase ("1 row to fix") sits beside it, secondary. Default `'computed'` shows the computed phrase, as before.

```jsx
<ImportPreview
  file={{ name: 'Port schedule 26 Sep 2026.xlsx', by: ['Shakil', '09:12'], rows: 14 }}
  tiles={[{ label: 'Rows', value: '14', note: 'In file' }, { label: 'New legs', value: '12', note: 'Loaded at origin' }]}
  readyWord="New leg" actions="none" statusWord="map"
  columns={[{ key: 'leg', label: 'Leg' }, { key: 'loaded', label: 'Loaded (t)', align: 'right', tabular: true }]}
  rows={[{ row: 1, leg: 'KAL-15', loaded: '34.180' }, { row: 2, leg: 'KAL-16', loaded: '33.940', check: 'note', cell: 'F2', note: 'loaded on a Sunday' }]}
/>
```
