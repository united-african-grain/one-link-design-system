/** @startingPoint section="Data" subtitle="KPI tile: a Home's headline figure with one caption line, opening Calculation details; Not set when its rate is missing (map UX-08, UX-16)" viewport="700x140" */
export interface KpiTileProps {
  /** "Total exposure", "Uncovered exposure", "Coverage". */
  label: React.ReactNode;
  /** The figure as a tile shows it: "USD 2.66M", "78.2%" (K or M only in tiles, UX-11). */
  value?: React.ReactNode;
  /** One line under the figure: "As of 26 Sep 2026, 07:02 CAT", "21.8% of total exposure". */
  caption?: React.ReactNode;
  /** The figure rests on a setting with no value: Not set with the amber triangle in its place, never a zero (UX-16). */
  notSet?: boolean;
  /** Opens Calculation details. Given, the tile is a button. */
  onOpen?: () => void;
  /** The figure's type; heading-1-condensed on a web Home, heading-2-condensed on a phone. */
  size?: 'heading-1-condensed' | 'heading-2-condensed' | 'heading-3-condensed';
  style?: React.CSSProperties;
}
export function KpiTile(props: KpiTileProps): JSX.Element;
/** At most four tiles on a Home (UX-08). */
export const KPI_TILE_CAP: 4;
/** The tiles to draw: the given ones, at most KPI_TILE_CAP, none invented for a missing one. */
export function kpiTiles<T>(tiles: Array<T | null | undefined | false>): T[];
