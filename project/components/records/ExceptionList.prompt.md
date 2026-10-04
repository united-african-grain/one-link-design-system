The Exceptions list view's table. The screen gives it the title with its count, the view selector, the filters (Open, Acknowledged, Closed) and search.

```jsx
<ExceptionList rows={rows} variant="clerk" onOpen={open} />
<ExceptionList rows={rows} variant="owner" priceTier onOpen={open} />
```

- The clerk reads operational wording; the owner reads business wording only, from rule configuration, never a system term. In the owner variant nothing but `business` and `businessRecord` is drawn from a row, so no source, connection or ticket reference can reach him.
- Record is a blue link only where the viewer can open that record (UX-01); otherwise plain text, such as a counterparty name for the clerk.
- Value at risk (USD) is a column only for a viewer with the price tier.
- Severity is the type and the row order. There is no coloured severity tag (UX-26).
- Status is `ExceptionStatus`: Open (the red exclamation circle), Acknowledged (it stays open), Closed.
- Nothing to show reads "No exceptions to display."; the screen keeps the title and a count of 0 (UX-15).
