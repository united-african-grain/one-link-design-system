import React from 'react';
import { textStyle } from '../core/Text.jsx';

/** The two gaps of a sale contract (M7.DS.02 AC 1h; M7.SET.04; Sid's canvas, the receivables position): the gap to
    invoice, collected (invoice-ready) less invoiced, and the gap to pay, invoiced less paid. Both come from one row's
    collected, invoiced and paid tonnes, and are worked out here, never read from a stored figure: a row that carries
    its own gap fields has them ignored. A gap is never below zero. Loads awaiting destination weight are not collected
    yet, so they are in neither gap. */
export const GAP_WORDS = { toInvoice: 'Gap to invoice', toPay: 'Gap to pay', collected: 'Collected', invoiced: 'Invoiced', paid: 'Paid', awaiting: 'Awaiting destination weight' };

/** A money or tonnage string ("1,352.80") in hundredths, so sums never drift. */
export const centsOf = (v) => Math.round((Number(String(v == null ? '' : v).replace(/,/g, '')) || 0) * 100);
/** Hundredths back to "1,352.80". */
export const fromCents = (h) => (h / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** { toInvoice, toPay } as "1,352.40": collected less invoiced, and invoiced less paid; from those three only. */
export function gapsOf(row = {}) {
  const inv = centsOf(row.invoiced);
  return { toInvoice: fromCents(Math.max(0, centsOf(row.collected) - inv)), toPay: fromCents(Math.max(0, inv - centsOf(row.paid))) };
}

/**
 * Gap bar (M7.DS.02): one contract's collected tonnes as a bar, the paid share solid, the invoiced but unpaid share
 * (the gap to pay) lighter, and the rest, the gap to invoice, as the open track; then both gaps as labelled figures,
 * Gap to invoice and Gap to pay, with the unit. The figures are `gapsOf(row)`, so a screen cannot show a gap the row does not
 * prove. `figures={false}` draws the bar alone, for a table whose columns already carry the gaps.
 */
export function GapBar({ row, unit = 't', figures = true, maxWidth = 240, style }) {
  const c = centsOf(row && row.collected);
  const share = (v) => (c > 0 ? Math.max(0, Math.min(1, centsOf(v) / c)) : 0);
  const paid = share(row && row.paid);
  const invoiced = Math.max(paid, share(row && row.invoiced));
  const g = gapsOf(row);
  return (
    <span data-gap-bar="" style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, width: '100%', ...style }}>
      <span role="img" aria-label={`${GAP_WORDS.toInvoice} ${g.toInvoice} ${unit}, ${GAP_WORDS.toPay} ${g.toPay} ${unit}`}
        style={{ position: 'relative', display: 'block', width: '100%', maxWidth, height: 6, borderRadius: 'var(--radius-max)', background: 'var(--grouped)', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${invoiced * 100}%`, background: 'var(--content-quaternary)' }} />
        <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${paid * 100}%`, background: 'var(--content-accent-brand)' }} />
      </span>
      {figures ? (
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 16px', ...textStyle('body-4', { tone: 'secondary' }), fontVariantNumeric: 'tabular-nums' }}>
          <span data-gap="to-invoice">{GAP_WORDS.toInvoice} <span style={textStyle('body-4', { tabular: true })}>{g.toInvoice} {unit}</span></span>
          <span data-gap="to-pay">{GAP_WORDS.toPay} <span style={textStyle('body-4', { tabular: true })}>{g.toPay} {unit}</span></span>
        </span>
      ) : null}
    </span>
  );
}
