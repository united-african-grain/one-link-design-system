import React, { useState } from 'react';
import { Dialog } from './Dialog.jsx';
import { Button } from '../actions/Button.jsx';
import { textStyle } from '../core/Text.jsx';
import { useMinWidth } from '../core/Interaction.jsx';

/** A code shown once (map UX-22, S10 A3): the activation code for a new or locked user, large and spaced, with Copy and
    its expiry as a labelled date and time, and Done. It keeps nothing: the code lives only in the calling screen's state,
    which drops it on Done, after which the record offers Reissue activation code. No explanatory text (UX-23). */
export function OneTimeCode({ open = true, title = 'Activation code', code, expires, onDone, contained = false }) {
  const [copied, setCopied] = useState(false);
  const narrow = !useMinWidth(768);
  const copy = async () => {
    try { await navigator.clipboard?.writeText(code); } catch (e) { /* the code is still on screen to read out */ }
    setCopied(true);
  };
  return (
    <Dialog open={open} title={title} width={480} sheet={narrow && !contained} contained={contained}
      footer={<Button size="small" onClick={onDone}>Done</Button>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--grouped-light)' }}>
          <span data-code="" style={{ ...textStyle('heading-2', { strong: true }), letterSpacing: '0.12em', fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}>{code}</span>
          <Button variant="outline" size="xsmall" icon={copied ? 'check' : 'copy'} onClick={copy}>{copied ? 'Copied' : 'Copy'}</Button>
        </div>
        <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <dt style={textStyle('body-4', { tone: 'secondary' })}>Expires</dt>
          <dd style={{ margin: 0, ...textStyle('body-3'), fontVariantNumeric: 'tabular-nums' }}>{expires}</dd>
        </dl>
      </div>
    </Dialog>
  );
}
