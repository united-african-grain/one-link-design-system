List-item card (trade, mill coverage, weighbridge ticket). Compose CardRow + ShareBar + QuantityChip + PressButton inside.

```jsx
<Card title="ZAM4702 · Kafue Valley Milling" meta={['White maize','2,000 MT','sell 6,800 · buy 6,600']} commodityColor="var(--commodity-maize)" interactive footer="Showing 4 of 72 trades · season 2026">
  <CardRow leading={<Avatar initials="KV" commodityColor="var(--commodity-maize)" />} name="Delivered" bar={<ShareBar share={0.7} color="var(--commodity-maize)" />} figure="1,400 / 2,000t"
    trailing={<><QuantityChip>1,400t</QuantityChip><PressButton kind="figure">K400,000</PressButton></>} />
</Card>
```
