import React, { useEffect, useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';

/** Dialog (radius 20) or bottom sheet (top corners only, rises on expand 300ms) over a #00000066 scrim. Render inside a positioned container or the viewport. */
export function Dialog({ open = true, sheet = false, title, onClose, children, footer, width = 420, contained = false, style }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { if (open) { const t = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(t); } setShown(false); }, [open]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: contained ? 'absolute' : 'fixed', inset: 0, background: 'var(--overlay)', display: 'flex', alignItems: sheet ? 'flex-end' : 'center', justifyContent: 'center', padding: sheet ? 0 : 16, zIndex: 50 }}>
      <div role="dialog" aria-modal onClick={(e) => e.stopPropagation()} style={{ background: 'var(--elevated)', boxShadow: 'var(--shadow-dialog)', width: sheet ? '100%' : width, maxWidth: '100%', borderRadius: sheet ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)', padding: 16, display: 'flex', flexDirection: 'column', gap: 16,
        transform: shown ? 'translateY(0)' : (sheet ? 'translateY(100%)' : 'translateY(8px) scale(.98)'), opacity: shown ? 1 : (sheet ? 1 : 0), transition: `transform var(--dur-sheet) var(--ease-expand), opacity var(--dur-default) var(--ease-default)`, paddingBottom: sheet ? 'calc(16px + env(safe-area-inset-bottom, 0px))' : 16, ...style }}>
        {(title || onClose) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ flex: 1, ...textStyle('heading-4', { strong: true }) }}>{title}</span>
            {onClose ? <button type="button" aria-label="Close" onClick={onClose} style={{ border: 0, background: 'transparent', width: 32, height: 32, borderRadius: 'var(--radius-max)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--content-secondary)' }}><Icon name="x" size={20} stroke={1.75} /></button> : null}
          </div>
        )}
        <div style={{ ...textStyle('body-3'), textWrap: 'pretty' }}>{children}</div>
        {footer ? <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>{footer}</div> : null}
      </div>
    </div>
  );
}
