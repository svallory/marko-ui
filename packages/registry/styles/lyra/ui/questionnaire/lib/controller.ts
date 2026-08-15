// Framework-agnostic port of the shadcn `@shadcn/react/questionnaire`
// package's `use-questionnaire-root.ts` + `use-questionnaire-item.ts` +
// `use-questionnaire-choice.ts` + `use-questionnaire-input.ts` +
// `context.ts`, collapsed into one factory function (same architecture as
// `../../message-scroller/lib/controller.ts` — read that file's header
// comment for the general rationale: Marko has no context primitive
// ("React context -> pass values down as attrs from a container tag" per
// this project's stated gotchas), so instead of five components sharing
// React context, ONE controller instance is created by
// `<Questionnaire>` (questionnaire.marko) and threaded explicitly as the
// `controller=` input to every descendant part.
//
// SIMPLIFICATION FROM SOURCE (documented, not silently dropped): the source
// is ~2000 lines across 4 hooks + a DOM-order collection system, covering:
// live item/answer *registration* driven by mount/unmount effects and
// `MutationObserver`-based DOM reordering, per-item dev-only console
// warnings for mismatched `items=`/rendered-parts data, arrow-key answer
// focus traversal within an item, Meta/Ctrl+Enter "confirm current"
// shortcut, native `reportValidity()` integration, and a fully controlled
// (`item=`, per-choice `checked=`) mode. This port keeps the parts of that
// behavior that are externally observable through DOM/class parity and the
// component's everyday usage (see apps/v4/examples/base/questionnaire-*.tsx):
//   - item stepping (next/previous/skip/submit) with required-item
//     validation gating goNext/confirm, matching `goNext`/`confirmCurrent`
//     in use-questionnaire-root.ts
//   - single vs. multiple choice selection per item, matching
//     `updateAnswerSelected` in use-questionnaire-item.ts
//   - status computation (unanswered/answered/skipped) and derived
//     valid/invalid, matching the `status`/`valid`/`invalid` derivation in
//     use-questionnaire-item.ts
//   - keyboard shortcuts (letters/numbers) assigned to choices in
//     declaration order, matching `getShortcutByChoiceValue` in
//     collection.ts, plus the global keydown router (Left/Right arrows,
//     Enter, and shortcut keys), matching `handleKeyDown` in
//     use-questionnaire-root.ts (Up/Down answer-focus traversal and
//     Meta/Ctrl+Enter are OUT of scope — see questionnaire.marko's header
//     comment)
//   - reset-on-form-reset, matching `handleReset`
// NOT ported: dev-mode collection warnings (`collection.ts`'s
// `get*Warnings` — pure console.warn diagnostics, invisible in rendered
// DOM), the fully-controlled `item=`/per-choice `checked=` props (this
// port is uncontrolled-only, matching every example in apps/v4/examples),
// and MutationObserver-driven re-registration on DOM mutation (Marko's
// `<for>` already keeps registration order in sync with `items=`, so the
// mutation-observer's *purpose* — reacting to imperative DOM changes
// outside Marko's own re-render — does not apply to a template-driven
// render).
//
// Every piece of behavior that IS ported is a faithful translation of the
// source's logic; only the plumbing that carried it across React's
// render/context model changed.
import type {
  QuestionnaireAnswerRegistration,
  QuestionnaireItemRegistration,
  QuestionnaireItemStatus,
  QuestionnaireShortcutMode,
} from "./types.ts";

export type QuestionnaireControllerOptions = {
  defaultItem?: string;
  itemNames: readonly string[];
  shortcuts?: QuestionnaireShortcutMode | null;
};

