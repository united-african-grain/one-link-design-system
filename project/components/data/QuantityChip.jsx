import React from 'react';
import { textStyle } from '../core/Text.jsx';

/** Quantity chip: 28px, min 32px, 4px side padding, radius 8, white, shadow middle, body-3-strong tabular. */
export function QuantityChip({ children, dimmed = false, tone = 'primary', style }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 28, minWidth: 32, paddingInline: 4, borderRadius: 'var(--radius-2xs)', background: dimmed ? 'var(--grouped-light)' : 'var(--elevated)', boxShadow: dimmed ? 'none' : 'var(--shadow-middle)', whiteSpace: 'nowrap', ...textStyle('body-3', { strong: true, tabular: true, tone: dimmed ? 'tertiary' : tone }), ...style }}>{children}</span>;
}
