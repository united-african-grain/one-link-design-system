export interface EmptyStateProps {
  icon?: string;
  title?: React.ReactNode;
  /** e.g. "Checked 07:02 · next digest 13:00" */
  meta?: React.ReactNode;
  /** neutral (the default) = tertiary icon, for an empty list; success = green check, only for something done and good (U4). */
  tone?: 'success' | 'neutral';
  style?: React.CSSProperties;
}
export function EmptyState(props: EmptyStateProps): JSX.Element;
