/** @startingPoint section="Inputs" subtitle="PIN pad: the phone's PIN with the fingerprint switch, locked after the fifth wrong PIN (M4.DS.03)" viewport="390x420" */
export const PIN_MAX_TRIES: 5;
/** True once `wrong` has reached `maxTries` (5). */
export function pinLocked(wrong?: number, maxTries?: number): boolean;
export interface PinPadProps {
  /** Digits in the PIN: 4. */
  length?: number;
  /** How many digits are entered. The pad never holds the PIN itself. */
  entered?: number;
  /** Wrong PINs so far. At `maxTries` every key is disabled. */
  wrong?: number;
  maxTries?: number;
  /** "That PIN is not right. 3 tries left." */
  error?: React.ReactNode;
  /** Checking or saving: keys disabled, spinner beside the dots. */
  busy?: boolean;
  /** Draws the fingerprint key bottom left, to switch back to the fingerprint. */
  fingerprint?: boolean;
  onDigit?: (digit: string) => void;
  onDelete?: () => void;
  onFingerprint?: () => void;
  style?: React.CSSProperties;
}
export function PinPad(props: PinPadProps): JSX.Element;
