/** @startingPoint section="Records" subtitle="Evidence viewer: the slip photo at reading size, zoom in and out, and its fingerprint" viewport="560x480" */
export interface EvidenceViewerProps {
  src?: string;
  alt?: string;
  /** The short form of the photo's hash, e.g. "7C4E 19A2 D0B3 B21A". Shown under the label Fingerprint. */
  fingerprint?: string;
  /** Controlled zoom (1 = fit). Leave unset to let the viewer keep its own. */
  zoom?: number;
  defaultZoom?: number;
  onZoom?: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  /** Frame height in px (360). */
  height?: number;
  style?: React.CSSProperties;
}
export function EvidenceViewer(props: EvidenceViewerProps): JSX.Element;
