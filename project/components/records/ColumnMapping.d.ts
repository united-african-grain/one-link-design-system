/** @startingPoint section="Records" subtitle="Column mapping: each column of a template mapped to a field, its type, required flag and price tier, tested against a header row" viewport="1000x420" */
export type TierTagName = 'Gate' | 'Contract' | 'Sell' | 'Farmer account';
export interface MappingColumn {
  /** The heading as it is written in the file: "Buy price K/t". */
  source: string;
  /** The One Link field it is read into: "Purchase price". */
  field: string;
  /** One of MAPPING_TYPES. */
  type: string;
  required?: boolean;
  /** The price tier the column carries, blank for none. */
  tier?: TierTagName | '';
  /** 'mapping': the tier comes from Figures and price tiers, read-only with no control that removes it. */
  tierFrom?: 'mapping';
  /** Tested against a header row: false when the heading is not in it. */
  found?: boolean;
  /** Where the heading was found: "F1". */
  cell?: string;
}
export const MAPPING_TYPES: string[];
export const TIER_TAGS: TierTagName[];
export interface MappingChange { source: string; kind: 'removed' | 'field' | 'type' | 'required' | 'added'; destructive: boolean; words: string }
/** Each change a new version makes, in words; removing, moving to another field, a type change and newly required are destructive. */
export function mappingChanges(before: MappingColumn[], after: MappingColumn[]): MappingChange[];
export function TierTag(props: { tier?: string; from?: 'mapping'; editable?: boolean; onChange?: (tier: string) => void }): JSX.Element;
export interface ColumnMappingProps {
  columns: MappingColumn[];
  /** The One Link fields a column can be read into, while editing. */
  fields?: string[];
  editable?: boolean;
  onChange?: (source: string, patch: Partial<MappingColumn>) => void;
  /** Show the Header row column (the test against a header row). */
  header?: boolean;
  /** Below this width the table scrolls in its own container. */
  minWidth?: number;
  style?: React.CSSProperties;
}
export function ColumnMapping(props: ColumnMappingProps): JSX.Element;
