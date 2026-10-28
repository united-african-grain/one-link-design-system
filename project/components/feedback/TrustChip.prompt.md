Two separate 24px pills that never merge: provenance (how a figure was captured) and confirmation (counterparty state).

```jsx
<ProvenanceChip kind="ocr-verified" />
<ProvenanceChip kind="declared-mill" />
<ConfirmationChip kind="disputed" />
```

Provenance reads in S57 words only: `synced` is Weighbridge, `ocr-verified` is Scanned slip, `unverified` is Unverified (it was `typed`; R-08) `declared` is Declared by farmer and `declared-mill` is Declared by mill (M7.IMP.05: a weight the mill declared, such as its offloaded weight). A mill's declaration is its own kind, so the farmer's words never change; never pass `label` to say "mill". The `ocr-high`, `ocr-medium` and `ocr-low` kinds are review-only and also read Scanned slip: no confidence word, signal or score is ever shown. There is no `bridge` kind: a ticket weighed in only is a readiness state (`ReadinessChip`), never a source.

On a weighbridge ticket the source is the labelled field Source (Weighbridge or Scanned slip) in the highlights panel and the Ticket source card, not this chip. Counterparty agreement is the field Counterparty status, drawn with `ConfirmationChip` (Confirmed, Disputed, Pending).
