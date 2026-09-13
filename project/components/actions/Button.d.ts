/** @startingPoint section="Actions" subtitle="Brand, primary, outline, ghost, subtle, critical, commodity — with the mandatory loading state" viewport="700x420" */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** brand = entry points (New trade, Raise GRN). primary = decisions (Approve, Finalise). critical = Decline/Void. commodity = trade-ticket action only. */
  variant?: 'brand' | 'primary' | 'ghost' | 'outline' | 'subtle' | 'critical' | 'critical-ghost' | 'commodity';
  /** xsmall 32 (radius 10) · small 36 (pill) · medium 40 (radius 12) · large 48 (radius 14). */
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  /** Leading Lucide icon (20px). */
  icon?: string;
  iconRight?: string;
  /** Mandatory on any button that triggers work: label fades to a spinning loader-circle, width fixed, not re-pressable. */
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Fill for variant="commodity". */
  commodityColor?: string;
  style?: React.CSSProperties;
}
export function Button(props: ButtonProps): JSX.Element;
