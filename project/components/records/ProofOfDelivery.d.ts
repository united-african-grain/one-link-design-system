/** @startingPoint section="Records" subtitle="Proof of delivery: Photograph, Receiver signature, Receiver name; Delivered, Proof missing, Pending sync, In review, Delivery refused (M4.DS.02)" viewport="720x320" */
export type ProofItemStatus = 'received' | 'awaiting' | 'missing' | 'pending-sync' | 'in-review' | 'refused' | 'superseded';
export type ProofState = 'delivered' | 'awaiting' | 'missing' | 'pending-sync' | 'in-review' | 'refused';
export const PROOF_ITEM_MARKS: Record<ProofItemStatus, { kind: string; word: string }>;
export const PROOF_MARKS: Record<ProofState, { kind: string; word: string }>;
export interface ProofItem {
  /** Photograph, Receiver signature, Receiver name. */
  item: string;
  status: ProofItemStatus;
  /** "26 Sep 2026, 14:40, G. Phiri"; blank while missing. */
  captured?: React.ReactNode;
}
/** Refused, In review, Pending sync, Delivered, Awaiting proof (inside the proof window), else Proof missing.
    Superseded items never count. */
export function proofState(items: ProofItem[]): ProofState;
export interface ProofOfDeliveryProps {
  title?: React.ReactNode;
  items: ProofItem[];
  /** Labelled fields under the items: [['Shipped', '33.880 t'], ['Received', '33.640 t']]. */
  facts?: Array<[string, React.ReactNode]>;
  style?: React.CSSProperties;
}
export function ProofOfDelivery(props: ProofOfDeliveryProps): JSX.Element;
