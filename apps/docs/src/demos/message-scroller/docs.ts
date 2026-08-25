// Hand-authored prose + example ordering for /docs/components/message-scroller.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
//
// Upstream source: data/shadcn-ui/apps/v4/content/docs/components/base/message-scroller.mdx
// ("A chat scroll container that anchors turns, opens saved transcripts,
// follows streamed responses, loads history without jumping, and jumps to
// any message."). Composition and Accessibility prose below is adapted from
// that MDX's "Composition" and "Accessibility" sections; Concepts is
// adapted from "Core Concepts", condensed to a short mental-model paragraph
// per notes/docs-canonical-structure.md (Concepts stays rare/short).
import type { ComponentDocs } from "../docs-types.ts";

// BLOCKED (parity — missingMappedTargets: "Core Concepts"): upstream's
// heading is literally "## Core Concepts" (base/message-scroller.mdx), whose
// normalized slug is "core-concepts". tooling/parity/section-map.ts maps
// `"core-concepts": [{ action: "keep" }]` — "keep" resolves to
// `target = { parent: [], title: originalHeading }` (coverage.ts's
// resolveTarget), i.e. canonical bucket = "Core Concepts" itself (parent is
// empty, so `target.parent[0] ?? target.title` falls to `target.title`).
// `ourSectionsFor` (same file) and +page.marko only ever render a heading
// titled "Concepts" (singular, no "Core"), driven by the `concepts` field
// below — so neither the canonical-bucket check nor the mapped-title/
// original-heading fallback in `isTargetPresent` can match "Core Concepts".
// This looks like a section-map.ts authoring bug (compare: every OTHER
// canonical-bucket "keep" entry — installation/usage/api-reference/
// accessibility/changelog/styling/anatomy — has a slug that's already
// identical to the bucket name it's supposed to represent; "core-concepts"
// is the one entry whose slug does NOT match our page's actual bucket name
// "Concepts", so `keep` silently can never satisfy it. The fix, if it were
// in scope, would be `"core-concepts": [{ action: "move", parent:
// ["concepts"] }]` to route it into the "concepts" canonical bucket like
// every other non-identical-slug entry does) rather than a docs gap — but
// tooling/parity/section-map.ts is out of this task's file territory
// (apps/docs/src/demos/<component>/ only), so it can't be fixed here. The
// upstream "Core Concepts" content IS fully ported below into `concepts`
// (condensed per notes/docs-canonical-structure.md), so nothing is missing
// from the reader's perspective — only the checker's presence match, which
// is looking for a heading this page's fixed section skeleton can't
// produce under that exact title.
export const docs: ComponentDocs = {
  description:
    "A chat scroll container that anchors turns, opens saved transcripts, follows streamed responses, loads history without jumping, and jumps to any message.",
  usageTags: `<MessageScrollerProvider>`,
  importSnippet: `import MessageScrollerProvider from "@/components/ui/message-scroller/message-scroller-provider.marko";
import MessageScroller from "@/components/ui/message-scroller/message-scroller.marko";
import MessageScrollerViewport from "@/components/ui/message-scroller/viewport.marko";
import MessageScrollerContent from "@/components/ui/message-scroller/content.marko";
import MessageScrollerItem from "@/components/ui/message-scroller/item.marko";
import MessageScrollerButton from "@/components/ui/message-scroller/button.marko";`,
  usageSnippet: `<MessageScrollerProvider|controller|>
  <MessageScroller controller=controller>
    <MessageScrollerViewport controller=controller>
      <MessageScrollerContent controller=controller>
        <for|message| of=messages by=(message) => message.id>
          <MessageScrollerItem
            controller=controller
            messageId=message.id
            scrollAnchor=(message.role === "user")
          >
            <!-- your message row -->
          </MessageScrollerItem>
        </for>
      </MessageScrollerContent>
    </MessageScrollerViewport>
    <MessageScrollerButton controller=controller/>
  </MessageScroller>
</MessageScrollerProvider>`,
  concepts:
    "MessageScroller is built around a few ideas: an anchor is the row (marked with scrollAnchor) that a new turn should settle near the top under, independent of message role. autoScroll follows the live edge only while the reader is already there — any scroll away is a deliberate opt-out, and MessageScrollerButton offers a way back. defaultScrollPosition controls where a saved thread opens (\"start\", \"end\", or \"last-anchor\" — the last anchored turn, the best default for reopening a conversation). preserveScrollOnPrepend keeps the reader's row in place when older history loads above them. All of this is tracked imperatively — scroll position, anchoring, and follow-output never trigger row rerenders — so MessageScroller stays fast in long transcripts.",
  composition:
    "MessageScrollerProvider is the headless root: it owns scroll state and the behavior props for opening position, auto-scroll, anchoring, scroll commands, and visibility tracking. It exposes a controller GETTER to its content body (this port's stand-in for upstream's React context / useMessageScroller hooks — see the Concepts section and the demos below for how it's used to drive the transcript from outside the scroller's own markup). MessageScroller is the styled frame that lays out the viewport, content, and controls inside the provider. MessageScrollerViewport is the scrollable element: it receives native scroll events and preserves the visible row when older messages are prepended. MessageScrollerContent is the transcript container: it holds the rows and provides the live-region defaults for new messages. MessageScrollerItem is the transcript row boundary — wrap every direct child of the content so the scroller can measure, anchor, preserve position, track visibility, and jump to it; an item can be a message, marker, typing indicator, separator, join/leave event, or \"load earlier\" row. MessageScrollerButton is the scroll control: it scrolls to the start or end of the transcript and is inert until there is content in its direction. Every part takes the `controller` getter as an explicit input — this port's substitute for the upstream React context boundary (Marko has no context primitive).",
  examples: [
    {
      name: "message-scroller-demo",
      title: "Demo",
      description: "A scripted chat with autoScroll enabled — send a message, the reply arrives, and the viewport follows the live edge.",
    },
    {
      name: "message-scroller-anchoring",
      title: "Anchoring Turns",
      description: "Toggle which role becomes the scroll anchor, then send scripted turns to see the selected role settle near the top edge.",
    },
    {
      name: "message-scroller-group-chat",
      title: "Group Chat",
      description: "Anchoring is role-independent — a join-event Marker can be the scrollAnchor for the next turn just as easily as a message.",
    },
    {
      name: "message-scroller-previous-context",
      title: "Keeping Context Visible",
      description: "Adjust scrollPreviousItemPeek to control how much of the previous turn stays visible above a newly anchored row.",
    },
    {
      name: "message-scroller-streaming",
      title: "Following the Live Edge",
      description: "With autoScroll enabled, the viewport keeps pace with scripted replies while the reader is at the bottom, and backs off the moment they scroll away.",
    },
    {
      name: "message-scroller-opening-position",
      title: "Opening Saved Threads",
      description: "Switch defaultScrollPosition between start, end, and last-anchor to see where a reopened transcript lands.",
    },
    {
      name: "message-scroller-load-history",
      title: "Loading Earlier Messages",
      description: "Prepending older messages preserves the reader's current row via preserveScrollOnPrepend, enabled by default.",
    },
    {
      name: "message-scroller-animation",
      title: "Animating New Messages",
      description: "Pick an entrance preset, then send a message to see the new row animate in without disturbing the scroller's positioning work.",
    },
    {
      name: "message-scroller-commands",
      title: "Jumping to Messages",
      description: "A dropdown menu drives the transcript from outside MessageScroller's own markup, using the controller getter's scrollToMessage command.",
    },
    {
      name: "message-scroller-visibility",
      title: "Tracking the Reader's Position",
      description: "A hover-card outline highlights the current anchored turn, driven by the controller's visibility tracking.",
    },
    {
      name: "message-scroller-scrollable",
      title: "Reading Scroll State",
      description: "A footer reports which edges are still scrollable, driven by the controller's scroll-state store.",
    },
  ],
  accessibilityNotes: [
    "MessageScrollerViewport is a labelled, keyboard-focusable scroll region by default: it uses role=\"region\", aria-label=\"Messages\", and tabindex=\"0\", so keyboard users can focus the transcript and scroll it directly.",
    "MessageScrollerContent marks the transcript as a live region with role=\"log\" and aria-relevant=\"additions\". New rows can be announced, but streamed text mutations do not have to be announced token by token — pass aria-busy while a turn is still arriving if announcements should wait for the completed row.",
    "MessageScrollerButton renders a real button. When there is nothing to scroll toward, it sets inert, uses tabindex=\"-1\", and exposes data-active=\"false\" so inactive scroll controls do not create extra focus stops.",
  ],
};
