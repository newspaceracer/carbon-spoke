// Resource category tags — the curated vocabulary of internal handling labels a
// reviewer applies to a permit (triage + coordination). This module is the
// single source of truth for their SHAPE and their SEED catalog, plus the small
// prototype-local persistence helpers (localStorage) shared by the
// /resource-category-tags console and the permit's Tags picker.
//
// A tag is a label plus a color. Color is categorical (it groups tags), not a
// status — the text label always carries the meaning. Distinct from a permit's
// classification badges (which describe WHAT the permit is) and from its status
// (a STATE): tags are how the team is HANDLING the work.
//
// Mirrors the special-conditions catalog model (see ./conditions), minus the
// owner/scope split — handling tags are org-wide, not jurisdiction-scoped.

/** A Carbon cds-tag color `type`. The categorical palette only — no status
 *  colors (green/red as "good/bad") since a category tag is not a status. */
export type TagColor =
  | 'cool-gray' | 'gray' | 'warm-gray'
  | 'blue' | 'cyan' | 'teal' | 'green'
  | 'purple' | 'magenta' | 'red';

/** Color options offered in the console, in the order they appear in the picker. */
export const tagColors: { value: TagColor; label: string }[] = [
  { value: 'cool-gray', label: 'Cool gray' },
  { value: 'gray', label: 'Gray' },
  { value: 'warm-gray', label: 'Warm gray' },
  { value: 'blue', label: 'Blue' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'teal', label: 'Teal' },
  { value: 'green', label: 'Green' },
  { value: 'purple', label: 'Purple' },
  { value: 'magenta', label: 'Magenta' },
  { value: 'red', label: 'Red' },
];

export const defaultTagColor: TagColor = 'cool-gray';

/** A reusable tag in the org-wide catalog. The label IS the tag as it appears on
 *  a permit; color groups related tags. */
export interface ResourceTag {
  id: string;
  /** The tag text shown on a permit (e.g. "Priority"). */
  label: string;
  /** cds-tag color type (categorical). */
  color: TagColor;
}

// ── Seed catalog ─────────────────────────────────────────────────────────────
// The starting vocabulary; reviewers extend it in the console. Invented but
// domain-credible (house no-real-data rule).
export const seedTags: ResourceTag[] = [
  { id: 'rt-priority', label: 'Priority', color: 'red' },
  { id: 'rt-site-visit', label: 'Needs site visit', color: 'purple' },
  { id: 'rt-coastal', label: 'Coastal zone', color: 'cyan' },
  { id: 'rt-external-permit', label: 'Awaiting external permit', color: 'magenta' },
  { id: 'rt-sensitive', label: 'Sensitive species', color: 'teal' },
  { id: 'rt-tribal', label: 'Tribal consultation', color: 'purple' },
  { id: 'rt-expedited', label: 'Expedited', color: 'blue' },
  { id: 'rt-multi-year', label: 'Multi-year', color: 'cool-gray' },
  { id: 'rt-fee-waived', label: 'Fee waived', color: 'green' },
  { id: 'rt-federal', label: 'Federal co-permit', color: 'blue' },
];

// ── Persistence (prototype-local; call ONLY from client scripts) ─────────────
export const tagsStorageKey = 'resource-tags';

/** Load the tag catalog, falling back to the seed. */
export function loadTags(): ResourceTag[] {
  try {
    const raw = localStorage.getItem(tagsStorageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* malformed — fall through to seed */ }
  return seedTags.map((t) => ({ ...t }));
}

export function saveTags(tags: ResourceTag[]) {
  localStorage.setItem(tagsStorageKey, JSON.stringify(tags));
}

/** A unique-enough id for a newly authored tag (browser-only). */
export const newTagId = () =>
  `rt-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

/** Case-insensitive duplicate check against an existing catalog, optionally
 *  ignoring the row being edited. A tag's label is its identity. */
export const isDuplicateLabel = (label: string, tags: ResourceTag[], ignoreId?: string) => {
  const norm = label.trim().toLowerCase();
  return tags.some((t) => t.id !== ignoreId && t.label.trim().toLowerCase() === norm);
};
