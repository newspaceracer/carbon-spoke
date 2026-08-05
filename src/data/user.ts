// Mock data for the signed-in reviewer — the person the profile page belongs to.
// This is the highlighted analysis-team member on the permit detail (J. Okafor),
// fleshed out into an account. As with permit.ts, every PERSONAL detail (name,
// email, phone, address) is INVENTED — this repo is public and the house rules
// forbid copying or lightly-sanitizing real data. Deterministic: same every build.

// The mailing-address shape is now the country-neutral `Address` (address.ts).
// `states` (the US state list) also lives there with the rest of the address
// metadata; re-exported here so existing importers keep their `from './user'`.
import type { Address } from './address';
import type { Identity } from '../lib/maintenance';
import { applicant, applicantOrg } from './application';
export { states } from './address';

/** A division option for the personal-information dropdown. */
export interface Division {
  value: string;
  label: string;
}

/** A user in the agency directory — an existing account that can be added to a
 *  permit's analysis team. `id` is the stable key the roster stores; `name` is
 *  the display name shown on the roster; `role` is the default function they take
 *  on a team; `detail` is their division or district. All INVENTED (house
 *  no-real-data rule); the four already on the coralline permit reuse the same ids
 *  its analysisTeam rows carry, so "add" only offers users not already assigned. */
export interface DirectoryUser {
  id: string;
  name: string;
  role: string;
  detail: string;
  email: string;
}

// The valid existing users an admin can add to a permit's analysis team. A
// superset of any single permit's roster: the four already on the coralline
// permit plus other eligible reviewers across divisions and districts. Ordered
// as authored; the combo-box filters this to whoever isn't already on the team.
export const userDirectory: DirectoryUser[] = [
  { id: 'okafor', name: 'J. Okafor', role: 'Responsible analyst', detail: 'Natural Resources Division', email: 'j.okafor@parks.ca.gov' },
  { id: 'santos', name: 'M. Santos', role: 'District reviewer', detail: 'North Coast Redwoods District', email: 'm.santos@parks.ca.gov' },
  { id: 'cheng', name: 'Dr. L. Cheng', role: 'Scientific advisor', detail: 'Marine ecology', email: 'l.cheng@parks.ca.gov' },
  { id: 'delgado', name: 'R. Delgado', role: 'Permit coordinator', detail: 'Statewide Permitting Office', email: 'r.delgado@parks.ca.gov' },
  { id: 'whitfield', name: 'K. Whitfield', role: 'District superintendent', detail: 'North Coast Redwoods District', email: 'k.whitfield@parks.ca.gov' },
  { id: 'cho', name: 'D. Cho', role: 'Senior environmental scientist', detail: 'North Coast Redwoods District', email: 'd.cho@parks.ca.gov' },
  { id: 'moreno', name: 'A. Moreno', role: 'District permit coordinator', detail: 'North Coast Redwoods District', email: 'a.moreno@parks.ca.gov' },
  { id: 'alvarado', name: 'T. Alvarado', role: 'District permit coordinator', detail: 'Mendocino District', email: 't.alvarado@parks.ca.gov' },
  { id: 'reyna', name: 'S. Reyna', role: 'Senior environmental scientist', detail: 'Mendocino District', email: 's.reyna@parks.ca.gov' },
  { id: 'okeefe', name: 'B. O’Keefe', role: 'District superintendent', detail: 'Mendocino District', email: 'b.okeefe@parks.ca.gov' },
  { id: 'nair', name: 'P. Nair', role: 'HQ technical reviewer', detail: 'Office of Scientific Review', email: 'p.nair@parks.ca.gov' },
  { id: 'okonkwo', name: 'T. Okonkwo', role: 'Scientific advisor', detail: 'Botany', email: 't.okonkwo@parks.ca.gov' },
  { id: 'bautista', name: 'E. Bautista', role: 'Cultural resources reviewer', detail: 'Cultural Resources Division', email: 'e.bautista@parks.ca.gov' },
];

/** A district this reviewer is authorized to administer permits within. */
export interface AssignedDistrict {
  name: string;
  /** Count of parks the reviewer covers in this district. */
  parks: number;
}

