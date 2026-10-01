/** @startingPoint section="Records" subtitle="Calculation details: the right-hand panel a figure opens (map UX-18)" viewport="700x560" */
export interface CalculationRow {
  label: React.ReactNode;
  /** A figure, or <NotSet owner=".." /> where it rests on a setting with no value. */
  value: React.ReactNode;
  strong?: boolean;
}
export interface CalculationDetailsProps {
  open?: boolean;
  /** The figure's name, e.g. "Total exposure". */
  name: React.ReactNode;
  /** The full value, e.g. "USD 1,702,000.00", or <NotSet />. */
  value: React.ReactNode;
  /** Its components, in order. */
  components?: CalculationRow[];
  /** The bold total row. */
  total?: { label?: React.ReactNode; value: React.ReactNode };
  /** Exchange rate, rate date, source; or the missing setting and its owner. */
  basis?: CalculationRow[];
  /** One button to open the underlying records, e.g. { label: 'Open contracts' }. */
  action?: { label: React.ReactNode; onClick?: () => void };
  onClose?: () => void;
  /** Render inside a positioned container rather than the viewport (cards and kits). */
  contained?: boolean;
  width?: number | string;
  style?: React.CSSProperties;
}
export function CalculationDetails(props: CalculationDetailsProps): JSX.Element;
