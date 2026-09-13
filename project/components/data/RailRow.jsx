import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { useInteraction } from '../core/Interaction.jsx';
import { MetaParts } from './Card.jsx';
import { SeverityTag } from '../feedback/SeverityTag.jsx';

/** "Needs you" / movements row (56–62px). Line 1: body-2-strong subject + right figure/action. Line 2: body-3 secondary context + status. Rows centre their content (min 56px). Hover or keyboard focus fades in a grouped surface inset 2px -10px. A string context is split on " · " into dot-separated parts. */
export function RailRow({ severity, subject, context, right, status, onClick, style }) {
  const { hover, focusVisible, handlers } = useInteraction({ inert: !onClick });
  return (
    <div onClick={onClick} {...handlers} style={{ position: 'relative', display: 'flex', alignItems: 'center', outline: 'none', gap: 10, padding: '10px 0', minHeight: 56, cursor: onClick ? 'pointer' : 'default', ...style }}>
      <span aria-hidden style={{ position: 'absolute', inset: '2px -10px', borderRadius: 'var(--radius-md)', background: 'var(--grouped)', opacity: hover || focusVisible ? 1 : 0, transition: 'opacity var(--dur-default) var(--ease-default)', pointerEvents: 'none' }} />
      {severity ? <SeverityTag level={severity} style={{ position: 'relative' }} /> : null}
      <div style={{ position: 'relative', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ ...textStyle('body-2', { strong: true }), textWrap: 'pretty', fontVariantNumeric: 'tabular-nums' }}>{subject}</span>
        {(context || status) ? <span style={{ display: 'block', ...textStyle('body-3', { tone: 'secondary' }), fontVariantNumeric: 'tabular-nums' }}>{context ? <MetaParts meta={context} /> : null}{status ? <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginLeft: context ? 8 : 0 }}>{status}</span> : null}</span> : null}
      </div>
      {right ? <div style={{ position: 'relative', flex: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>{right}</div> : null}
    </div>
  );
}
