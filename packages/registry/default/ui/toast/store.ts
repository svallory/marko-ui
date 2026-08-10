/**
 * Zag-free toast store (deviation — see registry.meta.json / README note).
 *
 * @zag-js/toast v1 requires one live machine `Service` per visible toast
 * (`toast.machine` with `parent: <group service>`), spawned/torn down as
 * toasts are added and removed. Marko 6 gives one `<lifecycle>` per
 * component instance; there is no supported way to have a `<for>` loop over
 * a plain data array also mint/stop a machine service per item without an
 * unverified per-item child-component pattern that has no precedent
 * elsewhere in this registry. Per the component spec's documented fallback,
 * this implements the same public API (`toast.success/error/info/...`)
 * with a plain module-scope store, notified via subscribe/unsubscribe, and
 * plain `setTimeout` auto-dismiss timers instead of Zag machines.
 */

export type ToastType = "success" | "error" | "info" | "warning" | "loading" | "default";

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastRecord extends Required<Pick<ToastOptions, "id" | "type">> {
  title?: string;
  description?: string;
  duration: number;
}

const DEFAULT_DURATION = 5000;

let toasts: ToastRecord[] = [];
let uid = 0;
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const subscribers = new Set<(toasts: ToastRecord[]) => void>();

function notify() {
  for (const fn of subscribers) fn(toasts);
}

function nextId() {
  uid += 1;
  return `toast-${uid}`;
}

function clearTimer(id: string) {
  const t = timers.get(id);
  if (t !== undefined) {
    clearTimeout(t);
    timers.delete(id);
  }
}

function scheduleRemoval(id: string, duration: number) {
  clearTimer(id);
  if (duration === Infinity || duration <= 0) return;
  timers.set(
    id,
    setTimeout(() => {
      remove(id);
    }, duration),
  );
}

function create(options: ToastOptions, type: ToastType): string {
  const id = options.id ?? nextId();
  const duration = options.duration ?? (type === "loading" ? Infinity : DEFAULT_DURATION);
  const record: ToastRecord = {
    id,
    type,
    title: options.title,
    description: options.description,
    duration,
  };
  toasts = [record, ...toasts.filter((t) => t.id !== id)];
  notify();
  scheduleRemoval(id, duration);
  return id;
}

function remove(id?: string) {
  if (id === undefined) {
    for (const t of toasts) clearTimer(t.id);
    toasts = [];
  } else {
    clearTimer(id);
    toasts = toasts.filter((t) => t.id !== id);
  }
  notify();
}

function subscribe(fn: (toasts: ToastRecord[]) => void): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

function getToasts(): ToastRecord[] {
  return toasts;
}

export const toast = {
  success: (options: ToastOptions | string) =>
    create(typeof options === "string" ? { title: options } : options, "success"),
  error: (options: ToastOptions | string) =>
    create(typeof options === "string" ? { title: options } : options, "error"),
  info: (options: ToastOptions | string) =>
    create(typeof options === "string" ? { title: options } : options, "info"),
  warning: (options: ToastOptions | string) =>
    create(typeof options === "string" ? { title: options } : options, "warning"),
  loading: (options: ToastOptions | string) =>
    create(typeof options === "string" ? { title: options } : options, "loading"),
  message: (options: ToastOptions | string) =>
    create(typeof options === "string" ? { title: options } : options, "default"),
  dismiss: (id?: string) => remove(id),
  subscribe,
  getToasts,
};
