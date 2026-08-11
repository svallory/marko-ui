// Static prose specimens for the /typeset typography page.
// Adapted from shadcn/ui's typeset fixtures (MIT) — content rewritten to
// describe marko-ui APIs instead of AI SDK / Next.js APIs, so the specimen
// text stays honest about what this project actually is.

export const DOCS_HTML = `
<h1>Building a Marko-Zag Component</h1>
<p>The <code>marko-zag</code> package makes it straightforward to wire a Zag.js state machine into a Marko 6 template. It supplies the tags that keep the machine's reactive state serializable, and updates the DOM automatically as state changes.</p>
<p>To summarize, the pattern provides the following features:</p>
<ul>
<li><strong>Serializable state</strong>: Machine context that needs to survive resumption is exposed as plain, serializable values.</li>
<li><strong>Managed lifecycle</strong>: The machine's service is created once and connected declaratively via a tag.</li>
<li><strong>Seamless composition</strong>: Compose machine-driven parts into a single component using attribute tags.</li>
</ul>
<p>In this guide, you will learn how to use the pattern to build a real component with full keyboard and screen-reader support. Check out our <a href="/docs/creating-components">component recipe</a> to learn the full anatomy.</p>
<h2>Example</h2>
<p>The wiring flow works like this:</p>
<ol>
<li>The tag creates a Zag <code>machine</code> from props passed on the Input.</li>
<li>A <code>connect</code> tag turns the machine's service into a plain <code>api</code> object.</li>
<li>The template reads from <code>api</code> and forwards user events back into the service.</li>
</ol>
<pre><code>import * as switchMachine from '@zag-js/switch';
import type { MachineInput } from 'marko-zag';

export type Input = MachineInput&lt;'input', switchMachine.Props&gt; &amp; {
  checkedChange?: (checked: boolean) =&gt; void;
};</code></pre>
<pre><code>&lt;machine-provider machine=switchMachine service:=service context=input/&gt;
&lt;connect service=service api|api|&gt;
  &lt;button ...api.getRootProps() checked=api.checked&gt;
    &lt;slot/&gt;
  &lt;/button&gt;
&lt;/connect&gt;</code></pre>
<blockquote><p>Machines and their derived <code>api</code> objects contain functions from npm code and must never become reactive state or cross a tag boundary as raw values — only getters. Template-written closures can be serialized; service methods cannot.</p></blockquote>
<p>In the <code>Switch</code> component, the machine will re-render its own subtree whenever the service's context changes, without ever re-running the outer page template on the client.</p>
<h2>Customized behavior</h2>
<p>Every machine exposes a <code>context</code> object you can read and, for controlled props, write via Marko's bind shorthand.</p>
<h3>Controlled vs. uncontrolled</h3>
<p>A prop is controlled when you pass a getter for it and also supply the matching <code>xxxChange</code> handler. The available states are:</p>
<ul>
<li><code>uncontrolled</code>: The machine owns the value entirely; you only read it.</li>
<li><code>controlled</code>: You own the value; the machine calls back on every change.</li>
<li><code>disabled</code>: The machine ignores all input and exposes only read state.</li>
<li><code>invalid</code>: The machine renders its error styling hooks but stays interactive.</li>
</ul>
<pre><code>&lt;let/checked=false/&gt;

&lt;Switch checked:=checked/&gt;</code></pre>
<h3>Disabled state</h3>
<p>Similarly, the <code>disabled</code> prop is forwarded straight to the machine's props. It can be used to freeze the control, skip it in tab order, and grey out its styling:</p>
<blockquote><p>We recommend keeping disabled controls in the DOM rather than removing them, so screen reader users still get an explanation of why the action is unavailable.</p></blockquote>
<pre><code>&lt;Switch checked disabled/&gt;</code></pre>
<h3>Two-way binding</h3>
<p>It's also a common case to bind a control's value directly to page state. You can do this with Marko's <code>:=</code> shorthand, which only ever attaches to value props, never to the <code>xxxChange</code> prop itself.</p>
<pre><code>&lt;let/theme="system"/&gt;

&lt;RadioGroup value:=theme&gt;
  ...
&lt;/RadioGroup&gt;</code></pre>
<hr>
<h2>API reference</h2>
<h3>MachineInput&lt;Tag, Props&gt;</h3>
<p>Builds a component's Input type. All fields come from Zag; the wrapper only adds change callbacks.</p>
<table>
  <thead>
    <tr><th>Field</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>id</code></td><td><code>string</code></td><td>Made optional; generated when omitted</td></tr>
    <tr><td><code>checked</code></td><td><code>boolean</code></td><td>Forwarded straight from the Zag machine's props</td></tr>
    <tr><td><code>checkedChange</code></td><td><code>(checked: boolean) =&gt; void</code></td><td>Enables the <code>checked:=</code> bind shorthand</td></tr>
    <tr><td><code>disabled</code></td><td><code>boolean</code></td><td>Forwarded straight from the Zag machine's props</td></tr>
    <tr><td><code>class</code></td><td><code>string</code></td><td>Merged onto the machine's root element</td></tr>
  </tbody>
</table>
<h2>Attribute tag slots</h2>
<p>Multi-part components expose optional content via attribute tags so callers can override just one region without re-implementing the whole component:</p>
<ul>
<li><code>&lt;@icon&gt;</code>: Replaces the default leading icon.</li>
<li><code>&lt;@label&gt;</code>: Replaces the visible text content.</li>
<li><code>&lt;@description&gt;</code>: Adds supporting copy below the control.</li>
</ul>
<p>These slots keep the registry component copy-paste friendly while still letting consumers customize the parts that actually vary.</p>
<pre><code>&lt;Select&gt;
  &lt;@trigger&gt;Choose a fruit&lt;/@trigger&gt;
  &lt;@item value="apple"&gt;Apple&lt;/@item&gt;
&lt;/Select&gt;</code></pre>
`

