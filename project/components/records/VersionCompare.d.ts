/** @startingPoint section="Records" subtitle="Version comparison: two template versions side by side, columns marked Added, Removed, Remapped or Changed" viewport="900x380" */
import type { MappingColumn } from './ColumnMapping';
export type CompareChange = 'added' | 'removed' | 'remapped' | 'changed';
export const COMPARE_MARKS: Record<CompareChange, { kind: string; word: string }>;
export function compareVersions(before: MappingColumn[], after: MappingColumn[]): Array<{ source: string; before: MappingColumn | null; after: MappingColumn | null; change: CompareChange | null }>;
export interface VersionCompareProps {
  before: { label: string; columns: MappingColumn[] };
  after: { label: string; columns: MappingColumn[] };
  minWidth?: number;
  style?: React.CSSProperties;
}
export function VersionCompare(props: VersionCompareProps): JSX.Element;
