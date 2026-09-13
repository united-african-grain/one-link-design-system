export interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  placeholder?: string;
  /** Keyboard hint key shown at the right; null hides it. */
  hint?: string | null;
  maxWidth?: number | string;
  style?: React.CSSProperties;
}
export function SearchField(props: SearchFieldProps): JSX.Element;
