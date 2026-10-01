import React, { useEffect, useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { usePrefersReducedMotion } from '../core/Interaction.jsx';
import { Button } from '../actions/Button.jsx';

function CalcRows({ rows }) {
  return (
    <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 8, columnGap: 16 }}>
      {rows.map((r, i) => (
        <React.Fragment key={i}>
          <dt style={textStyle('body-3', { tone: r.strong ? 'primary' : 'secondary', strong: !!r.strong })}>{r.label}</dt>
          <dd style={{ margin: 0, textAlign: 'right', ...textStyle('body-3', { strong: !!r.strong, tabular: true }) }}>{r.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

/**
 * Calculation details (map UX-18): selecting a KPI tile or a figure opens a right-hand side panel
 * over a dimmed page. The figure's name and full value; its components with a bold total; then the
 * basis (exchange rate, rate date, source); and, if any, one button to open the underlying records.
 * It closes with an X. A figure that rests on a setting with no value shows Not set, and the panel
 * names the missing setting and its owner (UX-16).
 */
export function CalculationDetails({ open = true, name, value, components = [], total, basis = [], action, onClose, contained = false, width = 420, style }) {
  const [shown, setShown] = useState(false);
  const reduced = usePrefersReducedMotion();
  useEffect(() => { if (open) { const t = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(t); } setShown(false); }, [open]);
  if (!open) return null;
  const rows = total ? [...components, { label: total.label || 'Total', value: total.value, strong: true }] : components;
  return (
    <div onClick={onClose} style={{ position: contained ? 'absolute' : 'fixed', inset: 0, background: 'var(--overlay)', display: 'flex', justifyContent: 'flex-end', zIndex: 50 }}>
      <aside role="dialog" aria-modal aria-label="Calculation details" onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--elevated)', boxShadow: 'var(--shadow-dialog)', width, maxWidth: '100%', height: '100%', overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 24,
          transform: shown || reduced ? 'none' : 'translateX(100%)', opacity: shown || !reduced ? 1 : 0,
          transition: reduced ? 'opacity var(--dur-default) var(--ease-default)' : 'transform var(--dur-sheet) var(--ease-expand)', ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1, ...textStyle('heading-4', { strong: true }) }}>Calculation details</span>
          <button type="button" aria-label="Close" onClick={onClose} style={{ border: 0, background: 'transparent', width: 32, height: 32, borderRadius: 'var(--radius-max)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--content-secondary)' }}><Icon name="x" size={20} stroke={1.75} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={textStyle('body-3', { tone: 'secondary' })}>{name}</span>
          <span style={{ ...textStyle('heading-2-condensed', { tabular: true }) }}>{value}</span>
        </div>
        {rows.length ? <CalcRows rows={rows} /> : null}
        {basis.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16, boxShadow: 'inset 0 1px 0 var(--border)' }}>
            <span style={textStyle('caption-1-condensed', { tone: 'secondary' })}>Basis</span>
            <CalcRows rows={basis} />
          </div>
        ) : null}
        {action ? <div style={{ marginTop: 'auto' }}><Button variant="outline" fullWidth onClick={action.onClick}>{action.label}</Button></div> : null}
      </aside>
    </div>
  );
}
