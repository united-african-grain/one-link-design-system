export interface IconProps {
  /** Lucide icon name in kebab-case, e.g. "triangle-alert". Only names from the readme vocabulary. */
  name: string;
  /** 20 in buttons/header (stroke 1.75), 16 inline with body-3 (stroke 2), 12–14 in captions and chips (stroke 2). */
  size?: number;
  stroke?: number;
  color?: string;
  /** Rotate continuously (loader-circle). */
  spin?: boolean;
  style?: React.CSSProperties;
  className?: string;
  title?: string;
}
export function Icon(props: IconProps): JSX.Element;
