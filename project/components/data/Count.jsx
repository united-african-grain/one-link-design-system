import React from 'react';
import { textStyle } from '../core/Text.jsx';

/** A count in a card header where a board draws one (map UX-07, UX-08): body-4-strong secondary on grouped, a pill at
    least 20px wide. A count says what it counts, or goes (fix list 129): never a bare number beside a page title, and a
    card whose rows are under its heading needs none. The web app's twin is ol-count. */
export function Count({ children, style }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, padding: '0 6px', boxSizing: 'border-box', borderRadius: 'var(--radius-max)', background: 'var(--grouped)', ...textStyle('body-4', { strong: true, tone: 'secondary' }), fontVariantNumeric: 'tabular-nums', flex: 'none', ...style }}>{children}</span>;
}
