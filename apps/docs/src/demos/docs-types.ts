// Shape of every `src/demos/<component>/docs.ts` module. Authored by hand,
// one per documented component; the generated demos-manifest.ts pairs each
// example name with its .marko component and raw source text.

export interface ComponentDocsExample {
  /** Basename of the sibling .marko demo file, without the extension. */
  name: string;
  /** Section heading on the component page (also used for the TOC entry). */
  title: string;
  /** One sentence of prose above the preview. Inline `code` spans are rendered. */
  description?: string;
}

export interface ComponentDocs {
  /** Page subtitle. Falls back to the registry.meta.json description if omitted. */
  description?: string;
  /** The single import line shown under "Usage". */
  importSnippet: string;
  /** A minimal usage snippet shown under "Usage". */
  usageSnippet: string;
  /** Examples in page order. The first one is also the hero preview. */
  examples: ComponentDocsExample[];
}
