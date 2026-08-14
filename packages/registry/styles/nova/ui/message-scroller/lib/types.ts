// Port of the shadcn `@shadcn/react/message-scroller` package's `types.ts`,
// trimmed to the framework-agnostic subset the Marko controller needs
// (React-specific context/store/ref types are dropped — Marko has no
// context primitive, see controller.ts's header comment for how state
// threading is redone).

// Default scrollEdgeThreshold. Sub-pixel tolerance so edge detection does not
// flicker across engines that round scrollTop differently.
export const DEFAULT_SCROLL_EDGE_THRESHOLD = 8;

// Default scrollPreviousItemPeek. Pixels of the previous item kept visible
// above a newly anchored row.
export const DEFAULT_SCROLL_PREVIOUS_ITEM_PEEK = 64;

// Default scrollMargin for scrollToMessage and programmatic targets.
export const DEFAULT_SCROLL_MARGIN = 0;

// Two fractional scrollTop values within this range are treated as equal, to
// absorb zoom and HiDPI rounding drift.
export const SCROLL_POSITION_EPSILON = 0.5;

// How long (ms) data-autoscrolling stays set during a programmatic smooth
// scroll before clearing.
export const AUTOSCROLLING_CLEAR_DELAY = 180;

// Viewport keys that count as deliberate scroll intent and release
// follow-bottom.
export const USER_SCROLL_KEYS = new Set(["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "]);

// Internal scroll mode. Derived from intent and commands; decides how the
// viewport reacts to content and resize.
export type MessageScrollerMode =
  | "following-bottom" // autoScroll on, pinned to the latest message.
  | "free-scrolling" // reader scrolled away; position left alone (prepends still preserved).
  | "anchored-to-message" // holding a turn at the reading line while it streams.
  | "settling-jump"; // a programmatic jump is animating; intent detection suppressed until it settles.

// Where a saved transcript opens on the first non-empty render.
export type MessageScrollerDefaultScrollPosition = "start" | "end" | "last-anchor";

// Which transcript edge MessageScrollerButton scrolls toward.
export type MessageScrollerButtonDirection = "start" | "end";

// Viewport alignment for scrollToMessage and programmatic jumps.
export type MessageScrollerScrollAlign = "start" | "center" | "end" | "nearest";

// Options for scrollToMessage, scrollToEnd, and scrollToStart.
export type MessageScrollerScrollOptions = {
  align?: MessageScrollerScrollAlign;
  behavior?: ScrollBehavior;
  scrollMargin?: number;
};

// Scroll snapshot: which edges the viewport can still scroll toward.
export type MessageScrollerScrollable = {
  start: boolean;
  end: boolean;
};

// Visibility snapshot.
export type MessageScrollerVisibilityState = {
  currentAnchorId: string | null;
  visibleMessageIds: string[];
};

export const EMPTY_MESSAGE_SCROLLER_SCROLLABLE: MessageScrollerScrollable = {
  start: false,
  end: false,
};

export const EMPTY_VISIBLE_MESSAGE_IDS: string[] = [];

export const EMPTY_MESSAGE_SCROLLER_VISIBILITY_STATE: MessageScrollerVisibilityState = {
  currentAnchorId: null,
  visibleMessageIds: EMPTY_VISIBLE_MESSAGE_IDS,
};
