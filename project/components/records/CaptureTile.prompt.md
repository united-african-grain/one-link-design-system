One capture waiting on the phone (M4.DS.03): a proof of delivery photograph, a receiver's signature or a refusal, with its sync state. The UAG One Link app's Pending sync list is a column of these, and the capture screens show the ones they made.

```jsx
<CaptureTile kind="photo" title="Photograph, DN10000441" meta="Taken 26 Sep 2026, 14:41 CAT" sync="queued" />
<CaptureTile kind="signature" title="Receiver signature, DN10000441" sync="sending" />
<CaptureTile kind="photo" title="Photograph, DN10000437" sync="damaged" onRecapture={retake} />
<CaptureStatus online={false} pending={pendingSyncCount(captures)} />
```

- `sync` is the sync state machine's own value, never a local guess. Queued and sending keep the spinner and "Pending sync" until the server confirms; only then is it Synced. A send button over a queued capture stays busy for the same reason.
- A damaged file reads "File is damaged. Capture it again." with Capture again, which shows its working state.
- `pendingSyncCount` counts every capture not yet synced, damaged ones included, so `CaptureStatus` never reads "Pending sync (0)" while one waits.
- Operations words only: no value, price or margin, and nothing about how sending works.

The Flutter twin, `OlCaptureTile` in one-link-mobile `lib/ds`, is ported by the feature card that first needs it, with the same four states and the same count.
