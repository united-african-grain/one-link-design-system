import React from 'react';
import { StatusMark } from '../feedback/StatusMark.jsx';
import { Dot } from '../data/Card.jsx';
import { textStyle } from '../core/Text.jsx';

/**
 * The connection and sync line every mobile capture screen shows (map UX-31): the connection
 * status, and Pending sync with its count while captures wait to send.
 */
export function CaptureStatus({ online = true, pending = 0, style }) {
  return (
    <span role="status" style={{ display: 'inline-flex', alignItems: 'center', ...style }}>
      <StatusMark kind={online ? 'clean' : 'neutral'} label={online ? 'Online' : 'Offline'} size="body-4" />
      {pending > 0 ? <><Dot /><span style={textStyle('body-4', { strong: true, tone: 'secondary', tabular: true })}>Pending sync ({pending})</span></> : null}
    </span>
  );
}
