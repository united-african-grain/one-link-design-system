/** @startingPoint section="Data" subtitle="TradingView Lightweight Charts v5 card with line/area/baseline/histogram, price lines and end label" viewport="700x380" */
export interface ChartSeries {
  type?: 'line' | 'area' | 'baseline' | 'histogram';
  /** [{time:'2026-06-01', value: 120}] (histogram may add color per point). */
  data: Array<{ time: string | number; value: number; color?: string }>;
  /** Line colour: commodity colour for prices, brand #2563EB for money. */
  color?: string;
  /** End-of-line label name (caption-1). */
  name?: string;
  /** Formats the end label value, e.g. v => 'K' + v + 'M'. */
  format?: (v: number) => string;
  /** Baseline only: the policy line price. */
  baseValue?: number;
  topColor?: string; bottomColor?: string;
  priceLines?: Array<{ price: number; color?: string; title?: string }>;
  options?: Record<string, unknown>;
}
export interface ChartCardProps {
  title?: React.ReactNode;
  ranges?: string[];
  range?: string;
  onRange?: (r: string) => void;
  series?: ChartSeries[];
  /** Dashed threshold lines: {price, color, title}. */
  priceLines?: Array<{ price: number; color?: string; title?: string }>;
  /** Event markers: circles in #23272d with short text. */
  markers?: Array<{ time: string | number; text: string; position?: 'aboveBar' | 'belowBar' }>;
  /** 280 desktop, 200 mobile. */
  height?: number;
  state?: 'ready' | 'loading' | 'empty' | 'error';
  onRetry?: () => void;
  retrying?: boolean;
  endLabel?: boolean;
  footerNote?: React.ReactNode;
  style?: React.CSSProperties;
}
export function ChartCard(props: ChartCardProps): JSX.Element;
export function ChartAttribution(props: { style?: React.CSSProperties }): JSX.Element;
