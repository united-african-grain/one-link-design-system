import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';

/** Live / stalled / offline indicator. Live = 4px #04af52 dot pinging inside a 12px box; stalled = static red dot + strong error text; offline = clock icon.
    compact hides the words (they stay as the accessible label). */
export function SyncStatus({ state = 'live', label, compact = false, style }) {
  const text = label || (state === 'live' ? 'Bridge feed live · batch 2m ago · 14 new' : state === 'stalled' ? 'Bridge feed silent · last batch 3h 12m ago' : 'No signal · 2 waiting to send');
  const dot = state === 'live' ? 'var(--accent-up-fill)' : 'var(--error-strong)';
  return (
    <span role="status" aria-label={compact ? text : undefined} title={compact ? text : undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 28, padding: '0 10px', borderRadius: 'var(--radius-max)', whiteSpace: 'nowrap', ...style }}>
      {state === 'offline' ? <Icon name="clock" size={14} color="var(--content-secondary)" /> : (
        <span aria-hidden style={{ display: 'grid', placeItems: 'center', width: 12, height: 12, flex: 'none' }}>
          <span style={{ gridArea: '1 / 1', width: 4, height: 4, borderRadius: '50%', background: dot }} />
          {state === 'live' ? <span className="ol-ping" style={{ gridArea: '1 / 1', width: 4, height: 4, borderRadius: '50%', background: dot, animation: 'ol-ping var(--dur-ping) ease-out infinite' }} /> : null}
        </span>
      )}
      {compact ? null : <span style={textStyle('body-4', { strong: state === 'stalled', color: state === 'stalled' ? 'var(--error-strong)' : 'var(--content-secondary)' })}>{text}</span>}
    </span>
  );
}
