export interface EvidenceTileProps {
  kind?: 'photo' | 'voice' | 'document' | 'receipt';
  src?: string;
  /** e.g. "photo-dsp0219-probe-1" */
  caption?: string;
  /** Voice note length, e.g. "0:47". */
  duration?: string;
  time?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function EvidenceTile(props: EvidenceTileProps): JSX.Element;
