// Mock data for the permits INDEX prototype — the full register a reviewer
// scans (900+ CA State Parks Scientific Research & Collection Permits). This is
// the large, interactive table case: too many rows for tiles, so the index is an
// AG Grid (see CLAUDE.md "Grids"). Every record is INVENTED and deterministic —
// permit IDs, people, titles, and dates are fabricated by a seeded PRNG, so the
// same 960 rows appear on every build. Public scientific facts (taxa, park names,
// resource categories) are kept only for domain credibility.
//
// The signed-in reviewer is J. Okafor (see user.ts). Two membership facts drive
// the index's quick-filter segments:
//   - "My permits"   — permits she is the responsible/supporting analyst on
//                      (row.role is set; she's stamped as the responsible analyst).
//   - "My district"  — permits in one of her assigned districts (myDistricts).
// Both are precomputed per row into `_buckets` so the grid can filter on a plain
// serializable field (the AG Grid wrapper reads `_buckets`; see carbon-ag-grid.ts).

import { currentUser } from './user';

// ── Deterministic PRNG ──────────────────────────────────────────────────────
// mulberry32 — a tiny seeded generator. Fixed seed ⇒ identical data every build
// (the house rule: mock data is invented AND deterministic, never Math.random).
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(0x5eeded);
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
// Pick `n` DISTINCT values from a pool (used for tags + supporting analysts).
function pickN<T>(arr: readonly T[], n: number, exclude: readonly T[] = []): T[] {
  const out: T[] = [];
  let guard = 0;
  while (out.length < n && guard++ < 50) {
    const v = pick(arr);
    if (!out.includes(v) && !exclude.includes(v)) out.push(v);
  }
  return out;
}

// ── Domain vocabulary (public facts, safe to use) ───────────────────────────
const studies = [
  'Population census', 'Acoustic survey', 'Genetic sampling', 'Habitat assessment',
  'Reproductive analysis', 'Distribution mapping', 'Water-quality monitoring',
  'Nest survey', 'Diet analysis', 'Non-lethal tagging study', 'Prescribed-burn effects study',
  'Microplastic sampling', 'Overwintering roost monitoring', 'eDNA sampling',
  'Disease surveillance', 'Vegetation transect study',
] as const;

const subjects = [
  'coastal cutthroat trout', 'coralline algae', 'overwintering monarchs', 'roosting bats',
  'vernal pool fairy shrimp', 'northern spotted owl', 'tidewater goby', 'California red-legged frog',
  'harbor seals', 'old-growth lichen', 'Pacific fisher', 'western pond turtle', 'steelhead',
  'eelgrass beds', 'burrowing owls', "Townsend's big-eared bat", 'sea otters', 'Dungeness crab',
  'marbled murrelet', 'foothill yellow-legged frog', 'coho salmon', 'bull kelp',
] as const;

const parks = [
  'Prairie Creek Redwoods State Park', 'Jedediah Smith Redwoods State Park',
  'Humboldt Lagoons State Park', 'Sue-meg State Park', 'Tolowa Dunes State Park',
  'Del Norte Coast Redwoods State Park', 'Grizzly Creek Redwoods State Park',
  'Mendocino Headlands State Park', 'Van Damme State Park', 'Russian Gulch State Park',
  'MacKerricher State Park', 'Salt Point State Park', 'Sonoma Coast State Park',
  'Big Basin Redwoods State Park', 'Año Nuevo State Park', 'Point Lobos State Natural Reserve',
  'Montaña de Oro State Park', 'Anza-Borrego Desert State Park', 'Mount Tamalpais State Park',
  'Pfeiffer Big Sur State Park',
] as const;

const organizations = [
  'Bodega Marine Laboratory', 'Cal Poly Humboldt', 'UC Davis', 'Western Monarch Watch',
  'North Bay Bat Alliance', 'Sierra Foothills Conservancy', 'Great Valley Wetlands Institute',
  'Pacific Coast Ornithology Lab', 'Redwood Ecology Collective', 'Coastal Herpetology Group',
  'Marine Mammal Research Center', 'Sonoma State University', 'San Francisco Bay Bird Observatory',
  'California Academy of Sciences', 'Point Blue Conservation Science', 'Scripps Coastal Reserve',
] as const;

