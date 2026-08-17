// Framework-agnostic port of the shadcn `@shadcn/react/message-scroller`
// package's `use-message-scroller-refs.ts` + `use-message-scroller-commands.ts`
// + `use-message-scroller-controller.ts` + `stores.ts`, collapsed into one
// factory function.
//
// SIMPLIFICATION FROM SOURCE: the React source splits this logic across three
// hooks (refs / commands / controller) plus a `useSyncExternalStore`-shaped
// store module, because React needs stable callback identities across
// re-renders and a store-subscription bridge for `useSyncExternalStore`.
// Marko has no re-render cycle to be stable across and no
// `useSyncExternalStore` — it has `<let>` reactive locals wired at the
// component boundary instead — so this port collapses everything into one
// plain closure-based controller object built once per `<MessageScrollerProvider>`
// instance. The two external stores are kept (as plain listener-set pub/sub)
// because two different Marko components (`Button`, and any external
// consumer of `useMessageScrollerScrollable`/`useMessageScrollerVisibility`)
// need to react to state this controller owns without a shared parent
// re-render to piggyback on — see message-scroller-provider.marko's header
// comment for how `<let>` is wired to these subscriptions.
//
// Every piece of *behavior* (mode transitions, anchoring, prepend
// preservation, tail-spacer math) is a verbatim port of the source's logic;
// only the plumbing that carried it across React's render model changed.
import {
  getContentBottom,
  getElementScrollTop,
  getElementTop,
  getElementViewportTop,
  getFirstVisibleMessageItem,
  getFlexGap,
  getLastScrollAnchor,
  getMaxScrollTop,
  getMessageScrollerItems,
  getMessageScrollerScrollable,
  getMessageScrollerVisibilityState,
  getNewScrollAnchor,
  getTailSpacerHeight,
  getUnanchoredScrollAnchor,
  hasMultipleNewScrollAnchors,
} from "./geometry.ts";
import {
  AUTOSCROLLING_CLEAR_DELAY,
  DEFAULT_SCROLL_EDGE_THRESHOLD,
  DEFAULT_SCROLL_MARGIN,
  DEFAULT_SCROLL_PREVIOUS_ITEM_PEEK,
  EMPTY_MESSAGE_SCROLLER_VISIBILITY_STATE,
  SCROLL_POSITION_EPSILON,
} from "./types.ts";
import type {
  MessageScrollerDefaultScrollPosition,
  MessageScrollerMode,
  MessageScrollerScrollable,
  MessageScrollerScrollOptions,
  MessageScrollerVisibilityState,
} from "./types.ts";

export type MessageScrollerProviderOptions = {
  autoScroll?: boolean;
  defaultScrollPosition?: MessageScrollerDefaultScrollPosition;
  scrollEdgeThreshold?: number;
  scrollPreviousItemPeek?: number;
  scrollMargin?: number;
};

// Minimal pub/sub, standing in for the source's useSyncExternalStore-shaped
// store (see this file's header comment).
function createStore<T>(initialSnapshot: T, isEqual: (a: T, b: T) => boolean) {
  let snapshot = initialSnapshot;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => snapshot,
    hasListeners: () => listeners.size > 0,
    setSnapshot: (next: T) => {
      if (isEqual(snapshot, next)) return;
      snapshot = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void, onFirstSubscribe?: () => void, onLastUnsubscribe?: () => void) => {
      const wasEmpty = listeners.size === 0;
      listeners.add(listener);
      if (wasEmpty) onFirstSubscribe?.();
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) onLastUnsubscribe?.();
      };
    },
  };
}

function areScrollStatesEqual(current: MessageScrollerScrollable, next: MessageScrollerScrollable) {
  return current.start === next.start && current.end === next.end;
}

function areVisibilityStatesEqual(current: MessageScrollerVisibilityState, next: MessageScrollerVisibilityState) {
  if (current.currentAnchorId !== next.currentAnchorId) return false;
  if (current.visibleMessageIds.length !== next.visibleMessageIds.length) return false;
  return current.visibleMessageIds.every((messageId, index) => messageId === next.visibleMessageIds[index]);
}

