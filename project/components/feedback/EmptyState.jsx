import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';

/** Centred empty state inside a card: success circle-check, body-2-strong title, body-3 secondary meta. */
export function EmptyState({ icon = 'circle-check', title = 'Nothing needs your attention', meta, tone = 'success', style }) {
  const color = tone === 'success' ? 'var(--success-strong)' : 'var(--content-tertiary)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 4, padding: '32px 16px', ...style }}>
      <Icon name={icon} size={20} color={color} stroke={1.75} style={{ marginBottom: 4 }} />
      <span style={textStyle('body-2', { strong: true })}>{title}</span>
      {meta ? <span style={textStyle('body-3', { tone: 'secondary' })}>{meta}</span> : null}
    </div>
  );
}
