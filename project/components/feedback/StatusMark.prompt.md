Icon + word status. Pair every status with both; colour is never the only signal.

```jsx
<StatusMark kind="clean" />
<StatusMark kind="attention" label="receive 30d, outside 14d policy" />
<StatusMark kind="awaiting" label="Awaiting resolution" />
```

The map's statuses (UX-14) are one or two words in sentence case after their icon, one icon and tone each, everywhere: `circle-check` green for done or active (`clean` with the map's word), `pending` amber clock for pending, waiting or acknowledged, `attention` amber triangle for a warning, `breach` red circle for a problem or an open exception, `locked` red lock, `neutral` grey clock for a neutral state such as Draft, and `notSet` for a required setting with no value (UX-16).

```jsx
<StatusMark kind="clean" label="Active" />
<StatusMark kind="pending" label="Waiting for approval" />
<StatusMark kind="neutral" />            {/* Draft */}
<StatusMark kind="notSet" />             {/* Not set */}
```
