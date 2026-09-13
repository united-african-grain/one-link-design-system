export interface StatusMarkProps {
  /** clean · attention · breach · block · awaiting · within · over · up · down · flat · rebalance */
  kind?: 'clean' | 'attention' | 'breach' | 'block' | 'awaiting' | 'within' | 'over' | 'up' | 'down' | 'flat' | 'rebalance';
  /** Override the word (keep sentence case), e.g. "Awaiting resolution". */
  label?: React.ReactNode;
  size?: 'body-3' | 'body-4' | 'caption-1' | 'body-2';
  strong?: boolean;
  style?: React.CSSProperties;
}
export function StatusMark(props: StatusMarkProps): JSX.Element;
