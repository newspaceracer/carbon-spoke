// Mock data for the permits INDEX prototype — the full register a reviewer
// scans (900+ CA State Parks Scientific Research & Collection Permits). This is
// the large, interactive table case: too many rows for tiles, so the index is an
// AG Grid (see CLAUDE.md "Grids"). Every record is INVENTED and deterministic —
// permit IDs, applicant names, titles, and dates are fabricated by a seeded PRNG,
// so the same 960 rows appear on every build. Public scientific facts (taxa, park
// names, resource categories) are kept only for domain credibility.
//
// The signed-in reviewer is J. Okafor (see user.ts). Two membership facts drive
// the index's quick-filter segments:
//   - "My permits"   — permits where she holds a role (row.role is set).
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
const statuses = [
  { label: 'Under Review', kind: 'in-progress', w: 6 },
  { label: 'Approved', kind: 'succeeded', w: 5 },
  { label: 'Awaiting Submittal', kind: 'pending', w: 3 },
  { label: 'Amendment Requested', kind: 'amendment', w: 2 },
  { label: 'Rejected', kind: 'failed', w: 2 },
  { label: 'Expired', kind: 'expired', w: 3 },
] as const;
// Expand by weight so pick() draws the intended distribution.
const statusPool = statuses.flatMap((s) => Array<(typeof statuses)[number]>(s.w).fill(s));

// Roles the reviewer can hold on a permit — only a handful of permits are "hers".
const roles = ['Lead analyst', 'Supporting analyst', 'District reviewer', 'Technical reviewer'] as const;

const offices = ['411', '635', '208', '733', '512', '309', '874'] as const;

export interface PermitRow {
  permitId: string;
  title: string;
  applicant: string;
  category: string;
  district: string;
  /** Human status label (also the value the grid sorts / quick-filters on). */
  status: string;
  /** Drives the status glyph + colour in the cell renderer. */
  statusKind: string;
  /** The reviewer's role on this permit, or '' when she has none. */
  role: string;
  park: string;
  /** ISO YYYY-MM-DD — sorts chronologically as a string; formatted for display. */
  submitted: string;
  expires: string;
  /** Precomputed filter buckets the grid's scope switcher reads. */
  _buckets: string[];
}

const COUNT = 960;
const pad3 = (n: number) => String(n).padStart(3, '0');

export const permits: PermitRow[] = Array.from({ length: COUNT }, (_, i) => {
  const district = pick(districts);
  const status = pick(statusPool);
  // ~2.6% of permits are the reviewer's — drawn independently of district.
  const role = rng() < 0.026 ? pick(roles) : '';

  const submittedYear = 2024 + Math.floor(rng() * 3); // 2024–2026
  const month = 1 + Math.floor(rng() * 12);
  const day = 1 + Math.floor(rng() * 28);
  const submitted = `${submittedYear}-${pad3(month).slice(1)}-${pad3(day).slice(1)}`;
  const expires = `${submittedYear + 1}-${pad3(month).slice(1)}-${pad3(day).slice(1)}`;

  const buckets = ['all'];
  if (role) buckets.push('mine');
  if (myDistricts.includes(district)) buckets.push('district');

  return {
    permitId: `${String(submittedYear).slice(2)}-${pick(offices)}-${pad3(i)}`,
    title: `${pick(studies)} of ${pick(subjects)} at ${pick(parks)}`,
    applicant: pick(organizations),
    category: pick(categories),
    district,
    status: status.label,
    statusKind: status.kind,
    role,
    park: pick(parks),
    submitted,
    expires,
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
// share the remaining width.
export const permitColumns = [
  { field: 'permitId', headerName: 'Permit', cellRenderer: 'permitLink', pinned: 'left', width: 130, flex: 0 },
  { field: 'title', headerName: 'Title', minWidth: 300, flex: 3 },
  { field: 'status', headerName: 'Status', cellRenderer: 'status', width: 190, flex: 0 },
  { field: 'role', headerName: 'My role', cellRenderer: 'role', width: 165, flex: 0 },
  { field: 'category', headerName: 'Category', minWidth: 190, flex: 1 },
  { field: 'district', headerName: 'District', minWidth: 200, flex: 1 },
  { field: 'applicant', headerName: 'Applicant', minWidth: 200, flex: 1 },
  { field: 'park', headerName: 'Park unit', minWidth: 210, flex: 1, hide: true },
  { field: 'submitted', headerName: 'Submitted', valueFormatter: 'date', width: 150, flex: 0 },
  { field: 'expires', headerName: 'Expires', valueFormatter: 'date', width: 150, flex: 0, hide: true },
] as const;
