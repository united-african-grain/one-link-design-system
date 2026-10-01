/** @startingPoint section="Feedback" subtitle="One-time code: the activation code, shown once, with Copy and its expiry (S10 A3, UX-22)" viewport="560x360" */
export interface OneTimeCodeProps {
  open?: boolean;
  /** "Activation code". */
  title?: string;
  /** The code, grouped for reading out: "7Q4-K9M-2XP". */
  code: string;
  /** When it stops working, DD MMM YYYY, HH:MM CAT: 72 hours from now, from the Activation code expiry setting. */
  expires: string;
  /** The screen drops the code; it is never shown again, and the record offers Reissue activation code. */
  onDone?: () => void;
  contained?: boolean;
}
export function OneTimeCode(props: OneTimeCodeProps): JSX.Element | null;
