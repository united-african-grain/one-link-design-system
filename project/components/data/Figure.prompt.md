Headline KPI with delta and derivation. Every figure is derived — show the derivation line under headline figures.

```jsx
<Figure label="your position right now" value="K125M" size="display-1-condensed" derivation="physical K80M · in-transit K45M"
  derivationRows={[{label:'Physical stock',value:'K80M'},{label:'In transit',value:'K45M'},{label:'Position',value:'K125M',total:true}]} />
<Figure label="blended margin" value="K11.8M" delta="9.4%" />
```
