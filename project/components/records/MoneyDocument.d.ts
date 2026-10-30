/** @startingPoint section="Records" subtitle="Money document: Invoice-ready data with Not a tax invoice in the header and footer, and the Settlement statement, one layout, no number, no bank field, no action (M7.DS.02)" viewport="900x620" */
export const MONEY_DOCUMENTS: { 'invoice-ready': { title: 'Invoice-ready data'; label: 'Not a tax invoice' }; 'settlement-statement': { title: 'Settlement statement'; label: 'Settlement statement' } };
/** Matches a bank detail label: bank, account number, IBAN, swift, sort or branch code. */
export const BANK_FIELD: RegExp;
/** The fields without any bank detail. */
export function documentFields(fields: Array<[string, React.ReactNode]>): Array<[string, React.ReactNode]>;
export interface MoneyDocumentProps {
  kind?: 'invoice-ready' | 'settlement-statement';
  counterparty?: React.ReactNode;
  /** The run or settlement reference, "IPR-0009"; never an invoice number. */
  reference?: string;
  /** "30 Sep 2026, 17:20 CAT". */
  generated?: string;
  fields?: Array<[string, React.ReactNode]>;
  columns?: Array<{ key: string; label: string; width?: string; align?: 'left' | 'right'; wrap?: boolean; render?: (r: any, i: number) => React.ReactNode }>;
  /** A row with total: true is drawn bold. */
  rows?: any[];
  minWidth?: number;
  style?: React.CSSProperties;
}
export function MoneyDocument(props: MoneyDocumentProps): JSX.Element;
