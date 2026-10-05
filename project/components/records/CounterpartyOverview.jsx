import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { Restricted } from '../data/Restricted.jsx';
import { RecordHighlights } from './RecordHighlights.jsx';

/** One figure of the overview: its value (or the Restricted mark) and the line saying what date it is as of. A figure
    with `onFigure` opens Calculation details, read-only (map UX-18), so its value is a link, never a button. */
function OverviewFigure({ figure, onFigure }) {
  const value = figure.restricted ? <Restricted />
    : onFigure ? <a href="#" data-figure-link={figure.key} onClick={(e) => { e.preventDefault(); onFigure(figure.key); }} style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px dotted var(--content-quaternary)' }}>{figure.value}</a>
    : figure.value;
  return (
    <span data-figure={figure.key} data-restricted={figure.restricted || undefined} style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span style={{ ...textStyle('body-3', { tabular: true }), minHeight: 20 }}>{value}</span>
      <span data-as-of="" style={textStyle('body-4', { tone: 'secondary' })}>As of {figure.asOf}</span>
    </span>
  );
}

/** The counterparty overview (M3.DS.01, S08 J7): the highlights panel of the Counterparty record page, read-only. Its
    kind, name and status, its Type, then each figure (Sales under contract, Delivered, Left to deliver, Receivables,
    Oldest unpaid) with the date it is as of. A figure the viewer's price tier does not allow is the Restricted mark:
    a lock, no value, the tooltip Restricted; leave the figure out instead where no viewer of the layout holds the
    tier. It draws no button, input or upload control: Owen never captures or edits here. The Details, Related and
    History tabs sit under it. */
export function CounterpartyOverview({ name, type, status, figures = [], onFigure, style }) {
  return (
    <RecordHighlights kind="Counterparty" title={name} status={status} tabs={[]} style={style}
      fields={[{ label: 'Type', value: type }, ...figures.map((f) => ({ label: f.label, value: <OverviewFigure figure={f} onFigure={onFigure} /> }))]} />
  );
}
