export type TextVariant =
  | 'display-1' | 'display-4' | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4'
  | 'body-1' | 'body-2' | 'body-3' | 'body-4' | 'caption-1' | 'caption-2'
  | 'display-1-condensed' | 'display-2-condensed' | 'display-3-condensed' | 'display-4-condensed'
  | 'heading-1-condensed' | 'heading-2-condensed' | 'heading-3-condensed' | 'body-2-condensed' | 'caption-1-condensed' | 'caption-2-condensed';
export type Tone = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'disabled' | 'brand' | 'up' | 'down' | 'success' | 'warning' | 'error' | 'info' | 'inherit' | 'label';
export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements;
  variant?: TextVariant;
  /** Strong weight (580 body / 600 heading). Condensed styles are always 700. */
  strong?: boolean;
  /** Semantic content colour. Never 'tertiary' for a figure. */
  tone?: Tone;
  /** tabular-nums — required for every figure, ref and timestamp. */
  tabular?: boolean;
  color?: string;
}
export function Text(props: TextProps): JSX.Element;
export function textStyle(variant?: TextVariant, opts?: { strong?: boolean; tone?: Tone; tabular?: boolean; color?: string }): React.CSSProperties;
