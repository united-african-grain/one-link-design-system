Where a figure comes from, drawn as the labelled field Source: "Trade sheet, 01 Oct 2026". Owen's screens use business language only (S08, S57), so the source is named the way a person would name it (Trade sheet, Stock sheet, Season book, Load register, Weighbridge, Scanned slip, Delivery note, Invoice, Farmer ledger) and never by how it got in: no batch, upload, template or sync. The date reads DD MMM YYYY.

```jsx
<SourceLine kind="stock-sheet" date="30 Sep 2026" />
<SourceLine kind="trade-sheet" date="01 Oct 2026" inline />
```

It is a field, never a chip and never a sentence. In Calculation details the same words sit in the Basis rows: `{ label: 'Source', value: sourceWords('trade-sheet', '01 Oct 2026') }`.
