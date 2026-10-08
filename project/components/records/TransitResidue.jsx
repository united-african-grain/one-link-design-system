import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { Button } from '../actions/Button.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';

/** What a residue's write-off shows (M4.VIR.03): requested is Pending approval until an approver decides. A write-off
    is shown as Approved only once it is approved; there is no word for "written off" before that. */
export const WRITE_OFF_MARKS = {
  pending: { kind: 'pending', word: 'Pending approval' },
  approved: { kind: 'clean', word: 'Approved' },
  rejected: { kind: 'breach', word: 'Rejected' },
};

/** A transit residue row (M4.DS.01, M4.VIR.03): what a leg lost on the road beyond its allowance, in tonnes, with its
    write-off. Before a write-off is requested it offers Request write-off (with its working state); once requested
    it reads Pending approval, never as done, until it is Approved or Rejected. */
export function TransitResidue({ label = 'Residue', residue, unit = 't', writeOff = 'none', requesting = false, onRequest, style }) {
  const mark = WRITE_OFF_MARKS[writeOff];
  return (
    <div data-transit-residue={writeOff} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px 16px', minWidth: 0, ...style }}>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={textStyle('body-4', { tone: 'secondary' })}>{label}</span>
        <span style={textStyle('body-3', { strong: true, tabular: true })}>{residue} {unit}</span>
      </span>
      {mark ? (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end' }}>
          <span style={textStyle('body-4', { tone: 'secondary' })}>Write-off</span>
          <StatusMark kind={mark.kind} label={mark.word} size="body-4" />
        </span>
      ) : <Button variant="outline" size="small" loading={requesting} onClick={onRequest}>Request write-off</Button>}
    </div>
  );
}
