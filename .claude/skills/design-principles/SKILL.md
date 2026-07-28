---
name: design-principles
description: The aesthetic, accessibility, and correctness rules for this Carbon spoke — load before styling, reviewing, or building ANY UI, and during /ship reviews. Covers token-first discipline (var(--cds-*) not SCSS $vars, never target .cds-- internals), Carbon's type scale (no imposed 16px floor), status meaning (colored Tag is NOT a status — use cds-icon-indicator/cds-shape-indicator; never color alone), the 2x Grid (CSS-Grid flavor: .cds--css-grid/.cds--css-grid-column/.cds--{bp}:col-span-N; the legacy .cds--row/.cds--col-lg-N are NOT in the prebuilt CSS), the WCAG 2.2 accessibility contract, overlay & confirmation patterns (never stack a modal on a modal — forgo, confirm inline, or offer undo; reserve confirms for consequential/destructive actions; match the add-control to the task — author→modal, attach-existing-bulk→multi-select, managed roster→base-page modal; one management surface per collection, the duplicate view is read-only), control sizing & kind (never omit cds-button size=; page primary → lg, section/header actions → md, table-row cell actions → sm, icon-only/dense toolbars → sm; section-header action buttons are tertiary/outline, not ghost; cds-tag size by context — grid→sm, header→lg, else→md; peer buttons share one affordance, no lone icons), icon-name verification, and mock-data rules. Distilled from IBM's Carbon guidance reconciled with the house rules. carbon-first owns the component lookup order; this skill owns how the result looks and behaves.
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

1. **The 2x Grid is CSS-class-based (CSS-Grid flavor) and ships with
   `@carbon/styles`** (already loaded, no JS import). Container `cds--css-grid`,
   children `cds--css-grid-column` + span classes `cds--col-span-N` /
   `cds--sm:col-span-N cds--md:col-span-N cds--lg:col-span-N` (16 cols @ lg, 8 @ md,
   4 @ sm; `cds--{bp}:col-start-N` for offsets). Container modifiers: `--condensed`,
   `--narrow`, `--full-width`, `--with-row-gap`. Reference: `permit.astro` Overview.
2. **The legacy flexbox classes `cds--row` / `cds--col-lg-N` are NOT in the prebuilt
   CSS** — they render as unstyled `<div>`s. Do not use them. **`<cds-row>` does not
   exist** either; the element grid is a *two-level* system (`<cds-grid>` →
   `<cds-column>`) needing an explicit import
   (`@carbon/web-components/es/components/grid/index.js`) — prefer the CSS classes.
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

## 6. Overlays & confirmation (Must)

1. **Never stack a modal on a modal.** If a control lives inside an open
   `cds-modal` (or side panel/drawer), do NOT open a second `cds-modal` on top to
   confirm it — two overlays fight over the focus trap, scrim, and Escape
   handling, and it reads as a dialog stack the user gets lost in. Carbon's own
   guidance is against stacking. Pick one of these instead:
   - **Forgo the confirm** when the action is reversible *in place* — e.g. a draft
     roster row you can immediately re-add. Just act. (A specimen/participant/park
     removed during application entry is immediate; a district member removed on
     its base page confirms.)
   - **Confirm inline** — swap the affected row/region into a "Confirm / Cancel"
     state within the same modal, no second overlay.
   - **Undo over confirm** — act immediately and surface an undo affordance
     (e.g. a `cds-actionable-notification`).
2. **Confirmation modals open from a base page, never from within another
   overlay.** A destructive/consequential action taken *on a page* (deleting a
   shared or downstream record) gets a `danger` `cds-modal`; the same class of
   action taken *inside* an editing modal uses an in-modal alternative above.
3. **Reserve a confirm for the consequential.** Confirm removals of shared or
   downstream records (a district member, a printed special condition, a category
   tag) and named destructive actions (Deny, Revoke). Do not gate quick, in-place
   draft edits (adding/removing a specimen, participant, or park during entry)
   behind a modal — that friction trains users to click through confirmations.
