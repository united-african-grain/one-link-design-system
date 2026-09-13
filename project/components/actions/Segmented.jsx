import React from 'react';
import { Icon } from '../core/Icon.jsx';

/** Segmented control: grouped-light track (3px pad, radius 12); selected segment white with shadow minimal, radius 8. */
export function Segmented({ options, value, onChange, fullWidth = false, style }) {
  return (
    <div role="tablist" style={{ display: fullWidth ? 'grid' : 'inline-grid', gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))`, padding: 3, gap: 2, borderRadius: 'var(--radius-sm)', background: 'var(--grouped-light)', ...style }}>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        const sel = opt.value === value;
        return (
          <button key={opt.value} type="button" role="tab" aria-selected={sel} onClick={() => onChange && onChange(opt.value)}
            style={{ height: 30, padding: '0 12px', border: 0, borderRadius: 'var(--radius-2xs)', background: sel ? 'var(--elevated)' : 'transparent', boxShadow: sel ? 'var(--shadow-minimal)' : 'none', cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: sel ? 'var(--content-primary)' : 'var(--content-secondary)', font: sel ? 'var(--font-body-3-strong)' : 'var(--font-body-3)', letterSpacing: 'var(--body-3-tracking)', fontFeatureSettings: 'var(--features-text)', fontVariantNumeric: 'tabular-nums',
              transition: 'background var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default)' }}>
            {opt.icon ? <Icon name={opt.icon} size={14} color={opt.iconColor} /> : null}<span>{opt.label}</span>
            {opt.count != null ? <span style={{ color: 'var(--content-tertiary)', fontWeight: 'var(--weight-regular)' }}>{opt.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
