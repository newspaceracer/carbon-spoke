// Mock data for the permit detail prototype — a CA State Parks Scientific
// Research & Collection Permit. The structure mirrors a real application, but all
// PERSONAL details (names, emails, phone numbers, addresses) are INVENTED — this
// repo is public and the house rules forbid copying/lightly-sanitizing real data.
// Public scientific facts (taxa, categories, site coordinates) are kept for
// domain credibility. Deterministic: same output every build.

export interface Badge {
  label: string;
  /** cds-tag `type` — Carbon tag color token. */
  type: string;
}

export interface MetaRow {
  key: string;
  value?: string;
  /** When set, the value renders as a link to this document (view/download). */
  href?: string;
  /** Optional visible link text; defaults to `value`. */
  linkLabel?: string;
  /** When set, the row renders as a contact tile (ContactCard), `key` as role. */
  contact?: Contact;
  /** How to render a `contact` row: a person (default) or a facility/place. */
  contactKind?: 'person' | 'facility';
  /** A yes/no fact: hidden when the answer is "No"; when "Yes" the tile simply
   *  states `key` — the affirmative is the message, with no redundant "Yes". */
  boolean?: boolean;
  /** Sub-values stacked within a single tile (e.g. Start over End dates). */
  entries?: { label: string; value: string }[];
}

export interface Contact {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  /** This person's CV/resume among the uploaded documents (raw href) — surfaced as a
   *  "View CV" action on their contact tile that opens it in the document viewer. */
  cvHref?: string;
}

/** An additional field-team member listed on the application. */
export interface Participant {
  name: string;
  title?: string;
  phone?: string;
  email?: string;
  comments?: string;
}

/** One lifecycle stage. `state` drives the Carbon progress-step visual. */
export interface HistoryStep {
  label: string;
  date?: string;
  /** Shown alongside the date once a decision is reached. */
  decision?: string;
  state: 'complete' | 'current' | 'incomplete';
}

/** A named group of lifecycle stages (Presubmittal, In review, …). */
export interface HistoryPhase {
  phase: string;
  steps: HistoryStep[];
}

const invented = 'Invented for this prototype — not real contact information.';

// The uploaded Study Proposal — several facts are "answered" there, so they link
// to it. Single source of truth shared by those facts and the file list below.
const proposalHref = '/docs/coralline-diversity-proposal.pdf';

// The PI also serves as the responsible official for both curation and lab work.
const reyesContact: Contact = { name: 'Dr. Alena Reyes', phone: '(707) 555-0142', email: 'areyes@humboldt.edu' };

// Field-investigation sessions as structured ISO dates — the single source of truth
// (calendar events read these directly; the display list below is DERIVED from them,
// so there's no fragile re-parsing of "Aug 13 – 15, 2026" strings).
export interface FieldSession { start: string; end?: string }
const fieldSessions: FieldSession[] = [
  { start: '2026-07-30' },
  { start: '2026-08-13', end: '2026-08-15' },
  { start: '2026-09-29' },
  { start: '2026-10-27' },
  { start: '2026-11-25' },
  { start: '2026-12-09' },
  { start: '2027-01-22' },
  { start: '2027-02-19' },
  { start: '2027-03-19' },
  { start: '2027-04-10' },
  { start: '2027-05-08' },
  { start: '2027-06-07' },
];
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const partsOf = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return { y, m, d }; };
function sessionLabel(s: FieldSession): string {
  const a = partsOf(s.start);
  if (!s.end || s.end === s.start) return `${MONTH_ABBR[a.m - 1]} ${a.d}, ${a.y}`;
  const b = partsOf(s.end);
  return a.y === b.y && a.m === b.m
    ? `${MONTH_ABBR[a.m - 1]} ${a.d} – ${b.d}, ${a.y}`
    : `${MONTH_ABBR[a.m - 1]} ${a.d}, ${a.y} – ${MONTH_ABBR[b.m - 1]} ${b.d}, ${b.y}`;
}

