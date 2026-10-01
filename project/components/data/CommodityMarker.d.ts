/** @startingPoint section="Data" subtitle="Commodity marker: a square in the commodity's colour before its name (map UX-27)" viewport="320x80" */
export interface CommodityMarkerProps {
  /** A key of COMMODITY_COLORS: maize, white-maize, wheat, soya, soya-meal, fertilizer. */
  commodity?: string;
  /** Overrides the commodity's colour. */
  color?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function CommodityMarker(props: CommodityMarkerProps): JSX.Element;
