import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';

/** Filter chip. Unselected = grouped-light; selected = white with border + 3px halo, weight goes strong over 180ms. */
export function Capsule({ selected = false, count, chevron = false, icon, mobile = false, onClick, children, style }) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const bg = selected ? 'var(--elevated)' : hover ? 'color-mix(in srgb, #000000 5%, var(--grouped))' : 'var(--grouped-light)';
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setDown(false); }} onMouseDown={() => setDown(true)} onMouseUp={() => setDown(false)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: mobile ? 36 : 32, padding: '0 12px', borderRadius: 'var(--radius-max)', border: 0, background: bg, cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
        color: selected ? 'var(--content-primary)' : 'var(--content-secondary)', font: 'var(--font-body-3)', fontWeight: selected ? 'var(--weight-strong)' : 'var(--weight-regular)', letterSpacing: 'var(--body-3-tracking)', fontFeatureSettings: 'var(--features-text)', fontVariantNumeric: 'tabular-nums',
        boxShadow: selected ? '0 0 0 1px var(--border), 0 0 0 2px #ffffff, 0 0 0 5px color-mix(in srgb, var(--border) 50%, transparent)' : 'none',
        transform: down ? 'scale(var(--scale-press-button))' : 'scale(1)', transition: 'font-weight var(--dur-capsule) var(--ease-default), background var(--dur-default) var(--ease-default), transform var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default)', ...style }}>
      {icon ? <Icon name={icon} size={14} /> : null}
      <span>{children}</span>
      {count != null ? <span style={{ color: 'var(--content-tertiary)', fontWeight: 'var(--weight-regular)' }}>{count}</span> : null}
      {chevron ? <Icon name="chevron-down" size={14} color="var(--content-tertiary)" /> : null}
    </button>
  );
}

/** A row of capsules with single selection. */
export function CapsuleGroup({ options, value, onChange, mobile = false, style }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', ...style }}>
      {options.map((o) => { const opt = typeof o === 'string' ? { value: o, label: o } : o; return <Capsule key={opt.value} mobile={mobile} count={opt.count} chevron={opt.chevron} selected={opt.value === value} onClick={() => onChange && onChange(opt.value)}>{opt.label}</Capsule>; })}
    </div>
  );
}
