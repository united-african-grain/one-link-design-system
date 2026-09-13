import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';

const PROV = {
  synced: { label: 'Synced' }, bridge: { label: 'Bridge feed' },
  'ocr-high': { label: 'OCR · high', extra: 'signal-high' }, 'ocr-medium': { label: 'OCR · medium', extra: 'signal-medium' }, 'ocr-low': { label: 'OCR · low', extra: 'signal-low' },
  typed: { label: 'Typed · unverified' }, declared: { label: 'Declared by farmer' },
};
const CONF = {
  confirmed: { label: 'Confirmed', icon: 'check', color: 'var(--success-strong)' },
  awaiting: { label: 'Awaiting counterparty', icon: 'clock', color: 'var(--content-secondary)' },
  disputed: { label: 'Disputed', icon: 'triangle-alert', color: 'var(--warning-strong)' },
  confirm: { label: 'Confirm now', icon: 'clock', color: 'var(--content-accent-brand)' },
};

function Chip({ children, style }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 8px', borderRadius: 'var(--radius-max)', background: 'var(--grouped-light)', whiteSpace: 'nowrap', ...textStyle('caption-1', { strong: true, tone: 'secondary' }), ...style }}>{children}</span>;
}

/** Provenance chip: how a weight was captured. Lucide `contrast` + Synced / OCR · high / Typed · unverified / Declared by farmer. */
export function ProvenanceChip({ kind = 'synced', label, style }) {
  const p = PROV[kind] || PROV.synced;
  return <Chip style={style}><Icon name="contrast" size={12} />{p.extra ? <Icon name={p.extra} size={12} /> : null}{label || p.label}</Chip>;
}

/** Confirmation chip: counterparty state. Lucide `diamond` + check / clock / triangle-alert. Never merged with provenance. */
export function ConfirmationChip({ kind = 'awaiting', label, style }) {
  const c = CONF[kind] || CONF.awaiting;
  return <Chip style={{ color: c.color, ...style }}><Icon name="diamond" size={12} /><Icon name={c.icon} size={12} />{label || c.label}</Chip>;
}
