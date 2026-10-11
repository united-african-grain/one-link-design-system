/** @startingPoint section="Records" subtitle="Count match: the bag count against the signed count sheet, Count sheet matches or Count mismatch (M4.DS.02)" viewport="320x60" */
export type BagCountState = 'matches' | 'mismatch';
/** Matches only when the loaded count equals the sheet within the tolerance (0); a missing count is a mismatch. */
export function bagCountState(sheet: string | number, loaded: string | number, tolerance?: string | number): BagCountState;
/** "Bag count 399 does not match count sheet 400", for Refusal action="Ship". */
export function bagCountReason(sheet: string | number, loaded: string | number): string;
export const COUNT_MARKS: Record<BagCountState, { kind: string; word: string }>;
export interface CountMatchProps {
  /** Bags on the signed count sheet. */
  sheet: string | number;
  /** Bags loaded, the latest count. */
  loaded: string | number;
  /** The bag count tolerance setting, which stays at 0 (RL-BAG-MATCH). */
  tolerance?: string | number;
  size?: 'body-3' | 'body-4';
  style?: React.CSSProperties;
}
export function CountMatch(props: CountMatchProps): JSX.Element;
