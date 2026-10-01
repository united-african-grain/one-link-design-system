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
  /** within · allowance · beyond */
  outcome?: 'within' | 'allowance' | 'beyond';
  /** Overrides the status word, keeping the outcome's icon. */
  status?: React.ReactNode;
  style?: React.CSSProperties;
}
export function ReconcileCard(props: ReconcileCardProps): JSX.Element;
