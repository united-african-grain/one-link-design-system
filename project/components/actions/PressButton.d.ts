/** @startingPoint section="Actions" subtitle="Figure buttons, two-up toggles, quick amounts and large commit actions on a 4px edge" viewport="700x360" */
export interface PressButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** figure 40px × min 60px, body-3-strong tabular (coverage 53%, LTV 25.3%) · toggle 48px two-up · quick 32px (+100t) · large 48px full-width commit. */
  kind?: 'figure' | 'toggle' | 'quick' | 'large';
  /** outline = white face; filled variants take the fill under a 15%-black edge. */
  variant?: 'outline' | 'primary' | 'commodity' | 'critical' | 'brand';
  selected?: boolean;
  /** kind="figure" only: heading-3-condensed uppercase figure with 12px side padding instead of the default 60px body-3-strong outcome face. */
  condensed?: boolean;
  commodityColor?: string;
  /** Same loading behaviour as Button. */
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string;
  /** Label; children also accepted. */
  text?: React.ReactNode;
  style?: React.CSSProperties;
}
export function PressButton(props: PressButtonProps): JSX.Element;
export interface PressToggleProps {
  options: Array<string | { value: string; label: React.ReactNode; icon?: string; color?: string }>;
  value: string;
  onChange?: (value: string) => void;
  /** Fill of the selected side. Use 'commodity' + commodityColor inside a trade ticket. */
  selectedVariant?: 'primary' | 'commodity' | 'critical' | 'brand';
  commodityColor?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export function PressToggle(props: PressToggleProps): JSX.Element;
