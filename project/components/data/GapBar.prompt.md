A sale contract's two gaps (M7.DS.02 AC 1h, M7.SET.04; Sid's canvas, the receivables position): the gap to invoice, collected (invoice-ready) and not yet invoiced, and the gap to pay, invoiced and not yet paid.

```jsx
<GapBar row={{ collected: '4,812.40', invoiced: '3,460.00', paid: '2,888.46' }} />
<GapBar row={row} figures={false} />   // the bar alone, beside the table's own gap columns
```

- Both gaps are `gapsOf(row)`: collected less invoiced, and invoiced less paid, never below zero. Loads awaiting destination weight are not collected yet and sit in neither gap. They are worked out from the one row and never read from a stored figure, so a gap field on the row is ignored.
- The bar draws the collected tonnes as the track, the invoiced share lighter and the paid share solid. Tonnes only: the bar never carries money, so it needs no price tier.
- The words come from `GAP_WORDS`: Gap to invoice, Gap to pay, Awaiting destination weight.
