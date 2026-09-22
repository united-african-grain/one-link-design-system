export interface LogoProps {
  /** Wordmark text, e.g. "One Link" or "Partner Portal". */
  product?: string;
  /** BETA badge next to the wordmark (kept from the reference theme by request). */
  showBeta?: boolean;
  size?: 'sm' | 'md';
  /** The mark alone, without wordmark or badge (the collapsed sidebar's brand row). The mark carries `product` as its accessible name. */
  markOnly?: boolean;
  style?: React.CSSProperties;
}
export function Logo(props: LogoProps): JSX.Element;
