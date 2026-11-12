import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';

const KINDS = {
  clean: { icon: 'circle-check', word: 'Clean', color: 'var(--success-strong)' },
  attention: { icon: 'triangle-alert', word: 'Attention', color: 'var(--warning-strong)' },
  breach: { icon: 'circle-alert', word: 'Breach', color: 'var(--error-strong)' },
  block: { icon: 'octagon-x', word: 'Hard block', color: 'var(--error-strong)' },
  awaiting: { icon: 'clock', word: 'Awaiting', color: 'var(--content-secondary)' },
  within: { icon: 'check', word: 'Within spec', color: 'var(--success-strong)' },
  over: { icon: 'triangle-alert', word: 'Over limit', color: 'var(--warning-strong)' },
  up: { icon: 'trending-up', word: 'Improving', color: 'var(--content-accent-up)' },
  down: { icon: 'trending-down', word: 'Worsening', color: 'var(--content-accent-down)' },
  flat: { icon: 'minus', word: 'Flat', color: 'var(--content-secondary)' },
  rebalance: { icon: 'arrow-left-right', word: 'Rebalance', color: 'var(--content-secondary)' },
  // The map's status set (UX-14): one icon and tone per status, everywhere.
  pending: { icon: 'clock', word: 'Pending', color: 'var(--warning-strong)' },
  neutral: { icon: 'clock', word: 'Draft', color: 'var(--content-secondary)' },
  locked: { icon: 'lock', word: 'Locked', color: 'var(--error-strong)' },
  notSet: { icon: 'triangle-alert', word: 'Not set', color: 'var(--warning-strong)' },
};
export const STATUS_KINDS = KINDS;

/** Status = a Lucide icon plus a sentence-case word. Never colour alone. A kind it does not know is drawn neutral, never as
    the green check: an unknown status is not good news (U4). The word is never cut: a long one wraps beside its icon. */
export function StatusMark({ kind = 'clean', label, size = 'body-3', strong = true, style }) {
  const k = KINDS[kind] || KINDS.neutral;
  const iconSize = size === 'body-4' || size === 'caption-1' ? 14 : 16;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...textStyle(size, { strong, color: k.color }), ...style }}>
      <Icon name={k.icon} size={iconSize} style={{ flex: 'none' }} /><span data-word="" style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{label || k.word}</span>
    </span>
  );
}
