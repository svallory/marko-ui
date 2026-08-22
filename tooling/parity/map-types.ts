/**
 * map-types.ts — types for `tooling/parity/section-map.ts`, the typed
 * TypeScript module that replaces the old JSON `section-map.json`.
 *
 * This file is the shared contract between the CHECKER (`coverage.ts`'s
 * presence assertions) and a future PORTER (how content transforms, via
 * `process`). See `tooling/parity/SCHEMA.md`'s "section-map.ts — the map
 * schema" section for the full narrative — this file's JSDoc is the
 * per-symbol reference; SCHEMA.md governs on any conflict.
 *
 * Converting the map from JSON to TS moves a whole class of validation
 * (unknown action names, missing required fields, malformed shapes) from
 * a runtime check in `coverage.ts` to a compile-time `tsc` error — see
 * `bun run check:tooling`. Runtime validation in `coverage.ts` still
 * enforces the SEMANTIC rules `tsc` cannot express (an entry's `ignore`
 * action must be sole; at most one placement action per array; at most
 * one no-`when` default variant).
 */

/**
 * The context a section's `when` predicate (in a {@link MapVariant}) and a
 * `process` action's `fn` (in {@link MapAction}) are evaluated against.
 * One `SectionContext` is built per upstream section instance — the same
 * heading can appear on multiple component pages with different context.
 */
export interface SectionContext {
  /** The component slug this section came from, e.g. "combobox". */
  component: string
  /** The raw upstream heading text, e.g. "Custom Items". */
  heading: string
  /** `normalizeName(heading)` — case/kebab/punctuation-insensitive slug, e.g. "custom-items". */
  headingSlug: string
  /** True if this section's body matches the adapter's demo-marker pattern (see `adapter-shadcn.ts`'s `bodyMatchesDemoMarker`). */
  hasDemoMarker: boolean
  /** The section's raw MDX body text (heading to next `##`/`###`), when available to the caller. Optional because some callers (e.g. `when` predicates evaluated ahead of a body read) may not have it. */
  body?: string
}

/**
 * One action to apply to a mapped upstream section. An entry
 * ({@link SectionMapEntry}) is an array of these — a placement action
 * (`move`/`rename`/`keep`) says WHERE the content should live in our
 * canonical hierarchy; `ignore` says to drop the section from
 * consideration entirely (must be the sole action in its array); `process`
 * is an optional, additive porter-transform hint.
 */
export type MapAction =
  | {
      /** Places the section's content under a canonical bucket path, e.g. `parent: ["styling", "recipes"]`. */
      action: "move"
      /** Canonical bucket path this section's content should live under, e.g. `["styling"]` or `["styling", "recipes"]`. An empty array plus an identity/omitted `title` is a no-op at root — prefer `keep` for that case. */
      parent: string[]
      /** Display title override. Defaults to the original upstream heading when omitted. */
      title?: string
    }
  | {
      /** Keeps the section at root, under a new display title. */
      action: "rename"
      /** The new display title. */
      title: string
    }
  | {
      /** Keeps the section at root, under its own (original) name. The documented spelling for a `move` with `parent: []` and an identity title. */
      action: "keep"
    }
  | {
      /** Drops the section from all further consideration — not presence-checked, not unclassified. Must be the SOLE action in its `MapAction[]` array. */
      action: "ignore"
      /** Why this section is ignored — required; this map is a review record, not just a rule table. */
      reason: string
    }
  | {
      /** An optional, additive porter-transform hint — composes with a placement action in the same array (placement says where, `process` says how to transform on the way in). Absence of a `process` action means "as-is" (no transform). */
      action: "process"
      /** Hand the section to an LLM for transformation, guided by the default prompt in `process-prompt.md` plus this action's optional `prompt`. */
      mode: "llm"
      /** Section-specific guidance APPENDED to the default prompt in `process-prompt.md` — never a replacement for it. See that file's "Composition rule". */
      prompt?: string
    }
  | {
      /**
       * Hand the section to a registered, typed transform function instead
       * of an LLM. Unlike `mode: "llm"`, this mode is fully deterministic
       * and requires no external call. `coverage.ts` still only RECORDS
       * `process` actions (of either mode) for reporting — it never
       * invokes `fn`; a future porter step is responsible for calling it.
       */
      action: "process"
      mode: "function"
      /** The transform: given the section's raw content and its {@link SectionContext}, returns the transformed content. */
      fn: (content: string, ctx: SectionContext) => string
    }

/**
 * A conditional group of actions within a {@link SectionMapEntry} — lets
 * one upstream heading resolve to different {@link MapAction}s depending on
 * which component/context it came from (the same heading text can mean
 * different things on different component pages).
 *
 * Variants are matched in array order; the first variant whose `when`
 * predicate returns true (or which has no `when` at all) wins. A variant
 * with no `when` is the default — matches unconditionally, so it should
 * be last. At most one such no-`when` default is allowed per entry
 * (enforced at runtime by `coverage.ts`'s `validateMapEntry` — two
 * defaults is ambiguous).
 */
export interface MapVariant {
  /**
   * Predicate deciding whether this variant applies to a given section
   * instance. Omit for the default (always-match) variant. Evaluated by
   * `coverage.ts` with a try/catch — a throwing predicate is a hard error
   * naming the offending heading slug, not a silently skipped variant.
   */
  when?: (ctx: SectionContext) => boolean
  /** Same per-array validation rules as the plain {@link MapAction}[] form: at most one placement action; `ignore` must be sole. */
  actions: MapAction[]
}

/**
 * One map entry's value: either the plain, common-case form (a flat list
 * of actions applied unconditionally) or an array of {@link MapVariant}
 * for headings whose correct treatment depends on context. Reach for
 * `MapVariant[]` only when one heading genuinely needs different
 * treatment per component — most entries never need it.
 */
export type SectionMapEntry = MapAction[] | MapVariant[]

/**
 * The full section map: upstream heading slug (as produced by
 * `coverage.ts`'s `normalizeName`) → {@link SectionMapEntry}. This is the
 * shape `tooling/parity/section-map.ts` exports as its `default`, and
 * what `tooling/parity/section-map.proposed.json` (LLM-authored proposals,
 * which stays JSON) has the same logical shape as — see SCHEMA.md's
 * "JSON proposals → TS promotion" for how a proposed entry's declarative
 * `when` object is converted into a predicate on promotion.
 */
export type SectionMap = Record<string, SectionMapEntry>

/**
 * Identity function for `tooling/parity/section-map.ts`'s default export —
 * wrapping the map literal in `defineSectionMap({...})` buys no runtime
 * behavior, only TypeScript inference: it lets each entry's `action`
 * strings and `when` predicates narrow correctly against {@link MapAction}
 * and {@link MapVariant} without an explicit `: SectionMap` annotation
 * widening literal types away.
 */
export function defineSectionMap(map: SectionMap): SectionMap {
  return map
}
