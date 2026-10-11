/** @startingPoint section="Records" subtitle="Permit headroom: a mill's import permit with wanted, allowed, booked and headroom; an allocation past it is refused naming the permit, the headroom and the excess (M6.DS.01)" viewport="480x260" */
export interface PermitHeadroomFigures {
  allowed: number;
  booked: number;
  adding: number;
  /** Allowed less booked, never below 0. */
  headroom: number;
  /** Headroom once the allocation being entered is booked, never below 0. */
  after: number;
  /** How far the allocation would pass the permit; 0 when it fits. */
  excess: number;
  /** The allocation would pass the permit, so it is refused. Exactly 0 headroom after it is allowed. */
  refused: boolean;
  /** Wanted above allowed: a flag, never a block. */
  overOrdered: number;
}
/** Whole tonnes from strings such as "10,000". */
export function permitHeadroom(input: { allowed: string | number; booked: string | number; adding?: string | number; wanted?: string | number }): PermitHeadroomFigures;
/** "Exceeds permit SI-2026-014 headroom of 50 t by 50 t." */
export function permitReason(permit: string, headroom: string | number, excess: string | number): string;
export interface PermitHeadroomProps {
  /** The permit reference, e.g. "SI-2026-014". */
  permit: string;
  mill?: string;
  /** The mill or UAG. */
  holder?: string;
  /** "01 May 2026 to 30 Apr 2027". */
  period?: string;
  /** From the mill's monthly orders on import sale contracts. */
  wanted?: string | number;
  allowed: string | number;
  booked: string | number;
  /** The allocation being entered; moves the headroom as it is typed. */
  adding?: string | number;
  /** Opens the permit; the reference becomes the blue link. */
  onOpen?: () => void;
  style?: React.CSSProperties;
}
export function PermitHeadroom(props: PermitHeadroomProps): JSX.Element;
