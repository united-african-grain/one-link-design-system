import React, { useLayoutEffect, useRef } from 'react';

const pascal = (n) => n.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');

/** Lucide icon. Requires the Lucide UMD bundle on window.lucide (see readme → Iconography). Paints in currentColor. */
export function Icon({ name, size = 16, stroke = 2, color = 'currentColor', style, className, spin = false, title }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    el.innerHTML = '';
    const L = window.lucide; if (!L || !L.icons) return;
    const node = L.icons[pascal(name)]; if (!node) return;
    let svg;
    try {
      svg = node[0] === 'svg' ? L.createElement(node) : L.createElement(node, {});
    } catch (e) { return; }
    svg.setAttribute('width', size); svg.setAttribute('height', size);
    svg.setAttribute('stroke-width', stroke); svg.setAttribute('aria-hidden', 'true');
    el.appendChild(svg);
  }, [name, size, stroke]);
  return (
    <span ref={ref} className={className} title={title} data-icon={name}
      style={{ display: 'inline-flex', width: size, height: size, flex: 'none', color, lineHeight: 0,
        animation: spin ? 'ol-spin var(--dur-spin) linear infinite' : undefined, ...style }} />
  );
}
