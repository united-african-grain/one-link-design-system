A QR code a person points a phone at: an authenticator setup code, a link to a record. Takes the matrix and renders it; it never encodes, so no encoder dependency enters the design system. The consumer encodes (any QR library) and passes `boolean[][]`.

White ground, `--content-primary` modules, a four-module quiet zone, `crispEdges`, `role="img"` with a label that says what the code is for. Always offer the same value as selectable text beside it: a code no camera will read is a dead end otherwise.

```jsx
<QrCode matrix={matrix} size={200} label="Two-step sign-in setup code for One Link" />
<QrCode matrix={matrix} size={148} quietZone={2} label="Receipt GR10000356" />
```
