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
  /** Tag names available without an import once the taglib is registered. */
  usageTags: string;
  /** Explicit-import form — the documented override/escape hatch. */
  importSnippet: string;
  /** A minimal usage snippet shown under "Usage". */
  usageSnippet: string;
  /**
   * Examples in page order, rendered as `###` subsections under one parent
   * "Examples" heading (canonical docs hierarchy). The first one is also the
   * hero preview.
   */
  examples: ComponentDocsExample[];
  /**
   * Optional "Concepts" prose — a short mental model to read before using the
   * component. Reserved for complex, multi-part components; most pages omit
   * this (see notes/docs-canonical-structure.md).
   */
  concepts?: string;
  /**
   * Optional "Composition" prose for single-file components whose anatomy is
   * expressed through slots/render-props rather than separate .marko parts —
   * upstream still documents a Composition tree for these (e.g. tooltip's
   * Tooltip/TooltipTrigger/TooltipContent), but api-reference.json only sees
   * one part, so `isCompound` is false and the auto-generated
   * `<composition-tree>` (driven by parts.length > 1) never renders. Rendered
   * as its own "Composition" section when `isCompound` is false; compound
   * components keep using the auto-generated tree instead of this field.
   */
  composition?: string;
  /**
   * Optional keyboard-interaction table for the Accessibility section. Native
   * form controls with no custom keyboard behavior can omit this — the
   * section still renders with `notes` alone, or is skipped entirely when
   * both are empty.
   */
  accessibilityKeyboard?: { keys: string; description: string }[];
  /** Optional freeform accessibility notes, rendered as a bullet list. */
  accessibilityNotes?: string[];
}
