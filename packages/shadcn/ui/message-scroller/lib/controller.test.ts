// Unit tests for the `data-pending-scroll` lifecycle (shadcn upstream
// 503a3a5's flash-on-reload fix, ported in lib/controller.ts) and the
// mount-order guard that makes the port safe on this repo's tree (see
// notes/style-ports.md's "pending-scroll" section for the bug this fixes).
//
// Only the paths reachable without a real DOM are covered here:
// handleContentChange walks content.children with `instanceof HTMLElement`
// (via geometry.ts's getMessageScrollerItems), which needs a real
// HTMLElement global (jsdom is not configured in this repo's node-
// environment vitest config — see AGENTS.md's "docs mtc" notes for why unit
// tests here stay DOM-light by design). So every test below registers
// content with NO children (itemCount stays 0). That is still enough to
// drive handleContentChange() through to commitScrollState() (it does not
// short-circuit on an empty transcript the way applyDefaultScrollPosition
// does), which needs a couple of geometry primitives this file stubs
// minimally (getBoundingClientRect, window.getComputedStyle) — real
// per-pixel geometry (the "opening position applied to a non-empty
// transcript" path) is exercised by the behavior suite
// (packages/shadcn/tests/behavior/message-scroller.test.ts) against a real
// served build instead.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMessageScrollerController } from "./controller.ts";

const FAKE_RECT: DOMRect = {
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: () => ({}),
};

const FAKE_COMPUTED_STYLE = { paddingBlockEnd: "0px", paddingBlockStart: "0px", paddingBottom: "0px", paddingTop: "0px" } as CSSStyleDeclaration;

