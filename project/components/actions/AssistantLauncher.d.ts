export interface AssistantLauncherProps {
  /** One word for what pressing it gets you. */
  label?: string;
  /** Lucide icon. `sparkles` is the system's mark for anything a model answers. */
  icon?: string;
  /** True while its panel is open, for aria-expanded. */
  expanded?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function AssistantLauncher(props: AssistantLauncherProps): JSX.Element;
