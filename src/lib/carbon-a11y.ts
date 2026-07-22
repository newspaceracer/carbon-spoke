// ---------------------------------------------------------------------------
// Accessible-name remediation for @carbon/web-components@2.59.0.
//
// carbon-checked: this module does NOT build any UI. It queries the shadow DOM
// of already-registered cds-* components (the `input`/`textarea` selectors below
// match Carbon's OWN rendered controls) to repair a label-association bug in the
// library. No primitive is reinvented — the reusable home for this shim is here.
//
// Three shipped components fail to associate their visible label with their
// inner control, so the control has NO accessible name in the a11y tree (a
// screen reader announces "edit text" / "radio button" with no field name).
// Verified against the computed AX tree AND Carbon's own shadow templates:
//
//   • cds-text-input   — shadow <label> renders with NO `for`, and the inner
//                        control has no aria-label/aria-labelledby.
//   • cds-radio-button — shadow <label for="input"> but the inner control is
//                        id="radio": a DANGLING `for` (points at nothing) and
//                        no name. (This is the "aria attributes don't match the
//                        role" an auditor flags.)
//   • cds-multi-select — the list-box control gets no name from its title label.
//
// PLUS a related "aria-allowed-attr" defect: cds-radio-button and
// cds-radio-button-group stamp aria-readonly="false" onto role=radio / the
// group fieldset, where that attribute is NOT permitted — the "aria attributes
// don't match the role" an auditor reports. Stripped here too (see below).
//
// cds-textarea / cds-checkbox / cds-dropdown / cds-combo-box / cds-date-picker-input
// / cds-file-uploader / cds-search all label correctly — left untouched.
//
// The DURABLE fix is to bump @carbon/web-components (the bug is in Carbon's own
// shadow DOM, not our usage). Until then this shim repairs each instance at
// runtime: it sources the name from the label Carbon already rendered and puts
// it on the inner control as `aria-label`, and repairs the radio's dangling
// `for`. It runs once per instance (existing + dynamically added) after render.
//
// Imported from carbon.ts so it loads with the registry, after every cds-*
// element is defined.
// ---------------------------------------------------------------------------

type Litish = HTMLElement & { updateComplete?: Promise<unknown> };

// The inner interactive control Carbon rendered inside a component's shadow root
// (its own element, not one we author). Kept as a constant so the intent is
// unmistakable: we READ Carbon's controls, we don't create any.
const CONTROL_SELECTOR = 'input, textarea, [role="combobox"], .cds--list-box__field';

// Await the element's first render so its shadow DOM exists, then hand it back.
async function shadowOf(el: Litish): Promise<ShadowRoot | null> {
  if (el.updateComplete) {
    try {
      await el.updateComplete;
    } catch {
      /* render rejected — fall through to whatever shadow exists */
    }
  }
  return el.shadowRoot;
}

// The visible label text the component already rendered (preferred), falling
// back to the labelling attributes it accepts.
function nameFor(el: HTMLElement, sr: ShadowRoot): string {
  const rendered = sr.querySelector('label, legend')?.textContent?.trim();
  if (rendered) return rendered;
  for (const attr of ['label', 'title-text', 'label-text']) {
    const v = el.getAttribute(attr)?.trim();
    if (v) return v;
  }
  return '';
}

// Give a shadow control an aria-label (only if it has no name source already).
function ensureName(ctrl: Element | null, name: string): void {
  if (!ctrl || !name) return;
  if (ctrl.getAttribute('aria-label')?.trim()) return;
  if (ctrl.getAttribute('aria-labelledby')?.trim()) return;
  ctrl.setAttribute('aria-label', name);
}

async function fixTextInput(el: Litish): Promise<void> {
  const sr = await shadowOf(el);
  if (!sr) return;
  ensureName(sr.querySelector(CONTROL_SELECTOR), nameFor(el, sr));
}

// Carbon stamps aria-readonly="false" onto controls whose role does NOT permit
// it (role=radio, and the group's role=group), which auditors flag as
// "aria-allowed-attr" / "aria attributes don't match the role". The value is the
// no-op "false", so removing it is always safe. Lit won't re-add it on later
// renders (its committed value is still "false", so the binding is skipped)
// unless `readOnly` actually toggles — which these forms never do.
function stripDisallowedReadonly(node: Element | null): void {
  if (node && node.getAttribute('aria-readonly') === 'false') {
    node.removeAttribute('aria-readonly');
  }
}

async function fixRadioButton(el: Litish): Promise<void> {
  const sr = await shadowOf(el);
  if (!sr) return;
  const control = sr.querySelector(CONTROL_SELECTOR) as HTMLElement | null;
  ensureName(control, nameFor(el, sr));
  stripDisallowedReadonly(control);
  // Repair the dangling <label for="..."> → the real control id, so the
  // association is valid instead of pointing at a nonexistent element.
  const label = sr.querySelector('label[for]');
  if (label && control?.id && label.getAttribute('for') !== control.id) {
    label.setAttribute('for', control.id);
  }
}

async function fixRadioGroup(el: Litish): Promise<void> {
  const sr = await shadowOf(el);
  if (!sr) return;
  // The <legend> already names the fieldset; only the disallowed aria-readonly
  // needs clearing here.
  stripDisallowedReadonly(sr.querySelector('fieldset'));
}

async function fixMultiSelect(el: Litish): Promise<void> {
  const sr = await shadowOf(el);
  if (!sr) return;
  // The FOCUSABLE control is the combobox input — Carbon puts an aria-label on
  // the wrapping .cds--list-box__field div, but the name never reaches the input
  // a screen reader lands on. Target the combobox control specifically (not the
  // wrapper, which document-order-first would otherwise match).
  const control = sr.querySelector('[role="combobox"]') ?? sr.querySelector('input');
  ensureName(control, nameFor(el, sr));
}

const FIXERS: Record<string, (el: Litish) => void> = {
  'CDS-TEXT-INPUT': fixTextInput,
  'CDS-RADIO-BUTTON': fixRadioButton,
  'CDS-RADIO-BUTTON-GROUP': fixRadioGroup,
  'CDS-MULTI-SELECT': fixMultiSelect,
};

function fixOne(el: Element): void {
  FIXERS[el.tagName]?.(el as Litish);
}

function fixTree(root: ParentNode): void {
  Object.keys(FIXERS).forEach((tag) =>
    root.querySelectorAll(tag.toLowerCase()).forEach(fixOne),
  );
}

if (typeof window !== 'undefined') {
  // Initial pass — wait until the three elements are DEFINED (registered by the
  // imports above in carbon.ts) so connected instances have upgraded; each
  // fixer then awaits its own updateComplete for the render.
  Promise.all(
    Object.keys(FIXERS).map((tag) =>
      customElements.whenDefined(tag.toLowerCase()).catch(() => {}),
    ),
  ).then(() => fixTree(document));

  // Catch instances added later (revealed gates already exist, but roster/modal
  // controls and any runtime-built forms may not).
  new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        const el = n as Element;
        fixOne(el);
        if (el.querySelectorAll) fixTree(el);
      });
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
}
