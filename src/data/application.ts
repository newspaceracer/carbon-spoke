// Mock data for the PUBLIC applicant flow — a scientist creating a Scientific
// Research & Collection Permit application. This is a DIFFERENT persona from the
// internal reviewer in user.ts: here the signed-in account is the member of the
// public who submits the permit, and the application starts life as a Draft.
//
// Every personal / organizational detail is INVENTED (house no-real-data rule)
// and deterministic — same values every build. Addresses use the country-aware
// generic `Address` shape (data/address.ts) that <AddressFieldset> reads/writes,
// so the form, this seed, and the summary all speak one address model; `region`
// carries the USPS code for US addresses (e.g. 'CA'), matched against `states`.
import type { Address } from './address';
import { permit, type MetaRow } from './permit';
export type { Address };

// ALIGNED WITH THE PERMIT: the application this flow edits IS permit 26-635-017's
// application (data/permit.ts) — the same organization, team, project, parks,
// specimens, and answers — so revising a returned application (/apply?revise=…)
// or amending it (/apply?amend=…) shows exactly what the reviewers see. Values
// are DERIVED from permit.ts wherever the shapes allow, so the two can't drift.
// A brand-new application (no query) starts from the same answers with its one
// deliberate gap cleared client-side (see applicationIssues).

// "(707) 555-0142" → "+17075550142" — the form stores person phones as E.164.
const e164 = (display?: string) => {
  const digits = (display ?? '').replace(/\D/g, '');
  return digits ? `+1${digits.slice(-10)}` : '';
};
// "1 Harpst St, Arcata, CA 95521" → the structured Address the form edits.
const harpst: Address = { country: 'US', line1: '1 Harpst St', line2: '', city: 'Arcata', region: 'CA', postalCode: '95521' };
const splitName = (full: string) => {
  const parts = full.replace(/^(Dr\.?|Prof\.?)\s+/i, '').split(/\s+/);
  return { firstName: parts.slice(0, -1).join(' ') || parts[0], lastName: parts.length > 1 ? parts[parts.length - 1] : '' };
};
const isoToMdy = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return `${m}/${d}/${y}`; };
const rt = permit.researchTeam;
const pj = permit.projectInfo;
const pdc = permit.dataCollection;
const pad = permit.additionalDocs;
const fileOf = (re: RegExp) => pad.files.find((f) => re.test(f.type))?.name ?? '';

/** One step in the application wizard, shown in the progress indicator. The
 *  first five are form pages; the last (`summary`) is a read-only review. */
export interface ApplicationStep {
  id: string;
  label: string;
  /** Sub-label under the step label in the progress indicator. */
  secondaryLabel: string;
  /** The summary step reviews the others rather than collecting input. */
  review?: boolean;
}

export const applicationSteps: ApplicationStep[] = [
  { id: 'research-team', label: 'Research team', secondaryLabel: 'Who is conducting the research' },
  { id: 'project-info', label: 'Project information', secondaryLabel: 'Purpose, scope, and dates' },
  { id: 'study-areas', label: 'Study areas', secondaryLabel: 'Parks and locations' },
  { id: 'data-collection', label: 'Data collection', secondaryLabel: 'Methods and specimens' },
  { id: 'additional-docs', label: 'Additional documents', secondaryLabel: 'Supporting materials' },
  { id: 'summary', label: 'Application summary', secondaryLabel: 'Review and submit', review: true },
];

// The draft being worked on. A brand-new application is created in `Draft` status
// and carries a system-assigned tracking id from the moment it's started.
export const draft = {
  id: 'SCP-2026-00847',
  status: 'Draft',
  startedOn: 'Jul 18, 2026',
};

// The applicant organization's OWN contact record — the institution conducting
// the research, distinct from any one person. Prefilled from the account so the
// applicant confirms rather than retypes. INVENTED.
export const applicantOrg = {
  name: rt.organization.name,
  phone: rt.organization.phone ?? '',
  email: rt.organization.email ?? '',
  address: harpst,
};

// The signed-in PUBLIC user filling out the application — the submitter. Their
// profile contact details auto-fill the Principal Investigator (or the person in
// direct charge of field work) when they say that person is themselves.
//
// `resumeOnFile` is null here on purpose: this applicant has NOT saved a résumé
// to their profile yet, so once they upload one as the PI the flow offers to keep
// it for future applications. (Set it to a filename to model a returning user.)
// The department's sponsored-programs coordinator, who files on the PI's behalf
// (the permit's submitter).
export const applicant = {
  ...splitName(rt.submitter.name),
  title: 'Sponsored Programs Coordinator',
  email: rt.submitter.email ?? '',
  // Person phones are stored as E.164; forms render them formatted.
  phone: e164(rt.submitter.phone),
  address: harpst,
  resumeOnFile: null as string | null,
};

