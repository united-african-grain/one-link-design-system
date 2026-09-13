Chart card. Requires `<script src="https://unpkg.com/lightweight-charts@5.2.1/dist/lightweight-charts.standalone.production.js"></script>`. The TradingView attribution logo stays bottom-left; add `<ChartAttribution/>` in the page footer.

```jsx
<ChartCard title="Position over the month" ranges={['1M','3M','1Y']} range="1M"
  series={[{type:'area', color:'#2563EB', name:'Position', format:v=>'K'+v+'M', data}]} />
<ChartCard title="Kapiri Estates LTV" series={[{type:'baseline', baseValue:20, data}]} priceLines={[{price:22,color:'#df0c10',title:'22% cap'},{price:20,color:'#a16207',title:'20% line'}]} />
```
