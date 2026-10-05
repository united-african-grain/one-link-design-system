/** @startingPoint section="Records" subtitle="Counterparty overview: the read-only highlights of a counterparty, each figure with its as-of date, restricted where the tier is missing" viewport="1000x200" */
export interface OverviewFigureSpec {
  key: string;
  /** Sales under contract, Delivered, Left to deliver, Receivables, Oldest unpaid. */
  label: string;
  value?: React.ReactNode;
  /** DD MMM YYYY: "01 Oct 2026". Every figure says what date it is as of. */
  asOf: string;
  /** The viewer's price tier does not allow it: a lock, no value, the tooltip Restricted. */
  restricted?: boolean;
}
export interface CounterpartyOverviewProps {
  name: React.ReactNode;
  /** Mill, Farmer, Transporter… */
  type: React.ReactNode;
  /** A StatusMark: Active. */
  status?: React.ReactNode;
  figures: OverviewFigureSpec[];
  /** Opens Calculation details for a figure (read-only drill-down, map UX-18). */
  onFigure?: (key: string) => void;
  style?: React.CSSProperties;
}
export function CounterpartyOverview(props: CounterpartyOverviewProps): JSX.Element;
