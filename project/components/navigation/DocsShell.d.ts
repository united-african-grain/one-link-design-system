/** @startingPoint section="Navigation" subtitle="Reading frame outside the app: sticky header with lockup, label, search and the way back; topics rail; article" viewport="1200x760" */
export interface DocsShellPage {
  value: string;
  label: string;
}
export interface DocsShellSection {
  /** Caption-1-condensed label over the section's pages. */
  title: string;
  pages: DocsShellPage[];
}
export interface DocsShellProps {
  /** The frame's name beside the lockup, after a hairline: "Help". */
  label?: string;
  /** The topics, grouped as the product groups them. */
  sections?: DocsShellSection[];
  /** The value of the page on screen; its row is marked. Equal to `home` on the list of topics. */
  current?: string;
  /** The value for the list of topics, which the lockup and the first row open. */
  home?: string;
  homeLabel?: string;
  onNavigate?: (value: string) => void;
  /** A SearchField. At the right of the header from 768px, a full width row under it below. */
  search?: React.ReactNode;
  /** The one way back, at the far right of the header: a Button, "Back to One Link". */
  back?: React.ReactNode;
  /** The article. */
  children?: React.ReactNode;
  product?: string;
  showBeta?: boolean;
  /** Below 1024px, start with the topics drawer open (for the card). */
  topicsOpen?: boolean;
  /** Force the scrolled (80% white, blurred) header. */
  scrolled?: boolean;
  style?: React.CSSProperties;
}
export function DocsShell(props: DocsShellProps): JSX.Element;
