/** @startingPoint section="Records" subtitle="Import preview: File card, tiles, rows with Result; Import disabled on any row error (map UX-25)" viewport="1000x560" */
export interface ImportRow {
  /** The file's own row number; errors cite it. */
  row: number;
  /** The sheet the row is on, for a workbook with more than one (a load register has one tab per supplier, so row
      numbers repeat). Rows are told apart by sheet and row; without it, by row alone. */
  sheet?: string;
  /** A row error, e.g. "Unknown contract ZAM 4999". The Result column shows it and Import stays disabled. */
  error?: string;
  /** A row check (M3.DS.01): the Result column reads "Cell D4: amendment, confirm before import". An unconfirmed
      amendment stops Import; the warnings never do. */
  check?: 'amendment' | 'amendment-confirmed' | 'already-recorded' | 'differs-from-recorded' | 'sheet-figure-differs' | 'note'
    | 'skipped-before-cutover' | 'purchase-side-only' | 'carried';
  /** The cell the check cites: "D4". Optional for a `note`. */
  cell?: string;
  /** With `check: 'note'`, the free-text warning the Result column shows ("Cell F7: grade read as 2, contract says 1",
      or the text alone without a cell). A warning: it never stops Import. */
  note?: string;
  [column: string]: unknown;
}
export interface ImportPreviewProps {
  file: {
    name: React.ReactNode; by?: React.ReactNode | React.ReactNode[]; byLabel?: React.ReactNode; rows?: number;
    /** The template and version the rows were read under: "Trade sheet, version 1". */
    template?: React.ReactNode;
    /** A newer version in force while this file is staged on an older one: "Version 2, from 08 Oct 2026". */
    inForce?: React.ReactNode;
    /** Required headings not in the file, each with its sheet and row: "Delivery window (Trades, row 1)". Import waits. */
    missing?: string[];
    /** Columns the file has and the template does not name, listed and never read: "Comments (H1)". */
    notRead?: string[];
  };
  /** The file is refused before it is read ("Import is not allowed. [Reason]."): no tiles or rows, Import disabled. */
  refusal?: { action?: string; reason: string };
  /** validating · ready · imported · failed. A ready file with row errors shows "1 row to fix" instead of Ready to import. */
  status?: 'validating' | 'ready' | 'imported' | 'failed';
  /** Summary tiles. `note` is an optional sub-line under the value ("Rows 14 In file", "New legs 12 Loaded at origin");
      a tile without one is drawn as before. */
  tiles?: Array<{ label: React.ReactNode; value: React.ReactNode; note?: React.ReactNode }>;
  /** The file's own columns, between Row and Result. */
  columns?: import('../data/DataTable').DataColumn<ImportRow>[];
  rows: ImportRow[];
  onDiscard?: () => void;
  onImport?: () => void;
  /** Import's working state while the rows commit. */
  importing?: boolean;
  /** The Result word for a clean row, per template: "New leg", or a function of the row ("Creates consignment",
      "Completes consignment"). Default "Ready". */
  readyWord?: React.ReactNode | ((row: ImportRow) => React.ReactNode);
  /** Where Discard and Import sit. 'beside' (default): beside the File card, at the top right, as before. 'inline':
      in the File card's title row, after the status. 'none': not drawn, for a page that puts the same two buttons in
      its own title row; it keeps Import's rule with `previewBlocked` and the status. */
  actions?: 'beside' | 'inline' | 'none';
  /** 'computed' (default): the status reads the computed phrase ("1 row to fix", "2 headings not found"), as before.
      'map': the status reads the map's word (UX-25: Validating, Ready to import, Imported, Failed) and the computed
      phrase, when it differs, sits beside it as a secondary line. */
  statusWord?: 'computed' | 'map';
  style?: React.CSSProperties;
}
export function ImportPreview(props: ImportPreviewProps): JSX.Element;
export const PREVIEW_CHECKS: Record<NonNullable<ImportRow['check']>, { kind: string; word: string }>;
/** The nine preview states of M3.DS.01 AC 1(f), with the cell or record each cites and whether Import is enabled. */
export const PREVIEW_STATES: Array<{ state: string; cite: string; importEnabled: boolean }>;
/** What tells one row from another: its row number, or "Sheet!row" when it carries a sheet. */
export function previewRowKey(row: Pick<ImportRow, 'row' | 'sheet'>): string;
export function previewBlocked(args: { refusal?: unknown; file?: { missing?: string[] }; rows?: ImportRow[] }): boolean;
export const UPLOAD_STATUS: Record<'validating' | 'ready' | 'imported' | 'failed', { kind: string; word: string }>;
