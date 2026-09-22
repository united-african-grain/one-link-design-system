One Link lockup: placeholder mark, wordmark, BETA badge. Swap the mark for the real asset in `assets/` when supplied.
`markOnly` drops the wordmark and the badge and names the mark after the product, for the collapsed sidebar.

```jsx
<Logo product="One Link" />
<Logo showBeta={false} />
<Logo markOnly />
```
