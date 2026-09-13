Typed text primitive: one prop picks the type style, another the semantic tone. Condensed styles (Instrument Sans 700, uppercase) are for headline figures, commodity tabs and detail titles only.

```jsx
<Text variant="body-2" strong>Kafue Valley Milling</Text>
<Text variant="display-1-condensed" tabular>K125M</Text>
<Text variant="body-4" tone="tertiary">physical K80M · in-transit K45M</Text>
```

`textStyle(variant, opts)` returns the style object for use on your own elements.
