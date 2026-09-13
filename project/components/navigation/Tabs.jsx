import React, { useLayoutEffect, useRef, useState } from 'react';
import { textStyle } from '../core/Text.jsx';
import { useInteraction, usePrefersReducedMotion } from '../core/Interaction.jsx';

/** One tab. Keyboard focus shows an inset 2px ring; pointer focus shows nothing. */
function TabButton({ tab, active, cond, variant, onSelect }) {
  const { focusVisible, handlers } = useInteraction();
  const color = active ? 'var(--content-primary)' : 'var(--content-tertiary)';
  return (
    <button type="button" role="tab" aria-selected={active} data-active={active ? 'true' : 'false'} onClick={onSelect} {...handlers}
      style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 6, flex: 'none', borderRadius: 'var(--radius-4xs)',
        boxShadow: focusVisible ? 'inset 0 0 0 2px color-mix(in srgb, var(--content-primary) 25%, transparent)' : 'none',
        ...(cond ? textStyle('heading-2-condensed', { color }) : textStyle(variant === 'panel' ? 'body-2' : 'body-3', { strong: true, color })),
        transition: 'color var(--dur-default) var(--ease-default)' }}>
      {tab.label}{tab.count != null ? <span style={{ ...textStyle('body-3', { tone: 'tertiary' }) }}>{tab.count}</span> : null}
    </button>
  );
}

/** Nav tabs: body-3-strong labels, inactive tertiary / active primary, a 2px underline that glides on the spring curve (300ms); reduced motion jumps it. */
export function Tabs({ tabs, value, onChange, height = 48, gap = 20, underlineColor = 'var(--content-primary)', variant = 'nav', style }) {
  const wrap = useRef(null);
  const [line, setLine] = useState({ left: 0, width: 0 });
  const reduced = usePrefersReducedMotion();
  const cond = variant === 'commodity';
  useLayoutEffect(() => {
    const measure = () => {
      const el = wrap.current && wrap.current.querySelector('[data-active="true"]');
      if (el) setLine((l) => (l.left === el.offsetLeft && l.width === el.offsetWidth ? l : { left: el.offsetLeft, width: el.offsetWidth }));
    };
    measure();
    // web fonts can change label widths after first paint
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure).catch(() => {});
  }, [value, tabs.length]);
  return (
    <div ref={wrap} role="tablist" style={{ position: 'relative', display: 'flex', alignItems: 'stretch', gap: cond ? 16 : gap, height, ...style }}>
      {tabs.map((t) => {
        const tab = typeof t === 'string' ? { value: t, label: t } : t;
        return <TabButton key={tab.value} tab={tab} active={tab.value === value} cond={cond} variant={variant} onSelect={() => onChange && onChange(tab.value)} />;
      })}
      <span aria-hidden style={{ position: 'absolute', bottom: 0, height: 2, borderRadius: 1, background: underlineColor, left: line.left, width: line.width,
        transition: reduced ? 'none' : 'left var(--dur-underline) var(--ease-spring), width var(--dur-underline) var(--ease-spring), background var(--dur-default) var(--ease-default)' }} />
    </div>
  );
}
