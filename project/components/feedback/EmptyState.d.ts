export interface EmptyStateProps {
  icon?: string;
  title?: React.ReactNode;
  /** e.g. "Checked 07:02 · next digest 13:00" */
  meta?: React.ReactNode;
  /** success = green check (nothing to do); neutral = tertiary icon (no data). */
  tone?: 'success' | 'neutral';
  style?: React.CSSProperties;
}
export function EmptyState(props: EmptyStateProps): JSX.Element;
