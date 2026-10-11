/** @startingPoint section="Records" subtitle="Outbound reconcile: ordered, loaded and ticket net, the pair that is out named (M4.DS.02)" viewport="400x320" */
export interface OutboundCheck {
  /** Loaded against ticket net, in thousandths of a tonne. */
  variance: number;
  /** Loaded against ticket net is beyond the tolerance. */
  out: boolean;
  /** Ordered less loaded, in thousandths: shown, never a failure. */
  plan: number;
  outcome: 'within' | 'beyond';
}
export function outboundCheck(figures: { ordered: string | number; loaded: string | number; net: string | number; tolerance?: string | number }): OutboundCheck;
export interface OutboundReconcileProps {
  title?: React.ReactNode;
  ordered: string | number;
  loaded: string | number;
  /** The weighbridge ticket's net. */
  net: string | number;
  /** "0.080" on a grain pair; 0 bagged. */
  tolerance?: string | number;
  unit?: string;
  /** Rows under the figures: Legal payload, Payload used. */
  extra?: Array<{ label: React.ReactNode; value: React.ReactNode; strong?: boolean }>;
  style?: React.CSSProperties;
}
export function OutboundReconcile(props: OutboundReconcileProps): JSX.Element;
