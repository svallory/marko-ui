// Hand-authored prose + example ordering for /docs/components/sidebar.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A composable, collapsible side navigation panel built from a provider, a sidebar shell, and header/content/footer/menu parts.",
  importSnippet: `import SidebarProvider from "@/components/ui/sidebar/provider.marko";
import Sidebar from "@/components/ui/sidebar/sidebar.marko";`,
  usageSnippet: `<SidebarProvider>
  <@sidebar|{ open, toggle }|>
    <Sidebar open=open>...</Sidebar>
  </@sidebar>
  <@content|{ open, toggle }|>
    <SidebarTrigger open=open toggle=toggle/>
  </@content>
</SidebarProvider>`,
  examples: [
    {
      name: "sidebar-demo",
      title: "Basic",
      description:
        "A provider wrapping a sidebar shell (header, content, footer) and a main content area, joined by a trigger.",
    },
    {
      name: "sidebar-controlled",
      title: "Controlled",
      description:
        "SidebarProvider is controlled: pass `open` alongside `openChange` to own the state outside the component, or omit both for uncontrolled behavior (defaults to open).",
    },
  ],
};
