export interface QuantityChipProps {
  children: React.ReactNode;
  /** Closed/complete records. */
  dimmed?: boolean;
  tone?: 'primary' | 'secondary' | 'warning' | 'success' | 'error';
  style?: React.CSSProperties;
}
export function QuantityChip(props: QuantityChipProps): JSX.Element;
