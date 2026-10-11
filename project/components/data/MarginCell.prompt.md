Use `MarginCell` for every margin figure on a trading screen (M6.DS.01): per leg, per tonne and in total, in a table cell or a record field. One component, so a negative, a missing rate and a withheld figure read the same everywhere.

```jsx
<MarginCell value="8,365.00" onOpen={() => openCalc('A')} />                 // a table cell under Margin (USD)
<MarginCell value="-800.00" />                                              // the trending-down icon, the down colour, the minus
<MarginCell notSet />                                                       // its transport rate is missing: Not set, never 0
<MarginCell value="17,920.00" currency="USD" />                             // a record field: "USD 17,920.00"
<MarginCell value="11.95" currency="USD" unit="per t" />                    // "USD 11.95 per t"
<MarginCell restricted />                                                   // no contract tier on a shared layout
```

- **A negative margin is a signal, never hidden** (M6.TRD.02): the minus, the trending-down icon and `--content-accent-down`, with "negative margin" in its accessible name. Zero is a true 0.
- **A missing transport rate is Not set** (UX-16), with the amber triangle in the figure's place. The rate cell beside it is `NotSet` too, and the Calculation details the margin opens names the missing rate: "No transport rate for Mpongwe to Riverbend Mill Kitwe intake". `marginSign` reads a blank or non-numeric value as `notSet`, so a margin can never be drawn blank or as 0 by accident.
- **Restricted** (UX-09): pass `restricted` where the viewer lacks the contract tier and the field has to appear on a shared layout (a record's highlights). In a table, leave the column out instead.
- The currency goes in the table header (Margin (USD)) and in front of a field's value ("USD 17,920.00"), never both (UX-11).

The web app's twin is `ol-margin-cell`.