beforeEach(() => {
  vi.stubGlobal("window", { getComputedStyle: () => FAKE_COMPUTED_STYLE });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// Minimal fake element: writeStateAttributes only ever calls
// setAttribute/removeAttribute/toggleAttribute; handleContentChange (with no
// children) reads content.children plus, via commitScrollState's geometry
// calls, getBoundingClientRect on the viewport (items stay empty so their
// own getBoundingClientRect is never called).
function createFakeElement() {
  const attributes = new Map<string, string>();
  return {
    attributes,
    children: [] as unknown[],
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
    scrollTo: () => {},
    getBoundingClientRect: () => FAKE_RECT,
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

describe("message-scroller pending-default-scroll: initial value", () => {
  it("starts pending for defaultScrollPosition=end once an element registers", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "end" });
    const root = createFakeElement();

    controller.setRootElement(root as unknown as HTMLElement);

    expect(root.hasAttribute("data-pending-scroll")).toBe(true);
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
});

describe("message-scroller pending-default-scroll: mount-order gate (tryInitialSync)", () => {
  // The real tree mounts content BEFORE viewport, before message-scroller's
  // own onMount finishes (Marko mounts a child before its ancestor). This is
  // the exact order that broke cd2fdb17: content.marko called
  // handleContentChange() unconditionally on its own mount, while viewport
  // was still null.
  it("does not clear pending-scroll when content registers before viewport/root (real mount order), and clears once all three are registered", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "end" });
    const root = createFakeElement();
    const viewport = createFakeElement();
    const content = createFakeElement();

    // content mounts first — matches the real tree. If handleContentChange
    // ran here (the pre-fix bug), applyDefaultScrollPosition would try to
    // read `viewport`/`root`, both still null, and silently no-op without
    // clearing pendingDefaultScroll.
    controller.setContentElement(content as unknown as HTMLElement);

    // viewport mounts next — still no root, so still gated.
    controller.setViewportElement(viewport as unknown as HTMLElement);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(true);

    // root (message-scroller.marko) mounts last, completing registration.
    // itemCount is 0 (fake content has no children), so
    // applyDefaultScrollPosition() bails out and handleContentChange's
    // empty-transcript branch clears pending-scroll — proving the gate fired
    // exactly once, on the LAST registration, not on content's own mount.
    controller.setRootElement(root as unknown as HTMLElement);

    expect(root.hasAttribute("data-pending-scroll")).toBe(false);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);
  });

  it("clears once all three register in root, viewport, content order too", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "end" });
    const root = createFakeElement();
    const viewport = createFakeElement();
    const content = createFakeElement();

    controller.setRootElement(root as unknown as HTMLElement);
    expect(root.hasAttribute("data-pending-scroll")).toBe(true);

    controller.setViewportElement(viewport as unknown as HTMLElement);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(true);

    controller.setContentElement(content as unknown as HTMLElement);

    expect(root.hasAttribute("data-pending-scroll")).toBe(false);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);
  });

  it("clears once all three register in viewport, content, root order", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "last-anchor" });
    const root = createFakeElement();
    const viewport = createFakeElement();
    const content = createFakeElement();

    controller.setViewportElement(viewport as unknown as HTMLElement);
    controller.setContentElement(content as unknown as HTMLElement);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(true);

    controller.setRootElement(root as unknown as HTMLElement);

    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);
    expect(root.hasAttribute("data-pending-scroll")).toBe(false);
  });

  it("only runs the initial sync once, even if a part re-registers afterward", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "end" });
    const root = createFakeElement();
    const viewport = createFakeElement();
    const content = createFakeElement();

    controller.setContentElement(content as unknown as HTMLElement);
    controller.setViewportElement(viewport as unknown as HTMLElement);
    controller.setRootElement(root as unknown as HTMLElement);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);

    // Simulate a remount of just the viewport element (unmount + mount),
    // matching what setViewportElement(null) then setViewportElement(el)
    // looks like in the real component's onDestroy/onMount pair. The
    // already-cleared pending state must be MIRRORED onto the fresh element,
    // never re-armed to its initial value.
    controller.setViewportElement(null);
    const remountedViewport = createFakeElement();
    controller.setViewportElement(remountedViewport as unknown as HTMLElement);

    expect(remountedViewport.hasAttribute("data-pending-scroll")).toBe(false);
  });

  it("does not fire the gate while any one of root/viewport/content is still missing", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "end" });
    const root = createFakeElement();
    const viewport = createFakeElement();

    controller.setRootElement(root as unknown as HTMLElement);
    controller.setViewportElement(viewport as unknown as HTMLElement);

    // No content ever registers — pending-scroll must stay set rather than
    // being silently cleared or left in an indeterminate state.
    expect(root.hasAttribute("data-pending-scroll")).toBe(true);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(true);
  });
});

describe("message-scroller pending-default-scroll: other clear paths", () => {
  it("clears pending-scroll via markDefaultScrollPositionApplied's scrollToMessage path", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "end" });
    const viewport = createFakeElement();

    controller.setViewportElement(viewport as unknown as HTMLElement);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(true);

    // scrollToMessage with itemCount still 0 (no content registered) hits
    // the "queue as pending, mark the opening position applied" branch,
    // which calls markDefaultScrollPositionApplied() directly — the same
    // helper applyDefaultScrollPosition() uses once a real transcript scroll
    // succeeds (covered by the behavior suite, which needs real DOM
    // geometry).
    const handled = controller.scrollToMessage("msg-1");

    expect(handled).toBe(true);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);
  });

  it("does not resurrect pending-scroll once cleared, even if writeStateAttributes runs again", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "end" });
    const root = createFakeElement();
    const viewport = createFakeElement();
    const content = createFakeElement();

    controller.setContentElement(content as unknown as HTMLElement);
    controller.setViewportElement(viewport as unknown as HTMLElement);
    controller.setRootElement(root as unknown as HTMLElement);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);

    // Any later mirror (e.g. a scroll-driven commitScrollState) must not
    // reset pending-scroll back to its initial value.
    controller.setViewportElement(null);
    controller.setViewportElement(viewport as unknown as HTMLElement);

    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);
  });
});
