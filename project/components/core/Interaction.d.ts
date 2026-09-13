/** Hover (mouse/pen), press (pointer, touch, Space/Enter) and keyboard-only focus state. Spread `handlers` onto the element. */
export function useInteraction(options?: { inert?: boolean }): {
  hover: boolean;
  down: boolean;
  /** true only for :focus-visible focus (keyboard), never for pointer focus. */
  focusVisible: boolean;
  handlers: Pick<React.DOMAttributes<HTMLElement>, 'onPointerEnter' | 'onPointerLeave' | 'onPointerDown' | 'onPointerUp' | 'onPointerCancel' | 'onKeyDown' | 'onKeyUp' | 'onFocus' | 'onBlur'>;
};
/** Live prefers-reduced-motion: drop translates, scales and glides; keep colour/opacity fades. */
export function usePrefersReducedMotion(): boolean;
export function useMediaQuery(query: string): boolean;
/** true while the viewport is at least px wide (1024 padding, 1152/1280 rail). */
export function useMinWidth(px: number): boolean;
/** Element clientWidth via ResizeObserver (0 before mount). */
export function useElementWidth(ref: React.RefObject<HTMLElement>): number;
