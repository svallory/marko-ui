import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { DOCUMENTED_COMPONENTS } from "../component-page-data.ts";
import {
  renderComponentDocs,
  type ComponentDocs,
} from "../../../../../packages/marko-ui/src/docs/index";

/**
 * A2: the flags and the heroes are the brief's rule, checked against the demo
 * SOURCES rather than against a claim in a report.
 *
 * Both defects round 3 found were the same shape — a flag or a hero that a
 * reader would copy and that does not do what its title says. So:
 * - every `essential: true` names a demo that EXISTS (round 2's report claimed
 *   `command-basic` was flagged; the file had only the comment);
 * - no hero sets a CONTROLLED value with no handler, which freezes the
 *   control and teaches the opposite of what it shows;
 * - the hero is a short example, so a 100-line showcase is never the first
 *   thing an agent reads.
 */
const DEMOS = new URL("../../../src/demos/", import.meta.url);

/**
 * A CONTROLLED prop set to a literal, ON THE DEMO'S OWN ROOT TAG:
 * `value="comfortable"`, `value=["a"]`, `open`.
 *
 * Scoped to the root on purpose. `value=` on a NESTED control is that
 * control's initial value, not a frozen one — `<TextInput value="Pedro"/>` in
 * a dialog demo is a form field's initial value and freezing it freezes
 * nothing.
 */
const FROZEN_CONTROLLED_VALUE =
  /<[A-Z][\w]*[^>]*?\b(value|open|checked|pressed|selectedValue|index)=("[^"]*"|'[^']*'|\[[^\]]*\]|\{)/;

async function docsSource(component: string): Promise<string> {
  return readFile(new URL(`${component}/docs.ts`, DEMOS), "utf8");
}

/** Example ids in page order, with their `essential` flag. */
function entries(source: string): { name: string; essential: boolean }[] {
  const start = source.indexOf("examples: [");
  const arrayStart = source.indexOf("[", start);
  let depth = 0;
  let end = arrayStart;
  for (; end < source.length; end += 1) {
    if (source[end] === "[") depth += 1;
    else if (source[end] === "]") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const out: { name: string; essential: boolean }[] = [];
  for (const match of source.slice(arrayStart, end).matchAll(/name:\s*"([^"]+)"([\s\S]*?)(?=\n\s*\},)/g)) {
    out.push({ name: match[1] as string, essential: /essential:\s*true/.test(match[2] as string) });
  }
  return out;
}

describe("every documented component", () => {
  it(
    "flags only examples that exist",
    async () => {
      const missing: string[] = [];
      for (const component of DOCUMENTED_COMPONENTS) {
        const source = await docsSource(component);
        for (const entry of entries(source)) {
          if (!entry.essential) continue;
          try {
            await readFile(new URL(`${component}/${entry.name}.marko`, DEMOS));
          } catch {
            missing.push(`${component}/${entry.name}`);
          }
        }
      }
      expect(missing).toEqual([]);
    },
    120_000,
  );

  it(
    "never makes a frozen controlled value its hero",
    async () => {
      const frozen: string[] = [];
      for (const component of DOCUMENTED_COMPONENTS) {
        const hero = entries(await docsSource(component))[0];
        if (!hero) continue;
        const source = await readFile(new URL(`${component}/${hero.name}.marko`, DEMOS), "utf8");
        const rootTag = /<([A-Z][\w]*)\b/.exec(source)?.[1];
        if (!rootTag) continue;
        const rootOpen = new RegExp(`<${rootTag}\\b[^>]*>`).exec(source)?.[0] ?? "";
        if (FROZEN_CONTROLLED_VALUE.test(rootOpen)) frozen.push(`${component}/${hero.name}`);
      }
      expect(frozen).toEqual([]);
    },
    120_000,
  );

  it(
    "does not make a showcase the hero",
    async () => {
      // A ~40-line threshold would flag a fifth of the registry, most of them
      // heroes whose only fault is that the component needs a few more lines
      // of markup. What actually costs an agent is a SHOWCASE: a page-sized
      // composition it cannot read as "this is how you use the component". The
      // round-2 heroes the review named were all over 90 lines.
      const SHOWCASE_LINES = 90;
      /**
       * The one component left, with the reason it is still a showcase hero.
       * Its every example is 117-170 lines because the component's minimal
       * usage IS a provider + viewport + content + item + bubble, and the only
       * honest short demo would be a new hand-authored one — which cannot be
       * verified here (no browser run is authorized), and a broken demo is a
       * worse defect than a long one.
       */
      const NAMED_SHOWCASE_HERO: Record<string, string> = {
        "message-scroller/message-scroller-demo": "every message-scroller example is 117+ lines; a short one would have to be authored and could not be verified",
      };
      const showcases: string[] = [];
      for (const component of DOCUMENTED_COMPONENTS) {
        const hero = entries(await docsSource(component))[0];
        if (!hero) continue;
        const source = await readFile(new URL(`${component}/${hero.name}.marko`, DEMOS), "utf8");
        if (source.split("\n").length > SHOWCASE_LINES) showcases.push(`${component}/${hero.name}`);
      }
      expect(showcases).toEqual(Object.keys(NAMED_SHOWCASE_HERO).sort());
      for (const reason of Object.values(NAMED_SHOWCASE_HERO)) {
        expect(reason.length).toBeGreaterThan(20);
      }
    },
    120_000,
  );

  it(
    "prints at most three examples and keeps the essentials when the hero is huge",
    async () => {
      // message-scroller's hero was 7,516 chars against a 7,000 budget and
      // pushed BOTH essentials out of the default answer. The budget now
      // applies to the hero only.
      const item = JSON.parse(
        await readFile(new URL("../../../public/r/message-scroller.json", import.meta.url), "utf8"),
      ) as { componentDocs: ComponentDocs };
      const markdown = renderComponentDocs(item.componentDocs);

      for (const example of item.componentDocs.examples.filter((e) => e.essential)) {
        expect(markdown, example.id).toContain(`### ${example.title}`);
      }
      const printed = [...markdown.matchAll(/^### /gm)].length;
      expect(printed).toBeGreaterThanOrEqual(2);
      expect(printed).toBeLessThanOrEqual(3);
    },
    120_000,
  );
});
