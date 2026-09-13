#!/usr/bin/env node
// Builds the published One Link design system into dist/.
//
//   npm run build     then   npm run serve
//
// project/ is the Claude Design export and stays the source of truth. Its pages
// compile React components in the browser with Babel, which is slow on a phone,
// so the build:
//   1. copies project/ to dist/
//   2. compiles every component into dist/_ds_bundle.js (window.OneLinkDS)
//   3. compiles each UI kit's screens into a bundle beside its index.html
//   4. rewrites every page: production React, no Babel, scripts precompiled
//   5. renders the landing page from site/, with token tables generated from
//      project/tokens so the page cannot drift from the tokens
//
// A fresh Claude Design export can replace project/ wholesale; nothing here is
// hand-edited output.

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';
import { renderLanding } from './landing.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'project');
const SITE = join(ROOT, 'site');
const DIST = join(ROOT, 'dist');

const CDN = {
  react: 'https://unpkg.com/react@18.3.1/umd/react.production.min.js',
  reactDom: 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js',
  lucide: 'https://unpkg.com/lucide@1.39.0/dist/umd/lucide.min.js',
  charts: 'https://unpkg.com/lightweight-charts@5.2.1/dist/lightweight-charts.standalone.production.js',
};
const HOOKS = 'const {useState,useRef,useEffect,useLayoutEffect,useMemo,useCallback,useId,useReducer}=React;';

const read = (p) => readFileSync(p, 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

function jsx(code, file) {
  try {
    return transformSync(code, {
      loader: 'jsx', jsx: 'transform', jsxFactory: 'React.createElement', jsxFragment: 'React.Fragment',
      target: 'es2020', minify: true, legalComments: 'none',
    }).code;
  } catch (e) {
    throw new Error(`${file}: ${e.message}`);
  }
}

// Mirrors components/_loader.js: strip import lines, turn `export function|const` into plain declarations.
const unmodule = (src) => src.replace(/^import[^\n]*$/gm, '').replace(/^export\s+(function|const|let)/gm, '$1');
const topLevelNames = (src) => [...new Set([...src.matchAll(/^(?:function|const|let)\s+([A-Za-z_]\w*)/gm)].map((m) => m[1]))];

// ---------------------------------------------------------------- 1. copy
rmSync(DIST, { recursive: true, force: true });
cpSync(SRC, DIST, { recursive: true, filter: (p) => !p.endsWith('.thumbnail') && !p.includes('.DS_Store') });

// ---------------------------------------------------------------- 2. component bundle
const loaderSrc = read(join(SRC, 'components/_loader.js'));
const files = JSON.parse(loaderSrc.match(/var FILES = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
let dsSource = '';
for (const f of files) dsSource += unmodule(read(join(SRC, 'components', f))) + '\n';
const dsNames = topLevelNames(dsSource);
writeFileSync(
  join(DIST, '_ds_bundle.js'),
  `/* One Link design system components, compiled from project/components. */\n` +
  jsx(`(function(){${HOOKS}\n${dsSource}\nwindow.OneLinkDS={${dsNames.join(',')}};})();`, 'components'),
);

// The loader already prefers a compiled bundle for components; teach loadKit to prefer a compiled kit.
writeFileSync(
  join(DIST, 'components/_loader.js'),
  loaderSrc.replace(
    'window.loadKit = async function (dsBase, kitBase, kitFiles) {',
    'window.loadKit = async function (dsBase, kitBase, kitFiles) {\n    if (window.OneLinkKIT) { var D = await window.loadDS(dsBase); return Object.assign({}, D, window.OneLinkKIT); }',
  ),
);

// ---------------------------------------------------------------- 3 + 4. pages
const cards = [];
for (const file of walk(DIST).filter((p) => p.endsWith('.html'))) {
  const rel = relative(DIST, file);
  let html = read(file);

  const meta = html.match(/<!--\s*@dsCard\s+([^>]*?)-->/);
  if (meta) {
    const attrs = Object.fromEntries([...meta[1].matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
    const [w, h] = (attrs.viewport || '700x400').split('x').map(Number);
    cards.push({ path: rel, name: attrs.name, group: attrs.group, subtitle: attrs.subtitle, width: w, height: h });
  }

  // Compile the UI kit a page loads, and put it beside the page.
  const kit = html.match(/loadKit\(\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*(\[[^\]]*\])/);
  if (kit) {
    const kitBase = join(dirname(join(SRC, rel)), kit[2]);
    const kitFiles = JSON.parse(kit[3].replace(/'/g, '"'));
    let kitSource = '';
    for (const f of kitFiles) kitSource += unmodule(read(join(kitBase, f))) + '\n';
    const bundleName = rel.replace(/[\\/]/g, '_').replace(/\.html$/, '') + '.kit.js';
    writeFileSync(
      join(dirname(file), bundleName),
      jsx(`(function(){const {${dsNames.join(',')}}=window.OneLinkDS;${HOOKS}\n${kitSource}\nwindow.OneLinkKIT={${topLevelNames(kitSource).join(',')}};})();`, rel),
    );
    html = html.replace(/(<script src="[^"]*_ds_bundle\.js"[^>]*><\/script>)/, `$1\n<script src="./${bundleName}"></script>`);
  }

  html = html
    .replace(/https:\/\/unpkg\.com\/react@[^/]+\/umd\/react\.development\.js/g, CDN.react)
    .replace(/https:\/\/unpkg\.com\/react-dom@[^/]+\/umd\/react-dom\.development\.js/g, CDN.reactDom)
    .replace(/https:\/\/unpkg\.com\/lucide@[^/]+\/dist\/umd\/lucide\.min\.js/g, CDN.lucide)
    .replace(/https:\/\/unpkg\.com\/lightweight-charts@[^/]+\/dist\/lightweight-charts\.standalone\.production\.js/g, CDN.charts)
    .replace(/\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone[^"]*"><\/script>/g, '')
    .replace(/<script type="text\/babel">([\s\S]*?)<\/script>/g, (_, code) => `<script>${jsx(code, rel)}</script>`);

  if (!/name="viewport"/.test(html)) {
    html = html.replace(/<meta charset="utf-8">/i, '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">');
  }
  writeFileSync(file, html);
}

// ---------------------------------------------------------------- 5. landing page
const landing = renderLanding({ root: ROOT, src: SRC, site: SITE, cards, cdn: CDN });
writeFileSync(join(DIST, 'index.html'), landing.html);
writeFileSync(join(DIST, 'landing.js'), `/* One Link design system landing page demos. */\n` + jsx(read(join(SITE, 'landing.jsx')), 'site/landing.jsx'));
cpSync(join(SITE, 'favicon.svg'), join(DIST, 'favicon.svg'));
writeFileSync(join(DIST, 'cards.json'), JSON.stringify(cards, null, 2));
writeFileSync(join(DIST, '.nojekyll'), '');

console.log(`Built dist/: ${dsNames.length} components, ${cards.length} cards, landing ${Math.round(landing.html.length / 1024)} kB.`);
