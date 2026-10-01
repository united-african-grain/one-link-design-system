/** @startingPoint section="Feedback" subtitle="Refusal: \"[Action] is not allowed. [Reason].\" (S57 blocked action, map UX-21)" viewport="700x100" */
export interface RefusalProps {
  /** The action as its button says it: "Submit for approval". */
  action: string;
  /** Why, in business words: "The weighbridge at Chisamba Shed has not reported since 06:10". A full stop is added if missing. */
  reason: string;
  style?: React.CSSProperties;
}
export function Refusal(props: RefusalProps): JSX.Element;