export function createMessageScrollerController(options: MessageScrollerProviderOptions = {}) {
  let autoScroll = options.autoScroll ?? false;
  const scrollEdgeThreshold = options.scrollEdgeThreshold ?? DEFAULT_SCROLL_EDGE_THRESHOLD;
  const scrollPreviousItemPeek = options.scrollPreviousItemPeek ?? DEFAULT_SCROLL_PREVIOUS_ITEM_PEEK;
  const scrollMargin = options.scrollMargin ?? DEFAULT_SCROLL_MARGIN;
  let defaultScrollPosition = options.defaultScrollPosition ?? "end";

  // --- ref bag (plain mutable closure state) ---
  let autoscrolling = false;
  // number, not ReturnType<typeof setTimeout>: this runs in the browser and
  // uses window.setTimeout, which returns a numeric handle.
  let autoscrollingTimeout: number | null = null;
  let streamingTurn: HTMLElement | null = null;
  let content: HTMLElement | null = null;
  let defaultScrollPositionApplied = false;
  let firstItem: HTMLElement | null = null;
  let itemCount = 0;
  let lastScrollTop = 0;
  const messageElements = new Map<string, HTMLElement>();
  let mode: MessageScrollerMode = autoScroll ? "following-bottom" : "free-scrolling";
  let pendingScrollFrame: number | null = null;
  let pendingScrollToMessage: { messageId: string; options?: MessageScrollerScrollOptions } | null = null;
  let prependRestore: { element: HTMLElement; viewportTop: number } | null = null;
  let preserveScrollOnPrepend = true;
  let root: HTMLElement | null = null;
  let spacerGap = 0;
  let spacerHeight = 0;
  let spacer: HTMLElement | null = null;
  let stateFrame: number | null = null;
  let viewport: HTMLElement | null = null;
  let visibilityFrame: number | null = null;
  let visibilityObserver: IntersectionObserver | null = null;
  let visibleMessageIds = new Set<string>();
  const handledScrollAnchors = new WeakSet<HTMLElement>();

  const stateStore = createStore<MessageScrollerScrollable>({ start: false, end: false }, areScrollStatesEqual);
  const visibilityStore = createStore<MessageScrollerVisibilityState>(EMPTY_MESSAGE_SCROLLER_VISIBILITY_STATE, areVisibilityStatesEqual);

  function writeStateAttributes(state: MessageScrollerScrollable) {
    const scrollable = [state.start && "start", state.end && "end"].filter(Boolean).join(" ");

    for (const element of [root, viewport]) {
      if (!element) continue;

      if (scrollable) {
        element.setAttribute("data-scrollable", scrollable);
      } else {
        element.removeAttribute("data-scrollable");
      }

      element.toggleAttribute("data-autoscrolling", autoscrolling);
    }
  }

  // Owns the one follow-bottom transition: arm at the bottom, release on any
  // scroll away (including a scrollbar drag), suppressed during a
  // programmatic scroll so the auto-scroll animation cannot release itself.
  function reconcileFollowMode(scrollable: MessageScrollerScrollable) {
    const scrollTop = viewport?.scrollTop ?? 0;
    const scrolledUp = scrollTop < lastScrollTop - SCROLL_POSITION_EPSILON;

    lastScrollTop = scrollTop;

    if (autoScroll && !scrollable.end && mode !== "settling-jump" && mode !== "anchored-to-message") {
      mode = "following-bottom";
    } else if (mode === "following-bottom" && scrollable.end && scrolledUp && !autoscrolling) {
      mode = "free-scrolling";
    }
  }

  function commitScrollState() {
    const nextState = getMessageScrollerScrollable({ content, scrollEdgeThreshold, spacer, viewport });

    reconcileFollowMode(nextState);

    const publishedState = mode === "following-bottom" ? { ...nextState, end: false } : nextState;

    writeStateAttributes(publishedState);
    stateStore.setSnapshot(publishedState);
  }

  function scheduleStateCommit() {
    if (stateFrame !== null) return;
    stateFrame = window.requestAnimationFrame(() => {
      stateFrame = null;
      commitScrollState();
    });
  }

  function scheduleVisibilitySync() {
    if (!visibilityStore.hasListeners()) return;
    if (visibilityFrame !== null) return;

    visibilityFrame = window.requestAnimationFrame(() => {
      visibilityFrame = null;
      if (!visibilityStore.hasListeners()) return;

      visibilityStore.setSnapshot(
        getMessageScrollerVisibilityState({
          content,
          scrollMargin,
          scrollPreviousItemPeek,
          spacer,
          viewport,
          visibleMessageIds,
        }),
      );
    });
  }

  // --- commands ---
  function setAutoScrolling(next: boolean) {
    if (autoscrollingTimeout !== null) {
      window.clearTimeout(autoscrollingTimeout);
      autoscrollingTimeout = null;
    }

    if (autoscrolling !== next) {
      autoscrolling = next;
      commitScrollState();
    }

    if (next) {
      autoscrollingTimeout = window.setTimeout(() => {
        autoscrollingTimeout = null;
        autoscrolling = false;
        commitScrollState();
      }, AUTOSCROLLING_CLEAR_DELAY);
    }
  }

  function setTailSpacerHeight(height: number) {
    if (!spacer) return;

    const nextHeight = Math.max(0, Math.ceil(height));

    if (spacerHeight === nextHeight) return;

    spacerHeight = nextHeight;
    spacer.hidden = nextHeight === 0;
    spacer.style.height = `${nextHeight}px`;
    spacer.style.marginTop = nextHeight > 0 ? `${-spacerGap}px` : "";
  }

  function scrollToPosition(scrollTop: number, { behavior = "auto", autoscrollingFlag = false }: { behavior?: ScrollBehavior; autoscrollingFlag?: boolean } = {}) {
    if (!viewport) return;

    const nextScrollTop = Math.max(0, scrollTop);

    if (Math.abs(viewport.scrollTop - nextScrollTop) <= SCROLL_POSITION_EPSILON) {
      viewport.scrollTop = nextScrollTop;
      commitScrollState();
      return;
    }

    if (autoscrollingFlag) {
      setAutoScrolling(true);
    }

    viewport.scrollTo({ top: nextScrollTop, behavior });
    scheduleStateCommit();
  }

  function scrollToStart({ behavior = "auto" }: MessageScrollerScrollOptions = {}) {
    if (!viewport) return false;

    setTailSpacerHeight(0);
    streamingTurn = null;
    mode = "free-scrolling";
    scrollToPosition(0, { behavior });
    scheduleVisibilitySync();

    return true;
  }

  function scrollToEnd({ behavior = "auto" }: MessageScrollerScrollOptions = {}) {
    if (!viewport) return false;

    setTailSpacerHeight(0);
    streamingTurn = null;
    mode = autoScroll ? "following-bottom" : "free-scrolling";
    scrollToPosition(getMaxScrollTop(viewport), { autoscrollingFlag: true, behavior });
    scheduleVisibilitySync();

    return true;
  }

  function scrollToElement(
    element: HTMLElement,
    { align = "start", behavior = "auto", scrollMargin: marginOverride = scrollMargin }: MessageScrollerScrollOptions = {},
    { keepPreviousPeek = false }: { keepPreviousPeek?: boolean } = {},
  ) {
    if (!content || !viewport || !content.contains(element)) return false;

    const scrollTop = getElementScrollTop({
      align,
      element,
      scrollMargin: keepPreviousPeek ? marginOverride + scrollPreviousItemPeek : marginOverride,
      spacer,
      viewport,
    });

    const nextSpacerHeight = getTailSpacerHeight({ content, scrollTop, spacer, viewport });

    setTailSpacerHeight(nextSpacerHeight);
    prependRestore = { element, viewportTop: getElementViewportTop(element, viewport) };

    mode = keepPreviousPeek ? "anchored-to-message" : "settling-jump";
    streamingTurn = keepPreviousPeek ? element : null;

    scrollToPosition(scrollTop, { behavior });
    scheduleVisibilitySync();

    return true;
  }

  function reanchorToAnchoredMessage() {
    const element = streamingTurn;

    if (!element || !element.isConnected || mode !== "anchored-to-message") {
      return false;
    }

    return scrollToElement(element, { align: "start" }, { keepPreviousPeek: true });
  }

  function scrollToMessage(messageId: string, scrollOptions?: MessageScrollerScrollOptions) {
    const element = messageElements.get(messageId);

    if (!element) {
      if (itemCount === 0) {
        pendingScrollToMessage = { messageId, options: scrollOptions };
        defaultScrollPositionApplied = true;
        return true;
      }
      return false;
    }

    defaultScrollPositionApplied = true;

    if (scrollToElement(element, scrollOptions)) {
      pendingScrollToMessage = null;
      return true;
    }

    pendingScrollToMessage = { messageId, options: scrollOptions };
    return true;
  }

  function flushPendingScrollToMessage() {
    const pending = pendingScrollToMessage;
    if (!pending) return false;

    const element = messageElements.get(pending.messageId);
    if (!element) return false;

    const handled = scrollToElement(element, pending.options);
    if (!handled) return false;

    pendingScrollToMessage = null;
    defaultScrollPositionApplied = true;
    return true;
  }

  // --- prepend anchoring ---
  function restorePrependedAnchor() {
    const anchor = prependRestore;

    if (!anchor || !viewport || !anchor.element.isConnected) {
      return false;
    }

    const nextViewportTop = getElementViewportTop(anchor.element, viewport);
    const delta = nextViewportTop - anchor.viewportTop;

    if (Math.abs(delta) <= SCROLL_POSITION_EPSILON) {
      return false;
    }

    viewport.scrollTop += delta;
    anchor.viewportTop = getElementViewportTop(anchor.element, viewport);
    scheduleStateCommit();
    scheduleVisibilitySync();

    return true;
  }

  function capturePrependAnchor() {
    if (!content || !viewport) {
      prependRestore = null;
      return;
    }

    const anchor = getFirstVisibleMessageItem({ content, spacer, viewport });

    prependRestore = anchor ? { element: anchor, viewportTop: getElementViewportTop(anchor, viewport) } : null;
  }

  function schedulePendingScrollToMessageFlush() {
    if (pendingScrollFrame !== null) return;

    pendingScrollFrame = window.requestAnimationFrame(() => {
      pendingScrollFrame = null;
      if (flushPendingScrollToMessage()) {
        capturePrependAnchor();
      }
    });
  }

  function applyDefaultScrollPosition() {
    if (!defaultScrollPosition || defaultScrollPositionApplied || itemCount === 0) {
      return false;
    }

    let handled = false;

    if (defaultScrollPosition === "last-anchor") {
      const anchor = content && viewport ? getLastScrollAnchor(getMessageScrollerItems(content, spacer)) : null;

      if (!content || !viewport || !anchor) {
        handled = scrollToEnd({ behavior: "auto" });
      } else {
        const anchorTop = getElementTop(anchor, viewport);
        const contentBottom = getContentBottom({ content, spacer, viewport });
        const lastTurnFits = contentBottom - anchorTop <= viewport.clientHeight;

        handled = lastTurnFits ? scrollToEnd({ behavior: "auto" }) : scrollToElement(anchor, { align: "start" }, { keepPreviousPeek: true });
      }
    } else {
      handled = defaultScrollPosition === "end" ? scrollToEnd({ behavior: "auto" }) : scrollToStart({ behavior: "auto" });
    }

    if (!handled) return false;

    defaultScrollPositionApplied = true;
    return true;
  }

  function handleContentChange() {
    if (!content) return;

    const items = getMessageScrollerItems(content, spacer);
    const previousItemCount = itemCount;
    const previousFirstItem = firstItem;

    itemCount = items.length;
    firstItem = items[0] ?? null;

    function reconcileScrollPosition() {
      if (flushPendingScrollToMessage()) return;

      if (previousItemCount === 0) {
        if (applyDefaultScrollPosition()) return;

        if (items.length > 0 && autoScroll && scrollToEnd({ behavior: "auto" })) return;

        commitScrollState();
        scheduleVisibilitySync();
        return;
      }

      const previousFirstItemIndex = previousFirstItem ? items.indexOf(previousFirstItem) : -1;
      const didPrepend = preserveScrollOnPrepend && previousFirstItemIndex > 0;

      if (didPrepend) {
        restorePrependedAnchor();
        return;
      }

      if (items.length > previousItemCount) {
        const anchor = getNewScrollAnchor(items, previousItemCount);

        if (anchor) {
          if (autoScroll && mode === "following-bottom" && hasMultipleNewScrollAnchors(items, previousItemCount)) {
            scrollToEnd({ behavior: "auto" });
            return;
          }

          scrollToElement(anchor, { align: "start" }, { keepPreviousPeek: true });
          handledScrollAnchors.add(anchor);
          return;
        }
      }

      if (items.length === previousItemCount) {
        const anchor = getUnanchoredScrollAnchor(items, handledScrollAnchors);

        if (anchor) {
          scrollToElement(anchor, { align: "start" }, { keepPreviousPeek: true });
          handledScrollAnchors.add(anchor);
          return;
        }
      }

      if (mode === "following-bottom" && autoScroll) {
        scrollToEnd({ behavior: "auto" });
      } else {
        commitScrollState();
        scheduleVisibilitySync();
      }
    }

    reconcileScrollPosition();
    capturePrependAnchor();
  }

  function handleResize() {
    if (mode === "following-bottom" && autoScroll) {
      scrollToEnd({ behavior: "auto" });
      return;
    }

    const previousSpacerHeight = spacerHeight;

    if (reanchorToAnchoredMessage()) {
      if (autoScroll && previousSpacerHeight > 0 && spacerHeight === 0) {
        scrollToEnd({ behavior: "auto" });
      }
      return;
    }

    scheduleStateCommit();
    scheduleVisibilitySync();
  }

  function observeVisibility() {
    if (!viewport || !visibilityStore.hasListeners()) return;

    if (typeof IntersectionObserver === "undefined") {
      scheduleVisibilitySync();
      return;
    }

    if (!visibilityObserver) {
      visibilityObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const messageId = (entry.target as HTMLElement).dataset.messageId;
            if (!messageId) continue;

            if (entry.isIntersecting) {
              visibleMessageIds.add(messageId);
            } else {
              visibleMessageIds.delete(messageId);
            }
          }

          scheduleVisibilitySync();
        },
        {
          root: viewport,
          rootMargin: `${-(scrollMargin + scrollPreviousItemPeek)}px 0px 0px 0px`,
          threshold: [0, 0.01, 0.5, 1],
        },
      );
    }

    messageElements.forEach((element) => {
      visibilityObserver?.observe(element);
    });
    scheduleVisibilitySync();
  }

  function unobserveVisibility() {
    if (visibilityFrame !== null) {
      window.cancelAnimationFrame(visibilityFrame);
      visibilityFrame = null;
    }

    visibilityObserver?.disconnect();
    visibilityObserver = null;
    visibleMessageIds.clear();
    visibilityStore.setSnapshot(EMPTY_MESSAGE_SCROLLER_VISIBILITY_STATE);
  }

  function registerMessage(messageId: string, element: HTMLElement | null, removedElement?: HTMLElement | null) {
    if (element) {
      messageElements.set(messageId, element);
      visibilityObserver?.observe(element);
      scheduleVisibilitySync();

      if (pendingScrollToMessage?.messageId === messageId) {
        schedulePendingScrollToMessageFlush();
      }
      return;
    }

    if (removedElement && messageElements.get(messageId) === removedElement) {
      messageElements.delete(messageId);
      visibleMessageIds.delete(messageId);
      visibilityObserver?.unobserve(removedElement);
      scheduleVisibilitySync();
    }
  }

  function userScrollIntent() {
    if (mode === "following-bottom" || mode === "anchored-to-message" || mode === "settling-jump") {
      streamingTurn = null;
      mode = "free-scrolling";
    }
  }

  function mirrorStateAttributes() {
    writeStateAttributes(stateStore.getSnapshot());
  }

  function setRootElement(element: HTMLElement | null) {
    root = element;
    if (element) mirrorStateAttributes();
  }

  function setViewportElement(element: HTMLElement | null) {
    viewport = element;
    if (element) mirrorStateAttributes();
  }

  function setContentElement(element: HTMLElement | null) {
    content = element;
  }

  function setSpacerElement(element: HTMLElement | null) {
    spacer = element;
    spacerGap = getFlexGap(element?.parentElement ?? null);
  }

  function setPreserveScrollOnPrepend(next: boolean) {
    preserveScrollOnPrepend = next;
  }

  function syncAfterScroll() {
    commitScrollState();
    scheduleVisibilitySync();
    capturePrependAnchor();
  }

  function setAutoScroll(next: boolean) {
    autoScroll = next;
  }

  function setDefaultScrollPosition(next: MessageScrollerDefaultScrollPosition) {
    if (defaultScrollPosition !== next) {
      defaultScrollPosition = next;
      defaultScrollPositionApplied = false;
    }
  }

  // Mirrors the source's `useLayoutEffect(() => applyDefaultScrollPosition(), [...])`
  // + the mount-time autoScroll layout effect. Call once the root/viewport/
  // content elements have all attached (see message-scroller-provider.marko).
  function init() {
    applyDefaultScrollPosition();

    if (autoScroll && mode === "following-bottom" && itemCount > 0) {
      scrollToEnd({ behavior: "auto" });
      return;
    }

    commitScrollState();
  }

  // Mirrors the source's controller-level cleanup effect (StrictMode-safe
  // frame/timeout teardown). Call from the provider's `<lifecycle>` cleanup.
  function dispose() {
    if (stateFrame !== null) {
      window.cancelAnimationFrame(stateFrame);
      stateFrame = null;
    }
    if (visibilityFrame !== null) {
      window.cancelAnimationFrame(visibilityFrame);
      visibilityFrame = null;
    }
    if (autoscrollingTimeout !== null) {
      window.clearTimeout(autoscrollingTimeout);
      autoscrollingTimeout = null;
    }
    if (pendingScrollFrame !== null) {
      window.cancelAnimationFrame(pendingScrollFrame);
      pendingScrollFrame = null;
    }
    visibilityObserver?.disconnect();
    visibilityObserver = null;
  }

  return {
    // element registration
    setRootElement,
    setViewportElement,
    setContentElement,
    setSpacerElement,
    setPreserveScrollOnPrepend,
    registerMessage,
    // lifecycle
    init,
    dispose,
    // event entry points (wired to native listeners by the parts)
    handleContentChange,
    handleResize,
    syncAfterScroll,
    userScrollIntent,
    observeVisibility,
    unobserveVisibility,
    // commands
    scrollToStart,
    scrollToEnd,
    scrollToMessage,
    // config setters (mirror React prop changes)
    setAutoScroll,
    setDefaultScrollPosition,
    // stores
    stateStore,
    visibilityStore,
  };
}

export type MessageScrollerController = ReturnType<typeof createMessageScrollerController>;

/** Getter contract passed from `<message-scroller-provider>` to every part —
 * a template closure, so tag input stays serializable (the controller itself
 * is a plain object full of functions and must never cross a tag boundary). */
export type MessageScrollerControllerGetter = () => MessageScrollerController;

/** Per-provider holder the lazy getter closes over; serializes as `{ current: null }`
 * during SSR because the controller is only created in the browser. */
export function createMessageScrollerControllerHolder(): {
  current: MessageScrollerController | null;
} {
  return { current: null };
}
