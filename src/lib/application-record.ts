// The application record's shared frontmatter data — ONE place builds what the
// per-section components (src/components/application/*) and the review wizard's
// ApplicationReview both read: the research-team cards, the requested-dates
// tiles, the category options, the data-collection parts, and the record-editing
// specs the shared edit modal consumes (src/lib/record-edit.ts). The permit detail
// page composes the same sections read-only, so the two surfaces can't drift.
//
// Pure data (no DOM): safe to import from Astro frontmatter.
import type { EditField, EditSpec } from './record-edit';
import { permit, type MetaRow, type Contact } from '../data/permit';
import { parks } from '../data/parks';
import { teamCards } from './team-cards';
import { yesNo } from './yes-no';

/** How a section is framed by its host (see ReviewSection.astro):
 *  - collapsible: the wizard's sticky, collapsible disclosure (+ layered content);
 *  - panel: the detail page's static raised panel (content one layer deeper);
 *  - neither: a plain titled block (PermitSection). */
export interface SectionFrame {
  collapsible?: boolean;
  layered?: boolean;
  panel?: boolean;
  orderIndex?: number;
  /** Anchored-comments hook (the detail page's ?comments=anchored study). */
  commentKey?: string;
}

/** Visual order in the wizard's collapsible mode (CSS `order` + sticky offset):
 *  Project information leads, then the rest in reading order. */
export const ORDER = { project: 0, team: 1, study: 2, data: 3, docs: 4 } as const;

const t = permit.researchTeam;
const pj = permit.projectInfo;
const dc = permit.dataCollection;
const ad = permit.additionalDocs;
const sa = permit.studyAreas;

// Project categories — the CA State Parks scientific-research classifications the
// analyst can reclassify the permit into (invented, credible). The application's
// own category is guaranteed present so the dropdown always has a valid seed.
const categories = [
  'Marine Aquatic Resources',
  'Freshwater Aquatic Resources',
  'Botanical Resources',
  'Terrestrial Wildlife',
  'Geology & Paleontology',
  'Cultural & Archaeological Resources',
];
export const categoryOptions = categories.includes(permit.category) ? categories : [permit.category, ...categories];

/** The research-team contact cards: organization, PI, field lead, submitter — one
 *  card per person (teamCards folds a person holding several roles). */
export const team = teamCards([
  { role: 'Organization', contact: t.organization, kind: 'organization' },
  { role: 'Principal investigator', contact: t.principalInvestigator, cvHref: t.principalInvestigator.cvHref },
  { role: 'Person in direct charge of field work', contact: t.fieldLead, cvHref: t.fieldLead.cvHref },
  { role: 'Submitter', contact: t.submitter, cvHref: t.submitter.cvHref },
]);

/** When not all personnel are employed/insured, the application requires a signed
 *  Liability waiver addendum (DPR65B) — found among the uploads to link it. */
export const waiverDoc = ad.files.find((f) => /DPR65B/i.test(f.type));

/** The project narratives (title + category print on the letter). */
export const projectItems = [
  { key: 'project-title', label: 'Project title', field: 'title', value: permit.name },
  { key: 'project-category', label: 'Category', field: 'category', value: permit.category },
  { key: 'project-purpose', label: 'Project purpose', field: 'text', value: pj.purpose },
  { key: 'project-benefits', label: 'Anticipated benefits to the California State Park System', field: 'text', value: pj.benefits },
];

/** Requested dates as tiles — label over a heading-size range, built from the
 *  structured date labels. The two annual-report dates aren't a range, so they
 *  stack as labeled entries in one tile. */
export const requestedDates: MetaRow[] = [
  { key: 'Project dates', value: `${pj.projectWindow.startLabel} – ${pj.projectWindow.endLabel}` },
  { key: 'Permit requested dates', value: `${permit.activeWindow.start} – ${permit.activeWindow.end}` },
  { key: 'Final report', entries: [
    { label: 'Tentative completion', value: pj.annualReport.tentativeLabel },
    { label: 'Required by', value: pj.annualReport.requiredLabel },
  ] },
];

/** Data collection's two parts, each led by its gate answer: specimen collection →
 *  Specimens + Collection & curation; laboratory work → Laboratory & analysis. */
