/**
 * Regression tests for controlled-bindable semantics (review findings #1/#2):
 * - onChange must fire exactly once per change (no duplicates while the
 *   parent hasn't applied the value yet)
 * - notify must fire on EVERY transition, including when the parent applied
 *   the value first (value-equal set) — a controlled component must still
 *   re-render.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createService } from "../src/machine.ts";

// minimal machine compatible with the zag v1 helpers createService uses
const toggleMachine = {
  props: ({ props }: any) => props,
  initialState: () => "idle",
  states: {
    idle: { on: { TOGGLE: { actions: ["toggle"] } } },
  },
  context: ({ bindable, prop }: any) => ({
    checked: bindable(() => ({
      value: prop("checked"),
      defaultValue: false,
      onChange: prop("onCheckedChange"),
    })),
  }),
  implementations: {
    actions: {
      toggle: ({ context }: any) => context.set("checked", !context.get("checked")),
    },
  },
};

const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  (globalThis as any).requestAnimationFrame ??= (fn: FrameRequestCallback) =>
    setTimeout(fn, 0) as unknown as number;
  (globalThis as any).cancelAnimationFrame ??= (id: number) => clearTimeout(id);
});

describe("bindable semantics", () => {
  it("uncontrolled: toggling fires onChange once and notifies", async () => {
    const onChange = vi.fn();
    const notify = vi.fn();
    const svc = createService(toggleMachine, () => ({ id: "t", onCheckedChange: onChange }), notify);
    svc.start();
    await flush();
    svc.send({ type: "TOGGLE" });
    await flush();
    expect(svc.context.get("checked")).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true, false);
    expect(notify.mock.calls.length).toBeGreaterThan(0);
  });

  it("controlled, parent ignores: repeated toggles do not double-fire onChange for the same target value", async () => {
    const onChange = vi.fn();
    const svc = createService(
      toggleMachine,
      () => ({ id: "t", checked: false, onCheckedChange: onChange }),
      () => {},
    );
    svc.start();
    await flush();
    svc.send({ type: "TOGGLE" });
    await flush();
    expect(onChange).toHaveBeenCalledTimes(1);
    // parent ignored the change; value still false. Another toggle asks for
    // true again — prev is tracked as the last *requested* value (true), so
    // onChange must NOT re-fire for the same target.
    svc.send({ type: "TOGGLE" });
    await flush();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("controlled, parent applies: value-equal set still notifies (re-render happens)", async () => {
    const onChange = vi.fn();
    const notify = vi.fn();
    let checked = false;
    const svc = createService(
      toggleMachine,
      () => ({
        id: "t",
        checked,
        onCheckedChange: (v: boolean) => {
          onChange(v);
          checked = v;
        },
      }),
      notify,
    );
    svc.start();
    await flush();
    svc.send({ type: "TOGGLE" });
    await flush();
    svc.propsChanged(); // parent applied checked=true
    await flush();
    notify.mockClear();
    // parent-applied value now equals machine target on next set of same value:
    // context.set("checked", !true) => false — normal change; then set(false→false)
    svc.send({ type: "TOGGLE" });
    await flush();
    expect(notify.mock.calls.length).toBeGreaterThan(0);
  });
});
