/** @startingPoint section="Records" subtitle="Import preview: File card, tiles, rows with Result; Import disabled on any row error (map UX-25)" viewport="1000x560" */
export interface ImportRow {
  /** The file's own row number; errors cite it. */
  row: number;
  /** A row error, e.g. "Unknown contract ZAM 4999". The Result column shows it and Import stays disabled. */
  error?: string;
  /** A row check (M3.DS.01): the Result column reads "Cell D4: amendment, confirm before import". An unconfirmed
      amendment stops Import; the warnings never do. */
  check?: 'amendment' | 'amendment-confirmed' | 'already-recorded' | 'differs-from-recorded' | 'sheet-figure-differs';
  /** The cell the check cites: "D4". */
  cell?: string;
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
  status?: 'validating' | 'ready' | 'imported' | 'failed' | 'discarded' | 'reversed';
  tiles?: Array<{ label: React.ReactNode; value: React.ReactNode }>;
  /** The file's own columns, between Row and Result. */
  columns?: import('../data/DataTable').DataColumn<ImportRow>[];
  rows: ImportRow[];
  onDiscard?: () => void;
  onImport?: () => void;
  /** Import's working state while the rows commit. */
  importing?: boolean;
  style?: React.CSSProperties;
}
export function ImportPreview(props: ImportPreviewProps): JSX.Element;
export const PREVIEW_CHECKS: Record<NonNullable<ImportRow['check']>, { kind: string; word: string }>;
/** The nine preview states of M3.DS.01 AC 1(f), with the cell or record each cites and whether Import is enabled. */
export const PREVIEW_STATES: Array<{ state: string; cite: string; importEnabled: boolean }>;
export function previewBlocked(args: { refusal?: unknown; file?: { missing?: string[] }; rows?: ImportRow[] }): boolean;
export const UPLOAD_STATUS: Record<'validating' | 'ready' | 'imported' | 'failed', { kind: string; word: string }>;
