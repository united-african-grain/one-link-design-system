/** @startingPoint section="Records" subtitle="Exceptions list: clerk wording or the owner's business wording; Open, Acknowledged, Closed" viewport="1000x320" */
export interface ExceptionRow {
  id: string;
  /** "Intake", "Execution". Severity shows through the type and the row order. */
  type: string;
  /** Operational wording, for the clerk: "Weighed in, not weighed out". */
  title: string;
  /** The record it concerns, for the clerk: "WBT10001599". */
  record: string;
  /** The clerk can open the record. */
  recordLink?: boolean;
  /** Business wording from rule configuration, for the owner: "Chisamba Shed weighbridge is offline since 09:10 CAT." */
  business: string;
  /** The record in business words, for the owner: "Lakeview Farms Ltd, maize". */
  businessRecord: string;
  businessRecordLink?: boolean;
  /** Value at risk in USD, shown only with the price tier. */
  value?: string;
  owner: string;
  age: string;
  status: 'open' | 'acknowledged' | 'closed';
}
export interface ExceptionListProps {
  rows: ExceptionRow[];
  variant?: 'clerk' | 'owner';
  /** The viewer holds the price tier: adds Value at risk (USD). */
  priceTier?: boolean;
  onOpen?: (id: string) => void;
  onOpenRecord?: (id: string) => void;
  style?: React.CSSProperties;
}
export function ExceptionList(props: ExceptionListProps): JSX.Element;
export function ExceptionStatus(props: { status?: 'open' | 'acknowledged' | 'closed'; size?: 'body-3' | 'body-4' }): JSX.Element;
export const EXCEPTION_STATUSES: Array<'open' | 'acknowledged' | 'closed'>;
