// Unit tests for the `data-pending-scroll` lifecycle (shadcn upstream
// 503a3a5's flash-on-reload fix, ported in lib/controller.ts). Only the
// paths reachable without a real DOM are covered here: `handleContentChange`
// walks `content.children` with `instanceof HTMLElement`, which needs jsdom
// (not configured in this repo's node-environment vitest config), so the
// "opening position applied, itemCount > 0" path is exercised by the
// behavior/hydration suites against a real browser instead — see
// AGENTS.md's "docs mtc" / hydration-invariant notes for why this repo's
// unit tests stay DOM-light by design.
import { describe, expect, it } from "vitest";
import { createMessageScrollerController } from "./controller.ts";

// Minimal fake element: writeStateAttributes only ever calls
// setAttribute/removeAttribute/toggleAttribute, never instanceof-checks it.
function createFakeElement() {
  const attributes = new Map<string, string>();
  return {
    attributes,
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
    scrollTo: () => {},
    setAttribute(name: string, value: string) {
      attributes.set(name, value);
    },
    removeAttribute(name: string) {
      attributes.delete(name);
    },
    toggleAttribute(name: string, force: boolean) {
      if (force) attributes.set(name, "");
      else attributes.delete(name);
    },
    hasAttribute(name: string) {
      return attributes.has(name);
    },
  };
}

describe("message-scroller pending-default-scroll", () => {
  it("starts pending for defaultScrollPosition=end once root/viewport register", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "end" });
    const root = createFakeElement();
    const viewport = createFakeElement();

    controller.setRootElement(root as unknown as HTMLElement);
    controller.setViewportElement(viewport as unknown as HTMLElement);

    expect(root.hasAttribute("data-pending-scroll")).toBe(true);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(true);
  });

  it("starts pending for defaultScrollPosition=last-anchor", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "last-anchor" });
    const viewport = createFakeElement();

    controller.setViewportElement(viewport as unknown as HTMLElement);

    expect(viewport.hasAttribute("data-pending-scroll")).toBe(true);
  });

  it("never starts pending for defaultScrollPosition=start", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "start" });
    const viewport = createFakeElement();

    controller.setViewportElement(viewport as unknown as HTMLElement);

    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);
  });

  it("clears pending-scroll on init() when the transcript is empty (itemCount === 0)", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "end" });
    const root = createFakeElement();
    const viewport = createFakeElement();

    controller.setRootElement(root as unknown as HTMLElement);
    controller.setViewportElement(viewport as unknown as HTMLElement);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(true);

    // No content registered => itemCount stays 0 => applyDefaultScrollPosition
    // bails out early => init()'s empty-transcript fallback clears it, mirroring
    // upstream's layout-effect fallback for an empty transcript.
    controller.init();

    expect(root.hasAttribute("data-pending-scroll")).toBe(false);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);
  });

  it("clears pending-scroll via markDefaultScrollPositionApplied's scrollToMessage path", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "end" });
    const viewport = createFakeElement();

    controller.setViewportElement(viewport as unknown as HTMLElement);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(true);

    // scrollToMessage with itemCount still 0 (no content registered — matches
    // this suite's other no-DOM tests) hits the "queue as pending, mark the
    // opening position applied" branch, which calls
    // markDefaultScrollPositionApplied() directly — the same helper
    // applyDefaultScrollPosition() uses once a real transcript scroll
    // succeeds (covered by the browser-only behavior suite instead, since
    // that path needs `content.children`/`instanceof HTMLElement`).
    const handled = controller.scrollToMessage("msg-1");

    expect(handled).toBe(true);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);
  });

  it("does not resurrect pending-scroll once cleared, even if writeStateAttributes runs again", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "end" });
    const root = createFakeElement();
    const viewport = createFakeElement();

    controller.setRootElement(root as unknown as HTMLElement);
    controller.setViewportElement(viewport as unknown as HTMLElement);
    controller.init();
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);

    // Re-registering the viewport (e.g. remount) re-mirrors current state;
    // pendingDefaultScroll must stay false, not reset to the initial value.
    controller.setViewportElement(null);
    controller.setViewportElement(viewport as unknown as HTMLElement);

    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);
  });
});
