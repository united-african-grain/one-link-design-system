/** @startingPoint section="Records" subtitle="Second confirmation: a large correction waits for a second person; Withdraw only for the first" viewport="760x260" */
export interface SecondConfirmationProps {
  /** "Tare (t)". */
  field: React.ReactNode;
  reading: React.ReactNode;
  entered: React.ReactNode;
  /** Who confirmed first, "S. Banda". */
  firstBy: string;
  /** "26 Sep 2026, 09:58 CAT". */
  firstAt?: string;
  /** Who is looking. Withdraw is offered only when this is firstBy. */
  viewer?: string;
  /** Confirm weights is working. */
  busy?: boolean;
  onWithdraw?: () => void;
  onConfirm?: () => void;
  style?: React.CSSProperties;
}
export function SecondConfirmation(props: SecondConfirmationProps): JSX.Element;
