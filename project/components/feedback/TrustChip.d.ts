export interface ProvenanceChipProps {
  kind?: 'synced' | 'bridge' | 'ocr-high' | 'ocr-medium' | 'ocr-low' | 'typed' | 'declared';
  label?: React.ReactNode;
  style?: React.CSSProperties;
}
export function ProvenanceChip(props: ProvenanceChipProps): JSX.Element;
export interface ConfirmationChipProps {
  kind?: 'confirmed' | 'awaiting' | 'disputed' | 'confirm';
  label?: React.ReactNode;
  style?: React.CSSProperties;
}
export function ConfirmationChip(props: ConfirmationChipProps): JSX.Element;
