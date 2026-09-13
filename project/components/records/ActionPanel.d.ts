/** @startingPoint section="Records" subtitle="350px ticket / decision panel with tabs, amount row, summary list and a large commit action" viewport="400x560" */
export interface ActionPanelProps {
  /** Initials string (28px Avatar) or a node. */
  tile?: React.ReactNode;
  /** body-3 secondary context line. */
  context?: React.ReactNode;
  /** body-1-strong subject. */
  subject?: React.ReactNode;
  tabs?: Array<string | { value: string; label: string }>;
  tab?: string;
  onTab?: (v: string) => void;
  /** false hides the right-aligned menu button. */
  menu?: boolean;
  children?: React.ReactNode;
  width?: number | string;
  /** Inline error banner with a Retry button. */
  error?: React.ReactNode;
  onRetry?: () => void;
  retrying?: boolean;
  /** Success toast text. */
  success?: React.ReactNode;
  /** Reason line under a disabled action. */
  disabledReason?: React.ReactNode;
  style?: React.CSSProperties;
}
export function ActionPanel(props: ActionPanelProps): JSX.Element;
export function AmountRow(props: { label: React.ReactNode; value: React.ReactNode; unit?: React.ReactNode; sub?: React.ReactNode }): JSX.Element;
export function SummaryList(props: { items: Array<{ label: React.ReactNode; value: React.ReactNode; strong?: boolean; color?: string }> }): JSX.Element;
export function RadioList(props: { options: Array<string | { value: string; label: string; hint?: string }>; value?: string; onChange?: (v: string) => void; name?: string }): JSX.Element;
