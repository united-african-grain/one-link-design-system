One Link lockup: the mark in brand blue, the wordmark, the BETA badge. The white-on-blue tile is for the app icon and browser tab only. The mark's files are in `assets/` (`one-link-mark.svg`, `one-link-mark-white.svg`, `one-link-tile.svg`, `one-link-app-icon.svg`); never redraw it.
`markOnly` drops the wordmark and the badge and names the mark after the product, for the collapsed sidebar.

```jsx
<Logo product="One Link" />
<Logo showBeta={false} />
<Logo markOnly />
```
