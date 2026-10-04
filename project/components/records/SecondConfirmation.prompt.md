A correction above the threshold is held for a second confirmation. Show it under the Weights card.

```jsx
<SecondConfirmation field="Tare (t)" reading="13.380" entered="13.880" firstBy="S. Banda" firstAt="26 Sep 2026, 09:58 CAT" viewer="S. Banda" onWithdraw={() => setWithdrawing(true)} />
<ReasonDialog open={withdrawing} title="Withdraw correction?" confirmLabel="Withdraw" minLength={1} />
```

The reading, the entered value and the first confirmer are labelled fields. Withdraw is offered only to the person who confirmed first, and asks for a reason; anyone else sees Confirm weights, which shows its spinner while it works.
