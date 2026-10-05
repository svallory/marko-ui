import { describe, expect, it } from "vitest";
import { buildComponentDocs, readInterfaceFields, type ApiProp } from "./build";
import type { DocsEntry } from "./build";

// The builder is what turns API data into something an agent can act on, and
// its classification rules are where the previous branch shipped markup that
// does not compile (`<@content>`) and props filed as events
// (`openOnChange`). Each rule below is one of those.

const DOCS: DocsEntry = {
  usageTags: "<Tabs>",
  importSnippet: 'import Tabs from "@/components/ui/tabs/tabs.marko";',
  usageSnippet: "<Tabs/>",
  examples: [],
};

function prop(name: string, type: string, extra: Partial<ApiProp> = {}): ApiProp {
  return { name, type, required: false, ...extra };
}

const TABS_SOURCE = `
export interface TabItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TabsTriggerAttrs {
  value: string;
  disabled?: boolean;
  content?: Marko.Body;
}

<const/triggerTags=[...(input.trigger ?? [])]/>
<const/triggerTags2=[...(input.panel ?? [])]/>
`;

describe("buildComponentDocs: the default body is not a part", () => {
  it("lifts `content` out of the parts and onto the body", () => {
    const model = buildComponentDocs({
      name: "tabs",
      docs: DOCS,
      demos: {},
      installCommand: "bunx marko-ui add tabs -y",
      componentSource: TABS_SOURCE,
      parts: [
        {
          name: "tabs",
          properties: [
            prop("content", "Marko.Body<[string], void>"),
            prop("trigger", "Marko.AttrTag<TabsTriggerAttrs>"),
          ],
        },
      ],
    });

    expect(model.body?.param).toBe("string");
    expect(model.parts.map((part) => part.name)).toEqual(["trigger"]);
    expect(model.props.map((p) => p.name)).toEqual([]);
  });

  it("reports no body at all when the component declares none", () => {
    const model = buildComponentDocs({
      name: "button",
      docs: DOCS,
      demos: {},
      installCommand: "x",
      parts: [{ name: "button", properties: [prop("variant", "string | undefined")] }],
    });

    expect(model.body).toBeUndefined();
  });
});

describe("buildComponentDocs: repeatable parts come from the component source", () => {
  const properties = [
    prop("content", "Marko.Body<[], void>"),
    prop("trigger", "Marko.AttrTag<TabsTriggerAttrs>"),
    prop("panel", "Marko.AttrTag<TabsPanelAttrs>"),
  ];

  function build(source: string) {
    return buildComponentDocs({
      name: "tabs",
      docs: DOCS,
      demos: {},
      installCommand: "x",
      componentSource: source,
      parts: [{ name: "tabs", properties }],
    });
  }

  it("marks a part the component iterates", () => {
    const model = build(TABS_SOURCE);
    const trigger = model.parts.find((part) => part.name === "trigger");

    // tabs.marko does `[...(input.trigger ?? [])]`, so `<@trigger>` can be
    // written once per row.
    expect(trigger?.repeatable).toBe(true);
  });

  it("leaves a part the component never iterates unflagged", () => {
    const model = build(`export interface TabsTriggerAttrs { value: string; }`);
    const trigger = model.parts.find((part) => part.name === "trigger");

    expect(trigger?.repeatable).toBeUndefined();
  });

  it("also treats a `<for … of=input.x>` over the attr-tag as iteration", () => {
    const model = build("<for|item| of=input.trigger>${item}</for>");
    expect(model.parts.find((part) => part.name === "trigger")?.repeatable).toBe(true);
  });

  it("reads the part's own attributes out of the declared AttrTag type", () => {
    const model = build(TABS_SOURCE);
    const trigger = model.parts.find((part) => part.name === "trigger");

    expect(trigger?.attributes?.map((a) => a.name)).toEqual(["value", "disabled"]);
    expect(trigger?.attributes?.[0]?.required).toBe(true);
    expect(trigger?.attributes?.[1]?.required).toBe(false);
    // `content?: Marko.Body` on the AttrTag is the part's body, not an
    // attribute you pass.
    expect(trigger?.attributes?.map((a) => a.name)).not.toContain("content");
  });
});