export const dataCollectionParts = [
  { scope: 'dc-collection', on: dc.involvesCollection, statements: yesNo.specimenCollection, gateLabel: 'specimen collection',
    gateKey: 'Specimen collection', heading: 'Collection & curation', prefix: 'collection', rows: dc.collection as readonly MetaRow[], specimens: true },
  { scope: 'dc-laboratory', on: dc.involvesLaboratory, statements: yesNo.labWork, gateLabel: 'laboratory work',
    gateKey: 'Laboratory work', heading: 'Laboratory & analysis', prefix: 'laboratory', rows: dc.laboratory as readonly MetaRow[], specimens: false },
] as const;

/** Additional-documents screening facts: yes/no answers with statement phrasing
 *  render as statements; the rest (Budget, Literature cited …) as label-over-value. */
export const statementFacts = (ad.facts as readonly MetaRow[]).filter((r) => r.boolean && r.statements);
export const otherFacts = (ad.facts as readonly MetaRow[]).filter((r) => !(r.boolean && r.statements));
export const factIndex = (r: MetaRow) => (ad.facts as readonly MetaRow[]).indexOf(r);

/** Study-area parks options for the wizard's filterable multi-select, scoped to
 *  this permit's districts: the state parks directory for those districts, plus any
 *  already-selected units the directory doesn't list. */
const permitDistrictNames = sa.districts.map((d) => d.name);
const directoryParks = parks
  .filter((p) => permitDistrictNames.includes(p.district))
  .map((p) => ({ name: p.name, district: p.district }));
const directoryNames = new Set(directoryParks.map((p) => p.name));
const seededExtras = sa.districts.flatMap((d) =>
  d.parks.filter((name) => !directoryNames.has(name)).map((name) => ({ name, district: d.name })),
);
export const studyAreaOptions = [...directoryParks, ...seededExtras].sort((a, b) => a.name.localeCompare(b.name));

/** Carbon `document` glyph path (the wizard's submitted-files list). */
export const fileGlyph =
  'M25.7 9.3l-7-7A1 1 0 0018 2H8a2 2 0 00-2 2v24a2 2 0 002 2h16a2 2 0 002-2V10a1 1 0 00-.3-.7zM18 4.4l5.6 5.6H18zM24 28H8V4h8v6a2 2 0 002 2h6z';

// ── Record editing specs ─────────────────────────────────────────────────────
// One entry per editable item, keyed to its Edit button + [data-edit-scope].
// `values` are the seeds (saved edits override them client-side); `display` maps a
// data-bind name to a template when the shown text is derived (date ranges, "—").
const contactFields: EditField[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'email', label: 'Email', type: 'text' },
  { name: 'address', label: 'Address', type: 'text' },
];
const contactValues = (c: Contact) => ({ name: c.name, phone: c.phone ?? '', email: c.email ?? '', address: c.address ?? '' });
// A fact answered either by pointing at the study proposal or by a typed answer.
const answerFields = (label: string): EditField[] => [
  { name: 'inProposal', label: 'Answered in study proposal', type: 'check' },
  { name: 'value', label, type: 'textarea', showIf: '!inProposal' },
];
const factSpecs = (prefix: string, section: string, rows: readonly MetaRow[]) =>
  Object.fromEntries(rows.map((r, i): [string, EditSpec] => [`${prefix}-${i}`,
    r.contact
      ? { section, title: r.key, fields: contactFields, values: contactValues(r.contact) }
      : r.href
        ? { section, title: r.key, fields: answerFields(r.key), values: { inProposal: true, value: '' } }
        : { section, title: r.key, fields: [{ name: 'value', label: r.key, type: 'textarea' }], values: { value: r.value ?? '' } },
  ]));

