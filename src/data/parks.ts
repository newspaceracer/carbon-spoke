// California State Parks system — a park directory used by the Study areas step
// of the permit application. Applicants pick the park(s) where field work will
// take place from a single searchable list.
//
// Like `address.ts`, this is PUBLIC geographic reference data, not client data:
// unit names and their field-district groupings are how the California
// Department of Parks & Recreation publicly organizes the state park system.
// Using the real names keeps the searchable dropdown genuinely useful (an
// applicant can type either a park name OR a district and find it) while staying
// faithful to the house no-real-*client*-data rule. The list is a substantial,
// representative slice of the ~280-unit system across its field districts — a
// prototype directory, not the exhaustive table — and is deterministic (same
// output every build).

export interface Park {
  /** Kebab-case slug — the option value and the key used everywhere else. */
  id: string;
  /** Full unit name as the department lists it. */
  name: string;
  /** The field district the unit is administered under. */
  district: string;
}

/** name → slug. Deterministic; accented letters / punctuation collapse to `-`. */
const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Authored district-first so every unit carries its district; flattened + sorted
// into the flat `parks` list the form renders. Grouping is the department's field
// district structure (approximate where units have shifted between districts).
const byDistrict: Record<string, string[]> = {
  'North Coast Redwoods District': [
    'Jedediah Smith Redwoods State Park',
    'Del Norte Coast Redwoods State Park',
    'Prairie Creek Redwoods State Park',
    'Humboldt Redwoods State Park',
    'Grizzly Creek Redwoods State Park',
    'Richardson Grove State Park',
    'Sue-meg State Park',
    'Benbow State Recreation Area',
  ],
  'Mendocino District': [
    'MacKerricher State Park',
    'Russian Gulch State Park',
    'Van Damme State Park',
    'Mendocino Headlands State Park',
    'Hendy Woods State Park',
    'Manchester State Park',
  ],
  'Sonoma-Mendocino Coast District': [
    'Salt Point State Park',
    'Sonoma Coast State Park',
    'Fort Ross State Historic Park',
    'Armstrong Redwoods State Natural Reserve',
    'Kruse Rhododendron State Natural Reserve',
  ],
  'Bay Area District': [
    'Mount Tamalpais State Park',
    'Angel Island State Park',
    'China Camp State Park',
    'Samuel P. Taylor State Park',
    'Tomales Bay State Park',
    'Olompali State Historic Park',
  ],
  'Diablo Range District': [
    'Mount Diablo State Park',
    'Henry W. Coe State Park',
    'Pacheco State Park',
  ],
  'Santa Cruz District': [
    'Big Basin Redwoods State Park',
    'Henry Cowell Redwoods State Park',
    'Wilder Ranch State Park',
    'Natural Bridges State Beach',
    'The Forest of Nisene Marks State Park',
    'Año Nuevo State Park',
    'Castle Rock State Park',
  ],
  'Monterey District': [
    'Point Lobos State Natural Reserve',
    'Andrew Molera State Park',
    'Julia Pfeiffer Burns State Park',
    'Pfeiffer Big Sur State Park',
    'Garrapata State Park',
    'Asilomar State Beach',
  ],
  'San Luis Obispo Coast District': [
    'Montaña de Oro State Park',
    'Morro Bay State Park',
    'Hearst San Simeon State Park',
    'Pismo State Beach',
  ],
  'Channel Coast District': [
    'Gaviota State Park',
    'Refugio State Beach',
    'El Capitán State Beach',
    'Emma Wood State Beach',
    'McGrath State Beach',
  ],
  'Angeles District': [
    'Topanga State Park',
    'Malibu Creek State Park',
    'Point Mugu State Park',
    'Will Rogers State Historic Park',
    'Los Encinos State Historic Park',
  ],
  'Inland Empire District': [
    'Chino Hills State Park',
    'Mount San Jacinto State Park',
    'Lake Perris State Recreation Area',
    'Wildwood Canyon State Park',
  ],
  'Orange Coast District': [
    'Crystal Cove State Park',
    'Bolsa Chica State Beach',
    'Huntington State Beach',
    'Doheny State Beach',
    'San Clemente State Beach',
  ],
  'San Diego Coast District': [
    'Torrey Pines State Natural Reserve',
    'Old Town San Diego State Historic Park',
    'Cardiff State Beach',
    'Silver Strand State Beach',
    'San Onofre State Beach',
  ],
  'Colorado Desert District': [
    'Anza-Borrego Desert State Park',
    'Salton Sea State Recreation Area',
    'Picacho State Recreation Area',
    'Ocotillo Wells State Vehicular Recreation Area',
  ],
  'Tehachapi District': [
    'Red Rock Canyon State Park',
    'Tomo-Kahni State Historic Park',
  ],
  'Sierra District': [
    'Emerald Bay State Park',
    'D. L. Bliss State Park',
    'Ed Z’berg Sugar Pine Point State Park',
    'Donner Memorial State Park',
    'Grover Hot Springs State Park',
  ],
  'Gold Fields District': [
    'Marshall Gold Discovery State Historic Park',
    'Auburn State Recreation Area',
    'Folsom Lake State Recreation Area',
    'Empire Mine State Historic Park',
  ],
  'Capital District': [
    'Sutter’s Fort State Historic Park',
    'California State Railroad Museum',
    'Old Sacramento State Historic Park',
  ],
  'Northern Buttes District': [
    'Lake Oroville State Recreation Area',
    'Bidwell-Sacramento River State Park',
    'Plumas-Eureka State Park',
    'Woodson Bridge State Recreation Area',
  ],
};

/** The flat, alphabetically-sorted directory the Study areas dropdown renders. */
export const parks: Park[] = Object.entries(byDistrict)
  .flatMap(([district, names]) => names.map((name) => ({ id: slugify(name), name, district })))
  .sort((a, b) => a.name.localeCompare(b.name));

/** id → Park, for resolving a selected value back to its name/district. */
export const parkById = new Map<string, Park>(parks.map((p) => [p.id, p]));

// Seed selection so the Draft renders as work-in-progress (consistent with the
// prefilled Project information step): the North Coast intertidal study already
// names the parks its field work spans.
export const seedStudyAreas: string[] = [
  'Prairie Creek Redwoods State Park',
  'Sonoma Coast State Park',
  'Salt Point State Park',
  'MacKerricher State Park',
].map(slugify);
