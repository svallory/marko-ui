// Renders a component page as plain markdown — the payload behind Copy Page,
// the `.md` endpoint, and (later) llms.txt. Built from the same
// ComponentPageData the HTML page uses, so the two cannot disagree.
import type { ComponentPageData } from "./component-page-data.ts";
import type { ApiPart } from "../tags/docs/api-table.marko";

/** Pipes and newlines would break out of a markdown table cell. */
function escapeTableCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");
}

function renderPartTable(part: ApiPart, includeHeading: boolean): string {
  const lines: string[] = [];
  if (includeHeading) lines.push(`### ${part.name}`, "");

  if (part.properties.length === 0) {
    lines.push(
      part.nativeAttributes
        ? `No props of its own. Accepts every \`<${part.nativeAttributes}>\` attribute, plus \`class\`.`
        : "No props of its own.",
      "",
    );
    return lines.join("\n");
  }

  lines.push("| Prop | Type | Default | Description |", "| --- | --- | --- | --- |");
  for (const property of part.properties) {
    const name = property.required ? `\`${property.name}\` (required)` : `\`${property.name}\``;
    lines.push(
      `| ${name} | \`${escapeTableCell(property.type)}\` | ${
        property.default ? `\`${property.default}\`` : "—"
      } | ${escapeTableCell(property.description ?? "")} |`,
    );
  }
  lines.push("");

  if (part.nativeAttributes) {
    lines.push(`Also accepts every \`<${part.nativeAttributes}>\` attribute.`, "");
  }
  return lines.join("\n");
}

/** `header` in `card` → `CardHeader`. */
function pascalCase(value: string): string {
  return value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

export function renderComponentMarkdown(page: ComponentPageData): string {
  const sections: string[] = [];

  sections.push(`# ${page.title}`, "", page.description, "");

  sections.push("## Installation", "", "```bash", page.installCommand, "```", "");

  if (page.registry.dependencies.length !== 0) {
    sections.push(
      "Dependencies installed alongside the component:",
      "",
      ...page.registry.dependencies.map((dependency) => `- \`${dependency}\``),
      "",
    );
  }

  sections.push(
    "## Usage",
    "",
    "```marko",
    page.docs.importSnippet,
    "```",
    "",
    "```marko",
    page.docs.usageSnippet,
    "```",
    "",
  );

  if (page.isCompound) {
    const rootTag = pascalCase(page.name);
    const children = page.parts.filter((part) => part.name !== page.name);
    sections.push("## Composition", "", "```text", `<${rootTag}>`);
    children.forEach((part, index) => {
      const branch = index === children.length - 1 ? "└──" : "├──";
      // A part named with the component's own prefix (e.g. toast's
      // "toast-item") would double up as <ToastToastItem/> — strip it.
      const partName = part.name.startsWith(`${page.name}-`)
        ? part.name.slice(page.name.length + 1)
        : part.name;
      sections.push(`${branch} <${rootTag}${pascalCase(partName)} />`);
    });
    sections.push("```", "");
  }

  for (const example of page.examples) {
    sections.push(`## ${example.title}`, "");
    if (example.description) sections.push(example.description, "");
    sections.push("```marko", example.source, "```", "");
  }

  if (page.parts.length !== 0) {
    sections.push("## API Reference", "");
    const includeHeadings = page.parts.length > 1;
    for (const part of page.parts) {
      sections.push(renderPartTable(part, includeHeadings));
    }
  }

  // Collapse the runs of blank lines the section joins leave behind.
  return sections.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}
