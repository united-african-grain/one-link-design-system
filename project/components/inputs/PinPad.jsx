import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { Button } from '../actions/Button.jsx';

/** Wrong PINs allowed before PIN entry locks (M4.DS.03): after the fifth, the person signs in again with their email
    and password while connected. */
export const PIN_MAX_TRIES = 5;

/** True once `wrong` PINs have reached the limit. */
export function pinLocked(wrong = 0, maxTries = PIN_MAX_TRIES) {
  return wrong >= maxTries;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** The UAG One Link app's PIN pad (M4.DS.03; S08 J1: after the first full sign-in the app opens with the phone's PIN
    or fingerprint). The entered digits as dots, the error under them, and a 3 by 4 keypad of the system's buttons.
    With `fingerprint`, the bottom-left key switches to the fingerprint. Once `wrong` reaches `maxTries` every key is
    disabled and stays so; `busy` disables the keys and shows the spinner while the PIN is checked or saved. The pad
    holds no PIN: the screen keeps the digits and passes `entered`, their count. */
export function PinPad({ length = 4, entered = 0, wrong = 0, maxTries = PIN_MAX_TRIES, error, busy = false, fingerprint = false, onDigit, onDelete, onFingerprint, style }) {
  const locked = pinLocked(wrong, maxTries);
  const inert = locked || busy;
  const dotColor = error || locked ? 'var(--error-strong)' : 'var(--content-primary)';
  const key = (d) => <Button key={d} variant="outline" size="large" fullWidth disabled={inert} onClick={() => onDigit && onDigit(d)}>{d}</Button>;
  return (
    <div data-pin-pad="" data-locked={locked ? '' : undefined} aria-busy={busy || undefined} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 24, minWidth: 0, ...style }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div role="status" aria-label={`${Math.min(entered, length)} of ${length} digits entered`} style={{ display: 'flex', alignItems: 'center', gap: 16, height: 20 }}>
          {Array.from({ length }, (_, i) => (
            <span key={i} data-pin-dot={i < entered ? 'filled' : 'empty'} style={{ width: 12, height: 12, borderRadius: 'var(--radius-max)', boxShadow: `inset 0 0 0 1.5px ${dotColor}`, background: i < entered ? dotColor : 'transparent' }} />
          ))}
          {busy ? <Icon name="loader-circle" size={16} spin color="var(--content-secondary)" /> : null}
        </div>
        {error ? <span role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: 4, ...textStyle('body-4', { color: 'var(--error-strong)' }), textAlign: 'center', textWrap: 'pretty' }}><Icon name="circle-alert" size={14} style={{ marginTop: 1, flex: 'none' }} />{error}</span> : null}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
        {DIGITS.map(key)}
        {fingerprint ? <Button variant="ghost" size="large" fullWidth icon="fingerprint" aria-label="Use fingerprint" disabled={inert} onClick={onFingerprint} /> : <span />}
        {key('0')}
        <Button variant="ghost" size="large" fullWidth icon="delete" aria-label="Delete" disabled={inert || entered === 0} onClick={onDelete} />
      </div>
    </div>
  );
}
