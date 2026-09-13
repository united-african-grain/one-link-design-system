export interface SyncStatusProps {
  state?: 'live' | 'stalled' | 'offline';
  /** Custom label; defaults per state. */
  label?: string;
  style?: React.CSSProperties;
}
export function SyncStatus(props: SyncStatusProps): JSX.Element;
