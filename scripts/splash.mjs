#!/usr/bin/env node
// Writes the One Link splash from the one mark, so the two can never drift apart.
//
//   node scripts/splash.mjs           write project/assets/one-link-splash*.svg
//   node scripts/splash.mjs --check   fail if either file differs from what the mark gives
//
// The splash is the mark, whole and filled from the very first frame, with a soft white
// light running round the inside of the loops for as long as the wait lasts. Nothing is
// drawn or faded in first: the page appearing is the entrance. The light starts at 0.15s,
// so even a fast load sees it begin. The still is the same mark at rest, in the same
// viewBox, and the animated file's first frame is pixel identical to it, so an app that
// swaps one for the other under prefers-reduced-motion never moves the mark.
//
// The geometry and the colour are read from assets/one-link-mark.svg, never typed here.
// The viewBox is the mark's padded by 6 units on every side, the framing the apps already
// size and centre. `npm run build` runs the check, so a hand edit to either file, or a new
// mark without a regenerated splash, fails the Pages deploy.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'project', 'assets');
const PAD = 6;

export function splashFromMark(markSvg) {
  const d = markSvg.match(/<path[^>]*\sd="([^"]+)"/)?.[1];
  const fill = markSvg.match(/<path[^>]*\sfill="([^"]+)"/)?.[1];
  const box = markSvg.match(/viewBox="([^"]+)"/)?.[1].trim().split(/\s+/).map(Number);
  if (!d || !fill || !box || box.length !== 4 || box.some(Number.isNaN)) {
    throw new Error('one-link-mark.svg must hold one <path> with d and fill, and a four-number viewBox');
  }
  const [x, y, w, h] = box;
  const viewBox = `${x - PAD} ${y - PAD} ${w + 2 * PAD} ${h + 2 * PAD}`;
  const open = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="One Link">`;

  const animated = `${open}
<style>
  .glint { fill: none; stroke: #fff; stroke-width: 26; stroke-linecap: round; stroke-dasharray: .05 .95; opacity: 0;
           animation: glint 1.8s cubic-bezier(.45,.05,.55,.95) .15s infinite; }
  @keyframes glint { 0% { opacity: 0; stroke-dashoffset: 0; } 12% { opacity: .5; } 88% { opacity: .5; } 100% { opacity: 0; stroke-dashoffset: -1; } }
  @media (prefers-reduced-motion: reduce) { .glint { display: none; } }
</style>
<defs><clipPath id="ol-splash-clip"><path d="${d}"/></clipPath></defs>
<path fill="${fill}" d="${d}"/>
<g clip-path="url(#ol-splash-clip)"><path class="glint" pathLength="1" d="${d}"/></g>
</svg>
`;
  const still = `${open}<path fill="${fill}" d="${d}"/></svg>\n`;
  return { 'one-link-splash.svg': animated, 'one-link-splash-still.svg': still };
}

export function checkSplash(assets = ASSETS) {
  const expected = splashFromMark(readFileSync(join(assets, 'one-link-mark.svg'), 'utf8'));
  return Object.entries(expected)
    .filter(([name, body]) => {
      try { return readFileSync(join(assets, name), 'utf8') !== body; } catch { return true; }
    })
    .map(([name]) => name);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) {
    const stale = checkSplash();
    if (stale.length) {
      console.error(`The splash no longer matches the mark: ${stale.join(', ')}. Run \`node scripts/splash.mjs\`; never edit them by hand.`);
      process.exit(1);
    }
    console.log('Splash matches the mark.');
  } else {
    const files = splashFromMark(readFileSync(join(ASSETS, 'one-link-mark.svg'), 'utf8'));
    for (const [name, body] of Object.entries(files)) writeFileSync(join(ASSETS, name), body);
    console.log(`Wrote ${Object.keys(files).join(' and ')} from one-link-mark.svg.`);
  }
}
