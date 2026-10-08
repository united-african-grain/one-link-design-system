import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { ShareBar } from '../data/ShareBar.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';

/** A weight as thousandths of a tonne, so a sum and a difference are exact: "32.140" is 32140. */
export function thousandths(t) {
  const n = parseFloat(String(t == null ? '' : t).replace(/,/g, ''));
  return Number.isFinite(n) ? Math.round(n * 1000) : 0;
}

/** Thousandths back to tonnes with three decimals (UX-12): 440 is "0.440". */
export function tonnes(k) {
  const sign = k < 0 ? '-' : '';
  const a = Math.abs(k);
  return `${sign}${Math.floor(a / 1000).toLocaleString('en-GB')}.${String(a % 1000).padStart(3, '0')}`;
}

/** Where a running sum stands against its target: exact, within the tolerance, or beyond it. */
export function runningSumState(total, target, tolerance = 0) {
  const d = Math.abs(thousandths(total) - thousandths(target));
  if (d === 0) return 'exact';
  return d <= thousandths(tolerance) ? 'within' : 'beyond';
}

export const RUNNING_SUM_MARKS = {
  exact: { kind: 'clean', word: 'Exact' },
  within: { kind: 'clean', word: 'Within tolerance' },
  beyond: { kind: 'attention', word: 'Beyond tolerance' },
};

/** The running sum of a goods received note's lines against the ticket net (M4.DS.01, UX-20): the lines total and its
    target in tonnes, a bar of how much of the target the lines cover, the difference, and the state as an icon and a
    word: Exact, Within tolerance or Beyond tolerance. The lines are what the clerk adds; the target is never typed. */
export function RunningSum({ label = 'Lines total', total, target, targetLabel = 'Ticket net', tolerance = 0, unit = 't', style }) {
  const state = runningSumState(total, target, tolerance);
  const mark = RUNNING_SUM_MARKS[state];
  const t = thousandths(total);
  const g = thousandths(target);
  const share = g > 0 ? Math.min(1, t / g) : 0;
  return (
    <div data-running-sum={state} style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0, ...style }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 12px' }}>
        <span style={textStyle('body-3', { tone: 'secondary' })}>{label}</span>
        <span style={textStyle('body-3', { strong: true, tabular: true })}>{tonnes(t)} {unit} of {tonnes(g)} {unit} {targetLabel.toLowerCase()}</span>
      </div>
      <ShareBar share={share} color="var(--content-primary)" maxWidth="100%" height={4} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px 12px' }}>
        <StatusMark kind={mark.kind} label={mark.word} size="body-4" />
        {state === 'exact' ? null : <span style={textStyle('body-4', { tone: 'secondary', tabular: true })}>Difference {tonnes(Math.abs(t - g))} {unit}</span>}
      </div>
    </div>
  );
}
