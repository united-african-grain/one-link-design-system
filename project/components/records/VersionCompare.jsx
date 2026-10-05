import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { DataTable } from '../data/DataTable.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';

/** How a column changed between two versions: an icon and a word each (map UX-14). */
export const COMPARE_MARKS = {
  added: { kind: 'clean', word: 'Added' },
  removed: { kind: 'breach', word: 'Removed' },
  remapped: { kind: 'pending', word: 'Remapped' },
  changed: { kind: 'pending', word: 'Changed' },
};

/** Line the two versions up by the column's heading in the file. A column only in the newer version is added, only in
    the older one removed; read into another field it is remapped; a new type, required flag or tier is changed. */
export function compareVersions(before = [], after = []) {
  const rows = before.map((b) => {
    const a = after.find((x) => x.source === b.source) || null;
    const change = !a ? 'removed' : a.field !== b.field ? 'remapped'
      : (a.type !== b.type || !!a.required !== !!b.required || (a.tier || '') !== (b.tier || '')) ? 'changed' : null;
    return { source: b.source, before: b, after: a, change };
  });
  for (const a of after) if (!before.some((b) => b.source === a.source)) rows.push({ source: a.source, before: null, after: a, change: 'added' });
  return rows;
}

function Side({ col }) {
  if (!col) return <span />;
  const detail = [col.type, col.required ? 'Required' : '', col.tier ? `${col.tier} tier` : ''].filter(Boolean).join(', ');
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span style={textStyle('body-3')}>{col.field}</span>
      <span style={textStyle('body-4', { tone: 'secondary' })}>{detail}</span>
    </span>
  );
}

/** Two versions of a template side by side (M3.DS.01): each column of the file with what the older version and the
    newer one read it as, and the change marked Added, Removed, Remapped or Changed. Unchanged columns carry no mark.
    On a phone the table scrolls in its own container. */
export function VersionCompare({ before = { label: 'Version 1', columns: [] }, after = { label: 'Version 2', columns: [] }, minWidth = 760, style }) {
  const rows = compareVersions(before.columns, after.columns);
  return (
    <div data-version-compare="" style={{ minWidth: 0, ...style }}>
      <DataTable rowKey="source" minWidth={minWidth} rows={rows} columns={[
        { key: 'source', label: 'Column in the file', width: 'minmax(170px, 1fr)', wrap: true, render: (r) => <span style={textStyle('body-3', { strong: true })}>{r.source}</span> },
        { key: 'before', label: before.label, width: 'minmax(190px, 1fr)', wrap: true, render: (r) => <Side col={r.before} /> },
        { key: 'after', label: after.label, width: 'minmax(190px, 1fr)', wrap: true, render: (r) => <Side col={r.after} /> },
        { key: 'change', label: 'Change', width: '140px', render: (r) => (r.change ? <span data-change={r.change}><StatusMark kind={COMPARE_MARKS[r.change].kind} label={COMPARE_MARKS[r.change].word} size="body-4" /></span> : '') },
      ]} />
    </div>
  );
}
