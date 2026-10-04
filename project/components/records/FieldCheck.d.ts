/** @startingPoint section="Records" subtitle="Field check: what was read from a slip beside what the clerk confirms; Check, Checked and Corrected" viewport="760x520" */
export interface CheckField {
  key: string;
  /** "Gross (t)", "Vehicle", "Supplier as printed". */
  label: React.ReactNode;
  /** What was read from the slip. */
  read: string;
  /** The confirmed value; equal to read until the clerk edits it. */
  value: string;
  /** The reading is doubtful: the status Check until Checked is ticked or the value edited. Never shown as a confidence. */
  doubtful?: boolean;
  checked?: boolean;
  /** Tabular, right-aligned. */
  numeric?: boolean;
}
export interface FieldCheckProps {
  fields: CheckField[];
  onChange?: (key: string, patch: { value?: string; checked?: boolean }) => void;
  /** The photo (its fingerprint) shown beside the table. Without it the Confirmed column is read only (R-08). */
  evidence?: string;
  /** While Confirm weights is working. */
  disabled?: boolean;
  style?: React.CSSProperties;
}
export function FieldCheck(props: FieldCheckProps): JSX.Element;
export function fieldOpen(field: CheckField): boolean;
export function fieldCorrected(field: CheckField): boolean;
export function fieldsReady(fields: CheckField[]): boolean;
