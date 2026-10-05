/** @startingPoint section="Data" subtitle="Source line: where a figure comes from, as the labelled field Source (Trade sheet, 01 Oct 2026)" viewport="420x120" */
export type SourceKind = 'trade-sheet' | 'stock-sheet' | 'season-book' | 'load-register' | 'weighbridge' | 'scanned-slip' | 'delivery-note' | 'invoice' | 'farmer-ledger';
export const SOURCE_KINDS: Record<SourceKind, string>;
/** "Trade sheet, 01 Oct 2026". */
export function sourceWords(kind: SourceKind, date?: string): string;
export interface SourceLineProps {
  kind: SourceKind;
  /** DD MMM YYYY, e.g. "01 Oct 2026". */
  date?: string;
  /** The field's label. Keep "Source"; "Opening stock source" where a card holds more than one. */
  label?: string;
  /** Label and value on one line ("Source: Trade sheet, 01 Oct 2026"), for the foot of a figure. */
  inline?: boolean;
  style?: React.CSSProperties;
}
export function SourceLine(props: SourceLineProps): JSX.Element;
