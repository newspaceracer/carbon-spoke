---
name: carbon-first
description: MANDATORY before building ANY UI in this Carbon spoke — components, forms, dialogs, modals, tables, file uploads, buttons, tiles, tags, notifications, AND page layout/composition. Triggers on editing .astro/.css/.scss, on writing UI-generating JavaScript (innerHTML, template-literal markup, DOM-built controls), and on "make a component", "build a page/screen", "style this", "lay out this page", "add a modal/drawer/table/upload". Enforces the Carbon-first lookup order (stock cds-* web component -> compose cds-* -> only then a documented bespoke wrapper) and token-based reskinning (override --cds-* tokens, never hand-roll component CSS). NEVER hand-roll a UI primitive that a cds-* component already provides. A PreToolUse hook (check-carbon-first) blocks the obvious violations, but it cannot see string-built markup — in runtime JS the discipline is on you.
---

# Carbon-First (Compose cds-*, Never Reinvent)

## Purpose
This repo is an **Astro spoke of the Carbon Design System**. Its job is to
*compose existing `cds-*` web components* (`@carbon/web-components`), not to
hand-roll bespoke CSS/HTML primitives. Every reinvented control drifts from
Carbon, duplicates tested/accessible behavior, and rots.

A **PreToolUse hook** (`.claude/hooks/check-carbon-first.mjs`) blocks Write/Edit
that introduces bespoke primitives. This skill is how you stay ahead of it.

## The Non-Negotiable Lookup Order

When ANY UI is needed, walk these tiers **in order**. Stop at the first hit.

### 1. Find the stock Carbon component FIRST
Carbon ships a large, complete, accessible catalog. It almost always has what
you need. **List the live catalog — the source of truth:**

```bash
ls node_modules/@carbon/web-components/es/components/
```

Then register + use it:

```ts
// src/carbon.ts — the app's component registry. Add ONE line:
import '@carbon/web-components/es/components/modal/index.js';
```
```html
<!-- then the tag just works, anywhere (Astro markup OR a JS string) -->
<cds-modal open>
  <cds-modal-header><cds-modal-heading>Export</cds-modal-heading></cds-modal-header>
  <cds-modal-body><cds-text-input label="Filename"></cds-text-input></cds-modal-body>
</cds-modal>
```

**These are real custom elements.** Once the module is imported they work from
*any* HTML string in *any* stack — so runtime/JS-built UI (`innerHTML`, template
literals) is NOT an excuse to hand-roll. Import the module, use the tag.

> The hook cannot see markup built inside a JS template literal. **A green hook
> run is not proof you used Carbon** — in runtime-JS code the discipline is on you.

### 2. Compose cds-* components into a reusable section component
If no single component is the whole section, build a small Astro (or Lit)
component that **composes cds-\* legos + layout**. Put it in `src/components/`.
The section's structure is yours; its controls are still `cds-*`.

### 3. ONLY THEN a documented bespoke wrapper
If — and only if — Carbon genuinely has nothing (check the catalog *and*
https://carbondesignsystem.com/components/overview/), build a **real, reusable,
documented** component. Name its class with a project prefix, not a one-off blob.

## Reskin with TOKENS, never bespoke CSS

Carbon is themed entirely through `--cds-*` custom properties (the semantic token
layer). To change how components look:

- **Override `--cds-*` tokens** in `src/styles/theme.css`, under `:root` or a
  scope. One override reskins every component that reads that token.
- **Switch light/dark by ZONE** with the stock classes `cds--white` / `cds--g10`
  / `cds--g90` / `cds--g100` on a wrapper — no custom CSS.
- **Do NOT** write component CSS (`.my-modal { ... }`) to restyle a Carbon part.
  Find the token. Token list: https://carbondesignsystem.com/elements/color/tokens/

## Reinvented → Use the Component (cautionary table)

| Reinvented (bespoke) | Use the Carbon component |
|----------------------|--------------------------|
| raw `<input>` / `<select>` / `<textarea>` | **cds-text-input** / **cds-dropdown** / **cds-textarea** |
| styled `<button class>` | **cds-button** / **cds-icon-button** |
| a `.foo-modal` / `.foo-drawer` CSS block | **cds-modal** / **cds-tearsheet** / **cds-side-panel** |
| a `.foo-dropzone` + file rows | **cds-file-uploader** |
| a `.foo-table` grid | **cds-table** (data-table) |
| a `.foo-tabs` / `.foo-accordion` | **cds-tabs** / **cds-accordion** |
| a `.foo-tag` / `.foo-tile` / `.foo-badge` | **cds-tag** / **cds-tile** / **cds-badge-indicator** |
| a `.foo-toast` / `.foo-alert` | **cds-notification** (inline / toast) |
| a `.foo-tooltip` / `.foo-popover` | **cds-tooltip** / **cds-popover** |
| a `.foo-pagination` | **cds-pagination** |

## Grids — two kinds, don't conflate them

**Layout grid** (dividing the page into columns): use Carbon's `cds-grid` /
`cds-column` (its 16-column responsive system), or a simple container + `cds-stack`
for narrow pages. Never hand-roll a column system.

**Data grid** (rows/columns of data): this spoke sanctions **two** options — pick
by the job, this is NOT a carbon-first violation:

| Use `cds-table` (Carbon) | Use AG Grid (`<DataGrid/>`) |
|--------------------------|-----------------------------|
| Static / display tables | Sorting, filtering, big/virtualized data |
| A handful of rows | Hundreds+ of rows, in-cell editing |
| Must look 100% native Carbon | Column pinning, resizing, grouping |

- **Simple → `cds-table`.** Register `data-table`, write the `cds-table-*` markup.
- **Heavy → `<DataGrid columns={...} rows={...} />`** (`src/components/DataGrid.astro`).
  It wraps a **Carbon-themed AG Grid** (`src/components/carbon-ag-grid.ts`) whose
  `--cds-*`-mapped theme follows light/dark zones automatically. AG Grid is a
  real dependency, not a reinvented primitive — that's why it carries a
  `carbon-checked:` note and the hook lets it through.

When unsure, start with `cds-table`; reach for `<DataGrid/>` the moment the table
needs interaction or scale.

## The Escape Hatch — `carbon-checked:`

The hook is a **hard block**. To legitimately proceed (because you walked the
catalog and nothing fits), assert that in the content via a comment:

```html
<!-- carbon-checked: no cds- component supports a draggable kanban column; kanban-column is the reusable home -->
```

Its presence anywhere in the new content allows the write. Use it honestly —
name what you searched and why nothing fit. CSS files use `/* carbon-checked: ... */`.

## Where things live
- **Registry**: `src/carbon.ts` — add a line per new component.
- **Theme/tokens**: `src/styles/theme.css` — the brand hook.
- **Shell**: `src/layouts/BaseLayout.astro`.
- **Pages**: `src/pages/**`. **Reusable sections**: `src/components/**`.
