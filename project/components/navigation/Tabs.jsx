import React, { useLayoutEffect, useRef, useState } from 'react';
import { textStyle } from '../core/Text.jsx';

/** Nav tabs: body-3-strong labels, inactive tertiary / active primary, a 2px underline that glides on the spring curve (300ms). */
export function Tabs({ tabs, value, onChange, height = 48, gap = 20, underlineColor = 'var(--content-primary)', variant = 'nav', style }) {
  const wrap = useRef(null);
  const [line, setLine] = useState({ left: 0, width: 0 });
  const cond = variant === 'commodity';
  useLayoutEffect(() => {
    const el = wrap.current && wrap.current.querySelector('[data-active="true"]');
    if (el) setLine({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value, tabs.length]);
  return (
    <div ref={wrap} role="tablist" style={{ position: 'relative', display: 'flex', alignItems: 'stretch', gap: cond ? 16 : gap, height, ...style }}>
      {tabs.map((t) => {
        const tab = typeof t === 'string' ? { value: t, label: t } : t;
        const active = tab.value === value;
        return (
          <button key={tab.value} type="button" role="tab" aria-selected={active} data-active={active ? 'true' : 'false'} onClick={() => onChange && onChange(tab.value)}
            style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6,
              ...(cond ? textStyle('heading-2-condensed', { color: active ? 'var(--content-primary)' : 'var(--content-tertiary)' }) : textStyle(variant === 'panel' ? 'body-2' : 'body-3', { strong: true, color: active ? 'var(--content-primary)' : 'var(--content-tertiary)' })),
              transition: 'color var(--dur-default) var(--ease-default)' }}>
            {tab.label}{tab.count != null ? <span style={{ ...textStyle('body-3', { tone: 'tertiary' }) }}>{tab.count}</span> : null}
          </button>
        );
      })}
      <span aria-hidden style={{ position: 'absolute', bottom: 0, height: 2, borderRadius: 1, background: underlineColor, left: line.left, width: line.width, transition: 'left var(--dur-underline) var(--ease-spring), width var(--dur-underline) var(--ease-spring), background var(--dur-default) var(--ease-default)' }} />
    </div>
  );
}
