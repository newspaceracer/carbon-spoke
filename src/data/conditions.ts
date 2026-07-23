// Special conditions — the reviewer-authored text items that get attached to a
// permit during review. This module is the single source of truth for their
// SHAPE and their SEED inventories, plus the small prototype-local persistence
// helpers (localStorage) shared by the /special-conditions console and the
// permit's Special conditions tab.
//
// Two axes describe every condition:
//   • owner  — 'hq' (headquarters, applies org-wide) or a district key.
//   • source — 'default'   : auto-attached to a permit when it enters review
//              'inventory' : pulled from a reusable catalog by a reviewer
//              'custom'    : typed once for this permit (rich text)
//
// Inventories are the reusable CATALOGS (per owner). A permit holds the APPLIED
// subset. Mock content is invented + domain-credible (house no-real-data rule).
import { districtDirectory } from './district';

export type ConditionOwner = 'hq' | string; // 'hq' or a district key
export type ConditionSource = 'default' | 'inventory' | 'custom';

/** A reusable catalog item living in one owner's inventory. A condition IS its
 *  text — there is no name, title, or short label; the body is the whole thing.
 *  Pickers and tables identify an item by a plain-text preview of that body. */
export interface ConditionInventoryItem {
  id: string;
  owner: ConditionOwner;
  /** The condition text as sanitized rich-text HTML — the entire condition. */
  body: string;
  /** Auto-attach to applicable permits the moment they enter review. */
  isDefault: boolean;
}

/** A condition as APPLIED to one permit (a snapshot, so later inventory edits
 *  never mutate an already-decided permit). */
export interface PermitCondition {
  id: string;
  owner: ConditionOwner;
  source: ConditionSource;
  /** Set when source === 'inventory' — the catalog item it came from. */
  inventoryId?: string;
  /** The condition text as sanitized rich-text HTML — the entire condition. */
  body: string;
  addedBy: string;
  addedAt: string;
}

// ── District keying ─────────────────────────────────────────────────────────
// A permit's study-area districts carry a display NAME; inventories are keyed by
// a slug. `districtKey` derives one from the other so the two surfaces agree
// (e.g. 'North Coast Redwoods District' -> 'north-coast-redwoods', matching the
// directory id).
export const districtKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/\bdistrict\b/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ── Seed inventories ────────────────────────────────────────────────────────
const p = (s: string) => `<p>${s}</p>`;

/** HQ / headquarters catalog. The truly-universal items are flagged default. */
export const hqInventory: ConditionInventoryItem[] = [
  { id: 'hq-carry', owner: 'hq', isDefault: true,
    body: p('The signed permit must be carried by field personnel during all activities and presented on request.') },
  { id: 'hq-scope', owner: 'hq', isDefault: true,
    body: p('Collection is limited to the approved study areas and the taxa and quantities listed under Data Collection.') },
  { id: 'hq-reserves', owner: 'hq', isDefault: true,
    body: p('No collection within posted marine reserve or special-closure boundaries.') },
  { id: 'hq-curation', owner: 'hq', isDefault: true,
    body: p('All collected specimens are State property and must be curated at the approved facility.') },
  { id: 'hq-annual', owner: 'hq', isDefault: true,
    body: p('An annual report is due by <strong>Aug 31, 2027</strong>.') },
  { id: 'hq-tribal', owner: 'hq', isDefault: false,
    body: p('Where activities may affect cultural resources, tribal consultation must be completed before any ground-disturbing work begins.') },
  { id: 'hq-incident', owner: 'hq', isDefault: false,
    body: p('Any incidental take of non-target or listed species must be reported to the Department within 48 hours.') },
  // Conditional standard conditions from the letter template — added by the
  // reviewer when applicable (the template brackets these "[Remove if …]").
  { id: 'hq-snpl', owner: 'hq', isDefault: false,
    body: p('Prior to conducting field work in coastal areas, the Permit Holder (and field assistants) will review the Western Snowy Plover brochures — Sharing the Beach and Rules and Guidelines for Protecting the Snowy Plover. Federally threatened Western Snowy Plovers nest and overwinter on many Pacific Coast beaches and coastal areas.') },
  { id: 'hq-aquatic', owner: 'hq', isDefault: false,
    body: p('The Permit Holder (and field assistants) agrees to clean and disinfect all field gear and equipment that contacts any waterbody before and after each site visit, per the CDFW Invasive Species Decontamination Protocol, to minimize the spread of aquatic invasive species, pests, and pathogens.') },
];

/** Per-district catalogs. Keyed by district slug; `name` lets the console label a
 *  district that isn't in the roster directory (e.g. Mendocino on the sample
 *  permit). Only the districts on the sample permit are populated in this
 *  prototype — the rest start empty and are built in the console. */