export const permit = {
  id: '26-635-017',
  name: 'Diversity of coralline algae in northern California and their reproductive systems',
  // State, not a category — rendered as cds-icon-indicator (icon + label).
  status: { label: 'Waiting for review', kind: 'not-started' },
  category: 'Marine Aquatic Resources',
  // Dates the applicant REQUESTED. Display strings drive the at-a-glance stat;
  // the ISO pair prefills the approval modal's confirmation date-range picker.
  activeWindow: { start: 'Jul 22, 2026', end: 'Jul 22, 2027', startISO: '2026-07-22', endISO: '2027-07-22' },

  // Header classification badges — reflect THIS application.
  infoTags: [
    { label: 'Multi-district', type: 'teal' },
    { label: 'Marine Aquatic Resources', type: 'purple' },
  ] as Badge[],
  // Compliance flags (rendered with a warning icon). Only the ones that apply:
  // soil disturbance = No and beyond-simple-use (drones/diving) = No here.
  flagTags: [
    { label: 'Additional permit required', type: 'high-contrast' },
  ] as Badge[],

  // ── Overview tab ─────────────────────────────────────────────────────────
  overview: {
    // Internal review team assigned to analyze the application (invented).
    // `reviewStatus` tracks each reviewer through their own workflow:
    //   'not-started' — assigned, hasn't opened their review yet
    //   'pending'     — started their review (clicked Start review), in progress
    //   'complete'    — finished (a Supporting analyst clicked Complete review; the
    //                   Responsible analyst only reads Complete once the permit is Out
    //                   for signature — derived from permit status, not stored here).
    // `when` is the date that state was reached (added / started / completed).
    // `highlight` marks the Responsible analyst (the current reviewer, you). `id` keys each
    // row to the shared user directory (src/data/user.ts) so the "add reviewer"
    // control can offer only users not already on the team.
    analysisTeam: [
      { id: 'okafor', role: 'Responsible analyst', name: 'J. Okafor', detail: 'Natural Resources Division', reviewStatus: 'pending', when: 'Jun 28, 2026', highlight: true },
      { id: 'santos', role: 'District reviewer', name: 'M. Santos', detail: 'North Coast Redwoods District', reviewStatus: 'not-started', when: 'Jun 28, 2026' },
      { id: 'cheng', role: 'Scientific advisor', name: 'Dr. L. Cheng', detail: 'Marine ecology', reviewStatus: 'pending', when: 'Jul 6, 2026' },
      { id: 'delgado', role: 'Permit coordinator', name: 'R. Delgado', detail: 'Statewide Permitting Office', reviewStatus: 'complete', when: 'Jul 5, 2026' },
      { id: 'reyna', role: 'District reviewer', name: 'S. Reyna', detail: 'Mendocino District', reviewStatus: 'pending', when: 'Jun 30, 2026' },
    ],

    // Reviewer-applied handling tags. `tagOptions` is the curated vocabulary an
    // analyst can toggle on the permit (triage/coordination labels); `tags` seeds
    // the ones already applied. Distinct from the header's classification badges:
    // those describe WHAT the permit is; these are how the team is HANDLING it.
    tagOptions: [
      'Priority',
      'Needs site visit',
      'Coastal zone',
      'Awaiting external permit',
      'Sensitive species',
      'Tribal consultation',
      'Expedited',
      'Multi-year',
    ],
    tags: ['Priority', 'Awaiting external permit'],

    // Internal review comments (invented).
    comments: [
      { author: 'M. Santos', time: 'Jul 12, 2026', text: 'Study area is within Del Norte Coast Redwoods SP intertidal — confirm collection stays outside the marine reserve boundary at False Klamath Cove.' },
      { author: 'J. Okafor', time: 'Jul 10, 2026', text: 'Additional-permit flag set: applicant references a separate collecting authorization (GM-2333...). Awaiting confirmation it is in hand before approval.' },
      { author: 'Dr. L. Cheng', time: 'Jul 9, 2026', text: 'Species list and quantities are proportionate for a diversity survey; the 50-frond Corallina vancouveriensis allotment supports the reproductive case study.' },
    ],

    // Application lifecycle, grouped into phases. Each step's `state` drives the
    // Carbon progress-step visual (complete / current / incomplete). This permit
    // is mid-review, so the current step sits inside "In review"; everything from
    // "Decision reached" onward is still pending.
    history: [
      {
        phase: 'Presubmittal',
        steps: [
          { label: 'Application started', date: 'Jul 5, 2026', state: 'complete' },
          { label: 'Application signed', date: 'Jul 8, 2026', state: 'complete' },
          { label: 'Application submitted', date: 'Jul 9, 2026', state: 'complete' },
        ],
      },
      {
        phase: 'In review',
        steps: [
          { label: 'Responsible agent review completed', date: 'Jul 12, 2026', state: 'complete' },
          { label: 'Supporting agents review completed', state: 'current' },
          { label: 'Decision reached', state: 'incomplete' },
        ],
      },
      {
        phase: 'Signature',
        steps: [
          { label: 'Permit active in effect', state: 'incomplete' },
        ],
      },
      {
        phase: 'Active permit',
        steps: [
          { label: 'Permit active', state: 'incomplete' },
          { label: 'Permit expired', state: 'incomplete' },
          { label: 'Annual report submitted', state: 'incomplete' },
          { label: 'Renewal processed', state: 'incomplete' },
        ],
      },
    ] as HistoryPhase[],
  },

  // ── Project information tab ──────────────────────────────────────────────
  researchTeam: {
    organization: {
      name: 'Cal Poly Humboldt — Dept. of Biological Sciences',
      phone: '(707) 555-0142',
      email: 'marine-lab@humboldt.edu',
      address: '1 Harpst St, Arcata, CA 95521',
    } as Contact,
    // Who filed the application in the system — the department's sponsored-programs
    // coordinator, submitting on the PI's behalf (the common academic routing).
    // Distinct from the PI so the analyst knows who to reach on submission questions.
    submitter: {
      // The applicant persona (see data/application.ts) — so the Researcher identity
      // owns this permit as its submitter and Story 11's scoping has a positive path.
      name: 'Renata Halvorsen',
      phone: '(415) 555-0173',
      email: 'r.halvorsen@cascadiamarine.org',
      address: '18 Nautilus Court, Mill Valley, CA 94941',
      cvHref: '/docs/renata-halvorsen-cv.pdf',
    } as Contact,
    principalInvestigator: {
      name: 'Dr. Alena Reyes',
      phone: '(707) 555-0142',
      email: 'areyes@humboldt.edu',
      address: '1 Harpst St, Arcata, CA 95521',
      cvHref: '/docs/cv-jun-2025.pdf',
    } as Contact,
    fieldLead: {
      name: 'Dr. Alena Reyes',
      phone: '(707) 555-0142',
      email: 'areyes@humboldt.edu',
      address: '1 Harpst St, Arcata, CA 95521',
      cvHref: '/docs/cv-jun-2025.pdf',
    } as Contact,
    participants: [
      { name: 'Priya Nadar', title: 'Graduate researcher', phone: '(707) 555-0173', email: 'pnadar@humboldt.edu', comments: 'Subtidal survey lead; AAUS scientific diver.' },
      { name: 'Helena Marsh', title: 'Laboratory technician', phone: '(510) 555-0128', email: 'hmarsh@humboldt.edu', comments: '' },
      { name: 'Marcus Webb', title: 'Undergraduate field assistant', phone: '(916) 555-0184', email: 'mwebb@humboldt.edu', comments: 'Field days only.' },
      { name: 'Fiona Blake', title: 'Herbarium curator', phone: '', email: 'fblake@humboldt.edu', comments: '' },
    ] as Participant[],
    // Whether every field-team member is employed or insured by the institution
    // conducting the research (drives the liability-waiver requirement upstream).
    personnelInsured: true,
  },

  projectInfo: {
    details: [
      { key: 'Project category', value: 'Marine Aquatic Resources (e.g. tidepools, coastal wetlands)' },
      { key: 'Project dates', entries: [
        { label: 'Start', value: '07/22/2026' },
        { label: 'End', value: '07/22/2027' },
      ] },
      { key: 'Permit requested dates', entries: [
        { label: 'Start', value: '07/22/2026' },
        { label: 'End', value: '07/22/2027' },
      ] },
      { key: 'Annual report', entries: [
        { label: 'Tentative completion', value: '08/31/2027' },
        { label: 'Required by', value: '09/30/2027' },
      ] },
    ] as MetaRow[],
    purpose:
      'Coralline red algae are calcifying macroalgae found in every ocean basin and ' +
      'contribute substantially to carbon cycling, reef stability, and settlement ' +
      'substrate and refuge for marine invertebrates — yet their cryptic morphology has ' +
      'left their diversity in northern California poorly documented. This project will ' +
      '(1) catalog intertidal coralline diversity in northern California using molecular ' +
      'identification, and (2) examine the reproductive system of the common coralline ' +
      'Corallina vancouveriensis as a case study. Specimens will be collected and ' +
      'genetically identified from two intertidal sites, updating decades-old surveys ' +
      'that lacked genetic confirmation.',
    benefits:
      'The study raises awareness of an overlooked but ecologically important group of ' +
      'seaweeds, supporting shared stewardship of healthy coastal ecosystems within the ' +
      'State Park System.',
    // Structured ISO sessions (calendar source) + the display list derived from them.
    fieldSessions,
    fieldOccurrences: fieldSessions.map(sessionLabel),
    // Annual-report milestones — two distinct dates: the author's TARGET completion
    // and the hard SUBMISSION deadline that follows it (also the special condition).
    // ISO + display pairs drive the schedule calendar's report markers.
    annualReport: {
      tentativeISO: '2027-08-31', tentativeLabel: 'Aug 31, 2027',
      requiredISO: '2027-09-30', requiredLabel: 'Sep 30, 2027',
    },
    // Fixed "today" for the schedule calendar's current-date marker — anchored (not
    // new Date()) so the mock stays deterministic and the marker lands in-window.
    demoTodayISO: '2026-08-04',
  },

  // ── Study areas tab ──────────────────────────────────────────────────────
  // Collection is authorized by DISTRICT. Each district groups the parks where
  // work may occur, the district-specific collection conditions, and the DPR
  // research coordinator who administers the permit in that district.
  studyAreas: {
    districts: [
      {
        name: 'North Coast Redwoods District',
        coordinator: {
          name: 'M. Santos',
          phone: '(707) 555-0119',
          email: 'm.santos@parks.ca.gov',
        } as Contact,
        parks: [
          'Del Norte Coast Redwoods SP',
          'Prairie Creek Redwoods SP',
          'Tolowa Dunes SP',
        ],
        conditions: [
          'No collection within the False Klamath Cove marine reserve boundary.',
          'Intertidal access must be coordinated with the district ranger at least 48 hours in advance.',
          'Vehicles restricted to designated day-use lots; no driving on the beach or dunes.',
        ],
      },
      {
        name: 'Mendocino District',
        coordinator: {
          name: 'T. Alvarado',
          phone: '(707) 555-0164',
          email: 't.alvarado@parks.ca.gov',
        } as Contact,
        parks: [
          'MacKerricher SP',
          'Van Damme SP',
        ],
        conditions: [
          'Collection limited to rocky intertidal below the mean high-water line.',
          'No disturbance of harbor-seal haul-out areas at MacKerricher.',
        ],
      },
    ],
    sites: [
      { name: 'Baker Beach', coords: '41.049, -124.128', note: 'Highly accessible; intertidal impacted by purple sea urchin and heavy visitor use.' },
      { name: 'False Klamath Cove', coords: '41.603, -124.102', note: 'Comparable diversity expected with less human impact (~15 mi from nearest town).' },
    ],
  },

  // ── Special conditions tab ───────────────────────────────────────────────
  // No applicant-supplied data — standard CA State Parks scientific-collection
  // conditions (invented, generic).
  specialConditions: [
    'The signed permit must be carried by field personnel during all activities and presented on request.',
    'Collection is limited to the approved study areas and the taxa and quantities listed under Data Collection.',
    'No collection within posted marine reserve or special-closure boundaries.',
    'All collected specimens are State property and must be curated at the approved facility.',
    'An annual report is due by Sep 30, 2027.',
  ],

  // ── Data collection tab ──────────────────────────────────────────────────
  dataCollection: {
    // Gate flags: a "No" hides the whole subsection rather than rendering a
    // redundant "Involves …: No" tile — the section's presence is the "Yes".
    involvesCollection: true,
    involvesLaboratory: true,
    // Collection & curation — where and how specimens are taken and held.
    collection: [
      { key: 'Collection rationale', value: 'Answered in study proposal', href: proposalHref },
      { key: 'Curation facility', value: 'HSU Cryptogamic Herbarium', contactKind: 'facility',
        contact: { name: 'HSU Cryptogamic Herbarium', address: '1 Harpst St, Arcata, CA 95521' } },
      { key: 'Curation — responsible official', value: 'Dr. Alena Reyes · (707) 555-0142 · areyes@humboldt.edu', contact: reyesContact },
    ] as MetaRow[],
    // Laboratory & analysis — where and how specimens are studied, and where the
    // resulting data lives.
    laboratory: [
      { key: 'Laboratory facility', value: 'Cal Poly Humboldt, AMH 171', contactKind: 'facility',
        contact: { name: 'Cal Poly Humboldt, AMH 171', address: '1 Harpst St, Arcata, CA 95521' } },
      { key: 'Laboratory — responsible official', value: 'Dr. Alena Reyes · (707) 555-0142 · areyes@humboldt.edu', contact: reyesContact },
      { key: 'Lab study window', value: 'Jul 22, 2026 – Jul 22, 2027' },
      { key: 'Study procedures', value: 'Answered in study proposal', href: proposalHref },
      { key: 'Location of data & data products', value: 'Answered in study proposal', href: proposalHref },
    ] as MetaRow[],
    specimens: [
      { species: 'Bossiella chiloensis', quantity: '5', portion: 'single frond', condition: 'vegetative' },
      { species: 'Bossiella dichotoma', quantity: '5', portion: 'single frond', condition: 'vegetative' },
      { species: 'Bossiella orbigniana', quantity: '5', portion: 'single frond', condition: 'vegetative' },
      { species: 'Calliarthron tuberculosum', quantity: '5', portion: 'single frond', condition: 'vegetative' },
      { species: 'Corallina chilensis', quantity: '5', portion: 'single frond', condition: 'vegetative' },
      { species: 'Corallina vancouveriensis', quantity: '50', portion: '25 single frond, 25 entire individual', condition: 'reproductive and vegetative' },
      { species: 'Lithophyllum dispar', quantity: '5', portion: 'single frond', condition: 'vegetative' },
      { species: 'Lithophyllum impressum', quantity: '5', portion: '1 cm²', condition: 'vegetative' },
      { species: 'Lithothamnion phymatodium', quantity: '5', portion: '1 cm²', condition: 'vegetative' },
      { species: 'Melobesia mediocris', quantity: '5', portion: 'single frond', condition: 'vegetative' },
      { species: 'Mesophyllum conchatum', quantity: '5', portion: '1 cm²', condition: 'vegetative' },
      { species: 'Neopolyporolithon reclinatum', quantity: '5', portion: 'single crust', condition: 'vegetative' },
    ],
  },

  // ── Additional documentation tab ─────────────────────────────────────────
  additionalDocs: {
    // Free-text detail behind the "requires additional permits = Yes" gate — names
    // the underlying agency permit, from which associated-permit scope is derived
    // (see scope.ts). Coastal intertidal collection needs a CDFW SCP (still pending
    // — hence the permit's "Awaiting external permit" tag).
    additionalPermitsDetails:
      'California Department of Fish & Wildlife Scientific Collecting Permit (SCP) — application ' +
      'submitted, currently pending. Coastal collection of marine algae requires the CDFW SCP; the ' +
      'renewed permit will be provided to nrd.research@parks.ca.gov once issued.',
    facts: [
      { key: 'Involves soil disturbance', value: 'No', boolean: true },
      { key: 'Requires additional federal/state/local permits', value: 'Yes', boolean: true },
      { key: 'Budget', value: 'Answered in study proposal', href: proposalHref },
      { key: 'Literature cited', value: 'Answered in study proposal', href: proposalHref },
      { key: 'Activities beyond simple use (aircraft/drones, diving, trapping, etc.)', value: 'No', boolean: true },
    ] as MetaRow[],
    files: [
      { name: 'Coralline Diversity & Reproductive Systems Proposal.pdf', type: 'Study Proposal', size: '313 KB', pages: 4, by: 'A. Reyes', date: 'Jul 8, 2026', href: proposalHref },
      { name: 'CV_Jun2025.pdf', type: 'Principal Investigator Resume', size: '118.05 KB', pages: 2, by: 'A. Reyes', date: 'Jun 3, 2025', href: '/docs/cv-jun-2025.pdf' },
      { name: 'CV_Halvorsen.pdf', type: 'Submitter Resume', size: '117.84 KB', pages: 2, by: 'R. Halvorsen', date: 'Jun 12, 2025', href: '/docs/renata-halvorsen-cv.pdf' },
      { name: 'False Klamath Cove Study Area Map.pdf', type: 'Study Area Supporting Documentation', size: '132.45 KB', pages: 1, by: 'A. Reyes', date: 'Jul 9, 2026', href: '/docs/false-klamath-cove-study-area-map.pdf' },
      { name: 'Additional-Permit-Details.pdf', type: 'Additional Permit Supporting Documentation', size: '103.65 KB', pages: 1, by: 'A. Reyes', date: 'Jul 9, 2026', href: '/docs/additional-permit-details.pdf' },
      { name: 'Liability-Waiver-Addendum-DPR65B.pdf', type: 'Optional Liability Waiver Addendum (DPR65B)', size: '90.99 KB', pages: 1, by: 'A. Reyes', date: 'Jul 14, 2026', href: '/docs/liability-waiver-addendum-dpr65b.pdf' },
      { name: 'standard_conditions_agreement-signed.pdf', type: 'Standard Conditions Agreement Form', size: '100.59 KB', pages: 1, by: 'A. Reyes', date: 'Jul 9, 2026', href: '/docs/standard-conditions-agreement-signed.pdf' },
      { name: 'waiver_and_indemnity_agreement-signed.pdf', type: 'Waiver and Indemnity Agreement Form', size: '94.66 KB', pages: 1, by: 'A. Reyes', date: 'Jul 9, 2026', href: '/docs/waiver-and-indemnity-agreement-signed.pdf' },
    ],
  },

  _dataNote: invented,
} as const;
