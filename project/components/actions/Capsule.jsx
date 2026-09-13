import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { useInteraction } from '../core/Interaction.jsx';

/** Filter chip. Unselected = grouped-light; selected = surface fill, 1px border, 1px surface ring + 3px halo, weight 600, colour eases over 180ms. Keyboard focus shows a 4px ring. */
export function Capsule({ selected = false, count, chevron = false, icon, mobile = false, onClick, children, style }) {
  const { hover, down, focusVisible, handlers } = useInteraction();
  const bg = selected ? 'var(--surface)' : hover ? 'color-mix(in srgb, #000000 5%, var(--grouped))' : 'var(--grouped-light)';
  const ring = focusVisible
    ? '0 0 0 4px color-mix(in srgb, var(--content-primary) 25%, transparent)'
    : selected ? '0 0 0 1px var(--surface), 0 0 0 3px color-mix(in srgb, var(--border) 50%, transparent)' : 'none';
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} {...handlers}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: mobile ? 36 : 32, boxSizing: 'border-box', padding: '0 12px', borderRadius: 'var(--radius-max)', border: `1px solid ${selected ? 'var(--border)' : 'transparent'}`, background: bg, cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
        color: selected ? 'var(--content-primary)' : 'var(--content-secondary)', font: 'var(--font-body-3)', fontWeight: selected ? 'var(--weight-strong-heading)' : 'var(--weight-regular)', letterSpacing: 'var(--body-3-tracking)', fontFeatureSettings: 'var(--features-text)', fontVariantNumeric: 'tabular-nums',
        boxShadow: ring,
        transform: down ? 'scale(var(--scale-press-button))' : 'scale(1)', transition: 'color var(--dur-capsule) ease-in-out, font-weight var(--dur-capsule) ease-in-out, background var(--dur-default) var(--ease-default), transform var(--dur-default) var(--ease-default)', ...style }}>
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
