import React from 'react';
import { textStyle } from './Text.jsx';

/** One Link mark + wordmark with the BETA badge. No logo file was supplied; the mark is a typographic placeholder.
    Set showBeta={false} to drop the badge. markOnly keeps the mark alone, for the collapsed sidebar's brand row:
    the mark then carries the product name itself, so the row is still named for a screen reader. */
export function Logo({ product = 'One Link', showBeta = true, size = 'md', markOnly = false, style }) {
  const h = size === 'sm' ? 24 : 28;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...style }}>
      <span aria-hidden={markOnly ? undefined : true} role={markOnly ? 'img' : undefined} aria-label={markOnly ? product : undefined}
        style={{ width: h, height: h, flex: 'none', borderRadius: 'var(--radius-2xs)', background: 'var(--buttons-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...textStyle('caption-2-condensed', { color: 'white' }) }}>OL</span>
      {markOnly ? null : <span style={{ ...textStyle('heading-4', { strong: true }) }}>{product}</span>}
      {showBeta && !markOnly ? (
        <span style={{ ...textStyle('caption-2-condensed', { color: 'var(--beta-label)' }), background: 'var(--beta-fill)', borderRadius: 'var(--radius-4xs)', padding: '3px 5px 2px', lineHeight: '11px' }}>Beta</span>
      ) : null}
    </span>
  );
}
