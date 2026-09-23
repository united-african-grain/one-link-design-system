One Link lockup: the mark (white on a brand-blue tile, the same tile as the app icon), the wordmark, the BETA badge. The mark's files are in `assets/` (`one-link-mark.svg`, `one-link-mark-white.svg`, `one-link-tile.svg`, `one-link-app-icon.svg`); never redraw it.
`markOnly` drops the wordmark and the badge and names the mark after the product, for the collapsed sidebar.

```jsx
<Logo product="One Link" />
<Logo showBeta={false} />
<Logo markOnly />
```
