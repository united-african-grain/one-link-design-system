import React from 'react';
import { Icon } from '../core/Icon.jsx';

/** Planning price / tolerance stepper: 28px, white, shadow minimal, chevrons at the ends, active value strong in brand or commodity colour. */
export function LineStepper({ values, value, onChange, activeColor = 'var(--content-accent-brand)', style }) {
  const i = values.indexOf(value);
  const step = (d) => { const n = Math.min(values.length - 1, Math.max(0, i + d)); if (n !== i && onChange) onChange(values[n]); };
  const arrow = (dir, dis) => (
    <button type="button" aria-label={dir < 0 ? 'Lower' : 'Higher'} disabled={dis} onClick={() => step(dir)} style={{ border: 0, background: 'transparent', padding: 0, width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: dis ? 'default' : 'pointer', color: dis ? 'var(--content-quaternary)' : 'var(--content-secondary)', borderRadius: 'var(--radius-4xs)' }}>
      <Icon name={dir < 0 ? 'chevron-left' : 'chevron-right'} size={16} />
    </button>
  );
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, height: 28, padding: '0 8px', borderRadius: 'var(--radius-xs)', background: 'var(--elevated)', boxShadow: 'var(--shadow-minimal)', ...style }}>
      {arrow(-1, i <= 0)}
      {values.map((v) => (
        <button key={v} type="button" onClick={() => onChange && onChange(v)} style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', font: v === value ? 'var(--font-body-3-strong)' : 'var(--font-body-3)', letterSpacing: 'var(--body-3-tracking)', fontVariantNumeric: 'tabular-nums', color: v === value ? activeColor : 'var(--content-secondary)', transition: 'color var(--dur-default) var(--ease-default)' }}>{v}</button>
      ))}
      {arrow(1, i >= values.length - 1)}
    </div>
  );
}
