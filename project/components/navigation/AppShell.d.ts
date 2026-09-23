/** @startingPoint section="Navigation" subtitle="Signed-in frame: 260px sidebar, 56px toolbar with breadcrumb and account menu, page column" viewport="1200x720" */
export interface AppShellSection {
  value: string;
  label: string;
  count?: number | string | null;
}
export interface AppShellItem {
  value: string;
  label: string;
  /** Lucide icon name (the module vocabulary: gauge, arrow-left-right, warehouse, package, hand-coins, sparkles). */
  icon?: string;
  count?: number | string | null;
  /** Shown as indented rows under this item while it is the active module. */
  sections?: AppShellSection[];
}
export interface AppShellGroup {
  /** Optional caption-1-condensed group label. */
  label?: string;
  items: AppShellItem[];
}
export interface AppShellUser {
  initials: string;
  name: string;
  email?: string;
  /** The line under the name in the toolbar, and the tag in the popover (the role). */
  meta?: string;
}
export interface AppShellProps {
  nav?: AppShellGroup[];
  /** Active module value. */
  module?: string;
  /** Active section value. */
  section?: string;
  /** Receives a module, section or the `home` value. */
  onNavigate?: (value: string) => void;
  /** Value passed to onNavigate when the brand is pressed (default 'home'). */
  home?: string;
  /** Product, then current: ['Trade Desk', 'Coverage']. The last part is the current page. */
  breadcrumb?: string[];
  /** live | stalled | offline; null hides the pill. */
  sync?: 'live' | 'stalled' | 'offline' | null;
  syncLabel?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  showDigest?: boolean;
  /** Who is signed in. Omit to hide the account block. */
  user?: AppShellUser;
  /** Sign out is working: the row shows the spinner and cannot be pressed again. */
  signingOut?: boolean;
  onSignOut?: () => void;
  /** Product items in the account popover, between identity and Sign out. */
  menu?: React.ReactNode;
  /** Extra toolbar elements before the sync pill. */
  right?: React.ReactNode;
  /** Pinned below the sidebar nav, above a hairline, with the collapse toggle as the last row under it. */
  foot?: React.ReactNode;
  /** Below main, inside the shell column (the chart attribution). */
  footer?: React.ReactNode;
  /**
   * The `Ticker` strip along the foot of the frame. Not a row of the page column: it spans every
   * column, under the sidebar as well, because the inverted top corners only read if they meet the
   * window's own edges. It is sticky rather than fixed, so it stays at the foot of the window while
   * the page scrolls and still takes its own space at the end of the document. The sidebar is cut
   * short by its height so the two never overlap, and the page column is padded by it so nothing
   * ends up underneath. It sits below the mobile drawer and its scrim in the stack.
   */
  ticker?: React.ReactNode;
  children?: React.ReactNode;
  product?: string;
  showBeta?: boolean;
  /** Start with the account menu open (demos). */
  accountOpen?: boolean;
  /** Force the toolbar's 80% white + 24px blur surface. */
  scrolled?: boolean;
  /**
   * Collapse the sidebar to 64px of module icons, with each module's sections in a flyout.
   * Honoured from 1024px only: below that the sidebar is a drawer and the toggle is not drawn.
   */
  collapsed?: boolean;
  /** The toggle in the rail foot was pressed. Persist it per person; the component also holds it. */
  onCollapsedChange?: (collapsed: boolean) => void;
  style?: React.CSSProperties;
}
export function AppShell(props: AppShellProps): JSX.Element;
export interface RailLinkProps {
  /** Lucide icon name (settings, circle-help). */
  icon?: string;
  label: string;
  active?: boolean;
  /** Draw the icon alone and keep the label for a screen reader. Pass the shell's own collapsed state; the row ignores it below 1024px. */
  collapsed?: boolean;
  onSelect?: () => void;
}
/** A row for the rail foot slot: Settings, Help, anything that is not a module. */
export function RailLink(props: RailLinkProps): JSX.Element;
