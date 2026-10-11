import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { Card } from '../data/Card.jsx';
import { RefCell } from '../data/DataTable.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';
import { Refusal } from '../feedback/Refusal.jsx';

const tonnesOf = (v) => (v == null || String(v).trim() === '' ? 0 : Math.round(Number(String(v).replace(/[,\s]/g, ''))));
const fmt = (n) => n.toLocaleString('en-US');

/** A mill's import permit against its allocations (M6.DS.01; M6.COV.01, DP-PERMIT): what is allowed, what is
    booked, the headroom left and, for an allocation being entered, the headroom after it and any excess. Tonnes are
    summary figures, whole tonnes (UX-12). `excess` is above 0 only when the allocation would pass the permit, which is
    the only case the allocation is refused; an allocation that brings headroom exactly to 0 is allowed. */
export function permitHeadroom({ allowed, booked, adding = 0, wanted } = {}) {
  const a = tonnesOf(allowed), b = tonnesOf(booked), add = tonnesOf(adding);
  const headroom = Math.max(0, a - b);
  const after = a - b - add;
  return { allowed: a, booked: b, adding: add, headroom, after: Math.max(0, after), excess: Math.max(0, -after), refused: after < 0,
    overOrdered: wanted == null ? 0 : Math.max(0, tonnesOf(wanted) - a) };
}

/** The S57 blocked-action reason for a refused allocation (UX-21): it names the permit, its headroom and the excess.
    "Exceeds permit SI-2026-014 headroom of 50 t by 50 t." The action word, "Allocation", comes from Refusal. */
export function permitReason(permit, headroom, excess) {
  return `Exceeds permit ${permit} headroom of ${fmt(tonnesOf(headroom))} t by ${fmt(tonnesOf(excess))} t.`;
}

function PhFigure({ label, value, strong }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={textStyle('body-4', { tone: 'secondary' })}>{label}</span>
      <span style={{ ...textStyle(strong ? 'heading-3-condensed' : 'body-2', { tabular: true }), whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

/**
 * Permit headroom (M6.DS.01, M6.COV.01): the panel for one mill's import permit, drawn beside an allocation's tonnage,
 * on a shipment and in the permits list. Wanted (from the mill's monthly orders), Allowed, Booked and Headroom, whole
 * tonnes with t. While an allocation is typed, `adding` moves the headroom; one that would pass the permit is refused
 * in the S57 pattern, "Allocation is not allowed. Exceeds permit [permit] headroom of [n] t by [n] t.", and the screen
 * disables the action. Ordered above the permit is flagged with the warning icon; it is a flag, never a block.
 * Tonnes only: a permit carries no price.
 */
export function PermitHeadroom({ permit, mill, holder, period, wanted, allowed, booked, adding, onOpen, style }) {
  const h = permitHeadroom({ allowed, booked, adding, wanted });
  const typed = adding != null && String(adding).trim() !== '';
  return (
    <Card gap={12} padding={16} style={style}
      title={<span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>Permit {onOpen ? <RefCell onOpen={onOpen}>{permit}</RefCell> : permit}</span>}
      meta={[mill, holder ? `Holder: ${holder}` : null, period].filter(Boolean)}>
      <div data-permit={permit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: 12 }}>
        {wanted != null ? <PhFigure label="Wanted (t)" value={fmt(tonnesOf(wanted))} /> : null}
        <PhFigure label="Allowed (t)" value={fmt(h.allowed)} />
        <PhFigure label="Booked (t)" value={fmt(h.booked)} />
        <PhFigure label="Headroom (t)" value={fmt(h.headroom)} strong />
        {typed && !h.refused ? <PhFigure label="After this allocation (t)" value={fmt(h.after)} /> : null}
      </div>
      {h.overOrdered ? <StatusMark kind="attention" size="body-4" label={`Ordered ${fmt(h.overOrdered)} t more than permitted`} /> : null}
      {typed && h.refused ? <Refusal action="Allocation" reason={permitReason(permit, h.headroom, h.excess)} /> : null}
    </Card>
  );
}
