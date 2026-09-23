export interface CitationChipProps {
  /** The help page's title. A citation names a page and nothing else: no figure, no score. */
  label?: React.ReactNode;
  href?: string;
  /** Lucide icon. `file-text` for a help page, `link` for anything else. */
  icon?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  style?: React.CSSProperties;
}
export function CitationChip(props: CitationChipProps): JSX.Element;
