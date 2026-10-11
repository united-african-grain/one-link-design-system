/** @startingPoint section="Data" subtitle="Margin cell: a negative margin as a signal, Not set when its transport rate is missing, the Restricted lock without the contract tier (M6.DS.01)" viewport="520x120" */
export type MarginSign = 'positive' | 'zero' | 'negative' | 'notSet';
/** The sign of a margin figure; no value at all, or one that is not a number, is notSet, never 0. */
export function marginSign(value?: string | number | null): MarginSign;
/** "USD -800.00 per t" with a typographic minus; the currency and unit are left out where a table header names them. */
export function marginWords(value: string | number, options?: { currency?: string; unit?: string }): string;
export interface MarginCellProps {
  /** The figure as a string: "8,365.00", "-800.00", "11.95". */
  value?: string | number | null;
  /** "USD" or "ZMW" in a field; left out in a table whose header carries it, e.g. Margin (USD). */
  currency?: string;
  /** "per t" for a per-tonne margin. */
  unit?: string;
  /** It rests on a transport rate that does not exist: Not set with the amber triangle (UX-16). */
  notSet?: boolean;
  /** The viewer lacks the contract tier on a shared layout: the lock, no value, tooltip Restricted (UX-09). */
  restricted?: boolean;
  /** Opens Calculation details (UX-18); the figure becomes the blue link. */
  onOpen?: () => void;
  size?: 'body-2' | 'body-3' | 'body-4';
  style?: React.CSSProperties;
}
export function MarginCell(props: MarginCellProps): JSX.Element;
