import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';

const SIZES = {
  xsmall: { h: 32, r: 'var(--radius-xs)', px: 12, font: 'var(--font-body-3-strong)', ls: 'var(--body-3-tracking)' },
  small:  { h: 36, r: 'var(--radius-max)', px: 14, font: 'var(--font-body-3-strong)', ls: 'var(--body-3-tracking)' },
  medium: { h: 40, r: 'var(--radius-sm)', px: 16, font: 'var(--font-body-3-strong)', ls: 'var(--body-3-tracking)' },
  large:  { h: 48, r: 'var(--radius-sm-h)', px: 20, font: 'var(--font-body-2-strong)', ls: 'var(--body-2-tracking)' },
};

function fills(variant, commodityColor) {
  switch (variant) {
    case 'brand': return { bg: 'var(--buttons-brand)', fg: 'var(--buttons-label)', filled: true };
    case 'primary': return { bg: 'var(--buttons-primary)', fg: 'var(--buttons-label)', filled: true };
    case 'critical': return { bg: 'var(--buttons-critical)', fg: 'var(--buttons-label)', filled: true };
    case 'critical-ghost': return { bg: 'transparent', fg: 'var(--buttons-critical)', filled: false, ring: 'var(--buttons-critical)' };
    case 'commodity': return { bg: commodityColor || 'var(--commodity-maize)', fg: 'var(--buttons-label)', filled: true };
    case 'outline': return { bg: 'var(--elevated)', fg: 'var(--content-primary)', filled: false, outline: true, ring: 'var(--buttons-primary)' };
    case 'subtle': return { bg: 'var(--hover-overlay-darker)', fg: 'var(--content-tertiary)', filled: false, ring: 'var(--buttons-primary)' };
    default: return { bg: 'transparent', fg: 'var(--content-primary)', filled: false, ring: 'var(--buttons-primary)' };
  }
}

/** Button. Every button that starts work must take loading={true} until the work lands. */
export function Button({ variant = 'primary', size = 'medium', icon, iconRight, loading = false, disabled = false, fullWidth = false, commodityColor, onClick, children, style, type = 'button', ...rest }) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const [focus, setFocus] = useState(false);
  const s = SIZES[size] || SIZES.medium;
  const f = fills(variant, commodityColor);
  const inert = disabled || loading;
  let bg = f.bg;
  if (disabled) bg = 'var(--grouped-light)';
  else if (hover && !loading) bg = f.filled ? `color-mix(in srgb, #ffffff 10%, ${f.bg})` : (f.bg === 'transparent' ? 'var(--hover-overlay-darker)' : `color-mix(in srgb, #000000 5%, ${f.bg})`);
  const fg = disabled ? 'var(--content-tertiary)' : f.fg;
  const ringColor = f.filled ? f.bg : (f.ring || 'var(--buttons-primary)');
  const shadow = [f.outline && !disabled ? 'inset 0 0 0 1px var(--border-light)' : null, focus && !inert ? `0 0 0 4px color-mix(in srgb, ${ringColor} 25%, transparent)` : null].filter(Boolean).join(', ') || 'none';
  const iconSize = 20;
  return (
    <button type={type} disabled={disabled} aria-busy={loading || undefined} onClick={inert ? undefined : onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setDown(false); }}
      onMouseDown={() => !inert && setDown(true)} onMouseUp={() => setDown(false)}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{ position: 'relative', display: fullWidth ? 'flex' : 'inline-flex', width: fullWidth ? '100%' : undefined, alignItems: 'center', justifyContent: 'center', gap: 4,
        height: s.h, padding: `0 ${s.px}px`, borderRadius: s.r, border: 0, background: bg, color: fg, font: s.font, letterSpacing: s.ls, fontFeatureSettings: 'var(--features-text)',
        cursor: inert ? (loading ? 'progress' : 'not-allowed') : 'pointer', outline: 'none', boxShadow: shadow, whiteSpace: 'nowrap', userSelect: 'none',
        transform: down && !inert ? 'scale(var(--scale-press-button))' : 'scale(1)', transition: 'background var(--dur-default) var(--ease-default), transform var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default)', ...style }} {...rest}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, opacity: loading ? 0 : 1, transform: loading ? 'scale(.8)' : 'scale(1)', transition: 'opacity var(--dur-swap) var(--ease-spring), transform var(--dur-swap) var(--ease-spring)' }}>
        {icon ? <Icon name={icon} size={iconSize} stroke={1.75} /> : null}
        {children ? <span>{children}</span> : null}
        {iconRight ? <Icon name={iconRight} size={iconSize} stroke={1.75} /> : null}
      </span>
      <span aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading ? 1 : 0, transform: loading ? 'scale(1)' : 'scale(.8)', transition: 'opacity var(--dur-swap) var(--ease-spring), transform var(--dur-swap) var(--ease-spring)', pointerEvents: 'none' }}>
        <Icon name="loader-circle" size={20} stroke={1.75} spin={loading} />
      </span>
    </button>
  );
}
