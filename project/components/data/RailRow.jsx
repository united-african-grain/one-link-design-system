import React, { useState } from 'react';
import { textStyle } from '../core/Text.jsx';
import { SeverityTag } from '../feedback/SeverityTag.jsx';

/** "Needs you" / movements row (56–62px). Line 1: body-2-strong subject + right figure/action. Line 2: body-3 secondary context + status. Hover fades in a grouped surface extending 10px past the column. */
export function RailRow({ severity, subject, context, right, status, onClick, style }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', minHeight: 56, cursor: onClick ? 'pointer' : 'default', ...style }}>
      <span aria-hidden style={{ position: 'absolute', inset: '0 -10px', borderRadius: 'var(--radius-md)', background: 'var(--grouped)', opacity: hover ? 1 : 0, transition: 'opacity var(--dur-default) var(--ease-default)', pointerEvents: 'none' }} />
      {severity ? <SeverityTag level={severity} style={{ position: 'relative', marginTop: 1 }} /> : null}
      <div style={{ position: 'relative', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ ...textStyle('body-2', { strong: true }), textWrap: 'pretty', fontVariantNumeric: 'tabular-nums' }}>{subject}</span>
        {(context || status) ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', ...textStyle('body-3', { tone: 'secondary' }), fontVariantNumeric: 'tabular-nums' }}>{context}{status}</span> : null}
      </div>
      {right ? <div style={{ position: 'relative', flex: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>{right}</div> : null}
    </div>
  );
}
