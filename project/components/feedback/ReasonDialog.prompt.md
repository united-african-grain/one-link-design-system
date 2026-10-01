Use `ReasonDialog` for every decision that must carry a reason: the high-impact confirmation in Setup and Reject with a mandatory comment in Items to approve. One component, never a copy.

```jsx
<ReasonDialog title="Confirm high-impact change" busy={saving} onCancel={close} onConfirm={(reason) => save(reason)}>
  Bag-count tolerance changes from 0 bags to 2 bags, effective 01 Oct 2026, 00:00 CAT.
</ReasonDialog>

<ReasonDialog title="Reject variance hold" label="Comment" minLength={1} confirmLabel="Reject" confirmVariant="critical" />
```

The statement names the change in words, with its effective date and time in CAT. There is no hint line under the field (map UX-23): Confirm simply stays disabled until the reason is long enough, and a reason left too short becomes the field error "Reason must be at least 10 characters." While the decision lands, Confirm shows its spinner. The web app's twin is `ol-reason-dialog`.
