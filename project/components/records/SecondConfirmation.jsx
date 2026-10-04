import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { Button } from '../actions/Button.jsx';
import { Card } from '../data/Card.jsx';
import { ReadinessChip } from './ReadinessChip.jsx';

/** A correction above the threshold waits for a second person. The card names the field and shows, as labelled
    fields, the reading, the value entered and who confirmed first. The person who confirmed first is offered
    Withdraw (which asks for a reason, in the screen's ReasonDialog) and nobody else is; anyone else may confirm. */
export function SecondConfirmation({ field, reading, entered, firstBy, firstAt, viewer, busy = false, onWithdraw, onConfirm, style }) {
  const own = viewer != null && viewer === firstBy;
  const rows = [['Field', field], ['Read from slip', reading], ['Entered', entered], ['Confirmed first by', firstAt ? `${firstBy}, ${firstAt}` : firstBy]];
  return (
    <Card title="Second confirmation" headerRight={<ReadinessChip kind="awaiting-confirmation" />} style={style}>
      <dl data-second-confirmation="" style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
        {rows.map(([label, value]) => (
          <div key={label} data-label={label} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <dt style={textStyle('body-4', { tone: 'secondary' })}>{label}</dt>
            <dd style={{ margin: 0, ...textStyle('body-3', { tabular: true }), overflowWrap: 'anywhere' }}>{value}</dd>
          </div>
        ))}
      </dl>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        {own ? <Button data-action="withdraw" variant="outline" size="small" disabled={busy} onClick={onWithdraw}>Withdraw</Button>
          : <Button data-action="confirm" size="small" loading={busy} onClick={onConfirm}>Confirm weights</Button>}
      </div>
    </Card>
  );
}
