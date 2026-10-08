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
  discarded: { kind: 'neutral', word: 'Discarded' },
  reversed: { kind: 'neutral', word: 'Reversed' },
};

/** What a row check says in the Result column, with its cell (M3.DS.01). A warning never stops Import; an amendment
    does until it is confirmed. */
export const PREVIEW_CHECKS = {
  amendment: { kind: 'pending', word: 'amendment, confirm before import' },
  'amendment-confirmed': { kind: 'clean', word: 'amendment confirmed' },
  'already-recorded': { kind: 'flat', word: 'already recorded, skipped' },
  'differs-from-recorded': { kind: 'attention', word: 'differs from recorded, not applied' },
  'sheet-figure-differs': { kind: 'attention', word: 'sheet figure differs' },
  // A load register's rows (M3.TRD.03, UAG-182): a row before the cutover date, a load recorded on its purchase alone,
  // and a delivered to date carried at the cutover. Words only, on marks the system already has; none stops Import.
  'skipped-before-cutover': { kind: 'flat', word: 'skipped, before cutover date' },
  'purchase-side-only': { kind: 'neutral', word: 'purchase side only' },
  carried: { kind: 'clean', word: 'carried at the cutover date, unverified' },
  // A free-text warning the row carries in `note` ("Grade read as 2, contract says 1"). It never stops Import.
  note: { kind: 'attention', word: 'note' },
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

/** What tells one preview row from another. A single-sheet file uses its row number, as before. A workbook with one
    tab per supplier (a load register) repeats row numbers across tabs, so a row with a `sheet` is told apart by its
    sheet and its row: "Lakeview Farms Ltd!3". */
export function previewRowKey(r) {
  return r.sheet != null && r.sheet !== '' ? `${r.sheet}!${r.row}` : String(r.row);
}

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
 *
 * Opt-in, each defaulting to today's drawing: a tile's `note` under its value ("In file", "Loaded at origin");
 * `readyWord` for a clean row's Result ("New leg", or a function of the row); `actions` to put Discard and Import
 * in the File card's title row ('inline') or leave them to the page ('none'); `statusWord="map"` to show the
 * map's upload status word (Ready to import, Failed) with the computed detail ("1 row to fix") beside it.
 */
export function ImportPreview({ file, status = 'ready', tiles = [], columns = [], rows = [], refusal, onDiscard, onImport, importing = false, readyWord = 'Ready', actions = 'beside', statusWord = 'computed', style }) {
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
  // The map's word for the same file (UX-25), and the computed phrase kept as its detail when the two differ.
  const mapSt = refusal ? UPLOAD_STATUS.failed : UPLOAD_STATUS[status] || UPLOAD_STATUS.ready;
  const detail = st === mapSt ? null : st.word;
  const blocked = previewBlocked({ refusal, file, rows });
  const result = (r) => {
    if (r.error) return <StatusMark kind="breach" label={r.error} size="body-4" style={{ whiteSpace: 'normal' }} />;
    const c = r.check && PREVIEW_CHECKS[r.check];
    if (c && r.check === 'note') return <span data-check="note"><StatusMark kind={c.kind} label={r.cell ? `Cell ${r.cell}: ${r.note || c.word}` : (r.note || c.word)} size="body-4" style={{ whiteSpace: 'normal' }} /></span>;
    if (c) return <span data-check={r.check}><StatusMark kind={c.kind} label={`Cell ${r.cell}: ${c.word}`} size="body-4" style={{ whiteSpace: 'normal' }} /></span>;
    return <StatusMark kind="clean" label={typeof readyWord === 'function' ? readyWord(r) : readyWord} size="body-4" />;
  };
  const fact = (label, value, key) => value ? <React.Fragment key={key || label}><dt style={textStyle('body-3', { tone: 'secondary' })}>{label}</dt><dd data-fact={label} style={{ margin: 0, ...textStyle('body-3'), overflowWrap: 'anywhere' }}>{value}</dd></React.Fragment> : null;
  const table = [
    { key: 'row', label: 'Row', align: 'right', width: '64px', tabular: true },
    ...columns,
    { key: 'result', label: 'Result', width: 'minmax(220px, 1fr)', wrap: true, render: result },
  ];
  const buttons = (
    <>
      <Button variant="outline" onClick={onDiscard} disabled={importing}>Discard</Button>
      <Button variant="primary" onClick={onImport} loading={importing} disabled={errors.length > 0 || blocked || status !== 'ready'}>Import</Button>
    </>
  );
  const statusMark = statusWord === 'map'
    ? <span data-status-word="map" style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}><StatusMark kind={mapSt.kind} label={mapSt.word} />{detail ? <span data-status-detail style={textStyle('body-3', { tone: 'secondary' })}>{detail}</span> : null}</span>
    : <StatusMark kind={st.kind} label={st.word} />;
  const headerRight = actions === 'inline'
    ? <div data-actions="inline" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>{statusMark}<div style={{ display: 'flex', gap: 8 }}>{buttons}</div></div>
    : statusMark;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <Card title="File" headerRight={headerRight} style={{ flex: '1 1 320px' }}>
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
        {actions === 'beside' ? (
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            {buttons}
          </div>
        ) : null}
      </div>
      {refusal ? <Refusal action={refusal.action || 'Import'} reason={refusal.reason} /> : null}
      {!refusal && tiles.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {tiles.map((t, i) => (
            <Card key={i} padding={16} gap={4}>
              <span style={textStyle('body-3', { tone: 'secondary' })}>{t.label}</span>
              <span style={textStyle('heading-3-condensed', { tabular: true })}>{t.value}</span>
              {t.note ? <span data-tile-note style={textStyle('body-3', { tone: 'tertiary' })}>{t.note}</span> : null}
            </Card>
          ))}
        </div>
      ) : null}
      {/* A refused file, or one whose required headings are missing, has no rows read to show. */}
      {refusal || (missing.length && !rows.length) ? null : <DataTable columns={table} rows={rows} rowKey={previewRowKey} />}
    </div>
  );
}
