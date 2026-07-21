---
name: design-principles
description: The aesthetic, accessibility, and correctness rules for this Carbon spoke — load before styling, reviewing, or building ANY UI, and during /ship reviews. Covers token-first discipline (var(--cds-*) not SCSS $vars, never target .cds-- internals), Carbon's type scale (no imposed 16px floor), status meaning (colored Tag is NOT a status — use cds-icon-indicator/cds-shape-indicator; never color alone), the Web-Components grid (.cds--grid/.cds--row/.cds--col-* classes; <cds-row> does not exist), the WCAG 2.2 accessibility contract, icon-name verification, and mock-data rules. Distilled from IBM's Carbon guidance reconciled with the house rules. carbon-first owns the component lookup order; this skill owns how the result looks and behaves.
---

# Design Principles (Carbon spoke)

Two skills, two jobs. **`carbon-first`** decides *which* component (the `cds-*`
lookup order, `cds-table` vs AG Grid). **This skill** governs *how the result
looks and behaves* — tokens, type, status, layout, accessibility. Load both
before building; `/ship` treats the "Must" items here as gates.

These rules are Carbon's own guidance (IBM) reconciled with the house aesthetic.
Where they conflicted, **Carbon wins inside a Carbon spoke** — noted inline.

---

## 1. Token-first styling (Must)

1. **Reskin by overriding `--cds-*` tokens**, never by editing component CSS.
   Brand changes live in `src/styles/theme.css`; light/dark is a zone class
   (`cds--white` / `cds--g10` / `cds--g90` / `cds--g100`) on a wrapper.
2. **Never target Carbon internal classes** (`.cds--btn`, `.cds--tile`, …) to
   restyle a component. If you can't achieve it via a token, it's a gap to note,
   not a license to override internals.
3. **In Web Components, use `var(--cds-*)` custom properties — never Carbon SCSS
   `$`-variables.** `$spacing-05`, `$layer-01`, `$text-primary` are compile-time
   only; at runtime they resolve to nothing and render unstyled. Use
   `var(--cds-spacing-05)`, `var(--cds-layer-01)`, `var(--cds-text-primary)`.
4. **No inline styles** except genuinely dynamic values (a user-dragged width, an
   animation transform). Everything else is a class reading tokens.
5. **No hardcoded hex/rgb** outside the theme file's brand ramp. Hardcoded color
   bypasses the token system and breaks in dark/high-contrast zones. A *checked*
   hard-code (you confirmed no token fits) is a note, not an error.

## 2. Type (Must)

1. **Carbon's type scale wins — there is no 16px floor here.** (This is the one
   place the house "16px body" rule is dropped: Carbon's productive body is
   ~14px and its components are built to it.) Don't inflate text to beat a floor.
2. **Never restyle text inside a `cds-*` component.** Its size/weight/leading are
   already on-scale. Only page-level prose is yours to size.
3. **The prebuilt Carbon CSS ships no `.cds--type-*` utility classes** (those need
   the SCSS pipeline). So page prose sizing is a *checked hard-code* in rem that
   tracks Carbon's scale — keep headings/body close to Carbon steps, don't invent
   an ad-hoc ladder.
4. **IBM Plex only, from the bundled `@carbon/styles` fonts.** Never add Google
   Fonts (or any non-IBM CDN) for Plex — it's both off-standard and a policy
   violation. The font is already loaded; don't re-import it.
5. **Never monospace for IDs, badges, headings, or body** — mono is for code only.

## 3. Status & meaning (Must)

1. **Never convey state by color alone.** Every status needs a text label, icon,
   or shape too (WCAG 1.4.1). This also means **no colored left-border-as-status**
   on cards/rows.
