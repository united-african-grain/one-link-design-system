import React from 'react';
import { ReconcileCard } from './ReconcileCard.jsx';
import { thousandths, tonnes } from './RunningSum.jsx';

const PAIRS = [[0, 1], [0, 2], [1, 2]];

/** The three-way check on intake (RL-THREE-WAY, UX-20): ticket net, lines total and offload tally, each pair against
    the tolerance. Returns every pair with its difference and whether it is out, the variance (the largest difference)
    and the outcome: within when every pair agrees within the tolerance, beyond otherwise. */
export function threeWayCheck(values, tolerance = 0) {
  const k = values.map(thousandths);
  const tol = thousandths(tolerance);
  const pairs = PAIRS.map(([a, b]) => { const diff = Math.abs(k[a] - k[b]); return { a, b, diff, out: diff > tol }; });
  const variance = Math.max(...pairs.map((p) => p.diff));
  return { pairs, variance, outcome: pairs.some((p) => p.out) ? 'beyond' : 'within' };
}

/** The Reconcile card for the three figures of an intake (M4.DS.01): each figure, the variance in bold, the
    tolerance, and, when it is beyond, a row naming each pair that is out and by how much ("Ticket net against lines
    total, 0.440 t"). The closing line is the status Within tolerance or Beyond tolerance (UX-20), never a sentence.
    `extra` rows (bags counted, pack weight) sit under the figures. */
export function ThreeWayReconcile({ title = 'Reconcile', figures, tolerance, unit = 't', extra = [], style }) {
  const check = threeWayCheck(figures.map((f) => f.value), tolerance);
  const w = (k) => `${tonnes(k)} ${unit}`;
  const rows = [
    ...figures.map((f) => ({ label: f.label, value: w(thousandths(f.value)) })),
    ...extra,
    { label: 'Variance', value: w(check.variance), strong: true },
    { label: 'Tolerance', value: w(thousandths(tolerance)) },
    ...check.pairs.filter((p) => p.out).map((p) => ({ label: <span data-pair-out="">{figures[p.a].label} against {figures[p.b].label.toLowerCase()}</span>, value: w(p.diff) })),
  ];
  return <ReconcileCard title={title} rows={rows} outcome={check.outcome} style={style} />;
}
