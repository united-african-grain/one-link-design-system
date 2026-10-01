import React, { useState } from 'react';
import { Dialog } from './Dialog.jsx';
import { Button } from '../actions/Button.jsx';
import { Field, Input } from '../inputs/Field.jsx';

/** A decision that needs a reason: the high-impact confirmation (map UX-22, S10 A6) and Reject with a mandatory
    comment. 480px. The statement names the change in words; Confirm stays disabled until the reason has `minLength`
    characters, and a too-short reason is a field error once the field is left. Confirm shows its spinner while
    `busy`, and Cancel waits. */
export function ReasonDialog({ open = true, title = 'Confirm high-impact change', children, label = 'Reason', minLength = 10, confirmLabel = 'Confirm', confirmVariant = 'primary', busy = false, defaultReason = '', onCancel, onConfirm, contained = false, sheet = false }) {
  const [reason, setReason] = useState(defaultReason);
  const [left, setLeft] = useState(false);
  const short = reason.trim().length < minLength;
  const error = left && reason.trim().length > 0 && short ? `${label} must be at least ${minLength} characters.` : null;
  return (
    <Dialog open={open} title={title} width={480} contained={contained} sheet={sheet} onClose={busy ? undefined : onCancel}
      footer={<>
        <Button variant="ghost" size="small" disabled={busy} onClick={onCancel}>Cancel</Button>
        <Button variant={confirmVariant} size="small" disabled={short} loading={busy} onClick={() => onConfirm && onConfirm(reason.trim())}>{confirmLabel}</Button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {children ? <span>{children}</span> : null}
        <Field label={label} required error={error}>
          <Input multiline value={reason} invalid={!!error} disabled={busy} onChange={(e) => setReason(e.target.value)} onBlur={() => setLeft(true)} />
        </Field>
      </div>
    </Dialog>
  );
}
