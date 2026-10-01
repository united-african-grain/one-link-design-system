/** @startingPoint section="Data" subtitle="Restricted: a lock, no value, tooltip Restricted (map UX-09)" viewport="320x80" */
export interface RestrictedProps {
  /** The tooltip and the accessible name. Keep "Restricted" unless the map says otherwise. */
  label?: string;
  size?: number;
  style?: React.CSSProperties;
}
export function Restricted(props?: RestrictedProps): JSX.Element;
