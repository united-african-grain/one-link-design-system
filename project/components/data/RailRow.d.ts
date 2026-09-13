export interface RailRowProps {
  /** Leading severity tag. */
  severity?: 'critical' | 'high' | 'normal';
  subject: React.ReactNode;
  context?: React.ReactNode;
  /** Right-aligned figure or action (xsmall outline Button). */
  right?: React.ReactNode;
  /** StatusMark or delta on line 2. */
  status?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function RailRow(props: RailRowProps): JSX.Element;
