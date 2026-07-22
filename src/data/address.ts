// International address metadata — a vendored slice of Google's libaddressinput.
//
// Source: https://chromium-i18n.appspot.com/ssl-address/data/<CC>  (Apache-2.0),
// the same dataset Shopify's @shopify/address fetches at runtime. We vendor a
// STATIC slice instead so the prototype stays offline and deterministic (no
// external call, same output every build) — the house rule.
//
// Why these countries: the US is the app's home format (street · City · State ·
// ZIP). The other seven are chosen because each diverges from the US on a
// different axis, so together they exercise every branch a country-aware address
// form has to handle:
//   JP — postal-code FIRST, a "Prefecture" region        (order + region label)
//   GB — NO administrative area; "Postcode" / "Town"      (missing region field)
//   DE — no state; postal code BEFORE city (European)     (field order)
//   BR — a "Neighborhood" sublocality line; state required(extra field)
//   AE — NO postal code at all; region = "Emirate"        (missing postal field)
//   IE — postal code (Eircode) and county both OPTIONAL   (required-ness)
//   CN — large→small order; Province + District; 6-digit  (order + hierarchy)
//
// Faithful to the source's `fmt` (field order), `require` (required-ness), and
// the `*_name_type` labels — transformed from libaddressinput's %-token format
// strings into an ordered field list a form can render directly. Region option
// lists use ISO 3166-2 subdivision codes as values; where the source's full
// `sub_keys` list is long it is TRIMMED to a representative sample (flagged
// per country) — this is a prototype slice, not the exhaustive table. The US
// keeps its full list (`states`, below), which is also the canonical home for
// the US state dropdown used elsewhere (re-exported from user.ts).

// ── The generic, country-neutral address record ─────────────────────────────
// Replaces the US-only { street, unit, city, state, zip } shape. Component
// fields carry canonical values; the COUNTRY drives which are shown, their
// order, labels, and whether they're required (see `addressFormats`).
export interface Address {
  /** ISO 3166-1 alpha-2 country code — the key into `addressFormats`. */
  country: string;
  /** Street address (house number + street, PO box, etc.). */
  line1: string;
  /** Apartment / suite / unit / floor — optional everywhere. */
  line2?: string;
  /** City / town / locality. */
  city: string;
  /** State / province / prefecture / emirate / county — presence & label vary
   *  by country; a value from that country's `region.options` when it's a list. */
  region?: string;
  /** ZIP / postal code / Eircode — presence, label & required-ness vary. */
  postalCode?: string;
  /** Neighborhood / district / suburb — only some countries carry this. */
  sublocality?: string;
}

/** Which `Address` field a form row binds to. */
export type AddressFieldKey = 'line1' | 'line2' | 'city' | 'region' | 'postalCode' | 'sublocality';

/** One row in a country's address form, in render order. */
export interface AddressFieldSpec {
  key: AddressFieldKey;
  /** Country-appropriate label (from the source's `*_name_type`). */
  label: string;
  required: boolean;
  /** Present only when the field is a fixed list (source `sub_keys`) — render as
   *  a dropdown. Absent → free-text input. */
  options?: { value: string; label: string }[];
}

/** A country's address format: the ordered field list + postal validation. */
export interface CountryAddressFormat {
  code: string;
  name: string;
  /** Fields top→bottom, already in the country's conventional order. */
  fields: AddressFieldSpec[];
  /** Postal-code pattern (source `zip`), as a RegExp source string. Omitted for
   *  countries with no postal code (e.g. AE). */
  postalPattern?: string;
}

