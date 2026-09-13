export interface ShareBarProps {
  /** 0–1 firm/delivered share. */
  share?: number;
  /** 0–1 declared (non-binding) overlay, drawn dashed after the firm share. */
  declared?: number;
  color?: string;
  maxWidth?: number | string;
  height?: number;
  dimmed?: boolean;
  style?: React.CSSProperties;
}
export function ShareBar(props: ShareBarProps): JSX.Element;
