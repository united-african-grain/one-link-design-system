/** @startingPoint section="Records" subtitle="Decision actions: exactly the outcomes given, as data (Release hold, Reject; Approve, Reject), each with its working state (M4.DS.01)" viewport="420x80" */
export interface DecisionOutcome {
  value: string;
  /** The action word (UX-33): "Release hold", "Reject", "Approve". */
  label: string;
  /** primary: the one dark button. critical: Reject, red text on an outline. outline: anything else. */
  variant?: 'primary' | 'outline' | 'critical';
  /** The outcome needs a comment before it is saved (UX-22): the screen opens ReasonDialog. */
  comment?: boolean;
  /** Visible but not offered right now (UX-17). */
  disabled?: boolean;
}
export interface DecisionActionsProps {
  /** Exactly what is drawn, in this order. */
  outcomes: DecisionOutcome[];
  /** The value of the outcome being saved: its button shows the spinner and the others wait. */
  busy?: string | null;
  disabled?: boolean;
  size?: 'xsmall' | 'small' | 'medium';
  onDecide?: (outcome: DecisionOutcome) => void;
}
export function DecisionActions(props: DecisionActionsProps): JSX.Element;