export const districtInventorySeeds: Record<string, { name: string; items: ConditionInventoryItem[] }> = {
  'north-coast-redwoods': {
    name: 'North Coast Redwoods District',
    items: [
      { id: 'ncr-reserve', owner: 'north-coast-redwoods', isDefault: true,
        body: p('No collection within the False Klamath Cove marine reserve boundary.') },
      { id: 'ncr-access', owner: 'north-coast-redwoods', isDefault: false,
        body: p('Intertidal access must be coordinated with the district ranger at least 48 hours in advance.') },
      { id: 'ncr-vehicles', owner: 'north-coast-redwoods', isDefault: true,
        body: p('Vehicles restricted to designated day-use lots; no driving on the beach or dunes.') },
      { id: 'ncr-pinniped', owner: 'north-coast-redwoods', isDefault: false,
        body: p('Maintain at least 100 yards from any pinniped haul-out; suspend work if animals show disturbance.') },
    ],
  },
  'mendocino': {
    name: 'Mendocino District',
    items: [
      { id: 'men-mhw', owner: 'mendocino', isDefault: true,
        body: p('Collection limited to rocky intertidal below the mean high-water line.') },
      { id: 'men-seal', owner: 'mendocino', isDefault: true,
        body: p('No disturbance of harbor-seal haul-out areas at MacKerricher.') },
      { id: 'men-checkin', owner: 'mendocino', isDefault: false,
        body: p('Check in with the district office before each field day and report the crew size and planned sites.') },
    ],
  },
};

/** Districts selectable as a "district representative" scope in the console —
 *  the roster directory, plus any seeded district not in it. */
export const districtOptions: { key: string; name: string }[] = (() => {
  const opts = districtDirectory.map((d) => ({ key: d.id, name: d.name }));
  const have = new Set(opts.map((o) => o.key));
  for (const [key, seed] of Object.entries(districtInventorySeeds)) {
    if (!have.has(key)) opts.push({ key, name: seed.name });
  }
  return opts;
})();

/** Human label for an owner. */
export const ownerLabel = (owner: ConditionOwner) =>
  owner === 'hq'
    ? 'Headquarters'
    : districtOptions.find((o) => o.key === owner)?.name ??
      districtInventorySeeds[owner]?.name ??
      owner;

/** The seed catalog for an owner (empty for an un-populated district). */
export const seedInventory = (owner: ConditionOwner): ConditionInventoryItem[] =>
  owner === 'hq'
    ? hqInventory.map((i) => ({ ...i }))
    : (districtInventorySeeds[owner]?.items ?? []).map((i) => ({ ...i }));

// ── Persistence (prototype-local; call ONLY from client scripts) ────────────
export const invStorageKey = (owner: ConditionOwner) =>
  owner === 'hq' ? 'sc-inv-hq' : `sc-inv-${owner}`;
export const permitConditionsKey = (permitId: string) => `permit-conditions-${permitId}`;
export const permitStatusKey = (permitId: string) => `permit-status-${permitId}`;

/** Load an owner's inventory, falling back to (and persisting) the seed. */
export function loadInventory(owner: ConditionOwner): ConditionInventoryItem[] {
  try {
    const raw = localStorage.getItem(invStorageKey(owner));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* malformed — fall through to seed */ }
  return seedInventory(owner);
}

export function saveInventory(owner: ConditionOwner, items: ConditionInventoryItem[]) {
  localStorage.setItem(invStorageKey(owner), JSON.stringify(items));
}

/** Load a permit's applied conditions. On first access (nothing stored) seed the
 *  permit from every DEFAULT item of HQ + each district on the permit — this is
 *  the "default conditions auto-attach when submitted for review" behaviour. */
export function loadPermitConditions(
  permitId: string,
  permitDistrictKeys: string[],
): PermitCondition[] {
  try {
    const raw = localStorage.getItem(permitConditionsKey(permitId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* malformed — reseed */ }

  const owners: ConditionOwner[] = ['hq', ...permitDistrictKeys];
  const seeded: PermitCondition[] = [];
  for (const owner of owners) {
    for (const item of loadInventory(owner)) {
      if (!item.isDefault) continue;
      seeded.push({
        id: `${item.id}--applied`,
        owner,
        source: 'default',
        inventoryId: item.id,
        body: item.body,
        addedBy: 'Standard condition',
        addedAt: 'On submission',
      });
    }
  }
  savePermitConditions(permitId, seeded);
  return seeded;
}

export function savePermitConditions(permitId: string, conditions: PermitCondition[]) {
  localStorage.setItem(permitConditionsKey(permitId), JSON.stringify(conditions));
}

// ── Small utilities shared by the client scripts ────────────────────────────
/** A unique-enough id for a newly authored condition (browser-only). */
export const newConditionId = (prefix = 'c') =>
  `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

/** Plain-text preview of a rich-text body (for table cells / truncation). */
export const plainText = (html: string) =>
  html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
