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
  /** Pinned below the sidebar nav, above a hairline. */
  foot?: React.ReactNode;
  /** Below main, inside the shell column (the chart attribution). */
  footer?: React.ReactNode;
  children?: React.ReactNode;
  product?: string;
  showBeta?: boolean;
  /** Start with the account menu open (demos). */
  accountOpen?: boolean;
  /** Force the toolbar's 80% white + 24px blur surface. */
  scrolled?: boolean;
  style?: React.CSSProperties;
}
export function AppShell(props: AppShellProps): JSX.Element;
