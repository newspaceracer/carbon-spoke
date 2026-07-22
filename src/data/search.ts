// Mock search index for the permit-search prototype — CA State Parks Scientific
// Research & Collection Permits. Every record is INVENTED for this prototype:
// permit IDs, applicant/organization names, and dates are fabricated. Public
// scientific facts (taxa, park names) are kept only for domain credibility.
// Deterministic: the same set every build. Several records mention "monarch" so
// a search for that keyword returns a meaningful result set.

export interface PermitResult {
  id: string;
  name: string;
  /** Applying institution — invented. */
  organization: string;
  /** Park / district the work takes place in. */
  district: string;
  category: string;
  /** cds-icon-indicator kind — drives the status glyph + color. */
  status: { label: string; kind: string };
  submitted: string;
  /** One-line abstract, shown under the title in a result row. */
  summary: string;
  /** Free-text search terms in addition to the visible fields. */
  keywords: string[];
}

export const permits: PermitResult[] = [
  {
    id: '26-411-092',
    name: 'Overwintering monarch butterfly roost monitoring at Pismo State Beach',
    organization: 'Central Coast Lepidoptera Survey',
    district: 'Oceano Dunes District',
    category: 'Terrestrial Wildlife',
    status: { label: 'Under review', kind: 'in-progress' },
    submitted: 'Jun 30, 2026',
    summary:
      'Weekly cluster counts of overwintering monarchs (Danaus plexippus) across ' +
      'the eucalyptus grove, with microclimate logging at three roost sites.',
    keywords: ['monarch', 'butterfly', 'danaus plexippus', 'overwintering', 'pismo'],
  },
  {
    id: '26-411-078',
    name: 'Milkweed restoration and monarch breeding-habitat assessment',
    organization: 'Sierra Foothills Conservancy',
    district: 'Sierra District',
    category: 'Plant Ecology',
    status: { label: 'Active', kind: 'succeeded' },
    submitted: 'May 18, 2026',
    summary:
      'Assessment of native milkweed (Asclepias spp.) plantings as monarch breeding ' +
      'habitat, including larval density surveys along three restored transects.',
    keywords: ['monarch', 'milkweed', 'asclepias', 'restoration', 'breeding habitat'],
  },
  {
    id: '26-411-051',
    name: 'Monarch tagging and population census in central-coast groves',
    organization: 'Western Monarch Watch',
    district: 'Monterey District',
    category: 'Terrestrial Wildlife',
    status: { label: 'Draft', kind: 'not-started' },
    submitted: 'Apr 2, 2026',
    summary:
      'Non-lethal wing tagging and mark-recapture census to estimate the ' +
      'central-coast overwintering monarch population and inter-grove movement.',
    keywords: ['monarch', 'tagging', 'mark-recapture', 'census', 'population'],
  },
  {
    id: '26-635-017',
    name: 'Diversity of coralline algae in northern California and their reproductive systems',
    organization: 'Bodega Marine Laboratory',
    district: 'North Coast Redwoods District',
    category: 'Marine Aquatic Resources',
    status: { label: 'Under review', kind: 'in-progress' },
    submitted: 'Jun 12, 2026',
    summary:
      'Intertidal collection and reproductive analysis of coralline algae across ' +
      'four rocky-shore sites, quantifying species diversity and phenology.',
    keywords: ['algae', 'coralline', 'intertidal', 'marine', 'reproduction'],
  },
  {
    id: '26-208-140',
    name: 'Acoustic survey of roosting bats in coastal caves',
    organization: 'North Bay Bat Alliance',
    district: 'Mendocino District',
    category: 'Terrestrial Wildlife',
    status: { label: 'Active', kind: 'succeeded' },
    submitted: 'Mar 9, 2026',
    summary:
      'Ultrasonic acoustic monitoring of roosting bat species in sea caves, with ' +
      'emergence counts at dusk over a six-week window.',
    keywords: ['bat', 'acoustic', 'roost', 'caves', 'echolocation'],
  },
  {
    id: '26-733-004',
    name: 'Vernal pool fairy shrimp inventory, Sacramento Valley units',
    organization: 'Great Valley Wetlands Institute',
    district: 'Gold Fields District',
    category: 'Aquatic Invertebrates',
    status: { label: 'Rejected', kind: 'failed' },
    submitted: 'Feb 21, 2026',
    summary:
      'Presence/absence inventory of listed vernal pool fairy shrimp across ' +
      'seasonal wetlands, timed to the winter inundation period.',
    keywords: ['fairy shrimp', 'vernal pool', 'invertebrate', 'wetland', 'branchinecta'],
  },
];
