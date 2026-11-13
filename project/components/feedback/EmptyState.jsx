import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { MetaParts } from '../data/Card.jsx';

/** Centred empty state inside a card: a neutral tertiary icon, body-2-strong title, body-3 secondary meta. Empty is never good
    news by default (fix list 129, U4): the green check is drawn only when the caller asks for tone="success", for something
    done and good. */
export function EmptyState({ icon = 'inbox', title = 'Nothing needs your attention', meta, tone = 'neutral', style }) {
  const color = tone === 'success' ? 'var(--success-strong)' : 'var(--content-tertiary)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 4, padding: '32px 16px', ...style }}>
      <Icon name={icon} size={20} color={color} stroke={1.75} style={{ marginBottom: 4 }} />
      <span style={textStyle('body-2', { strong: true })}>{title}</span>
      {meta ? <span style={textStyle('body-3', { tone: 'secondary' })}><MetaParts meta={meta} /></span> : null}
    </div>
  );
}
