export interface BannerProps {
  tone?: 'info' | 'success' | 'warning' | 'error';
  /** Override the default Lucide icon (info / circle-check / triangle-alert / circle-alert). */
  icon?: string;
  /** Strong lead word(s): "Clean", "Attention". Rendered as `Title: children`. */
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Trailing element, e.g. a Retry button. */
  action?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Banner(props: BannerProps): JSX.Element;
