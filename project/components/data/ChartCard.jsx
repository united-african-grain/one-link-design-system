import React, { useEffect, useRef, useState } from 'react';
import { textStyle } from '../core/Text.jsx';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../actions/Button.jsx';
import { CapsuleGroup } from '../actions/Capsule.jsx';

/** Chart card on TradingView Lightweight Charts v5 (window.LightweightCharts). series: [{type:'line'|'area'|'baseline'|'histogram', data, color, name, options}]. */
export function ChartCard({ title, ranges, range, onRange, series = [], priceLines = [], markers = [], height = 280, state = 'ready', onRetry, retrying = false, endLabel = true, footerNote, style }) {
  const ref = useRef(null);
  const [end, setEnd] = useState(null);
  useEffect(() => {
    const LW = window.LightweightCharts; const el = ref.current;
    if (!LW || !el || state !== 'ready' || !series.length) return;
    const chart = LW.createChart(el, {
      width: el.clientWidth, height,
      layout: { background: { type: 'solid', color: '#ffffff' }, textColor: 'rgba(0,15,33,0.45)', fontFamily: 'Inter', fontSize: 11, attributionLogo: true },
      grid: { vertLines: { visible: false }, horzLines: { color: 'rgba(0,18,55,0.10)', style: LW.LineStyle.Dotted } },
      rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.1, bottom: 0.1 } }, timeScale: { borderVisible: false },
      crosshair: { mode: LW.CrosshairMode.Magnet, vertLine: { color: 'rgba(0,16,42,0.25)', style: LW.LineStyle.Dashed, width: 1, labelBackgroundColor: '#23272d' }, horzLine: { color: 'rgba(0,16,42,0.25)', style: LW.LineStyle.Dashed, width: 1, labelBackgroundColor: '#23272d' } },
      handleScroll: false, handleScale: false,
    });
    const made = series.map((s) => {
      const color = s.color || '#2563EB';
      const base = { priceLineVisible: false, lastValueVisible: false, ...(s.options || {}) };
      let ser;
      if (s.type === 'area') ser = chart.addSeries(LW.AreaSeries, { lineColor: color, lineWidth: 2, topColor: s.topColor || 'rgba(37,99,235,0.12)', bottomColor: s.bottomColor || 'rgba(37,99,235,0)', ...base });
      else if (s.type === 'baseline') ser = chart.addSeries(LW.BaselineSeries, { baseValue: { type: 'price', price: s.baseValue }, lineWidth: 2, topLineColor: '#df0c10', topFillColor1: 'rgba(223,12,16,0.08)', topFillColor2: 'rgba(223,12,16,0.08)', bottomLineColor: '#007e26', bottomFillColor1: 'rgba(0,126,38,0.06)', bottomFillColor2: 'rgba(0,126,38,0.06)', ...base });
      else if (s.type === 'histogram') ser = chart.addSeries(LW.HistogramSeries, { color: '#04af52', ...base });
      else ser = chart.addSeries(LW.LineSeries, { color, lineWidth: 2, ...base });
      ser.setData(s.data);
      (s.priceLines || priceLines).forEach((p) => ser.createPriceLine({ price: p.price, color: p.color || '#df0c10', lineWidth: 1, lineStyle: LW.LineStyle.Dashed, axisLabelVisible: true, title: p.title || '' }));
      if (markers.length && LW.createSeriesMarkers) LW.createSeriesMarkers(ser, markers.map((m) => ({ time: m.time, position: m.position || 'aboveBar', color: '#23272d', shape: 'circle', text: m.text })));
      return { ser, s, color };
    });
    chart.timeScale().fitContent();
    const place = () => {
      const m = made[0]; if (!m || !endLabel || !m.s.data.length) return;
      const last = m.s.data[m.s.data.length - 1];
      const x = chart.timeScale().timeToCoordinate(last.time); const y = m.ser.priceToCoordinate(last.value != null ? last.value : last.close);
      if (x == null || y == null) return setEnd(null);
      setEnd({ x, y, color: m.color, name: m.s.name, value: m.s.format ? m.s.format(last.value) : last.value });
    };
    place();
    const ro = new ResizeObserver(() => { chart.applyOptions({ width: el.clientWidth }); chart.timeScale().fitContent(); place(); });
    ro.observe(el);
    return () => { ro.disconnect(); chart.remove(); };
  }, [series, height, state, priceLines, markers, endLabel]);
  return (
    <div style={{ background: 'var(--elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-minimal-soft)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      {(title || ranges) ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ flex: 1, ...textStyle('body-2', { strong: true }) }}>{title}</span>
          {ranges ? <CapsuleGroup options={ranges} value={range} onChange={onRange} /> : null}
        </div>
      ) : null}
      <div style={{ position: 'relative', height, minWidth: 0 }}>
        {state === 'ready' ? <div ref={ref} style={{ position: 'absolute', inset: 0 }} /> : null}
        {state === 'loading' ? <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'var(--radius-md)', background: 'var(--grouped)', animation: 'ol-reveal var(--dur-skeleton) var(--ease-default)' }} /> : null}
        {state === 'empty' ? <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...textStyle('body-3', { tone: 'tertiary' }) }}>No movements in this range</div> : null}
        {state === 'error' ? <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}><span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', ...textStyle('body-3', { tone: 'secondary' }) }}><Icon name="circle-alert" size={16} color="var(--error-strong)" />Chart data couldn't load</span><Button variant="outline" size="xsmall" icon="refresh-cw" loading={retrying} onClick={onRetry}>Retry</Button></div> : null}
        {state === 'ready' && end ? (
          <div aria-hidden style={{ position: 'absolute', left: end.x, top: end.y, transform: 'translate(-100%,-50%)', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 8, paddingRight: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: end.color, boxShadow: `0 0 0 4px color-mix(in srgb, ${end.color} 25%, transparent)`, flex: 'none', transform: 'translateX(4px)' }} />
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1, transform: 'translateY(-22px)', whiteSpace: 'nowrap', order: -1 }}>
              {end.name ? <span style={textStyle('caption-1', { strong: true, color: end.color })}>{end.name}</span> : null}
              <span style={textStyle('heading-3-condensed', { color: end.color })}>{end.value}</span>
            </span>
          </div>
        ) : null}
      </div>
      {footerNote ? <span style={textStyle('body-4', { tone: 'tertiary' })}>{footerNote}</span> : null}
    </div>
  );
}

/** Footer attribution required on every page that shows a chart. */
export function ChartAttribution({ style }) {
  return <a href="https://www.tradingview.com" target="_blank" rel="noreferrer" style={{ ...textStyle('caption-2', { tone: 'tertiary' }), textDecoration: 'none', ...style }}>Charts by TradingView</a>;
}
