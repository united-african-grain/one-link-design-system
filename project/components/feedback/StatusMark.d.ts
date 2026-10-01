export interface StatusMarkProps {
  /**
   * clean · attention · breach · block · awaiting · within · over · up · down · flat · rebalance,
   * and the map's set (UX-14): pending (amber clock: pending, waiting, acknowledged) · neutral (grey
   * clock: Draft) · locked (red lock) · notSet (amber triangle, "Not set", UX-16).
   */
  kind?: 'clean' | 'attention' | 'breach' | 'block' | 'awaiting' | 'within' | 'over' | 'up' | 'down' | 'flat' | 'rebalance' | 'pending' | 'neutral' | 'locked' | 'notSet';
  /** Override the word (keep sentence case), e.g. "Awaiting resolution". */
  label?: React.ReactNode;
  size?: 'body-3' | 'body-4' | 'caption-1' | 'body-2';
  strong?: boolean;
  style?: React.CSSProperties;
}
export function StatusMark(props: StatusMarkProps): JSX.Element;
