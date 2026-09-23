The strip along the foot of a signed-in page: a pinned anchor block, then live figures crawling left. The shape is borrowed from two sibling products, including the inverted top corners, so the bar flows into the screen edges instead of ending in a hard rectangle. Both corner colours are tokens (`--inverted` for the bar, `--surface` for the page), so a palette change reaches them.

The component itself is a plain block: it does not position itself. Put it in `AppShell`'s `ticker` slot, which spans the whole frame and makes the row `position: sticky; bottom: 0`. Never `fixed`. A fixed strip sits over the bottom row of whatever is on screen, and in One Link that row is usually a wide table somebody is reading; the sticky row keeps its own space at the end of the document instead.

What goes in it is figures somebody acts on, not a price feed to watch: position, margin, cover, a receipt that needs a decision. Each item is `{ id, icon, label, value, tone?, href? }`. An item with an `href` is a link and underlines on hover; one without is plain text and is not focusable. `tone` adds the system's status mark after the value, so a state is always icon plus word (`circle-check Clean`, `triangle-alert Attention`, `circle-alert Breach`), never colour alone. Values arrive already formatted by the system's number rules (`K125M`, `K174,840`, `28.20t`, `54%`) and are tabular.

The `anchor` is the one block that never scrolls away: what all these figures describe. Give it a tone only when its own words already say the state.

- The track holds the items twice and slides exactly `translateX(-50%)` (`ol-march`), so the loop has no seam. `speed` is the seconds for one full pass, default 60.
- Hover or keyboard focus anywhere in the strip stops the crawl, because a figure sliding away as you read it is the whole frustration of a ticker. `paused` stops it from the outside, for a silent feed.
- `prefers-reduced-motion: reduce` drops the animation outright and the row becomes a strip the reader scrolls, with one copy of the items instead of two. Everything stays readable.
- Below 768px it renders nothing. The mobile shell already has a bottom bar of modules there, and two stacked bars at the foot of a phone would be one too many. Do not try to shrink it into the phone layout.
- Give it enough figures to more than fill the bar. Two copies of a very short list are still shorter than a wide screen, and the wrap would show empty bar.
- A focused item is where the crawl stopped, so it can sit part way under the fade at the left edge. The strip freezes rather than jumping the track, because jumping would move every other figure under the reader's eyes.
- The whole strip is one `aria-label`led region and the duplicated second copy is `aria-hidden` with its links out of the tab order, so a screen reader reads each figure once.

```jsx
<Ticker
  anchor={{ icon: 'gauge', text: 'Season 2026' }}
  items={[
    { id: 'position', icon: 'gauge', label: 'Your position', value: 'K125M', href: '/command-center' },
    { id: 'margin', icon: 'trending-up', label: 'Blended margin', value: 'K11.8M', tone: 'good' },
    { id: 'maize', icon: 'package', label: 'White maize', value: 'K4,180/t' },
  ]}
  onItemClick={(item, e) => { e.preventDefault(); go(item.id); }}
/>

<Ticker anchor={{ icon: 'triangle-alert', text: 'Weighbridge feed silent', tone: 'attention' }} items={items} paused />
<Ticker anchor={{ icon: 'gauge', text: 'Season 2026' }} items={[]} emptyText="Nothing live right now, next digest at 13:00" />
```

Tokens: `--ticker-h` (the bar height) and `--ticker-corner` (the corner square and its radius) in `tokens/spacing.css`.