4. **Match the add-control to the task, and never stack a modal to add:**
   - *Author a new multi-field record* (doesn't exist yet) → a `cds-modal` form.
   - *Attach existing items, low-stakes / bulk* (no confirm) → a filterable
     `cds-multi-select` that **applies on selection** (permit tags, study-area parks).
   - *Attach an existing item into a managed roster* (deliberate pick → confirm) →
     a **button-first modal on a base page**: "Add X" opens a modal, you pick, the
     modal's own primary button commits. NOT an inline combo + trailing "Add" —
     that reverses the app's click-Add-then-do order and the trailing button is
     easy to miss.
5. **One management surface per collection.** Don't put add/remove controls for the
   same collection in two places. If the collection also appears inside another
   modal, that copy is **view-only** — managing it there would stack a modal on a
   modal. (The analysis team is managed on the permit Overview; the header's
   "Analysis review" modal only displays it + its progress.)

## 7. Control sizing & kind (Must)

1. **Never omit `size=` on `cds-button`.** Its default is `lg` (48px) — omitting it
   silently ships a large button. Set the size explicitly, every time.
2. **House button scale, by context:**
   - Page-level form submit / primary CTA → `lg`.
   - Section-header / card-header / rail / standalone labeled action → `md`.
   - **Action button *inside a `cds-table` / `DataGrid` row cell* → `sm`** (Edit,
     Approve, Deny, replace, and the per-row action cluster of a `cds-contained-list`
     item). Dense per-row actions read `sm`, not `md`.
   - Never leave a labeled button at the implicit default.
3. **Icon-only + dense chrome stay `sm`:** `cds-icon-button` (row remove, overflow)
   and dense editor toolbars (the rich-text formatting bar) use `size="sm"` — `md`
   bloats row height and toolbars.
4. **Don't mix scales in one action row** — a cluster of buttons is all one size
   (all `sm` in a table row, all `md` in a header), never a mix. A labeled button
   sitting beside an icon-button in a row matches it at `sm`.
5. **Kind follows position:**
   - **Section-header action** (`PermitSection` `slot="aside"`, both "Add …" and
     "Edit") → `tertiary` (outline). One outlined affordance per section header.
   - **Table / grid row-cell action** → `ghost` (and `danger-ghost` for the
     destructive one, e.g. Deny/Revoke). Row actions are low-emphasis — never
     `primary` or `tertiary` in a row, even the affirmative one (Approve is ghost
     beside a danger-ghost Deny).
   - A grid's own *toolbar* chrome (column manager, Reset) is not a row action —
     it keeps its section-level treatment.
6. **Inside a compact card, prefer an icon-button over a text button.** A per-card
   action (e.g. Edit on an Email-notification card) is a ghost `cds-icon-button`
   with a `tooltip-content` slot naming the target ("Edit <name>"), not a labeled
   text/outline button — a full button is too heavy for card chrome. Reuse the
   house pencil/trash SVG so the icon matches the rest of the app.
7. **`cds-tag` size follows context:** in a **table / grid** → `sm`; in a page /
   banner **header** → `lg`; **everywhere else** (facts lists, modals, body) →
   `md`, matching the elements around it. (A tag previewing a grid tag is the one
   judgment call — match the grid at `sm` if fidelity matters.)
8. **Consistent affordance across peer buttons.** Don't give one button in a set an
   icon the others lack — the "Add …" section actions are text-only across the app,
   so none carries a lone plus-icon.

## 8. Icons (Must)

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
4. **A hand-authored SVG slotted into `cds-icon-button` or `cds-link` MUST carry
   `fill="currentColor"`.** Those two hosts style the slotted icon with `color:`
   only — *not* `fill:` — so a bare `<path>` renders the SVG default (black). It
   only *looks* right in a light zone (≈ the near-black `--cds-icon-primary` token)
   and goes wrong on a dark `cds--g90`/`cds--g100` zone, and on the selected /
   hover / disabled states where the token changes but the black fill doesn't.
   With `fill="currentColor"` the glyph tracks the host's `color` token in every
   theme and state. **`cds-button`, `cds-tag`, `cds-clickable-tile`, and the
   UI-shell actions all set `fill` on the slot themselves** — icons in those are
   fine without an explicit fill, so don't cargo-cult it everywhere; it's the two
   `color:`-only hosts that need it. (Verify a host's behavior by grepping its
   shadow CSS for `::slotted(...){...fill...}` in
   `node_modules/@carbon/web-components/es/components/<host>/*.js`.)

## 9. House aesthetic (Should — on top of Carbon)

- **Surfaces are a design tool — use them with intent.** Tiles (`cds-tile`),
  value layers (`--cds-layer-01/02`), and boxed cards are legitimate ways to
  group, separate, or elevate content — Carbon ships them for exactly this.
  Reach for one when it clarifies structure or creates useful hierarchy; skip it
  when a plain editorial block (heading + whitespace) already reads clearly.
  Neither "always box it" nor "never box it" is the rule — decide per section.
- **Color can carry meaning and identity, not just the primary action.** Layer
  neutrals with `--cds-background` / `--cds-layer-01/02` for value; use hue where
  it helps — data, categories, accents, expressive moments. Keep enough restraint
  that status color (§3) still reads, and that saturated color stays meaningful
  rather than decorative noise.
- **Tags are compact and quiet** — Carbon's default `cds-tag` is already right;
  don't bulk it up. Vertically center tags in table cells.
- **Sibling controls match** in rendered height and size across a row/bar; default
  control size is `md`.
- **Never leak internal vocabulary** (ticket keys, tenant/data-model names) into
  user-facing copy.

## 10. Mock data (Must)

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
