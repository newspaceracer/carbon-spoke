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

export const permit = {
  id: '26-635-017',
  name: 'Diversity of coralline algae in northern California and their reproductive systems',
  // State, not a category — rendered as cds-icon-indicator (icon + label).
  status: { label: 'Under review', kind: 'in-progress' },
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
    // Internal reviewers. `status` is a sign-off timestamp once reviewed, else
    // "Pending review". `highlight` marks the current reviewer (you). `addedAt`
    // is when the reviewer joined the permit; `lastEditedAt` is their most recent
    // activity while still pending (absent = no activity since being added).
    // `id` keys each row to the shared user directory (src/data/user.ts) so the
    // "add reviewer" control can offer only users not already on the team.
    analysisTeam: [
      { id: 'okafor', role: 'Lead analyst', name: 'J. Okafor', detail: 'Natural Resources Division', status: 'Jul 2, 2026 11:59 AM', addedAt: 'Jun 28, 2026', highlight: true },
      { id: 'santos', role: 'District reviewer', name: 'M. Santos', detail: 'North Coast Redwoods District', status: 'Pending review', addedAt: 'Jun 28, 2026', lastEditedAt: 'Jul 6, 2026 2:14 PM' },
      { id: 'cheng', role: 'Scientific advisor', name: 'Dr. L. Cheng', detail: 'Marine ecology', status: 'Pending review', addedAt: 'Jul 1, 2026' },
      { id: 'delgado', role: 'Permit coordinator', name: 'R. Delgado', detail: 'Statewide Permitting Office', status: 'Jul 5, 2026 8:45 AM', addedAt: 'Jun 29, 2026' },
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
      name: 'Daniel Okonkwo',
      phone: '(707) 555-0198',
      email: 'sponsored-programs@humboldt.edu',
      address: '1 Harpst St, Arcata, CA 95521',
    } as Contact,
    principalInvestigator: {
      name: 'Dr. Alena Reyes',
      phone: '(707) 555-0142',
      email: 'areyes@humboldt.edu',
      address: '1 Harpst St, Arcata, CA 95521',
    } as Contact,
    fieldLead: {
      name: 'Dr. Alena Reyes',
      phone: '(707) 555-0142',
      email: 'areyes@humboldt.edu',
      address: '1 Harpst St, Arcata, CA 95521',
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
        { label: 'Start', value: 'Jul 22, 2026' },
        { label: 'End', value: 'Jul 22, 2027' },
      ] },
      { key: 'Permit requested dates', entries: [
        { label: 'Start', value: 'Jul 22, 2026' },
        { label: 'End', value: 'Jul 22, 2027' },
      ] },
      { key: 'Annual report tentative completion', value: 'Aug 31, 2027' },
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
    fieldOccurrences: [
      'Jul 30, 2026',
      'Aug 13 – 15, 2026',
      'Sep 29, 2026',
      'Oct 27, 2026',
      'Nov 25, 2026',
      'Dec 9, 2026',
      'Jan 22, 2027',
      'Feb 19, 2027',
      'Mar 19, 2027',
      'Apr 10, 2027',
      'May 8, 2027',
      'Jun 7, 2027',
    ],
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
    'An annual report is due by Aug 31, 2027.',
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
    facts: [
      { key: 'Involves soil disturbance', value: 'No', boolean: true },
      { key: 'Requires additional federal/state/local permits', value: 'Yes', boolean: true },
      { key: 'Budget', value: 'Answered in study proposal', href: proposalHref },
      { key: 'Literature cited', value: 'Answered in study proposal', href: proposalHref },
      { key: 'Activities beyond simple use (aircraft/drones, diving, trapping, etc.)', value: 'No', boolean: true },
    ] as MetaRow[],
    files: [
      { name: 'Coralline Diversity & Reproductive Systems Proposal.pdf', type: 'Study Proposal', size: '322.36 KB', by: 'A. Reyes', date: 'Jul 8, 2026', href: proposalHref },
      { name: 'CV_Jun2025.pdf', type: 'Principal Investigator Resume', size: '200.08 KB', by: 'A. Reyes', date: 'Jun 3, 2025', href: '/docs/cv-jun-2025.pdf' },
      { name: 'False Klamath Cove Study Area Map.pdf', type: 'Study Area Supporting Documentation', size: '2.62 MB', by: 'A. Reyes', date: 'Jul 9, 2026', href: '/docs/false-klamath-cove-study-area-map.pdf' },
      { name: 'Additional-Permit-Details.pdf', type: 'Additional Permit Supporting Documentation', size: '157.61 KB', by: 'A. Reyes', date: 'Jul 9, 2026', href: '/docs/additional-permit-details.pdf' },
      { name: 'Liability-Waiver-Addendum-DPR65B.pdf', type: 'Optional Liability Waiver Addendum (DPR65B)', size: '292.25 KB', by: 'A. Reyes', date: 'Jul 14, 2026', href: '/docs/liability-waiver-addendum-dpr65b.pdf' },
      { name: 'standard_conditions_agreement-signed.pdf', type: 'Standard Conditions Agreement Form', size: '178.64 KB', by: 'A. Reyes', date: 'Jul 9, 2026', href: '/docs/standard-conditions-agreement-signed.pdf' },
      { name: 'waiver_and_indemnity_agreement-signed.pdf', type: 'Waiver and Indemnity Agreement Form', size: '200.07 KB', by: 'A. Reyes', date: 'Jul 9, 2026', href: '/docs/waiver-and-indemnity-agreement-signed.pdf' },
    ],
  },

  _dataNote: invented,
} as const;
