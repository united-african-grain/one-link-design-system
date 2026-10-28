/** synced, ocr-verified, unverified, declared (Declared by farmer) and declared-mill (Declared by mill), plus the three review-only confidence kinds (never shown as a confidence). */
export type ProvenanceKind = 'synced' | 'ocr-verified' | 'unverified' | 'declared' | 'declared-mill' | 'ocr-high' | 'ocr-medium' | 'ocr-low';
export const PROVENANCE_KINDS: ProvenanceKind[];
export interface ProvenanceChipProps {
  kind?: ProvenanceKind;
  label?: React.ReactNode;
  style?: React.CSSProperties;
}
export function ProvenanceChip(props: ProvenanceChipProps): JSX.Element;
export interface ConfirmationChipProps {
  kind?: 'confirmed' | 'awaiting' | 'disputed' | 'confirm' | 'pending';
  label?: React.ReactNode;
  style?: React.CSSProperties;
}
export function ConfirmationChip(props: ConfirmationChipProps): JSX.Element;
