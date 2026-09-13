export interface DialogProps {
  open?: boolean;
  /** Bottom sheet: full width, top corners rounded, rises on the expand curve. */
  sheet?: boolean;
  title?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  /** Position absolutely inside the nearest positioned parent instead of the viewport (for artboards). */
  contained?: boolean;
  style?: React.CSSProperties;
}
export function Dialog(props: DialogProps): JSX.Element | null;
