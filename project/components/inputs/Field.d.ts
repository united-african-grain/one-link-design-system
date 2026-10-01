/** @startingPoint section="Inputs" subtitle="Field with label, hint and error under it; input, textarea, select and radio rows (map UX-21)" viewport="480x520" */
export interface FieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  /** The S57 validation pattern, under the field: "Effective from must be now or later." */
  error?: React.ReactNode;
  required?: boolean;
  /** Id of the control the label is for. */
  htmlFor?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Field(props: FieldProps): JSX.Element;

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'> {
  /** A textarea, 88px tall at least, resizable. */
  multiline?: boolean;
  /** A 1px error-strong ring. Pair it with Field's error. */
  invalid?: boolean;
  /** right for figures: tabular. */
  align?: 'left' | 'right';
  /** large (48px) on the signed-out screens, as the app's sign-in uses. */
  size?: 'medium' | 'large';
  style?: React.CSSProperties;
}
export function Input(props: InputProps): JSX.Element;

export interface SelectOption { value: string; label: React.ReactNode; disabled?: boolean }
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'style'> {
  options: Array<string | SelectOption>;
  invalid?: boolean;
  style?: React.CSSProperties;
}
export function Select(props: SelectProps): JSX.Element;

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  /** Visible but cannot be chosen yet (map UX-17). */
  disabled?: boolean;
  /** Why it cannot be chosen yet, drawn under a disabled option. */
  reason?: React.ReactNode;
}
export interface RadioListProps {
  options: Array<string | RadioOption>;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export function RadioList(props: RadioListProps): JSX.Element;

export interface CheckboxOption { value: string; label: React.ReactNode; hint?: React.ReactNode }
export interface CheckboxListProps {
  options: Array<string | CheckboxOption>;
  values?: string[];
  onChange?: (values: string[]) => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}
/** Checkbox rows: bundles with their price tiers as a hint, sites. */
export function CheckboxList(props: CheckboxListProps): JSX.Element;
