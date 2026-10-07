A weighbridge ticket's readiness, drawn as its status: a `StatusMark` (icon and word), so it adds no look of its own.

```jsx
<RecordHighlights kind="Weighbridge ticket" title="WBT10001606" status={<ReadinessChip kind="ready" />}
  fields={[{ label: 'Gross', value: '46.280 t' }, { label: 'Source', value: 'Weighbridge' }]} />
```

Kinds: `ready` Ready, `weighed-in-only` Weighed in, `stalled` Stalled, `problem` Problem, `pending-reading` Pending reading, `awaiting-confirmation` Waiting for confirmation, `received` Received, `closed` Closed.

Readiness, the weight's source and counterparty agreement are three separate things (P9). Readiness is this mark beside the ticket number; the source is the labelled field Source (Weighbridge or Scanned slip); agreement is the field Counterparty status. Never nest one inside another, and never draw the source as a chip on a ticket.
