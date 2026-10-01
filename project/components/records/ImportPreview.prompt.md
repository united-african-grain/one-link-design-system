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
