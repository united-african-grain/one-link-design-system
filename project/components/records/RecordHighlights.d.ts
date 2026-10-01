/** @startingPoint section="Records" subtitle="Record highlights: kind, name, status, actions and key fields, then Details, Related and History (map UX-19)" viewport="900x260" */
export interface RecordHighlightsProps {
  /** What the record is: "Setting", "Switch", "Approval step", "Policy". */
  kind?: string;
  title: React.ReactNode;
  /** A StatusMark (icon plus word). */
  status?: React.ReactNode;
  /** Buttons, at most one primary. */
  actions?: React.ReactNode;
  /** Key fields as label and value; a value that does not exist is blank, never "None". */
  fields?: Array<{ label: React.ReactNode; value?: React.ReactNode }>;
  /** Default Details, Related, History. Pass [] to hide the tabs. */
  tabs?: Array<string | { value: string; label: React.ReactNode; count?: number | string }>;
  tab?: string;
  onTab?: (value: string) => void;
  style?: React.CSSProperties;
}
export function RecordHighlights(props: RecordHighlightsProps): JSX.Element;
