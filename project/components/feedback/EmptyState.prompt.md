Empty state for rails and lists. An empty list is not good news: the default is a neutral grey `inbox` with no green check (fix list 129, U4). Pass `tone="success"` and `icon="circle-check"` only where something is done and good.

```jsx
<EmptyState title="No tickets waiting" />
<EmptyState tone="success" icon="circle-check" meta="Checked 07:02 · next digest 13:00" />
```
