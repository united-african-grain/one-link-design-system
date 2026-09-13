/** @startingPoint section="Data" subtitle="Dense register with ref links, restricted cells, derived cells and correction rows" viewport="900x360" */
export interface DataColumn<Row = any> {
  key: string;
  label: React.ReactNode;
  /** Numbers right-aligned and tabular. */
  align?: 'left' | 'right';
  /** CSS grid track, e.g. '120px' or 'max-content'. */
  width?: string;
  tone?: 'primary' | 'secondary' | 'tertiary';
  tabular?: boolean;
  render?: (row: Row, index: number) => React.ReactNode;
}
export interface DataTableProps<Row = any> {
  columns: DataColumn<Row>[];
  /** row.closed dims the row; row.correction = {reason, actor, time} adds a compensating row beneath. */
  rows: Array<Row & { closed?: boolean; correction?: { reason: string; actor: string; time: string } }>;
  footer?: React.ReactNode;
  total?: number;
  page?: number;
  pageSize?: number;
  onPage?: (page: number) => void;
  rowKey?: string;
  /** Optional caption-1-condensed column-group labels above the header: [{label, span}]. */
  groupLabels?: Array<{ label: string; span?: number }>;
  style?: React.CSSProperties;
}
export function DataTable<Row = any>(props: DataTableProps<Row>): JSX.Element;
export function RestrictedCell(props: { tooltip?: string }): JSX.Element;
export function DerivedCell(props: { children: React.ReactNode; rows?: Array<{ label: React.ReactNode; value: React.ReactNode; total?: boolean }> }): JSX.Element;
export function RefCell(props: { children: React.ReactNode; href?: string }): JSX.Element;
