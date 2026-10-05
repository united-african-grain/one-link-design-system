import React from 'react';
import { textStyle } from '../core/Text.jsx';

/** Where a figure comes from, in business words only (map UX-13, S57): the sheet, register or record a person would
    name, never how it got in. A source kind is one of these; its date reads DD MMM YYYY. */
export const SOURCE_KINDS = {
  'trade-sheet': 'Trade sheet',
  'stock-sheet': 'Stock sheet',
  'season-book': 'Season book',
  'load-register': 'Load register',
  weighbridge: 'Weighbridge',
  'scanned-slip': 'Scanned slip',
  'delivery-note': 'Delivery note',
  invoice: 'Invoice',
  'farmer-ledger': 'Farmer ledger',
};

/** "Trade sheet, 01 Oct 2026": the source's name and its date. */
export function sourceWords(kind, date) {
  const name = SOURCE_KINDS[kind] || kind;
  return date ? `${name}, ${date}` : name;
}

/** The source of a figure as a labelled field (M3.DS.01): the label Source over "Trade sheet, 01 Oct 2026". It is a
    field, never a chip or a sentence. `inline` puts the label and value on one line, for a figure's foot. */
export function SourceLine({ kind, date, label = 'Source', inline = false, style }) {
  if (inline) {
    return (
      <span data-source={kind} style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 4, ...textStyle('body-4', { tone: 'secondary' }), fontVariantNumeric: 'tabular-nums', ...style }}>
        <span>{label}:</span><span>{sourceWords(kind, date)}</span>
      </span>
    );
  }
  return (
    <div data-source={kind} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, ...style }}>
      <span style={textStyle('body-4', { tone: 'secondary' })}>{label}</span>
      <span style={{ ...textStyle('body-3', { tabular: true }), overflowWrap: 'anywhere' }}>{sourceWords(kind, date)}</span>
    </div>
  );
}
