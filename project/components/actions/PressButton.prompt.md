3D press button: anything that commits something sits on a 4px edge and sinks into it (50ms down, 100ms up).

```jsx
<PressButton kind="figure">53%</PressButton>
<PressButton kind="quick">+500t</PressButton>
<PressButton kind="large" variant="primary" fullWidth loading>Finalise GRN</PressButton>
<PressToggle options={['Sell','Buy']} value="Sell" onChange={setSide} selectedVariant="commodity" commodityColor="var(--commodity-maize)" />
```
