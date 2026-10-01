import React from 'react';
import { Icon } from '../core/Icon.jsx';

/**
 * The Restricted state (map UX-09): where a field the viewer's price tier does not allow has to
 * appear on a shared layout, it shows a lock icon with no value and the tooltip "Restricted".
 * Never a dash, a zero or a made-up figure. Otherwise the restricted column is left out.
 */
export function Restricted({ label = 'Restricted', size = 16, style }) {
  return (
    <span role="img" aria-label={label} title={label} style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--content-tertiary)', verticalAlign: 'middle', ...style }}>
      <Icon name="lock" size={size} />
    </span>
  );
}
