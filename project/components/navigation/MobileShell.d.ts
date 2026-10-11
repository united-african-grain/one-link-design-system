/** @startingPoint section="Navigation" subtitle="390px shell: top row, sub-tabs, content, bottom module bar" viewport="390x844" */
export interface MobileShellProps {
  /** Page title; when omitted the logo shows. */
  title?: React.ReactNode;
  subTabs?: Array<string | { value: string; label: string }>;
  subTab?: string;
  onSubTabChange?: (v: string) => void;
  module?: string;
  onModuleChange?: (v: string) => void;
  /** The bottom bar's areas when they are not the owner's modules (the UAG One Link app: Tasks, Pending sync). Default: the first five MODULES. */
  modules?: Array<{ value: string; label: string; icon: string }>;
  /** Draws the back chevron before the title (UX-31: detail and task screens). Left out, no chevron. */
  onBack?: () => void;
  initials?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
  height?: number;
  showBottomBar?: boolean;
  /** Home-indicator safe area in px (34 on modern iPhones). */
  safeArea?: number;
  style?: React.CSSProperties;
}
export function MobileShell(props: MobileShellProps): JSX.Element;