2. **A colored Tag is NOT a status indicator.** `cds-tag` *classifies* ("what is
   this?" — a category/label/filter). For *state* ("what's happening?") use
   **`cds-icon-indicator`** or **`cds-shape-indicator`** (`kind`: `failed`,
   `warning`, `caution`, `succeeded`, `in-progress`, `pending`, …). A red
   `cds-tag` reading "Failed" is the canonical mistake.
3. **Errors are announced, not just shown.** Use the component's `invalid` /
   error-text affordance (it wires `aria-describedby`), never a red border alone.

## 4. Layout & grid (Must)

1. **The Carbon Web-Components grid is CSS-class-based by default:** put
   `cds--grid` → `cds--row` → `cds--col-lg-N cds--col-md-N cds--col-sm-N` on
   `<div>`s. No JS import needed (comes with `@carbon/styles`).
2. **`<cds-row>` does not exist.** The element grid is a *two-level* system
   (`<cds-grid>` → `<cds-column>`) and needs an explicit import
   (`@carbon/web-components/es/components/grid/index.js`). Prefer the CSS classes;
   only use the element grid if a task specifically calls for it.
3. **Specify spans for all breakpoints** (`sm`/`md`/`lg`) on every column.
4. **One grid per logical content group.** A header, a tile row, and a footer are
   three separate grids — don't co-mingle groups that shouldn't wrap together.
5. **Overlays live outside grid flow** — modals, side panels, tooltips, toasts are
   not grid columns.
6. **`<body>` carries a Carbon theme class** (default `cds--white`) so nested
   zones resolve correctly.

## 5. Accessibility contract (Must — WCAG 2.2 AA)

1. **Every control has an accessible name.** `cds-text-input`/`cds-textarea`/
   `cds-dropdown`/`cds-checkbox`/`cds-search` need a visible label;
   `cds-icon-button` and any icon-only control need a text label/tooltip;
   `cds-modal` needs a heading. These are optional in the API but **mandatory for
   accessible output** — omitting them fails silently.
2. **Don't duplicate Carbon's built-in ARIA.** Carbon components already provide
   `role`, focus trap/return, expanded/selected state. Adding your own `role=` or
   a conflicting `aria-label` breaks assistive tech.
3. **Name from visible text** (WCAG 2.5.3). If a control shows "Submit", its
   accessible name must *contain* "Submit" — don't paraphrase it away in an
   `aria-label`.
4. **Never remove the focus ring.** No `outline: none` without an equal-or-better
   `:focus-visible` replacement using `var(--cds-focus)`.
5. **Custom interactive elements** (a clickable `<div>`) need `role` +
   `tabIndex="0"` + a key handler — or just use a real `<button>`/`cds-button`.
   Never `tabindex > 0`. Targets ≥ 24×24px.
6. **Semantic structure**: one `<h1>`, no skipped heading levels; groups of items
   are `<ul>`/`<ol>`, not stacked `<div>`s; landmarks (`<main>`, `<nav
   aria-label>`, `<header>`, `<footer>`) when not using a Carbon shell.
7. **Custom motion respects `prefers-reduced-motion`.** Carbon's own motion
   already does; anything you add must too.

## 6. Icons (Must)

1. **Never guess a Carbon icon export/slug from memory** — the names are not
   predictable (`chart--win-loss` → `ChartWinLoss`, `face--satisfied--filled` →
   `FaceSatisfiedFilled`; many intuitive names don't exist).
2. **Verify against the installed package** — it's MCP-free here:
   ```bash
   ls node_modules/@carbon/icons/es/ | grep -i <keyword>
   ```
   For a Web-Components import use the ES path + size, e.g.
   `import Add16 from '@carbon/icons/es/add/16.js';`.
3. **Decorative icons are `aria-hidden="true"`**; meaningful standalone icons get
   an accessible name.

## 7. House aesthetic (Should — on top of Carbon)

- **Polish is subtractive.** Cut per-item icons, non-informative chips, taglines,
  helper blurbs. If an element carries no information, remove it. Icons mark
  *structure* (section headers), never every row.
- **Surfaces stay neutral; color lives in content and the one primary action.**
  Layer neutrals with `--cds-background` / `--cds-layer-01/02` (value, not hue);
  reserve saturated color for the single primary button and for data.
- **Tags are compact and quiet** — Carbon's default `cds-tag` is already right;
  don't bulk it up. Vertically center tags in table cells.
- **Sibling controls match** in rendered height and size across a row/bar; default
  control size is `md`.
- **Never leak internal vocabulary** (ticket keys, tenant/data-model names) into
  user-facing copy.

## 8. Mock data (Must)

- **Invented, never derived** — realistic but fictional; never copied or lightly
  sanitized from real client documents. These repos are public.
- **Deterministic** — no `Math.random()` in anything shown; same inputs, same
  output every run.
- **Domain-credible** — real place names, plausible quantities, correct units and
  terminology. No lorem ipsum, no "Test Item 1".

---

**See also:** `carbon-first` for the component lookup order, the `cds-table` vs AG
Grid decision, and token-reskin mechanics. This skill assumes you've already
picked the right component; it governs how you finish it.
