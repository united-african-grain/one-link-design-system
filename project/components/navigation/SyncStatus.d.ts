export interface SyncStatusProps {
  state?: 'live' | 'stalled' | 'offline';
  /** Custom label; defaults per state. */
  label?: string;
  /** Dot only; the words become the accessible label and tooltip. */
  compact?: boolean;
  style?: React.CSSProperties;
}
export function SyncStatus(props: SyncStatusProps): JSX.Element;
