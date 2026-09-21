import React from 'react';

/**
 * QR code drawn from a boolean matrix. One crisp SVG: white ground (`--elevated`),
 * `--content-primary` modules, quiet zone measured in modules, radius on the ground.
 *
 * It does NOT encode. The caller passes the matrix it already has, so the design system
 * keeps no encoder dependency and this file owns only appearance: quiet zone, module size,
 * colour, radius. Never a canvas and never an <img> with a data URI, so it stays crisp at
 * any size and follows the tokens.
 */
export function QrCode({ matrix, size = 200, label = 'QR code', quietZone = 4, style }) {
  const rows = Array.isArray(matrix) ? matrix : [];
  const span = rows.length + quietZone * 2;
  // One path, one module per 1x1 unit: a 45x45 code is 2,000 rects otherwise.
  let d = '';
  for (let y = 0; y < rows.length; y++) {
    const row = Array.isArray(rows[y]) ? rows[y] : [];
    for (let x = 0; x < row.length; x++) if (row[x]) d += `M${x + quietZone} ${y + quietZone}h1v1h-1z`;
  }
  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`0 0 ${span} ${span}`}
      shapeRendering="crispEdges"
      style={{ display: 'block', flex: 'none', borderRadius: 'var(--radius-sm)', ...style }}
    >
      <rect width={span} height={span} fill="var(--elevated)" />
      {d ? <path d={d} fill="var(--content-primary)" /> : null}
    </svg>
  );
}
