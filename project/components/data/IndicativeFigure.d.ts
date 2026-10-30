/** @startingPoint section="Data" subtitle="Indicative figure: always named Indicative with the label Indicative, not a valuation; opens Calculation details naming the basis, what it leaves out and the rate with its date (M7.DS.02)" viewport="700x160" */
/** "Indicative, not a valuation": drawn by every IndicativeFigure, with no prop to hide it. */
export const INDICATIVE_LABEL: string;
/** "Indicative cost". */
export const INDICATIVE_NAME: string;
/** The basis Calculation details names: the purchase contract cost of each lot, in US dollars at the lot's own rate. */
export const INDICATIVE_BASIS: string;
/** A name that always starts with Indicative. */
export function indicativeName(name?: string): string;
export interface IndicativeCalcInput {
  name?: string;
  /** "USD 352,108.56"; blank is Not set. */
  value?: React.ReactNode;
  components?: Array<{ label: React.ReactNode; value: React.ReactNode; strong?: boolean }>;
  total?: { label?: React.ReactNode; value: React.ReactNode };
  /** The cost categories the figure leaves out, e.g. ['Transport', 'Clearing Docs', 'Commissions']. */
  leavesOut?: string[];
  /** "ZMW 25.00 per USD"; missing is Not set with its owner. */
  rate?: string;
  /** "26 Sep 2026". */
  rateDate?: string;
  source?: string;
  rateOwner?: string;
}
/** The CalculationDetails props of an indicative figure: Label, Basis, Leaves out, Exchange rate, Rate as at, Source. */
export function indicativeCalc(input?: IndicativeCalcInput): { name: string; value: React.ReactNode; components: any[]; total?: any; basis: Array<{ label: string; value: React.ReactNode }> };
export interface IndicativeFigureProps {
  /** Starts with Indicative whatever is given: "Weighted average cost" reads "Indicative weighted average cost". */
  name?: string;
  value?: React.ReactNode;
  /** Opens Calculation details; the value is then the blue figure. */
  onOpen?: () => void;
  /** No contract tier: the Restricted lock in the value's place. */
  restricted?: boolean;
  /** No rate at all: Not set, never a zero. */
  notSet?: boolean;
  owner?: string;
  /** 'figure' stacks name, value and label; 'inline' is the value and the word Indicative, for a table cell. */
  variant?: 'figure' | 'inline';
  /** Inter, never a condensed or uppercase face (AC 3): heading-4 by default. */
  size?: 'heading-3' | 'heading-4' | 'body-2';
  style?: React.CSSProperties;
}
export function IndicativeFigure(props: IndicativeFigureProps): JSX.Element;
