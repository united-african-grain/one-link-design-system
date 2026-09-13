import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';

/** Card container: white, radius 20, shadow minimal-soft, 16px padding, 12px gap. With commodityColor, hover paints a radial wash + conic border and press scales 0.99. */
export function Card({ title, meta, headerRight, footer, commodityColor, interactive = false, closed = false, padding = 16, gap = 12, width, onClick, children, style }) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const c = commodityColor;
  const hoverable = interactive && c && !closed;
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setDown(false); }} onMouseDown={() => interactive && setDown(true)} onMouseUp={() => setDown(false)}
      style={{ position: 'relative', background: 'var(--elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-minimal-soft)', padding, display: 'flex', flexDirection: 'column', gap, width, boxSizing: 'border-box', cursor: onClick ? 'pointer' : 'default',
        transform: down && interactive ? 'scale(var(--scale-press-card))' : 'scale(1)', transition: `transform var(--dur-default) var(--ease-default)`, ...style }}>
      {c ? (
        <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', opacity: hoverable && hover ? 1 : 0, transition: `opacity ${hoverable && hover ? 'var(--dur-card-in)' : 'var(--dur-card-out)'} var(--ease-card)`,
          background: `radial-gradient(120% 100% at 0% 50%, color-mix(in oklab, ${c} var(--commodity-wash-amount), transparent), transparent 70%)` }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', padding: 1, background: `conic-gradient(from 200deg, color-mix(in srgb, ${c} 38%, transparent), color-mix(in srgb, ${c} 68%, transparent), color-mix(in srgb, ${c} 38%, transparent))`, WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
        </span>
      ) : null}
      {(title || meta || headerRight) ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {title ? <span style={{ ...textStyle('body-2', { strong: true, tone: closed ? 'quaternary' : 'primary' }), textWrap: 'pretty' }}>{title}</span> : null}
            {meta ? <span style={{ ...textStyle('body-3', { tone: 'secondary' }), display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontVariantNumeric: 'tabular-nums' }}>{Array.isArray(meta) ? meta.map((m, i) => <React.Fragment key={i}>{i > 0 ? <Dot /> : null}<span>{m}</span></React.Fragment>) : meta}</span> : null}
          </div>
          {headerRight ? <div style={{ flex: 'none' }}>{headerRight}</div> : null}
        </div>
      ) : null}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap }}>{children}</div>
      {footer ? <div style={{ position: 'relative', ...textStyle('body-3', { tone: 'tertiary' }) }}>{footer}</div> : null}
    </div>
  );
}

/** 3px content-quaternary dot separator for meta lines. */
export function Dot() { return <span aria-hidden style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--content-quaternary)', display: 'inline-block', flex: 'none' }} />; }

/** 36px card row: leading tile, name, share underline, secondary figure, trailing chips/buttons. */
export function CardRow({ leading, name, sub, bar, figure, trailing, closed = false, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 36, ...style }}>
      {leading}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ ...textStyle('body-3', { tone: closed ? 'quaternary' : 'primary' }), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
          {sub ? <span style={{ ...textStyle('body-3', { tone: 'secondary' }), whiteSpace: 'nowrap' }}>{sub}</span> : null}
        </div>
        {bar}
      </div>
      {figure ? <span style={{ ...textStyle('body-3', { tone: 'secondary', tabular: true }), whiteSpace: 'nowrap' }}>{figure}</span> : null}
      {trailing ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>{trailing}</div> : null}
    </div>
  );
}
