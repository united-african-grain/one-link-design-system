export interface FigureProps {
  /** body-3 secondary, e.g. "your position right now". */
  label?: React.ReactNode;
  /** Formatted figure: K125M · 34,117 · 12.6%. */
  value: React.ReactNode;
  /** Quaternary unit after the value (MT, t). */
  unit?: React.ReactNode;
  /** Condensed style: display-1-condensed for the owner hero; heading-1-condensed elsewhere. */
  size?: 'display-1-condensed' | 'display-2-condensed' | 'display-3-condensed' | 'display-4-condensed' | 'heading-1-condensed' | 'heading-2-condensed' | 'heading-3-condensed';
  /** Delta text, e.g. "9.4%". Direction inferred from a leading "-" unless deltaDirection is set. */
  delta?: React.ReactNode;
  deltaDirection?: 'up' | 'down' | 'flat';
  /** Tertiary suffix after the delta, e.g. "vs 5.1% blended, 30d". */
  deltaSuffix?: React.ReactNode;
  /** body-4 tertiary derivation line: "physical K80M · in-transit K45M". */
  derivation?: React.ReactNode;
  /** Rows for the derivation popover; presence makes the value clickable (dotted underline). */
  derivationRows?: Array<{ label: React.ReactNode; value: React.ReactNode; total?: boolean }>;
  tone?: 'primary' | string;
  valueColor?: string;
  align?: 'left' | 'right';
  style?: React.CSSProperties;
}
export function Figure(props: FigureProps): JSX.Element;
