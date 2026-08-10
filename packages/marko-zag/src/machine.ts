/**
 * Zag.js v1 service protocol for Marko 6.
 *
 * Every Zag-version-specific call (service construction, start/stop,
 * transitions, connect signature) lives in this file only (design C-1).
 *
 * Ported from @zag-js/solid@1.43.0, replacing Solid primitives with plain
 * values plus a `notify` callback that the host component uses to bump a
 * `<let/rev>` signal.
 *
 * SSR contract (see notes/specs/marko-ui/spike-results.md):
 * - Marko serializes reactive state and never re-runs render on resume, so
 *   services and connect() apis must NOT be reactive state.
 * - Server: create a throwaway service inline (`ssrService`) — never started,
 *   so `connect` renders correct initial attrs with no DOM access.
 * - Client: create the real service in `<lifecycle onMount>`, store it in a
 *   `<let/svc=null>` (null serializes; the client instance never crosses).
 */
import {
  createScope,
  findTransition,
  getExitEnterStates,
  hasTag,
  INIT_STATE,
  MachineStatus,
  matchesState,
  resolveStateValue,
} from "@zag-js/core";
import { callAll, compact, ensure, isFunction, isString, toArray, warn, isEqual } from "@zag-js/utils";

type Dict = Record<string, any>;

export interface MarkoService {
  state: Dict;
  send: (event: Dict) => void;
  context: Dict;
  prop: (key: string) => any;
  scope: Dict;
  refs: Dict;
  computed: (key: string) => any;
  event: Dict;
  getStatus: () => string;
  start: () => void;
  stop: () => void;
  propsChanged: () => void;
}

const access = (v: any) => (isFunction(v) ? v() : v);
const noop = () => {};

/**
 * Server-render helper: a never-started service for computing initial attrs.
 * Use in the reactive snapshot expression: `connect(svc ?? ssrService(machine, props), normalizeProps)`.
 */
export function ssrService(machine: any, userProps: () => Dict): MarkoService {
  return createService(machine, userProps, noop);
}

