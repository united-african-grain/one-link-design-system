import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { DataTable } from '../data/DataTable.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';
import { Select, CheckboxList } from '../inputs/Field.jsx';

/** The types a template column can be read as. */
export const MAPPING_TYPES = ['Text', 'Reference', 'Name', 'List', 'Tonnes', 'Number', 'Money', 'Date', 'Month range'];
/** The price tiers a money column can carry (Figures and price tiers, M1.ID.04). */
export const TIER_TAGS = ['Gate', 'Contract', 'Sell', 'Farmer account'];

/** What a new version does to each column, against the version in force, in words. Removing a column, moving it to
    another field, changing its type or making an optional column required is destructive: the editor asks for a
    reason before it saves (map UX-22). Adding a column is not. */
export function mappingChanges(before = [], after = []) {
  const changes = [];
  for (const b of before) {
    const a = after.find((x) => x.source === b.source);
    if (!a) { changes.push({ source: b.source, kind: 'removed', destructive: true, words: `${b.source} is removed.` }); continue; }
    if (a.field !== b.field) changes.push({ source: b.source, kind: 'field', destructive: true, words: `${b.source} is read as ${a.field}, not ${b.field}.` });
    if (a.type !== b.type) changes.push({ source: b.source, kind: 'type', destructive: true, words: `${b.source} changes type from ${b.type} to ${a.type}.` });
    if (a.required && !b.required) changes.push({ source: b.source, kind: 'required', destructive: true, words: `${b.source} becomes required.` });
  }
  for (const a of after) if (!before.some((b) => b.source === a.source)) changes.push({ source: a.source, kind: 'added', destructive: false, words: `${a.source} is added as ${a.field}.` });
  return changes;
}

/** A column's price tier. A tier that comes from the figure-to-tier mapping (`from: 'mapping'`) is read-only: it names
    where it comes from and offers no control that removes it. Otherwise it is a choice while editing, blank for none. */
export function TierTag({ tier, from, editable = false, onChange }) {
  if (from === 'mapping') {
    return (
      <span data-tier={tier} data-tier-from="mapping" style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={textStyle('body-3', { strong: true })}>{tier}</span>
        <span style={textStyle('body-4', { tone: 'secondary' })}>From Figures and price tiers</span>
      </span>
    );
  }
  if (editable) return <Select aria-label="Price tier" options={[{ value: '', label: '' }, ...TIER_TAGS]} value={tier || ''} onChange={(e) => onChange && onChange(e.target.value)} />;
  return <span data-tier={tier || undefined}>{tier || ''}</span>;
}

/** The template version editor's column mapping (M3.DS.01): each column of the file mapped to a One Link field, its
    type, whether it is required and its price tier, tested against a header row (Found, or Not in the header row).
    Column names, types and tags only: never a row's values (S10 control 4). On a phone the table scrolls in its own
    container. `editable` turns field, type, required and a tier not from the mapping into controls. */
export function ColumnMapping({ columns = [], fields = [], editable = false, onChange, header = true, minWidth = 1040, style }) {
  const set = (c, patch) => onChange && onChange(c.source, patch);
  const table = [
    { key: 'source', label: 'Column in the file', width: 'minmax(180px, 1fr)', wrap: true, render: (c) => <span data-mapping-source="" style={textStyle('body-3', { strong: true })}>{c.source}</span> },
    { key: 'field', label: 'One Link field', width: '220px', wrap: !editable, render: (c) => (editable ? <Select aria-label={`${c.source}, One Link field`} options={fields.length ? fields : [c.field]} value={c.field} onChange={(e) => set(c, { field: e.target.value })} /> : <span data-mapping-field="">{c.field}</span>) },
    { key: 'type', label: 'Type', width: '170px', render: (c) => (editable ? <Select aria-label={`${c.source}, type`} options={MAPPING_TYPES} value={c.type} onChange={(e) => set(c, { type: e.target.value })} /> : <span data-mapping-type="">{c.type}</span>) },
    { key: 'required', label: 'Required', width: '130px', render: (c) => (editable
      ? <CheckboxList options={[{ value: 'required', label: 'Required' }]} values={c.required ? ['required'] : []} onChange={(v) => set(c, { required: v.includes('required') })} />
      : <span data-mapping-required="">{c.required ? 'Required' : ''}</span>) },
    { key: 'tier', label: 'Price tier', width: '190px', wrap: true, render: (c) => <TierTag tier={c.tier} from={c.tierFrom} editable={editable} onChange={(t) => set(c, { tier: t })} /> },
    ...(header ? [{ key: 'found', label: 'Header row', width: '190px', wrap: true, render: (c) => (c.found === false
      ? <StatusMark kind={c.required ? 'breach' : 'attention'} label="Not in the header row" size="body-4" style={{ whiteSpace: 'normal' }} />
      : <StatusMark kind="clean" label={c.cell ? `Found, cell ${c.cell}` : 'Found'} size="body-4" />) }] : []),
  ];
  return <div data-column-mapping="" style={{ minWidth: 0, ...style }}><DataTable rowKey="source" columns={table} rows={columns} minWidth={minWidth} /></div>;
}
