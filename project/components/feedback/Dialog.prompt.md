Dialog or bottom sheet with scrim.

```jsx
<Dialog title="Void batch?" onClose={close} footer={<><Button variant="ghost">Cancel</Button><Button variant="critical">Void batch</Button></>}>This removes 14 tickets from today's batch.</Dialog>
<Dialog sheet contained>…decision panel…</Dialog>
```
