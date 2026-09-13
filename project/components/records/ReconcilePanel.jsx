import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { Banner } from '../feedback/Banner.jsx';
import { ProvenanceChip } from '../feedback/TrustChip.jsx';
import { Button } from '../actions/Button.jsx';
import { PressButton } from '../actions/PressButton.jsx';

/** Three-outcome reconcile panel: figure columns with provenance, then a banner and the right action for within / held / block. */
export function ReconcilePanel({ columns, outcome = 'within', message, loading = false, onAction, onReweigh, onPhotograph, evidence, style }) {
  const cols = columns || [
    { label: 'Weighed in', value: '28.20', unit: 't', provenance: 'synced' },
    { label: 'Deduction', value: '0.00', unit: 't', provenance: 'ocr-medium' },
    { label: 'Applied', value: '28.20', unit: 't', provenance: 'typed' },
  ];
  const msg = message || (outcome === 'within' ? 'Within tolerance — reconciled clean' : outcome === 'held' ? '1.2t short vs weighed — outside 0.5 MT tolerance · held for Thandiwe' : 'Hard block — tare cannot exceed gross. This is physically impossible.');
  return (
    <div style={{ background: 'var(--elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-minimal-soft)', padding: 16, display: 'flex', flexDirection: 'column', gap: 16, ...style }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, minmax(0,1fr))`, gap: 16 }}>
        {cols.map((c, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: i ? 16 : 0, borderLeft: i ? '1px solid var(--border-light)' : 0, minWidth: 0 }}>
            <span style={textStyle('caption-1-condensed', { tone: 'tertiary' })}>{c.label}</span>
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}><span style={textStyle('heading-1-condensed', { tabular: true, color: c.color })}>{c.value}</span>{c.unit ? <span style={textStyle('body-3', { tone: 'quaternary' })}>{c.unit}</span> : null}</span>
            {c.sub ? <span style={{ ...textStyle('body-4', { tone: 'secondary' }), fontVariantNumeric: 'tabular-nums' }}>{c.sub}</span> : null}
            {c.provenance ? <ProvenanceChip kind={c.provenance} style={{ alignSelf: 'flex-start' }} /> : null}
          </div>
        ))}
      </div>
      {evidence ? <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{evidence}</div> : null}
      {outcome === 'block' ? (
        <div style={{ borderRadius: 'var(--radius-md)', background: 'var(--error-subtle)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ display: 'flex', gap: 8, alignItems: 'flex-start', ...textStyle('body-3', { color: 'var(--error-strong)' }), textWrap: 'pretty' }}><Icon name="octagon-x" size={16} style={{ marginTop: 2 }} />{msg}</span>
          <div style={{ display: 'flex', gap: 8 }}><Button variant="outline" icon="rotate-ccw" onClick={onReweigh}>Re-weigh</Button><Button variant="outline" icon="camera" onClick={onPhotograph}>Photograph slip</Button></div>
        </div>
      ) : (
        <>
          <Banner tone={outcome === 'within' ? 'success' : 'warning'} icon={outcome === 'within' ? 'check' : 'triangle-alert'}>{msg}</Banner>
          <PressButton kind="large" variant="primary" fullWidth loading={loading} onClick={onAction}>{outcome === 'within' ? 'Finalise GRN' : 'Send for review'}</PressButton>
        </>
      )}
    </div>
  );
}
