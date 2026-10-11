import React from 'react';
import { StatusMark } from '../feedback/StatusMark.jsx';
import { ReconcileCard } from './ReconcileCard.jsx';
import { thousandths, tonnes } from './RunningSum.jsx';

/** The weighbridge variance on a fertiliser delivery note (S14 R6, M4.CAP.01 AC 11): the weighbridge net against the
    theoretical weight built from pack weights including packaging. Within the allowed variance (a UAG setting, in per
    cent) the note ships; beyond it the note is Variance flagged and Ship waits for Ryan's override with a reason. At
    exactly the allowed variance it is within. The share is compared in exact integers. */
export function weighbridgeVariance(theoretical, net, allowedPct) {
  const t = thousandths(theoretical);
  const n = thousandths(net);
  const diff = n - t;
  const allowedBp = Math.round(Number(allowedPct) * 100);
  const flagged = t > 0 ? Math.abs(diff) * 10000 > t * allowedBp : diff !== 0;
  return { diff, pct: t > 0 ? (Math.abs(diff) * 100) / t : 0, flagged, outcome: flagged ? 'flagged' : 'within' };
}

/** A percentage to one decimal, or two when the allowed variance is below 1% (UX-13). */
export function variancePct(value, allowedPct) {
  return `${Number(value).toFixed(Number(allowedPct) < 1 ? 2 : 1)}%`;
}

/** The Reconcile card for the weighbridge variance (M4.DS.02, ryan__12): Theoretical weight, Weighbridge net, the
    Difference in tonnes and per cent in bold, the Allowed variance, any `extra` rows (Count sheet), then Within
    tolerance, or Variance flagged. Composes ReconcileCard; Ship's refusal sits with the page's actions. */
export function VarianceReconcile({ title = 'Reconcile', theoretical, net, allowedPct = 1, unit = 't', extra = [], style }) {
  const v = weighbridgeVariance(theoretical, net, allowedPct);
  const sign = v.diff > 0 ? '+' : v.diff < 0 ? '-' : '';
  const rows = [
    { label: 'Theoretical weight', value: `${tonnes(thousandths(theoretical))} ${unit}` },
    { label: 'Weighbridge net', value: `${tonnes(thousandths(net))} ${unit}` },
    { label: 'Difference', value: `${sign}${tonnes(Math.abs(v.diff))} ${unit}, ${variancePct(v.pct, allowedPct)}`, strong: true },
    { label: 'Allowed variance', value: variancePct(allowedPct, allowedPct) },
    ...extra,
  ];
  const mark = v.flagged ? <StatusMark kind="attention" label="Variance flagged" /> : null;
  return <ReconcileCard title={title} rows={rows} outcome="within" mark={mark} style={style} />;
}
