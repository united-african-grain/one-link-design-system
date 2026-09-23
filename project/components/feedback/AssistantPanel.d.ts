export interface AssistantPanelProps {
  /** Renders nothing when false. The open animation runs on the frame after it becomes true. */
  open?: boolean;
  /** The assistant's name, and the panel's accessible name. */
  title?: string;
  /** One line under the name saying where its answers come from. */
  subtitle?: string;
  /** The promise at the foot. It has a default because it is a promise, not a caption. */
  footer?: string;
  /** Placeholder and accessible name for the composer field. */
  placeholder?: string;
  /** The composer's current text. Controlled: pair it with onValueChange. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Submitting the composer, by the send button or by Enter. */
  onSend?: (value: string) => void;
  /** Shown when set: the close button in the header. */
  onClose?: () => void;
  /** Shown when set: the start-again button in the header. */
  onRestart?: () => void;
  /** An answer is on its way: the send button spins and refuses a second press. */
  sending?: boolean;
  /** Full-height sheet with only the top corners rounded, for a phone. */
  sheet?: boolean;
  /** Position absolutely in the nearest positioned parent instead of in flow (for artboards). */
  contained?: boolean;
  width?: number;
  maxHeight?: number;
  /** The conversation: questions, answers, suggestions and the working state. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function AssistantPanel(props: AssistantPanelProps): JSX.Element | null;

export interface AssistantSuggestionProps {
  /** A real help page title. Never a question somebody made up. */
  children?: React.ReactNode;
  icon?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function AssistantSuggestion(props: AssistantSuggestionProps): JSX.Element;

export interface AssistantQuestionProps {
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function AssistantQuestion(props: AssistantQuestionProps): JSX.Element;

export interface AssistantAnswerProps {
  children?: React.ReactNode;
  /** Citation chips naming the help pages this answer was taken from. */
  sources?: React.ReactNode;
  style?: React.CSSProperties;
}
export function AssistantAnswer(props: AssistantAnswerProps): JSX.Element;

export interface AssistantWorkingProps {
  /** What it is doing, in plain words. Not that it is thinking. */
  label?: string;
  style?: React.CSSProperties;
}
export function AssistantWorking(props: AssistantWorkingProps): JSX.Element;
