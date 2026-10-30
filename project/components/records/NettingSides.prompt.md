A settlement proposal's two sides (M7.DS.02 AC 1n, 6; Sid's canvas screen 5; F8.6, F8.7, RL-NET-ORDER).

```jsx
<NettingSides payable={[{ id: 'p1', what: 'FD-0142, 25 Sep 2026, grade 2', weight: '31.980', rate: '500.00', amount: '15,990.00' }]}
  owed={[{ id: 'o1', what: 'Cash prepayment, PAY-0401', kind: 'prepayment', amount: '4,000.00' }, { id: 'o2', what: 'Fertiliser, Urea 50 kg, DN 3310', amount: '9,420.00' }]} />
<NettingSides payable={...} owed={...} partial="19,570.00" />
<PartialNettingDialog full="23,760.00" />
```

- The sides are Owed to the farmer for grain and Owed by the farmer (the canvas's wording without the company's name). The debt side is in netting order (`nettingOrder`): a cash prepayment first, then the rest oldest first, each numbered, each with what this offset recovers from it.
- Grain payable, Offset and Net to pay the farmer (or Still owed by the farmer) are `nettingOf`: worked out, never typed.
- Net less, with a reason is `PartialNettingDialog`: Confirm stays disabled until the offset is below the full one and the reason has ten characters (`canConfirmPartial`).
- Statuses are `SETTLEMENT_STATUS`: Draft, Pending approval, Approved, Rejected, Paid and Reversed, an icon and a word.
- A viewer without the farmer account tier never gets this component.
