/** @startingPoint section="Feedback" subtitle="Conflict on save: \"This record was changed by [user] at [time]. Reload to see the latest version.\" (S57)" viewport="700x200" */
export interface ConflictOnSaveProps {
  /** Who saved first, as the trail names them: "L. Mulenga". */
  user: string;
  /** When, 24-hour CAT: "26 Sep 2026, 09:10 CAT". */
  time: string;
  /** The person's own values, kept beside the current record so nothing typed is lost. */
  yours?: Array<{ label: string; value: string }>;
  onReload?: () => void;
  style?: React.CSSProperties;
}
export function ConflictOnSave(props: ConflictOnSaveProps): JSX.Element;
