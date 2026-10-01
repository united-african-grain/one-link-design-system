import React, { useId, useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';

/** Label, control, hint and error, 6px apart. Label body-3-strong; hint body-4 secondary; error body-4 error-strong
    with circle-alert, under the field (map UX-21, the S57 validation pattern "[Field] [requirement]."). The twin of
    the web app's ol-field. */
export function Field({ label, hint, error, required = false, htmlFor, children, style }) {
  return (
    <div data-invalid={error ? '' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, ...style }}>
      {label ? <label htmlFor={htmlFor} style={{ alignSelf: 'flex-start', ...textStyle('body-3', { strong: true }) }}>{label}{required ? <span aria-hidden style={{ color: 'var(--content-secondary)', fontWeight: 'var(--weight-regular)' }}> *</span> : null}</label> : null}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>{children}</div>
      {hint ? <span style={{ ...textStyle('body-4', { tone: 'secondary' }), textWrap: 'pretty' }}>{hint}</span> : null}
      {error ? <span role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: 4, ...textStyle('body-4', { color: 'var(--error-strong)' }), textWrap: 'pretty' }}><Icon name="circle-alert" size={14} style={{ marginTop: 1, flex: 'none' }} />{error}</span> : null}
    </div>
  );
}

function controlStyle({ focus, hover, invalid, disabled, multiline, select, align, large }) {
  const ring = invalid ? 'inset 0 0 0 1px var(--error-strong)' : focus ? 'inset 0 0 0 1px var(--border), 0 0 0 4px var(--grouped-light)' : 'inset 0 0 0 0 transparent';
  return {
    boxSizing: 'border-box', display: 'block', width: '100%', minWidth: 0, height: multiline ? 'auto' : large ? 48 : 40, minHeight: multiline ? 88 : undefined, margin: 0,
    padding: multiline ? '10px 12px' : select ? '0 36px 0 12px' : large ? '0 14px' : '0 12px', border: 0, borderRadius: 'var(--radius-sm)', outline: 'none', appearance: 'none', WebkitAppearance: 'none',
    background: disabled ? 'var(--grouped-light)' : focus ? 'var(--elevated)' : hover ? 'color-mix(in srgb, var(--hover-mix-light), var(--grouped))' : 'var(--grouped-light)',
    color: disabled ? 'var(--content-disabled)' : 'var(--content-primary)', boxShadow: disabled ? 'none' : ring, resize: multiline ? 'vertical' : undefined,
    cursor: disabled ? 'not-allowed' : select ? 'pointer' : 'text', textAlign: align, fontVariantNumeric: align === 'right' ? 'tabular-nums' : undefined,
    transition: 'background-color var(--dur-default) var(--ease-default), box-shadow var(--dur-default) var(--ease-default)',
    ...textStyle('body-3', { color: disabled ? 'var(--content-disabled)' : 'var(--content-primary)' }),
  };
}

function useControlState() {
  const [focus, setFocus] = useState(false);
  const [hover, setHover] = useState(false);
  return { focus, hover, on: { onFocus: () => setFocus(true), onBlur: () => setFocus(false), onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) } };
}

/** Text input or textarea (multiline): 40px (48px at size large, the signed-out screens), radius 12, grouped-light; focus turns it white with a border and a 4px
    halo; invalid is a 1px error-strong ring. The twin of input[olInput] and textarea[olInput]. */
export function Input({ multiline = false, invalid = false, align, size = 'medium', disabled = false, style, ...rest }) {
  const { focus, hover, on } = useControlState();
  const Tag = multiline ? 'textarea' : 'input';
  return <Tag className="ol-input" aria-invalid={invalid || undefined} disabled={disabled} {...on} {...rest} style={{ ...controlStyle({ focus, hover, invalid, disabled, multiline, align, large: size === 'large' }), ...style }} />;
}

/** Native select with the chevron, styled as Input. The twin of select[olInput] inside ol-select. */
export function Select({ options = [], invalid = false, disabled = false, style, ...rest }) {
  const { focus, hover, on } = useControlState();
  return (
    <span style={{ position: 'relative', display: 'block', minWidth: 0 }}>
      <select className="ol-input" aria-invalid={invalid || undefined} disabled={disabled} {...on} {...rest} style={{ ...controlStyle({ focus, hover, invalid, disabled, select: true }), ...style }}>
        {options.map((o) => { const v = typeof o === 'string' ? { value: o, label: o } : o; return <option key={v.value} value={v.value} disabled={v.disabled}>{v.label}</option>; })}
      </select>
      <Icon name="chevron-down" size={16} color={disabled ? 'var(--content-disabled)' : 'var(--content-secondary)'} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      <style>{'.ol-input::placeholder{color:color-mix(in srgb, var(--content-primary) 30%, transparent)}'}</style>
    </span>
  );
}

/** Radio rows, 12px padding, radius 16; the selected row has a 1px border and a strong label. An option that cannot be
    chosen yet stays visible but disabled (map UX-17) and names why in `reason`, under its label. The twin of
    ol-radio-list. */
export function RadioList({ options = [], value, onChange, name, disabled = false, style }) {
  const auto = useId();
  const group = name || `ol-radio-${auto}`;
  return (
    <div role="radiogroup" aria-disabled={disabled || undefined} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, ...style }}>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        const off = disabled || !!opt.disabled;
        const selected = opt.value === value;
        return (
          <label key={opt.value} data-selected={selected || undefined} data-disabled={off || undefined}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, boxSizing: 'border-box', minHeight: 44, padding: 12, borderRadius: 'var(--radius-md)', boxShadow: selected ? 'inset 0 0 0 1px var(--border)' : 'none', cursor: off ? 'not-allowed' : 'pointer' }}>
            <input type="radio" name={group} value={opt.value} checked={selected} disabled={off} onChange={() => onChange && onChange(opt.value)} style={{ margin: '3px 0 0', accentColor: 'var(--buttons-primary)', flex: 'none' }} />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ ...textStyle('body-3', { strong: selected, color: off ? 'var(--content-disabled)' : 'var(--content-primary)' }), textWrap: 'pretty' }}>{opt.label}</span>
              {opt.hint ? <span style={{ ...textStyle('body-4', { color: off ? 'var(--content-disabled)' : 'var(--content-secondary)' }), textWrap: 'pretty' }}>{opt.hint}</span> : null}
              {off && opt.reason ? <span data-reason="" style={{ ...textStyle('body-4', { tone: 'secondary' }), textWrap: 'pretty' }}>{opt.reason}</span> : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** Checkbox rows (bundles, sites): a native checkbox and its label, with an optional hint under the label (a bundle's
    price tiers as a plain comma list, UX-26). The twin of input[olCheckbox] rows. */
export function CheckboxList({ options = [], values = [], onChange, disabled = false, style }) {
  const toggle = (v) => onChange && onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <div role="group" style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, ...style }}>
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        const checked = values.includes(opt.value);
        return (
          <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minHeight: 32, padding: '6px 0', cursor: disabled ? 'not-allowed' : 'pointer' }}>
            <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(opt.value)} style={{ margin: '3px 0 0', accentColor: 'var(--buttons-primary)', flex: 'none' }} />
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={textStyle('body-3', { color: disabled ? 'var(--content-disabled)' : 'var(--content-primary)' })}>{opt.label}</span>
              {opt.hint ? <span style={textStyle('body-4', { tone: 'secondary' })}>{opt.hint}</span> : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
