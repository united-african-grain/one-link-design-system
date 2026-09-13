import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { useInteraction } from '../core/Interaction.jsx';

const OL_STEPPER_RING = '0 0 0 3px color-mix(in srgb, var(--content-primary) 20%, transparent)';

/** 18px chevron button with 14px icon. */
function LineStepperArrow({ dir, disabled, onStep }) {
  const { hover, focusVisible, handlers } = useInteraction({ inert: disabled });
  return (
    <button type="button" aria-label={dir < 0 ? 'Lower' : 'Higher'} disabled={disabled} onClick={onStep} {...handlers}
      style={{ border: 0, background: 'transparent', padding: 0, width: 18, height: 18, display: 'grid', placeItems: 'center', outline: 'none', cursor: disabled ? 'default' : 'pointer', borderRadius: 'var(--radius-4xs)',
        color: disabled ? 'var(--content-quaternary)' : hover ? 'var(--content-primary)' : 'var(--content-secondary)', boxShadow: focusVisible ? OL_STEPPER_RING : 'none', transition: 'color var(--dur-default) var(--ease-default)' }}>
      <Icon name={dir < 0 ? 'chevron-left' : 'chevron-right'} size={14} />
    </button>
  );
}

/** A value. `font` is set once; only fontWeight/color change so tabular figures survive re-renders. */
function LineStepperValue({ v, active, activeColor, onPick }) {
  const { focusVisible, handlers } = useInteraction();
  return (
    <button type="button" aria-current={active || undefined} onClick={onPick} {...handlers}
      style={{ border: 0, background: 'transparent', padding: 0, minWidth: 28, textAlign: 'center', cursor: 'pointer', outline: 'none', borderRadius: 'var(--radius-4xs)',
        font: 'var(--font-body-3)', fontWeight: active ? 'var(--weight-strong-heading)' : 'var(--weight-regular)', letterSpacing: 'var(--body-3-tracking)', fontFeatureSettings: 'var(--features-text)', fontVariantNumeric: 'tabular-nums',
        color: active ? activeColor : 'var(--content-secondary)', boxShadow: focusVisible ? OL_STEPPER_RING : 'none', transition: 'color var(--dur-default) var(--ease-default)' }}>{v}</button>
  );
}

/** Planning price / tolerance stepper: 28px, white, shadow minimal, 18px chevrons at the ends, 28px-min centred values, active value 600 in brand or commodity colour. */
export function LineStepper({ values, value, onChange, activeColor = 'var(--content-accent-brand)', style }) {
  const i = values.indexOf(value);
  const step = (d) => { const n = Math.min(values.length - 1, Math.max(0, i + d)); if (n !== i && onChange) onChange(values[n]); };
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, height: 28, padding: '0 8px', borderRadius: 'var(--radius-xs)', background: 'var(--elevated)', boxShadow: 'var(--shadow-minimal)', ...style }}>
      <LineStepperArrow dir={-1} disabled={i <= 0} onStep={() => step(-1)} />
      {values.map((v) => <LineStepperValue key={v} v={v} active={v === value} activeColor={activeColor} onPick={() => onChange && onChange(v)} />)}
      <LineStepperArrow dir={1} disabled={i >= values.length - 1} onStep={() => step(1)} />
    </div>
  );
}
