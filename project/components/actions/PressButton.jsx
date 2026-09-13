import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';

const KIND = {
  figure: { h: 40, r: 'var(--radius-sm)', minW: 60, px: 12, font: 'var(--font-heading-3-condensed)', cond: true },
  toggle: { h: 48, r: 'var(--radius-sm-h)', minW: 0, px: 16, font: 'var(--font-body-2-strong)' },
  quick:  { h: 32, r: 'var(--radius-xs)', minW: 0, px: 12, font: 'var(--font-body-3-strong)' },
  large:  { h: 48, r: 'var(--radius-sm-h)', minW: 0, px: 20, font: 'var(--font-body-2-strong)', strong: true },
};

/** 3D press button: a face on a 4px edge that sinks on press. Outline (white) or filled (primary / commodity / critical). */
export function PressButton({ kind = 'figure', variant = 'outline', selected = false, commodityColor, loading = false, disabled = false, fullWidth = false, icon, text, onClick, children, style, ...rest }) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const [focus, setFocus] = useState(false);
  const k = KIND[kind] || KIND.figure;
  const inert = disabled || loading;
  const fillMap = { primary: 'var(--buttons-primary)', commodity: commodityColor || 'var(--commodity-maize)', critical: 'var(--buttons-critical)', brand: 'var(--buttons-brand)' };
  const filled = variant !== 'outline' && !disabled;
  const baseFill = filled ? fillMap[variant] : 'var(--elevated)';
  let face = baseFill;
  if (disabled) face = 'var(--grouped-light)';
  else if (hover && !loading) face = filled ? `color-mix(in srgb, #ffffff 10%, ${baseFill})` : `color-mix(in srgb, #000000 5%, ${baseFill})`;
  const edge = disabled ? 'transparent' : filled ? `color-mix(in srgb, #000000 15%, ${baseFill})` : 'var(--border-light)';
  const fg = disabled ? 'var(--content-tertiary)' : filled ? 'var(--buttons-label)' : 'var(--content-primary)';
  const pressed = down && !inert;
  const ringColor = filled ? baseFill : 'var(--buttons-primary)';
  const label = text != null ? text : children;
  return (
    <button type="button" disabled={disabled} aria-pressed={selected || undefined} aria-busy={loading || undefined} onClick={inert ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setDown(false); }}
      onMouseDown={() => !inert && setDown(true)} onMouseUp={() => setDown(false)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ position: 'relative', display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : undefined, minWidth: k.minW || undefined, height: k.h, padding: '0 0 4px', boxSizing: 'border-box', border: 0, background: edge, borderRadius: k.r, cursor: inert ? (loading ? 'progress' : 'not-allowed') : 'pointer', outline: 'none', userSelect: 'none', color: fg,
        boxShadow: [kind === 'large' && !disabled ? 'var(--shadow-strong)' : null, focus && !inert ? `0 0 0 4px color-mix(in srgb, ${ringColor} 25%, transparent)` : null, selected && !filled ? '0 0 0 1px var(--border)' : null].filter(Boolean).join(', ') || 'none', ...style }} {...rest}>
      <span style={{ position: 'relative', display: 'flex', width: '100%', height: k.h - 4, boxSizing: 'border-box', borderRadius: k.r, background: face, boxShadow: !filled && !disabled ? 'inset 0 0 0 1px var(--border-light)' : 'none',
        alignItems: 'center', justifyContent: 'center', gap: 4, padding: `0 ${k.px}px`, font: k.font, letterSpacing: k.cond ? 'var(--heading-3-condensed-tracking)' : 'var(--body-3-tracking)',
        fontStretch: k.cond ? '75%' : undefined, textTransform: k.cond ? 'uppercase' : undefined, fontFeatureSettings: k.cond ? 'var(--features-condensed-display)' : 'var(--features-text)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
        transform: pressed ? 'translateY(4px)' : 'translateY(0)', transition: `transform ${pressed ? 'var(--dur-press-down)' : 'var(--dur-press-up)'} var(--ease-default), background var(--dur-default) var(--ease-default)` }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, opacity: loading ? 0 : 1, transform: loading ? 'scale(.8)' : 'scale(1)', transition: 'opacity var(--dur-swap) var(--ease-spring), transform var(--dur-swap) var(--ease-spring)' }}>
          {icon ? <Icon name={icon} size={20} stroke={1.75} /> : null}{label != null ? <span>{label}</span> : null}
        </span>
        <span aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading ? 1 : 0, transform: loading ? 'scale(1)' : 'scale(.8)', transition: 'opacity var(--dur-swap) var(--ease-spring), transform var(--dur-swap) var(--ease-spring)', pointerEvents: 'none' }}>
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
