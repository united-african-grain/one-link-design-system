import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { useInteraction, usePrefersReducedMotion } from '../core/Interaction.jsx';

const KIND = {
  /* outcome-style figure button: 60px wide, body-3-strong tabular, no side padding (the reference outcome button) */
  figure: { h: 40, r: 'var(--radius-sm)', minW: 60, px: 0, font: 'var(--font-body-3-strong)', ls: 'var(--body-3-tracking)' },
  toggle: { h: 48, r: 'var(--radius-sm-h)', minW: 0, px: 16, font: 'var(--font-body-2-strong)', ls: 'var(--body-2-tracking)' },
  quick:  { h: 32, r: 'var(--radius-xs)', minW: 0, px: 10, font: 'var(--font-body-3-strong)', ls: 'var(--body-3-tracking)' },
  large:  { h: 48, r: 'var(--radius-sm-h)', minW: 0, px: 20, font: 'var(--font-body-2-strong)', ls: 'var(--body-2-tracking)', strong: true },
};

/** 3D press button: a face on a 4px edge that sinks on press. Outline (white) or filled (primary / commodity / critical).
    kind="figure" matches the reference outcome button (60px, body-3-strong); pass condensed for a heading-3-condensed figure. */
export function PressButton({ kind = 'figure', variant = 'outline', selected = false, condensed = false, commodityColor, loading = false, disabled = false, fullWidth = false, icon, text, onClick, children, style, ...rest }) {
  const k = KIND[kind] || KIND.figure;
  const inert = disabled || loading;
  const { hover, down, focusVisible, handlers } = useInteraction({ inert });
  const reduced = usePrefersReducedMotion();
  const fillMap = { primary: 'var(--buttons-primary)', commodity: commodityColor || 'var(--commodity-maize)', critical: 'var(--buttons-critical)', brand: 'var(--buttons-brand)' };
  const filled = variant !== 'outline' && !disabled;
  const baseFill = filled ? fillMap[variant] : 'var(--elevated)';
  let face = baseFill;
  if (disabled) face = 'var(--grouped-light)';
  else if (hover && !loading) face = filled ? `color-mix(in srgb, #ffffff 10%, ${baseFill})` : `color-mix(in srgb, #000000 5%, ${baseFill})`;
  const edge = disabled ? 'transparent' : filled ? `color-mix(in srgb, #000000 15%, ${baseFill})` : 'var(--border-light)';
  const fg = disabled ? 'var(--content-tertiary)' : filled ? 'var(--buttons-label)' : 'var(--content-primary)';
  const pressed = down && !reduced;
  const ringColor = filled ? baseFill : 'var(--buttons-primary)';
  const label = text != null ? text : children;
  const cond = condensed;
  const px = cond && kind === 'figure' ? 12 : k.px;
  const swap = (on) => ({ opacity: on ? 1 : 0, transform: reduced || on ? 'scale(1)' : 'scale(.8)', transition: reduced ? 'opacity var(--dur-default) var(--ease-default)' : 'opacity var(--dur-swap) var(--ease-spring), transform var(--dur-swap) var(--ease-spring)' });
  return (
    <button type="button" disabled={disabled} aria-pressed={selected || undefined} aria-busy={loading || undefined} onClick={inert ? undefined : onClick}
      {...handlers}
      style={{ position: 'relative', display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : undefined, minWidth: k.minW || undefined, height: k.h, padding: '0 0 4px', boxSizing: 'border-box', border: 0, background: edge, borderRadius: k.r, cursor: inert ? (loading ? 'progress' : 'not-allowed') : 'pointer', outline: 'none', userSelect: 'none', color: fg,
        boxShadow: [!filled && !disabled ? 'inset 0 0 0 1px var(--border-light)' : null, kind === 'large' && !disabled ? 'var(--shadow-strong)' : null, focusVisible && !inert ? `0 0 0 4px color-mix(in srgb, ${ringColor} 25%, transparent)` : null, selected && !filled ? '0 0 0 1px var(--border)' : null].filter(Boolean).join(', ') || 'none', ...style }} {...rest}>
      <span style={{ position: 'relative', display: 'flex', width: '100%', height: k.h - 4, boxSizing: 'border-box', borderRadius: k.r, background: face, boxShadow: !filled && !disabled ? 'inset 0 0 0 1px var(--border-light)' : 'none',
        alignItems: 'center', justifyContent: 'center', gap: 4, paddingInline: px, font: cond ? 'var(--font-heading-3-condensed)' : k.font, letterSpacing: cond ? 'var(--heading-3-condensed-tracking)' : k.ls,
        fontStretch: cond ? '75%' : undefined, textTransform: cond ? 'uppercase' : undefined, fontFeatureSettings: cond ? 'var(--features-condensed-display)' : 'var(--features-text)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
        transform: pressed ? 'translateY(4px)' : 'translateY(0)',
        transition: reduced ? 'background var(--dur-default) var(--ease-default)' : `transform ${pressed ? 'var(--dur-press-down)' : 'var(--dur-press-up)'} ease-in-out, background var(--dur-default) var(--ease-default)` }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: kind === 'figure' && !cond ? '0 8px' : undefined, ...swap(!loading) }}>
          {icon ? <Icon name={icon} size={20} stroke={1.75} /> : null}{label != null ? <span>{label}</span> : null}
        </span>
        <span aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...swap(loading), pointerEvents: 'none' }}>
          <Icon name="loader-circle" size={20} stroke={1.75} spin={loading} />
        </span>
      </span>
    </button>
  );
}

/** Two-up 48px toggle (Sell / Buy, Confirm / Dispute). The selected side is filled. */
export function PressToggle({ options, value, onChange, selectedVariant = 'primary', commodityColor, disabled = false, style }) {
  return (
    <div role="radiogroup" style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))`, gap: 8, ...style }}>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        const sel = opt.value === value;
        return <PressButton key={opt.value} kind="toggle" fullWidth selected={sel} disabled={disabled} variant={sel ? selectedVariant : 'outline'} commodityColor={opt.color || commodityColor} icon={opt.icon} onClick={() => onChange && onChange(opt.value)}>{opt.label}</PressButton>;
      })}
    </div>
  );
}
