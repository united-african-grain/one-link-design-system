import React from 'react';
import { textStyle } from '../core/Text.jsx';

const LEVELS = {
  critical: { code: '01', word: 'CRITICAL', bg: 'var(--error-subtle)', fg: 'var(--error-strong)' },
  high: { code: '02', word: 'HIGH', bg: 'var(--warning-subtle)', fg: 'var(--warning-strong)' },
  normal: { code: '03', word: 'NORMAL', bg: 'var(--grouped-light)', fg: 'var(--content-secondary)' },
};

/** Leading severity tag for rail rows: body-2-condensed, radius 4, 4px 6px padding. */
export function SeverityTag({ level = 'normal', style }) {
  const l = LEVELS[level] || LEVELS.normal;
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 6px', borderRadius: 'var(--radius-4xs)', background: l.bg, whiteSpace: 'nowrap', ...textStyle('body-2-condensed', { color: l.fg }), ...style }}>{l.code} {l.word}</span>;
}
