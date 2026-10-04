/** @startingPoint section="Records" subtitle="Readiness chip: a weighbridge ticket's status (Ready, Weighed in only, Stalled, Problem…), apart from its source" viewport="700x120" */
export type ReadinessKind = 'ready' | 'weighed-in-only' | 'stalled' | 'problem' | 'pending-reading' | 'awaiting-confirmation' | 'received' | 'closed';
export const READINESS_KINDS: ReadinessKind[];
export interface ReadinessChipProps {
  kind?: ReadinessKind;
  /** StatusMark size: body-4 in tables and beside a record's name, body-3 elsewhere. */
  size?: 'body-3' | 'body-4' | 'caption-1';
  style?: React.CSSProperties;
}
export function ReadinessChip(props: ReadinessChipProps): JSX.Element;
