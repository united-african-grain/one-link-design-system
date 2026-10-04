Two separate 24px pills that never merge: provenance (how a figure was captured) and confirmation (counterparty state).

```jsx
<ProvenanceChip kind="ocr-verified" />
<ConfirmationChip kind="disputed" />
```

Provenance reads in S57 words only: `synced` is Weighbridge, `ocr-verified` is Scanned slip, `unverified` is Unverified (it was `typed`; R-08) and `declared` is Declared by farmer. The `ocr-high`, `ocr-medium` and `ocr-low` kinds are review-only and also read Scanned slip: no confidence word, signal or score is ever shown. There is no `bridge` kind: a ticket weighed in only is a readiness state (`ReadinessChip`), never a source.

On a weighbridge ticket the source is the labelled field Source (Weighbridge or Scanned slip) in the highlights panel and the Ticket source card, not this chip. Counterparty agreement is the field Counterparty status, drawn with `ConfirmationChip` (Confirmed, Disputed, Pending).