const categories = [
  'Marine Aquatic Resources', 'Terrestrial Wildlife', 'Plant Ecology', 'Aquatic Invertebrates',
  'Cultural Resources', 'Geology & Paleontology', 'Freshwater Fisheries', 'Ornithology',
  'Herpetology', 'Entomology', 'Mammalogy',
] as const;

// Permit paperwork vocabulary — the classification fields the register carries.
const permitTypes = [
  'Scientific Research & Collection', 'Right of Entry', 'Special Use',
  'Educational Collection', 'Filming & Photography',
] as const;
const recordTypes = ['Permit', 'Amendment', 'Renewal', 'Application'] as const;
const renewalTypes = ['New', 'Renewal', 'Amendment', 'Reissuance'] as const;

// Free-text-ish labels a permit can be tagged with (0–2 per record).
const tagPool = [
  'Sensitive species', 'Marine', 'Multi-year', 'Federal co-permit',
  'Threatened/Endangered', 'Coastal Commission', 'Fee waived', 'Expedited',
] as const;

// People. Principal investigators + submitters are drawn broadly (first + last);
// analysts come from a smaller agency staff pool so names recur like real staff.
const firstNames = [
  'Ana', 'Ben', 'Carla', 'David', 'Elena', 'Frank', 'Grace', 'Hassan', 'Ingrid',
  'Jamal', 'Kira', 'Luis', 'Maya', 'Noah', 'Olga', 'Priya', 'Rosa', 'Sam',
  'Tara', 'Umar', 'Vera', 'Wes', 'Ximena', 'Yusuf', 'Zoe',
] as const;
const lastNames = [
  'Alvarez', 'Bennett', 'Cho', 'Delgado', 'Escobar', 'Fisher', 'Gupta', 'Hensley',
  'Ibarra', 'Jansen', 'Kwon', 'Lombardi', 'Muñoz', 'Nakamura', 'Osei', 'Park',
  'Quiroga', 'Reyes', 'Salazar', 'Thompson', 'Underwood', 'Vasquez', 'Yamada', 'Zavala',
] as const;
const person = () => `${pick(firstNames)} ${pick(lastNames)}`;

// Agency analysts who can be assigned to a permit (mirrors user.ts directory).
const analysts = [
  'J. Okafor', 'M. Santos', 'D. Cho', 'A. Moreno', 'K. Whitfield',
  'P. Nair', 'R. Delgado', 'L. Tran', 'T. Herrera', 'J. Park',
] as const;
const ME = currentUser.displayName; // 'J. Okafor' — stamped on the reviewer's own permits.

// Districts a permit can belong to — the statewide directory plus the reviewer's
// assigned districts (some of which aren't in the public directory), so the
// "My district" segment always has a meaningful population.
const myDistricts = currentUser.districts.map((d) => d.name);
const districts = Array.from(
  new Set([
    ...myDistricts,
    'North Coast Redwoods District', 'Northern Buttes District', 'Bay Area District',
    'Diablo Range District', 'Monterey District', 'Santa Cruz District',
    'San Luis Obispo Coast District', 'Channel Coast District', 'Angeles District',
    'San Diego Coast District', 'Sierra District', 'Gold Fields District',
    'Capital District', 'Colorado Desert District', 'Inland Empire District',
    'Oceano Dunes District',
  ]),
);

// Status is a STATE, not a category — rendered as an icon+label tag so it never
// reads by colour alone (WCAG 1.4.1 / house status rule). `kind` selects the glyph.
// `kind` MUST be a valid cds-icon-indicator kind — the detail page renders it
// directly (an invalid kind draws no glyph). The grid maps the same key to its own
// icon in carbon-ag-grid.ts. Keep the two in sync.
const statuses = [
  { label: 'Active', kind: 'succeeded', w: 7 },
  { label: 'Under review', kind: 'in-progress', w: 6 },
  { label: 'Expired', kind: 'unknown', w: 4 },
  { label: 'Draft', kind: 'not-started', w: 3 },
  { label: 'Out for signature', kind: 'pending', w: 2 },
  { label: 'Returned to submitter', kind: 'caution-minor', w: 2 },
  { label: 'Rejected', kind: 'failed', w: 2 },
  { label: 'Withdrawn', kind: 'undefined', w: 1 },
] as const;
// Expand by weight so pick() draws the intended distribution.
const statusPool = statuses.flatMap((s) => Array<(typeof statuses)[number]>(s.w).fill(s));

