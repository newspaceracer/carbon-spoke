# Carbon Spoke — Carbon Design System, composed fast

## What this is
A **Carbon spoke**: an Astro shell whose default component layer is
**`@carbon/web-components`** (the `cds-*` Lit web components). It borrows the
*workflow* of an ESA Ecology spoke — Astro shell + portable web components + a
Claude "component-first" plugin + token-layer theming — but the catalog is
**100% Carbon**, not `@esa/ecology`. There is no `@esa/ecology` dependency.

The point: **build UIs fast by composing Carbon's stock, accessible components**
instead of hand-rolling primitives.

## Architecture
- **`src/carbon.ts`** — the component registry. Importing a Carbon component's
  `index.js` registers its `<cds-*>` custom element(s). Add one line per new
  component. Imported once (client-side) from `BaseLayout`.
- **`src/styles/theme.css`** — pulls in `@carbon/styles/css/styles.css` (all
  `--cds-*` tokens + IBM Plex + theme-zone classes) and holds the **brand hook**
  (empty = default Carbon look).
- **`src/layouts/BaseLayout.astro`** — the shell. Loads the theme + registry.
- **`src/pages/**`** — screens. **`src/components/**`** — reusable sections.

## The one rule: Carbon-first
Before building ANY UI, walk the lookup order (the `carbon-first` skill is the
detail; a PreToolUse hook enforces the obvious cases):

1. **Stock `cds-*` component** — `ls node_modules/@carbon/web-components/es/components/`.
   It almost always exists. Register it in `src/carbon.ts`, use the tag.
2. **Compose `cds-*` into a `src/components/*` section** if no single component fits.
3. **Only then** a documented bespoke wrapper (rare).

**Reskin through TOKENS, never bespoke component CSS.** Override `--cds-*` in
`src/styles/theme.css`; switch light/dark by zone with `cds--white` / `cds--g10`
/ `cds--g90` / `cds--g100` on a wrapper. Never write `.my-thing { }` to restyle a
Carbon part — find the token.

Do NOT hand-roll a control Carbon ships: raw `<input>`→`cds-text-input`,
`<select>`→`cds-dropdown`, styled `<button>`→`cds-button`, a `.modal` block→
`cds-modal`, a dropzone→`cds-file-uploader`, a table→`cds-table`, etc.

## Grids
Two different things — don't conflate:
- **Layout grid** (page columns): the 2x Grid is **CSS-class-based** and ships with
  `@carbon/styles` (already loaded, no JS import). The prebuilt stylesheet ships the
  **CSS-Grid** flavor, so the classes are:
  `cds--css-grid` (container) › `cds--css-grid-column` + span classes
  `cds--col-span-N` / `cds--sm:col-span-N cds--md:col-span-N cds--lg:col-span-N`
  (16 cols @ lg, 8 @ md, 4 @ sm; also `xlg`/`max`, and `cds--{bp}:col-start-N` for
  offsets). Container modifiers: `--condensed`, `--narrow`, `--full-width`,
  `--with-row-gap`. Example: `permit.astro` Overview (main `cds--lg:col-span-11`,
  rail `cds--lg:col-span-5`).
  **The legacy flexbox classes `cds--row` / `cds--col-lg-N` are NOT in the prebuilt
  CSS — do not use them (they render as unstyled divs). `<cds-row>` does not exist.**
  The element grid (`<cds-grid>`/`<cds-column>`) needs an explicit import and is only
  for when a task calls for it. Or, for simple pages, container + `cds-stack`.
- **Data grid** (tabular data): the spoke sanctions **two** options, chosen by job:
  - **`cds-table`** — simple/display tables, native Carbon look, already installed.
  - **AG Grid** via **`<DataGrid columns rows height />`** (`src/components/DataGrid.astro`)
    — heavy tables (sorting, filtering, big/virtualized data, in-cell editing).
    It wraps a **Carbon-themed** AG Grid (`src/components/carbon-ag-grid.ts`) whose
    `--cds-*`-mapped theme follows light/dark zones. Loads only on pages that use it.

  Rule of thumb: **simple → `cds-table`; interactive-or-large → `<DataGrid/>`.**
  AG Grid is a sanctioned dependency, not a reinvented primitive.

## Conventions
- Web components register in a **client `<script>`** (they're browser-only). Never
  import `@carbon/web-components/**` in Astro frontmatter (that runs on the server).
- Carbon ships pre-compiled styles — **no Sass step**; the only stylesheet is
  `@carbon/styles/css/styles.css`.
- Page-level layout CSS (container width, gaps) is fine in a page's `<style>`;
  **component styling belongs in `cds-*` + `--cds-*` tokens**.
- Mock data is invented, deterministic, domain-credible — never real client data.

## Commands
```bash
npm install
npm run dev       # Astro dev server (HMR)
npm run build     # static build — the consolidated verification step
npm run preview   # preview the build
```

## Claude tooling (self-contained under `.claude/`)
- **Skill** `carbon-first` — the component lookup order + token discipline (load before any UI).
- **Skill** `design-principles` — how the result looks/behaves: token rules, Carbon
  type scale, status meaning (colored Tag ≠ status → `cds-icon-indicator`), the WC
  grid, the WCAG 2.2 accessibility contract, icon-name verification, mock-data rules.
  Distilled from IBM's Carbon guidance reconciled with the house aesthetic.
- **Hook** `check-carbon-first.mjs` (PreToolUse) — blocks bespoke primitives;
  escape hatch is a `carbon-checked: <reason>` comment. Enforces only in a repo
  that depends on `@carbon/web-components`.
- **Command** `/new-prototype` — interview → manifest → compose from `cds-*`.
- **Command** `/ship` — sync → review (design-principles + carbon-first) → build gate → commit.

This lives natively in `.claude/` (no marketplace). If multiple Carbon spokes
appear later, promote it to a shared `carbon-kit` plugin the way Ecology's hub
owns `spoke-kit`.
