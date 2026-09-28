/** @startingPoint section="Navigation" subtitle="Signed-out frame: one centred column, at most 400px wide, nothing else on the screen" viewport="1200x760" */
export interface AuthShellProps {
  /** The screen's heading, sentence case: "Sign in", "Forgot password". */
  heading?: string;
  /** One sentence under it. Nothing before sign-in: no business data, no preview. */
  sentence?: string;
  /** The form. */
  children?: React.ReactNode;
  /** The row of ways back, under the form (Forgot password, Back to home). */
  links?: React.ReactNode;
  product?: string;
  showBeta?: boolean;
  style?: React.CSSProperties;
}
export function AuthShell(props: AuthShellProps): JSX.Element;
