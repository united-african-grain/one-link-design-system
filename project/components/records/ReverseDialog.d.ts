/** @startingPoint section="Records" subtitle="Reverse dialog: \"Reverse [record]? A reversal entry will be created.\" with a required reason (S57 destructive confirmation)" viewport="560x380" */
export interface ReverseDialogProps {
  /** The record as its reference reads: "JE-2026-000412", "GRN-2026-000123". */
  record: string;
  open?: boolean;
  /** The reversal is being posted: Reverse shows its spinner, Cancel and the field wait. */
  busy?: boolean;
  onCancel?: () => void;
  /** Called with the reason, which is required. */
  onConfirm?: (reason: string) => void;
  sheet?: boolean;
  contained?: boolean;
}
export function ReverseDialog(props: ReverseDialogProps): JSX.Element | null;