// Minimal pub/sub, standing in for the source's React state/context
// updates (same shape as message-scroller's controller.ts).
function createStore<T>(initialSnapshot: T) {
  let snapshot = initialSnapshot;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => snapshot,
    setSnapshot: (next: T) => {
      snapshot = next;
      listeners.forEach((listener) => listener());
    },
    update: (updater: (current: T) => T) => {
      snapshot = updater(snapshot);
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function getShortcutKeys(shortcuts: QuestionnaireShortcutMode | null) {
  if (shortcuts === "letters") {
    return Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
  }
  if (shortcuts === "numbers") {
    return Array.from({ length: 9 }, (_, index) => String(index + 1));
  }
  return [];
}

function getShortcutFromKey(key: string, shortcuts: QuestionnaireShortcutMode) {
  const normalizedKey = shortcuts === "letters" ? key.toUpperCase() : key;
  return getShortcutKeys(shortcuts).includes(normalizedKey) ? normalizedKey : null;
}

export type QuestionnaireItemSnapshot = {
  selectedAnswerIds: string[];
  skipped: boolean;
  validationAttempted: boolean;
};

const EMPTY_ITEM_SNAPSHOT: QuestionnaireItemSnapshot = {
  selectedAnswerIds: [],
  skipped: false,
  validationAttempted: false,
};

export function createQuestionnaireController(options: QuestionnaireControllerOptions) {
  const itemNames = [...options.itemNames];
  const shortcuts = options.shortcuts ?? null;
  const initialItem =
    (options.defaultItem && itemNames.includes(options.defaultItem) ? options.defaultItem : itemNames[0]) ?? null;

  // --- item registry (populated by <QuestionnaireItem>, in DOM/declaration order) ---
  const itemMeta = new Map<string, { required: boolean; disabled: boolean }>();
  // --- per-item answer state (populated by <QuestionnaireChoice>/<QuestionnaireInput>) ---
  const answersByItem = new Map<string, QuestionnaireAnswerRegistration[]>();
  const itemSnapshots = new Map<string, QuestionnaireItemSnapshot>();

  const activeItemStore = createStore<string | null>(initialItem);
  // Bumped on every mutation so Marko's reactive <let> subscribers re-derive.
  const versionStore = createStore(0);

  function bump() {
    versionStore.update((v) => v + 1);
  }

  function enabledItemNames() {
    return itemNames.filter((name) => !(itemMeta.get(name)?.disabled ?? false));
  }

  function registerItem(name: string, required: boolean, disabled: boolean) {
    itemMeta.set(name, { required, disabled });
    if (!answersByItem.has(name)) answersByItem.set(name, []);
    if (!itemSnapshots.has(name)) itemSnapshots.set(name, { ...EMPTY_ITEM_SNAPSHOT, selectedAnswerIds: [] });
    bump();
  }

  function registerAnswer(itemName: string, registration: QuestionnaireAnswerRegistration) {
    const answers = answersByItem.get(itemName) ?? [];
    answersByItem.set(
      itemName,
      [...answers.filter((a) => a.id !== registration.id), registration],
    );
    bump();
  }

  function getItemSnapshot(itemName: string): QuestionnaireItemSnapshot {
    return itemSnapshots.get(itemName) ?? EMPTY_ITEM_SNAPSHOT;
  }

  function setItemSnapshot(itemName: string, snapshot: QuestionnaireItemSnapshot) {
    itemSnapshots.set(itemName, snapshot);
    bump();
  }

  function getAnswers(itemName: string) {
    return (answersByItem.get(itemName) ?? []).filter((a) => !a.disabled);
  }

  function getStatus(itemName: string): QuestionnaireItemStatus {
    const snapshot = getItemSnapshot(itemName);
    if (snapshot.skipped) return "skipped";
    const answers = getAnswers(itemName);
    const answered = answers.some((a) => snapshot.selectedAnswerIds.includes(a.id));
    return answered ? "answered" : "unanswered";
  }

  function isRequired(itemName: string) {
    return itemMeta.get(itemName)?.required ?? false;
  }

  function isValid(itemName: string) {
    const status = getStatus(itemName);
    const required = isRequired(itemName);
    const intentionallySkipped = status === "skipped" && !required;
    return intentionallySkipped || status === "answered";
  }

  function isInvalid(itemName: string) {
    const snapshot = getItemSnapshot(itemName);
    const status = getStatus(itemName);
    const intentionallySkipped = status === "skipped" && !isRequired(itemName);
    return !intentionallySkipped && snapshot.validationAttempted && !isValid(itemName);
  }

  // --- selection ---
  function setAnswerSelected(itemName: string, answerId: string, selected: boolean, multiple: boolean) {
    const snapshot = getItemSnapshot(itemName);
    let selectedAnswerIds: string[];
    if (!selected) {
      selectedAnswerIds = snapshot.selectedAnswerIds.filter((id) => id !== answerId);
    } else if (!multiple) {
      selectedAnswerIds = [answerId];
    } else {
      selectedAnswerIds = snapshot.selectedAnswerIds.includes(answerId)
        ? snapshot.selectedAnswerIds
        : [...snapshot.selectedAnswerIds, answerId];
    }
    setItemSnapshot(itemName, { ...snapshot, skipped: false, selectedAnswerIds });
  }

  // --- shortcuts ---
  function getShortcutForChoice(itemName: string, choiceIndex: number, disabled: boolean) {
    if (!shortcuts || disabled) return null;
    const answers = getAnswers(itemName).filter((a) => a.type === "choice");
    const enabledIndex = answers.findIndex((_, i) => i === choiceIndex);
    if (enabledIndex < 0) return null;
    const keys = getShortcutKeys(shortcuts);
    return keys[enabledIndex] ?? null;
  }

  function getAnswerByShortcut(itemName: string, shortcut: string) {
    const answers = getAnswers(itemName).filter((a) => a.type === "choice");
    const keys = getShortcutKeys(shortcuts);
    const index = keys.indexOf(shortcut);
    if (index < 0) return null;
    return answers[index] ?? null;
  }

  // --- navigation state ---
  function currentIndex() {
    const active = activeItemStore.getSnapshot();
    const list = enabledItemNames();
    return active ? list.indexOf(active) : -1;
  }

  function total() {
    return enabledItemNames().length;
  }

  function current() {
    const index = currentIndex();
    return index < 0 ? 0 : index + 1;
  }

  function isFirst() {
    return total() > 0 && currentIndex() === 0;
  }

  function isLast() {
    return total() > 0 && currentIndex() === total() - 1;
  }

  function setItem(name: string) {
    if (name === activeItemStore.getSnapshot()) return;
    activeItemStore.setSnapshot(name);
  }

  function goPrevious() {
    const index = currentIndex();
    const list = enabledItemNames();
    if (index <= 0) return;
    setItem(list[index - 1]);
  }

  function goNext() {
    const index = currentIndex();
    const list = enabledItemNames();
    const active = activeItemStore.getSnapshot();
    if (!active || index >= list.length - 1) return false;
    if (!validateItem(active)) return false;
    setItem(list[index + 1]);
    return true;
  }

  function validateItem(itemName: string) {
    const snapshot = getItemSnapshot(itemName);
    setItemSnapshot(itemName, { ...snapshot, validationAttempted: true });
    return isValid(itemName);
  }

  /** Returns the name of the first invalid item, in declaration order, or null. */
  function findFirstInvalidItem() {
    for (const name of enabledItemNames()) {
      if (!validateItem(name)) return name;
    }
    return null;
  }

  function confirmCurrent(requestSubmit: () => void) {
    const active = activeItemStore.getSnapshot();
    if (!active) return;
    if (!validateItem(active)) return;
    if (isLast()) {
      requestSubmit();
      return;
    }
    goNext();
  }

  function skipCurrent(requestSubmit: () => void) {
    const active = activeItemStore.getSnapshot();
    if (!active || isRequired(active)) return;
    const snapshot = getItemSnapshot(active);
    setItemSnapshot(active, { ...snapshot, selectedAnswerIds: [], skipped: true });
    if (!isLast()) {
      goNext();
      return;
    }
    requestSubmit();
  }

  function reset() {
    for (const name of itemNames) {
      itemSnapshots.set(name, { ...EMPTY_ITEM_SNAPSHOT, selectedAnswerIds: [] });
    }
    activeItemStore.setSnapshot(initialItem);
    bump();
  }

  function handleKeyDown(event: KeyboardEvent, requestSubmit: () => void) {
    if (event.defaultPrevented || (event as unknown as { isComposing?: boolean }).isComposing) return;
    const active = activeItemStore.getSnapshot();
    if (!active) return;
    const target = event.target as HTMLElement | null;
    const isTextEntry =
      target instanceof HTMLTextAreaElement ||
      (target instanceof HTMLInputElement && !["radio", "checkbox"].includes(target.type));

    if (event.metaKey || event.ctrlKey || event.altKey) return;

    if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && !isTextEntry) {
      event.preventDefault();
      if (event.repeat) return;
      if (event.key === "ArrowLeft") {
        goPrevious();
      } else if (getStatus(active) !== "unanswered") {
        goNext();
      }
      return;
    }

    if (!shortcuts || isTextEntry) return;

    const shortcut = getShortcutFromKey(event.key, shortcuts);
    if (!shortcut) return;
    const answer = getAnswerByShortcut(active, shortcut);
    if (!answer?.element) return;
    event.preventDefault();
    if (event.repeat) return;
    answer.element.focus();
    answer.element.click();
  }

  return {
    activeItemStore,
    versionStore,
    shortcuts,
    registerItem,
    registerAnswer,
    getItemSnapshot,
    getStatus,
    isRequired,
    isValid,
    isInvalid,
    setAnswerSelected,
    getShortcutForChoice,
    total,
    current,
    isFirst,
    isLast,
    setItem,
    goPrevious,
    goNext,
    confirmCurrent,
    skipCurrent,
    reset,
    handleKeyDown,
    findFirstInvalidItem,
    validateItem,
    enabledItemNames,
  };
}

export type QuestionnaireController = ReturnType<typeof createQuestionnaireController>;

/** Getter contract passed from `<questionnaire>` to every part — a template
 * closure, so tag input stays serializable (the controller itself is a plain
 * object full of functions and must never cross a tag boundary). */
export type QuestionnaireControllerGetter = () => QuestionnaireController;

/** Per-root holder the getter closes over; serializes as `{ current: null }`
 * because the browser-side controller is only created on first client call. */
export function createQuestionnaireControllerHolder(): {
  current: QuestionnaireController | null;
} {
  return { current: null };
}

/** Body of the root's getter closure. During SSR it returns a fresh
 * throwaway instance per call (never stored, so never serialized) whose
 * initial snapshots render the correct server markup; in the browser it
 * lazily creates and caches the one real instance on the holder. */
export function resolveQuestionnaireController(
  holder: { current: QuestionnaireController | null },
  options: () => QuestionnaireControllerOptions,
): QuestionnaireController {
  if (typeof window === "undefined") {
    return createQuestionnaireController(options());
  }
  return (holder.current ??= createQuestionnaireController(options()));
}
