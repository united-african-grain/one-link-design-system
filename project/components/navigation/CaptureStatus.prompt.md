Every mobile capture screen shows the connection status and, while captures wait to send, Pending sync with the count (map UX-31). A capture is never lost to being offline; this line is how the person knows it is waiting.

```jsx
<CaptureStatus online={false} pending={3} />
```
