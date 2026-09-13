/** @startingPoint section="Navigation" subtitle="Desktop header with BETA badge, search, sync pill and module tabs" viewport="1200x110" */
export interface HeaderProps {
  modules?: Array<{ value: string; label: string; icon?: string }>;
  module?: string;
  onModuleChange?: (value: string) => void;
  /** live | stalled | offline; null hides the pill. */
  sync?: 'live' | 'stalled' | 'offline' | null;
  syncLabel?: string;
  initials?: string;
  userLine?: string;
  product?: string;
  /** BETA badge beside the wordmark. */
  showBeta?: boolean;
  /** Hide the 48px module row (Partner Portal). */
  showTabs?: boolean;
  showSearch?: boolean;
  /** 80% white + 24px blur once content scrolls under. */
  scrolled?: boolean;
  /** Extra elements before the sync pill. */
  right?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Header(props: HeaderProps): JSX.Element;
export const MODULES: Array<{ value: string; label: string; icon: string }>;
