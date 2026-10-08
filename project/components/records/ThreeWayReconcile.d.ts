/** @startingPoint section="Records" subtitle="Three-way reconcile: ticket net, lines total and offload tally; names the pair that is out and by how much (M4.DS.01, UX-20)" viewport="400x320" */
export interface ThreeWayFigure {
  /** "Ticket net", "Lines total", "Offload tally". */
  label: string;
  /** In tonnes, three decimals: "32.140". */
  value: string | number;
}
export interface ThreeWayPair { a: number; b: number; /** thousandths of a tonne */ diff: number; out: boolean }
export function threeWayCheck(values: Array<string | number>, tolerance?: string | number): { pairs: ThreeWayPair[]; variance: number; outcome: 'within' | 'beyond' };
export interface ThreeWayReconcileProps {
  title?: React.ReactNode;
  /** Exactly three: ticket net, lines total, offload tally. */
  figures: [ThreeWayFigure, ThreeWayFigure, ThreeWayFigure];
  /** In tonnes: "0.080" (80 kg on a weight pair, the pack default). */
  tolerance: string | number;
  unit?: string;
  /** Rows under the figures: Bags counted, Pack weight. */
  extra?: Array<{ label: React.ReactNode; value: React.ReactNode }>;
  style?: React.CSSProperties;
}
export function ThreeWayReconcile(props: ThreeWayReconcileProps): JSX.Element;
