Use `KpiTile` for a Home's headline figures (map UX-08): at most four, each opening Calculation details. The figure carries its currency code and may use K or M, which only tiles and the daily summary email do (UX-11); the caption is one line ("As of 26 Sep 2026, 07:02 CAT", "21.8% of total exposure"). When the figure rests on a setting with no value, pass `notSet`: the tile shows Not set with the amber triangle, and the `CalculationDetails` it opens shows the same state and names the setting and its owner (UX-16). Pass the tiles through `kpiTiles` so a fifth is never drawn and a missing one is never a placeholder. The web app's twin is `ol-kpi-tile`.

```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--card-gap)' }}>
  {kpiTiles([
    <KpiTile key="t" label="Total exposure" value="USD 2.66M" caption="As of 26 Sep 2026, 07:02 CAT" onOpen={open} />,
    <KpiTile key="u" label="Uncovered exposure" value="USD 579.8K" caption="21.8% of total exposure" onOpen={open} />,
    <KpiTile key="c" label="Coverage" notSet caption="As of 26 Sep 2026, 07:02 CAT" onOpen={open} />,
  ])}
</div>
```
