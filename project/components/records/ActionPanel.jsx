import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { Avatar } from '../core/Avatar.jsx';
import { Tabs } from '../navigation/Tabs.jsx';
import { Banner } from '../feedback/Banner.jsx';
import { Button } from '../actions/Button.jsx';
import { MetaParts } from '../data/Card.jsx';

/** The "ticket": 350px white panel, radius 20, shadow minimal-soft. Header (tile, context, subject), optional 44px tab bar, body with 18px gap. */
export function ActionPanel({ tile, context, subject, tabs, tab, onTab, menu, children, width = 350, error, onRetry, retrying, disabledReason, success, style }) {
  return (
    <aside style={{ width, maxWidth: '100%', background: 'var(--elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-minimal-soft)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', ...style }}>
      {(tile || context || subject) ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 0' }}>
          {tile ? (typeof tile === 'string' ? <Avatar initials={tile} /> : tile) : null}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {context ? <span style={textStyle('body-3', { tone: 'secondary' })}><MetaParts meta={context} /></span> : null}
            {subject ? <span style={{ ...textStyle('body-1', { strong: true }), textWrap: 'pretty' }}>{subject}</span> : null}
          </div>
        </div>
      ) : null}
      {tabs ? (
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', boxShadow: 'inset 0 -1px 0 var(--border-light)' }}>
          <Tabs tabs={tabs} value={tab} onChange={onTab} variant="panel" height={44} gap={20} style={{ flex: 1 }} />
          {menu !== false ? <button type="button" aria-label="More" style={{ border: 0, background: 'transparent', width: 32, height: 32, borderRadius: 'var(--radius-max)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--content-secondary)', cursor: 'pointer' }}><Icon name="ellipsis" size={20} stroke={1.75} /></button> : null}
        </div>
      ) : null}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {success ? <Banner tone="success">{success}</Banner> : null}
        {error ? <Banner tone="error" action={<Button size="xsmall" variant="outline" icon="refresh-cw" loading={retrying} onClick={onRetry}>Retry</Button>}>{error}</Banner> : null}
        {children}
        {disabledReason ? <span style={{ ...textStyle('body-4', { tone: 'tertiary' }), textAlign: 'center' }}>{disabledReason}</span> : null}
      </div>
    </aside>
  );
}

/** Amount row: body-1 label left; right-aligned display-4-condensed figure with a quaternary unit. */
export function AmountRow({ label, value, unit, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
      <span style={textStyle('body-1')}>{label}</span>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}><span style={textStyle('display-4-condensed', { tabular: true })}>{value}</span>{unit ? <span style={textStyle('body-2', { tone: 'quaternary' })}>{unit}</span> : null}</span>
        {sub ? <span style={{ ...textStyle('body-4', { tone: 'tertiary' }), fontVariantNumeric: 'tabular-nums' }}>{sub}</span> : null}
      </span>
    </div>
  );
}

/** Summary list: secondary label, primary tabular value. */
export function SummaryList({ items = [] }) {
  return (
    <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
          <dt style={textStyle('body-3', { tone: 'secondary' })}>{it.label}</dt>
          <dd style={{ margin: 0, ...textStyle('body-3', { strong: !!it.strong, tabular: true, color: it.color }), display: 'inline-flex', alignItems: 'center', gap: 6 }}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Radio list of outcomes (dispute resolution). */
export function RadioList({ options, value, onChange, name = 'outcome' }) {
  return (
    <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {options.map((o) => { const opt = typeof o === 'string' ? { value: o, label: o } : o; const sel = opt.value === value; return (
        <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: sel ? 'var(--grouped)' : 'transparent', cursor: 'pointer', transition: 'background var(--dur-default) var(--ease-default)' }}>
          <input type="radio" name={name} checked={sel} onChange={() => onChange && onChange(opt.value)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
          <span aria-hidden style={{ width: 18, height: 18, marginTop: 1, borderRadius: '50%', flex: 'none', boxShadow: sel ? 'inset 0 0 0 6px var(--buttons-primary)' : 'inset 0 0 0 1.5px var(--content-quaternary)', background: 'var(--elevated)', transition: 'box-shadow var(--dur-default) var(--ease-default)' }} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}><span style={textStyle('body-3', { strong: sel })}>{opt.label}</span>{opt.hint ? <span style={textStyle('body-4', { tone: 'secondary' })}>{opt.hint}</span> : null}</span>
        </label>); })}
    </div>
  );
}
