/**
 * Module-level Zag toast store.
 *
 * `@zag-js/toast` v1 is a group store + per-toast child services, not a single
 * machine. The store is plain module state: it is created once when this module
 * is first imported, it never becomes Marko reactive state, and it never crosses
 * a tag-input boundary — so there is nothing here for Marko to serialize.
 *
 * The store is the trigger surface (`toast.success(...)`), the `<Toaster>`
 * component is the render surface, and they are connected by Zag's own
 * subscription rather than by Marko props.
 */
import * as toastMachine from "@zag-js/toast";

export type ToastType = toastMachine.Type;
export type ToastPlacement = toastMachine.Placement;
export type ToastOptions = toastMachine.Options<string>;

/**
 * Options accepted by every `toast.*` helper: the full Zag option set, or a
 * bare string used as the title.
 */
export type ToastArgument = ToastOptions | string;

function toOptions(argument: ToastArgument): ToastOptions {
  return typeof argument === "string" ? { title: argument } : argument;
}

/**
 * The live Zag toast store. Created at module scope so every importer — trigger
 * buttons anywhere in the app and the `<Toaster>` region — shares one instance.
 */
export const toaster = toastMachine.createStore({
  placement: "bottom-end",
  overlap: false,
  gap: 16,
  offsets: "1rem",
  max: 24,
  removeDelay: 200,
  pauseOnPageIdle: true,
});

/**
 * Public toast API. Each helper returns the created toast id where Zag provides
 * one, so callers can `update` or `dismiss` a specific toast later.
 */
export const toast = {
  /** Create a toast with an explicit (or default) type. */
  create: (argument: ToastArgument) => toaster.create(toOptions(argument)),
  /** Create a plain, untyped toast. */
  message: (argument: ToastArgument) => toaster.create(toOptions(argument)),
  /** Create a success toast. */
  success: (argument: ToastArgument) => toaster.create({ ...toOptions(argument), type: "success" }),
  /** Create an error toast. */
  error: (argument: ToastArgument) => toaster.create({ ...toOptions(argument), type: "error" }),
  /** Create an informational toast. */
  info: (argument: ToastArgument) => toaster.create({ ...toOptions(argument), type: "info" }),
  /** Create a warning toast. */
  warning: (argument: ToastArgument) => toaster.create({ ...toOptions(argument), type: "warning" }),
  /** Create a loading toast. Loading toasts never auto-dismiss. */
  loading: (argument: ToastArgument) => toaster.create({ ...toOptions(argument), type: "loading" }),
  /** Update an existing toast in place. */
  update: (id: string, options: Partial<ToastOptions>) => toaster.update(id, options),
  /** Dismiss one toast, or every toast when no id is given. */
  dismiss: (id?: string) => toaster.dismiss(id),
  /** Remove one toast immediately, skipping the exit transition. */
  remove: (id?: string) => toaster.remove(id),
  /** Pause the auto-dismiss timer of one toast, or of every toast. */
  pause: (id?: string) => toaster.pause(id),
  /** Resume the auto-dismiss timer of one toast, or of every toast. */
  resume: (id?: string) => toaster.resume(id),
  /** Drive a toast through a promise's loading/success/error states. */
  promise: <Value>(
    promise: Promise<Value> | (() => Promise<Value>),
    options: toastMachine.PromiseOptions<Value, string>,
    shared?: Omit<ToastOptions, "type">,
  ) => toaster.promise(promise, options, shared),
  /** Whether a toast is currently visible. */
  isVisible: (id: string) => toaster.isVisible(id),
  /** The number of toasts currently held by the store. */
  getCount: () => toaster.getCount(),
};