// Roles the reviewer can hold on a permit — only a handful of permits are "hers".
const roles = ['Lead analyst', 'Supporting analyst', 'District reviewer', 'Technical reviewer'] as const;

const offices = ['411', '635', '208', '733', '512', '309', '874'] as const;

export interface PermitRow {
  /** Application / Permit # — the row identifier. */
  permitId: string;
  permitType: string;
  recordType: string;
  /** Project title (hidden by default — long, only needed on drill-in). */
  title: string;
  /** Human status label (also the value the grid sorts / quick-filters on). */
  status: string;
  /** Drives the status glyph + colour in the cell renderer. */
  statusKind: string;
  renewalType: string;
  category: string;
  /** Comma-separated free tags (hidden by default). */
  tags: string;
  principalInvestigator: string;
  /** PI Certificate-of-Field lead — the field-designated co-investigator. */
  picof: string;
  /** ISO YYYY-MM-DD dates — sort chronologically as strings; formatted on display. */
  projectStart: string;
  projectEnd: string;
  permitStart: string;
  permitEnd: string;
  submitted: string;
  submitter: string;
  organization: string;
  district: string;
  park: string;
  responsibleAnalyst: string;
  /** Comma-separated analyst names. */
  supportingAnalysts: string;
  /** Whether the signed permit document is on file ('Yes' / 'No'). */
  signedPermit: string;
  annualReportDue: string;
  /** Whether this year's annual report has been submitted ('Yes' / 'No'). */
  annualReportSubmitted: string;
  /** Link label when a report exists, else '' (rendered as an em dash). */
  annualReport: string;
  /** The reviewer's role on this permit, or '' when she has none. Drives buckets. */
  role: string;
  /** Precomputed filter buckets the grid's scope switcher reads. */
  _buckets: string[];
}

const COUNT = 960;
const pad3 = (n: number) => String(n).padStart(3, '0');
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export const permits: PermitRow[] = Array.from({ length: COUNT }, (_, i) => {
  const district = pick(districts);
  const status = pick(statusPool);
  // ~2.6% of permits are the reviewer's — drawn independently of district.
  const role = rng() < 0.026 ? pick(roles) : '';

  // Project spans several years; the permit is an annual authorization within it.
  const startYear = 2023 + Math.floor(rng() * 3); // 2023–2025
  const month = 1 + Math.floor(rng() * 12);
  const day = 1 + Math.floor(rng() * 28);
  const projLen = 1 + Math.floor(rng() * 3); // 1–3 year project

  const projectStart = iso(startYear, month, day);
  const projectEnd = iso(startYear + projLen, month, day);

  // Submitted a little before the permit takes effect (same season).
  const subMonth = 1 + ((month + 9) % 12); // ~2 months earlier, wrapped
  const submitted = iso(startYear, subMonth, day);
  const permitStart = iso(startYear, month, day);
  const permitEnd = iso(startYear + 1, month, day);
  // Annual report is due a month after the permit term ends.
  const annualReportDue = iso(startYear + 1, 1 + (month % 12), day);

  // Paperwork state follows status: an issued permit (Active or Expired) has a
  // signed doc on file; some of those have this year's annual report in.
  const issued = status.label === 'Active' || status.label === 'Expired';
  const signedPermit = issued ? 'Yes' : 'No';
  const reportIn = issued && rng() < 0.6;

  // The reviewer is stamped as responsible analyst on the permits that are "hers".
  const responsibleAnalyst = role ? ME : pick(analysts);
  const supportingAnalysts = pickN(analysts, 1 + Math.floor(rng() * 2), [responsibleAnalyst]).join(', ');

  const buckets = ['all'];
  if (role) buckets.push('mine');
  if (myDistricts.includes(district)) buckets.push('district');

  return {
    permitId: `${String(startYear).slice(2)}-${pick(offices)}-${pad3(i)}`,
    permitType: pick(permitTypes),
    recordType: pick(recordTypes),
    title: `${pick(studies)} of ${pick(subjects)} at ${pick(parks)}`,
    status: status.label,
    statusKind: status.kind,
    renewalType: pick(renewalTypes),
    category: pick(categories),
    tags: pickN(tagPool, Math.floor(rng() * 3)).join(', '),
    principalInvestigator: person(),
    picof: person(),
    projectStart,
    projectEnd,
    permitStart,
    permitEnd,
    submitted,
    submitter: person(),
    organization: pick(organizations),
    district,
    park: pick(parks),
    responsibleAnalyst,
    supportingAnalysts,
    signedPermit,
    annualReportDue,
    annualReportSubmitted: reportIn ? 'Yes' : 'No',
    annualReport: reportIn ? 'View report' : '',
    role,
    _buckets: buckets,
  };
});

