export interface AssistantLauncherProps {
  /** One word for what pressing it gets you. */
  label?: string;
  /** Lucide icon. `message-square` is the chat mark: a place to ask, not a machine. */
  icon?: string;
  /** True while its panel is open, for aria-expanded. */
  expanded?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function AssistantLauncher(props: AssistantLauncherProps): JSX.Element;