/** One notification type. All notifications are delivered by email, so a single
 *  on/off flag governs whether the reviewer is notified about that event. */
export interface NotificationPref {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

const invented = 'Invented for this prototype — not real contact information.';

export const divisions: Division[] = [
  { value: 'natural-resources', label: 'Natural Resources Division' },
  { value: 'cultural-resources', label: 'Cultural Resources Division' },
  { value: 'permitting', label: 'Statewide Permitting Office' },
  { value: 'park-operations', label: 'Park Operations Division' },
  { value: 'science', label: 'Office of Scientific Review' },
];

// The full set of GLOBAL account roles an admin can assign in the /users console.
// `scoped` roles are tied to a specific district (a district lead/assistant is
// always the lead/assistant OF a district), so assigning or requesting one must
// also name the district. The non-scoped roles (HQ technical reviewer, Admin)
// are agency-wide and carry no district.
export const accountRoleOptions: { value: string; label: string; scoped: boolean; description: string }[] = [
  { value: 'district-assistant', label: 'District assistant technical reviewer', scoped: true, description: 'Supports district review; contributes analysis without final sign-off.' },
  { value: 'district-lead', label: 'District lead technical reviewer', scoped: true, description: 'Leads technical review for a district and signs off on district decisions.' },
  { value: 'hq-technical', label: 'HQ technical reviewer', scoped: false, description: 'Reviews permits statewide from headquarters, across all districts.' },
  { value: 'admin', label: 'System Admin', scoped: false, description: 'Manages users, districts, and system settings in addition to review.' },
];

/** Look up an account role's metadata (label / district-scoped / description). */
export const accountRoleMeta = (value: string) =>
  accountRoleOptions.find((r) => r.value === value);

// Areas of expertise a reviewer can be credentialed in — the CA State Parks
// resource-domain taxonomy. Every HQ technical reviewer must carry at least one
// (enforced in the /users add + manage flows); district reviewers may carry them
// too. `hint` is the parenthetical example from the source taxonomy, shown as
// helper detail; the short `label` is what a table chip displays.
export const expertiseOptions: { value: string; label: string; hint?: string }[] = [
  { value: 'aesthetics', label: 'Aesthetics', hint: 'e.g. sense of place, lightscape, soundscape, odor' },
  { value: 'air', label: 'Air Resources' },
  { value: 'animal', label: 'Animal Resources' },
  { value: 'freshwater-aquatic', label: 'Freshwater Aquatic Resources', hint: 'e.g. riparian ecosystems, floodplains' },
  { value: 'geologic', label: 'Geologic Resources' },
  { value: 'marine-aquatic', label: 'Marine Aquatic Resources', hint: 'e.g. tidepools, coastal wetlands' },
  { value: 'paleontological', label: 'Paleontological Resources' },
  { value: 'plant', label: 'Plant Resources' },
  { value: 'soil', label: 'Soil Resources' },
  { value: 'water', label: 'Water Resources', hint: 'e.g. water quality' },
  { value: 'wildfire', label: 'Wildfire' },
  { value: 'other', label: 'Other' },
];

/** Display label for an expertise value (falls back to the raw value). */
export const expertiseLabel = (value: string) =>
  expertiseOptions.find((e) => e.value === value)?.label ?? value;

// Roles a reviewer can REQUEST to move into (the elevated account roles). Role
// changes are approved by an administrator, so the profile only *requests* one of
// these — it can't self-assign.
export const requestableRoles: { value: string; label: string; description: string }[] = [
  {
    value: 'district-lead',
    label: 'District lead technical reviewer',
    description: 'Leads technical review for a district and signs off on district decisions.',
  },
  {
    value: 'district-assistant',
    label: 'District assistant technical reviewer',
    description: 'Supports district review; contributes analysis without final sign-off.',
  },
  {
    value: 'hq-technical',
    label: 'HQ technical reviewer',
    description: 'Reviews permits statewide from headquarters, across all districts.',
  },
  {
    value: 'admin',
    label: 'System Admin',
    description: 'Manages users, districts, and system settings in addition to review.',
  },
];

// ── User directory ─────────────────────────────────────────────────────────
// The system's user accounts. District membership REFERENCES a user by id — a
// district member is always a real user, never a free-typed person, so their
// identity (name/email/phone) is owned here and read-only wherever they're
// assigned. The first six are the seeded North Coast Redwoods members; the rest
// are unassigned accounts available to pick from. `accountRole` + `affiliation`
// are the user's GLOBAL account standing (what the /users admin console shows and
// edits — distinct from a per-district membership role). All INVENTED (house rules).
export interface DirectoryUser {
  id: string;
  /** Given name — the editable first half of the account name. */
  firstName: string;
  /** Family name — the editable second half of the account name. */
  lastName: string;
  /** Full display name — DERIVED from firstName + lastName (see the seed below).
   *  Kept so the many `.name` consumers (rosters, permit rows) don't change. */
  name: string;
  email: string;
  phone: string;
  /** Current global account role — an `accountRoleOptions` VALUE. Admin-editable
   *  in /users; approving a role-change request overwrites it. */
  accountRole: string;
  /** District id (see districtDirectory) for a district-SCOPED role. Omitted for
   *  the non-scoped roles (hq-technical / admin). */
  district?: string;
  /** Division or district shown for context in the users console. */
  affiliation: string;
  /** Areas of expertise — `expertiseOptions` values. Required (≥1) for HQ
   *  technical reviewers; optional for everyone else. */
  expertise?: string[];
}

// `name` is derived once from firstName + lastName so the two never drift — the
// name is stored as its two editable parts (the admin edits first + last), and
// the full name every roster/permit row reads is composed from them.
export const directory: DirectoryUser[] = ([
  { id: 'j-okafor', firstName: 'Jomo', lastName: 'Okafor', email: 'j.okafor@parks.ca.gov', phone: '(707) 555-0148', accountRole: 'district-lead', district: 'north-coast-redwoods', affiliation: 'North Coast Redwoods District', expertise: ['marine-aquatic', 'plant'] },
  { id: 'k-whitfield', firstName: 'Karen', lastName: 'Whitfield', email: 'k.whitfield@parks.ca.gov', phone: '(707) 555-0101', accountRole: 'district-assistant', district: 'north-coast-redwoods', affiliation: 'North Coast Redwoods District', expertise: ['animal'] },
  { id: 'm-santos', firstName: 'Marisol', lastName: 'Santos', email: 'm.santos@parks.ca.gov', phone: '(707) 555-0119', accountRole: 'district-assistant', district: 'north-coast-redwoods', affiliation: 'North Coast Redwoods District', expertise: ['freshwater-aquatic'] },
  { id: 'd-cho', firstName: 'Daniel', lastName: 'Cho', email: 'd.cho@parks.ca.gov', phone: '(707) 555-0134', accountRole: 'district-assistant', district: 'north-coast-redwoods', affiliation: 'North Coast Redwoods District', expertise: ['plant'] },
  { id: 't-herrera', firstName: 'Tomás', lastName: 'Herrera', email: 't.herrera@parks.ca.gov', phone: '(707) 555-0152', accountRole: 'district-assistant', district: 'north-coast-redwoods', affiliation: 'North Coast Redwoods District', expertise: ['wildfire'] },
  { id: 'a-moreno', firstName: 'Alicia', lastName: 'Moreno', email: 'a.moreno@parks.ca.gov', phone: '(707) 555-0146', accountRole: 'district-assistant', district: 'north-coast-redwoods', affiliation: 'North Coast Redwoods District', expertise: [] },
  { id: 'l-tran', firstName: 'Linda', lastName: 'Tran', email: 'l.tran@parks.ca.gov', phone: '(707) 555-0160', accountRole: 'hq-technical', affiliation: 'Statewide Permitting Office', expertise: ['water'] },
  { id: 'r-okoye', firstName: 'Raymond', lastName: 'Okoye', email: 'r.okoye@parks.ca.gov', phone: '(707) 555-0171', accountRole: 'hq-technical', affiliation: 'Office of Scientific Review', expertise: ['geologic', 'paleontological'] },
  { id: 'j-park', firstName: 'Julia', lastName: 'Park', email: 'j.park@parks.ca.gov', phone: '(707) 555-0182', accountRole: 'hq-technical', affiliation: 'Natural Resources Division', expertise: ['air'] },
  { id: 'b-ramirez', firstName: 'Ben', lastName: 'Ramirez', email: 'b.ramirez@parks.ca.gov', phone: '(707) 555-0193', accountRole: 'admin', affiliation: 'Statewide Permitting Office', expertise: [] },
] as Omit<DirectoryUser, 'name'>[]).map((u) => ({ ...u, name: `${u.firstName} ${u.lastName}`.trim() }));

/** Resolve a directory user by id. */
export const findUser = (id: string): DirectoryUser | undefined =>
  directory.find((u) => u.id === id);

// ── Public user directory ────────────────────────────────────────────────────
// Members of the PUBLIC who hold an account — the researchers/applicants who
// submit permit applications (the researcher/applicant persona, not internal
// staff). They carry NO agency account role or expertise; their account is an
// external identity verified by email at sign-in. The /users console lists them
// in a SEPARATE table from internal staff. The first row is the seeded applicant
// persona (Renata Halvorsen — the `researcher` identity resolves to id
// 'applicant'), so this directory and the application flow speak one identity.
// All INVENTED, domain-credible, deterministic (house no-real-data rule).
export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  /** Full display name — DERIVED from firstName + lastName (see the seed below). */
  name: string;
  email: string;
  /** Contact phone — the account holder manages this themselves; the admin
   *  console shows it read-only and never in the grid. */
  phone: string;
  /** A public account holds exactly one of two states — `publicRoleOptions`. */
  role: string;
  /** Epoch ms the account was last active — shown as a relative "last seen". */
  lastSeen: number;
}

