import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { Button } from '../actions/Button.jsx';

/** The evidence a weight is confirmed against, at reading size: the photo in a grouped-elevated frame (radius 12) that
    zooms in and out in steps, and under it the zoom controls and the photo's fingerprint, the label Fingerprint over
    the short form of its hash, so the same photo is recognised wherever it is used again. Without a photo the frame
    shows the camera icon. Every weight input sits beside one of these (R-08).

    `regions` outline where each field was read from (M3.ING.06), as boxes in fractions of the image (x, y, width,
    height from 0 to 1); the one named by `activeRegion` is drawn solid, the rest faint. They follow the image through
    every zoom step and letterbox. Without regions nothing is drawn and the frame is as before. */
export function EvidenceViewer({ src, alt = 'Slip photo', fingerprint, zoom, defaultZoom = 1, onZoom, minZoom = 1, maxZoom = 3, step = 0.5, height = 360, regions, activeRegion, style }) {
  const [own, setOwn] = useState(defaultZoom);
  const [natural, setNatural] = useState(null);
  const level = zoom != null ? zoom : own;
  const set = (z) => { const v = Math.min(maxZoom, Math.max(minZoom, Math.round(z * 100) / 100)); if (zoom == null) setOwn(v); if (onZoom) onZoom(v); };
  return (
    <div data-evidence-viewer="" data-zoom={level} style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, ...style }}>
      <div style={{ height, borderRadius: 'var(--radius-sm)', background: 'var(--grouped-elevated)', overflow: 'auto', display: 'flex', alignItems: level > 1 ? 'flex-start' : 'center', justifyContent: level > 1 ? 'flex-start' : 'center', color: 'var(--content-secondary-solid)' }}>
        {src && regions && regions.length ? (
          <div data-regions="" style={{ position: 'relative', display: 'block', width: `${level * 100}%`, height: level > 1 ? 'auto' : '100%', flex: 'none', transition: 'width var(--dur-default) var(--ease-default)' }}>
            <img src={src} alt={alt} draggable={false} onLoad={(e) => setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              style={{ display: 'block', width: '100%', maxWidth: 'none', height: level > 1 ? 'auto' : '100%', objectFit: 'contain' }} />
            {natural ? (
              <svg aria-hidden="true" viewBox={`0 0 ${natural.w} ${natural.h}`} preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                {regions.map((r) => {
                  const on = r.key === activeRegion;
                  return <rect key={r.key} data-region={r.key} data-active={on || undefined} x={r.x * natural.w} y={r.y * natural.h} width={r.width * natural.w} height={r.height * natural.h} rx={4}
                    fill="none" stroke="var(--content-accent-brand)" strokeOpacity={on ? 1 : 0.35} strokeWidth={on ? 3 : 1.5} vectorEffect="non-scaling-stroke" />;
                })}
              </svg>
            ) : null}
          </div>
        ) : src ? (
          <img src={src} alt={alt} draggable={false} style={{ display: 'block', width: `${level * 100}%`, maxWidth: 'none', height: level > 1 ? 'auto' : '100%', objectFit: 'contain', flex: 'none', transition: 'width var(--dur-default) var(--ease-default)' }} />
        ) : <Icon name="camera" size={24} stroke={1.75} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Button variant="ghost" size="xsmall" icon="zoom-out" aria-label="Zoom out" title="Zoom out" disabled={!src || level <= minZoom} onClick={() => set(level - step)} />
          <span aria-live="polite" style={{ minWidth: 44, textAlign: 'center', ...textStyle('body-4', { tone: 'secondary', tabular: true }) }}>{Math.round(level * 100)}%</span>
          <Button variant="ghost" size="xsmall" icon="zoom-in" aria-label="Zoom in" title="Zoom in" disabled={!src || level >= maxZoom} onClick={() => set(level + step)} />
        </span>
        {fingerprint ? (
          <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, textAlign: 'right' }}>
            <dt style={textStyle('body-4', { tone: 'secondary' })}>Fingerprint</dt>
            <dd data-fingerprint="" style={{ margin: 0, ...textStyle('body-3', { tabular: true }), overflowWrap: 'anywhere' }}>{fingerprint}</dd>
          </dl>
        ) : null}
      </div>
    </div>
  );
}
