/** @startingPoint section="Navigation" subtitle="Signed-out frame: the form on the left, the brand panel on the right, one column below 1024px" viewport="1200x760" */
export interface AuthShellProps {
  /** The screen's heading, sentence case: "Sign in", "Forgot password". */
  heading?: string;
  /** One sentence under it. Nothing before sign-in: no business data, no preview. */
  sentence?: string;
  /** The form. */
  children?: React.ReactNode;
  /** The row of ways back, under the form (Forgot password, Back to home). */
  links?: React.ReactNode;
  /** The panel's claim, rendered in display-2-condensed, so uppercase. */
  claim?: string;
  /** The one sentence under the claim's rule. */
  claimSentence?: string;
  /** The line pinned to the top of the panel, rendered uppercase. */
  eyebrow?: string;
  /**
   * The brand panel. True by default, and it only ever appears from 1024px: below that it is
   * removed outright and the form owns the screen.
   */
  showPanel?: boolean;
  product?: string;
  showBeta?: boolean;
  style?: React.CSSProperties;
}
export function AuthShell(props: AuthShellProps): JSX.Element;

export interface AuthTick {
  /** maize | wheat | soya | soya-meal | fertilizer: the commodity colour token's suffix. */
  commodity: string;
  /** 0.22 to 0.56. */
  opacity: number;
}
/**
 * The strip's ticks from a fixed seed: identical on every render and in every screenshot.
 * Exported so a test can prove the pattern is stable and that no randomness runs at render time.
 */
export function authTickPattern(count?: number, seed?: number): AuthTick[];