// The two — and only two — states a public account can hold. Admin-editable in
// the /users console; overlaid in requests.ts (setPublicRole).
export const publicRoleOptions: { value: string; label: string }[] = [
  { value: 'public-user', label: 'Public user' },
  { value: 'inactive', label: 'Inactive' },
];

/** Display label for a public account role (falls back to the raw value). */
export const publicRoleLabel = (value: string) =>
  publicRoleOptions.find((r) => r.value === value)?.label ?? value;

// `lastSeen` timestamps are fixed (deterministic) — a spread of recent-to-stale
// activity so the "Last seen" column reads credibly. The inactive account (Okonkwo)
// is the stalest. `name` is derived from firstName + lastName, like the internal
// directory, so the two halves never drift.
export const publicDirectory: PublicUser[] = ([
  { id: 'applicant', firstName: 'Renata', lastName: 'Halvorsen', email: 'r.halvorsen@cascadiamarine.org', phone: '(415) 555-0173', role: 'public-user', lastSeen: 1_785_250_000_000 },
  { id: 'pub-aranda', firstName: 'Miguel', lastName: 'Aranda', email: 'm.aranda@cascadiamarine.org', phone: '(415) 555-0188', role: 'public-user', lastSeen: 1_785_180_000_000 },
  { id: 'pub-deshmukh', firstName: 'Priya', lastName: 'Deshmukh', email: 'p.deshmukh@cascadiamarine.org', phone: '(415) 555-0191', role: 'public-user', lastSeen: 1_784_700_000_000 },
  { id: 'pub-boone', firstName: 'Gregory', lastName: 'Boone', email: 'g.boone@bodegamarine.org', phone: '(707) 555-0206', role: 'public-user', lastSeen: 1_783_400_000_000 },
  { id: 'pub-underhill', firstName: 'Sadie', lastName: 'Underhill', email: 's.underhill@westernmonarch.org', phone: '(831) 555-0142', role: 'public-user', lastSeen: 1_781_000_000_000 },
  { id: 'pub-nakamura', firstName: 'Theo', lastName: 'Nakamura', email: 't.nakamura@pointblue.org', phone: '(415) 555-0159', role: 'public-user', lastSeen: 1_785_240_000_000 },
  { id: 'pub-okonkwo', firstName: 'Adaeze', lastName: 'Okonkwo', email: 'a.okonkwo@calacademy.org', phone: '(415) 555-0167', role: 'inactive', lastSeen: 1_762_000_000_000 },
] as Omit<PublicUser, 'name'>[]).map((u) => ({ ...u, name: `${u.firstName} ${u.lastName}`.trim() }));

