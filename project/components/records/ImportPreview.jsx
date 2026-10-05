import React from 'react';
import { Card, MetaParts } from '../data/Card.jsx';
import { DataTable } from '../data/DataTable.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';
import { Button } from '../actions/Button.jsx';
import { textStyle } from '../core/Text.jsx';
import { Refusal } from '../feedback/Refusal.jsx';

/** An upload's statuses (map UX-25), the same on every canvas. Commit is never a word for uploads. */
export const UPLOAD_STATUS = {
  validating: { kind: 'pending', word: 'Validating' },
  ready: { kind: 'clean', word: 'Ready to import' },
  imported: { kind: 'clean', word: 'Imported' },
  failed: { kind: 'breach', word: 'Failed' },
};

/** What a row check says in the Result column, with its cell (M3.DS.01). A warning never stops Import; an amendment
    does until it is confirmed. */
export const PREVIEW_CHECKS = {
  amendment: { kind: 'pending', word: 'amendment, confirm before import' },
  'amendment-confirmed': { kind: 'clean', word: 'amendment confirmed' },
  'already-recorded': { kind: 'flat', word: 'already recorded, skipped' },
  'differs-from-recorded': { kind: 'attention', word: 'differs from recorded, not applied' },
  'sheet-figure-differs': { kind: 'attention', word: 'sheet figure differs' },
};

/** The nine preview states M3.DS.01 draws, each with the cell or record it cites and whether Import is enabled. */
export const PREVIEW_STATES = [
  { state: 'Heading not found', cite: 'Trades, row 1', importEnabled: false },
  { state: 'Columns not read', cite: 'H1', importEnabled: true },
  { state: 'Price tier missing', cite: 'F1', importEnabled: false },
  { state: 'Earlier version', cite: 'version 1', importEnabled: true },
  { state: 'Amendment', cite: 'D4', importEnabled: false },
  { state: 'Already recorded', cite: 'A3', importEnabled: true },
  { state: 'Differs from recorded', cite: 'D6', importEnabled: true },
  { state: 'Sheet figure differs', cite: 'K5', importEnabled: true },
  { state: 'Duplicate refused', cite: 'UPL-000240', importEnabled: false },
];

/** Import waits while the file is refused, a required heading is missing, a row has an error or an amendment is not
    yet confirmed. */
export function previewBlocked({ refusal, file, rows = [] }) {
  return !!refusal || !!(file && file.missing && file.missing.length) || rows.some((r) => r.error) || rows.some((r) => r.check === 'amendment');
}

/**
 * The import preview (map UX-25): an uploaded file opens a preview with a File card (file name,
 * uploader or dispatch date, rows), summary tiles, and a row table with the row number and a Result
 * column. Errors cite the row. Discard and Import sit at the top right; Import stays disabled while
 * any row has an error.
 */
export function ImportPreview({ file, status = 'ready', tiles = [], columns = [], rows = [], refusal, onDiscard, onImport, importing = false, style }) {
  const errors = rows.filter((r) => r.error);
  const missing = (file && file.missing) || [];
  const amendments = rows.filter((r) => r.check === 'amendment');
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  // A file with a row to fix is not ready to import, whatever it was told: it says how many rows need fixing.
  const st = refusal ? UPLOAD_STATUS.failed
    : status === 'ready' && missing.length ? { kind: 'breach', word: `${plural(missing.length, 'heading', 'headings')} not found` }
    : status === 'ready' && errors.length ? { kind: 'breach', word: `${plural(errors.length, 'row', 'rows')} to fix` }
    : status === 'ready' && amendments.length ? { kind: 'pending', word: `${plural(amendments.length, 'amendment', 'amendments')} to confirm` }
    : UPLOAD_STATUS[status] || UPLOAD_STATUS.ready;
  const blocked = previewBlocked({ refusal, file, rows });
  const result = (r) => {
    if (r.error) return <StatusMark kind="breach" label={r.error} size="body-4" style={{ whiteSpace: 'normal' }} />;
    const c = r.check && PREVIEW_CHECKS[r.check];
    if (c) return <span data-check={r.check}><StatusMark kind={c.kind} label={`Cell ${r.cell}: ${c.word}`} size="body-4" style={{ whiteSpace: 'normal' }} /></span>;
    return <StatusMark kind="clean" label="Ready" size="body-4" />;
  };
  const fact = (label, value, key) => value ? <React.Fragment key={key || label}><dt style={textStyle('body-3', { tone: 'secondary' })}>{label}</dt><dd data-fact={label} style={{ margin: 0, ...textStyle('body-3'), overflowWrap: 'anywhere' }}>{value}</dd></React.Fragment> : null;
  const table = [
    { key: 'row', label: 'Row', align: 'right', width: '64px', tabular: true },
    ...columns,
    { key: 'result', label: 'Result', width: 'minmax(220px, 1fr)', wrap: true, render: result },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <Card title="File" headerRight={<StatusMark kind={st.kind} label={st.word} />} style={{ flex: '1 1 320px' }}>
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 8, columnGap: 16 }}>
            <dt style={textStyle('body-3', { tone: 'secondary' })}>File name</dt><dd style={{ margin: 0, ...textStyle('body-3', { strong: true }) }}>{file?.name}</dd>
            {file?.by ? <><dt style={textStyle('body-3', { tone: 'secondary' })}>{file.byLabel || 'Uploaded by'}</dt><dd style={{ margin: 0, ...textStyle('body-3') }}><MetaParts meta={file.by} /></dd></> : null}
            {fact('Template', file?.template)}
            {fact('Version in force', file?.inForce)}
            <dt style={textStyle('body-3', { tone: 'secondary' })}>Rows</dt><dd style={{ margin: 0, ...textStyle('body-3', { tabular: true }) }}>{file?.rows ?? rows.length}</dd>
            {fact('Headings not found', missing.join('; '))}
            {fact('Not read', ((file && file.notRead) || []).join(', '))}
          </dl>
        </Card>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <Button variant="outline" onClick={onDiscard} disabled={importing}>Discard</Button>
          <Button variant="primary" onClick={onImport} loading={importing} disabled={errors.length > 0 || blocked || status !== 'ready'}>Import</Button>
        </div>
      </div>
      {refusal ? <Refusal action={refusal.action || 'Import'} reason={refusal.reason} /> : null}
      {!refusal && tiles.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {tiles.map((t, i) => (
            <Card key={i} padding={16} gap={4}>
              <span style={textStyle('body-3', { tone: 'secondary' })}>{t.label}</span>
              <span style={textStyle('heading-3-condensed', { tabular: true })}>{t.value}</span>
            </Card>
          ))}
        </div>
      ) : null}
      {/* A refused file, or one whose required headings are missing, has no rows read to show. */}
      {refusal || (missing.length && !rows.length) ? null : <DataTable columns={table} rows={rows} rowKey="row" />}
    </div>
  );
}
