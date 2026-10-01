import React from 'react';
import { ReasonDialog } from '../feedback/ReasonDialog.jsx';

/** The S57 destructive confirmation for a permanent record: "Reverse [record]? A reversal entry will be created.",
    a required reason, Cancel and Reverse. A permanent record is never edited: reversing adds rows and changes none. */
export function ReverseDialog({ record, open = true, busy = false, onCancel, onConfirm, sheet, contained }) {
  return (
    <ReasonDialog open={open} title={`Reverse ${record}?`} label="Reason" minLength={1} confirmLabel="Reverse" confirmVariant="critical"
      busy={busy} onCancel={onCancel} onConfirm={onConfirm} sheet={sheet} contained={contained}>
      A reversal entry will be created.
    </ReasonDialog>
  );
}
