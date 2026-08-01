// Condition-scope reference data + derivers for the THREE location/permit-derived
// scope axes that complement park-unit and activity scope (see conditions.ts):
//   • sensitiveSpecies — protected resources present at the work site. NOT in the
//     applicant's answers (they declare what they COLLECT, not what's PRESENT); it
//     is a property of the PARK, so it's derived from a park→species table.
//   • regions          — coastal / inland / desert / sierra. Derived from the
//     permit's districts (a district→region map).
//   • associatedPermits— CDFW / USFWS / NOAA underlying permits. Semi-derived from
//     the application's "requires additional permits" gate + its free-text detail.
//
// All three are HEURISTIC / representative seed data (house no-real-*client*-data
// rule; species-at-park and district-region groupings are public facts). The park
// species map is a demonstrative SUBSET — most parks are intentionally empty.
import { parkKey } from './parks';

// ── Sensitive species / protected resources ─────────────────────────────────
export interface ScopeOption { id: string; label: string; }

export const sensitiveSpecies: ScopeOption[] = [
  { id: 'snowy-plover', label: 'Western Snowy Plover' },
  { id: 'marbled-murrelet', label: 'Marbled Murrelet' },
  { id: 'spotted-owl', label: 'Spotted Owl' },
  { id: 'marine-mammals', label: 'Marine mammals / pinnipeds' },
  { id: 'nesting-birds', label: 'Nesting birds (general)' },
];

export const regions: ScopeOption[] = [
  { id: 'coastal', label: 'Coastal' },
  { id: 'inland', label: 'Inland' },
  { id: 'desert', label: 'Desert' },
  { id: 'sierra', label: 'Sierra / mountain' },
];

export const associatedPermits: ScopeOption[] = [
  { id: 'cdfw-scp', label: 'CDFW Scientific Collecting Permit' },
  { id: 'usfws', label: 'USFWS permit (10(a)(1)(A) / salvage)' },
  { id: 'noaa-mou', label: 'NOAA stranding agreement / MOU' },
];

const labeler = (opts: ScopeOption[]) => {
  const m = new Map(opts.map((o) => [o.id, o.label]));
  return (id: string) => m.get(id) ?? id;
};
export const speciesLabel = labeler(sensitiveSpecies);
export const regionLabel = labeler(regions);
export const agencyLabel = labeler(associatedPermits);

// ── District → region ───────────────────────────────────────────────────────
// Keyed by full district name (as it appears on a permit's study areas). The
// department's field districts map cleanly to a coarse region.
const DISTRICT_REGION: Record<string, string> = {
  'North Coast Redwoods District': 'coastal',
  'Mendocino District': 'coastal',
  'Sonoma-Mendocino Coast District': 'coastal',
  'Bay Area District': 'coastal',
  'Santa Cruz District': 'coastal',
  'Monterey District': 'coastal',
  'San Luis Obispo Coast District': 'coastal',
  'Channel Coast District': 'coastal',
  'Orange Coast District': 'coastal',
  'San Diego Coast District': 'coastal',
  'Diablo Range District': 'inland',
  'Inland Empire District': 'inland',
  'Angeles District': 'inland',
  'Capital District': 'inland',
  'Gold Fields District': 'inland',
  'Northern Buttes District': 'inland',
  'Colorado Desert District': 'desert',
  'Tehachapi District': 'desert',
  'Sierra District': 'sierra',
};

// ── Park → sensitive species (representative SUBSET) ─────────────────────────
// Keyed by park slug (parkKey). Only parks with a credible, well-known protected
// resource are seeded; every other park derives no species (empty) — honest about
// the prototype's partial coverage.
const PARK_SPECIES: Record<string, string[]> = {
  // Old-growth redwoods — Marbled Murrelet + Spotted Owl canopy habitat.
  'prairie-creek-redwoods-state-park': ['marbled-murrelet', 'spotted-owl'],
  'del-norte-coast-redwoods-state-park': ['marbled-murrelet', 'spotted-owl'],
  'jedediah-smith-redwoods-state-park': ['marbled-murrelet', 'spotted-owl'],
  'humboldt-redwoods-state-park': ['spotted-owl'],
  'big-basin-redwoods-state-park': ['marbled-murrelet', 'spotted-owl'],
  // Coastal beaches / dunes — Snowy Plover, marine mammals, nesting shorebirds.
  'mackerricher-state-park': ['snowy-plover', 'marine-mammals', 'nesting-birds'],
  'sonoma-coast-state-park': ['snowy-plover', 'marine-mammals'],
  'salt-point-state-park': ['marine-mammals'],
  'silver-strand-state-beach': ['snowy-plover', 'nesting-birds'],
  'torrey-pines-state-natural-reserve': ['snowy-plover'],
  'point-lobos-state-natural-reserve': ['marine-mammals'],
};

// ── Derivers (loosely typed to avoid a data-module import cycle) ─────────────
const uniqInOrder = (all: ScopeOption[], hits: Set<string>) =>
  all.map((o) => o.id).filter((id) => hits.has(id));

/** Regions a permit spans — from its study-area districts. */
export function derivePermitRegions(p: any): string[] {
  const hits = new Set<string>();
  for (const d of p?.studyAreas?.districts ?? []) {
    const r = DISTRICT_REGION[d?.name ?? ''];
    if (r) hits.add(r);
  }
  return uniqInOrder(regions, hits);
}

/** Sensitive species present in a permit's study areas — union over its parks. */
export function derivePermitSensitiveSpecies(p: any): string[] {
  const hits = new Set<string>();
  for (const d of p?.studyAreas?.districts ?? []) {
    for (const parkName of d?.parks ?? []) {
      for (const s of PARK_SPECIES[parkKey(parkName)] ?? []) hits.add(s);
    }
  }
  return uniqInOrder(sensitiveSpecies, hits);
}

/** Underlying agency permits a permit relies on. Only when the application's
 *  "requires additional permits" gate is Yes; the specific agency is keyword-read
 *  from its free-text detail (lossy — same heuristic caveat as activities). */
export function derivePermitAssociatedPermits(p: any): string[] {
  const facts = p?.additionalDocs?.facts ?? [];
  const requires = facts.some(
    (f: any) => /\badditional\b[\s\S]*\bpermits?\b/i.test(f?.key ?? '') && /^\s*yes\s*$/i.test(f?.value ?? ''),
  );
  if (!requires) return [];
  const text = [p?.additionalDocs?.additionalPermitsDetails ?? '', ...(facts.map((f: any) => f?.value ?? ''))].join('\n');
  const hits = new Set<string>();
  if (/\b(cdfw|california department of fish (and|&) wildlife|scientific collecting permit|\bscp\b)/i.test(text)) hits.add('cdfw-scp');
  if (/\b(usfws|u\.?s\.? fish (and|&) wildlife|10\(a\)\(1\)\(a\)|salvage permit)\b/i.test(text)) hits.add('usfws');
  if (/\b(noaa|national oceanic|stranding (agreement|network)|marine mammal center)\b/i.test(text)) hits.add('noaa-mou');
  return uniqInOrder(associatedPermits, hits);
}
