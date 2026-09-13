The ticket. Variants: new trade (tabs Sell|Buy, commodity toggle, amount, quick amounts, summary, commodity-coloured Create trade), approval decision (Approve / Query / Decline), dispute resolution (RadioList + Resolve case), portal confirm (Confirm|Dispute + Confirm receipt).

```jsx
<ActionPanel tile="KV" context="Kafue Valley Milling · window closes 12 days" subject="New trade" tabs={['Sell','Buy']} tab="Sell">
  <PressToggle options={['White maize','Wheat']} value="White maize" selectedVariant="commodity" commodityColor="var(--commodity-maize)" />
  <AmountRow label="Tonnage" value="2,000" unit="MT" />
  <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><PressButton kind="quick">+100t</PressButton><PressButton kind="quick">+500t</PressButton><PressButton kind="quick">+1,000t</PressButton></div>
  <SummaryList items={[{label:'Price per MT',value:'6,800'},{label:'Margin preview',value:'K400,000',strong:true}]} />
  <PressButton kind="large" variant="commodity" commodityColor="var(--commodity-maize)" fullWidth>Create trade</PressButton>
</ActionPanel>
```
