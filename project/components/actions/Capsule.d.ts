export interface CapsuleProps {
  selected?: boolean;
  /** Optional count in content-tertiary (`Contracted 18`). */
  count?: number | string;
  /** Trailing chevron-down for filter menus (`Season 2026 ▾`). */
  chevron?: boolean;
  icon?: string;
  /** 36px tall on mobile (32px default). */
  mobile?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Capsule(props: CapsuleProps): JSX.Element;
export interface CapsuleGroupProps {
  options: Array<string | { value: string; label: React.ReactNode; count?: number | string; chevron?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  mobile?: boolean;
  style?: React.CSSProperties;
}
export function CapsuleGroup(props: CapsuleGroupProps): JSX.Element;
