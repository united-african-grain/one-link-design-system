import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { ShareBar } from '../data/ShareBar.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';
import { thousandths, tonnes } from './RunningSum.jsx';

/** Where a load stands against its limit (S14 R5, M4.CAP.01, M4.OUT.03): one boundary for every limit, the order's
    maximum weight with the truck's loading weight, or a vehicle's legal payload. Within below the approach share (a
    setting, 95% by default), Approaching from it, At the limit at exactly the limit (a warning that needs no override),
    Over above it. Weights are compared as thousandths of a tonne and the share as basis points, so 30.000 t is never
    over 30.000 t by a rounding error. */
export function loadState(total, limit, approachShare = 0.95) {
  const t = thousandths(total);
  const l = thousandths(limit);
  if (l <= 0) return 'within';
  if (t > l) return 'over';
  if (t === l) return 'at';
  const bp = Math.round(Number(approachShare) * 10000);
  return t * 10000 >= l * bp ? 'approaching' : 'within';
}

/** How much of the limit is used, in whole per cent: never 100% below the limit, never 100% above it. */
export function loadUsed(total, limit) {
  const t = thousandths(total);
  const l = thousandths(limit);
  if (l <= 0) return '';
  const pct = Math.round((t * 100) / l);
  if (t > l) return `${Math.max(101, pct)}%`;
  if (t === l) return '100%';
  return `${Math.min(99, pct)}%`;
}

/** The words for each state, by the kind of limit. A loading order's limit is its maximum (Over by the excess, where
    Commit is disabled); a delivery note's is the vehicle's legal payload (Over legal payload, which needs an override
    with a reason). Each is an icon and a word (UX-14). */
export const LOAD_MARKS = {
  order: {
    within: { kind: 'clean', word: 'Within maximum' },
    approaching: { kind: 'attention', word: 'Approaching' },
    at: { kind: 'attention', word: 'At maximum' },
    over: { kind: 'breach', word: 'Over' },
  },
  payload: {
    within: { kind: 'clean', word: 'Within payload' },
    approaching: { kind: 'attention', word: 'Approaching' },
    at: { kind: 'attention', word: 'At legal payload' },
    over: { kind: 'breach', word: 'Over legal payload' },
  },
};

/** The load against its limit (M4.DS.02): the running total in tonnes, a bar of how much of the limit it uses, the
    rows the screen gives (maximum order weight, truck, truck loading weight, legal payload), Used, and the state as an
    icon and a word. On an order, Over reads "Over by 0.255 t". The approach share and the limit are inputs, so the
    payload approach setting and the vehicle's payload stay data, never styling. */
export function LoadMeter({ total, limit, approachShare = 0.95, kind = 'order', label = null, rows = [], unit = 't', style }) {
  const state = loadState(total, limit, approachShare);
  const mark = (LOAD_MARKS[kind] || LOAD_MARKS.order)[state];
  const t = thousandths(total);
  const l = thousandths(limit);
  const word = state === 'over' && kind === 'order' ? `Over by ${tonnes(t - l)} ${unit}` : mark.word;
  const bar = state === 'over' ? 'var(--error-strong)' : state === 'within' ? 'var(--content-accent-brand)' : 'var(--warning-strong)';
  const all = [...rows, { label: 'Used', value: loadUsed(total, limit) }];
  return (
    <div data-load-state={state} style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {label ? <span style={textStyle('body-3', { tone: 'secondary' })}>{label}</span> : null}
        <span style={textStyle('heading-2', { strong: true, tabular: true })}>{tonnes(t)} {unit}</span>
      </div>
      <ShareBar share={l > 0 ? Math.min(1, t / l) : 0} color={bar} maxWidth="100%" height={4} />
      <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'max-content minmax(0, 1fr)', rowGap: 8, columnGap: 16 }}>
        {all.map((r, i) => (
          <React.Fragment key={i}>
            <dt style={textStyle('body-3', { tone: 'secondary', strong: !!r.strong })}>{r.label}</dt>
            <dd style={{ margin: 0, textAlign: 'right', overflowWrap: 'anywhere', ...textStyle('body-3', { strong: !!r.strong, tabular: true }) }}>{r.value}</dd>
          </React.Fragment>
        ))}
      </dl>
      <StatusMark kind={mark.kind} label={word} />
    </div>
  );
}
