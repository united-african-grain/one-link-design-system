import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { useInteraction } from '../core/Interaction.jsx';

/** One segment. `font` is set once and never swapped; only colour/background change, so tabular figures and features survive re-renders. */
function SegmentedItem({ opt, sel, onSelect }) {
  const { hover, focusVisible, handlers } = useInteraction();
  const shadow = [sel ? 'var(--shadow-minimal)' : null, focusVisible ? '0 0 0 3px color-mix(in srgb, var(--content-primary) 25%, transparent)' : null].filter(Boolean).join(', ') || 'none';
  return (
    <button type="button" role="tab" aria-selected={sel} onClick={onSelect} {...handlers}
      style={{ height: 30, padding: '0 12px', border: 0, borderRadius: 'var(--radius-2xs)', background: sel ? 'var(--elevated)' : 'transparent', boxShadow: shadow, cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: sel || hover ? 'var(--content-primary)' : 'var(--content-secondary)',
        font: 'var(--font-body-3)', letterSpacing: 'var(--body-3-tracking)', fontFeatureSettings: 'var(--features-text)', fontVariantNumeric: 'tabular-nums',
        transition: 'background var(--dur-default) var(--ease-default), color var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default)' }}>
      {opt.icon ? <Icon name={opt.icon} size={14} color={opt.iconColor} /> : null}<span>{opt.label}</span>
      {opt.count != null ? <span style={{ color: 'var(--content-tertiary)' }}>{opt.count}</span> : null}
    </button>
  );
}

/** Segmented control: grouped-light track (3px pad, 3px gap, radius 12); selected segment white with shadow minimal, radius 8. Labels keep their weight when selected. */
export function Segmented({ options, value, onChange, fullWidth = false, style }) {
  return (
    <div role="tablist" style={{ display: fullWidth ? 'grid' : 'inline-grid', gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))`, padding: 3, gap: 3, borderRadius: 'var(--radius-sm)', background: 'var(--grouped-light)', ...style }}>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        return <SegmentedItem key={opt.value} opt={opt} sel={opt.value === value} onSelect={() => onChange && onChange(opt.value)} />;
      })}
    </div>
  );
}