describe("buildComponentDocs: nested attr-tags are parts, not raw prop types", () => {
  it("moves a sub-part's attr-tag into its own parts list", () => {
    const model = buildComponentDocs({
      name: "chart",
      docs: DOCS,
      demos: {},
      installCommand: "x",
      componentSource: [
        "export interface BarSeries {",
        "  dataKey: string;",
        "  stackId?: string;",
        "}",
      ].join("\n"),
      parts: [
        { name: "chart", properties: [prop("content", "Marko.Body<[], void>")] },
        {
          name: "bar",
          properties: [prop("series", "Marko.AttrTag<BarSeries>")],
        },
      ],
    });

    const bar = model.subcomponents?.find((sub) => sub.name === "bar");
    expect(bar?.props).toEqual([]);
    expect(bar?.parts?.[0]?.name).toBe("series");
    expect(bar?.parts?.[0]?.attributes?.map((a) => a.name)).toEqual(["dataKey", "stackId"]);
  });

  it("gives an inline `{ content: Marko.Body }` AttrTag no attributes", () => {
    const model = buildComponentDocs({
      name: "pie",
      docs: DOCS,
      demos: {},
      installCommand: "x",
      parts: [
        {
          name: "pie",
          properties: [
            prop("centerLabel", "Marko.AttrTag<{ content: Marko.Body<[{ cx: number; cy: number; }]>; }>"),
          ],
        },
      ],
    });

    const label = model.parts[0];
    expect(label?.name).toBe("centerLabel");
    expect(label?.param).toBe("{ cx: number; cy: number; }");
    expect(label?.attributes).toBeUndefined();
  });
});

describe("buildComponentDocs: events are callbacks only", () => {
  function names(properties: ApiProp[]) {
    const model = buildComponentDocs({
      name: "combobox",
      docs: DOCS,
      demos: {},
      installCommand: "x",
      parts: [{ name: "combobox", properties }],
    });
    return {
      events: model.events.map((event) => event.name),
      props: model.props.map((prop) => prop.name),
    };
  }

  it("files a change handler as an event", () => {
    expect(names([prop("onValueChange", "((details: ValueChangeDetails) => void) | undefined")]).events)
      .toEqual(["onValueChange"]);
  });

  it("keeps a boolean-or-predicate prop out of the events list", () => {
    // combobox's `openOnChange` ends in "Change" but is
    // `boolean | ((details) => boolean)` — a prop.
    const result = names([
      prop("openOnChange", "boolean | ((details: OpenOnChangeDetails) => boolean) | undefined"),
    ]);

    expect(result.events).toEqual([]);
    expect(result.props).toEqual(["openOnChange"]);
  });

  it("keeps a plain boolean prop out of the events list", () => {
    const result = names([prop("deselectable", "boolean | undefined")]);

    expect(result.events).toEqual([]);
    expect(result.props).toEqual(["deselectable"]);
  });
});

describe("readInterfaceFields", () => {
  it("reads one-declaration-per-line interfaces", () => {
    expect(
      readInterfaceFields(TABS_SOURCE, "TabItem"),
    ).toEqual([
      { name: "value", type: "string", required: true },
      { name: "label", type: "string", required: true },
      { name: "disabled", type: "boolean", required: false },
    ]);
  });

  it("returns nothing for an interface that is not there", () => {
    expect(readInterfaceFields(TABS_SOURCE, "Nope")).toEqual([]);
  });
});

describe("buildComponentDocs: examples", () => {
  it("drops a demo file the docs entry names but that does not exist", () => {
    const model = buildComponentDocs({
      name: "button",
      docs: {
        ...DOCS,
        examples: [
          { name: "button-demo", title: "Demo" },
          { name: "missing", title: "Missing" },
        ],
      },
      demos: { "button-demo": { source: "<Button/>" } },
      installCommand: "x",
      parts: [],
    });

    expect(model.examples.map((example) => example.id)).toEqual(["button-demo"]);
  });

  it("strips comments from the demo source", () => {
    const model = buildComponentDocs({
      name: "button",
      docs: { ...DOCS, examples: [{ name: "demo", title: "Demo" }] },
      demos: { demo: { source: "// note to self\n<Button/>" } },
      installCommand: "x",
      parts: [],
    });

    expect(model.examples[0]?.source).toBe("<Button/>");
  });
});