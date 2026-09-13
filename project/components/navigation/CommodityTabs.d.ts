export interface CommodityTabsProps {
  tabs: Array<{ value: string; label: string; color?: string }>;
  value: string;
  onChange?: (value: string) => void;
  style?: React.CSSProperties;
}
export function CommodityTabs(props: CommodityTabsProps): JSX.Element;
export const COMMODITY_COLORS: Record<string, string>;
