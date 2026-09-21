export interface QrCodeProps {
  /**
   * The code, row by row: `true` is a dark module. Square in practice (21x21 and up),
   * and the component reads each row's own length, so a ragged matrix draws what it has.
   * Encoding is the caller's job; this renders.
   */
  matrix: boolean[][];
  /** Rendered pixel size of the square, quiet zone included. */
  size?: number;
  /** Accessible name, read by `role="img"`. Say what the code is for, not "QR code". */
  label?: string;
  /** Quiet zone in modules on every side. 4 is the QR specification's minimum. */
  quietZone?: number;
  style?: React.CSSProperties;
}
export function QrCode(props: QrCodeProps): JSX.Element;
