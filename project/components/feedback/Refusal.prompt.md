Use `Refusal` whenever an action is refused, in the S57 blocked pattern "[Action] is not allowed. [Reason]." Name the action exactly as its button does and give the reason in business words, never a code.

```jsx
<Refusal action="Submit for approval" reason="The weighbridge at Chisamba Shed has not reported since 06:10" />
// Submit for approval is not allowed. The weighbridge at Chisamba Shed has not reported since 06:10.
```

The button that was refused stays visible. A problem with one field's value is a `Field` error under that field, not a refusal. The web app's twin is `ol-refusal`.
