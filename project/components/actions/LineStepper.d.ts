export interface LineStepperProps {
  /** Formatted values in order, e.g. ['$360','$380','$400','$420']. */
  values: string[];
  value: string;
  onChange?: (value: string) => void;
  /** Brand by default; pass the commodity colour inside a commodity context. */
  activeColor?: string;
  style?: React.CSSProperties;
}
export function LineStepper(props: LineStepperProps): JSX.Element;
