/** @startingPoint section="Feedback" subtitle="Reason dialog: Confirm high-impact change, Reject with a comment; Confirm waits for the reason (map UX-22)" viewport="560x420" */
export interface ReasonDialogProps {
  open?: boolean;
  /** "Confirm high-impact change", "Reject variance hold". */
  title?: string;
  /** The change in words, with its effective date and time: "Bag-count tolerance changes from 0 bags to 2 bags, effective 01 Oct 2026, 00:00 CAT." */
  children?: React.ReactNode;
  /** "Reason", or "Comment" for Reject. */
  label?: string;
  /** Characters needed before Confirm is enabled (10 for a high-impact change). */
  minLength?: number;
  /** "Confirm", "Reject". */
  confirmLabel?: string;
  /** critical for Reject. */
  confirmVariant?: 'primary' | 'critical';
  /** The decision is being saved: Confirm shows its spinner, Cancel and the field wait. */
  busy?: boolean;
  defaultReason?: string;
  onCancel?: () => void;
  onConfirm?: (reason: string) => void;
  contained?: boolean;
  sheet?: boolean;
}
export function ReasonDialog(props: ReasonDialogProps): JSX.Element | null;
