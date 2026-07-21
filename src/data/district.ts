// Mock data for the district detail prototype — a CA State Parks administrative
// district (North Coast Redwoods District). Park names and designations are
// public facts kept for domain credibility; acreages are rounded approximations.
// Every PERSONAL detail (contact names, emails, phones) is INVENTED, per the
// house no-real-data rule. The district office address is likewise invented.
// Deterministic: same output every build.

/** A structured US mailing address for the district office. */
export interface DistrictAddress {
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
}

/** A unit administered by the district. */
export interface Park {
  name: string;
  /** Classification (State Park, State Natural Reserve, State Beach, …). */
  designation: string;
  acreage: string;
}

// ── Members: the people assigned to a district ─────────────────────────────
// A district's directory is its MEMBERS — users assigned to it, each with a
// role. Two of those roles are technical reviewers (Lead / Assistant) and drive
// how the person is auto-added to a permit's analysis team:
//   - District LEAD reviewer → Lead analyst on single-district permits in this
//     district; Supporting analyst on multi-district permits. Covers all parks.
//   - District ASSISTANT reviewer → Supporting analyst, but only when a requested
//     park matches their auto-assignment policy (below).
// Those are the only two DISTRICT roles — HQ technical reviewer and Admin are
// global, not district memberships, so they never appear in a district's member
// list. A "published contact" is any member shown as the district's point of
// contact on the detail page (and eligible as the final-letter contact). Contacts
// are therefore always members — never free-typed. INVENTED people, house rules.

/** How an ASSISTANT reviewer is auto-added to a permit's analysis team. */
export type AutoAssignMode =
  | 'none' // never auto-assigned; added to a permit by hand only
  | 'specific' // auto-assigned when a requested park is in `parks`
  | 'all'; // auto-assigned to every permit in the district

export interface AutoAssign {
  mode: AutoAssignMode;
  /** Park names this assistant covers — used only when mode === 'specific'. */
  parks: string[];
}

export interface Member {
  /** References a user in the directory (see `findUser`). A member is ALWAYS an
   *  existing user — their name/email/phone are owned by the user record and are
   *  read-only wherever they're assigned; only the fields below belong here. */
  userId: string;
  /** A value from `memberRoles`. */
  role: string;
  /** Auto-assignment policy — meaningful only for the assistant reviewer role. */
  autoAssign: AutoAssign;
  /** Shown as a district point of contact (detail page + letter-eligible). */
  published: boolean;
}

/** The roles a DISTRICT member can hold — the two district-scoped technical
 *  reviewer roles. (HQ technical reviewer and Admin are GLOBAL roles, not
 *  district memberships, so they never appear in a district's member list.)
 *  `level` is the permit-team capacity the reviewer defaults into. */
export const memberRoles = [
  { value: 'district-lead', label: 'District lead technical reviewer', level: 'lead' },
  { value: 'district-assistant', label: 'District assistant technical reviewer', level: 'assistant' },
] as const;

export type MemberRoleValue = (typeof memberRoles)[number]['value'];

/** Look up a role's metadata (label / lead-or-assistant). */
export const roleMeta = (value: string) =>
  memberRoles.find((r) => r.value === value) ?? memberRoles[1];

/** Which roles an actor may ASSIGN, by scope. A district lead runs their own
 *  district but can only appoint ASSISTANT reviewers — the district LEAD is an
 *  HQ appointment (the single lead analyst for the district). HQ can set either. */
export const assignableRoles = (scope: 'lead' | 'hq') =>
  scope === 'hq' ? memberRoles : memberRoles.filter((r) => r.value !== 'district-lead');

/** A row in the districts index — the at-a-glance summary that links through to
 *  the district detail screen. `region` groups the directory; the counts and HQ
 *  are scannable facts. Superintendent names are INVENTED (house no-real-data
 *  rule); district and park *names* are public facts; park counts and HQ cities
 *  are plausible approximations. Deterministic. */
export interface DistrictSummary {
  id: string;
  name: string;
  region: string;
  /** Number of park units administered. */
  parks: number;
  /** Headquarters city + state. */
  headquarters: string;
  /** District superintendent (invented). */
  superintendent: string;
}