// Research-team answers. The submitter is NOT the PI here: the PI (and the person
// in direct charge of field work) is the permit's principal investigator, and not
// every participant is insured by the institution — so a signed liability waiver
// addendum (DPR65B) is attached. Filenames are DATA, not bytes.
const piName = splitName(rt.principalInvestigator.name);
export const researchTeam = {
  piIsSubmitter: false,
  pi: {
    ...piName,
    title: 'Associate Professor of Biological Sciences',
    email: rt.principalInvestigator.email ?? '',
    phone: e164(rt.principalInvestigator.phone),
    address: harpst,
  },
  piResume: fileOf(/Principal Investigator Resume/),
  saveResumeToProfile: false,
  fieldCharge: {
    sameAsPI: rt.fieldLead.name === rt.principalInvestigator.name,
    isSubmitter: false,
    ...splitName(rt.fieldLead.name),
    title: '',
    email: rt.fieldLead.email ?? '',
    phone: e164(rt.fieldLead.phone),
    address: harpst,
  },
  personnelInsured: rt.personnelInsured,
  waiverFile: fileOf(/DPR65B/),
};

/** One additional research participant added to the team roster. All fields are
 *  free-typed by the applicant (these people may not have system accounts). */
export interface Participant {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  comments: string;
}

// ── Project information (step 2) ─────────────────────────────────────────────
// Prefilled draft answers so the page renders as work-in-progress rather than a
// blank slate. `category` is an `expertiseOptions` VALUE (user.ts) — the project
// category dropdown reuses that taxonomy. Dates are ISO (YYYY-MM-DD) so they seed
// the cds-date-picker directly. All INVENTED, domain-credible, deterministic.
export const project = {
  category: 'marine-aquatic',
  title: permit.name,
  purpose: pj.purpose,
  benefits: pj.benefits,
  dates: {
    projectStart: pj.projectWindow.startISO,
    projectEnd: pj.projectWindow.endISO,
    permitStart: permit.activeWindow.startISO,
    permitEnd: permit.activeWindow.endISO,
    // The anticipated annual-report date. A NEW application clears this field on
    // load (apply.astro) — it's the gap `applicationIssues` reports there.
    annualReport: pj.annualReport.tentativeISO,
  },
  // Optional project-schedule attachment — none on this application.
  scheduleFile: '',
};

// Optional GIS study-area files (step 3). Empty by default — the summary shows
// the honest "None provided" state for this optional upload.
export const seedGisFiles: string[] = [];

/** One field investigation occurrence — a discrete window when the team will be
 *  on-site. Stored as display strings (m/d/Y) so the roster and the date picker's
 *  own output stay in the same format. */
export interface FieldOccurrence {
  start: string;
  end: string;
}

// The permit's field sessions (single-day sessions start and end the same day).
export const seedOccurrences: FieldOccurrence[] = pj.fieldSessions.map((f) => ({
  start: isoToMdy(f.start),
  end: isoToMdy(f.end ?? f.start),
}));

// The permit's additional participants (phones normalized to E.164; a missing
// title or phone stays empty — both are optional on the roster).
export const seedParticipants: Participant[] = rt.participants.map((p) => ({
  ...splitName(p.name),
  title: p.title ?? '',
  email: p.email ?? '',
  phone: e164(p.phone),
  comments: p.comments ?? '',
}));

// ── Data collection (step 4) ─────────────────────────────────────────────────

/** One type of specimen the applicant plans to collect. All fields are
 *  free-typed by the applicant (roster pattern, like Participants). */
export interface SpecimenType {
  species: string;
  quantity: string;
  size: string;
  condition: string;
}

// The permit's specimen list (the form's "size" is the permit's portion).
export const seedSpecimens: SpecimenType[] = pdc.specimens.map((sp) => ({
  species: sp.species,
  quantity: sp.quantity,
  size: sp.portion,
  condition: sp.condition,
}));

// Prefilled Data-collection answers so the Draft renders as work-in-progress
// rather than a blank slate (consistent with the Project information step). The
// `*InProposal` flags model the "Answered in study proposal" shortcut, which
// disables the matching narrative field. INVENTED, deterministic.
const factOf = (rows: readonly MetaRow[], key: string) => rows.find((r) => r.key === key);
const coll = pdc.collection as readonly MetaRow[];
const lab = pdc.laboratory as readonly MetaRow[];
const official = (r?: MetaRow) => r?.contact;
export const dataCollection = {
  // Specimen collection — the rationale is answered in the study proposal.
  collectsSpecimens: pdc.involvesCollection,
  collectionRationaleInProposal: !!factOf(coll, 'Collection rationale')?.href,
  collectionRationale: '',
  curation: {
    facility: factOf(coll, 'Curation facility')?.value ?? '',
    official: official(factOf(coll, 'Curation — responsible official'))?.name ?? '',
    phone: official(factOf(coll, 'Curation — responsible official'))?.phone ?? '',
    email: official(factOf(coll, 'Curation — responsible official'))?.email ?? '',
  },

  // Laboratory work
  labWork: pdc.involvesLaboratory,
  laboratory: {
    facility: factOf(lab, 'Laboratory facility')?.value ?? '',
    official: official(factOf(lab, 'Laboratory — responsible official'))?.name ?? '',
    phone: official(factOf(lab, 'Laboratory — responsible official'))?.phone ?? '',
    email: official(factOf(lab, 'Laboratory — responsible official'))?.email ?? '',
    startDate: pj.projectWindow.startISO,
    endDate: pj.projectWindow.endISO,
  },

  // Additional information — procedures are in the proposal; the data location is typed.
  studyProceduresInProposal: !!factOf(lab, 'Study procedures')?.href,
  studyProcedures: '',
  dataLocationInProposal: false,
  dataLocation: factOf(lab, 'Location of data & data products')?.value ?? '',

  collectionDocs: [] as string[],
  procedureDocs: [] as string[],
};

