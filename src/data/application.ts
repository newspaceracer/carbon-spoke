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
export type { Address };

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
  name: 'Cascadia Marine Research Institute',
  phone: '(415) 555-0164',
  email: 'permits@cascadiamarine.org',
  address: {
    country: 'US',
    line1: '2200 Bridgeway Boulevard',
    line2: 'Building C',
    city: 'Sausalito',
    region: 'CA',
    postalCode: '94965',
  } as Address,
};

// The signed-in PUBLIC user filling out the application — the submitter. Their
// profile contact details auto-fill the Principal Investigator (or the person in
// direct charge of field work) when they say that person is themselves.
//
// `resumeOnFile` is null here on purpose: this applicant has NOT saved a résumé
// to their profile yet, so once they upload one as the PI the flow offers to keep
// it for future applications. (Set it to a filename to model a returning user.)
export const applicant = {
  firstName: 'Renata',
  lastName: 'Halvorsen',
  title: 'Senior Research Scientist',
  email: 'r.halvorsen@cascadiamarine.org',
  // Person phones are stored as E.164; forms render them formatted.
  phone: '+14155550173',
  address: {
    country: 'US',
    line1: '18 Nautilus Court',
    line2: '',
    city: 'Mill Valley',
    region: 'CA',
    postalCode: '94941',
  } as Address,
  resumeOnFile: null as string | null,
};

