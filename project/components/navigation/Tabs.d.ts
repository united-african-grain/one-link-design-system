export interface TabsProps {
  tabs: Array<string | { value: string; label: React.ReactNode; count?: number | string }>;
  value: string;
  onChange?: (value: string) => void;
  /** 48 for module/sub-nav rows, 44 for the action panel tab bar. */
  height?: number;
  gap?: number;
  /** Underline colour: content-primary, or the commodity colour for variant="commodity". */
  underlineColor?: string;
  /** nav = body-3-strong · panel = body-2-strong · commodity = heading-2-condensed section tabs. */
  variant?: 'nav' | 'panel' | 'commodity';
  style?: React.CSSProperties;
}
export function Tabs(props: TabsProps): JSX.Element;
