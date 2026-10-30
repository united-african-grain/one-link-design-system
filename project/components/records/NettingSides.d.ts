/** @startingPoint section="Records" subtitle="Netting sides: a settlement proposal's two sides in netting order, the offset and the net, and Net less with a reason that cannot confirm without one (M7.DS.02)" viewport="1000x560" */
export type SettlementStatusKey = 'draft' | 'pending' | 'approved' | 'rejected' | 'paid' | 'reversed';
/** Draft, Pending approval, Approved, Rejected, Paid, Reversed. */
export const SETTLEMENT_STATUS: Record<SettlementStatusKey, { kind: string; word: string }>;
export function SettlementStatus(props: { status: SettlementStatusKey; size?: 'body-3' | 'body-4' }): JSX.Element | '';
export const NETTING_WORDS: Record<'payable' | 'owed' | 'grain' | 'debts' | 'offset' | 'net' | 'netOwed' | 'order' | 'partial', string>;
export interface PayableLine { id: string; what: string; weight?: string; rate?: string; amount: string }
export interface OwedLine { id: string; what: string; amount: string; kind?: 'prepayment' | 'fertiliser' | 'seed' | 'other'; date?: string }
/** A prepayment first, then the rest in the order given (oldest first); each line numbered from 1. */
export function nettingOrder(owed: OwedLine[]): Array<OwedLine & { order: number }>;
export interface Netting {
  grain: string; debts: string; offset: string; full: string; partial: boolean; net: string; stillOwed: string; nothingToNet: boolean;
  lines: Array<OwedLine & { order: number; recovered: string }>;
}
/** Every figure from the lines: the offset is the full one unless `partial` nets less. */
export function nettingOf(input: { payable?: PayableLine[]; owed?: OwedLine[]; partial?: string }): Netting;
export const PARTIAL_REASON_MIN: 10;
/** True only for an offset below the full one with a reason of ten characters or more. */
export function canConfirmPartial(input: { offset?: string; full?: string; reason?: string }): boolean;
export interface NettingSidesProps { payable?: PayableLine[]; owed?: OwedLine[]; partial?: string; currency?: string; style?: React.CSSProperties }
export function NettingSides(props: NettingSidesProps): JSX.Element;
export interface PartialNettingDialogProps {
  open?: boolean;
  /** The full offset, "23,760.00". */
  full: string;
  currency?: string;
  defaultOffset?: string;
  defaultReason?: string;
  busy?: boolean;
  sheet?: boolean;
  contained?: boolean;
  onCancel?: () => void;
  onConfirm?: (v: { offset: string; reason: string }) => void;
}
export function PartialNettingDialog(props: PartialNettingDialogProps): JSX.Element | null;
