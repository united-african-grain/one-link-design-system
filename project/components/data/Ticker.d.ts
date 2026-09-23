export type TickerTone = 'good' | 'attention' | 'breach';

export interface TickerItem {
  /** Stable key. Also what `onItemClick` identifies the item by. */
  id: string;
  /** Lucide name from the icon vocabulary, 12px inside the strip. */
  icon: string;
  /** What the figure is, in sentence case. */
  label: string;
  /** The figure itself, already formatted (K125M, K174,840, 28.20t, 54%). Tabular. */
  value: string;
  /** Adds the system's status mark after the value: icon plus word, never colour alone. */
  tone?: TickerTone;
  /** With an href the item is a link and looks like one on hover; without, it is plain text. */
  href?: string;
}

export interface TickerAnchor {
  icon: string;
  /** Condensed uppercase. What all these figures describe, so it never scrolls away. */
  text: string;
  /** Tints the anchor. The words must still say the state; colour is never the only signal. */
  tone?: TickerTone;
}

export interface TickerProps {
  items?: TickerItem[];
  /** The fixed block pinned at the left of the strip, or null for none. */
  anchor?: TickerAnchor | null;
  /** Seconds for one full pass of the list. Default 60. */
  speed?: number;
  /** Stops the crawl. Hover and keyboard focus stop it too, without this prop. */
  paused?: boolean;
  /** Fired when a linked item is activated. Take the event to route without a page load. */
  onItemClick?(item: TickerItem, event: React.MouseEvent): void;
  /** Shown in place of the marquee when there is nothing to show. */
  emptyText?: string;
  /** Accessible name for the region. */
  label?: string;
  style?: React.CSSProperties;
}

/** Bottom strip of live figures. Returns null below 768px. */
export function Ticker(props: TickerProps): JSX.Element | null;
