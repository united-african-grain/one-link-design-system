export interface AvatarProps {
  initials: string;
  /** 28 in card rows, 32 in the header. */
  size?: number;
  /** Turns the avatar into a commodity tile: colour at 16% on white, initials in the colour. */
  commodityColor?: string;
  /** Closed/complete records: 40% opacity. */
  dimmed?: boolean;
  style?: React.CSSProperties;
}
export function Avatar(props: AvatarProps): JSX.Element;
