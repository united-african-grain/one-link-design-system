/** @startingPoint section="Records" subtitle="Capture tile: a capture on the phone with its sync state; busy until synced, a damaged file asks for it again (M4.DS.03)" viewport="390x80" */
export type CaptureSync = 'queued' | 'sending' | 'synced' | 'damaged';
export const CAPTURE_SYNC: Record<CaptureSync, { word: string; busy?: boolean; kind?: string }>;
/** True for queued and sending (and any unknown state): the capture waits for the server. */
export function captureBusy(sync: CaptureSync | string): boolean;
/** Captures the server has not confirmed: the count in "Pending sync (count)". Never 0 while any is queued. */
export function pendingSyncCount(captures: Array<{ sync: CaptureSync | string }>): number;
export interface CaptureTileProps {
  /** What was captured: photo (camera), signature (pencil) or document. */
  kind?: 'photo' | 'signature' | 'document';
  /** "Photograph, DN10000441". */
  title: React.ReactNode;
  /** "Taken 26 Sep 2026, 14:41 CAT". */
  meta?: React.ReactNode;
  /** The sync state machine's value. Drawn as sent only when synced. */
  sync?: CaptureSync;
  /** Capture again is in progress (damaged only). */
  recapturing?: boolean;
  onRecapture?: () => void;
  style?: React.CSSProperties;
}
export function CaptureTile(props: CaptureTileProps): JSX.Element;
