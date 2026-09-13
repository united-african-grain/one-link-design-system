export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: string;
  style?: React.CSSProperties;
}
export function Skeleton(props: SkeletonProps): JSX.Element;
export function CardSkeleton(props: { style?: React.CSSProperties }): JSX.Element;
