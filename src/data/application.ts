// Mock data for the PUBLIC applicant flow — a scientist creating a Scientific
// Research & Collection Permit application. This is a DIFFERENT persona from the
// internal reviewer in user.ts: here the signed-in account is the member of the
// public who submits the permit, and the application starts life as a Draft.
//
// Every personal / organizational detail is INVENTED (house no-real-data rule)
// and deterministic — same values every build. Address `state` values match the
// USPS codes in `states` (re-exported from user.ts) so the shared dropdown works.

export interface Address {
  street: string;
  /** Suite / floor / unit — optional. */
  unit: string;
  city: string;
  /** Two-letter USPS state code, matched against `states` (user.ts). */
  state: string;
  zip: string;
}

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
    street: '2200 Bridgeway Boulevard',
    unit: 'Building C',
    city: 'Sausalito',
    state: 'CA',
    zip: '94965',
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
    street: '18 Nautilus Court',
    unit: '',
    city: 'Mill Valley',
    state: 'CA',
    zip: '94941',
  } as Address,
  resumeOnFile: null as string | null,
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
};

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
};
