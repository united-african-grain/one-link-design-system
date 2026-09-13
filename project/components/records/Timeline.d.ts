export interface TimelineEntry {
  text: React.ReactNode;
  actor?: string;
  time?: string;
  /** Correction / reversal entry. */
  compensating?: boolean;
  color?: string;
}
export interface TimelineProps { entries: TimelineEntry[]; style?: React.CSSProperties; }
export function Timeline(props: TimelineProps): JSX.Element;
