// Field-activity taxonomy — the enumerated methods/activities a permit's field
// work can involve. This is the single source of truth for the SHAPE of an
// activity and the canonical CATALOG. It exists so special conditions can be
// AUTO-APPLIED by activity ("attach the drone rules whenever the permit flies a
// UAS") the same way `parks.ts` lets them be scoped by location.
//
// Why a structured list at all: the application captures activities as coarse
// yes/no screening questions ("Activities beyond simple use…") plus free-text
// method narratives — too lumpy to key conditions off. A permit now carries a
// structured `activities: string[]` (kebab ids from this list) so the match is
// exact and deterministic. The list is a representative slice of NRD field
// methods, not exhaustive — a prototype vocabulary (house no-real-*client*-data
// rule; this is public method terminology, not client data).

export interface Activity {
  /** Kebab-case id — the value stored on a permit + a condition's scope. */
  id: string;
  /** Human label as it appears in pickers and on chips. */
  label: string;
}

/** The catalog, alphabetical by label (the order pickers render). */
export const activities: Activity[] = [
  { id: 'banding-mistnetting', label: 'Banding / mist-netting' },
  { id: 'drone-uas', label: 'Drone / UAS operation' },
  { id: 'intertidal-collection', label: 'Intertidal collection' },
  { id: 'marine-mammal-salvage', label: 'Marine-mammal / carcass salvage' },
  { id: 'plant-collection', label: 'Plant / algae collection' },
  { id: 'scientific-diving', label: 'Scientific diving (SCUBA)' },
  { id: 'seining-netting', label: 'Seining / netting' },
  { id: 'soil-disturbance', label: 'Soil disturbance / excavation' },
  { id: 'tree-climbing', label: 'Tree / canopy climbing' },
  { id: 'trapping', label: 'Trapping (pitfall / live / camera)' },
  { id: 'vehicle-atv', label: 'Vehicle / ATV beach access' },
  { id: 'water-sampling', label: 'Water sampling' },
].sort((a, b) => a.label.localeCompare(b.label));

/** id → Activity, for resolving a stored id back to its label. */
export const activityById = new Map<string, Activity>(activities.map((a) => [a.id, a]));

/** Display label for an activity id (falls back to the id if unknown). */
export const activityLabel = (id: string): string => activityById.get(id)?.label ?? id;

// ── Deriving a permit's activities from its application answers ───────────────
// The application has NO structured activity field yet — it captures activities as
// free-text method narratives + two coarse yes/no gates (soil disturbance, and one
// lumped "beyond simple use" flag that can't tell drone from dive from trap). Until
// an explicit picker exists, we DERIVE activity ids heuristically by keyword over
// the permit's NARRATIVE fields (title, purpose, crew roles, specimen list). This
// is lossy by design: it can miss an activity the text doesn't name, and it only
// reads narrative — NOT the screening-question LABELS, which enumerate every
// activity ("aircraft/drones, diving, trapping…") and would false-match everything.
// Keywords are specific + word-boundary anchored to avoid false hits (bare
// "net"/"marine"). `soil-disturbance` comes from the structured boolean, not text.
const ACTIVITY_KEYWORDS: [string, RegExp][] = [
  ['scientific-diving', /\b(scuba|divers?|diving|subtidal|aaus)\b/i],
  ['intertidal-collection', /\bintertidal\b/i],
  ['plant-collection', /\b(algae|macroalga\w*|coralline|fronds?|herbarium|seaweed|kelp|botan\w+)\b/i],
  ['seining-netting', /\b(seine|seining|beach net|haul net)\b/i],
  ['drone-uas', /\b(drones?|uas|unmanned aircraft|aerial survey)\b/i],
  ['tree-climbing', /\b(tree[- ]?climb\w*|canopy climb\w*)\b/i],
  ['trapping', /\b(pitfall|live[- ]trap\w*|camera[- ]trap\w*|trapping)\b/i],
  ['banding-mistnetting', /\b(mist[- ]?net\w*|bird banding|banding station)\b/i],
  ['vehicle-atv', /\b(atvs?|off[- ]road vehicle|4x4|beach driving)\b/i],
  ['water-sampling', /\b(water sampl\w+|water quality|grab samples?)\b/i],
  ['marine-mammal-salvage', /\b(pinnipeds?|marine mammals?|carcass salvage|stranded (animal|marine))\b/i],
  // 'soil-disturbance' is driven by the structured boolean below, not keywords.
];

/** Derive activity ids from narrative `text` + the soil-disturbance gate. HEURISTIC
 *  and lossy (see note above). Returns ids in taxonomy order, deduped. */
export function deriveActivities(text: string, opts: { soilDisturbance?: boolean } = {}): string[] {
  const hits = new Set<string>();
  for (const [id, re] of ACTIVITY_KEYWORDS) if (re.test(text)) hits.add(id);
  if (opts.soilDisturbance) hits.add('soil-disturbance');
  return activities.map((a) => a.id).filter((id) => hits.has(id));
}

/** Assemble a permit's activity-bearing NARRATIVE (title, category, purpose, crew
 *  roles/notes, specimen list) and derive from it, plus the structured soil gate.
 *  Loosely typed to avoid a data-module import cycle. */
export function derivePermitActivities(p: any): string[] {
  const parts: string[] = [p?.name ?? '', p?.category ?? '', p?.projectInfo?.purpose ?? ''];
  for (const m of p?.researchTeam?.participants ?? []) parts.push(m?.title ?? '', m?.comments ?? '');
  for (const s of p?.dataCollection?.specimens ?? []) parts.push(s?.species ?? '', s?.portion ?? '');
  const facts = p?.additionalDocs?.facts ?? [];
  const soilDisturbance = facts.some(
    (f: any) => /soil disturbance/i.test(f?.key ?? '') && /^\s*yes\s*$/i.test(f?.value ?? ''),
  );
  return deriveActivities(parts.join('\n'), { soilDisturbance });
}
