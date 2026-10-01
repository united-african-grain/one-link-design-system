import React from 'react';
import { Card, MetaParts } from '../data/Card.jsx';
import { DataTable } from '../data/DataTable.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';
import { Button } from '../actions/Button.jsx';
import { textStyle } from '../core/Text.jsx';

/** An upload's statuses (map UX-25), the same on every canvas. Commit is never a word for uploads. */
export const UPLOAD_STATUS = {
  validating: { kind: 'pending', word: 'Validating' },
  ready: { kind: 'clean', word: 'Ready to import' },
  imported: { kind: 'clean', word: 'Imported' },
  failed: { kind: 'breach', word: 'Failed' },
};

/**
 * The import preview (map UX-25): an uploaded file opens a preview with a File card (file name,
 * uploader or dispatch date, rows), summary tiles, and a row table with the row number and a Result
 * column. Errors cite the row. Discard and Import sit at the top right; Import stays disabled while
 * any row has an error.
 */
export function ImportPreview({ file, status = 'ready', tiles = [], columns = [], rows = [], onDiscard, onImport, importing = false, style }) {
  const st = UPLOAD_STATUS[status] || UPLOAD_STATUS.ready;
  const errors = rows.filter((r) => r.error);
  const table = [
    { key: 'row', label: 'Row', align: 'right', width: '64px', tabular: true },
    ...columns,
    { key: 'result', label: 'Result', render: (r) => (r.error ? <StatusMark kind="breach" label={r.error} size="body-4" /> : <StatusMark kind="clean" label="Ready" size="body-4" />) },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <Card title="File" headerRight={<StatusMark kind={st.kind} label={st.word} />} style={{ flex: '1 1 320px' }}>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 8, columnGap: 16 }}>
            <dt style={textStyle('body-3', { tone: 'secondary' })}>File name</dt><dd style={{ margin: 0, ...textStyle('body-3', { strong: true }) }}>{file?.name}</dd>
            {file?.by ? <><dt style={textStyle('body-3', { tone: 'secondary' })}>{file.byLabel || 'Uploaded by'}</dt><dd style={{ margin: 0, ...textStyle('body-3') }}><MetaParts meta={file.by} /></dd></> : null}
            <dt style={textStyle('body-3', { tone: 'secondary' })}>Rows</dt><dd style={{ margin: 0, ...textStyle('body-3', { tabular: true }) }}>{file?.rows ?? rows.length}</dd>
          </dl>
        </Card>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <Button variant="outline" onClick={onDiscard} disabled={importing}>Discard</Button>
          <Button variant="primary" onClick={onImport} loading={importing} disabled={errors.length > 0 || status !== 'ready'}>Import</Button>
        </div>
      </div>
      {tiles.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {tiles.map((t, i) => (
            <Card key={i} padding={16} gap={4}>
              <span style={textStyle('body-3', { tone: 'secondary' })}>{t.label}</span>
              <span style={textStyle('heading-3-condensed', { tabular: true })}>{t.value}</span>
            </Card>
          ))}
        </div>
      ) : null}
      <DataTable columns={table} rows={rows} rowKey="row" />
    </div>
  );
}
