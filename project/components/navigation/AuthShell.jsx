import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { Logo } from '../core/Logo.jsx';
import { useMinWidth } from '../core/Interaction.jsx';

/* White over --inverted, written as a mix of --buttons-label (the white the system already owns),
   so the signed-out panel invents no colour of its own. 32% is the eyebrow and the legend, 68% the
   sentence under the claim; the claim itself is the full white. */
const QUIET = 'color-mix(in srgb, var(--buttons-label) 32%, transparent)';
const SAID = 'color-mix(in srgb, var(--buttons-label) 68%, transparent)';
const PAD = 48;

const COMMODITIES = ['maize', 'wheat', 'soya', 'soya-meal', 'fertilizer'];
const LEGEND = 'Maize · Wheat · Soya · Soya meal · Fertilizer';

/**
 * The strip's ticks, from a fixed seed: the same pattern on every render, in every browser and in
 * every screenshot, so the panel never differs between two loads of the same page. A 32-bit LCG
 * through Math.imul, not Math.random and not double arithmetic that drops its low bits.
 *
 * The ticks are a rhythm, not magnitudes. Every one is the same height on purpose: a bar that
 * varied with a value would read as a chart of real figures, and nothing before sign-in may.
 */
export function authTickPattern(count = 48, seed = 23) {
  let s = seed >>> 0;
  const next = () => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return s / 4294967296; };
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push({ commodity: COMMODITIES[Math.floor(next() * COMMODITIES.length)], opacity: Number((0.22 + next() * 0.34).toFixed(2)) });
  }
  return out;
}
const TICKS = authTickPattern();

/** A 9px commodity swatch in the legend. Decoration: the words beside it carry the meaning. */
function Swatch({ commodity }) {
  return <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: 'var(--radius-5xs)', flex: 'none', background: `var(--commodity-${commodity})` }} />;
}

/**
 * The foot of the panel: sparse commodity-coloured ticks marching left, full bleed, faded at both
 * edges by a mask. The pattern is rendered twice and the keyframe travels -50%, so the loop wraps
 * with no seam. Decoration end to end: aria-hidden, nothing focusable, nothing announced.
 * `prefers-reduced-motion: reduce` stops the march (tokens/motion.css).
 */
function TickStrip() {
  // An alpha mask reads only the alpha channel, so the opaque stop can be any colour the system owns.
  const fade = 'linear-gradient(90deg, transparent, var(--buttons-label) 14%, var(--buttons-label) 86%, transparent)';
  return (
    <div aria-hidden="true" style={{ position: 'relative', height: 26, overflow: 'hidden', maskImage: fade, WebkitMaskImage: fade }}>
      <div className="ol-march" style={{ position: 'absolute', left: 0, top: 0, height: '100%', display: 'flex', alignItems: 'center', gap: 24, animation: 'ol-march var(--dur-march) linear infinite' }}>
        {[...TICKS, ...TICKS].map((t, i) => (
          <span key={i} style={{ width: 2, height: 14, flex: 'none', borderRadius: 'var(--radius-max)', background: `var(--commodity-${t.commodity})`, opacity: t.opacity }} />
        ))}
      </div>
    </div>
  );
}

/**
 * The brand half, right of the form: full height on --inverted, its own stacking context, three rows.
 * An eyebrow pinned top, the claim block centred, the tick strip and legend pinned bottom.
 *
 * Nothing before sign-in. It carries the product name, what One Link is, and the system's own
 * vocabulary. Never a counterparty or person name, a ref, money, tonnes, a price, a position, a
 * site, a date, a preview of an internal screen or seeded data.
 */
function BrandPanel({ eyebrow, claim, claimSentence }) {
  return (
    <div style={{ position: 'relative', isolation: 'isolate', overflow: 'hidden', background: 'var(--inverted)', color: 'var(--buttons-label)' }}>
      <div style={{ position: 'relative', zIndex: 1, height: '100%', boxSizing: 'border-box', display: 'grid', gridTemplateRows: 'auto 1fr auto', padding: `${PAD}px 0` }}>
        {eyebrow ? <p style={{ paddingInline: PAD, ...textStyle('caption-1-condensed', { color: QUIET }) }}>{eyebrow}</p> : <span />}
        <div style={{ paddingInline: PAD, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ maxWidth: '11ch', ...textStyle('display-2-condensed', { color: 'var(--buttons-label)' }) }}>{claim}</p>
          <div aria-hidden="true" style={{ width: 44, height: 3, flex: 'none', margin: '26px 0 22px', background: 'var(--buttons-brand)' }} />
          <p style={{ maxWidth: '31ch', ...textStyle('body-2', { color: SAID }) }}>{claimSentence}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <TickStrip />
          <p style={{ display: 'flex', alignItems: 'center', gap: 7, paddingInline: PAD, ...textStyle('caption-2-condensed', { color: QUIET }) }}>
            {COMMODITIES.map((c) => <Swatch key={c} commodity={c} />)}
            <span style={{ marginLeft: 4 }}>{LEGEND}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * The signed-out frame: the form on the left, the brand panel on the right.
 *
 * Left is exactly what sign-in has always been, unchanged: the lockup, the heading and one
 * sentence, the form, a row of ways back, the column centred as a group with `align-items: safe
 * center` so a tall form stays reachable on a short screen.
 *
 * Right is the one place in the system where decoration is allowed, and only here. Below 1024px it
 * is removed outright and the form owns the screen: a decorative half-screen above a login is a
 * scroll between somebody and the thing they came to do.
 *
 *   <AuthShell heading="Sign in" sentence="Use the email and password for your account."
 *     links={<><a href="/forgot-password">Forgot password</a><a href="/">Back to home</a></>}>
 *     …the form…
 *   </AuthShell>
 */
export function AuthShell({
  heading, sentence, children, links,
  claim = 'Nobody types a balance.',
  claimSentence = 'Six desks write to one ledger. Every figure you see is derived from it, never typed twice.',
  eyebrow = 'United African Grain',
  showPanel = true, product = 'One Link', showBeta = true, style,
}) {
  const wide = useMinWidth(1024);
  const panel = showPanel && wide;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: panel ? 'minmax(0,1fr) minmax(0,1fr)' : 'minmax(0,1fr)', minHeight: '100dvh', background: 'var(--surface)', color: 'var(--content-primary)', ...style }}>
      <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'safe center', boxSizing: 'border-box', width: '100%', minHeight: '100dvh', padding: wide ? '56px 24px 40px' : '40px 16px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%', maxWidth: 400, minWidth: 0 }}>
          <a href="#" aria-label={product} onClick={(e) => e.preventDefault()} style={{ display: 'inline-flex', alignSelf: 'flex-start', textDecoration: 'none', color: 'inherit', borderRadius: 'var(--radius-2xs)' }}>
            <Logo product={product} showBeta={showBeta} />
          </a>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <h1 style={textStyle('heading-1-condensed')}>{heading}</h1>
            {sentence ? <p style={{ maxWidth: '36ch', textWrap: 'pretty', ...textStyle('body-3', { tone: 'secondary' }) }}>{sentence}</p> : null}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>{children}</div>
          {links ? <nav aria-label="Other ways" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 }}>{links}</nav> : null}
        </div>
      </main>
      {panel ? <BrandPanel eyebrow={eyebrow} claim={claim} claimSentence={claimSentence} /> : null}
    </div>
  );
}
