import React, { useState } from 'react';
import { Text, textStyle } from '../core/Text.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';
import { Dialog } from '../feedback/Dialog.jsx';
import { Button } from '../actions/Button.jsx';
import { Field, Input } from '../inputs/Field.jsx';
import { Card } from '../data/Card.jsx';
import { DataTable } from '../data/DataTable.jsx';
import { centsOf, fromCents } from '../data/GapBar.jsx';

/** A settlement's status (UX-32: the approval set, then Paid from S57's payment words), an icon and a word. A reversal
    is a compensating entry beside the settlement, which then reads Reversed. These, with the side and netting words
    below, are the one copy module for settlement wording: screens import them and never retype them. */
export const SETTLEMENT_STATUS = {
  draft: { kind: 'neutral', word: 'Draft' },
  pending: { kind: 'pending', word: 'Pending approval' },
  approved: { kind: 'clean', word: 'Approved' },
  rejected: { kind: 'breach', word: 'Rejected' },
  paid: { kind: 'clean', word: 'Paid' },
  reversed: { kind: 'neutral', word: 'Reversed' },
};
export function SettlementStatus({ status, size = 'body-4' }) {
  const s = SETTLEMENT_STATUS[status];
  return s ? <StatusMark kind={s.kind} label={s.word} size={size} /> : '';
}

/** The two sides and the figures under them (Sid's canvas, screen 5). The canvas's "UAG owes for grain" and "Farmer
    owes UAG" read without the company's name, because public copy says One Link and never names the company. */
export const NETTING_WORDS = {
  payable: 'Owed to the farmer for grain', owed: 'Owed by the farmer', grain: 'Grain payable', debts: 'Fertiliser and prepayment', offset: 'Offset', net: 'Net to pay the farmer',
  netOwed: 'Still owed by the farmer', order: 'Netting order', partial: 'Net less, with a reason',
};

/** The netting order (RL-NET-ORDER, UAG-202): a cash prepayment on the farmer's own contract is recovered first, then
    each other debt oldest first. Lines carry `kind: 'prepayment'` and a `date` sortable as given (the kit passes them
    in date order). */
export function nettingOrder(owed = []) {
  const pre = owed.filter((l) => l.kind === 'prepayment');
  const rest = owed.filter((l) => l.kind !== 'prepayment');
  return [...pre, ...rest].map((l, i) => ({ ...l, order: i + 1 }));
}

/** The settlement's figures, worked out from the lines and never typed: grain payable, what the farmer owes, the offset
    (all that can be netted, or `partial` when Finance nets less), the net to pay the farmer and what stays owed. Each
    debt line gets what this offset recovers from it, in netting order. */
export function nettingOf({ payable = [], owed = [], partial } = {}) {
  const grain = payable.reduce((n, l) => n + centsOf(l.amount), 0);
  const debts = owed.reduce((n, l) => n + centsOf(l.amount), 0);
  const full = Math.min(grain, debts);
  const offset = partial != null && partial !== '' ? Math.max(0, Math.min(full, centsOf(partial))) : full;
  let left = offset;
  const lines = nettingOrder(owed).map((l) => { const take = Math.min(left, centsOf(l.amount)); left -= take; return { ...l, recovered: fromCents(take) }; });
  return { grain: fromCents(grain), debts: fromCents(debts), offset: fromCents(offset), full: fromCents(full), partial: offset < full, net: fromCents(grain - offset), stillOwed: fromCents(debts - offset), lines, nothingToNet: grain === 0 || debts === 0 };
}

/** The reason a partial netting needs, in characters (S10 A6: a high-impact change needs ten). */
export const PARTIAL_REASON_MIN = 10;
/** A partial netting can be confirmed only with an offset below the full one and a reason of PARTIAL_REASON_MIN
    characters or more. */
export function canConfirmPartial({ offset, full, reason } = {}) {
  const o = centsOf(offset);
  return o >= 0 && String(offset == null ? '' : offset).trim() !== '' && o < centsOf(full) && String(reason || '').trim().length >= PARTIAL_REASON_MIN;
}

/**
 * Netting sides (M7.DS.02): a settlement proposal's two sides, Owed to the farmer for grain and Owed by the farmer, side by side and
 * stacked on a phone. The debt side is in netting order, each line numbered and showing what this offset recovers from
 * it. Under them, Grain payable, Offset and Net to pay the farmer (or Still owed by the farmer), all worked out by
 * `nettingOf`. Money is in the currency named in each table's header (UX-11). A viewer without the farmer account tier
 * never gets this component: the screen leaves it out.
 */
