# Carbon accessibility fixes — READ BEFORE PORTING TO PROD

**Status:** active workaround · **Affects:** `@carbon/web-components@2.59.0` (latest on npm as of this writing) · **Owner-action required in prod:** yes

## TL;DR

Three shipped `@carbon/web-components` form components produce **critical WCAG failures** out of the box — inputs and radios with **no accessible name**, and radios/groups with a **disallowed ARIA attribute**. This is in Carbon's own shadow DOM, **not** in how we use the components, and it is **not fixed in the latest Carbon release**.

This prototype patches it at runtime with a small shim: [`src/lib/carbon-a11y.ts`](../src/lib/carbon-a11y.ts), loaded once from [`src/carbon.ts`](../src/carbon.ts). **When you build the production app, you must carry the same fix over** (or upgrade to a Carbon version that resolves it — see [Durable fix](#durable-fix)).

## Does this apply to your prod stack?

- **You use `@carbon/web-components` (the `cds-*` custom elements):** ✅ Yes, these defects apply. Port the shim.
- **You use `@carbon/react` (the React component library):** ⚠️ These *specific* defects are shadow-DOM-specific to the web-components package, so they likely don't reproduce — **but verify** with the [audit](#how-to-verify) before assuming. React's `TextInput`/`RadioButton` render light DOM with real `<label htmlFor>`, which is usually fine.
- **Mixed / other framework wrapping the web components:** ✅ Same defects; the shim is framework-agnostic (it patches the rendered shadow DOM, independent of Astro/React/Vue).

## The defects (all verified in Carbon's source + the live a11y tree + axe-core)

| # | Component | axe rule | What Carbon does wrong |
|---|-----------|----------|------------------------|
| 1 | `cds-text-input` | `label` (critical) | Shadow `<label>` renders with **no `for`**, and the inner `<input id="input">` has no `aria-label`/`aria-labelledby` → **no accessible name**. |
| 2 | `cds-radio-button` | `label` (critical) | Shadow `<label for="input">` but the inner control is `<input id="radio">` → the `for` points at **nothing** → no name. |
| 3 | `cds-radio-button` / `cds-radio-button-group` | `aria-allowed-attr` (critical) | Stamps `aria-readonly="false"` onto `role="radio"` and the group `<fieldset>` (`role="group"`), where that attribute is **not permitted** → *"ARIA attributes do not match the role."* |
| 4 | `cds-multi-select` | `aria-input-field-name` | Puts the `aria-label` on the wrapper `.cds--list-box__field` **div**, not on the focusable `<input role="combobox">` a screen reader lands on → no name. |

**Not affected (label correctly, leave alone):** `cds-textarea`, `cds-checkbox`, `cds-dropdown`, `cds-combo-box`, `cds-date-picker-input`, `cds-file-uploader`, `cds-search`.

### Evidence

Carbon's own shadow template for text-input (`node_modules/@carbon/web-components/es/components/text-input/text-input.js`):

```js
// label has no `for`; the <input id="input"> has no aria-labelledby anywhere in the file
const labelWrapper = html`<div class="cds--text-input__label-wrapper">
  <label class="${labelClasses}"><slot name="label-text">${label}</slot></label>
  ...
```

Radio (`radio-button/radio-button.js`): `<input id="radio" ... aria-readonly="false" ...>` paired with `<label for="input" ...>`.

## The fix

A runtime shim that, for every affected instance (existing **and** any added later, via `MutationObserver`), after the element renders:

1. reads the label Carbon already displayed and sets it as `aria-label` on the real inner control,
2. repairs the radio's dangling `for` to point at the actual control id,
3. strips the disallowed `aria-readonly="false"`.

It's ~40 lines, has zero dependencies, and self-documents. Full source: [`src/lib/carbon-a11y.ts`](../src/lib/carbon-a11y.ts). Wire-up (load it **after** the component registry so every element is defined):

```ts
// src/carbon.ts — after all the `import '@carbon/web-components/es/components/*'` lines:
import './lib/carbon-a11y';
```

### Porting notes for prod

- **Load order matters.** The shim waits on `customElements.whenDefined(...)`, so it's safe to import last in your registry module regardless of framework.
- **It patches shadow DOM, so it survives re-renders** — Lit doesn't re-add the stripped `aria-readonly` (its committed value is unchanged), and it doesn't manage the `aria-label` we add. Verified stable after typing/clicking.
- **If your prod app registers components differently** (e.g., side-effect imports in a bundle entry), just import the shim once from that same entry, after the registrations.
- **Keep the `carbon-checked:` comment** in the shim if your repo runs the carbon-first hook — the `querySelector('input')` strings trip it (false positive; we *query* Carbon's controls, we don't build any).

## How to verify

Run axe-core against the rendered page and confirm these rules report **zero** nodes: `label`, `aria-allowed-attr`, `aria-input-field-name`, `aria-required-attr`, `select-name`. In this repo we drove a headless browser, injected `axe.min.js`, and ran `axe.run(document, { runOnly: { type: 'rule', values: [...] } })` on every step — before the shim: `label` = 20 nodes, `aria-allowed-attr` = 6 nodes; after: **0 across all pages, and still 0 after interacting with the form.**

Quick manual check in DevTools: inspect a `cds-text-input`'s inner `<input>` → the **Accessibility** pane should show a computed **Name**. Before the fix it's empty.

## Durable fix

The real fix is upstream. Before shipping prod:

1. Check for a newer `@carbon/web-components` (`npm view @carbon/web-components version`) — as of this writing **2.59.0 is latest and still has the bug**.
2. **File/track an issue** on [`carbon-design-system/carbon`](https://github.com/carbon-design-system/carbon/issues) for the web-components label association + `aria-readonly` on radio, if one doesn't already exist.
3. When a fixed version ships, upgrade, re-run the [verification](#how-to-verify), and if clean, **delete `src/lib/carbon-a11y.ts` and its import in `src/carbon.ts`.**

## Checklist for the prod developer

- [ ] Confirm prod uses `@carbon/web-components` (if `@carbon/react`, verify separately — likely N/A).
- [ ] Copy `src/lib/carbon-a11y.ts` into the prod app.
- [ ] Import it once, after the Carbon component registrations.
- [ ] Run an axe (or Lighthouse/WAVE) pass; confirm `label` and `aria-allowed-attr` are clean on every form screen.
- [ ] Add a tracking ticket to remove the shim once Carbon fixes it upstream.
