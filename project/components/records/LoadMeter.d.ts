/** @startingPoint section="Records" subtitle="Load meter: a load against its limit, Within, Approaching, At maximum or At legal payload, Over (M4.DS.02)" viewport="360x300" */
export type LoadState = 'within' | 'approaching' | 'at' | 'over';
/** Within below the approach share, Approaching from it, At at exactly the limit, Over above it. */
export function loadState(total: string | number, limit: string | number, approachShare?: number): LoadState;
/** "91%"; never "100%" below the limit or above it. */
export function loadUsed(total: string | number, limit: string | number): string;
export const LOAD_MARKS: Record<'order' | 'payload', Record<LoadState, { kind: string; word: string }>>;
export interface LoadMeterRow { label: React.ReactNode; value: React.ReactNode; strong?: boolean; }
export interface LoadMeterProps {
  /** The running total in tonnes: "27.240". */
  total: string | number;
  /** The limit in tonnes: the lower of the order's maximum and the truck's loading weight, or the legal payload. */
  limit: string | number;
  /** The payload approach setting as a share, 0.95 by default (CFG-PAYLOAD-APPROACH). Data, never styling. */
  approachShare?: number;
  /** order: Within maximum, Approaching, At maximum, "Over by 0.255 t". payload: Within payload, Approaching,
      At legal payload, Over legal payload. */
  kind?: 'order' | 'payload';
  /** The line above the figure: "Ticket net", "Loading weight". Left out by default, inside a card already titled Load. */
  label?: React.ReactNode;
  /** The rows above Used: Maximum order weight, Truck, Truck loading weight; or Legal payload, Ticket net, Excess. */
  rows?: LoadMeterRow[];
  unit?: string;
  style?: React.CSSProperties;
}
export function LoadMeter(props: LoadMeterProps): JSX.Element;
