import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';

/** Search field: 40px, radius 12, grouped-light; focus turns it white with a border and 4px halo. Shows a "/" keyboard hint. */
export function SearchField({ placeholder = 'Search trades, tickets, counterparties', value, onChange, hint = '/', maxWidth = 400, style, ...rest }) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const bg = focus ? 'var(--elevated)' : hover ? 'color-mix(in srgb, #000000 5%, var(--grouped))' : 'var(--grouped-light)';
  return (
    <label onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 12px', borderRadius: 'var(--radius-sm)', background: bg, width: '100%', maxWidth, boxSizing: 'border-box', cursor: 'text',
      boxShadow: focus ? 'inset 0 0 0 1px var(--border), 0 0 0 4px var(--grouped-light)' : 'none', transition: 'background var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default)', ...style }}>
      <Icon name="search" size={16} color="var(--content-secondary)" />
      <input className="ol-search" type="search" value={value} onChange={onChange} placeholder={placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', color: 'var(--content-primary)', font: 'var(--font-body-3)', letterSpacing: 'var(--body-3-tracking)', fontFeatureSettings: 'var(--features-text)', padding: 0 }} {...rest} />
      <style>{'.ol-search::placeholder{color:color-mix(in srgb, var(--content-primary) 30%, transparent)}'}</style>
      {hint ? <kbd style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, padding: '0 6px', borderRadius: 'var(--radius-4xs)', background: 'var(--hover-overlay-darker)', color: 'var(--content-secondary)', font: 'var(--font-body-4-strong)', letterSpacing: 'var(--body-4-tracking)' }}>{hint}</kbd> : null}
    </label>
  );
}
