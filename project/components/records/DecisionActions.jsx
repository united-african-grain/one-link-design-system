import React from 'react';
import { Button } from '../actions/Button.jsx';

const DECISION_VARIANTS = { primary: 'primary', outline: 'outline', critical: 'critical-ghost' };

/** The decision buttons of a record waiting for a decision (M4.DS.01; S08 J4, J5): exactly the outcomes it is given,
    in the order given, as data, so a later card adds an outcome (return, dry, divert) without a redraw. Never a
    hard-coded set. One outcome may be primary; a destructive one (Reject) is red text on an outline (UX-17). The
    outcome being saved shows its working state and the others wait. An outcome with `comment` opens the comment
    dialog (ReasonDialog) before it is saved, which the screen draws. */
export function DecisionActions({ outcomes = [], busy, disabled = false, size = 'small', onDecide }) {
  return (
    <span data-decision="" style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
      {outcomes.map((o) => (
        <Button key={o.value} data-outcome={o.value} size={size} variant={DECISION_VARIANTS[o.variant] || 'outline'}
          loading={busy === o.value} disabled={disabled || (busy != null && busy !== o.value) || !!o.disabled}
          onClick={() => onDecide && onDecide(o)}>{o.label}</Button>
      ))}
    </span>
  );
}
