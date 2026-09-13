import React from 'react';
import { textStyle } from './Text.jsx';

/** Initials avatar (circle) or commodity tile (commodity colour at 16% on white, initials in the colour). */
export function Avatar({ initials = '', size = 28, commodityColor, dimmed = false, style }) {
  const bg = commodityColor ? `color-mix(in oklab, ${commodityColor} var(--commodity-tile-amount), white)` : 'var(--grouped)';
  const fg = commodityColor || 'var(--content-primary)';
  const fontSize = Math.round(size * 0.4);
  return (
    <span style={{ width: size, height: size, borderRadius: 'var(--radius-max)', background: bg, color: fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none', opacity: dimmed ? 0.4 : 1,
      ...textStyle('body-3', { strong: true, color: fg }), fontSize, lineHeight: 1, ...style }}>{initials}</span>
  );
}
