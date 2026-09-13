import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { useInteraction } from '../core/Interaction.jsx';

/** Card container: white, radius 20, shadow minimal-soft, 16px padding, 12px gap.
    With commodityColor (and optional commodityColor2 for the right side), hover fades in radial washes from each side plus a conic border (400ms in / 160ms out) and press scales 0.99. */
export function Card({ title, meta, headerRight, footer, commodityColor, commodityColor2, interactive = false, closed = false, padding = 16, gap = 12, width, onClick, children, style }) {
  const { hover, down, handlers } = useInteraction({ inert: !interactive });
  const c = commodityColor;
  const c2 = commodityColor2 || commodityColor;
  const hoverable = interactive && c && !closed;
  const on = hoverable && hover;
  const mix = (col, pct) => `color-mix(in oklab, ${col} ${pct}%, transparent)`;
  return (
    <div onClick={onClick} {...handlers}
      style={{ position: 'relative', isolation: 'isolate', background: 'var(--elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-minimal-soft)', padding, display: 'flex', flexDirection: 'column', gap, width, boxSizing: 'border-box', cursor: onClick ? 'pointer' : 'default', outline: 'none',
        transform: down && interactive ? 'scale(var(--scale-press-card))' : 'scale(1)', transition: 'transform var(--dur-default) ease', ...style }}>
      {c ? (
        <span aria-hidden style={{ position: 'absolute', inset: 0, zIndex: -1, border: '1px solid transparent', borderRadius: 'inherit', pointerEvents: 'none',
          background: [
            `radial-gradient(42% 105% at 8% 50%, ${mix(c, 9)}, transparent) padding-box`,
            `radial-gradient(42% 105% at 92% 50%, ${mix(c2, 9)}, transparent) padding-box`,
            'linear-gradient(var(--elevated), var(--elevated)) padding-box',
            `conic-gradient(from 180deg, var(--border-light), ${mix(c, 38)} 25%, ${mix(c, 68)} 46%, ${mix(c2, 68)} 54%, ${mix(c2, 38)} 75%, var(--border-light)) border-box`,
          ].join(', '),
          opacity: on ? 1 : 0, transition: `opacity ${on ? 'var(--dur-card-in)' : 'var(--dur-card-out)'} var(--ease-card)` }} />
      ) : null}
      {(title || meta || headerRight) ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {title ? <span style={{ ...textStyle('body-2', { strong: true, tone: closed ? 'quaternary' : 'primary' }), textWrap: 'pretty' }}>{title}</span> : null}
            {meta ? <span style={{ ...textStyle('body-3', { tone: 'secondary' }), display: 'block', fontVariantNumeric: 'tabular-nums' }}><MetaParts meta={meta} /></span> : null}
          </div>
          {headerRight ? <div style={{ flex: 'none' }}>{headerRight}</div> : null}
        </div>
      ) : null}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap }}>{children}</div>
      {footer ? <div style={{ position: 'relative', ...textStyle('body-3', { tone: 'tertiary' }) }}><MetaParts meta={footer} split={false} /></div> : null}
    </div>
  );
}

/** 3px content-quaternary dot separator for meta lines, 6px either side. */
export function Dot({ style }) { return <span aria-hidden style={{ width: 3, height: 3, margin: '0 6px', borderRadius: '50%', background: 'var(--content-quaternary)', display: 'inline-block', verticalAlign: 'middle', flex: 'none', ...style }} />; }

/** Meta segments joined by Dots. Accepts an array, or a string that is split on " · ". Other nodes render as given. */
export function MetaParts({ meta, split = true }) {
  const parts = Array.isArray(meta) ? meta.filter((m) => m != null && m !== '') : (split && typeof meta === 'string' && meta.indexOf(' · ') >= 0 ? meta.split(' · ') : null);
  if (!parts) return <>{meta}</>;
  return <>{parts.map((m, i) => <React.Fragment key={i}>{i > 0 ? <Dot /> : null}<span>{m}</span></React.Fragment>)}</>;
}

/** 36px card row: leading tile, name, share underline, secondary figure, trailing chips/buttons. On a very narrow card the trailing group wraps under the row, right-aligned. */
export function CardRow({ leading, name, sub, bar, figure, trailing, closed = false, style }) {
  return (
    <div data-card-row style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 12, rowGap: 8, minHeight: 36, ...style }}>
      {leading}
      <div style={{ flex: '1 1 0px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
          <span style={{ ...textStyle('body-3', { tone: closed ? 'quaternary' : 'primary' }), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
          {sub ? <span style={{ ...textStyle('body-3', { tone: 'secondary' }), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</span> : null}
        </div>
        {bar}
      </div>
      {figure ? <span style={{ ...textStyle('body-3', { tone: 'secondary', tabular: true }), whiteSpace: 'nowrap' }}>{figure}</span> : null}
      {trailing ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none', marginLeft: 'auto' }}>{trailing}</div> : null}
    </div>
  );
}
