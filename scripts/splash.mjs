#!/usr/bin/env node
// Writes the One Link splash from the one mark, so the two can never drift apart.
//
//   node scripts/splash.mjs           write project/assets/one-link-splash*.svg
//   node scripts/splash.mjs --check   fail if either file differs from what the mark gives
//
// The splash is the mark, animated: a pen draws its outline, the fill settles in, the
// outline fades, and a soft glint runs round the inside of the loops for as long as the
// wait lasts. The still is the same mark at rest, in the same viewBox, so an app that
// swaps one for the other under prefers-reduced-motion never moves the mark.
//
// The geometry and the colour are read from assets/one-link-mark.svg, never typed here.
// The viewBox is the mark's padded by 6 units on every side, so the drawing stroke is not
// clipped at the edges. `npm run build` runs the check, so a hand edit to either file, or
// a new mark without a regenerated splash, fails the Pages deploy.

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
  .draw { fill: none; stroke: ${fill}; stroke-width: 5; stroke-linejoin: round; stroke-linecap: round;
          stroke-dasharray: 1 1; stroke-dashoffset: 1;
          animation: draw .7s cubic-bezier(.65,0,.35,1) forwards, out .2s linear .78s forwards; }
  .fill { fill: ${fill}; opacity: 0; transform-box: fill-box; transform-origin: center;
          animation: settle .42s cubic-bezier(.2,.75,.25,1) .6s forwards; }
  .glint { fill: none; stroke: #fff; stroke-width: 26; stroke-linecap: round; stroke-dasharray: .05 .95; opacity: 0;
           animation: glint 1.8s cubic-bezier(.45,.05,.55,.95) 1.1s infinite; }
  @keyframes draw   { to { stroke-dashoffset: 0; } }
  @keyframes out    { to { opacity: 0; } }
  @keyframes settle { 0% { opacity: 0; transform: scale(.94); } 60% { opacity: 1; } 100% { opacity: 1; transform: scale(1); } }
  @keyframes glint  { 0% { opacity: 0; stroke-dashoffset: 0; } 12% { opacity: .5; } 88% { opacity: .5; } 100% { opacity: 0; stroke-dashoffset: -1; } }
  @media (prefers-reduced-motion: reduce) {
    .draw, .glint { display: none; }
    .fill { animation: none; opacity: 1; transform: none; }
  }
</style>
<defs><clipPath id="ol-splash-clip"><path d="${d}"/></clipPath></defs>
<path class="draw" pathLength="1" d="${d}"/>
<path class="fill" d="${d}"/>
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