// ── Additional documents (step 5) ────────────────────────────────────────────
// The supporting-materials page: two yes/no gates (soil disturbance, and
// additional permits — the latter satisfied by an upload OR a rationale), the
// study-supporting info (Budget + Literature cited as deferrable text fields, and
// an optional study-proposal upload), the two always-required signed agreement
// forms, and a final gate that requires an insurance addendum when the project
// goes "above and beyond simple use". Seeded so the Draft renders as
// work-in-progress. All INVENTED, domain-credible, deterministic.
const facts = pad.facts as readonly MetaRow[];
const yes = (key: string) => factOf(facts, key)?.value === 'Yes';
export const additionalDocs = {
  // Name on the standard condition agreement the PI signs.
  principalInvestigator: rt.principalInvestigator.name,

  soilDisturbance: yes('Involves soil disturbance'),
  soilDisturbanceDetails: factOf(facts, 'Involves soil disturbance')?.detail ?? '',

  additionalPermits: yes('Requires additional federal/state/local permits'),
  additionalPermitsDetails: pad.additionalPermitsDetails,

  // Budget and literature are both answered in the study proposal.
  budgetInProposal: !!factOf(facts, 'Budget')?.href,
  budget: '',
  literatureInProposal: !!factOf(facts, 'Literature cited')?.href,
  literature: '',

  beyondSimpleUse: yes('Activities beyond simple use (aircraft/drones, diving, trapping, etc.)'),

  // Attachment filenames — the permit's uploaded documents.
  soilDisturbanceMap: fileOf(/Study Area Supporting/),
  additionalPermitsDocs: [fileOf(/Additional Permit Supporting/)].filter(Boolean) as string[],
  studyProposalFile: fileOf(/Study Proposal/),
  conditionAgreementFile: fileOf(/Standard Conditions Agreement/),
  waiverIndemnityFile: fileOf(/Waiver and Indemnity/),
  // Diving goes beyond simple use; the signed liability waiver addendum covers it.
  insuranceAddendumFile: fileOf(/DPR65B/),
};

// ── Application completeness (prototype) ─────────────────────────────────────
// The permit can't advance to the review step until every required item is
// provided. For a NEW application (apply.astro with no query) this models a Draft
// still missing items: the annual-report date (cleared on load) and the two
// signed agreement uploads (the upload lists start empty). Revise / amend start
// from the complete, submitted answers, so they skip this gate. Attempting to
// continue to review lists the gaps in the "Application incomplete" modal, and each
// listed page shows an error banner naming exactly what to fix. `stepId` keys back
// to `applicationSteps`, so the page label comes from there. Deterministic; a real
// app would derive this from the live answers.
/** A missing requirement that maps to a single concrete cds-* input, so the field
 *  itself can carry Carbon's `invalid` state (red border + `invalid-text`) — not
 *  just the page banner. Requirements that are uploads, rosters, or "either/or"
 *  gates have no single field to flag, so they stay banner-only (no `fields` entry). */
export interface FieldIssue {
  /** DOM id of the cds-* field element to mark invalid (e.g. a cds-textarea). */
  fieldId: string;
  /** Message shown as that field's `invalid-text`. */
  message: string;
}

export interface StepIssues {
  /** Matches an `applicationSteps` id; the page label is looked up from there. */
  stepId: string;
  /** Requirements still missing on the page — listed in that page's error banner. */
  missing: string[];
  /** Field-level targets among the above — marked invalid on Save and continue.
   *  Omitted when a page's gaps are uploads/rosters with no single input to flag. */
  fields?: FieldIssue[];
}

export const applicationIssues: StepIssues[] = [
  {
    stepId: 'project-info',
    missing: ['Enter the anticipated final report completion date.'],
    fields: [{ fieldId: 'annual-report-date', message: 'Required to submit.' }],
  },
  {
    stepId: 'additional-docs',
    missing: [
      'Upload the signed standard condition agreement form.',
      'Upload the signed waiver and indemnity agreement form.',
    ],
  },
];
