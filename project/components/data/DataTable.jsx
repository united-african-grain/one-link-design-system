import React, { useRef, useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { Button } from '../actions/Button.jsx';
import { useElementWidth } from '../core/Interaction.jsx';
import { Dot, MetaParts } from './Card.jsx';

/** Restricted cell: a content-quaternary dash plus a 12px eye-off. Never looks like zero, blank or loading. */
export function RestrictedCell({ tooltip = 'Not available to Stock Control' }) {
  return <span title={tooltip} aria-label={tooltip} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--content-quaternary)', justifyContent: 'flex-end' }}><span aria-hidden>—</span><Icon name="eye-off" size={12} /></span>;
}

/** Derived cell: dotted underline that opens a derivation popover. */
export function DerivedCell({ children, rows = [] }) {
  const [open, setOpen] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', font: 'inherit', letterSpacing: 'inherit', color: 'inherit', borderBottom: '1px dotted var(--content-quaternary)', fontVariantNumeric: 'tabular-nums' }}>{children}</button>
      {open ? (
        <span style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, minWidth: 220, background: 'var(--elevated)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-strong)', padding: 16, zIndex: 30, display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
          {rows.map((r, i) => <span key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, ...textStyle('body-3', { tone: r.total ? 'primary' : 'secondary', strong: !!r.total }), paddingTop: r.total ? 8 : 0, borderTop: r.total ? '1px solid var(--border-light)' : 0 }}><span>{r.label}</span><span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--content-primary)' }}>{r.value}</span></span>)}
        </span>
      ) : null}
    </span>
  );
}

/** Ref link cell: body-3-strong brand. */
export function RefCell({ children, href = '#' }) { return <a href={href} onClick={(e) => e.preventDefault()} style={{ ...textStyle('body-3', { strong: true, tone: 'brand' }), fontVariantNumeric: 'tabular-nums', textDecoration: 'none' }}>{children}</a>; }

/** Dense register. columns: [{key, label, align, width, render}]. rows: objects; row.correction = {reason, actor, time} adds a compensating row beneath.
    When its container is narrower than minWidth (default 80px per column) the table scrolls inside its own overflow-x container. */
export function DataTable({ columns, rows, footer, total, page = 1, pageSize, onPage, rowKey = 'id', groupLabels, minWidth, style }) {
  const [hoverI, setHoverI] = useState(-1);
  const outer = useRef(null);
  const outerW = useElementWidth(outer);
  const tableMin = minWidth != null ? minWidth : columns.length * 80;
  const scroll = outerW > 0 && outerW < tableMin;
  const grid = columns.map((c) => c.width || (c.align === 'right' ? 'max-content' : 'minmax(0,1fr)')).join(' ');
  const cell = (c, r, i) => {
    const v = c.render ? c.render(r, i) : r[c.key];
    return <div key={c.key} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start', padding: '0 12px', minWidth: 0, textAlign: c.align || 'left', ...textStyle('body-3', { tone: c.tone || 'primary', tabular: c.align === 'right' || c.tabular }), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div>;
  };
  return (
    <div ref={outer} style={{ width: '100%', ...style }}>
      <div style={scroll ? { overflowX: 'auto', margin: '0 -8px', padding: '0 8px', WebkitOverflowScrolling: 'touch' } : undefined}>
      <div style={scroll ? { minWidth: tableMin } : undefined}>
      {groupLabels ? <div style={{ display: 'grid', gridTemplateColumns: grid, height: 24 }}>{groupLabels.map((g, i) => <div key={i} style={{ gridColumn: g.span ? `span ${g.span}` : undefined, padding: '0 12px', display: 'flex', alignItems: 'center', ...textStyle('caption-1-condensed', { tone: 'tertiary' }) }}>{g.label}</div>)}</div> : null}
      <div role="row" style={{ display: 'grid', gridTemplateColumns: grid, height: 36, boxShadow: 'inset 0 -1px 0 var(--border-light)' }}>
        {columns.map((c) => <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start', padding: '0 12px', ...textStyle('body-4', { tone: 'tertiary' }), whiteSpace: 'nowrap' }}>{c.label}</div>)}
      </div>
      {rows.map((r, i) => (
        <React.Fragment key={r[rowKey] != null ? r[rowKey] : i}>
          <div role="row" onMouseEnter={() => setHoverI(i)} onMouseLeave={() => setHoverI(-1)} style={{ position: 'relative', display: 'grid', gridTemplateColumns: grid, height: 48, boxShadow: r.correction ? 'none' : 'inset 0 -1px 0 var(--border-light)', opacity: r.closed ? 0.6 : 1 }}>
            <span aria-hidden style={{ position: 'absolute', inset: '2px -8px', borderRadius: 'var(--radius-md)', background: 'var(--grouped)', opacity: hoverI === i ? 1 : 0, transition: 'opacity var(--dur-default) var(--ease-default)', pointerEvents: 'none' }} />
            {columns.map((c) => cell(c, r, i))}
          </div>
          {r.correction ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', boxShadow: 'inset 0 -1px 0 var(--border-light)', ...textStyle('body-4', { tone: 'secondary' }), fontVariantNumeric: 'tabular-nums' }}>
              <Icon name="rotate-ccw" size={12} /><span>{r.correction.reason}</span><span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--content-tertiary)' }}><Dot style={{ marginLeft: 0 }} /><MetaParts meta={[r.correction.actor, r.correction.time]} /></span>
            </div>
          ) : null}
        </React.Fragment>
      ))}
      </div>
      </div>
      {(footer || total) ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 12px 0', ...textStyle('body-3', { tone: 'tertiary' }), fontVariantNumeric: 'tabular-nums' }}>
          <span>{footer || `Showing ${rows.length} of ${total}`}</span>
          {total && pageSize ? <span style={{ display: 'flex', gap: 4 }}><Button size="xsmall" variant="ghost" icon="arrow-left" disabled={page <= 1} onClick={() => onPage && onPage(page - 1)}>Prev</Button><Button size="xsmall" variant="ghost" iconRight="arrow-right" disabled={page * pageSize >= total} onClick={() => onPage && onPage(page + 1)}>Next</Button></span> : null}
        </div>
      ) : null}
    </div>
  );
}
