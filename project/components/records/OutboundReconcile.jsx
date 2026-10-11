import React from 'react';
import { ReconcileCard } from './ReconcileCard.jsx';
import { thousandths, tonnes } from './RunningSum.jsx';

/** The outbound check on a delivery note (S12 C4, UX-20): ordered, loaded and ticket net. Only loaded against the
    ticket net is a tolerance (80 kg on a grain pair, 0 bagged): beyond it, Ship waits. Ordered against loaded is shown,
    named when they differ, and never fails the check: a note loaded under its order is Below plan on the order, and a
    net above the order is a free stock question, not a tolerance (M4.OUT.07). */
export function outboundCheck({ ordered, loaded, net, tolerance = 0 }) {
  const o = thousandths(ordered);
  const l = thousandths(loaded);
  const n = thousandths(net);
  const variance = Math.abs(l - n);
  const out = variance > thousandths(tolerance);
  return { variance, out, plan: o - l, outcome: out ? 'beyond' : 'within' };
}

/** The Reconcile card of a delivery note (M4.DS.02): Ordered, Loaded and Ticket net side by side, the variance in
    bold, the tolerance, and, when a pair is out, a row naming it and by how much ("Loaded against ticket net, 0.180 t";
    "Ordered against loaded, 2.000 t"). The closing line is Within tolerance or Beyond tolerance (UX-20). `extra` rows
    (legal payload, payload used) sit under the figures. Composes ReconcileCard. */
export function OutboundReconcile({ title = 'Reconcile', ordered, loaded, net, tolerance = 0, unit = 't', extra = [], style }) {
  const c = outboundCheck({ ordered, loaded, net, tolerance });
  const w = (k) => `${tonnes(k)} ${unit}`;
  const rows = [
    { label: 'Ordered', value: w(thousandths(ordered)) },
    { label: 'Loaded', value: w(thousandths(loaded)) },
    { label: 'Ticket net', value: w(thousandths(net)) },
    ...extra,
    { label: 'Variance', value: w(c.variance), strong: true },
    { label: 'Tolerance', value: w(thousandths(tolerance)) },
    ...(c.out ? [{ label: <span data-pair-out="">Loaded against ticket net</span>, value: w(c.variance) }] : []),
    ...(c.plan !== 0 ? [{ label: <span data-pair-out="">Ordered against loaded</span>, value: w(Math.abs(c.plan)) }] : []),
  ];
  return <ReconcileCard title={title} rows={rows} outcome={c.outcome} style={style} />;
}
