/**
 * report.ts — renders parity-report/index.html from the coverage + (optional)
 * visual detector output. Self-contained: plain HTML + inline CSS, no
 * framework, no external assets except the PNGs already written by
 * visual.ts (referenced by relative path from images/).
 */
import { writeFileSync } from "node:fs"
import { join, relative } from "node:path"
import type { CoverageReport } from "./coverage.ts"
import type { VisualReport } from "./visual.ts"

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function pct(ratio: number | null): string {
  if (ratio === null) return "n/a"
  return `${(ratio * 100).toFixed(1)}%`
}

function renderCoverageTable(coverage: CoverageReport): string {
  const rows = coverage.components
    .filter(
      (component) =>
        component.missingSections.length > 0 ||
        component.extraSections.length > 0 ||
        component.missingDemos.length > 0 ||
        component.extraDemos.length > 0 ||
        component.missingApiProps.length > 0 ||
        component.extraApiProps.length > 0
    )
    .sort((a, b) => {
      const score = (c: typeof a) => c.missingSections.length + c.missingDemos.length + c.missingApiProps.length
      return score(b) - score(a)
    })

  const list = (items: string[], cls: string) =>
    items.length === 0
      ? '<span class="muted">—</span>'
      : `<ul class="${cls}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`

  const body = rows
    .map(
      (component) => `
      <tr>
        <td class="component-name">${escapeHtml(component.component)}</td>
        <td>${list(component.missingSections, "missing")}</td>
        <td>${list(component.extraSections, "extra")}</td>
        <td>${list(component.missingDemos, "missing")}</td>
        <td>${list(component.extraDemos, "extra")}</td>
        <td>${
          component.apiTractable
            ? list(component.missingApiProps, "missing")
            : '<span class="muted">not tractable</span>'
        }</td>
      </tr>`
    )
    .join("")

  return `
    <table class="coverage-table">
      <thead>
        <tr>
          <th>Component</th>
          <th>Missing sections</th>
          <th>Extra sections (ours-only)</th>
          <th>Missing demos</th>
          <th>Extra demos (ours-only)</th>
          <th>Missing API props</th>
        </tr>
      </thead>
      <tbody>${body || '<tr><td colspan="6" class="muted">No drift detected in the analyzed set.</td></tr>'}</tbody>
    </table>`
}

function renderVisualGallery(visual: VisualReport, reportDir: string): string {
  const sorted = [...visual.results]
    .filter((result) => result.mismatchRatio !== null)
    .sort((a, b) => (b.mismatchRatio ?? 0) - (a.mismatchRatio ?? 0))

  const cards = sorted
    .map((result) => {
      const upstreamSrc = result.upstreamImagePath ? relative(reportDir, result.upstreamImagePath) : ""
      const ourSrc = result.ourImagePath ? relative(reportDir, result.ourImagePath) : ""
      const flaggedClass = result.flagged ? "flagged" : ""
      return `
      <div class="visual-card ${flaggedClass}">
        <div class="visual-card-header">
          <strong>${escapeHtml(result.component)}</strong> / ${escapeHtml(result.demoName)}
          <span class="mismatch ${result.flagged ? "flagged" : ""}">${pct(result.mismatchRatio)} mismatch</span>
          ${result.restingStateOnly ? '<span class="badge">resting-state only</span>' : ""}
        </div>
        <div class="visual-card-images">
          <figure><figcaption>Upstream</figcaption>${upstreamSrc ? `<img src="${escapeHtml(upstreamSrc)}" alt="upstream ${escapeHtml(result.demoName)}"/>` : '<span class="muted">no image</span>'}</figure>
          <figure><figcaption>Ours</figcaption>${ourSrc ? `<img src="${escapeHtml(ourSrc)}" alt="ours ${escapeHtml(result.demoName)}"/>` : '<span class="muted">no image</span>'}</figure>
        </div>
      </div>`
    })
    .join("")

  const errored = visual.results.filter((result) => result.error)
  const errorList =
    errored.length > 0
      ? `<h3>Errors (${errored.length})</h3><ul>${errored
          .map((result) => `<li><strong>${escapeHtml(result.component)}/${escapeHtml(result.demoName)}</strong>: ${escapeHtml(result.error ?? "")}</li>`)
          .join("")}</ul>`
      : ""

  return `
    <p>Threshold: ${(visual.threshold * 100).toFixed(0)}% mismatch. Resting-state only (interaction not simulated): ${
      visual.restingStateOnly.length === 0 ? "none" : escapeHtml(visual.restingStateOnly.join(", "))
    }.</p>
    <div class="visual-gallery">${cards || '<p class="muted">No visual comparisons ran.</p>'}</div>
    ${errorList}`
}

