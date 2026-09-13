import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';

/** Live / stalled / offline indicator. Live = pinging #04af52 dot; stalled = static red dot + strong error text; offline = clock icon. */
export function SyncStatus({ state = 'live', label, style }) {
  const text = label || (state === 'live' ? 'Bridge feed live · batch 2m ago · 14 new' : state === 'stalled' ? 'Bridge feed silent · last batch 3h 12m ago' : 'No signal · 2 waiting to send');
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 28, padding: '0 10px', borderRadius: 'var(--radius-max)', whiteSpace: 'nowrap', ...style }}>
      {state === 'offline' ? <Icon name="clock" size={14} color="var(--content-secondary)" /> : (
        <span style={{ position: 'relative', width: 4, height: 4, flex: 'none' }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: state === 'live' ? 'var(--accent-up-fill)' : 'var(--error-strong)' }} />
          {state === 'live' ? <span className="ol-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent-up-fill)', animation: 'ol-ping var(--dur-ping) ease-out infinite' }} /> : null}
        </span>
      )}
      <span style={textStyle('body-4', { strong: state === 'stalled', color: state === 'stalled' ? 'var(--error-strong)' : 'var(--content-secondary)' })}>{text}</span>
    </span>
  );
}
