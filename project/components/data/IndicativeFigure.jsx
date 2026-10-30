import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { RefCell } from './DataTable.jsx';
import { Restricted } from './Restricted.jsx';
import { NotSet } from '../feedback/NotSet.jsx';

/** The words an indicative figure always carries (M7.DS.02 AC 4, RL-NOT-VALUATION). They are the one copy module for
    indicative wording: screens import them and never retype them. No field is ever named valuation or month-end value. */
export const INDICATIVE_LABEL = 'Indicative, not a valuation';
export const INDICATIVE_NAME = 'Indicative cost';
/** What the weighted-average cost rests on (Map D-17, RL-WA-ROLLUP): each lot's own purchase contract cost. */
export const INDICATIVE_BASIS = 'The purchase contract cost of each lot, converted to US dollars at the rate in force on the lot\'s own date';

/** A figure's name, always starting with Indicative: "Weighted average cost" reads "Indicative weighted average cost". */
export function indicativeName(name = INDICATIVE_NAME) {
  const n = String(name || INDICATIVE_NAME);
  return /^indicative\b/i.test(n) ? n : `Indicative ${n.charAt(0).toLowerCase()}${n.slice(1)}`;
}

/** The Calculation details an indicative figure opens (UX-18): its name and value, its components with a bold total,
    then the basis, which always names the purchase contract cost as the basis, the cost categories it leaves out and
    the exchange rate with its date. A missing rate is Not set with its owner, never an earlier rate passed off as the
    day's (Map D-40). */
export function indicativeCalc({ name, value, components = [], total, leavesOut = [], rate, rateDate, source = 'Finance, Exchange rates', rateOwner = 'Finance' } = {}) {
  return {
    name: indicativeName(name),
    value: value == null || value === '' ? <NotSet owner={rateOwner} /> : value,
    components,
    total,
    basis: [
      { label: 'Label', value: INDICATIVE_LABEL },
      { label: 'Basis', value: INDICATIVE_BASIS },
      { label: 'Leaves out', value: leavesOut.length ? leavesOut.join(', ') : 'Every cost tagged to the trade' },
      { label: 'Exchange rate', value: rate || <NotSet owner={rateOwner} /> },
      { label: 'Rate as at', value: rate ? rateDate : '' },
      { label: 'Source', value: source },
    ].filter((r) => r.value !== ''),
  };
}

/**
 * Indicative figure (M7.DS.02): a figure that is indicative only, such as the weighted-average cost of stock. It is
 * always named Indicative and always carries the label "Indicative, not a valuation"; neither can be switched off, so
 * there is no prop for them. The value is the blue figure that opens Calculation details (`indicativeCalc`), which
 * names the purchase contract cost of each lot as the basis, the cost categories it leaves out and the exchange rate
 * with its date. A viewer without the contract tier sees the Restricted lock in the value's place; a figure with no
 * rate is Not set, never a zero.
 *
 * `variant="figure"` (default) stacks the name, the value and the label; `variant="inline"` draws the value with the
 * word Indicative after it, for a table cell whose header already names the figure.
 */
export function IndicativeFigure({ name = INDICATIVE_NAME, value, onOpen, restricted = false, notSet = false, owner = 'Finance', variant = 'figure', size = 'heading-3-condensed', style }) {
  const figure = restricted ? <Restricted /> : notSet ? <NotSet owner={owner} size={variant === 'inline' ? 'body-4' : 'body-3'} />
    : onOpen ? <RefCell onOpen={onOpen}>{value}</RefCell> : <span style={textStyle('body-3', { tabular: true })}>{value}</span>;
  if (variant === 'inline') {
    return (
      <span data-indicative="" style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap', ...style }}>
        {figure}
        <span title={INDICATIVE_LABEL} aria-label={INDICATIVE_LABEL} style={textStyle('body-4', { tone: 'tertiary' })}>Indicative</span>
      </span>
    );
  }
  return (
    <span data-indicative="" style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, ...style }}>
      <span style={textStyle('body-3', { tone: 'secondary' })}>{indicativeName(name)}</span>
      <span style={{ ...textStyle(size, { tabular: true }), display: 'inline-flex', alignItems: 'center', minHeight: 28 }}>
        {restricted || notSet ? figure : onOpen ? <RefCell onOpen={onOpen}>{value}</RefCell> : value}
      </span>
      <span style={textStyle('body-4', { tone: 'tertiary' })}>{INDICATIVE_LABEL}</span>
    </span>
  );
}
