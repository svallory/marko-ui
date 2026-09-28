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

// getMessageScrollerItems (geometry.ts) filters content.children with
// `instanceof HTMLElement`, which needs a real HTMLElement constructor to
// match against. Stubbing a minimal one lets "content arrives after an
// empty mount" be driven through handleContentChange()'s real item-walking
// code, in this node-environment suite, without jsdom.
class FakeHTMLElement {
  attributes = new Map<string, string>();
  children: FakeHTMLElement[] = [];
  dataset: Record<string, string> = {};
  scrollTop = 0;
  scrollHeight = 0;
  clientHeight = 0;
  scrollTo = () => {};
  getBoundingClientRect = () => FAKE_RECT;
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
  toggleAttribute(name: string, force: boolean) {
    if (force) this.attributes.set(name, "");
    else this.attributes.delete(name);
  }
  hasAttribute(name: string) {
    return this.attributes.has(name);
  }
}

beforeEach(() => {
  // Fake timers: some paths (setAutoScrolling's clear timer, rAF-coalesced
  // commits) schedule real callbacks that would otherwise fire AFTER a test
  // ends and vi.unstubAllGlobals() has already torn down the window/
  // HTMLElement stubs below — an unhandled "HTMLElement is not defined"
  // from a stray timer, not a real assertion failure. Fake timers make
  // every scheduled callback inert unless a test explicitly advances them.
  vi.useFakeTimers();
  vi.stubGlobal("window", {
    getComputedStyle: () => FAKE_COMPUTED_STYLE,
    setTimeout: (fn: () => void) => setTimeout(fn),
    clearTimeout: (id: unknown) => clearTimeout(id as unknown as number),
    requestAnimationFrame: (fn: () => void) => setTimeout(fn, 0),
    cancelAnimationFrame: (id: unknown) => clearTimeout(id as unknown as number),
  });
  vi.stubGlobal("HTMLElement", FakeHTMLElement);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

// Minimal fake element: writeStateAttributes only ever calls
// setAttribute/removeAttribute/toggleAttribute; handleContentChange (with no
// children) reads content.children plus, via commitScrollState's geometry
// calls, getBoundingClientRect on the viewport (items stay empty so their
// own getBoundingClientRect is never called).
function createFakeElement() {
  return new FakeHTMLElement();
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

  // Matches upstream 503a3a5 exactly (verified against
  // use-message-scroller-controller.ts's mount-only useLayoutEffect): an
  // initially-empty transcript clears pendingDefaultScroll at the FIRST
  // sync and never re-arms it, even once real content streams in
  // afterward. Upstream's own docs (message-scroller.mdx, "Avoiding a Flash
  // on Reload") scope the whole feature to a server-rendered transcript and
  // explicitly say to skip the companion technique "when messages load on
  // the client" — this is not a gap in this port, it is the documented
  // upstream contract. See viewport.marko's SSR STORY comment.
  it("content arriving after an empty mount is never hidden — matches upstream, does not re-arm pending-scroll", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "end" });
    const root = createFakeElement();
    const viewport = createFakeElement();
    const content = createFakeElement();

    // All three register with content still empty (0 children) — the
    // initial sync clears pending-scroll immediately (empty-transcript
    // path), exactly like upstream's mount-time layout effect.
    controller.setContentElement(content as unknown as HTMLElement);
    controller.setViewportElement(viewport as unknown as HTMLElement);
    controller.setRootElement(root as unknown as HTMLElement);
    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);
    expect(root.hasAttribute("data-pending-scroll")).toBe(false);

    // A real message streams in (content gains a child) and the
    // MutationObserver equivalent fires handleContentChange() again — the
    // viewport moves to "end" (applyDefaultScrollPosition succeeds, since
    // itemCount was 0 before this call), but the attribute must stay
    // cleared: it must never be resurrected once content arrives.
    const item = new FakeHTMLElement();
    content.children.push(item);
    controller.handleContentChange();

    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);
    expect(root.hasAttribute("data-pending-scroll")).toBe(false);
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

describe("message-scroller pending-default-scroll: throw safety", () => {
  // applyDefaultScrollPosition's scroll/geometry calls are real DOM
  // reads/writes that can throw on a malformed tree. If one does, the
  // viewport must never be left permanently hidden — the flag has to clear
  // even on the error path, and the error must still surface (not be
  // silently swallowed).
  it("clears pending-scroll and rethrows if the scroll application throws", () => {
    const controller = createMessageScrollerController({ defaultScrollPosition: "end" });
    const root = createFakeElement();
    const viewport = createFakeElement();
    const content = createFakeElement();

    // One real item so applyDefaultScrollPosition doesn't bail out early on
    // itemCount === 0, and a scrollHeight/clientHeight gap large enough that
    // scrollToPosition takes the viewport.scrollTo(...) branch (not the
    // direct scrollTop assignment, which never throws here).
    content.children.push(new FakeHTMLElement());
    viewport.scrollHeight = 1000;
    viewport.clientHeight = 200;
    const scrollError = new Error("boom: scrollTo failed");
    viewport.scrollTo = () => {
      throw scrollError;
    };

    controller.setContentElement(content as unknown as HTMLElement);
    controller.setViewportElement(viewport as unknown as HTMLElement);

    // setRootElement is the registration that completes the gate and
    // triggers the throwing handleContentChange() — assert it propagates
    // (not swallowed) AND that the attribute is cleared despite the throw.
    expect(() => controller.setRootElement(root as unknown as HTMLElement)).toThrow(scrollError);

    expect(viewport.hasAttribute("data-pending-scroll")).toBe(false);
    expect(root.hasAttribute("data-pending-scroll")).toBe(false);
  });
});
