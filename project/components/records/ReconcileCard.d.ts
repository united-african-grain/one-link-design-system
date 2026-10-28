/** @startingPoint section="Records" subtitle="Reconcile card: label and value rows, the difference in bold, a status line (map UX-20)" viewport="400x260" */
export interface ReconcileRow {
  label: React.ReactNode;
  value: React.ReactNode;
  /** The key difference: bold. */
  strong?: boolean;
}
export interface ReconcileCardProps {
  title?: React.ReactNode;
  rows: ReconcileRow[];
  /** within (Within tolerance) · allowance (Within allowance) · beyond (Beyond tolerance) · beyond-allowance (Beyond allowance) */
  outcome?: ReconcileOutcome;
  /** Overrides the status word, keeping the outcome's icon. */
  status?: React.ReactNode;
  /** A closing line of the check's own in place of the outcome's (M4.DS.02): CountMatch's Count sheet matches or
      Count mismatch. Left out, the outcome's status line is drawn as before. */
  mark?: React.ReactNode;
  style?: React.CSSProperties;
}
export function ReconcileCard(props: ReconcileCardProps): JSX.Element;
export type ReconcileOutcome = 'within' | 'allowance' | 'beyond' | 'beyond-allowance';
/** Each outcome's StatusMark kind and word: clean Within tolerance, clean Within allowance, attention Beyond tolerance, attention Beyond allowance. */
export const RECONCILE_OUTCOMES: Record<ReconcileOutcome, { kind: 'clean' | 'attention'; word: string }>;
