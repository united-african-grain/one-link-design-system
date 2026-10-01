Use `ReverseDialog` for the only correction a permanent record allows: a ledger entry, a posted receipt, a weighbridge ticket. It is the S57 destructive confirmation, "Reverse [record]? A reversal entry will be created.", with a required reason, Cancel and Reverse.

```jsx
<ReverseDialog record="JE-2026-000412" onConfirm={(reason) => reverse(reason)} />
```

A permanent record never draws an Edit control. After Reverse, the record shows three rows: the original, the reversal that cancels it, and the replacement if one was posted. Nothing is changed or deleted.
