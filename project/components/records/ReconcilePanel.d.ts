/** @startingPoint section="Records" subtitle="GRN reconcile: within tolerance / held for review / hard block" viewport="560x360" */
export interface ReconcileColumn { label: string; value: string; unit?: string; sub?: string; color?: string; provenance?: 'synced' | 'bridge' | 'ocr-high' | 'ocr-medium' | 'ocr-low' | 'typed' | 'declared'; }
export interface ReconcilePanelProps {
  /** Defaults to Weighed in / Deduction / Applied. */
  columns?: ReconcileColumn[];
  outcome?: 'within' | 'held' | 'block';
  /** Override the banner text. */
  message?: React.ReactNode;
  /** Busy state of Finalise GRN / Send for review. */
  loading?: boolean;
  onAction?: () => void;
  onReweigh?: () => void;
  onPhotograph?: () => void;
  /** EvidenceTile nodes. */
  evidence?: React.ReactNode;
  style?: React.CSSProperties;
}
export function ReconcilePanel(props: ReconcilePanelProps): JSX.Element;
