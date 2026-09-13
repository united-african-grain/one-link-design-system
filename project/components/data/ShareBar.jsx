import React from 'react';

/** 2px rounded share underline in a commodity colour (width = share). Optional dashed "declared" overlay beyond the firm share. */
export function ShareBar({ share = 0, declared = 0, color = 'var(--commodity-maize)', maxWidth = 200, height = 2, dimmed = false, style }) {
  const s = Math.max(0, Math.min(1, share)); const d = Math.max(0, Math.min(1 - s, declared));
  return (
    <span aria-hidden style={{ display: 'block', position: 'relative', width: '100%', maxWidth, height, borderRadius: height, background: 'var(--grouped)', opacity: dimmed ? 0.4 : 1, ...style }}>
      <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${s * 100}%`, borderRadius: height, background: color, transition: 'width var(--dur-card-in) var(--ease-card)' }} />
      {d > 0 ? <span style={{ position: 'absolute', left: `${s * 100}%`, top: 0, bottom: 0, width: `${d * 100}%`, borderRadius: height, backgroundImage: `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)` }} /> : null}
    </span>
  );
}
