/** @startingPoint section="Records" subtitle="Import preview: File card, tiles, rows with Result; Import disabled on any row error (map UX-25)" viewport="1000x560" */
export interface ImportRow {
  /** The file's own row number; errors cite it. */
  row: number;
  /** A row error, e.g. "Unknown contract ZAM 4999". The Result column shows it and Import stays disabled. */
  error?: string;
  [column: string]: unknown;
}
export interface ImportPreviewProps {
  file: { name: React.ReactNode; by?: React.ReactNode | React.ReactNode[]; byLabel?: React.ReactNode; rows?: number };
  /** validating · ready · imported · failed */
  status?: 'validating' | 'ready' | 'imported' | 'failed';
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
export const UPLOAD_STATUS: Record<'validating' | 'ready' | 'imported' | 'failed', { kind: string; word: string }>;
