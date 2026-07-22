// Mock data for the signed-in reviewer — the person the profile page belongs to.
// This is the highlighted analysis-team member on the permit detail (J. Okafor),
// fleshed out into an account. As with permit.ts, every PERSONAL detail (name,
// email, phone, address) is INVENTED — this repo is public and the house rules
// forbid copying or lightly-sanitizing real data. Deterministic: same every build.

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
  { id: 'okafor', name: 'J. Okafor', role: 'Lead analyst', detail: 'Natural Resources Division', email: 'j.okafor@parks.ca.gov' },
  { id: 'santos', name: 'M. Santos', role: 'District reviewer', detail: 'North Coast Redwoods District', email: 'm.santos@parks.ca.gov' },
  { id: 'cheng', name: 'Dr. L. Cheng', role: 'Scientific advisor', detail: 'Marine ecology', email: 'l.cheng@parks.ca.gov' },
  { id: 'delgado', name: 'R. Delgado', role: 'Permit coordinator', detail: 'Statewide Permitting Office', email: 'r.delgado@parks.ca.gov' },
  { id: 'whitfield', name: 'K. Whitfield', role: 'District superintendent', detail: 'North Coast Redwoods District', email: 'k.whitfield@parks.ca.gov' },
  { id: 'cho', name: 'D. Cho', role: 'Senior environmental scientist', detail: 'North Coast Redwoods District', email: 'd.cho@parks.ca.gov' },
  { id: 'moreno', name: 'A. Moreno', role: 'District permit coordinator', detail: 'North Coast Redwoods District', email: 'a.moreno@parks.ca.gov' },
  { id: 'nair', name: 'P. Nair', role: 'HQ technical reviewer', detail: 'Office of Scientific Review', email: 'p.nair@parks.ca.gov' },
  { id: 'okonkwo', name: 'T. Okonkwo', role: 'Scientific advisor', detail: 'Botany', email: 't.okonkwo@parks.ca.gov' },
  { id: 'bautista', name: 'E. Bautista', role: 'Cultural resources reviewer', detail: 'Cultural Resources Division', email: 'e.bautista@parks.ca.gov' },
];

/** A structured US mailing address. */
export interface Address {
  street: string;
  /** Suite / floor / unit — optional. */
  unit: string;
  city: string;
  /** Two-letter USPS state code, matched against `states`. */
  state: string;
  zip: string;
}

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
  { value: 'admin', label: 'Admin', scoped: false, description: 'Manages users, districts, and system settings in addition to review.' },
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
    label: 'Admin',
    description: 'Manages users, districts, and system settings in addition to review.',
  },
];

// USPS state/territory codes for the mailing-address State dropdown.
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

export const directory: DirectoryUser[] = [
  { id: 'j-okafor', name: 'Jomo Okafor', email: 'j.okafor@parks.ca.gov', phone: '(707) 555-0148', accountRole: 'district-lead', district: 'north-coast-redwoods', affiliation: 'North Coast Redwoods District', expertise: ['marine-aquatic', 'plant'] },
  { id: 'k-whitfield', name: 'Karen Whitfield', email: 'k.whitfield@parks.ca.gov', phone: '(707) 555-0101', accountRole: 'district-assistant', district: 'north-coast-redwoods', affiliation: 'North Coast Redwoods District', expertise: ['animal'] },
  { id: 'm-santos', name: 'M. Santos', email: 'm.santos@parks.ca.gov', phone: '(707) 555-0119', accountRole: 'district-assistant', district: 'north-coast-redwoods', affiliation: 'North Coast Redwoods District', expertise: ['freshwater-aquatic'] },
  { id: 'd-cho', name: 'Daniel Cho', email: 'd.cho@parks.ca.gov', phone: '(707) 555-0134', accountRole: 'district-assistant', district: 'north-coast-redwoods', affiliation: 'North Coast Redwoods District', expertise: ['plant'] },
  { id: 't-herrera', name: 'Tomás Herrera', email: 't.herrera@parks.ca.gov', phone: '(707) 555-0152', accountRole: 'district-assistant', district: 'north-coast-redwoods', affiliation: 'North Coast Redwoods District', expertise: ['wildfire'] },
  { id: 'a-moreno', name: 'Alicia Moreno', email: 'a.moreno@parks.ca.gov', phone: '(707) 555-0146', accountRole: 'district-assistant', district: 'north-coast-redwoods', affiliation: 'North Coast Redwoods District', expertise: [] },
  { id: 'l-tran', name: 'Linda Tran', email: 'l.tran@parks.ca.gov', phone: '(707) 555-0160', accountRole: 'hq-technical', affiliation: 'Statewide Permitting Office', expertise: ['water'] },
  { id: 'r-okoye', name: 'Raymond Okoye', email: 'r.okoye@parks.ca.gov', phone: '(707) 555-0171', accountRole: 'hq-technical', affiliation: 'Office of Scientific Review', expertise: ['geologic', 'paleontological'] },
  { id: 'j-park', name: 'Julia Park', email: 'j.park@parks.ca.gov', phone: '(707) 555-0182', accountRole: 'hq-technical', affiliation: 'Natural Resources Division', expertise: ['air'] },
  { id: 'b-ramirez', name: 'Ben Ramirez', email: 'b.ramirez@parks.ca.gov', phone: '(707) 555-0193', accountRole: 'admin', affiliation: 'Statewide Permitting Office', expertise: [] },
];

/** Resolve a directory user by id. */
export const findUser = (id: string): DirectoryUser | undefined =>
  directory.find((u) => u.id === id);

export const currentUser = {
  // The signed-in reviewer's directory id — ties this profile to its account row
  // in `directory` (and to any role-change request the /users console resolves).
  id: 'j-okafor',
  firstName: 'Jomo',
  lastName: 'Okafor',
  // How the reviewer is shown across the app (comment thread, analysis roster).
  displayName: 'J. Okafor',
  title: 'Lead analyst',
  division: 'natural-resources',
  email: 'j.okafor@parks.ca.gov',
  phone: '(916) 555-0148',
  address: {
    street: '1416 9th Street',
    unit: 'Suite 1405',
    city: 'Sacramento',
    state: 'CA',
    zip: '95814',
  } as Address,
  memberSince: 'Mar 2021',

  // Role & access — READ ONLY on the profile. Changing these is an admin action,
  // so the page states that rather than offering a control the user can't use.
  role: 'Lead analyst',
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
