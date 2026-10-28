import React from 'react';
import { StatusMark } from '../feedback/StatusMark.jsx';
import { DataTable } from '../data/DataTable.jsx';
import { textStyle } from '../core/Text.jsx';

/** The checkpoints of an import truck leg, in the order the leg passes them (S16 AL3 and AL5, UAG-102, Map D-22). A
    weight checkpoint carries a weight; a position checkpoint says only where the truck is. This list, the sources and
    the status words below are the one copy module for checkpoint wording: screens import them and never retype them. */
export const CHECKPOINTS = [
  { key: 'loaded', word: 'Loaded at origin', weight: true },
  { key: 'in-transit', word: 'In transit', position: true },
  { key: 'border-arrival', word: 'Border arrival', position: true },
  { key: 'border-departure', word: 'Border departure', position: true },
  { key: 'offloaded', word: 'Offloaded', weight: true },
];

/** Where a checkpoint was reported from, as the labelled field Source. A source either reports a weight (`weight`),
    a position (`position`) or both. A transporter's report is a position only, so it can never stand for a weight, and
    the weighbridge reports a weight only, so a reported position is never shown as Source: Weighbridge.

    The mill's five (`offload`, M7.IMP.05 AC 7 and 8) are the only sources of an offload, and an offload never shows
    Weighbridge: Mill call (typed from a phone call), Email, Mill offload sheet, Scanned slip (a photographed mill slip
    confirmed through OCR) and Mill portal (the mill's own entry, M8.PRT.07). A person recording an offload picks one of
    the first three; Scanned slip and Mill portal are set by how the offload arrived (`auto`), so a form never offers
    them. The keys match the offload's stored source (MILL_CALL, EMAIL, MILL_OFFLOAD_SHEET, SCANNED_SLIP, MILL_PORTAL). */
export const CHECKPOINT_SOURCES = {
  'port-schedule': { word: 'Port schedule', weight: true, position: true },
  'transporter-call': { word: 'Transporter call', position: true },
  'transporter-message': { word: 'Transporter message', position: true },
  'clearing-agent': { word: 'Clearing agent', position: true },
  'mill-call': { word: 'Mill call', weight: true, offload: true },
  email: { word: 'Email', weight: true, offload: true },
  'mill-offload-sheet': { word: 'Mill offload sheet', weight: true, offload: true },
  // Kept as they were (UAG-102, a Done card): stored values on recorded loads still read these words, offered and
  // resolved on any weight checkpoint as before. New import offloads use Mill call and Email.
  'mill-phone-call': { word: 'Mill phone call', weight: true, kept: true },
  'mill-email': { word: 'Mill email', weight: true, kept: true },
  'scanned-slip': { word: 'Scanned slip', weight: true, offload: true, auto: true },
  'mill-portal': { word: 'Mill portal', weight: true, offload: true, auto: true },
  weighbridge: { word: 'Weighbridge', weight: true },
};

/** The sources of a mill offload, in order (M7.IMP.05): Mill call, Email, Mill offload sheet, Scanned slip, Mill portal.
    An unmatched offload, which belongs to no checkpoint yet, reads its Source from these. */
export const OFFLOAD_SOURCES = Object.keys(CHECKPOINT_SOURCES).filter((k) => CHECKPOINT_SOURCES[k].offload);

/** A checkpoint's status, an icon and a word (UX-14). A checkpoint not yet reached has no status: a blank cell (UX-09). */
export const CHECKPOINT_STATUS = {
  done: { kind: 'clean', word: 'Done' },
  waiting: { kind: 'attention', word: 'Waiting' },
};

/** Whether a source can report a checkpoint: a position from a position source; the offload only from the mill's
    sources; any other weight (Loaded at origin) from a weight source that is not the mill's. */
function sourceFits(c, s) {
  if (c.position && s.position) return true;
  if (!c.weight || !s.weight) return false;
  if (s.kept) return true;
  return c.key === 'offloaded' ? !!s.offload : !s.offload;
}

/** The word for a checkpoint's source, or '' when that source cannot report that checkpoint (a weighbridge position,
    a transporter's weight, a weighbridge offload): the row then shows no source rather than a wrong one. */