export function createService(machine: any, userProps: () => Dict, notify: () => void): MarkoService {
  const getProps = () =>
    machine.props?.({ props: compact(access(userProps)), scope: getScope() }) ?? access(userProps);

  const getScope = () => {
    const { id, ids, getRootNode } = access(userProps);
    return createScope({ id, ids, getRootNode });
  };

  const prop = (key: string) => getProps()[key];

  const debug = (...args: any[]) => {
    if (machine.debug) console.log(...args);
  };

  // --- track (machine.watch) ------------------------------------------------
  const tracks: Array<{ deps: any[]; effect: VoidFunction; prev: any[] }> = [];
  const createTrack = (deps: any[], effect: VoidFunction) => {
    tracks.push({ deps, effect, prev: deps.map((d) => access(d)) });
  };
  const runTracks = () => {
    for (const t of tracks) {
      const next = t.deps.map((d) => access(d));
      if (next.some((v, i) => !isEqual(t.prev[i], v))) {
        t.prev = next;
        t.effect();
      }
    }
  };

  // --- bindable -------------------------------------------------------------
  function createBindable(props: () => Dict) {
    const initial = props().value ?? props().defaultValue;
    const eq = props().isEqual ?? Object.is;
    let value = initial;
    const controlled = () => props().value !== undefined;
    const get = () => (controlled() ? props().value : value);
    const ref = {
      get current() {
        return get();
      },
      set current(v) {
        value = v;
      },
    };
    const set = (v: any) => {
      const prev = get();
      const next = isFunction(v) ? v(prev) : v;
      if (props().debug) console.log(`[bindable > ${props().debug}] setValue`, { next, prev });
      if (!controlled()) value = next;
      if (!eq(next, prev)) {
        props().onChange?.(next, prev);
        scheduleUpdate();
      }
    };
    return {
      initial,
      ref,
      get,
      set,
      invoke(nextValue: any, prevValue: any) {
        props().onChange?.(nextValue, prevValue);
      },
      hash(v: any) {
        return props().hash?.(v) ?? String(v);
      },
    };
  }
  createBindable.cleanup = (fn: VoidFunction) => {
    cleanups.push(fn);
  };
  createBindable.ref = (defaultValue: any) => {
    let v = defaultValue;
    return { get: () => v, set: (next: any) => (v = next) };
  };

  let updateScheduled = false;
  const scheduleUpdate = () => {
    if (updateScheduled) return;
    updateScheduled = true;
    queueMicrotask(() => {
      updateScheduled = false;
      runTracks();
      notify();
    });
  };

  const cleanups: VoidFunction[] = [];

  // --- context / refs / computed -------------------------------------------
  const context = machine.context?.({
    prop,
    bindable: createBindable,
    get scope() {
      return getScope();
    },
    flush: (fn: VoidFunction) => fn(),
    getContext: () => ctx,
    getComputed: () => computed,
    getRefs: () => refs,
    getEvent: () => getEvent(),
  });

  const ctx = {
    get: (key: string) => context?.[key].get(),
    set: (key: string, value: any) => context?.[key].set(value),
    initial: (key: string) => context?.[key].initial,
    hash: (key: string) => {
      const current = context?.[key].get();
      return context?.[key].hash(current);
    },
  };

  const refsInit = machine.refs?.({ prop, context: ctx }) ?? {};
  const refsStore: Dict = { ...refsInit };
  const refs = {
    get: (key: string) => refsStore[key],
    set: (key: string, value: any) => {
      refsStore[key] = value;
    },
  };

  const computed = (key: string): any => {
    ensure(machine.computed, () => `[zag-js] No computed object found on machine`);
    const fn = machine.computed[key];
    return fn({ context: ctx, event: eventRef.current, prop, refs, scope: getScope(), computed });
  };

  // --- events / state -------------------------------------------------------
  const effects = new Map<string, VoidFunction>();
  const transitionRef: { current: any } = { current: null };
  const previousEventRef: { current: any } = { current: null };
  const eventRef: { current: any } = { current: { type: "" } };

  const getEvent = () =>
    Object.assign({}, eventRef.current, {
      current: () => eventRef.current,
      previous: () => previousEventRef.current,
    });

  const getState = () =>
    Object.assign({}, state, {
      matches: (...values: string[]) => values.some((v) => matchesState(state.get(), v)),
      hasTag: (tag: string) => hasTag(machine, state.get(), tag),
    });

  const getParams = (): Dict => ({
    state: getState(),
    context: ctx,
    event: getEvent(),
    prop,
    send,
    action,
    guard,
    track: createTrack,
    refs,
    computed,
    flush: (fn: VoidFunction) => fn(),
    get scope() {
      return getScope();
    },
    choose,
  });

  const action = (keys: any) => {
    const strs = isFunction(keys) ? keys(getParams()) : keys;
    if (!strs) return;
    for (const s of strs) {
      const fn = machine.implementations?.actions?.[s];
      if (!fn) warn(`[zag-js] No implementation found for action "${JSON.stringify(s)}"`);
      fn?.(getParams());
    }
  };

  const guard = (str: any) => {
    if (isFunction(str)) return str(getParams());
    const fn = machine.implementations?.guards?.[str];
    if (!fn) warn(`[zag-js] No implementation found for guard "${JSON.stringify(str)}"`);
    return fn?.(getParams());
  };

  // Marko batches renders: DOM created by a state change (e.g. an opened
  // positioner) does not exist yet when the machine's entry effects fire.
  // Zag effects that resolve elements once (popper's getPlacement defer:raf)
  // would then fail permanently. Deferring effects by two frames guarantees
  // the notify → render pass has committed first.
  const effect = (keys: any) => {
    const strs = isFunction(keys) ? keys(getParams()) : keys;
    if (!strs) return;
    const cleanupFns: VoidFunction[] = [];
    let disposed = false;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        if (disposed) return;
        for (const s of strs) {
          const fn = machine.implementations?.effects?.[s];
          if (!fn) warn(`[zag-js] No implementation found for effect "${JSON.stringify(s)}"`);
          const cleanup = fn?.(getParams());
          if (cleanup) cleanupFns.push(cleanup);
        }
      });
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      cleanupFns.forEach((fn) => fn?.());
    };
  };

  const choose = (transitions: any) =>
    toArray(transitions).find((t: any) => {
      let result = !t.guard;
      if (isString(t.guard)) result = !!guard(t.guard);
      else if (isFunction(t.guard)) result = t.guard(getParams());
      return result;
    });

  const state = createBindable(() => ({
    defaultValue: resolveStateValue(machine, machine.initialState({ prop })),
    onChange(nextState: string, prevState: string) {
      const { exiting, entering } = getExitEnterStates(
        machine,
        prevState,
        nextState,
        transitionRef.current?.reenter,
      );
      exiting.forEach((item: any) => {
        const exitEffects = effects.get(item.path);
        exitEffects?.();
        effects.delete(item.path);
      });
      exiting.forEach((item: any) => action(item.state?.exit));
      action(transitionRef.current?.actions);
      entering.forEach((item: any) => {
        const cleanup = effect(item.state?.effects);
        if (cleanup) {
          const existing = effects.get(item.path);
          effects.set(item.path, existing ? callAll(existing, cleanup) : cleanup);
        }
      });
      if (prevState === INIT_STATE) {
        action(machine.entry);
        const cleanup = effect(machine.effects);
        if (cleanup) {
          const existing = effects.get(INIT_STATE);
          effects.set(INIT_STATE, existing ? callAll(existing, cleanup) : cleanup);
        }
      }
      entering.forEach((item: any) => action(item.state?.entry));
    },
  }));

  let status = MachineStatus.NotStarted;

  const send = (event: any) => {
    queueMicrotask(() => {
      if (status !== MachineStatus.Started) return;
      previousEventRef.current = eventRef.current;
      eventRef.current = event;
      const currentState = state.get();
      const { transitions, source } = findTransition(machine, currentState, event.type);
      const transition = choose(transitions);
      if (!transition) return;
      transitionRef.current = transition;
      const target = resolveStateValue(machine, transition.target ?? currentState, source);
      debug("transition", event.type, transition.target || currentState, `(${transition.actions})`);
      if (target !== currentState) {
        state.set(target);
      } else if (transition.reenter) {
        state.invoke(currentState, currentState);
      } else {
        action(transition.actions);
      }
    });
  };

  machine.watch?.(getParams());

  return {
    state: getState(),
    send,
    context: ctx,
    prop,
    get scope() {
      return getScope();
    },
    refs,
    computed,
    event: getEvent(),
    getStatus: () => status,
    /** Client-only: run entry actions/effects. Call from `<lifecycle onMount>`. */
    start() {
      const started = status === MachineStatus.Started;
      status = MachineStatus.Started;
      debug(started ? "rehydrating..." : "initializing...");
      state.invoke(state.initial, INIT_STATE);
      // SSR attrs were rendered without event handlers (see normalize-props);
      // force one client recompute so handler-bearing props are applied.
      scheduleUpdate();
    },
    /** Call from `<lifecycle onDestroy>`. */
    stop() {
      if (status !== MachineStatus.Started) return;
      debug("unmounting...");
      status = MachineStatus.Stopped;
      effects.forEach((fn) => fn?.());
      effects.clear();
      transitionRef.current = null;
      action(machine.exit);
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
    },
    /** Host calls when reactive props changed (controlled usage). */
    propsChanged() {
      runTracks();
      notify();
    },
  };
}
