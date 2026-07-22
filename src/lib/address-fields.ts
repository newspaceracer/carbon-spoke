// Client-side builder for a COUNTRY-AWARE address fieldset. The per-country
// field set / order / labels / required-ness live in the vendored libaddressinput
// slice (src/data/address.ts); this turns a country code into the matching
// stack of stock cds-* controls and reads them back into a generic `Address`.
//
// One home for the dynamic-field logic so the two person-level address sites
// (profile mailing address, research-team field-work contact) don't each
// reimplement it. Pages own their own view-first / persistence / reveal logic
// and drive this through the returned controller.
//
// carbon-checked: every control is a real Carbon custom element built via
// document.createElement('cds-text-input' | 'cds-combo-box' | 'cds-combo-box-item')
// — no hand-rolled primitive. The builder is dynamic (the field set depends on
// the runtime-chosen country), so it can't be static markup.

import { getAddressFormat, type Address, type AddressFieldSpec } from '../data/address';

/** Keys that should span the whole field grid rather than sit two-up. */
const WIDE_KEYS = new Set<AddressFieldSpec['key']>(['line1', 'line2', 'sublocality']);

/** Handle a page keeps to drive a wired fieldset. */
export interface AddressController {
  /** Current value, read from the live controls (country from the picker). */
  getValue(): Address;
  /** Replace the country + field values (rebuilds the field set). */
  setValue(address: Partial<Address>): void;
  /** Lock/unlock the picker + all fields (view-first mode). */
  setReadonly(readonly: boolean): void;
}

const q = <T extends HTMLElement = HTMLElement>(root: ParentNode, id: string) =>
  root.querySelector<T>(`#${id}`);

// cds-dropdown/-combo-box expose the flag as `readOnly` (attr `read-only`);
// cds-text-input uses `readonly`. One helper handles both — same rule the
// profile form already used inline.
const setRO = (el: any, ro: boolean) => {
  if (!el) return;
  if (el.tagName === 'CDS-DROPDOWN' || el.tagName === 'CDS-COMBO-BOX') el.readOnly = ro;
  else el.readonly = ro;
};

/** Build one cds-* control for a field spec: a SEARCHABLE combo-box when the
 *  field is a fixed list (region — state / province / prefecture…, often long),
 *  a text field otherwise. Value is set AFTER the items are appended so the
 *  combo-box can resolve the selection. */
function buildField(spec: AddressFieldSpec, prefix: string, value: string): HTMLElement {
  const id = `${prefix}-${spec.key}`;
  // Mark only the OPTIONAL subfields (libaddressinput knows which are optional —
  // e.g. a US address line 2); required is the silent default. This matches the
  // "label the exceptions" convention used across the permit application, where
  // required fields carry no marker.
  const label = spec.required ? spec.label : `${spec.label} (optional)`;
  if (spec.options) {
    const cb = document.createElement('cds-combo-box') as any;
    cb.id = id;
    cb.setAttribute('title-text', label);
    cb.setAttribute('label', 'Type to search…');
    spec.options.forEach((o) => {
      const item = document.createElement('cds-combo-box-item') as any;
      item.setAttribute('value', o.value);
      item.textContent = o.label;
      cb.appendChild(item);
    });
    if (value) cb.value = value;
    return cb;
  }
  const field = document.createElement('cds-text-input') as any;
  field.id = id;
  field.setAttribute('label', label);
  if (value) field.value = value;
  return field;
}

/** Fill `container` with the field stack for `countryCode`, seeded from `values`. */
export function renderAddressFields(
  container: HTMLElement,
  countryCode: string,
  values: Partial<Address>,
  prefix: string,
): void {
  const fmt = getAddressFormat(countryCode);
  container.replaceChildren();
  for (const spec of fmt.fields) {
    const field = buildField(spec, prefix, (values as any)[spec.key] ?? '');
    if (WIDE_KEYS.has(spec.key)) {
      const wrap = document.createElement('div');
      wrap.className = 'address-grid__wide';
      wrap.appendChild(field);
      container.appendChild(wrap);
    } else {
      container.appendChild(field);
    }
  }
}

/** Read the picker + every live field back into a generic `Address`. */
export function readAddressFields(root: ParentNode, prefix: string): Address {
  const country = (q<any>(root, `${prefix}-country`)?.value as string) || 'US';
  const fmt = getAddressFormat(country);
  const out: Address = { country, line1: '', city: '' };
  for (const spec of fmt.fields) {
    (out as any)[spec.key] = (q<any>(root, `${prefix}-${spec.key}`)?.value ?? '').toString();
  }
  return out;
}

/** Snapshot current field values by key (before a rebuild), so overlapping
 *  fields (line1, city, postalCode…) survive a country switch. */
function collectCurrent(fields: HTMLElement, prefix: string): Record<string, string> {
  const out: Record<string, string> = {};
  fields.querySelectorAll<any>('cds-text-input, cds-combo-box').forEach((el) => {
    const key = el.id.slice(prefix.length + 1);
    out[key] = (el.value ?? '').toString();
  });
  return out;
}

/** Wire an `<AddressFieldset>` root: render the initial fields from its
 *  `data-value`, rebuild on country change (preserving typed values), and
 *  return a controller the page uses for get/set/readonly. */
export function wireAddressFieldset(
  root: HTMLElement,
  opts: { readonly?: boolean; onChange?: () => void } = {},
): AddressController {
  const prefix = root.dataset.prefix || 'addr';
  const fields = root.querySelector<HTMLElement>('[data-fields]')!;
  const picker = q<any>(root, `${prefix}-country`);

  let readonly = !!opts.readonly;

  const initial: Partial<Address> = (() => {
    try {
      return JSON.parse(root.dataset.value || '{}');
    } catch {
      return {};
    }
  })();

  const applyReadonly = () => {
    setRO(picker, readonly);
    fields.querySelectorAll<any>('cds-text-input, cds-combo-box').forEach((el) => setRO(el, readonly));
  };

  const build = (countryCode: string, values: Partial<Address>) => {
    renderAddressFields(fields, countryCode, values, prefix);
    applyReadonly();
  };

  const startCountry = initial.country || picker?.value || 'US';
  if (picker) picker.value = startCountry;
  build(startCountry, initial);

  picker?.addEventListener('cds-dropdown-selected', () => {
    const next = picker.value || 'US';
    const preserved = collectCurrent(fields, prefix);
    build(next, { ...preserved, country: next });
    opts.onChange?.();
  });

  return {
    getValue: () => readAddressFields(root, prefix),
    setValue: (address) => {
      const country = address.country || 'US';
      if (picker) picker.value = country;
      build(country, address);
    },
    setReadonly: (v) => {
      readonly = v;
      applyReadonly();
    },
  };
}