// ── Prototype identity → the person acting ──────────────────────────────────
// readIdentity() yields a ROLE; the app also needs the concrete person behind that
// role — for comment authorship, "who am I" on a permit, and (later) signer
// identity. This bridges the two: each reviewer identity resolves to a
// representative directory account; the researcher identity resolves to the seeded
// applicant persona; pending/anon have no acting person. It's the single "who am I
// as a person" resolver the roles-and-permissions work builds on.
export interface ActiveUser {
  /** Directory id for staff; a synthetic id for the researcher persona. */
  id: string;
  /** Full name as shown across the app (comment thread, rosters). */
  name: string;
  /** The prototype identity/role this person is acting as. */
  identity: Identity;
  /** District id for a district-scoped reviewer (omitted for HQ/admin/researcher). */
  district?: string;
  /** Organization (researcher) or affiliation (staff), for display. */
  affiliation?: string;
}

// Which seeded directory account stands in for each reviewer identity. The demo
// lead is J. Okafor (matches currentUser / the highlighted analysis-team member).
const IDENTITY_TO_USER_ID: Partial<Record<Identity, string>> = {
  admin: 'b-ramirez',
  'hq-technical': 'l-tran',
  'district-lead': 'j-okafor',
  'district-assistant': 'k-whitfield',
};

