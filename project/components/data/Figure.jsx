import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';

/** KPI figure: body-3 secondary label, condensed value, delta row, derivation line. Click opens a derivation popover when `derivation` rows are given. */
export function Figure({ label, value, unit, size = 'heading-1-condensed', delta, deltaDirection, deltaSuffix, derivation, derivationRows, tone = 'primary', valueColor, align = 'left', style }) {
  const [open, setOpen] = useState(false);
  const dir = deltaDirection || (typeof delta === 'string' && delta.trim().startsWith('-') ? 'down' : 'up');
  const dColor = dir === 'up' ? 'var(--content-accent-up)' : dir === 'down' ? 'var(--content-accent-down)' : 'var(--content-secondary)';
  const clickable = !!(derivationRows && derivationRows.length);
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 4, alignItems: align === 'right' ? 'flex-end' : 'flex-start', textAlign: align, ...style }}>
      {label ? <span style={textStyle('body-3', { tone: 'secondary' })}>{label}</span> : null}
      <button type="button" disabled={!clickable} onClick={() => setOpen((o) => !o)} style={{ border: 0, background: 'transparent', padding: 0, cursor: clickable ? 'pointer' : 'default', display: 'inline-flex', alignItems: 'baseline', gap: 6, color: 'inherit', textAlign: 'inherit',
        borderBottom: clickable ? '1px dotted var(--content-quaternary)' : 0 }}>
        <span style={{ ...textStyle(size, { tabular: true, color: valueColor || (tone === 'primary' ? 'var(--content-primary)' : tone) }), whiteSpace: 'nowrap' }}>{value}</span>
        {unit ? <span style={textStyle('body-3', { tone: 'quaternary' })}>{unit}</span> : null}
      </button>
      {delta != null ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...textStyle('body-4', { strong: true, color: dColor }), fontVariantNumeric: 'tabular-nums' }}>
          <Icon name={dir === 'up' ? 'trending-up' : dir === 'down' ? 'trending-down' : 'minus'} size={12} />{delta}{deltaSuffix ? <span style={textStyle('body-4', { tone: 'tertiary' })}>{deltaSuffix}</span> : null}
        </span>
      ) : null}
      {derivation ? <span style={{ ...textStyle('body-4', { tone: 'tertiary' }), fontVariantNumeric: 'tabular-nums', textWrap: 'pretty' }}>{derivation}</span> : null}
      {open && clickable ? (
        <div role="dialog" style={{ position: 'absolute', top: '100%', left: align === 'right' ? 'auto' : 0, right: align === 'right' ? 0 : 'auto', marginTop: 8, minWidth: 240, background: 'var(--elevated)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-strong)', padding: 16, zIndex: 30, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {derivationRows.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, ...textStyle('body-3', { tone: r.total ? 'primary' : 'secondary', strong: !!r.total }), paddingTop: r.total ? 8 : 0, borderTop: r.total ? '1px solid var(--border-light)' : 0 }}>
              <span>{r.label}</span><span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--content-primary)' }}>{r.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
