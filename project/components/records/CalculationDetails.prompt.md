Every KPI tile and drillable figure opens Calculation details (map UX-18): the name and full value, the components with a bold total, the basis (exchange rate, rate date, source), and at most one button to the underlying records. It closes with the X.

```jsx
<CalculationDetails
  name="Value at risk"
  value="USD 63,936.89"
  components={[{ label: 'SYN9001 short', value: '230.000 t' }, { label: 'Sell price', value: 'K7,400.00/t' }]}
  total={{ value: 'K1,702,000.00' }}
  basis={[{ label: 'Exchange rate', value: '26.62 ZMW per USD' }, { label: 'Rate date', value: '15 Oct 2026' }, { label: 'Source', value: 'Central bank' }]}
  action={{ label: 'Open contracts' }}
  onClose={close}
/>
```

When the figure rests on a setting with no value, its value is `<NotSet />` and the basis names the setting and its owner:

```jsx
<CalculationDetails name="Storage carry" value={<NotSet />} basis={[{ label: 'Carry rate', value: <NotSet owner="Managing Director" /> }]} />
```
