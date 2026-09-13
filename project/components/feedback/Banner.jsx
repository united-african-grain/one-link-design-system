import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';

const TONES = {
  info: { bg: 'var(--info-subtle)', fg: 'var(--info-strong)', icon: 'info' },
  success: { bg: 'var(--success-subtle)', fg: 'var(--success-strong)', icon: 'circle-check' },
  warning: { bg: 'var(--warning-subtle)', fg: 'var(--warning-strong)', icon: 'triangle-alert' },
  error: { bg: 'var(--error-subtle)', fg: 'var(--error-strong)', icon: 'circle-alert' },
};

/** Banner: radius 16, 12px 16px padding, body-3, leading 16px icon. Optional trailing action. */
export function Banner({ tone = 'info', icon, title, children, action, style }) {
  const t = TONES[tone] || TONES.info;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 'var(--radius-md)', background: t.bg, color: t.fg, ...style }}>
      <Icon name={icon || t.icon} size={16} />
      <span style={{ flex: 1, minWidth: 0, ...textStyle('body-3', { color: t.fg }), textWrap: 'pretty' }}>{title ? <strong style={{ fontWeight: 'var(--weight-strong)' }}>{title}</strong> : null}{title && children ? ' — ' : null}{children}</span>
      {action ? <span style={{ flex: 'none' }}>{action}</span> : null}
    </div>
  );
}
