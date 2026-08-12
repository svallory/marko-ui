# marko-ui site vs shadcn/ui — difference audit & adoption plan

Read-only audit. Compares `apps/docs` (localhost:3000) against shadcn v4 source at
`/Users/svallory/work/marko-ui/data/shadcn-ui/apps/v4/` (MIT) and the live site.

Screenshots of our site (1440px and 1920px, home/docs/blocks/typeset/create/components/404):
`/private/tmp/claude-501/-Users-svallory-work/c1ed5990-8412-4846-9f38-2b40796b5fcc/scratchpad/shots/`

Measured live via Playwright at 1920px viewport:

| Route | our `<main>` width | our header inner width | body scroll width |
|---|---|---|---|
| `/` | 1920 (full) | **1152** | 1920 |
| `/docs` | **608** | 1152 | 1920 |
| `/blocks` | 1920 (inner `max-w-6xl` = 1152) | 1152 | 1920 |
| `/typeset` | **896** | 1152 | 1920 |
| `/create` | (no `<main>`, full) | 1152 | 1920 |
| `/components/button` | **768** | 1152 | 1920 |

Every route reports `title: "marko-ui"`, `hasMetaDesc: false`, `og: 0`, `favicon: false`.
`/this-route-does-not-exist` → HTTP 404 with an **empty document** (no title, no header, no chrome).

---

## Prioritized adoption table

Effort: S ≤ half a day, M ≈ 1–2 days, L ≈ 3+ days.

### P0 — structural, blocks everything downstream

| # | Difference | shadcn | ours | Rec | Effort |
|---|---|---|---|---|---|
| 1 | **Container system** — two-tier `container-wrapper` + `container` utilities | `max-w-[1400px]`, `3xl:max-w-screen-2xl`, wrapper `3xl:fixed:max-w-[calc(var(--breakpoint-2xl)+2rem)]` | hardcoded `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8` repeated in 8+ files | **Adopt** — single root cause of the "not full width" complaint; must land before any page-level work | M |
| 2 | **Header width** | header uses `container-wrapper`, goes edge-to-edge, `--header-height` var (14/16 responsive) | header pinned to `max-w-6xl` (1152px) at every viewport, fixed `h-14` | **Adopt** — most visible single defect at ≥1440px | S |
| 3 | **Docs content width** | `max-w-160` prose column inside a `lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]` grid that fills the container | 608px column inside `max-w-6xl` flex row; ~660px of dead margin each side at 1920px | **Adopt** — with #1, docs stops looking broken on wide screens | M |
| 4 | **Meta/OG/favicon** | full `metadata` export, `metadataBase`, OG + Twitter cards, dynamic `/og` route, favicon set, `theme-color` | static `<title>marko-ui</title>` on every route, zero meta/OG, no favicon file | **Adopt** (static per-route first, dynamic OG deferred) | S then M |
| 5 | **404 page** | Next default + app chrome | empty body, no chrome, no title | **Adopt** | S |

### P1 — the navbar gap the user called out

| # | Difference | shadcn | ours | Rec | Effort |
|---|---|---|---|---|---|
| 6 | **⌘K command menu** | `components/command-menu.tsx` (642 lines): dialog, `⌘K` + `/` shortcuts, groups Pages / Styles / Components / Colors / Blocks / Search Results, `⌘C` to copy highlighted value, footer hint bar | none anywhere | **Adopt, scoped** — ship static-index version (routes + 76 components), skip fumadocs full-text | M |
| 7 | **GitHub stars count** | `github-link.tsx` — server `fetch` of GH API, `revalidate: 86400`, `1000→"Nk"`, Suspense + Skeleton | icon-only link, no count | **Adopt** — cheap; build-time fetch or a tiny cached endpoint | S |
| 8 | **"New" badge affordances** | `PAGES_NEW` array in `lib/docs.ts` drives `data-new` on nav links + blue dot in sidebar/mobile nav | none | **Adopt** — trivial data-driven, high perceived freshness | S |
| 9 | **Primary CTA in header** | `New` button → `/create` with plus icon, `h-[31px] rounded-lg` | none | **Adopt** | S |
| 10 | **Nav item set** | 8 items: Home, Docs, Components, Blocks, Charts, Directory, Typeset, Create | 5: Home, Docs, Blocks, Typeset, Create | **Adopt partially** — add Components now; Charts/Directory only if those pages ship | S |
| 11 | **Active-state mechanism** | `usePathname()` server/client, `data-active` at render | client `<script>` sets `data-active` after mount → flash of no-active-state on load | **Adopt** — compute from `$global.url.pathname`, already available in our root layout | S |
| 12 | **Mobile nav** | Popover, full-viewport `h-(--radix-popper-available-height)`, backdrop blur, animated hamburger→X, `text-2xl` links, three sections (Menu / Sections / doc tree) | `<details>` dropdown, 192px panel, 5 links | **Defer** — works, just modest; revisit after P0 | M |
| 13 | **Separators + ModeSwitcher grouping** | `Separator orientation="vertical"` between GitHub / mode / actions, `extend-touch-target` | bare `gap-1` | Adopt | S |

