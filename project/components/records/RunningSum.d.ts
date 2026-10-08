/** @startingPoint section="Records" subtitle="Running sum: a goods received note's lines total against the ticket net, Exact, Within or Beyond tolerance (M4.DS.01)" viewport="420x120" */
export type RunningSumState = 'exact' | 'within' | 'beyond';
export const RUNNING_SUM_MARKS: Record<RunningSumState, { kind: string; word: string }>;
/** "32.140" as 32140 thousandths of a tonne. */
export function thousandths(t: string | number): number;
/** 440 as "0.440". */
export function tonnes(k: number): string;
/** Exact when the two are equal, within when the difference is at most the tolerance, beyond otherwise. */
export function runningSumState(total: string | number, target: string | number, tolerance?: string | number): RunningSumState;
export interface RunningSumProps {
  /** "Lines total". */
  label?: React.ReactNode;
  /** The sum so far, in tonnes: "31.700". */
  total: string | number;
  /** What it must reach, in tonnes: the ticket net, "32.140". */
  target: string | number;
  /** "Ticket net" or "Expected from count". */
  targetLabel?: string;
  /** In tonnes: "0.080" for a weight pair; 0 for bagged product. */
  tolerance?: string | number;
  unit?: string;
  style?: React.CSSProperties;
}
export function RunningSum(props: RunningSumProps): JSX.Element;
