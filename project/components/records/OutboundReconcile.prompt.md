The Reconcile card of a delivery note (M4.DS.02; S12 C4, UX-20): Ordered, Loaded and Ticket net side by side, the variance in bold and the pair that is out named.

```jsx
<OutboundReconcile ordered="34.000" loaded="34.120" net="34.120" tolerance="0.080" />
<OutboundReconcile ordered="34.000" loaded="34.120" net="33.940" tolerance="0.080" />
```

- Only loaded against the ticket net is a tolerance: beyond it the card closes Beyond tolerance and the page refuses Ship. A note loaded under its order shows "Ordered against loaded" with the difference and still reads Within tolerance (Below plan belongs to the order, M4.OUT.07).
- Composes `ReconcileCard`; the inbound three-figure check is `ThreeWayReconcile`, which fails any pair and so does not fit outbound.
- The legal payload is its own card (`LoadMeter kind="payload"`), and the fertiliser weighbridge check is `VarianceReconcile`.
