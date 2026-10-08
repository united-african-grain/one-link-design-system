/** @startingPoint section="Records" subtitle="Transit residue: a leg's loss beyond its allowance, with its write-off Pending approval, never shown as done (M4.DS.01)" viewport="420x80" */
export type WriteOffState = 'none' | 'pending' | 'approved' | 'rejected';
export const WRITE_OFF_MARKS: Record<'pending' | 'approved' | 'rejected', { kind: string; word: string }>;
export interface TransitResidueProps {
  /** "Residue". */
  label?: React.ReactNode;
  /** In tonnes, three decimals: "0.300". */
  residue: string;
  unit?: string;
  /** none offers Request write-off; pending reads Pending approval; approved and rejected are the decision. */
  writeOff?: WriteOffState;
  /** Request write-off is being saved. */
  requesting?: boolean;
  onRequest?: () => void;
  style?: React.CSSProperties;
}
export function TransitResidue(props: TransitResidueProps): JSX.Element;
