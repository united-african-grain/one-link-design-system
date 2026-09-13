export interface SegmentedProps {
  options: Array<string | { value: string; label: React.ReactNode; icon?: string; iconColor?: string; count?: number | string }>;
  value: string;
  onChange?: (value: string) => void;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}
export function Segmented(props: SegmentedProps): JSX.Element;
