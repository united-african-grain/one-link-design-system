// Renders site/index.html, filling its @placeholders from project/tokens.
// Every value on the landing page is read from the token files, so the page
// cannot disagree with the CSS the app vendors.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** `--name: value; /* comment *\/` → { name: { value, note } } */
function parseVars(css) {
  const out = {};
  for (const m of css.matchAll(/--([\w-]+)\s*:\s*([^;]+);[ \t]*(?:\/\*\s*([^*]*?)\s*\*\/)?/g)) {
    out[m[1]] = { value: m[2].trim(), note: (m[3] || '').trim() };
  }
  return out;
}

const hex8 = (v) => {
  const h = v.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(h)) return '#' + [...h.slice(1)].map((c) => c + c).join('') + 'ff';
  if (/^#[0-9a-f]{6}$/.test(h)) return h + 'ff';
  if (/^#[0-9a-f]{8}$/.test(h)) return h;
  return null;
};
function luminance(v) {
  const h = hex8(v); if (!h) return 1;
  const [r, g, b, a] = [1, 3, 5, 7].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return a * L + (1 - a); // over white
}

// ---------------------------------------------------------------- colour
const SEMANTIC_GROUPS = [
  ['Surfaces', 'White does the lifting. Grey is kept for what recedes: search, unselected capsules, disabled fills, closed records.', {
    surface: 'Page ground', elevated: 'Cards, figure buttons, quantity chips, tickets', grouped: 'Secondary tiles, skeletons, row hover',
    'grouped-light': 'Search, unselected capsules, disabled fills', 'grouped-elevated': 'Grey tile inside a card',
    inverted: 'Inverted chips, chart crosshair labels', overlay: 'Dialog and sheet scrim' }],
  ['Content', 'Text and icons are navy-black at set opacities, so one token reads right on white and on grey.', {
    'content-primary': 'Titles, figures, main text', 'content-secondary': 'Meta lines, units, secondary text',
    'content-tertiary': 'Inactive tabs, captions. Never a figure', 'content-quaternary': 'Chevrons, placeholders, the restricted dash',
    'content-disabled': 'Disabled labels', 'content-accent-brand': 'Links, active stepper value',
    'content-accent-up': 'Positive delta text', 'content-accent-down': 'Negative delta text',
    'accent-up-fill': 'Up triangle, in-bars, live dot. Fills only, never text' }],
  ['Solid twins', 'The same greys as solid colours, for text laid over a photo, where translucency would pick up the image.', {
    'content-primary-solid': 'Primary text over photos', 'content-secondary-solid': 'Secondary text over photos',
    'content-tertiary-solid': 'Captions over photos', 'content-quaternary-solid': 'Chevrons over photos' }],
  ['Status', 'Subtle is the pale fill, strong is the text on it. Status is always an icon and a word, never colour alone.', {
    'info-subtle': 'Info banner fill', 'info-strong': 'Info banner text', 'success-subtle': 'Clean, within spec, confirmed',
    'success-strong': 'Text on success', 'warning-subtle': 'Attention, amber band, held for review',
    'warning-strong': 'Text on warning. #a16207 rather than #ca8a04, for AA', 'error-subtle': 'Breach, red band, hard block, sync silent',
    'error-strong': 'Text on error' }],
  ['Lines and actions', 'Hairlines, the button fills, and the BETA badge.', {
    border: 'Card outlines, dividers, selected capsule border', 'border-light': '3D edge, table row dividers',
    'border-elevated': 'Outlines on elevated layers', 'buttons-primary': 'Decisions: Approve, Finalise, Resolve case',
    'buttons-brand': 'Entry points: New trade, Raise GRN', 'buttons-critical': 'Decline, Void batch',
    'buttons-label': 'Labels on filled buttons', 'hover-overlay-darker': 'Subtle button fill, keyboard hint',
    'beta-fill': 'BETA badge', 'beta-label': 'BETA badge label' }],
];
const PALETTES = [
  ['gray', 'Solid greys for use over images'], ['grayt', 'Translucent navy greys, what the content tokens point at'],
  ['brand', 'One Link blue, 500 is #2563EB'], ['green', 'Up, success'], ['red', 'Down, error'],
  ['yellow', 'Warning'], ['teal', 'Supporting'], ['purple', 'Supporting'],
];
const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
const COMMODITIES = [
  ['commodity-maize', 'White maize'], ['commodity-wheat', 'Wheat (local and import)'], ['commodity-soya', 'Soya'],
  ['commodity-soya-meal', 'Soya meal'], ['commodity-fertilizer', 'Fertilizer'],
];

function contrast(v) {
  const L = luminance(v);
  return ((1.05) / (L + 0.05)).toFixed(1);
}

function renderColour(colors) {
  const paletteIndex = new Map();
  for (const [p] of PALETTES) for (const s of STEPS) {
    const v = colors[`${p}-${s}`]; if (!v) continue;
    const key = hex8(v.value);
    if (key && !paletteIndex.has(key + (p === 'grayt' ? 't' : ''))) paletteIndex.set(key + (p === 'grayt' ? 't' : ''), `${p === 'grayt' ? 'gray' : p}-${s}${p === 'gray' ? '-solid' : ''}`);
  }
  const pointsTo = (v) => {
    const k = hex8(v); if (!k) return null;
    const translucent = !k.endsWith('ff');
    return paletteIndex.get(k + (translucent ? 't' : '')) || paletteIndex.get(k) || null;
  };
  let count = 0;
  const groups = SEMANTIC_GROUPS.map(([title, blurb, uses]) => {
    const rows = Object.entries(uses).filter(([t]) => colors[t]).map(([t, use]) => {
      count++;
      const v = colors[t].value;
      const text = /^content|accent|strong$/.test(t);
      const swatch = text
        ? `<span class="chip"><span class="t-body-2 t-strong" style="color:${v}">Aa</span></span>`
        : `<span class="chip"><span class="chip-fill" style="background:${v}"></span></span>`;
      const to = pointsTo(v);
      return `<tr><td><code class="tok">--${t}</code><span class="use t-body-4">${esc(use)}</span></td>
        <td><span class="swatch-cell">${swatch}<code class="hex">${esc(v)}</code></span></td>
        <td>${to ? `<code class="ref">${to}</code>` : '<span class="t-body-4 muted">literal</span>'}</td></tr>`;
    }).join('');
    return `<div class="role-group"><div class="role-head"><h3 class="t-heading-4 t-strong">${title}</h3><p class="t-body-3 muted">${esc(blurb)}</p></div>
      <div class="table-scroll"><table class="roles"><thead><tr><th class="t-caption-1 t-strong">Token</th><th class="t-caption-1 t-strong">Value</th><th class="t-caption-1 t-strong">Points to</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  }).join('');

  const ramps = PALETTES.map(([p, note]) => {
    const cells = STEPS.map((s) => {
      const v = colors[`${p}-${s}`]?.value; if (!v) return '';
      count++;
      const dark = luminance(v) < 0.4;
      return `<div class="cell" style="background:${v};color:${dark ? '#fff' : 'var(--content-primary)'}"><span>${s}</span><span class="cell-hex">${esc(v.replace('#', ''))}</span></div>`;
    }).join('');
    return `<div class="ramp"><div class="ramp-name"><span class="t-body-3 t-strong">${p === 'grayt' ? 'gray, translucent' : p}</span><span class="t-caption-1 muted">${esc(note)}</span></div><div class="strip-scroll"><div class="strip">${cells}</div></div></div>`;
  }).join('');

  const commodity = COMMODITIES.map(([t, name]) => {
    const v = colors[t]?.value; if (!v) return '';
    count++;
    return `<li class="team-swatch"><span class="team-fill" style="background:${v}"><span class="t-body-3 t-strong">${esc(name)}</span></span>
      <span class="team-meta"><code class="hex">--${t} · ${esc(v)}</code><span class="t-caption-1 muted num">White label ${contrast(v)}:1</span></span>
      <span class="wash" style="background:color-mix(in oklab, ${v} 9%, transparent)"><i style="background:${v}"></i></span></li>`;
  }).join('');

  return { groups, ramps, commodity, count };
}

// ---------------------------------------------------------------- type
const INTER = [
  ['Display', [['display-1', '520', 'K125M'], ['display-4', '600', 'K190,790,400']]],
  ['Heading', [['heading-1', '600', 'Stock: Kafue Road, Lusaka'], ['heading-2', '600 · 540', 'Credit book: Winter Wheat 2026'], ['heading-3', '600 · 540', 'Needs you'], ['heading-4', '600 · 540', 'Coverage']]],
  ['Body', [['body-1', '580 · 480', 'Amount'], ['body-2', '580 · 480', 'ZAM4702 short 1,400t'], ['body-3', '580 · 480', 'Kafue Valley Milling · window closes in 12 days · 2d'], ['body-4', '580 · 480', 'folded from 41,882 movements · to 03 Aug 2026 · 07:10']]],
  ['Caption', [['caption-1', '580 · 480', 'Showing 4 of 72 trades · season 2026'], ['caption-2', '580 · 480', 'Charts by TradingView']]],
];
const CONDENSED = [
  ['display-1-condensed', 'K125M'], ['display-2-condensed', 'K11.8M'], ['display-3-condensed', '34,117'], ['display-4-condensed', '2,000 MT'],
  ['heading-1-condensed', 'ZAM4702 · Kafue Valley Milling'], ['heading-2-condensed', 'White maize  Wheat (local)  Soya'],
  ['heading-3-condensed', '53%'], ['body-2-condensed', '01 Critical'], ['caption-1-condensed', 'Target'], ['caption-2-condensed', 'Beta'],
];

function renderType(t) {
  let count = 0;
  const px = (v) => (v ? v.value.replace('px', '') : '');
  const inter = INTER.map(([group, rows]) => {
    const body = rows.flatMap(([name, weights, sample]) => {
      const strongRegular = weights.includes('·');
      const variants = strongRegular ? [['t-strong', 'strong'], ['', 'regular']] : [['', '']];
      return variants.map(([cls, label]) => {
        count++;
        const w = strongRegular ? weights.split(' · ')[label === 'strong' ? 0 : 1] : weights;
        const spec = `${px(t[`${name}-size`])}/${px(t[`${name}-line`])} · ${w} · ${t[`${name}-tracking`]?.value ?? '0'}`;
        return `<div class="type-row"><div class="type-meta"><code class="tok">t-${name}${label ? ` ${label}` : ''}</code><span class="t-caption-1 muted num">${esc(spec)}</span></div>
          <div class="type-sample t-${name} ${cls}">${esc(sample)}</div></div>`;
      });
    }).join('');
    return `<div class="type-group"><h3 class="t-caption-1-condensed muted group-label">${group}</h3>${body}</div>`;
  }).join('');
  const condensed = CONDENSED.map(([name, sample]) => {
    count++;
    const font = t[`font-${name}`]?.value || '';
    const m = font.match(/(\d+)px\/(\d+)px/);
    const spec = `${m ? `${m[1]}/${m[2]}` : ''} · 700 · ${t[`${name}-tracking`]?.value ?? '0'}`;
    return `<div class="type-row"><div class="type-meta"><code class="tok">t-${name}</code><span class="t-caption-1 muted num">${esc(spec)}</span></div><div class="type-sample t-${name}">${esc(sample)}</div></div>`;
  }).join('');
  return { html: inter + `<div class="type-group"><h3 class="t-caption-1-condensed muted group-label">Condensed · always uppercase</h3>${condensed}</div>`, count };
}

// ---------------------------------------------------------------- shape
const SHADOW_USES = {
  'shadow-flat': 'Border only, no lift', 'shadow-minimal': 'Stepper, selected segment, carousel arrows',
  'shadow-minimal-soft': 'Cards, tickets, decision panels, chart cards', 'shadow-middle': 'Quantity chips',
  'shadow-strong': '48px actions, menus, popovers', 'shadow-dialog': 'Dialogs, bottom sheets',
};
function renderShape(s) {
  const radii = Object.entries(s).filter(([k]) => k.startsWith('radius-')).map(([k, { value, note }]) =>
    `<figure class="radius"><div class="radius-box" style="border-radius:${value}"></div><figcaption><code class="tok">--${k}</code><span class="t-caption-1 muted num">${esc(value)}</span>${note ? `<span class="t-caption-2 muted">${esc(note)}</span>` : ''}</figcaption></figure>`).join('');
  const shadows = Object.entries(s).filter(([k]) => k.startsWith('shadow-')).map(([k]) =>
    `<figure class="shadow"><div class="shadow-box" style="box-shadow:var(--${k})"></div><figcaption><code class="tok">--${k}</code><span class="t-caption-1 muted">${esc(SHADOW_USES[k] || '')}</span></figcaption></figure>`).join('');
  const count = Object.keys(s).filter((k) => /^(radius|shadow)-/.test(k)).length;
  return { radii, shadows, count };
}

// ---------------------------------------------------------------- motion
function linearStops(v) {
  const m = v.match(/linear\(([^)]*)\)/); if (!m) return null;
  return m[1].split(',').map((x) => parseFloat(x));
}
function cubicBezier(v) {
  const m = v.match(/cubic-bezier\(([^)]*)\)/); if (!m) return null;
  const [x1, y1, x2, y2] = m[1].split(',').map(parseFloat);
  const bez = (t, a, b) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return Array.from({ length: 41 }, (_, i) => {
    const x = i / 40; let lo = 0, hi = 1;
    for (let k = 0; k < 30; k++) { const mid = (lo + hi) / 2; (bez(mid, x1, x2) < x ? (lo = mid) : (hi = mid)); }
    return bez((lo + hi) / 2, y1, y2);
  });
}
function renderMotion(m) {
  const curves = [
    ['ease-spring', 'var(--brand-500)', 2.5, 'Tab underline, label and spinner swaps, toggles · overshoots to 1.015'],
    ['ease-expand', 'var(--green-500)', 1.75, 'Accordions, bottom sheets · no overshoot'],
    ['ease-card', 'var(--gray-600)', 1.75, 'Card commodity wash · 400ms in, 160ms out'],
  ];
  const X0 = 40, X1 = 544, Y0 = 219, Y1 = 38;
  const y = (v) => (Y0 - (Y0 - Y1) * v).toFixed(1);
  let peak = null;
  const paths = curves.map(([k, color, width]) => {
    const pts = linearStops(m[k]?.value || '') || cubicBezier(m[k]?.value || '') || [0, 1];
    const d = pts.map((v, i) => `${i ? 'L' : 'M'}${(X0 + ((X1 - X0) * i) / (pts.length - 1)).toFixed(1)},${y(v)}`).join('');
    if (k === 'ease-spring') {
      const max = Math.max(...pts); const i = pts.indexOf(max);
      peak = { x: X0 + ((X1 - X0) * i) / (pts.length - 1), y: y(max), v: max };
    }
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round"/>`;
  }).join('');
  const grid = [0, 0.5, 1].map((v) => `<line x1="${X0}" x2="${X1}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="32" y="${+y(v) + 4}" text-anchor="end" class="axis">${v.toFixed(1)}</text>`).join('');
  const svg = `<svg class="ease-chart" viewBox="0 0 560 260" role="img" aria-label="Easing curves: progress from 0 to 1 over the duration">${grid}
    <text x="${X0}" y="250" class="axis">0</text><text x="292" y="250" text-anchor="middle" class="axis">50%</text><text x="${X1}" y="250" text-anchor="end" class="axis">duration</text>
    ${paths}${peak ? `<circle cx="${peak.x}" cy="${peak.y}" r="4" fill="var(--brand-500)" stroke="#fff" stroke-width="2"/><text x="${peak.x}" y="${peak.y - 10}" text-anchor="middle" class="axis strong">peak ${peak.v}</text>` : ''}</svg>`;
  const legend = curves.map(([k, color, , use]) => `<li><span class="legend-line" style="background:${color}"></span><code class="tok">--${k}</code><span class="t-body-4 muted">${esc(use)}</span></li>`).join('');
  const tracks = curves.map(([k, color]) => `<div class="track"><span class="t-caption-1 muted">${k}</span><div class="rail-line"><span class="dot" style="background:${color};transition:translate .6s var(--${k})"></span></div></div>`).join('');
  const durations = Object.entries(m).filter(([k]) => /^(dur|scale)-/.test(k)).map(([k, { value, note }]) =>
    `<div class="dur"><span class="t-body-3 t-strong num">${esc(value)}</span><code class="tok">--${k}</code>${note ? `<span class="t-caption-1 muted">${esc(note)}</span>` : ''}</div>`).join('');
  return { svg, legend, tracks, durations, count: curves.length };
}

// ---------------------------------------------------------------- cards
function renderCards(cards) {
  const groups = {};
  for (const c of cards) (groups[c.group || 'Other'] ||= []).push(c);
  return Object.entries(groups).map(([g, list]) => `<div class="card-group"><h3 class="t-caption-1-condensed muted group-label">${esc(g)}</h3><ul class="card-links">${
    list.map((c) => `<li><a class="rail-row" href="${esc(c.path)}"><span class="rail-surface" aria-hidden="true"></span><span class="rail-main"><span class="t-body-3 t-strong">${esc(c.name || c.path)}</span><span class="rail-sub t-body-4">${esc(c.subtitle || '')}</span></span><span class="t-caption-1 muted num toc-count">${c.width}×${c.height}</span><i data-lucide="chevron-right" class="chev"></i></a></li>`).join('')
  }</ul></div>`).join('');
}

export function renderLanding({ src, site, cards, cdn }) {
  const tok = (f) => parseVars(readFileSync(join(src, 'tokens', f), 'utf8'));
  const colour = renderColour(tok('colors.css'));
  const type = renderType(tok('typography.css'));
  const shape = renderShape(tok('shape.css'));
  const motion = renderMotion(tok('motion.css'));
  const componentCount = cards.filter((c) => /components\//.test(c.path)).length;

  const fill = {
    'colour-groups': colour.groups, 'colour-ramps': colour.ramps, 'colour-commodity': colour.commodity,
    type: type.html, radii: shape.radii, shadows: shape.shadows,
    'motion-chart': motion.svg, 'motion-legend': motion.legend, 'motion-tracks': motion.tracks, 'motion-durations': motion.durations,
    cards: renderCards(cards),
  };
  const counts = {
    colour: `${colour.count} tokens`, type: `${type.count} styles`, shape: `${shape.count} tokens`, motion: `${motion.count} curves`,
    components: `${componentCount} cards`, screens: `${cards.filter((c) => /ui_kits\//.test(c.path)).length} kits`,
  };

  let html = readFileSync(join(site, 'index.html'), 'utf8');
  html = html.replace(/<!--\s*@([\w-]+)\s*-->/g, (m, k) => (k in fill ? fill[k] : m));
  html = html.replace(/\{\{count\.([\w-]+)\}\}/g, (m, k) => counts[k] ?? m);
  html = html.replace(/\{\{cdn\.([\w-]+)\}\}/g, (m, k) => cdn[k] ?? m);
  return { html };
}
