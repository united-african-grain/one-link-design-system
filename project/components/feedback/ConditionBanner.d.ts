/** @startingPoint section="Feedback" subtitle="Condition banner: one pale yellow line above the highlights (map UX-23)" viewport="700x100" */
export interface ConditionBannerProps {
  /** One or two short sentences. */
  children: React.ReactNode;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}
export function ConditionBanner(props: ConditionBannerProps): JSX.Element;
