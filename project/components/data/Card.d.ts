/** @startingPoint section="Data" subtitle="White-on-white card with commodity hover wash, rows, chips and figure buttons" viewport="700x260" */
export interface CardProps {
  title?: React.ReactNode;
  /** String, node, or array of segments joined by 3px dot separators. */
  meta?: React.ReactNode | React.ReactNode[];
  headerRight?: React.ReactNode;
  /** body-3 tertiary footer: "Showing 4 of 72 trades · season 2026". */
  footer?: React.ReactNode;
  /** Enables the commodity hover wash and conic border. */
  commodityColor?: string;
  /** Hover/press effects on. */
  interactive?: boolean;
  /** Closed/complete record: title quaternary. */
  closed?: boolean;
  padding?: number;
  gap?: number;
  width?: number | string;
  onClick?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Card(props: CardProps): JSX.Element;
export function Dot(): JSX.Element;
export interface CardRowProps {
  /** 28px Avatar / commodity tile. */
  leading?: React.ReactNode;
  name: React.ReactNode;
  sub?: React.ReactNode;
  /** A ShareBar. */
  bar?: React.ReactNode;
  /** Secondary tabular figure. */
  figure?: React.ReactNode;
  /** QuantityChip, PressButton, StatusMark… */
  trailing?: React.ReactNode;
  closed?: boolean;
  style?: React.CSSProperties;
}
export function CardRow(props: CardRowProps): JSX.Element;
