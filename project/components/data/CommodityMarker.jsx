import React from 'react';
import { COMMODITY_COLORS } from '../navigation/CommodityTabs.jsx';

/** The commodity marker (map UX-27): a small square in the commodity's colour before its name. */
export function CommodityMarker({ commodity, color, children, style }) {
  const fill = color || COMMODITY_COLORS[commodity] || 'var(--content-quaternary)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...style }}>
      <span aria-hidden style={{ width: 8, height: 8, borderRadius: 'var(--radius-5xs)', background: fill, flex: 'none' }} />
      {children}
    </span>
  );
}
