Segmented control for 2–4 mutually exclusive views: `Overview | Trends`, `$ | ZMW`, the readiness strip.

```jsx
<Segmented options={['Overview','Trends']} value="Overview" onChange={setView} />
<Segmented options={[{value:'ready',label:'Ready',icon:'check',count:3},{value:'prob',label:'Problematic',icon:'triangle-alert',count:1}]} value="ready" />
```
