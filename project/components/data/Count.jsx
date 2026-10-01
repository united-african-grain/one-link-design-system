import React from 'react';
import { textStyle } from '../core/Text.jsx';

/** A count beside a title or in a card header (map UX-07, UX-08): body-4-strong secondary on grouped, a pill at least
    20px wide. A list or card with nothing to show keeps its count, 0. The web app's twin is ol-count. */
export function Count({ children, style }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, padding: '0 6px', boxSizing: 'border-box', borderRadius: 'var(--radius-max)', background: 'var(--grouped)', ...textStyle('body-4', { strong: true, tone: 'secondary' }), fontVariantNumeric: 'tabular-nums', flex: 'none', ...style }}>{children}</span>;
}