export function NettingSides({ payable = [], owed = [], partial, currency = 'USD', style }) {
  const n = nettingOf({ payable, owed, partial });
  const strong = (v) => <Text variant="body-3" strong tabular>{v}</Text>;
  return (
    <div data-netting="" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--card-gap)', minWidth: 0, ...style }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 'var(--card-gap)', alignItems: 'start' }}>
        <Card title={NETTING_WORDS.payable} gap={8}><div style={{ margin: '0 -16px -16px' }}>
          <DataTable rowKey="id" minWidth={420} rows={[...payable, { id: 'total', total: true, what: NETTING_WORDS.grain, amount: n.grain }]} columns={[
            { key: 'what', label: 'Delivery', width: 'minmax(150px, 1fr)', wrap: true, render: (r) => (r.total ? strong(r.what) : r.what) },
            { key: 'weight', label: 'Weight (t)', width: '84px', align: 'right' },
            { key: 'rate', label: `Rate (${currency} per t)`, width: '120px', align: 'right' },
            { key: 'amount', label: `Amount (${currency})`, width: '110px', align: 'right', render: (r) => (r.total ? strong(r.amount) : r.amount) },
          ]} />
        </div></Card>
        <Card title={NETTING_WORDS.owed} gap={8}><div style={{ margin: '0 -16px -16px' }}>
          <DataTable rowKey="id" minWidth={460} rows={[...n.lines, { id: 'total', total: true, what: NETTING_WORDS.debts, amount: n.debts, recovered: n.offset }]} columns={[
            { key: 'order', label: 'Order', width: '56px', align: 'right' },
            { key: 'what', label: 'Item', width: 'minmax(150px, 1fr)', wrap: true, render: (r) => (r.total ? strong(r.what) : r.what) },
            { key: 'amount', label: `Owed (${currency})`, width: '100px', align: 'right', render: (r) => (r.total ? strong(r.amount) : r.amount) },
            { key: 'recovered', label: `Netted (${currency})`, width: '104px', align: 'right', render: (r) => (r.total ? strong(r.recovered) : r.recovered) },
          ]} />
        </div></Card>
      </div>
      <dl data-netting-figures="" style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {[[NETTING_WORDS.grain, n.grain], [NETTING_WORDS.offset, n.offset], centsOf(n.stillOwed) > 0 && centsOf(n.net) === 0 ? [NETTING_WORDS.netOwed, n.stillOwed] : [NETTING_WORDS.net, n.net]].map(([label, value], i) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <dt style={textStyle('body-4', { tone: 'secondary' })}>{label}</dt>
            <dd style={{ margin: 0, ...textStyle(i === 2 ? 'heading-4' : 'body-2', { tabular: true, strong: i === 2 }) }}>{`${currency} ${value}`}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Net less, with a reason (M7.DS.02 AC 6): Finance nets less than the full offset. The dialog takes the offset and a
 * reason; Confirm stays disabled until the offset is below the full one and the reason has PARTIAL_REASON_MIN
 * characters (`canConfirmPartial`), so a partial netting cannot be pressed without a reason. Confirm shows its spinner
 * while `busy`. A phone draws it as a sheet.
 */
export function PartialNettingDialog({ open = true, full, currency = 'USD', defaultOffset = '', defaultReason = '', busy = false, sheet = false, contained = false, onCancel, onConfirm }) {
  const [offset, setOffset] = useState(defaultOffset);
  const [reason, setReason] = useState(defaultReason);
  const [left, setLeft] = useState(false);
  const ok = canConfirmPartial({ offset, full, reason });
  const short = left && String(reason).trim().length > 0 && String(reason).trim().length < PARTIAL_REASON_MIN;
  return (
    <Dialog open={open} title={NETTING_WORDS.partial} width={480} sheet={sheet} contained={contained} onClose={busy ? undefined : onCancel}
      footer={<>
        <Button variant="ghost" size="small" disabled={busy} onClick={onCancel}>Cancel</Button>
        <Button size="small" disabled={!ok} loading={busy} onClick={() => onConfirm && onConfirm({ offset, reason: String(reason).trim() })}>Confirm</Button>
      </>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Text variant="body-3">{`The full offset is ${currency} ${full}. What is not netted stays owed by the farmer.`}</Text>
        <Field label={`Offset (${currency})`} required><Input align="right" inputMode="decimal" value={offset} disabled={busy} onChange={(e) => setOffset(e.target.value)} /></Field>
        <Field label="Reason" required error={short ? `Reason must be at least ${PARTIAL_REASON_MIN} characters.` : null}>
          <Input multiline value={reason} invalid={short} disabled={busy} onChange={(e) => setReason(e.target.value)} onBlur={() => setLeft(true)} />
        </Field>
      </div>
    </Dialog>
  );
}
