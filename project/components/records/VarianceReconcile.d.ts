/** @startingPoint section="Records" subtitle="Variance reconcile: weighbridge net against theoretical weight, Within tolerance or Variance flagged (M4.DS.02)" viewport="400x300" */
export function weighbridgeVariance(theoretical: string | number, net: string | number, allowedPct: number): { diff: number; pct: number; flagged: boolean; outcome: 'within' | 'flagged' };
/** "1.4%"; two decimals when the allowed variance is below 1% (UX-13). */
export function variancePct(value: number, allowedPct: number): string;
export interface VarianceReconcileProps {
  title?: React.ReactNode;
  /** From pack weights including packaging, or volume and density: "27.240". */
  theoretical: string | number;
  /** The weighbridge ticket's net. */
  net: string | number;
  /** The UAG variance setting in per cent: 1.0. */
  allowedPct?: number;
  unit?: string;
  /** Rows after Allowed variance: Count sheet, Matches. */
  extra?: Array<{ label: React.ReactNode; value: React.ReactNode; strong?: boolean }>;
  style?: React.CSSProperties;
}
export function VarianceReconcile(props: VarianceReconcileProps): JSX.Element;
