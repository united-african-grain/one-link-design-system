Underline tabs for module rows, sub-navigation, panel tab bars and condensed commodity section tabs.

```jsx
<Tabs tabs={['Trade Board','Coverage','Approvals']} value="Coverage" onChange={setTab} />
<Tabs variant="commodity" tabs={['White maize','Wheat (local)','Soya','SE meal']} value="Wheat (local)" underlineColor="var(--commodity-wheat)" />
```