### P2 — home page

| # | Difference | shadcn | ours | Rec | Effort |
|---|---|---|---|---|---|
| 14 | **Showcase card count** | **16 rendered cards** in 5 responsive columns (see §3) | **5 cards** in 3 columns | **Adopt** — the "many more previews" complaint; parallel agent owns this | L |
| 15 | **Showcase container** | `max-w-none`, `lg:max-w-none`, `xl:max-w-[1600px]`, `2xl:max-w-[1900px]`, grid to `grid-cols-5!` at `min-[1900px]` | `max-w-6xl`, caps at `xl:grid-cols-3` | **Adopt** | S (with #1) |
| 16 | **Mobile hero image** | `md:hidden` static `full-light.png`/`full-dark.png` at `w-[140vw]` instead of live cards | renders same cards at all sizes | **Skip** — needs a rendered screenshot asset pipeline; low value for us | — |
| 17 | **Skeleton rails** | `CardsSkeletonRails`, `min-[2200px]` only, `opacity-50`, decorative | none | **Skip** — ultra-wide-only decoration; explicitly dropped already and that was right | — |
| 18 | **Hero CTA count** | one button ("Build Your Own" → `/create?preset=…`) | two ("Get Started", "Browse Components") | **Skip** — ours is better for a project with no preset library yet | — |
| 19 | **Stats row** | none on shadcn home | `<dl>` with Components 76 / Runtime Marko 6 / No-JS Works | **Keep ours** — genuine Beyond-shadcn differentiator | — |
| 20 | **Gradient overlays** | top `h-120` and bottom `h-48 lg:h-80 xl:h-64` fades over the card grid | bottom `h-24` only | Adopt | S |

### P3 — docs pages

| # | Difference | shadcn | ours | Rec | Effort |
|---|---|---|---|---|---|
| 21 | **Syntax highlighting** | rehype/Shiki through MDX; `CodeTabs`, `CodeCollapsibleWrapper`, `CodeBlockCommand` (per-package-manager tabs) | `code-block.marko` — chrome + copy button, **no highlighting** (comment admits it) | **Adopt** — biggest docs quality gap after width; Shiki at build time suits Marko's SSR | M |
| 22 | **Package-manager tabs on install commands** | `code-block-command.tsx`, remembers choice via `useConfig` | our `card-install` has bun/pnpm/yarn pills on home only, not in docs | Adopt | S |
| 23 | **Prev/next pager** | two renderings: icon buttons beside the title *and* a full-width named footer pager; from `findNeighbour(pageTree)` | footer pager only, from hand-maintained `DOCS_NAV_FLAT` | **Keep ours**, add the header icon pair | S |
| 24 | **TOC** | `docs-toc.tsx` with `list` and `dropdown` variants — dropdown for narrow viewports | list only, `xl:block`, invisible below 1280px | **Adopt dropdown variant** — TOC entirely inaccessible on laptops today | S |
| 25 | **TOC data source** | derived from MDX AST | hand-authored per-page arrays of `{id,label,level}` | **Defer** — real fix is an MDX/content pipeline, a separate project | L |
| 26 | **"Copy page" / LLM view** | `docs-copy-page.tsx` + `/llm/[[...slug]]/route.ts` serving `text/markdown` per page | none | **Defer** — genuinely useful, but needs #25's pipeline first | M |
| 27 | **Docs sidebar breakpoint** | `lg:flex`, sticky `top-[calc(var(--header-height)+0.6rem)]`, `h-[calc(100svh-10rem)]`, scroll-position restore script in `<head>` | `lg:block`, `sticky top-14`, `max-h-[calc(100vh-3.5rem)]`, no scroll restore | Adopt scroll-restore + header-height var | S |
| 28 | **Component pages use a different shell** | all component docs are docs pages — same sidebar, TOC, breadcrumbs, pager | `component-page.marko`: `max-w-3xl`, a "← marko-ui" link, no sidebar/TOC/pager/breadcrumb | **Adopt** — 76 pages currently orphaned from the docs IA; arguably ranks P1 | M |
| 29 | **Base/style switcher** | `docs-base-switcher.tsx` (radix / base / aria variants) | none | **Skip** — we have one base (Zag); no analogue | — |

### P4 — pages we lack entirely

| # | Page | shadcn | ours | Rec | Effort |
|---|---|---|---|---|---|
| 30 | **Charts** | `/charts/[type]`, 7 categories, **70 chart components** (area 10, bar 10, line 10, pie 11, radar 14, radial 6, tooltip 9), Recharts-based | none | **Skip for now** — Recharts is React; needs a Marko charting story first. Revisit as a roadmap item, not a site task | L |
| 31 | **Colors** | `/colors` — full Tailwind palette in HEX/RGB/HSL/CSS-var/class, `ColorFormatSelector`, click-to-copy with toast | none | **Adopt** — pure data + our existing clipboard machine, no React dependency, high utility/effort ratio | M |
| 32 | **Directory** | `/docs/directory` — third-party registry listing, `directory-list.tsx`, `directory-search.tsx`, `directory-add-button.tsx` | none | **Skip** — requires an ecosystem we don't have yet | — |
| 33 | **Examples** | 5 full app demos (dashboard, tasks, playground, authentication, rtl) under a shared layout | none (blocks partly overlap) | **Defer** — our `/blocks` covers the demand for now | L |
| 34 | **Sera style showcase** | `/sera` marketing page for a style preset | none | **Skip** — no preset system | — |
| 35 | **Changelog as a real section** | `/docs/changelog` + dated child pages, drives `PAGES_NEW` and the announcement pill | single `/docs/changelog` page | Adopt the dated-entry structure when #8 lands | S |

### P5 — chrome & polish

| # | Difference | shadcn | ours | Rec | Effort |
|---|---|---|---|---|---|
| 36 | **Footer** | credits with three links, `--footer-height` var (14/24 responsive), context-aware: hides on designer/docs routes, tints on `.section-soft` | one centered attribution line, fixed `h-16`, always shown | Adopt context-hiding + height var; keep our copy | S |
| 37 | **Loading states** | `loading.tsx` + Suspense skeletons for `/create` and `/typeset` | none | **Adopt** for `/create` — heaviest route | S |
| 38 | **Blocks preview mechanism** | `<iframe src="/view/…">` inside `ResizablePanelGroup` with drag handle, `loading="lazy"` | our `/blocks/view/*` chrome-free routes exist (root layout `isBlockPreview` bypass) — good — but gallery doesn't iframe or offer resize | **Adopt resizable iframe** — the routes are already in place, so this is mostly viewer work | M |
| 39 | **`theme-color` meta + dark sync** | `META_THEME_COLORS`, head script updates it, `useMetaColor` hook | pre-paint dark-class script only (good), no `theme-color` | Adopt | S |
| 40 | **RSS feed** | `app/rss.xml/route.ts` | none | Defer | S |
| 41 | **Analytics / TailwindIndicator** | both present | none | Skip analytics; **adopt TailwindIndicator** as a dev affordance | S |

---

## Detail sections

### 1. Layout system — the root cause

shadcn defines exactly two width utilities in `app/globals.css:246-252`:

```css
@utility container-wrapper {
  @apply mx-auto w-full px-2 3xl:fixed:max-w-[calc(var(--breakpoint-2xl)+2rem)];
}
@utility container {
  @apply mx-auto max-w-[1400px] px-4 3xl:max-w-screen-2xl lg:px-8;
}
```

Plus `border-grid`, `section-soft` (`bg-linear-to-b from-background to-surface/40`) and `theme-container` at lines 234–244.

Every page composes them the same way — `container-wrapper` → `container` → content — so widening the site is a one-line change. Individual routes then opt *out*: the home showcase sets `lg:max-w-none`, `/create` and `/typeset` use `[--customizer-width]` and never wrap in `container` at all, and the designer layout uses `group-has-data-[slot=designer]/layout:max-w-none` to release the header.

We have **no shared utility**. `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8` (1152px) is copy-pasted across `site-header.marko`, `site-footer.marko`, `docs/+layout.marko`, `home-hero.marko`, `home-showcase.marko`, and `blocks-gallery.marko`. `max-w-4xl` in typeset, `max-w-3xl` in `component-page.marko`, `max-w-2xl` in the spike routes. `/create` and `/blocks/view/*` are the only genuinely full-width routes.

The gap is stark: shadcn's content container is **1400px, rising to 1536px at 3xl**; ours is **1152px, fixed forever**. At 1920px that is 768px of unused viewport, and the header — pinned at 1152px while `<main>` runs full-bleed — floats as a visibly narrower island above the content. This is exactly the "shadcn is always full width" observation.

**Recommendation.** Define `@utility container-wrapper` and `@utility container` in `app.css` mirroring shadcn's values, then replace all `mx-auto max-w-6xl px-4 sm:px-6 lg:px-8` occurrences. Everything else in this report gets easier afterward, so sequence it first.

Also adopt the CSS variables: `--header-height` (`calc(var(--spacing)*14)`, `lg:` ×16) and `--footer-height` (14, `xl:` 24), set on `<html>`/`<body>`. Our sticky offsets currently hardcode `top-14` / `top-20` / `3.5rem` in four files, which will drift.

### 2. Navbar

shadcn's `site-header.tsx` order: MobileNav (`lg:hidden`) → MainNav (`hidden lg:flex`) → `ml-auto` cluster of CommandMenu → Separator → GitHubLink+stars → Separator → ModeSwitcher → DesignerActions → Separator → **New** button.

Ours: MobileNav → wordmark → MainNav → `ml-auto` GitHubLink → ThemeToggle. Note shadcn has **no wordmark** in the header at all; ours does. Keep ours — an unfamiliar project needs the name more than shadcn does.

Missing affordances, with implementation cost against Marko 6 + Zag:

- **Command menu (#6).** shadcn's is 642 lines and leans on `cmdk` + `fumadocs-core/search/client`. We already ship `@zag-js/combobox`, `@zag-js/dialog` and a `/components/command` route, so the primitives exist. Scope to a build-time static index: 8 nav routes + 76 component pages + docs pages. Shortcuts to match: `⌘K`/`Ctrl+K` **and** bare `/` (`command-menu.tsx:380`), plus `⌘C` to copy the highlighted item (line 394). Trigger button copy is responsive — `"Search documentation..."` at `xl`, `"Search..."` below (lines 435–436). Full-text search is a separate, later project.
- **Stars (#7).** `github-link.tsx` does a server-side `fetch` with `next: { revalidate: 86400 }` and formats ≥1000 as `"Nk"`. Marko-run has no ISR equivalent, so either fetch at build time into a constant, or add a cached route handler. Wrap in a skeleton to avoid layout shift, as shadcn does.
- **"New" badges (#8).** Pure data — `PAGES_NEW` in `lib/docs.ts` is a string array; `MainNav` sets `data-new={PAGES_NEW.includes(item.href)}` and the sidebar renders `<span className="flex size-2 rounded-full bg-blue-500" title="New" />`. Directly portable.
- **Active states (#11).** Ours are applied by a post-mount client script, so the correct link is unhighlighted during first paint. `$global.url.pathname` is already used in our root layout for `isBlockPreview` — compute `data-active` server-side from it and the script disappears.

### 3. Home — exactly what shadcn shows

Hero (`app/(app)/(root)/page.tsx`):
- `<Announcement />` pill — `Badge variant="secondary" className="bg-muted"` linking to `/docs/changelog`, text "New Questionnaire component" + arrow.
- H1 "The Foundation for your Design System", `max-w-4xl` override.
- Description: "A set of beautifully designed components that you can customize, extend, and build on. Start here then make it your own. Open Source. Open Code."
- One CTA: "Build Your Own" → `/create?preset=b27GcrRo`.
- No stats row.

Showcase = `CardsDemo` (`app/(app)/(root)/cards/index.tsx`), **16 cards across 5 columns**, all under `app/(app)/(root)/cards/` unless noted:

| Col (visible from) | # | Component | File | Shows |
|---|---|---|---|---|
| 1 (always) | 1 | `UIElements` | `ui-elements.tsx` | buttons, input group, textarea, badges, radio, checkbox, switch, alert dialog, button group + dropdown |
| | 2 | `SidebarNav` | `sidebar-nav.tsx` | miniature sidebar with icon nav items |
| | 3 | `SavingsTargets` | `savings-targets.tsx` | goal list with progress bars |
| 2 (`lg`) | 4 | `ContributionHistory` | `contribution-history.tsx` | bar chart, last 6 months |
| | 5 | `ClaimableBalance` | `claimable-balance.tsx` | total + "Pending Setup" badge |
| | 6 | `DividendIncome` | `dividend-income.tsx` | holdings list w/ quarterly data |
| 3 (`min-[1400px]`) | 7 | `NewMilestone` | `new-milestone.tsx` | form: goal name, amount, date |
| | 8 | `PayoutThreshold` | `payout-threshold.tsx` | select + progress + textarea |
| | 9 | `AccountAccess` | `account-access.tsx` | credentials field group |
| 4 (`md`) | 10 | `QrConnect` | `qr-connect.tsx` | hand-coded 21×21 QR SVG |
| | 11 | `MessageScrollerDemo` | `examples/radix/message-scroller-demo.tsx` | AI chat with streaming/auto-scroll |
| | — | `TransferFunds` | `transfer-funds.tsx` | **commented out, not rendered** |
| | 12 | `Payments` | `payments.tsx` | breadcrumb + item list + dropdown |
| 5 (`min-[1900px]`) | 13 | `EmptyDistributeTrack` | `empty-distribute-track.tsx` | empty state + CTA |
| | 14 | `AnalyticsCard` | `analytics-card.tsx` | 418.2K visitors +10%, SVG area chart |
| | 15 | `NotificationSettings` | `notification-settings.tsx` | checkbox field list |
| | 16 | `PowerUsage` | `power-usage.tsx` | hourly usage bar chart |

Grid container:
```
relative z-10 mx-auto grid gap-(--gap) **:data-[slot=card]:w-full
min-[1400px]:grid-cols-4! min-[1900px]:grid-cols-5!
md:max-w-3xl md:grid-cols-2 lg:max-w-none lg:grid-cols-3
xl:max-w-[1600px] 2xl:max-w-[1900px]
```

Ours renders 5 cards — `card-ui-elements`, `card-notifications`, `card-analytics`, `card-install`, `card-component-stats` — in `grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3`. Note `card-install` and `card-component-stats` have no shadcn counterpart; they are ours and worth keeping in the Beyond-shadcn section.

Progressive column reveal is the mechanism worth copying: each column is a separate div with its own `hidden`/`flex` breakpoint, so wide screens gain density rather than stretching cards. That, plus `lg:max-w-none`, is what makes shadcn's home read as full-width.

### 4. Docs

- **Typography.** shadcn styles MDX through `mdx-components.tsx`. Ours applies one ~40-selector arbitrary-variant chain on the `<article>` in `docs-article.marko`. It works and is readable; not worth changing. Base size differs: shadcn `text-[1.05rem] sm:text-[15px]`, ours `text-sm leading-7`.
- **Code blocks (#21).** Ours is honest about it: *"no syntax highlighting pipeline here, just the chrome."* Copy button and filename/language header are already there, so adding Shiki at build time is a contained change and the single biggest docs upgrade after width.
- **TOC (#24).** Ours is `xl:block` — meaning on a 1280px laptop there is **no table of contents at all**. shadcn's `dropdown` variant ("On This Page" button + DropdownMenu) covers exactly that range. Both use `IntersectionObserver` for the active heading, so only the presentation differs.
- **Breadcrumbs.** Ours renders `Docs / <title>` on every docs page. shadcn defines `docs-breadcrumb.tsx` but the page body does not appear to render it. **Ours is better here** — keep it.
- **Component pages (#28).** The sharpest IA gap after width. All 76 `/components/*` pages use `component-page.marko` — `max-w-3xl`, a "← marko-ui" back-link, title, description — with no sidebar, no TOC, no pager, no breadcrumb. On shadcn, component docs *are* docs pages. Routing them through `docs-article.marko` reconnects 76 pages to the site's navigation.

### 5. Pages we lack

**Colors (#31)** is the standout adoption. `/colors` renders the Tailwind palette in five formats with click-to-copy and a toast (`components/color.tsx` uses `useCopyToClipboard` + `toast.success`). It is static data, and we already ship `@zag-js/clipboard` and a toast component — no React dependency anywhere. High value per unit effort.

**Charts (#30)** is 70 components across 7 categories, all Recharts. There is no Marko charting layer to port onto, so this is a roadmap decision about charting, not a site task. Skip until that exists.

**Directory (#32)** presumes a third-party registry ecosystem. **Examples (#33)** overlaps our `/blocks`. Both defer.

**Blocks (#38).** Our chrome-free `/blocks/view/*` routes already mirror shadcn's `/view` — the hard architectural part is done. What's missing is the viewer: shadcn iframes those routes (`height: item.meta?.iframeHeight ?? 930`, `loading="lazy"`) inside a `ResizablePanelGroup` with a drag handle, so users can test responsive behavior in place. We ship `@zag-js/splitter`. Good ROI.

### 6. Meta, footer, 404, loading

- **Meta (#4).** We emit a static `<title>marko-ui</title>` and nothing else — no description, no OG, no Twitter card, no favicon file (`public/` holds only `r/` and `placeholder.svg`). Every share link renders bare. shadcn's `app/og/route.tsx` generates 1200×628 PNGs from `?title=&description=` with embedded Geist fonts. Two-stage fix: per-route static title/description/OG first (S), a generated OG endpoint later (M).
- **404 (#5).** Ours returns HTTP 404 with a completely empty document — no header, no footer, no title. Add a `+404.marko` reusing the site shell.
- **Footer (#36).** shadcn's hides itself on designer and docs routes via `group-has-[[data-slot=designer]]/body:hidden` and `group-has-[[data-slot=docs]]/body:hidden`, and tints under `.section-soft`. Ours always renders at a fixed `h-16`. Adopt the context behavior; keep our attribution copy.
- **Loading (#37).** shadcn has `loading.tsx` for `/create` and `/typeset` with dedicated skeletons. We have none. `/create` is our heaviest route and the best candidate.

---

## Suggested sequencing for the next fleet

1. **Container/width fleet** — #1, #2, #3, #15, plus `--header-height`/`--footer-height`. Unblocks everything; fixes the loudest complaint.
2. **Navbar fleet** — #7, #8, #9, #10, #11, #13 (all S), then #6 command menu (M).
3. **Home showcase fleet** — #14, #20 (already in flight).
4. **Docs quality fleet** — #21 highlighting, #24 TOC dropdown, #28 component pages into the docs shell.
5. **Meta/chrome fleet** — #4, #5, #36, #37, #39.
6. **New pages** — #31 colors, #38 blocks viewer.

Deliberately excluded: charts (#30), directory (#32), examples (#33), sera (#34), base switcher (#29), mobile hero image (#16), skeleton rails (#17), analytics (#41). Each depends on infrastructure or an ecosystem we do not have, and none addresses a defect a visitor would notice today.