export const editSpecs: Record<string, EditSpec> = {
  ...Object.fromEntries(team.map((c, i): [string, EditSpec] => [`team-${i}`, {
    section: 'Research team', title: c.roles.join(' · '), fields: contactFields, values: contactValues(c.contact),
    role: c.roles.includes('Organization') ? 'letter-org' : c.roles.includes('Principal investigator') ? 'letter-pi' : undefined,
  }])),
  ...Object.fromEntries(t.participants.map((p, i): [string, EditSpec] => [`participant-${i}`, {
    section: 'Additional participants', title: p.name,
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'email', label: 'Email', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'comments', label: 'Comments', type: 'textarea' },
    ],
    values: { name: p.name, title: p.title ?? '', email: p.email ?? '', phone: p.phone ?? '', comments: p.comments ?? '' },
    display: { comments: '{comments|dash}' },
  }])),
  'personnel-insured': {
    section: 'Research team', title: 'Personnel coverage',
    fields: [{ name: 'value', label: 'Are all personnel employed or insured by the institution?', type: 'yesno', ...yesNo.personnelInsured }],
    values: { value: t.personnelInsured },
  },
  'project-title': {
    section: 'Project information', title: 'Project title', role: 'letter-title',
    fields: [{ name: 'title', label: 'Project title', type: 'text' }], values: { title: permit.name },
  },
  'project-category': {
    section: 'Project information', title: 'Category', role: 'letter-category',
    fields: [{ name: 'category', label: 'Category', type: 'select', options: categoryOptions }], values: { category: permit.category },
  },
  'project-purpose': {
    section: 'Project information', title: 'Project purpose',
    fields: [{ name: 'text', label: 'Project purpose', type: 'textarea' }], values: { text: pj.purpose },
  },
  'project-benefits': {
    section: 'Project information', title: 'Anticipated benefits',
    fields: [{ name: 'text', label: 'Anticipated benefits to the California State Park System', type: 'textarea' }], values: { text: pj.benefits },
  },
  // Date windows use ONE range picker, exactly as the application's Project dates do.
  'dates-0': {
    section: 'Requested dates', title: 'Project dates',
    fields: [{ name: 'range', label: 'Project dates', type: 'daterange', startLabel: 'Project start date', endLabel: 'Project end date' }],
    values: { start: pj.projectWindow.startISO, end: pj.projectWindow.endISO }, display: { value: '{start|date} – {end|date}' },
  },
  'dates-1': {
    section: 'Requested dates', title: 'Permit requested dates',
    fields: [{ name: 'range', label: 'Permit requested dates', type: 'daterange', startLabel: 'Permit requested start date', endLabel: 'Permit requested end date' }],
    values: { start: permit.activeWindow.startISO, end: permit.activeWindow.endISO }, display: { value: '{start|date} – {end|date}' },
  },
  'dates-2': {
    section: 'Requested dates', title: 'Final report',
    fields: [{ name: 'tentative', label: 'Tentative completion', type: 'date' }, { name: 'required', label: 'Required by', type: 'date' }],
    values: { tentative: pj.annualReport.tentativeISO, required: pj.annualReport.requiredISO },
    display: { 'entry-0': '{tentative|date}', 'entry-1': '{required|date}' },
  },
  'field-occurrences': {
    section: 'Project information', title: 'Field investigation occurrences',
    // The application's roster pattern (range picker + Add occurrence + table), on
    // the structured ISO sessions — not free text.
    fields: [{ name: 'occurrences', label: 'Field investigation occurrences', type: 'occurrences',
      helper: 'Each discrete window your team will be on-site. Add a start and end date for every occurrence.' }],
    values: { occurrences: pj.fieldSessions.map((s) => ({ ...s })) },
  },
  'dc-collection': {
    section: 'Data collection', title: 'Specimen collection',
    fields: [{ name: 'value', label: 'Does the project involve specimen collection?', type: 'yesno', ...yesNo.specimenCollection }],
    values: { value: dc.involvesCollection },
  },
  'dc-laboratory': {
    section: 'Data collection', title: 'Laboratory work',
    fields: [{ name: 'value', label: 'Does the project involve laboratory work?', type: 'yesno', ...yesNo.labWork }],
    values: { value: dc.involvesLaboratory },
  },
  ...factSpecs('collection', 'Collection & curation', dc.collection),
  ...factSpecs('laboratory', 'Laboratory & analysis', dc.laboratory),
  ...Object.fromEntries((ad.facts as readonly MetaRow[]).map((r, i): [string, EditSpec] => [`doc-fact-${i}`,
    r.boolean && r.statements
      ? {
          section: 'Additional documents', title: r.key,
          fields: [
            { name: 'value', label: r.key, type: 'yesno', ...r.statements },
            { name: 'detail', label: 'Details', type: 'textarea', showIf: 'value' },
          ],
          values: { value: r.value === 'Yes', detail: r.detail ?? '' },
        }
      : r.href
        ? { section: 'Additional documents', title: r.key, fields: answerFields(r.key), values: { inProposal: true, value: '' } }
        : { section: 'Additional documents', title: r.key, fields: [{ name: 'value', label: r.key, type: 'textarea' }], values: { value: r.value ?? '' } },
  ])),
};
export const editPayload = { storageKey: `record-edits-${permit.id}`, specs: editSpecs };
