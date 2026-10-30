A figure that is indicative only (M7.DS.02 AC 4; RL-NOT-VALUATION, Map D-16, D-17, D-40), such as the weighted-average cost of stock.

```jsx
const calc = indicativeCalc({ name: 'Weighted average cost, wheat', value: 'USD 504.90 per t', leavesOut: ['Transport', 'Clearing Docs', 'Commissions'], rate: 'ZMW 25.00 per USD', rateDate: '26 Sep 2026' });
<IndicativeFigure name="Weighted average cost, wheat" value="USD 504.90 per t" onOpen={() => setOpen(true)} />
<CalculationDetails open={open} {...calc} onClose={() => setOpen(false)} />
<IndicativeFigure variant="inline" value="504.90" onOpen={...} />   // in a table cell
<IndicativeFigure restricted />                                      // no contract tier
```

- The name always starts with Indicative and the label "Indicative, not a valuation" is always drawn. There is no prop to hide either.
- Calculation details come from `indicativeCalc`: the basis is the purchase contract cost of each lot, then the cost categories it leaves out, then the exchange rate with its date and the source. A missing rate is Not set with its owner, never an earlier rate.
- Never name a field valuation or month-end value. A viewer without the contract tier gets `restricted` (the lock) on a shared layout, or no figure at all.
- `INDICATIVE_LABEL`, `INDICATIVE_NAME` and `INDICATIVE_BASIS` are the one copy module for these words.