// A denser specimen: deep heading levels, tables with alignment, a
// figure/caption, task lists, nested lists, definition lists, and footnotes —
// everything a copy-pasted README or CMS field can throw at the .typeset class.
export const ELEMENTS_HTML = `
<h1>Porting a component library to a new renderer</h1>
<p>Six months ago we rewrote how our docs render component demos, and this is the retrospective we wish we'd had first. The short version: the components were never the hard part, the <em>typography</em> was, and the fixes that mattered were <strong>boring, measurable, and CSS-shaped</strong>. We <del>estimated two weeks</del> spent six, and the difference was all edge cases.</p>
<p>Everything below comes from real registry components rendered by the same stylesheet you're reading now.<sup><a href="#fn1" id="ref1">1</a></sup></p>
<h2>The setup</h2>
<p>Component docs are authored once and rendered on every route the shared dev server compiles. The renderer never re-parses markdown at runtime; the stylesheet's only job is to keep already-painted content perfectly still while new demos are added below it. The whole contract fits in one tag:</p>
<pre><code>export interface Input {
  title: string;
  description?: string;
  content?: Marko.Body;
}</code></pre>
<p>Every block above a new demo must keep its computed styles byte-for-byte identical as more sections are appended. We test exactly that, and press <kbd>⌘</kbd> <kbd>K</kbd> in the search palette to jump straight to any component's docs.</p>
<h2>What the audit found</h2>
<p>We counted what our own docs pages actually contain across seventy component routes. The distribution surprised us; <mark>deep headings and tables are not rare events</mark>, they're the reference section on every page.</p>
<table>
  <thead>
    <tr>
      <th>Element</th>
      <th align="right">Pages using it</th>
      <th>Notes</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Lists</th>
      <td align="right">78.4%</td>
      <td>Nesting to three levels is common in prop docs</td>
    </tr>
    <tr>
      <th scope="row">Code blocks</th>
      <td align="right">100%</td>
      <td>Every demo page ships at least one install snippet</td>
    </tr>
    <tr>
      <th scope="row">Tables</th>
      <td align="right">61.9%</td>
      <td>Prop reference tables run wide on mobile</td>
    </tr>
    <tr>
      <th scope="row">Headings</th>
      <td align="right">92.6%</td>
      <td>Reference pages outline deeper than guides do</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th scope="row">Any block element</th>
      <td align="right">100%</td>
      <td>No page is plain paragraphs only</td>
    </tr>
  </tfoot>
</table>
<p>That last row is why the bottom of the heading scale exists at all.<sup><a href="#fn2" id="ref2">2</a></sup> Nobody designs h6 for people; you design it for the deepest nesting a reference table forces on you.</p>
<figure>
  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'%3E%3Crect width='1200' height='630' fill='%23EAEAEA' rx='6'/%3E%3Cpath d='M80 470 L280 380 L480 420 L680 260 L880 300 L1120 160' stroke='%23BDBDBD' stroke-width='8' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E" alt="Docs build time, before and after the typeset pass" width="1200" height="630">
  <figcaption>Figure 1. The morning after the port landed: style recalculation cost per route, before and after the append-stable rules shipped.</figcaption>
</figure>
<h2>Three mistakes we made</h2>
<h3>We trusted margin collapsing</h3>
<p>Our first spacing model used symmetric margins and let the browser deduplicate them. Then a demo wrapped its content in a flex column and every paragraph gap silently doubled. Single-direction margins fixed it everywhere at once:</p>
<ol>
<li>Space belongs above blocks, and only above.</li>
<li>Headings own the gap beneath them, so following content never negotiates.</li>
<li>Nothing, anywhere, sets a bottom margin.</li>
</ol>
<h3>We styled the last row</h3>
<p>Tables drew their border under the final row, which meant every appended row restyled the previous one on arrival. The fix was embarrassingly small:</p>
<ul>
<li>Borders go <em>between</em> rows, never after the last one
  <ul>
    <li>The same rule saved us again on blockquote citations and list dividers</li>
  </ul>
</li>
<li>Selectors may look backward at earlier siblings, never forward</li>
</ul>
<h3>We ignored the quiet feedback</h3>
<blockquote>
<p>The new docs feel calmer, and I can't tell you why. I just stopped noticing the formatting.</p>
<p>That was the entire review. It's still the best QA signal we've ever received, because typography you notice is typography that failed.</p>
</blockquote>
<h2>The checklist we run now</h2>
<p>Before any typography change ships, a release candidate has to clear the same four gates, in order:</p>
<ul class="contains-task-list">
<li class="task-list-item"><input type="checkbox" checked disabled> Every route still compiles on the shared dev server</li>
<li class="task-list-item"><input type="checkbox" checked disabled> Reads correctly at <code>text-sm</code> inside a demo box and at full width</li>
<li class="task-list-item"><input type="checkbox" checked disabled> Squint test shows even gray, no hotspots</li>
<li class="task-list-item"><input type="checkbox" disabled> Sixty seconds of sustained reading by someone who didn't write it</li>
</ul>
<details>
<summary>How we verify a route before merging</summary>
<p>Every route gets curled for a 200, then screenshotted with Playwright and checked for console errors. The suite runs against both themes so light/dark regressions can't hide.</p>
<pre><code>verify:
	curl -s http://localhost:3100/typeset

	bun run test:screenshot -- --route /typeset</code></pre>
</details>
<hr>
<h2>Appendix</h2>
<h4>Glossary</h4>
<dl>
<dt>flow</dt>
<dd>The rhythm unit: one em-based value that spaces every block from the one before it.</dd>
<dt>measure</dt>
<dd>Line length in average characters. Not the CSS <code>ch</code> unit, which overcounts by roughly a third.</dd>
</dl>
<h4>Reference notes</h4>
<h5>On the numbers in this post</h5>
<p>Percentages are per-route presence, not byte share. A route containing one table and one list counts once in each row.</p>
<h6>Revision history</h6>
<p>Corrected the table-usage count<sup><a href="#fn3" id="ref3">3</a></sup> and added the flex-column incident after two reviewers asked whether "boring, measurable, and CSS-shaped" was a typo. It wasn't.</p>
<section data-footnotes class="footnotes">
<ol>
<li id="fn1"><p>Route count anonymized to the nearest component category. <a href="#ref1">↩</a></p></li>
<li id="fn2"><p>Specifically the props table that contained fourteen enum values and zero prose. <a href="#ref2">↩</a></p></li>
<li id="fn3"><p>The original draft said seventy; the correct count is sixty-eight. <a href="#ref3">↩</a></p></li>
</ol>
</section>
`

export const FIXTURES = {
  docs: DOCS_HTML,
  elements: ELEMENTS_HTML,
} as const

export const CONTENT_OPTIONS = [
  { value: "docs", label: "Docs" },
  { value: "elements", label: "Elements" },
] as const satisfies readonly { value: keyof typeof FIXTURES; label: string }[]