// The full CA State Parks district roster this prototype presents. Ordered as
// authored; the index groups them by `region`. The North Coast Redwoods row
// mirrors the full `district` record below (7 parks, Eureka HQ, K. Whitfield)
// so the index and the detail screen stay consistent.
export const districtDirectory: DistrictSummary[] = [
  { id: 'north-coast-redwoods', name: 'North Coast Redwoods District', region: 'North Coast', parks: 7, headquarters: 'Eureka, CA', superintendent: 'Karen Whitfield' },
  { id: 'northern-buttes', name: 'Northern Buttes District', region: 'North Coast', parks: 12, headquarters: 'Oroville, CA', superintendent: 'Raymond Ellison' },
  { id: 'bay-area', name: 'Bay Area District', region: 'Bay Area', parks: 9, headquarters: 'San Mateo, CA', superintendent: 'Priya Nair' },
  { id: 'diablo-range', name: 'Diablo Range District', region: 'Bay Area', parks: 6, headquarters: 'Livermore, CA', superintendent: 'Gordon Reyes' },
  { id: 'monterey', name: 'Monterey District', region: 'Central Coast', parks: 11, headquarters: 'Monterey, CA', superintendent: 'Elena Vasquez' },
  { id: 'santa-cruz', name: 'Santa Cruz District', region: 'Central Coast', parks: 10, headquarters: 'Santa Cruz, CA', superintendent: 'Marcus Bell' },
  { id: 'san-luis-obispo-coast', name: 'San Luis Obispo Coast District', region: 'Central Coast', parks: 8, headquarters: 'Pismo Beach, CA', superintendent: 'Diane Okafor' },
  { id: 'channel-coast', name: 'Channel Coast District', region: 'South Coast', parks: 9, headquarters: 'Ventura, CA', superintendent: 'Theodore Lam' },
  { id: 'angeles', name: 'Angeles District', region: 'South Coast', parks: 7, headquarters: 'Los Angeles, CA', superintendent: 'Rosa Delgado' },
  { id: 'san-diego-coast', name: 'San Diego Coast District', region: 'South Coast', parks: 13, headquarters: 'San Diego, CA', superintendent: 'Nathan Fisher' },
  { id: 'sierra', name: 'Sierra District', region: 'Sierra & Gold Country', parks: 8, headquarters: 'Tahoma, CA', superintendent: 'Grace Holloway' },
  { id: 'gold-fields', name: 'Gold Fields District', region: 'Sierra & Gold Country', parks: 6, headquarters: 'Folsom, CA', superintendent: 'Isaiah Ford' },
  { id: 'capital', name: 'Capital District', region: 'Sierra & Gold Country', parks: 10, headquarters: 'Sacramento, CA', superintendent: 'Lauren Pham' },
  { id: 'colorado-desert', name: 'Colorado Desert District', region: 'Desert', parks: 5, headquarters: 'Borrego Springs, CA', superintendent: 'Victor Salinas' },
  { id: 'inland-empire', name: 'Inland Empire District', region: 'Desert', parks: 7, headquarters: 'Perris, CA', superintendent: 'Hannah Boone' },
];

/** Resolve a district's display name by id (falls back to the id). */
export const districtName = (id: string): string =>
  districtDirectory.find((d) => d.id === id)?.name ?? id;

export const district = {
  id: 'north-coast-redwoods',
  name: 'North Coast Redwoods District',
  region: 'North Coast',

  // District administrative office (invented address).
  office: {
    address: {
      street: '3431 Fort Avenue',
      unit: 'Suite 200',
      city: 'Eureka',
      state: 'CA',
      zip: '95503',
    } as DistrictAddress,
    phone: '(707) 555-0100',
    email: 'northcoast.district@parks.ca.gov',
  },

  // Parks administered by the district (public names/designations).
  parks: [
    { name: 'Jedediah Smith Redwoods State Park', designation: 'State Park', acreage: '10,430 ac' },
    { name: 'Del Norte Coast Redwoods State Park', designation: 'State Park', acreage: '6,400 ac' },
    { name: 'Prairie Creek Redwoods State Park', designation: 'State Park', acreage: '14,000 ac' },
    { name: 'Tolowa Dunes State Park', designation: 'State Park', acreage: '5,000 ac' },
    { name: 'Humboldt Lagoons State Park', designation: 'State Park', acreage: '2,700 ac' },
    { name: 'Sue-meg State Park', designation: 'State Park', acreage: '640 ac' },
    { name: 'Grizzly Creek Redwoods State Park', designation: 'State Park', acreage: '430 ac' },
  ] as Park[],

  // District members — the users assigned to this district as technical reviewers.
  // J. Okafor is the District LEAD (she's the highlighted analyst on the coralline
  // permit and the account behind the profile page, so the screens tie together);
  // the rest are assistants demonstrating the three auto-assignment policies.
  // `published` members are the district's points of contact on the detail page.
  members: [
    { userId: 'j-okafor', role: 'district-lead', autoAssign: { mode: 'all', parks: [] }, published: true },
    { userId: 'k-whitfield', role: 'district-assistant', autoAssign: { mode: 'all', parks: [] }, published: true },
    { userId: 'm-santos', role: 'district-assistant', autoAssign: { mode: 'specific', parks: ['Prairie Creek Redwoods State Park'] }, published: true },
    { userId: 'd-cho', role: 'district-assistant', autoAssign: { mode: 'specific', parks: ['Prairie Creek Redwoods State Park', 'Jedediah Smith Redwoods State Park'] }, published: false },
    { userId: 't-herrera', role: 'district-assistant', autoAssign: { mode: 'all', parks: [] }, published: false },
    { userId: 'a-moreno', role: 'district-assistant', autoAssign: { mode: 'none', parks: [] }, published: false },
  ] as Member[],
} as const;
