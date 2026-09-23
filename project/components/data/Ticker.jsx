import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';
import { textStyle } from '../core/Text.jsx';
import { StatusMark } from '../feedback/StatusMark.jsx';
import { useInteraction, useMinWidth, usePrefersReducedMotion } from '../core/Interaction.jsx';

/* The strip along the foot of a signed-in page.
 *
 * The shape comes from a sibling product's bottom ticker, including the inverted top corners: two
 * small squares in the bar's own colour, each with a rounded square of the page colour laid over it,
 * so the bar appears to flow into the screen edges instead of ending in a hard rectangle. That
 * original hardcodes black and white; here both colours are tokens, so a palette change reaches the
 * corners without anybody remembering they exist.
 *
 * It is a block in normal flow, never `position: fixed`. A fixed bar sits over the bottom of
 * whatever is on the page, and One Link is full of wide tables whose last row is the one somebody
 * is reading, so the bar scrolls with the page like any other element.
 *
 * Two things the originals do not do. Hover or keyboard focus anywhere in the strip stops the
 * crawl, because a figure sliding away as you read it is the whole frustration of a ticker. And
 * `prefers-reduced-motion: reduce` drops the animation outright (tokens/motion.css kills
 * `.ol-march`): the row becomes a strip you scroll yourself, with one copy of the items rather than
 * two, and every item still readable.
 *
 * Below 768px it renders nothing. The mobile shell already has a bottom bar of modules there, and
 * two stacked bars at the foot of a phone screen would be one too many.
 */

/* White over --inverted, written as mixes of --buttons-label, the white the system already owns, so
   the strip invents no colour: 58% the labels, 14% the hairlines, full white the figures. */
const TICKER_INK = 'var(--buttons-label)';
const TICKER_QUIET = 'color-mix(in srgb, var(--buttons-label) 58%, transparent)';
const TICKER_LOUD = 'color-mix(in srgb, var(--buttons-label) 82%, transparent)';
const TICKER_RULE = 'color-mix(in srgb, var(--buttons-label) 14%, transparent)';
const TICKER_RING = 'color-mix(in srgb, var(--buttons-label) 25%, transparent)';

/* The status colours, lifted toward the same white so they read on --inverted. The semantic tokens
   are mixed, not replaced: green stays the system's green, amber its amber, red its red. */
const TICKER_TONE = {
  good: 'color-mix(in oklab, var(--accent-up-fill) 68%, var(--buttons-label))',
  attention: 'color-mix(in oklab, var(--warning-strong) 46%, var(--buttons-label))',
  breach: 'color-mix(in oklab, var(--content-accent-down) 52%, var(--buttons-label))',
};
/* Tone is the system's status vocabulary, so the mark is the system's StatusMark: icon plus word,
   never colour alone. good = circle-check Clean, attention = triangle-alert Attention,
   breach = circle-alert Breach. */
const TICKER_MARK = { good: 'clean', attention: 'attention', breach: 'breach' };

const TICKER_CORNER = 'var(--ticker-corner)';

/* Items dissolve at the two ends of the marquee rather than being chopped in half by the clip. An
   alpha mask reads only the alpha channel, so the opaque stop can be any colour the system owns.
   Under reduced motion there is no mask: the reader scrolls the strip, and fading what sits at the
   edge would hide the figure they scrolled to. */
const TICKER_FADE = 'linear-gradient(90deg, transparent 0, var(--buttons-label) 20px, var(--buttons-label) calc(100% - 20px), transparent 100%)';

/** The inverted top corners. Decoration end to end, so hidden from readers and from the pointer. */
function TickerCorners() {
  const square = { width: TICKER_CORNER, height: TICKER_CORNER, flex: 'none', background: 'var(--inverted)' };
  const cut = { display: 'block', width: '100%', height: '100%', background: 'var(--surface)' };
  return (
    <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: TICKER_CORNER, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
      <span style={square}><span style={{ ...cut, borderBottomLeftRadius: TICKER_CORNER }} /></span>
      <span style={square}><span style={{ ...cut, borderBottomRightRadius: TICKER_CORNER }} /></span>
    </span>
  );
}

/** A drawn separator between items, never a typed character, so it cannot land oddly at the wrap. */
function TickerRule() {
  return <span aria-hidden="true" style={{ width: 1, height: 14, flex: 'none', background: TICKER_RULE }} />;
}

/**
 * One figure. With an `href` it is a link and looks like one on hover; without, it is plain text and
 * is not focusable, because there is nothing to activate. In the duplicated second copy every link
 * is taken out of the tab order: the copy is `aria-hidden`, and a focusable node inside
 * `aria-hidden` is a trap for a keyboard user.
 */