// Research-team answers the step collects INTERACTIVELY and has no other seed
// for — captured here so the Application summary can review them. The submitter
// is the principal investigator; the person in direct charge of field work is
// the certified scientific diver who leads the intertidal transects (a distinct
// team member); and all personnel are insured through the institution (so no
// separate waiver addendum is needed on this step — the diving risk is covered
// by the insurance addendum on the Additional documents step). A filename is
// DATA, not bytes, so it seeds cleanly even though the static prototype can't
// persist the uploaded file itself. INVENTED, consistent with the persona.
export const researchTeam = {
  piIsSubmitter: true,
  piResume: 'Halvorsen-CV-2026.pdf',
  saveResumeToProfile: true,
  fieldCharge: {
    sameAsPI: false,
    isSubmitter: false,
    firstName: 'Miguel',
    lastName: 'Aranda',
    title: 'Field Technician',
    email: 'm.aranda@cascadiamarine.org',
    phone: '+14155550188',
    address: {
      country: 'US',
      line1: '2200 Bridgeway Boulevard',
      line2: 'Building C',
      city: 'Sausalito',
      region: 'CA',
      postalCode: '94965',
    } as Address,
  },
  personnelInsured: true,
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
  title: 'Intertidal Community Response to Marine Heatwaves along the North Coast',
  purpose:
    'This study examines how rocky intertidal invertebrate communities in North Coast ' +
    'Redwoods parks are reshaped by successive marine heatwaves. Building on long-term ' +
    'MARINe monitoring, we test whether thermal stress shifts competitive dominance from ' +
    'California mussels (Mytilus californianus) toward more heat-tolerant algal turfs. ' +
    'Objectives: (1) quantify post-heatwave recovery trajectories across three tidal ' +
    'heights; (2) test the hypothesis that grazer density mediates recovery rate; ' +
    '(3) establish a repeatable photo-quadrat baseline for future monitoring.',
  benefits:
    "California's rocky shores are among the state's most-visited and most climate-exposed " +
    'natural features, and this work happens where park stewards can act on it. Findings ' +
    'give the district an early-warning framework for detecting climate-driven regime ' +
    'shifts in accessible tidepool zones, informing visitor-use management and ' +
    'interpretive programming. The photo-quadrat baseline and data will be shared with the ' +
    'Natural Resources Division to support long-term coastal monitoring across the district.',
  dates: {
    projectStart: '2026-09-01',
    projectEnd: '2028-08-31',
    permitStart: '2026-09-15',
    permitEnd: '2027-09-14',
    annualReport: '2027-12-15',
  },
  // Optional project-schedule attachment (a filename is DATA, not bytes). Provided
  // here to show the "optional-but-attached" state on the summary.
  scheduleFile: 'Field-schedule-2026-2028.pdf',
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

// Seed occurrences — two planned field windows already on the schedule. INVENTED.
export const seedOccurrences: FieldOccurrence[] = [
  { start: '9/16/2026', end: '9/27/2026' },
  { start: '1/12/2027', end: '1/23/2027' },
];

// Seed roster — two collaborators already added, so the list renders populated
// (the applicant can add more or remove these). INVENTED.
export const seedParticipants: Participant[] = [
  {
    firstName: 'Miguel',
    lastName: 'Aranda',
    title: 'Field Technician',
    email: 'm.aranda@cascadiamarine.org',
    phone: '+14155550188',
    comments: 'Certified scientific diver; leads intertidal transect surveys.',
  },
  {
    firstName: 'Priya',
    lastName: 'Deshmukh',
    title: 'Graduate Researcher',
    email: 'p.deshmukh@cascadiamarine.org',
    phone: '+14155550191',
    comments: 'Handles specimen cataloging and sample chain-of-custody.',
  },
];

// ── Data collection (step 4) ─────────────────────────────────────────────────

/** One type of specimen the applicant plans to collect. All fields are
 *  free-typed by the applicant (roster pattern, like Participants). */
export interface SpecimenType {
  species: string;
  quantity: string;
  size: string;
  condition: string;
}

// Seed specimen list — the material the intertidal marine-heatwave study collects.
// INVENTED but domain-credible.
export const seedSpecimens: SpecimenType[] = [
  {
    species: 'California mussel (Mytilus californianus)',
    quantity: '120',
    size: '4–8 cm shell length',
    condition: 'Live, whole; retained',
  },
  {
    species: 'Turf algae assemblage (mixed Rhodophyta)',
    quantity: '60',
    size: '10 × 10 cm quadrat scrapes',
    condition: 'Preserved in ethanol',
  },
  {
    species: 'Ochre sea star (Pisaster ochraceus)',
    quantity: '24',
    size: '8–15 cm radius',
    condition: 'Live; measured and released',
  },
];

// Prefilled Data-collection answers so the Draft renders as work-in-progress
// rather than a blank slate (consistent with the Project information step). The
// `*InProposal` flags model the "Answered in study proposal" shortcut, which
// disables the matching narrative field. INVENTED, deterministic.
export const dataCollection = {
  // Specimen collection
  collectsSpecimens: true,
  collectionRationaleInProposal: false,
  collectionRationale:
    'Collection is necessary to measure physiological thermal tolerance and body condition, ' +
    'which cannot be assessed non-destructively in the field. Mussel and algal samples are ' +
    'analyzed for tissue condition indices and heat-shock protein (HSP70) expression; sea stars ' +
    'are measured and released. Retained specimens are accessioned into the CMRI Invertebrate ' +
    'Collection and made available for future study. Sample sizes follow a power analysis ' +
    '(α = 0.05, power = 0.80) sized to detect a 15% shift in condition index across tidal heights.',
  curation: {
    facility: 'Cascadia Marine Research Institute — Invertebrate Collection',
    official: 'Dr. Lena Okafor',
    phone: '(415) 555-0180',
    email: 'collections@cascadiamarine.org',
  },

  // Laboratory work
  labWork: true,
  laboratory: {
    facility: 'CMRI Coastal Ecophysiology Laboratory',
    official: 'Dr. Theo Nakamura',
    phone: '(415) 555-0185',
    email: 't.nakamura@cascadiamarine.org',
    startDate: '2026-10-01',
    endDate: '2028-06-30',
  },

  // Additional information
  studyProceduresInProposal: false,
  studyProcedures:
    'The study uses a stratified design across three tidal heights (low, mid, high) at each of ' +
    'four sites, with fixed photo-quadrats and paired grazer-exclusion and control plots. Field ' +
    'methods follow MARINe rocky-intertidal protocols; laboratory analyses include condition ' +
    'indices, gonad staging, and HSP70 assays. Five replicate quadrats per stratum per site are ' +
    'analyzed with linear mixed-effects models (site as a random effect). Power analyses ' +
    '(power = 0.80, α = 0.05) justify the replicate count for the hypothesized effect sizes.',
  // Left to the study proposal here, to demonstrate the disabled-field shortcut.
  dataLocationInProposal: true,
  dataLocation: '',

  // Optional supporting-document attachments (filenames are DATA, not bytes). One
  // is attached under the collection rationale; procedures rely on the proposal.
  collectionDocs: ['Collection-power-analysis.pdf'] as string[],
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
export const additionalDocs = {
  // Name shown on the standard condition agreement the PI must sign. Matches the
  // applicant persona (the submitter is the PI for this study).
  principalInvestigator: `${applicant.firstName} ${applicant.lastName}`,

  // Soil disturbance — fixed grazer-exclusion plots are bolted into intertidal
  // rock, so this study DOES disturb the ground.
  soilDisturbance: true,
  soilDisturbanceDetails:
    'Fixed grazer-exclusion and control plots are secured with stainless-steel eyebolts set into ' +
    'the rock bench at each of four sites (16 plots total, ~10 mm holes). Disturbance is limited to ' +
    'bolt placement; no soil cores are taken. On permit completion, bolts are removed and holes ' +
    'filled with marine epoxy to restore the surface. The 16-plot count follows a power analysis ' +
    '(α = 0.05, power = 0.80) sized to detect a 20% treatment effect on turf cover.',

  // Additional permits — coastal collection needs a CDFW SCP; diving needs no
  // separate state permit but is disclosed under "beyond simple use" below.
  // The Yes branch is satisfied by EITHER an upload OR this rationale (at least
  // one). Here the SCP is still pending, so the applicant explains rather than
  // uploads — which is exactly the "don't have all permits yet" case.
  additionalPermits: true,
  additionalPermitsDetails:
    'California Department of Fish & Wildlife Scientific Collecting Permit (SCP) — application ' +
    'submitted, pending. California Coastal Commission — coordinated through the district; no ' +
    'separate coastal development permit required for non-structural monitoring.',

  // Study supporting information — Budget and Literature cited are narrative text
  // fields with the "Answered in study proposal" defer shortcut (same pattern as
  // the Data collection narratives). Budget is typed here; Literature is deferred
  // to the proposal, to demonstrate both states. The proposal itself is uploaded.
  budgetInProposal: false,
  budget:
    'Funded by NOAA Climate Program Office (award pending) and CMRI internal reserves. Major ' +
    'categories: field salaries and dive support ($48,000), laboratory assays incl. HSP70 and ' +
    'condition indices ($22,000), consumables and permits ($6,500), and data management ($8,000). ' +
    'Total requested: $84,500 over the two-year study period.',
  literatureInProposal: true,
  literature: '',

  // Beyond simple use — the team includes a certified scientific diver, which is
  // explicitly a "beyond simple use" activity and triggers the insurance addendum.
  beyondSimpleUse: true,

  // Attachment filenames (DATA, not bytes) for the documents the complete
  // application carries. The additional-permits rationale is used in place of an
  // upload (the SCP is still pending), so that upload list stays empty. The two
  // signed agreement forms and the insurance addendum are the required, signed
  // uploads a submittable application must include.
  soilDisturbanceMap: 'Soil-disturbance-areas-topo.pdf',
  additionalPermitsDocs: [] as string[],
  studyProposalFile: 'CMRI-intertidal-study-proposal.pdf',
  conditionAgreementFile: 'Standard-condition-agreement-signed.pdf',
  waiverIndemnityFile: 'Waiver-and-indemnity-agreement-signed.pdf',
  insuranceAddendumFile: 'Insurance-addendum-signed.pdf',
};

// ── Application completeness (prototype) ─────────────────────────────────────
// The permit can't advance to the review step until every required item is
// provided. This models a Draft still missing items on four pages — attempting to
// continue to review lists them in the "Application incomplete" modal, and each
// listed page shows an error banner naming exactly what to fix. `stepId` keys back
// to `applicationSteps`, so the page label comes from there. Study Areas is absent
// on purpose: it's complete. Deterministic; a real app would derive this from the
// live answers. INVENTED but tied to real seeded gaps (e.g. no PI résumé on file).
export interface StepIssues {
  /** Matches an `applicationSteps` id; the page label is looked up from there. */
  stepId: string;
  /** Requirements still missing on the page — listed in that page's error banner. */
  missing: string[];
}

export const applicationIssues: StepIssues[] = [
  {
    stepId: 'research-team',
    missing: [
      'Upload the Principal Investigator’s résumé.',
      'Add a phone number for every additional research participant.',
    ],
  },
  {
    stepId: 'project-info',
    missing: ['Enter the anticipated annual report due date.'],
  },
  {
    stepId: 'data-collection',
    missing: [
      'Provide a collection rationale, or mark it as answered in the study proposal.',
    ],
  },
  {
    stepId: 'additional-docs',
    missing: [
      'Provide additional-permits documentation, or a rationale in its place.',
      'Upload the signed waiver and indemnity agreement form.',
    ],
  },
];
