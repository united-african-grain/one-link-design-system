/** @startingPoint section="Records" subtitle="Checkpoint timeline: an import truck leg's five checkpoints, each with status, date, recorded by and Source; a transporter-reported position is a labelled Source, never a badge (M7.DS.01)" viewport="900x320" */
export type CheckpointKey = 'loaded' | 'in-transit' | 'border-arrival' | 'border-departure' | 'offloaded';
export type CheckpointSourceKey = 'port-schedule' | 'transporter-call' | 'transporter-message' | 'clearing-agent' | 'mill-offload-sheet' | 'mill-phone-call' | 'mill-email' | 'weighbridge';
/** The five checkpoints in order: Loaded at origin, In transit, Border arrival, Border departure, Offloaded. */
export const CHECKPOINTS: Array<{ key: CheckpointKey; word: string; weight?: true; position?: true }>;
/** Each source's word and what it can report: a weight, a position, or both. */
export const CHECKPOINT_SOURCES: Record<CheckpointSourceKey, { word: string; weight?: true; position?: true }>;
/** Done (green check) and Waiting (amber triangle). A checkpoint not reached has no status: a blank cell. */
export const CHECKPOINT_STATUS: Record<'done' | 'waiting', { kind: string; word: string }>;
/** The Source word for a checkpoint, or '' when that source cannot report it (a weighbridge position, a transporter's weight). */
export function checkpointSource(checkpoint: CheckpointKey, source: CheckpointSourceKey): string;
/** The Source options a capture form offers for a checkpoint: what can report it, nothing else. */
export function checkpointSourceOptions(checkpoint: CheckpointKey): string[];
export interface CheckpointEntry {
  key: CheckpointKey;
  status?: 'done' | 'waiting';
  /** "24 Sep 2026, 11:20"; the table's header carries CAT. */
  date?: string;
  /** Who recorded it: a person, or System. */
  by?: string;
  source?: CheckpointSourceKey;
}
export interface CheckpointTimelineProps {
  /** The checkpoints recorded so far; the five are always drawn, in order, a missing one blank. */
  checkpoints?: CheckpointEntry[];
  /** 'table' (default) on the record page; 'list' stacks each checkpoint for the UAG One Link app. */
  variant?: 'table' | 'list';
  style?: React.CSSProperties;
}
export function CheckpointTimeline(props: CheckpointTimelineProps): JSX.Element;
export function CheckpointStatusMark(props: { status?: 'done' | 'waiting' | ''; size?: 'body-3' | 'body-4' }): JSX.Element | '';
