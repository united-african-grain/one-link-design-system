import React from 'react';
import { textStyle } from '../core/Text.jsx';
import { useInteraction } from '../core/Interaction.jsx';
import { NotSet } from '../feedback/NotSet.jsx';

/** The most a Home shows (map UX-08, S57 Home structure): a fifth figure is a table, not a tile. */
export const KPI_TILE_CAP = 4;

/** The tiles a Home draws: at most KPI_TILE_CAP, in the order given. A tile that is not given is not drawn, never
    drawn as a zero or a blank placeholder (S08: no placeholders). */
export function kpiTiles(tiles = []) {
  return tiles.filter(Boolean).slice(0, KPI_TILE_CAP);
}

/**
 * KPI tile (map UX-08, S08 J2 and J3): a headline figure on a Home, its label above, one caption line under it, and
 * the whole tile opens Calculation details. Money carries its currency code and may use K or M here, and only here
 * (UX-11). A figure that rests on a setting with no value (no exchange rate at all) is `notSet`: the tile shows Not
 * set with the amber triangle in the figure's place, never a zero, and its Calculation details names the setting and
 * its owner (UX-16). The tile is a real button when `onOpen` is given, so Tab reaches it and Enter opens it.
 */
export function KpiTile({ label, value, caption, notSet = false, onOpen, size = 'heading-1-condensed', style }) {
  const { hover, down, focusVisible, handlers } = useInteraction({ inert: !onOpen });
  // A button when it opens something, so Tab reaches it and Enter opens it; otherwise a plain block.
  return React.createElement(onOpen ? 'button' : 'div', { type: onOpen ? 'button' : undefined, onClick: onOpen, ...handlers, 'aria-haspopup': onOpen ? 'dialog' : undefined, 'data-kpi-tile': typeof label === 'string' ? label : '',
      style: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, minWidth: 0, width: '100%', boxSizing: 'border-box', padding: 16, margin: 0, border: 0, textAlign: 'left', font: 'inherit', color: 'inherit',
        background: hover ? 'color-mix(in srgb, var(--hover-mix-light), var(--elevated))' : 'var(--elevated)', borderRadius: 'var(--radius-lg)', outline: 'none',
        boxShadow: focusVisible ? 'var(--shadow-minimal-soft), 0 0 0 4px color-mix(in srgb, var(--content-primary) 25%, transparent)' : 'var(--shadow-minimal-soft)',
        cursor: onOpen ? 'pointer' : 'default', transform: down && onOpen ? 'scale(var(--scale-press-card))' : 'scale(1)',
        transition: 'background var(--dur-default) var(--ease-default), transform var(--dur-default) ease, box-shadow var(--dur-default) var(--ease-default)', ...style } },
    <>
      <span style={textStyle('body-3', { tone: 'secondary' })}>{label}</span>
      {notSet ? <span data-not-set="" style={{ minHeight: 32, display: 'inline-flex', alignItems: 'center' }}><NotSet size="body-2" /></span>
        : <span style={{ ...textStyle(size, { tabular: true }), whiteSpace: 'nowrap', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>}
      {caption ? <span style={{ ...textStyle('body-4', { tone: 'secondary' }), fontVariantNumeric: 'tabular-nums', textWrap: 'pretty' }}>{caption}</span> : null}
    </>);
}