// Live scope counts for the segmented switcher labels.
export const scopeCounts = {
  mine: permits.filter((p) => p._buckets.includes('mine')).length,
  district: permits.filter((p) => p._buckets.includes('district')).length,
  all: permits.length,
};

// Column definitions — JSON-serializable (no functions): `cellRenderer` /
// `valueFormatter` are STRING KEYS the AG Grid wrapper maps to real functions
// (see carbon-ag-grid.ts). `pinned` / `hide` seed the default view a reviewer can
// then customize; `flex: 0` + `width` keeps a column fixed while the flex columns
// share the remaining width. Order + default visibility + pins match the register's
// column-manager spec.
export const permitColumns = [
  { field: 'permitId', headerName: 'Application/Permit #', cellRenderer: 'permitLink', pinned: 'left', width: 160, flex: 0 },
  { field: 'permitType', headerName: 'Permit type', width: 220, flex: 0 },
  { field: 'recordType', headerName: 'Record type', width: 140, flex: 0 },
  { field: 'title', headerName: 'Project title', minWidth: 300, flex: 3, hide: true },
  { field: 'status', headerName: 'Status', cellRenderer: 'status', width: 190, flex: 0 },
  { field: 'renewalType', headerName: 'Renewal type', width: 150, flex: 0 },
  { field: 'category', headerName: 'Category', minWidth: 190, flex: 1 },
  { field: 'tags', headerName: 'Tags', cellRenderer: 'tags', minWidth: 200, flex: 1, hide: true },
  { field: 'principalInvestigator', headerName: 'Principal investigator', pinned: 'left', width: 200, flex: 0 },
  { field: 'picof', headerName: 'PICOF', headerTooltip: 'Person in direct charge of field work', width: 170, flex: 0 },
  { field: 'projectStart', headerName: 'Project start date', valueFormatter: 'date', width: 165, flex: 0 },
  { field: 'projectEnd', headerName: 'Project end date', valueFormatter: 'date', width: 165, flex: 0 },
  { field: 'permitStart', headerName: 'Permit start date', valueFormatter: 'date', pinned: 'left', width: 165, flex: 0 },
  { field: 'permitEnd', headerName: 'Permit end date', valueFormatter: 'date', width: 165, flex: 0 },
  { field: 'submitted', headerName: 'Date submitted', valueFormatter: 'date', width: 165, flex: 0 },
  { field: 'submitter', headerName: 'Submitter', width: 190, flex: 0 },
  { field: 'organization', headerName: 'Organization', minWidth: 200, flex: 1 },
  { field: 'district', headerName: 'Districts', minWidth: 200, flex: 1 },
  { field: 'park', headerName: 'Park units', minWidth: 210, flex: 1 },
  { field: 'responsibleAnalyst', headerName: 'Responsible analyst', width: 190, flex: 0 },
  { field: 'supportingAnalysts', headerName: 'Supporting analysts', minWidth: 210, flex: 1 },
  { field: 'signedPermit', headerName: 'Signed permit', width: 150, flex: 0 },
  { field: 'annualReportDue', headerName: 'Annual report due date', valueFormatter: 'date', pinned: 'left', width: 190, flex: 0 },
  { field: 'annualReportSubmitted', headerName: 'Annual report submitted', width: 200, flex: 0 },
  { field: 'annualReport', headerName: 'Annual report', cellRenderer: 'doc', width: 160, flex: 0 },
] as const;