/** The person currently acting, derived from the prototype identity. Null for the
 *  roleless (pending) and logged-out (anon) states, which have no acting person. */
export function activeUser(identity: Identity): ActiveUser | null {
  const dirId = IDENTITY_TO_USER_ID[identity];
  if (dirId) {
    const u = findUser(dirId);
    if (u) return { id: u.id, name: u.name, identity, district: u.district, affiliation: u.affiliation };
  }
  if (identity === 'researcher') {
    return {
      id: 'applicant',
      name: `${applicant.firstName} ${applicant.lastName}`,
      identity,
      affiliation: applicantOrg.name,
    };
  }
  return null; // pending / anon — no acting person
}

export const currentUser = {
  // The signed-in reviewer's directory id — ties this profile to its account row
  // in `directory` (and to any role-change request the /users console resolves).
  id: 'j-okafor',
  firstName: 'Jomo',
  lastName: 'Okafor',
  // How the reviewer is shown across the app (comment thread, analysis roster).
  displayName: 'J. Okafor',
  title: 'Responsible analyst',
  division: 'natural-resources',
  email: 'j.okafor@parks.ca.gov',
  // Phone is stored canonically as E.164; the profile shows it formatted.
  phone: '+19165550148',
  address: {
    country: 'US',
    line1: '1416 9th Street',
    line2: 'Suite 1405',
    city: 'Sacramento',
    region: 'CA',
    postalCode: '95814',
  } as Address,
  memberSince: 'Mar 2021',

  // Role & access — READ ONLY on the profile. Changing these is an admin action,
  // so the page states that rather than offering a control the user can't use.
  role: 'Responsible analyst',
  permissionLevel: 'Internal reviewer',
  districts: [
    { name: 'North Coast Redwoods District', parks: 3 },
    { name: 'Mendocino District', parks: 2 },
    { name: 'Sonoma-Mendocino Coast District', parks: 4 },
  ] as AssignedDistrict[],

  // Notification defaults. Each row is one event; the flag governs whether the
  // reviewer gets an email about it.
  notifications: [
    {
      key: 'assignments',
      label: 'Permit assignments',
      description: 'When a permit is assigned to me for review',
      enabled: true,
    },
    {
      key: 'comments',
      label: 'New comments',
      description: "When someone comments on a permit I'm reviewing",
      enabled: true,
    },
    {
      key: 'decisions',
      label: 'Decisions due',
      description: "When a decision I'm responsible for is nearing its due date",
      enabled: true,
    },
    {
      key: 'reports',
      label: 'Annual reports',
      description: 'When an annual report is due or has been submitted',
      enabled: false,
    },
  ] as NotificationPref[],

  _dataNote: invented,
} as const;
