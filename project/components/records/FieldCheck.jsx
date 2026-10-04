import React, { useRef } from 'react';
import { textStyle } from '../core/Text.jsx';
import { useElementWidth } from '../core/Interaction.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';
import { Input, CheckboxList } from '../inputs/Field.jsx';

/** A field is open while its reading is doubtful and the clerk has neither ticked Checked nor changed the value. */
export function fieldOpen(f) { return !!f.doubtful && !f.checked && String(f.value) === String(f.read); }
/** The clerk's value differs from the reading. */
export function fieldCorrected(f) { return String(f.value) !== String(f.read); }
/** Confirm weights is enabled only when no field is open (UX-17). */
export function fieldsReady(fields) { return !fields.some(fieldOpen); }

/** The Weights table of a scanned slip: one row per field read from the slip, with the columns Field, Read from slip
    and Confirmed. A doubtful reading carries the status Check and a red ring on its Confirmed input until the clerk
    ticks Checked or edits the value; a corrected field keeps the reading beside the clerk's value and says Corrected.
    No confidence word or score is ever shown: `doubtful` is all the screen learns. The inputs are offered only when
    `evidence` names the photo shown beside the table, so no weight is entered without its evidence (R-08); without it
    the Confirmed column is read only. Below 560px each field stacks. */
export function FieldCheck({ fields = [], onChange, evidence, disabled = false, style }) {
  const ref = useRef(null);
  const width = useElementWidth(ref);
  const stacked = width > 0 && width < 560;
  const editable = !!evidence;
  const head = { ...textStyle('body-4', { tone: 'tertiary' }), whiteSpace: 'nowrap' };
  const grid = 'minmax(0,1.1fr) minmax(0,1.2fr) minmax(0,1.3fr)';
  const mark = (f) => fieldOpen(f) ? <StatusMark kind="attention" label="Check" size="body-4" />
    : fieldCorrected(f) ? <StatusMark kind="clean" label="Corrected" size="body-4" />
    : f.doubtful && f.checked ? <StatusMark kind="clean" label="Checked" size="body-4" /> : null;
  const confirmed = (f) => editable ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <Input aria-label={`${f.label}, confirmed`} align={f.numeric ? 'right' : undefined} inputMode={f.numeric ? 'decimal' : undefined} value={f.value} invalid={fieldOpen(f)} disabled={disabled}
        onChange={(e) => onChange && onChange(f.key, { value: e.target.value })} />
      {f.doubtful ? <CheckboxList disabled={disabled} options={[{ value: 'checked', label: 'Checked' }]} values={f.checked ? ['checked'] : []} onChange={(v) => onChange && onChange(f.key, { checked: v.includes('checked') })} /> : null}
    </div>
  ) : <span style={{ ...textStyle('body-3', { tabular: f.numeric }) }}>{f.value}</span>;
  return (
    <div ref={ref} data-field-check="" data-editable={editable || undefined} style={{ minWidth: 0, ...style }}>
      {stacked ? null : (
        <div role="row" style={{ display: 'grid', gridTemplateColumns: grid, gap: 12, alignItems: 'center', height: 36, padding: '0 12px', boxShadow: 'inset 0 -1px 0 var(--border-light)' }}>
          <span style={head}>Field</span><span style={head}>Read from slip</span><span style={head}>Confirmed</span>
        </div>
      )}
      {fields.map((f, i) => (
        <div key={f.key} role="row" data-field={f.key} data-open={fieldOpen(f) || undefined} data-corrected={fieldCorrected(f) || undefined}
          style={{ display: stacked ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: stacked ? undefined : grid, gap: stacked ? 6 : 12, alignItems: stacked ? 'stretch' : 'start', padding: stacked ? '12px 16px' : '8px 12px', boxShadow: i < fields.length - 1 ? 'inset 0 -1px 0 var(--border-light)' : 'none' }}>
          <span style={{ ...textStyle('body-3', { strong: stacked, tone: stacked ? 'primary' : 'secondary' }), minHeight: stacked ? undefined : 40, display: 'flex', alignItems: 'center' }}>{f.label}</span>
          <span style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, minHeight: stacked ? undefined : 40 }}>
            {stacked ? <span style={textStyle('body-4', { tone: 'secondary' })}>Read from slip</span> : null}
            <span data-read="" style={textStyle('body-3', { tabular: f.numeric })}>{f.read}</span>
            {mark(f)}
          </span>
          {confirmed(f)}
        </div>
      ))}
    </div>
  );
}