function TickerItem({ item, onItemClick, hidden = false }) {
  const { hover, focusVisible, handlers } = useInteraction();
  const linked = !!item.href;
  const tone = item.tone && TICKER_TONE[item.tone] ? item.tone : null;
  const Tag = linked ? 'a' : 'span';
  const link = linked && !hidden;
  return (
    <Tag
      {...(linked ? { href: item.href, tabIndex: hidden ? -1 : undefined } : null)}
      {...(link ? handlers : null)}
      {...(link && onItemClick ? { onClick: (e) => onItemClick(item, e) } : null)}
      style={{
        // 6px of vertical padding, so a link is a 28px target inside the 40px bar and its focus ring
        // still has room: the bar clips, and a ring on a full-height item would be cut off.
        display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 20px', whiteSpace: 'nowrap',
        textDecoration: 'none', color: TICKER_QUIET, cursor: link ? 'pointer' : 'default',
        borderRadius: 'var(--radius-2xs)', outline: 'none',
        boxShadow: focusVisible && link ? `0 0 0 4px ${TICKER_RING}` : 'none',
        transition: 'color var(--dur-default) var(--ease-default)',
      }}
    >
      <Icon name={item.icon} size={12} />
      <span style={textStyle('caption-1', { color: link && hover ? TICKER_LOUD : TICKER_QUIET })}>{item.label}</span>
      <span style={{ textUnderlineOffset: 2, textDecoration: link && hover ? 'underline' : 'none', ...textStyle('body-4', { strong: true, tabular: true, color: TICKER_INK }) }}>{item.value}</span>
      {tone ? <StatusMark kind={TICKER_MARK[tone]} size="caption-1" style={{ color: TICKER_TONE[tone] }} /> : null}
    </Tag>
  );
}

/**
 * Bottom ticker strip: a pinned anchor block and a seamless marquee of live figures.
 *
 *   <Ticker anchor={{ icon: 'gauge', text: 'Season 2026' }} items={items} onItemClick={go} />
 *
 * The track holds the items twice and slides exactly -50% (`ol-march`, tokens/motion.css), so the
 * moment the first copy leaves, the second is in the identical position and the loop has no seam.
 */
export function Ticker({
  items = [], anchor = null, speed = 60, paused = false, onItemClick,
  emptyText = 'Nothing live right now', label = 'Live figures', style,
}) {
  const wide = useMinWidth(768);
  const reduced = usePrefersReducedMotion();
  const { hover, handlers } = useInteraction();
  const [focusWithin, setFocusWithin] = useState(false);

  // The phone already has a bottom bar of its own. Nothing to render, and nothing announced either.
  if (!wide) return null;

  const list = Array.isArray(items) ? items : [];
  const still = paused || hover || focusWithin;
  // Reduced motion needs one copy only: the second exists to make the loop wrap, and with no loop it
  // would just be the same figures twice under the reader's own scrolling.
  const passes = reduced ? [0] : [0, 1];

  return (
    <div role="region" aria-label={label} style={{ position: 'relative', width: '100%', maxWidth: '100%', boxSizing: 'border-box', paddingTop: TICKER_CORNER, overflow: 'hidden', ...style }}>
      <TickerCorners />
      <div
        {...handlers}
        // Hover and focus are tracked on the whole bar, not just the moving track, so the pause lands
        // wherever the pointer happens to be when somebody stops to read. A move between two items
        // inside is not a blur of the strip, hence the contains check.
        onFocus={() => setFocusWithin(true)}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocusWithin(false); }}
        style={{ display: 'flex', alignItems: 'center', gap: 14, height: 'var(--ticker-h)', padding: '0 16px', background: 'var(--inverted)', overflow: 'hidden' }}
      >
        {anchor ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flex: 'none', minWidth: 0, paddingRight: 14, borderRight: `1px solid ${TICKER_RULE}`, ...textStyle('caption-1-condensed', { color: anchor.tone && TICKER_TONE[anchor.tone] ? TICKER_TONE[anchor.tone] : TICKER_QUIET }) }}>
            <Icon name={anchor.icon} size={12} />
            <span style={{ maxWidth: '28ch', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{anchor.text}</span>
          </span>
        ) : null}

        {list.length === 0 ? (
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...textStyle('caption-1', { color: TICKER_QUIET }) }}>{emptyText}</span>
        ) : (
          <div style={{ flex: '1 1 auto', minWidth: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'center', overflowX: reduced ? 'auto' : 'hidden', overflowY: 'hidden', maskImage: reduced ? undefined : TICKER_FADE, WebkitMaskImage: reduced ? undefined : TICKER_FADE }}>
            <div className="ol-march" style={{ display: 'flex', width: 'max-content', animation: `ol-march ${speed}s linear infinite`, animationPlayState: still ? 'paused' : 'running' }}>
              {passes.map((pass) => (
                <div key={pass} {...(pass === 1 ? { 'aria-hidden': 'true' } : null)} style={{ display: 'flex', alignItems: 'center' }}>
                  {list.map((item) => (
                    <React.Fragment key={item.id}>
                      <TickerItem item={item} onItemClick={onItemClick} hidden={pass === 1} />
                      <TickerRule />
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
