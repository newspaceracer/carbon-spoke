// Client-side helpers for an INTERNATIONAL phone field: a country calling-code
// picker + a national-number field that stores a canonical E.164 string.
//
// Logic layer is libphonenumber-js (MIT, metadata fully bundled → offline &
// deterministic, matching the house rule — no runtime network call). Country
// display names come from Intl.DisplayNames (built in, offline; the library
// ships calling codes but not names). Runs in the browser only.
//
// carbon-checked: the calling-code list is injected as real cds-combo-box-item
// custom elements via createElement — no hand-rolled primitive; the list is
// runtime data (~240 entries) so it isn't static markup.

import {
  AsYouType,
  parsePhoneNumber,
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from 'libphonenumber-js/min';

export interface DialCountry {
  iso: string;
  name: string;
  /** Calling code without the leading '+'. */
  code: string;
}

const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'region' })
    : null;

/** Every country libphonenumber knows, name + calling code, sorted by name with
 *  the US first (this app's home country). */
export const dialCountries: DialCountry[] = (() => {
  const list = getCountries().map((iso) => ({
    iso,
    name: regionNames?.of(iso) ?? iso,
    code: getCountryCallingCode(iso),
  }));
  list.sort((a, b) => a.name.localeCompare(b.name));
  const usIdx = list.findIndex((c) => c.iso === 'US');
  if (usIdx > 0) list.unshift(list.splice(usIdx, 1)[0]);
  return list;
})();

/** Format a national number as-you-type for the given country. */
export const formatNational = (input: string, iso: string): string =>
  new AsYouType(iso as CountryCode).input(input);

/** National input + country → canonical E.164 (or undefined when incomplete). */
export const toE164 = (national: string, iso: string): string | undefined => {
  try {
    return parsePhoneNumber(national, iso as CountryCode)?.number;
  } catch {
    return undefined;
  }
};

/** E.164 → { iso, national } for hydrating the two controls. */
export const parseE164 = (e164: string): { iso: string; national: string } | undefined => {
  try {
    const p = parsePhoneNumber(e164);
    if (!p) return undefined;
    return { iso: p.country ?? 'US', national: p.formatNational() };
  } catch {
    return undefined;
  }
};

/** E.164 → human display ("+1 916 555 0148"); passthrough on failure, '' if empty. */
export const formatDisplay = (e164: string): string => {
  if (!e164) return '';
  try {
    return parsePhoneNumber(e164)?.formatInternational() ?? e164;
  } catch {
    return e164;
  }
};

// cds-combo-box exposes readonly as `readOnly`; cds-text-input as `readonly`.
const setRO = (el: any, ro: boolean) => {
  if (!el) return;
  if (el.tagName === 'CDS-COMBO-BOX') el.readOnly = ro;
  else el.readonly = ro;
};

/** Handle a page keeps to drive a wired phone field. */
export interface PhoneController {
  /** Canonical E.164 (or '' when empty/incomplete). */
  getValue(): string;
  /** Hydrate both controls from an E.164 string (or clear on ''). */
  setValue(e164: string): void;
  setReadonly(readonly: boolean): void;
}

/** Wire a `<PhoneField>` root: populate the calling-code combo, hydrate from
 *  `data-value` (E.164), format the number as-you-type, and return a controller. */
export function wirePhoneField(
  root: HTMLElement,
  opts: { readonly?: boolean; onChange?: () => void } = {},
): PhoneController {
  const prefix = root.dataset.prefix || 'phone';
  const combo = root.querySelector<any>(`#${prefix}-cc`);
  const num = root.querySelector<any>(`#${prefix}-num`);

  // Populate the dial-code items once (idempotent — setValue/rewire safe).
  if (combo && !combo.dataset.populated) {
    dialCountries.forEach((c) => {
      const item = document.createElement('cds-combo-box-item') as any;
      item.setAttribute('value', c.iso);
      item.textContent = `${c.name} +${c.code}`;
      combo.appendChild(item);
    });
    combo.dataset.populated = 'true';
  }

  const currentIso = (): string => (combo?.value || 'US');

  const hydrate = (e164: string) => {
    const parsed = e164 ? parseE164(e164) : undefined;
    if (combo) combo.value = parsed?.iso ?? 'US';
    if (num) num.value = parsed?.national ?? '';
  };

  hydrate(root.dataset.value || '');

  // Format as the user types.
  num?.addEventListener('input', () => {
    num.value = formatNational(num.value ?? '', currentIso());
  });
  // Reformat the existing digits when the country changes.
  combo?.addEventListener('cds-combo-box-selected', () => {
    const digits = (num?.value ?? '').replace(/\D/g, '');
    if (num) num.value = formatNational(digits, currentIso());
    opts.onChange?.();
  });

  let readonly = !!opts.readonly;
  const applyRO = () => {
    setRO(combo, readonly);
    setRO(num, readonly);
  };
  applyRO();

  return {
    getValue: () => toE164(num?.value ?? '', currentIso()) ?? '',
    setValue: (e164) => hydrate(e164),
    setReadonly: (v) => {
      readonly = v;
      applyRO();
    },
  };
}
