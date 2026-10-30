/** @startingPoint section="Data" subtitle="Gap bar: one contract's collected tonnes with the paid and invoiced shares, and both gaps, Gap to invoice and Gap to pay, worked out from the same row (M7.DS.02)" viewport="520x120" */
export const GAP_WORDS: { toInvoice: 'Gap to invoice'; toPay: 'Gap to pay'; collected: 'Collected'; invoiced: 'Invoiced'; paid: 'Paid'; awaiting: 'Awaiting destination weight' };
/** "1,352.80" in hundredths. */
export function centsOf(v: string | number | null | undefined): number;
/** Hundredths as "1,352.80". */
export function fromCents(h: number): string;
export interface GapRow {
  /** Tonnes collected (or offloaded, on a delivered contract): "11,719.14". */
  collected: string;
  invoiced: string;
  paid: string;
  /** Ignored: a gap is never read from a stored figure. */
  toInvoice?: string;
  toPay?: string;
}
/** Collected less invoiced, and invoiced less paid, never below zero. */
export function gapsOf(row: GapRow): { toInvoice: string; toPay: string };
export interface GapBarProps {
  row: GapRow;
  unit?: string;
  /** false draws the bar alone, for a table whose columns carry the gaps. */
  figures?: boolean;
  maxWidth?: number | string;
  style?: React.CSSProperties;
}
export function GapBar(props: GapBarProps): JSX.Element;
