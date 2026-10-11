The delivery note's Proof of delivery card, on its Details tab (M4.DS.02; S12 C4 step 5, M4.OUT.05, clerk__12).

```jsx
<ProofOfDelivery items={[
  { item: 'Photograph', status: 'missing' },
  { item: 'Receiver signature', status: 'missing' },
  { item: 'Receiver name', status: 'missing' },
]} />
<ProofOfDelivery items={received} facts={[['Shipped', '33.880 t'], ['Received', '33.640 t'], ['Difference', '0.240 t']]} />
```

- The proof's state is worked out from its items (`proofState`): Delivery refused, In review, Pending sync, Delivered, Awaiting proof while the proof window (1 day, a setting) is open, else Proof missing. In review and Delivery refused are their own states, never Proof missing.
- Each item is an icon and a word: Received, Awaiting, Missing, Pending sync, In review, Refused, Superseded. A replaced capture stays in the list as Superseded; nothing is deleted.
- Proof missing also puts a `ConditionBanner` above the record's highlights ("Proof of delivery not received after 1 day."); the card itself carries no sentence.
- No price, value or margin: the received quantity sits beside the shipped one in tonnes.
