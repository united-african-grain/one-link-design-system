Chart card. Requires `<script src="https://unpkg.com/lightweight-charts@5.2.1/dist/lightweight-charts.standalone.production.js"></script>`. The TradingView attribution logo stays bottom-left; add `<ChartAttribution/>` in the page footer.

```jsx
<ChartCard title="Position over the month" ranges={['1M','3M','1Y']} range="1M"
  series={[{type:'area', color:'#2563EB', name:'Position', format:v=>'K'+v+'M', data}]} />
<ChartCard title="Kapiri Estates LTV" series={[{type:'baseline', baseValue:20, data}]} priceLines={[{price:22,color:'#df0c10',title:'22% cap'},{price:20,color:'#a16207',title:'20% line'}]} />
```

Colours may be tokens: `color: 'var(--commodity-wheat)'` or a price line's `color: 'var(--warning-strong)'` is read from the page when the chart draws (`chartColor`, M5.DS.02), so a kit screen never writes a hex. A plain colour still works as before.

```jsx
<ChartCard series={[{ type: 'line', color: 'var(--commodity-wheat)', name: 'Due to mills', data }]} priceLines={[{ price: 20, color: 'var(--warning-strong)', title: '20%' }]} />
```
