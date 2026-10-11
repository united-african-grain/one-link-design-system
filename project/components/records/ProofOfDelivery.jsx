import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { Card } from '../data/Card.jsx';
import { DataTable } from '../data/DataTable.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';

/** Each proof item's status, an icon and a word (UX-14): what the receiver gave, what is still to come. */
export const PROOF_ITEM_MARKS = {
  received: { kind: 'clean', word: 'Received' },
  awaiting: { kind: 'neutral', word: 'Awaiting' },
  missing: { kind: 'attention', word: 'Missing' },
  'pending-sync': { kind: 'pending', word: 'Pending sync' },
  'in-review': { kind: 'pending', word: 'In review' },
  refused: { kind: 'breach', word: 'Refused' },
  superseded: { kind: 'neutral', word: 'Superseded' },
};

/** The proof's state for the delivery note (S12 C4 step 5, M4.OUT.05): Delivery refused when the receiver refused;
    In review when a capture waits in Captures in review; Pending sync while a capture waits on the phone; Proof
    missing when an item is missing past the proof window; Awaiting proof while the window is still open; Delivered
    once every item has arrived. Superseded items are kept and never count. Each is its own state: In review and
    Delivery refused are never Proof missing. */
export function proofState(items = []) {
  const live = items.filter((i) => i.status !== 'superseded');
  if (live.some((i) => i.status === 'refused')) return 'refused';
  if (live.some((i) => i.status === 'in-review')) return 'in-review';
  if (live.some((i) => i.status === 'pending-sync')) return 'pending-sync';
  if (live.length && live.every((i) => i.status === 'received')) return 'delivered';
  if (live.length && live.every((i) => i.status === 'received' || i.status === 'awaiting')) return 'awaiting';
  return 'missing';
}

export const PROOF_MARKS = {
  delivered: { kind: 'clean', word: 'Delivered' },
  awaiting: { kind: 'neutral', word: 'Awaiting proof' },
  missing: { kind: 'attention', word: 'Proof missing' },
  'pending-sync': { kind: 'pending', word: 'Pending sync' },
  'in-review': { kind: 'pending', word: 'In review' },
  refused: { kind: 'breach', word: 'Delivery refused' },
};

/** The delivery note's Proof of delivery card on its Details tab (M4.DS.02, clerk__12): Photograph, Receiver signature
    and Receiver name, each with its status and when and by whom it was captured, a superseded item kept beside the one
    that replaced it, and the proof's state at the right. `facts` are labelled fields under the items: the received
    quantity beside the shipped one, the refusal reason. */
export function ProofOfDelivery({ title = 'Proof of delivery', items = [], facts = [], style }) {
  const state = PROOF_MARKS[proofState(items)];
  const rows = items.map((i, n) => ({ id: `${i.item}-${n}`, ...i }));
  return (
    <Card gap={8} title={title} headerRight={<StatusMark kind={state.kind} label={state.word} size="body-4" />} style={style}>
      <div style={{ margin: '0 -16px' }}>
        <DataTable rowKey="id" minWidth={520} rows={rows} columns={[
          { key: 'item', label: 'Item', width: 'minmax(160px, 1fr)', wrap: true },
          { key: 'status', label: 'Status', width: '150px', render: (r) => { const m = PROOF_ITEM_MARKS[r.status] || PROOF_ITEM_MARKS.missing; return <StatusMark kind={m.kind} label={m.word} size="body-4" />; } },
          { key: 'captured', label: 'Captured (CAT)', width: '210px', wrap: true, tabular: true },
        ]} />
      </div>
      {facts.length ? (
        <dl style={{ margin: 0, paddingTop: 8, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          {facts.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <dt style={textStyle('body-4', { tone: 'secondary' })}>{label}</dt>
              <dd style={{ margin: 0, ...textStyle('body-3', { tabular: true }), overflowWrap: 'anywhere' }}>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Card>
  );
}
