// Framework-agnostic types for the Marko Questionnaire controller. Trimmed
// port of the shadcn `@shadcn/react/questionnaire` package's `types.ts` to
// the subset the controller needs — React-specific prop/context types are
// dropped (Marko has no context primitive; see controller.ts's header
// comment for how state threading is redone).

export type QuestionnaireItemStatus = "unanswered" | "answered" | "skipped";

export type QuestionnaireShortcutMode = "letters" | "numbers";

export type QuestionnaireAnswerType = "choice" | "input";

export type QuestionnaireAnswerRegistration = {
  id: string;
  type: QuestionnaireAnswerType;
  /** Choice answers only: the option's `value`. */
  value?: string;
  disabled: boolean;
  element: HTMLInputElement | null;
};

export type QuestionnaireItemRegistration = {
  name: string;
  order: number;
  required: boolean;
  disabled: boolean;
  status: QuestionnaireItemStatus;
};

export const EMPTY_STRING_ARRAY: string[] = [];