// ── US states / territories (full) ──────────────────────────────────────────
// USPS codes for the US "State" field — the app's home region list. Lives here
// (with the rest of the address metadata) and is re-exported from user.ts so the
// existing importers (profile, manage-district, ResearchTeamStep) are unchanged.
export const states: { value: string; label: string }[] = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'DC', label: 'District of Columbia' }, { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' }, { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' }, { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' }, { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' }, { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' }, { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' }, { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' }, { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' }, { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' }, { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' }, { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' }, { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' }, { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' }, { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' }, { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' }, { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' }, { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' }, { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' }, { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' }, { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' }, { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

// ── Region option samples (ISO 3166-2 values) ───────────────────────────────
// Trimmed to a representative sample per the header note; the US uses its full
// `states` list. Labels are the English subdivision names.

const jpPrefectures = [
  { value: 'JP-01', label: 'Hokkaido' },
  { value: 'JP-13', label: 'Tokyo' },
  { value: 'JP-27', label: 'Osaka' },
  { value: 'JP-26', label: 'Kyoto' },
  { value: 'JP-23', label: 'Aichi' },
  { value: 'JP-34', label: 'Hiroshima' },
  { value: 'JP-40', label: 'Fukuoka' },
  { value: 'JP-47', label: 'Okinawa' },
]; // sample of 47 prefectures

const brStates = [
  { value: 'BR-SP', label: 'São Paulo' },
  { value: 'BR-RJ', label: 'Rio de Janeiro' },
  { value: 'BR-MG', label: 'Minas Gerais' },
  { value: 'BR-BA', label: 'Bahia' },
  { value: 'BR-RS', label: 'Rio Grande do Sul' },
  { value: 'BR-PR', label: 'Paraná' },
  { value: 'BR-AM', label: 'Amazonas' },
  { value: 'BR-DF', label: 'Distrito Federal' },
]; // sample of 27 states

const aeEmirates = [
  { value: 'AE-AZ', label: 'Abu Dhabi' },
  { value: 'AE-DU', label: 'Dubai' },
  { value: 'AE-SH', label: 'Sharjah' },
  { value: 'AE-AJ', label: 'Ajman' },
  { value: 'AE-UQ', label: 'Umm Al Quwain' },
  { value: 'AE-RK', label: 'Ras Al Khaimah' },
  { value: 'AE-FU', label: 'Fujairah' },
]; // all 7 emirates

const ieCounties = [
  { value: 'IE-D', label: 'Dublin' },
  { value: 'IE-CO', label: 'Cork' },
  { value: 'IE-G', label: 'Galway' },
  { value: 'IE-LK', label: 'Limerick' },
  { value: 'IE-MO', label: 'Mayo' },
  { value: 'IE-WD', label: 'Waterford' },
]; // sample of 26 counties

const cnProvinces = [
  { value: 'CN-BJ', label: 'Beijing' },
  { value: 'CN-SH', label: 'Shanghai' },
  { value: 'CN-GD', label: 'Guangdong' },
  { value: 'CN-ZJ', label: 'Zhejiang' },
  { value: 'CN-JS', label: 'Jiangsu' },
  { value: 'CN-SC', label: 'Sichuan' },
  { value: 'CN-HB', label: 'Hubei' },
  { value: 'CN-YN', label: 'Yunnan' },
]; // sample of 34 province-level divisions

// ── The vendored format table ────────────────────────────────────────────────
// Keyed by ISO 3166-1 alpha-2. Field order below IS the country's render order.

export const addressFormats: Record<string, CountryAddressFormat> = {
  // United States — street · City · State · ZIP. The home format.
  // fmt %A / %C, %S %Z · require ACSZ
  US: {
    code: 'US',
    name: 'United States',
    postalPattern: '^\\d{5}(-\\d{4})?$',
    fields: [
      { key: 'line1', label: 'Street address', required: true },
      { key: 'line2', label: 'Suite / unit (optional)', required: false },
      { key: 'city', label: 'City', required: true },
      { key: 'region', label: 'State', required: true, options: states },
      { key: 'postalCode', label: 'ZIP code', required: true },
    ],
  },

  // Japan — postal code FIRST, then Prefecture, then city, then street.
  // Native fmt %Z / %S %C / %A · require ASZ · state=prefecture · zip=postal
  JP: {
    code: 'JP',
    name: 'Japan',
    postalPattern: '^\\d{3}-?\\d{4}$',
    fields: [
      { key: 'postalCode', label: 'Postal code', required: true },
      { key: 'region', label: 'Prefecture', required: true, options: jpPrefectures },
      { key: 'city', label: 'City / ward', required: true },
      { key: 'line1', label: 'Address', required: true },
      { key: 'line2', label: 'Building / room (optional)', required: false },
    ],
  },

  // United Kingdom — NO administrative area. Town + Postcode.
  // fmt %A / %C / %Z · require ACZ · locality=post_town · zip=postal
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    postalPattern: '^[A-Za-z]{1,2}\\d[A-Za-z\\d]?\\s*\\d[A-Za-z]{2}$',
    fields: [
      { key: 'line1', label: 'Address', required: true },
      { key: 'line2', label: 'Address line 2 (optional)', required: false },
      { key: 'city', label: 'Town / city', required: true },
      { key: 'postalCode', label: 'Postcode', required: true },
    ],
  },

  // Germany — no state; postal code sits BEFORE the city ("12345 Berlin").
  // fmt %A / %Z %C · require ACZ · zip=postal
  DE: {
    code: 'DE',
    name: 'Germany',
    postalPattern: '^\\d{5}$',
    fields: [
      { key: 'line1', label: 'Street and house number', required: true },
      { key: 'line2', label: 'Address line 2 (optional)', required: false },
      { key: 'postalCode', label: 'Postal code', required: true },
      { key: 'city', label: 'City', required: true },
    ],
  },

  // Brazil — a Neighborhood (bairro) line; State required; CEP postal code.
  // fmt %A / %D / %C-%S / %Z · require ASCZ · sublocality=neighborhood
  BR: {
    code: 'BR',
    name: 'Brazil',
    postalPattern: '^\\d{5}-?\\d{3}$',
    fields: [
      { key: 'line1', label: 'Address', required: true },
      { key: 'line2', label: 'Address line 2 (optional)', required: false },
      { key: 'sublocality', label: 'Neighborhood', required: true },
      { key: 'city', label: 'City', required: true },
      { key: 'region', label: 'State', required: true, options: brStates },
      { key: 'postalCode', label: 'Postal code', required: true },
    ],
  },

  // United Arab Emirates — NO postal code. Region is the Emirate.
  // fmt %A / %S · require AS · state=emirate · (no zip)
  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    fields: [
      { key: 'line1', label: 'Address', required: true },
      { key: 'line2', label: 'Address line 2 (optional)', required: false },
      { key: 'region', label: 'Emirate', required: true, options: aeEmirates },
    ],
  },

  // Ireland — Eircode and County are both OPTIONAL (only the town is required).
  // fmt %A / %D / %C / %S / %Z · require AC · county optional · zip=eircode
  IE: {
    code: 'IE',
    name: 'Ireland',
    postalPattern: '^[A-Za-z]\\d{2}\\s?[A-Za-z\\d]{4}$',
    fields: [
      { key: 'line1', label: 'Address', required: true },
      { key: 'line2', label: 'Address line 2 (optional)', required: false },
      { key: 'city', label: 'Town / city', required: true },
      { key: 'region', label: 'County (optional)', required: false, options: ieCounties },
      { key: 'postalCode', label: 'Eircode (optional)', required: false },
    ],
  },

  // China — ordered large→small: Province · City · District · street · postal.
  // fmt %S %C %D / %A / %Z · require ASCZ · state=province · sublocality=district
  CN: {
    code: 'CN',
    name: 'China',
    postalPattern: '^\\d{6}$',
    fields: [
      { key: 'region', label: 'Province', required: true, options: cnProvinces },
      { key: 'city', label: 'City', required: true },
      { key: 'sublocality', label: 'District', required: false },
      { key: 'line1', label: 'Address', required: true },
      { key: 'line2', label: 'Address line 2 (optional)', required: false },
      { key: 'postalCode', label: 'Postal code', required: true },
    ],
  },
};

// Country picker list — US first, then the vendored set alphabetically. In a
// real app this would be the full ISO 3166-1 table; here it's exactly the
// countries we have a format for, so every choice renders a correct form.
export const countries: { value: string; label: string }[] = [
  { value: 'US', label: 'United States' },
  ...Object.values(addressFormats)
    .filter((f) => f.code !== 'US')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((f) => ({ value: f.code, label: f.name })),
];

/** Resolve a country's address format; falls back to the US format for an
 *  unknown code so a form always has something valid to render. */
export const getAddressFormat = (code: string): CountryAddressFormat =>
  addressFormats[code] ?? addressFormats.US;
