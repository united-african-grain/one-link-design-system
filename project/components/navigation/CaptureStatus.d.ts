/** @startingPoint section="Navigation" subtitle="Capture status: Online or Offline, and Pending sync (count) (map UX-31)" viewport="390x80" */
export interface CaptureStatusProps {
  online?: boolean;
  /** Captures waiting to send. */
  pending?: number;
  style?: React.CSSProperties;
}
export function CaptureStatus(props?: CaptureStatusProps): JSX.Element;