export function checkpointSource(checkpoint, source) {
  const c = CHECKPOINTS.find((x) => x.key === checkpoint);
  const s = CHECKPOINT_SOURCES[source];
  if (!c || !s) return '';
  return sourceFits(c, s) ? s.word : '';
}

/** The sources a capture form offers for a checkpoint, in order: what can report it, and nothing else. A source set by
    how the record arrived (Scanned slip, Mill portal) is never offered: on Offloaded the options are Mill call, Email,
    Mill offload sheet, and the kept Mill phone call and Mill email. */
export function checkpointSourceOptions(checkpoint) {
  const c = CHECKPOINTS.find((x) => x.key === checkpoint);
  if (!c) return [];
  return Object.values(CHECKPOINT_SOURCES).filter((s) => !s.auto && sourceFits(c, s)).map((s) => s.word);
}

/** The word for an offload's Source, whether or not it matched a leg: '' for anything that is not the mill's. */
export function offloadSource(source) {
  const s = CHECKPOINT_SOURCES[source];
  return s && (s.offload || s.kept) ? s.word : '';
}

function checkpointRows(checkpoints) {
  const by = Object.fromEntries((checkpoints || []).map((c) => [c.key, c]));
  return CHECKPOINTS.map((c) => {
    const got = by[c.key] || {};
    return { id: c.key, checkpoint: c.word, status: got.status || '', date: got.date || '', by: got.by || '', source: got.source ? checkpointSource(c.key, got.source) : '' };
  });
}

/** A checkpoint status alone, for a list or a schedule cell: Done or Waiting, or blank. */
export function CheckpointStatusMark({ status, size = 'body-4' }) {
  const s = CHECKPOINT_STATUS[status];
  return s ? <StatusMark kind={s.kind} label={s.word} size={size} /> : '';
}

/**
 * Checkpoint timeline (M7.DS.01): an import truck leg's checkpoints, Loaded at origin, In transit, Border arrival,
 * Border departure and Offloaded, always all five and in that order, each with its status, date, who recorded it and
 * its Source. A position reported by the transporter is a checkpoint row like any other, its Source naming the report
 * (Transporter call): a plain labelled field, never a badge, a chip or a confidence, and never Source: Weighbridge.
 * The weight's own source sits on the weight checkpoints, so the two are never merged.
 *
 * `variant="table"` (default) is the record page's table; `variant="list"` stacks each checkpoint for a phone.
 */
export function CheckpointTimeline({ checkpoints = [], variant = 'table', style }) {
  const rows = checkpointRows(checkpoints);
  if (variant === 'list') {
    return (
      <ol data-checkpoints="" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', ...style }}>
        {rows.map((r, i) => (
          <li key={r.id} data-checkpoint={r.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0', boxShadow: i ? 'inset 0 1px 0 var(--border-light)' : 'none' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={textStyle('body-3', { strong: true })}>{r.checkpoint}</span>
              <CheckpointStatusMark status={r.status} />
            </span>
            {r.date || r.by || r.source ? (
              <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'max-content minmax(0, 1fr)', gap: '2px 12px', ...textStyle('body-4', { tabular: true }) }}>
                {[['Date', r.date], ['Recorded by', r.by], ['Source', r.source]].filter(([, v]) => v).map(([label, value]) => (
                  <React.Fragment key={label}>
                    <dt style={textStyle('body-4', { tone: 'secondary' })}>{label}</dt>
                    <dd data-field={label} style={{ margin: 0, overflowWrap: 'anywhere' }}>{value}</dd>
                  </React.Fragment>
                ))}
              </dl>
            ) : null}
          </li>
        ))}
      </ol>
    );
  }
  return (
    <DataTable rowKey="id" rows={rows} minWidth={680} style={style} columns={[
      { key: 'checkpoint', label: 'Checkpoint', width: 'minmax(150px, 1fr)', wrap: true },
      { key: 'status', label: 'Status', width: '110px', render: (r) => <CheckpointStatusMark status={r.status} /> },
      { key: 'date', label: 'Date (CAT)', width: '170px', tabular: true },
      { key: 'by', label: 'Recorded by', width: '130px', wrap: true },
      { key: 'source', label: 'Source', width: 'minmax(150px, 1fr)', wrap: true },
    ]} />
  );
}
