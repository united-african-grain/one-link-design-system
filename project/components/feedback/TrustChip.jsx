import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';

// How a weight was captured, in S57 words only (Source: Weighbridge, Scanned slip). `typed` is renamed `unverified`
// (R-08: nothing in One Link is typed); `bridge` is gone, because "weighed in only" is readiness, not provenance, and
// lives in ReadinessChip. The three ocr-* kinds are review-only: they carry the reading's confidence for the slip
// review, but no confidence word, signal or score ever reaches the screen, so they read as the scanned slip they are.
const PROV = {
  synced: { label: 'Weighbridge' }, 'ocr-verified': { label: 'Scanned slip' }, unverified: { label: 'Unverified' }, declared: { label: 'Declared by farmer' },
  'ocr-high': { label: 'Scanned slip', review: true }, 'ocr-medium': { label: 'Scanned slip', review: true }, 'ocr-low': { label: 'Scanned slip', review: true },
};
/** The provenance kinds, in order: the four a record carries, then the three review-only confidence kinds. */
export const PROVENANCE_KINDS = Object.keys(PROV);
const CONF = {
  confirmed: { label: 'Confirmed', icon: 'check', color: 'var(--success-strong)' },
  awaiting: { label: 'Awaiting counterparty', icon: 'clock', color: 'var(--content-secondary)' },
  disputed: { label: 'Disputed', icon: 'triangle-alert', color: 'var(--warning-strong)' },
  confirm: { label: 'Confirm now', icon: 'clock', color: 'var(--content-accent-brand)' },
  // The S57 Counterparty status word for a confirmation not answered yet (Confirmed, Disputed, Pending).
  pending: { label: 'Pending', icon: 'clock', color: 'var(--content-secondary)' },
};

function Chip({ children, style }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 8px', borderRadius: 'var(--radius-max)', background: 'var(--grouped-light)', whiteSpace: 'nowrap', ...textStyle('caption-1', { strong: true, tone: 'secondary' }), ...style }}>{children}</span>;
}

/** Provenance chip: how a weight was captured. Lucide `contrast` + Weighbridge / Scanned slip / Unverified / Declared by
    farmer. On a weighbridge ticket the source is the labelled field Source, never this chip. */
export function ProvenanceChip({ kind = 'synced', label, style }) {
  const p = PROV[kind] || PROV.synced;
  return <Chip style={style}><Icon name="contrast" size={12} />{label || p.label}</Chip>;
}

/** Confirmation chip: counterparty state. Lucide `diamond` + check / clock / triangle-alert. Never merged with provenance. */
export function ConfirmationChip({ kind = 'awaiting', label, style }) {
  const c = CONF[kind] || CONF.awaiting;
  return <Chip style={{ color: c.color, ...style }}><Icon name="diamond" size={12} /><Icon name={c.icon} size={12} />{label || c.label}</Chip>;
}
