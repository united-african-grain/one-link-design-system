List-item card (trade, mill coverage, weighbridge ticket). Compose CardRow + ShareBar + QuantityChip + PressButton inside.

```jsx
<Card title="ZAM4702 · Kafue Valley Milling" meta={['White maize','2,000 MT','sell 6,800 · buy 6,600']} commodityColor="var(--commodity-maize)" interactive footer="Showing 4 of 72 trades · season 2026">
  <CardRow leading={<Avatar initials="KV" commodityColor="var(--commodity-maize)" />} name="Delivered" bar={<ShareBar share={0.7} color="var(--commodity-maize)" />} figure="1,400 / 2,000t"
    trailing={<><QuantityChip>1,400t</QuantityChip><PressButton kind="figure">K400,000</PressButton></>} />
</Card>
```

A list row whose second line is a sentence (Setup Home's Pending approval and Users needing attention) takes `stacked`: the sub sits on its own line under the name, and both wrap rather than being cut. Without it, name and sub share one line, each cut with an ellipsis.

```jsx
<Card title="Pending approval">
  <CardRow stacked name="Switch change: Weight source, UAG warehouse" sub="Scanned slip to Weighbridge, waiting for Owen"
    trailing={<StatusMark kind="pending" label="Pending approval" size="body-4" />} />
</Card>
```
