import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { NotSet } from '../feedback/NotSet.jsx';
import { Restricted } from './Restricted.jsx';
import { RefCell } from './DataTable.jsx';

/** What a margin figure is (M6.DS.01, map UX-16, UX-09): `negative` and `positive` by its sign, `zero` for a true 0,
    and `notSet` when it rests on a transport rate that does not exist. A missing figure is never read as 0 and never
    left blank: no value at all is `notSet`. Figures are strings ("8,365.00", "-800.00"); a typographic minus counts. */
export function marginSign(value) {
  if (value == null || String(value).trim() === '') return 'notSet';
  const n = Number(String(value).replace(/[,\s]/g, '').replace(/−/g, '-'));
  if (Number.isNaN(n)) return 'notSet';
  return n < 0 ? 'negative' : n > 0 ? 'positive' : 'zero';
}

/** The figure as it is read: the sign as a typographic minus, after the currency code when one is given (UX-11:
    "USD -800.00" in a field; "-800.00" in a table whose header names the currency), then the unit ("per t"). */
export function marginWords(value, { currency, unit } = {}) {
  const raw = String(value).trim().replace(/^[-−]\s*/, '');
  const negative = marginSign(value) === 'negative';
  return [currency, `${negative ? '−' : ''}${raw}`, unit].filter(Boolean).join(' ');
}

/**
 * Margin cell (M6.DS.01): one figure of a trade's margin, per leg, per tonne or in total, on a table or a record.
 * A negative margin is drawn as a signal, never hidden: the trending-down icon and the down colour beside the
 * minus. A margin that rests on a missing transport rate is Not set with the amber triangle (UX-16), never 0 and never
 * blank, and the Calculation details it opens names the missing rate. A viewer without the contract tier meets the
 * Restricted lock where the layout is shared (UX-09); otherwise the screen leaves the column out. `onOpen` makes the
 * figure the blue link to its Calculation details (UX-18).
 */
export function MarginCell({ value, currency, unit, notSet = false, restricted = false, onOpen, size = 'body-3', style }) {
  if (restricted) return <Restricted style={style} />;
  const sign = notSet ? 'notSet' : marginSign(value);
  if (sign === 'notSet') return <span data-margin="notSet" style={{ display: 'inline-flex', ...style }}><NotSet size={size} /></span>;
  const words = marginWords(value, { currency, unit });
  const negative = sign === 'negative';
  const figure = onOpen ? <RefCell onOpen={onOpen}>{words}</RefCell> : words;
  return (
    <span data-margin={sign} aria-label={negative ? `${words}, negative margin` : undefined}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', ...textStyle(size, { tabular: true }), color: negative ? 'var(--content-accent-down)' : undefined, ...style }}>
      {negative ? <Icon name="trending-down" size={14} color="var(--content-accent-down)" /> : null}
      {figure}
    </span>
  );
}