export function renderReport(
  coverage: CoverageReport,
  visual: VisualReport | null,
  outFile: string
): void {
  const reportDir = join(outFile, "..")

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>marko-ui / shadcn parity report</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #ffffff; --fg: #1a1a1a; --muted: #6b7280; --border: #e5e7eb;
    --missing: #b91c1c; --extra: #1d4ed8; --flagged: #b91c1c; --card-bg: #f9fafb;
  }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0f1115; --fg: #e6e6e6; --muted: #9ca3af; --border: #2a2d34; --card-bg: #161922; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 2rem; background: var(--bg); color: var(--fg); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.5; }
  h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
  h2 { font-size: 1.2rem; margin-top: 2.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.4rem; }
  .meta { color: var(--muted); font-size: 0.9rem; margin-bottom: 1.5rem; }
  table.coverage-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  table.coverage-table th, table.coverage-table td { border: 1px solid var(--border); padding: 0.5rem; vertical-align: top; text-align: left; }
  table.coverage-table th { background: var(--card-bg); }
  td.component-name { font-weight: 600; white-space: nowrap; }
  ul.missing, ul.extra { margin: 0; padding-left: 1.1rem; }
  ul.missing li { color: var(--missing); }
  ul.extra li { color: var(--extra); }
  .muted { color: var(--muted); }
  .unmapped-lists { display: flex; gap: 2rem; flex-wrap: wrap; }
  .unmapped-lists ul { columns: 2; }
  .visual-gallery { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 1rem; }
  .visual-card { border: 1px solid var(--border); border-radius: 8px; padding: 1rem; background: var(--card-bg); }
  .visual-card.flagged { border-color: var(--flagged); }
  .visual-card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; font-size: 0.9rem; }
  .mismatch { font-weight: 600; }
  .mismatch.flagged { color: var(--flagged); }
  .badge { font-size: 0.75rem; background: var(--border); border-radius: 4px; padding: 0.1rem 0.4rem; }
  .visual-card-images { display: flex; gap: 1rem; flex-wrap: wrap; }
  .visual-card-images figure { margin: 0; flex: 1 1 300px; }
  .visual-card-images figcaption { font-size: 0.8rem; color: var(--muted); margin-bottom: 0.25rem; }
  .visual-card-images img { max-width: 100%; border: 1px solid var(--border); border-radius: 4px; }
</style>
</head>
<body>
  <h1>marko-ui ↔ shadcn parity report</h1>
  <div class="meta">
    Coverage generated: ${escapeHtml(coverage.generatedAt)}
    ${visual ? ` · Visual generated: ${escapeHtml(visual.generatedAt)}` : " · Visual detector not run (--static-only)"}
    · Ignored (parity-ignore.json) entries silenced: ${coverage.ignoredCount}
  </div>

  <h2>Coverage drift (worst first)</h2>
  ${renderCoverageTable(coverage)}

  <h2>Unmapped components</h2>
  <div class="unmapped-lists">
    <div>
      <strong>Ours only (no upstream base-ui doc)</strong>
      <ul>${coverage.oursOnly.map((name) => `<li>${escapeHtml(name)}</li>`).join("") || "<li class='muted'>none</li>"}</ul>
    </div>
    <div>
      <strong>Upstream only (not ported)</strong>
      <ul>${coverage.upstreamOnly.map((name) => `<li>${escapeHtml(name)}</li>`).join("") || "<li class='muted'>none</li>"}</ul>
    </div>
  </div>

  ${visual ? `<h2>Visual drift (worst first)</h2>${renderVisualGallery(visual, reportDir)}` : ""}
</body>
</html>`

  writeFileSync(outFile, html)
}
