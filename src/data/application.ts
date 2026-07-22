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
  phone: '(415) 555-0173',
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

// Seed roster — two collaborators already added, so the list renders populated
// (the applicant can add more or remove these). INVENTED.
export const seedParticipants: Participant[] = [
  {
    firstName: 'Miguel',
    lastName: 'Aranda',
    title: 'Field Technician',
    email: 'm.aranda@cascadiamarine.org',
    phone: '(415) 555-0188',
    comments: 'Certified scientific diver; leads intertidal transect surveys.',
  },
  {
    firstName: 'Priya',
    lastName: 'Deshmukh',
    title: 'Graduate Researcher',
    email: 'p.deshmukh@cascadiamarine.org',
    phone: '(415) 555-0191',
    comments: 'Handles specimen cataloging and sample chain-of-custody.',
  },
];
