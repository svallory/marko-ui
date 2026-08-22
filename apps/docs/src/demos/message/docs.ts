// Hand-authored prose + example ordering for /docs/components/message.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
//
// Upstream source: .upstream/shadcn-ui/apps/v4/content/docs/components/base/message.mdx
// ("Displays a message in a conversation, with optional avatar, header,
// footer, and alignment."). Composition is adapted from that MDX's
// "Composition" section; Accessibility is adapted from its "Accessibility"
// section. Our Message/MessageAvatar/MessageContent/MessageHeader/
// MessageFooter/MessageGroup API matches upstream's prop-for-prop
// (align/className only) — no deviations to disclose here.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "Displays a message in a conversation, with optional avatar, header, footer, and alignment.",
  usageTags: `<Message>`,
  importSnippet: `import Avatar from "@/components/ui/avatar/avatar.marko";
import Bubble from "@/components/ui/bubble/bubble.marko";
import BubbleContent from "@/components/ui/bubble/bubble-content.marko";
import Message from "@/components/ui/message/message.marko";
import MessageAvatar from "@/components/ui/message/avatar.marko";
import MessageContent from "@/components/ui/message/content.marko";`,
  usageSnippet: `<Message>
  <MessageAvatar>
    <Avatar src="https://github.com/shadcn.png" alt="@shadcn" fallback="CN"/>
  </MessageAvatar>
  <MessageContent>
    <Bubble>
      <BubbleContent>How can I help you today?</BubbleContent>
    </Bubble>
  </MessageContent>
</Message>`,
  composition: `\`Message\` owns the row layout: avatar, alignment, header, and footer. Render
the visible message surface inside it with
[\`Bubble\`](/docs/components/bubble). For the scroll container around a whole
conversation, use [\`MessageScroller\`](/docs/components/message-scroller).

\`\`\`text
Message
├── MessageAvatar
└── MessageContent
    ├── MessageHeader
    ├── Bubble
    └── MessageFooter
\`\`\`

Use \`MessageGroup\` to stack consecutive messages from the same sender:

\`\`\`text
MessageGroup
├── Message
└── Message
\`\`\``,
  examples: [
    {
      name: "message-demo",
      title: "Demo",
      description: "A short exchange combining alignment, a footer status, a grouped reply with a reaction, and a typing `Marker`.",
    },
    {
      name: "message-avatar",
      title: "Avatar",
      description: "`MessageAvatar` renders next to the message; set `align=\"end\"` on `Message` to move the avatar to the end of the row.",
    },
    {
      name: "message-group",
      title: "Group",
      description: "`MessageGroup` stacks consecutive messages from the same sender. Render an empty `MessageAvatar` on the earlier messages to keep them aligned with the avatar on the last one.",
    },
    {
      name: "message-header-footer",
      title: "Header and Footer",
      description: "`MessageHeader` renders a sender name; `MessageFooter` renders metadata such as a delivery or read status.",
    },
    {
      name: "message-actions",
      title: "Actions",
      description: "Place message-level actions in `MessageFooter`, such as copy, like, dislike, or retry buttons.",
    },
    {
      name: "message-attachment",
      title: "Attachment",
      description: "Pair `Message` with [`Attachment`](/docs/components/attachment) to show images and files alongside a bubble.",
    },
  ],
  accessibilityNotes: [
    "`Message` is a presentational layout wrapper. Accessibility comes from the content you place inside it.",
    "Action buttons in `MessageFooter` are usually icon-only, so give each one an `aria-label` (see the Actions example).",
    "For in-progress messages, use [`Marker`](/docs/components/marker) with `role=\"status\"` so assistive tech announces the update as it appears (see the Demo example's typing indicator).",
  ],
};
