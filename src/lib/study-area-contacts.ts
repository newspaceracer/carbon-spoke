// The permit's authorized parks with WHO covers each — resolved from the contacts
// recorded on step ② of the finalize wizard (permit-final-${id}.contacts: a flat
// per-district list of { person, scope }, scope null = all the district's parks)
// and any edited park set (permit-parks-${id}), falling back to the seed the page
// server-renders. One resolver for every surface that shows parks + contacts
// (the Application tab's Authorized parks, the Overview's parks tile), so they
// never disagree.
import { parkKey } from '../data/parks';
import { contactCellHtml, dedupeContacts, type CellContact } from './contact-cell';

export interface StudyAreaModel {
  name: string;
  pool: CellContact[];
  seed: { person: string; scope: string[] | null }[];
  parks: string[];
}

export interface ResolvedPark { name: string; contacts: CellContact[] }
export interface ResolvedDistrict { name: string; contacts: CellContact[]; parks: ResolvedPark[] }

/** Read the server-rendered model (a JSON <script> by id). */
export const readStudyAreaModel = (elementId: string): StudyAreaModel[] => {
  try { return JSON.parse(document.getElementById(elementId)?.textContent || '[]'); } catch { return []; }
};

/** Districts A–Z, each with its district-wide contacts and its parks A–Z, every
 *  park carrying only its OWN (park-scoped) contacts. `recordedEdits: false`
 *  ignores what the wizard stored (the ?parks=all demo model). */
export function resolveStudyAreas(model: StudyAreaModel[], permitId: string, recordedEdits = true): ResolvedDistrict[] {
  const read = (key: string) => {
    if (!recordedEdits) return {};
    try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
  };
  const recorded: Record<string, StudyAreaModel['seed']> = read(`permit-final-${permitId}`).contacts || {};
  const editedParks: Record<string, string[]> = read(`permit-parks-${permitId}`);

  return model.map((d) => {
    const pool = new Map(d.pool.map((c) => [c.id, c]));
    const entries = recorded[d.name] || d.seed;
    return {
      name: d.name,
      contacts: dedupeContacts(entries.filter((e) => e.scope === null).map((e) => pool.get(e.person))),
      parks: [...(editedParks[d.name] || d.parks)].sort((a, b) => a.localeCompare(b)).map((park) => ({
        name: park,
        contacts: dedupeContacts(
          entries
            .filter((e) => Array.isArray(e.scope) && e.scope!.some((sp) => parkKey(sp) === parkKey(park)))
            .map((e) => pool.get(e.person)),
        ),
      })),
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

const esc = (s: string) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const parksLabel = (n: number) => `${n} ${n === 1 ? 'park' : 'parks'}`;

export interface DistrictBlocksOptions {
  /** Districts as cds-accordion items (the Application tab, above 5 districts). */
  collapse?: boolean;
  /** Show the contacts (false = the public view: parks only). */
  people?: boolean;
  /** Show at most this many parks in total (the Overview); district headings keep
   *  their full counts. */
  maxParks?: number;
}

/**
 * ONE look for "parks + who covers them": per district, its name and park count,
 * its contacts (initials chip, email + copy, tap-to-call), then its parks — a park's
 * own contact under it. Used by the Application tab's Authorized parks and the
 * Overview, so the two can't drift. Styles: src/styles/study-area-blocks.css
 * (scoped to the `.sad-list` container the HTML is placed in).
 */
export function districtBlocksHtml(districts: ResolvedDistrict[], { collapse = false, people = true, maxParks = Infinity }: DistrictBlocksOptions = {}): string {
  const none = '<span class="contact-cell__none t-body-01">No contact assigned</span>';
  const opts = { phone: true, avatar: true };
  let left = maxParks;
  const shown = districts
    .map((d) => { const parks = d.parks.slice(0, Math.max(0, left)); left -= parks.length; return { d, parks }; })
    .filter((x) => x.parks.length);
  const block = ({ d, parks }: (typeof shown)[number]) =>
    `<div class="sad__district">` +
      (collapse ? '' : `<h3 class="sad__name t-heading-compact-01">${esc(d.name)} <span class="sad__count">· ${parksLabel(d.parks.length)}</span></h3>`) +
      (people ? `<div class="sad__contacts contact-cell">${contactCellHtml(d.contacts, none, opts)}</div>` : '') +
    `</div>` +
    `<ul class="sad__parks">${parks.map((p) =>
      `<li class="sad__park" data-park="${esc(p.name.toLowerCase())}">` +
        `<span class="sad__park-name t-heading-compact-01">${esc(p.name)}</span>` +
        (people && p.contacts.length ? `<span class="sad__park-contact contact-cell">${contactCellHtml(p.contacts, '', opts)}</span>` : '') +
      '</li>').join('')}</ul>`;
  return collapse
    ? `<cds-accordion>${shown.map((x) =>
        `<cds-accordion-item class="sad" data-district="${esc(x.d.name.toLowerCase())}" title="${esc(x.d.name)} · ${parksLabel(x.d.parks.length)}"><div class="sad__body">${block(x)}</div></cds-accordion-item>`).join('')}</cds-accordion>`
    : shown.map((x) => `<section class="sad" data-district="${esc(x.d.name.toLowerCase())}"><div class="sad__body">${block(x)}</div></section>`).join('');
}
