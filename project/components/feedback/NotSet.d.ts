/** @startingPoint section="Feedback" subtitle="Not set: the amber triangle and the words, with the owner (map UX-16)" viewport="320x80" */
export interface NotSetProps {
  /** Who sets it, as Setup shows it, e.g. "Administrator". */
  owner?: React.ReactNode;
  size?: 'body-3' | 'body-4' | 'caption-1' | 'body-2';
  style?: React.CSSProperties;
}
export function NotSet(props?: NotSetProps): JSX.Element;
