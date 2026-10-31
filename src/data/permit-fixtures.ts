// DEV-ONLY stress fixtures for the permit detail page (break-ui). Same shape as
// the demo `permit` in ./permit.ts; selected at dev-server start with
// PUBLIC_PERMIT_FIXTURE=worst|sparse (npm run dev:worst / dev:sparse) and never
// in a production build (see `permit` in ./permit.ts). Every value is something a
// real applicant could submit — the application form sets no length limits — and
// all people, emails and phones are INVENTED (.example domains).
//
//   worst  — long titles/names/emails, diacritics, CJK/RTL names, 6 districts,
//            24 participants, 40 specimens, 22 files, 5-year window.
//   sparse — the minimum a submitted application can hold: one of everything,
//            optional fields empty, every screening gate answered No.
import type { Badge, Contact, FieldSession, HistoryPhase, MetaRow, Participant } from './permit';
import { yesNo } from '../lib/yes-no';

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

// Lifecycle is the same for every fixture — history is about status, not data.
const history: HistoryPhase[] = [
  { phase: 'Presubmittal', steps: [
    { key: 'started', label: 'Application started', date: 'Nov 3, 2025' },
    { key: 'signed', label: 'Application signed', date: 'Dec 18, 2025' },
    { key: 'submitted', label: 'Application submitted', date: 'Dec 19, 2025' },
  ] },
  { phase: 'In review', steps: [
    { key: 'ra-review', label: 'Responsible analyst review completed', date: 'Jan 12, 2026', internal: true },
    { key: 'sa-review', label: 'Supporting analysts review completed', date: 'Jan 14, 2026', internal: true },
    { key: 'returned', label: 'Returned for changes', when: 'returned' },
    { key: 'withdrawn', label: 'Application withdrawn', when: 'withdrawn' },
    { key: 'decision', label: 'Decision reached', date: 'Jan 15, 2026' },
  ] },
  { phase: 'Signature', steps: [
    { key: 'signed-letter', label: 'Signed letter uploaded', date: 'Jan 21, 2026' },
    { key: 'hold', label: 'On hold for the previous annual report', when: 'hold' },
  ] },
  { phase: 'Active permit', steps: [
    { key: 'active', label: 'Permit active', date: 'Feb 1, 2026' },
    { key: 'expired', label: 'Permit expired', date: 'Jan 31, 2031' },
    { key: 'report', label: 'Annual report uploaded' },
  ] },
];

// Existing PDFs under public/docs, so View / View CV still open a real file.
const proposalHref = '/docs/coralline-diversity-proposal.pdf';
const cvHref = '/docs/cv-jun-2025.pdf';

// ── Worst case ──────────────────────────────────────────────────────────────

// The applicant persona stays the submitter so the Researcher identity still owns
// this permit (Story 11 scoping) — only the other people get the hard names.
const submitter: Contact = {
  name: 'Renata Halvorsen',
  phone: '(707) 555-0176',
  email: 'r.halvorsen@humboldt.edu',
  address: 'Office of Research & Sponsored Programs, Siemens Hall Room 215, 1 Harpst St, Arcata, CA 95521-8299',
  cvHref: '/docs/renata-halvorsen-cv.pdf',
};
const pi: Contact = {
  name: 'Dr. Aleksandra Wiśniewska-Kowalczyk',
  // No phone — optional on the form.
  email: 'aleksandra.wisniewska-kowalczyk@research-administration.ucsb.example.edu',
  address: 'Marine Science Institute, Building 520 Room 4002, University of California, Santa Barbara, CA 93106-6150',
  cvHref,
};
const fieldLead: Contact = {
  name: 'Christopher Alexander Montgomery III',
  phone: '+1 (805) 555-0199 ext. 40127',
  email: 'bartholomew.fitzgerald@northwind-industries-holdings.example.com',
  address: 'PO Box 1284, Guadalupe, CA 93434',
  cvHref,
};

const worstSessions: FieldSession[] = [];
for (let y = 2026; y <= 2030; y++) {
  for (const [m, d, end] of [[2, 14, 16], [4, 3, 0], [5, 1, 0], [5, 29, 0], [6, 12, 14], [7, 10, 0], [8, 8, 0], [9, 25, 0]] as const) {
    const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    worstSessions.push(end ? { start: iso, end: `${y}-${String(m).padStart(2, '0')}-${end}` } : { start: iso });
  }
}
// One survey spanning month and year boundaries.
worstSessions.push({ start: '2030-12-29', end: '2031-01-03' });

const plover = 'Charadrius nivosus nivosus';
const specimenRows = [
  { species: plover, quantity: '1,284', portion: 'Non-viable eggs and eggshell fragments recovered from failed or abandoned nests (salvage only)', condition: 'non-viable' },
  { species: plover, quantity: '40', portion: 'Shed contour feathers', condition: 'naturally shed' },
  { species: 'Emerita analoga', quantity: '1000', portion: 'entire individual', condition: 'live; released after counts except voucher subset' },
  { species: 'Megalorchestia californiana', quantity: '500', portion: 'entire individual', condition: 'preserved in 95% ethanol' },
  { species: 'Abronia latifolia', quantity: '1', portion: 'leaf', condition: 'vegetative' },
  { species: 'Ambrosia chamissonis', quantity: '0', portion: '—', condition: 'observation only, no take' },
  { species: 'Larus occidentalis', quantity: '12', portion: 'regurgitated pellets', condition: '' },
  { species: 'Corvus corax', quantity: '30', portion: 'scat', condition: 'dried' },
  { species: 'Microplastic particles (sediment core, 0–10 cm)', quantity: '240', portion: '50 mL core', condition: 'frozen at −20 °C' },
];
const genera = ['Cakile maritima', 'Ammophila arenaria', 'Carpobrotus edulis', 'Leymus mollis', 'Camissoniopsis cheiranthifolia', 'Lupinus chamissonis', 'Erigeron glaucus', 'Eriogonum parvifolium', 'Atriplex leucophylla', 'Calystegia soldanella', 'Croton californicus', 'Ericameria ericoides', 'Phacelia ramosissima', 'Polygonum paronychia', 'Tanacetum bipinnatifidum', 'Dudleya caespitosa', 'Malacothrix incana', 'Lasthenia californica', 'Eschscholzia californica var. maritima', 'Chorizanthe cuspidata var. villosa', 'Cirsium rhothophilum', 'Monardella sinuata ssp. sinuata', 'Erysimum suffrutescens', 'Nasturtium gambelii', 'Layia carnosa', 'Lasthenia conjugens', 'Cicindela hirticollis gravida', 'Coelus globosus', 'Trigonoscuta dorothea dorothea', 'Euphilotes enoptes smithi', 'Phrynosoma blainvillii'];
for (const g of genera) specimenRows.push({ species: g, quantity: '5', portion: 'single stem with leaves and inflorescence', condition: 'vegetative' });

const fileTypes = [
  ['Snowy Plover Nest Exclosure Study — Proposal FINAL (revised) v12 [approved by IACUC].pdf', 'Study Proposal', '4.8 MB', 61],
  ['Wiśniewska-Kowalczyk_CV_2025-11.pdf', 'Principal Investigator Resume', '1.21 MB', 14],
  ['CV_Halvorsen.pdf', 'Submitter Resume', '117.84 KB', 2],
  ['Montgomery_III_CV.pdf', 'Field Lead Resume', '96 KB', 3],
  ['IMG_20250914_183022_HDR_portrait_edited_edited.HEIC', 'Study Area Supporting Documentation', '48.7 MB', 1],
  ['Guadalupe-Nipomo Dunes Exclosure Locations (WGS84) — 2026–2030 field seasons.kmz', 'Study Area Supporting Documentation', '2.3 MB', 1],
  ['USFWS_TE-12345B-0_Section10a1A_RecoveryPermit_application_PENDING.pdf', 'Additional Permit Supporting Documentation', '3.06 MB', 27],
  ['CDFW-SCP-S-192840006-Amendment-3.pdf', 'Additional Permit Supporting Documentation', '412 KB', 6],
  ['IACUC Protocol 2025-0417 Approval Letter.pdf', 'Animal Care Approval', '88 KB', 2],
  ['Coastal Development Permit Exemption — CDP 4-25-0113-X.pdf', 'Additional Permit Supporting Documentation', '1.9 MB', 9],
  ['Liability-Waiver-Addendum-DPR65B.pdf', 'Liability Waiver Addendum (DPR65B)', '90.99 KB', 1],
  ['Liability-Waiver-Addendum-DPR65B (1).pdf', 'Liability Waiver Addendum (DPR65B)', '91 KB', 1],
  ['standard_conditions_agreement-signed.pdf', 'Standard Conditions Agreement Form', '100.59 KB', 1],
  ['waiver_and_indemnity_agreement-signed.pdf', 'Waiver and Indemnity Agreement Form', '94.66 KB', 1],
  ['Budget.xlsx', 'Budget', '24 KB', 1],
  ['Literature Cited.docx', 'Literature Cited', '61 KB', 12],
  ['Data Management Plan.pdf', 'Data Management Plan', '140 KB', 4],
  ['Predator management coordination memo — USDA Wildlife Services.pdf', 'Other', '77 KB', 2],
  ['a.pdf', 'Other', '1 KB', 1],
  ['Scanned_Document.pdf', 'Other', '9.2 MB', 38],
  ['Tribal consultation summary – Northern Chumash Tribal Council (draft, do not distribute).pdf', 'Other', '230 KB', 5],
  ['Nest-camera-trap-protocol_v3_FINAL_final_USE-THIS-ONE.pdf', 'Study Procedures', '512 KB', 8],
] as const;
const worstFiles = fileTypes.map(([name, type, size, pages], i) => ({
  name, type, size, pages,
  by: i % 3 === 0 ? 'A. Wiśniewska-Kowalczyk' : i % 3 === 1 ? 'C. A. Montgomery III' : 'R. Halvorsen',
  date: ['Nov 3, 2025', 'Dec 18, 2025', 'Jun 12, 2025', 'Dec 19, 2025'][i % 4],
  href: /Resume/.test(type) ? (/Submitter/.test(type) ? '/docs/renata-halvorsen-cv.pdf' : cvHref)
    : /DPR65B/.test(type) ? '/docs/liability-waiver-addendum-dpr65b.pdf'
    : proposalHref,
}));

export const worstPermit = {
  id: '26-635-017',
  name:
    'Long-term monitoring of Western snowy plover (Charadrius nivosus nivosus) nesting success, ' +
    'predator-exclosure efficacy, and microplastic ingestion in restored and unrestored dunes, 2026–2031',
  status: { label: 'Waiting for review', kind: 'not-started' },
  category: 'Cultural & Archaeological Resources',
  activeWindow: { start: 'Feb 1, 2026', end: 'Jan 31, 2031', startISO: '2026-02-01', endISO: '2031-01-31' },
  previousPermit: { id: '21-1284-003', endISO: '2026-01-31' },
  infoTags: [
    { label: 'Multi-district', type: 'teal' },
    { label: 'Cultural & Archaeological Resources', type: 'purple' },
  ] as Badge[],
  flagTags: [
    { label: 'Soil disturbance', type: 'high-contrast' },
    { label: 'Beyond simple use', type: 'high-contrast' },
    { label: 'Additional permit required', type: 'high-contrast' },
  ] as Badge[],

  overview: {
    analysisTeam: [
      { id: 'okafor', role: 'Responsible analyst', name: 'J. Okafor', detail: 'Natural Resources Division', reviewStatus: 'pending', when: 'Dec 22, 2025', highlight: true },
      { id: 'santos', role: 'District reviewer', name: 'M. Santos', detail: 'North Coast Redwoods District', reviewStatus: 'not-started', when: 'Dec 22, 2025' },
      { id: 'reyna', role: 'District reviewer', name: 'S. Reyna', detail: 'Mendocino District', reviewStatus: 'pending', when: 'Dec 23, 2025' },
      { id: 'cheng', role: 'Scientific advisor', name: 'Dr. L. Cheng', detail: 'Marine ecology', reviewStatus: 'complete', when: 'Jan 6, 2026' },
      { id: 'delgado', role: 'Permit coordinator', name: 'R. Delgado', detail: 'Statewide Permitting Office', reviewStatus: 'complete', when: 'Jan 5, 2026' },
      { id: 'nair', role: 'HQ technical reviewer', name: 'P. Nair', detail: 'Office of Scientific Review', reviewStatus: 'pending', when: 'Jan 7, 2026' },
      { id: 'okonkwo', role: 'Scientific advisor', name: 'T. Okonkwo', detail: 'Botany', reviewStatus: 'not-started', when: 'Jan 8, 2026' },
      { id: 'bautista', role: 'Cultural resources reviewer', name: 'E. Bautista', detail: 'Cultural Resources Division', reviewStatus: 'not-started', when: 'Jan 9, 2026' },
      { id: 'whitfield', role: 'District superintendent', name: 'K. Whitfield', detail: 'North Coast Redwoods District', reviewStatus: 'complete', when: 'Jan 2, 2026' },
    ],
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
    tags: ['Priority', 'Needs site visit', 'Coastal zone', 'Awaiting external permit', 'Sensitive species', 'Tribal consultation', 'Expedited', 'Multi-year'],
    comments: [
      { author: 'E. Bautista', time: 'Jan 13, 2026', text: 'OK', section: 'compliance' },
      { author: 'M. Santos', time: 'Jan 12, 2026', text: 'Exclosure sites 3–7 overlap the Guadalupe-Nipomo Dunes cultural resource buffer. See https://example.org/parks/gis/layers/cultural-buffers/guadalupe-nipomo?view=exclosures&season=2026-2030&ref=26-635-017 before we approve the stake placements.', section: 'authorized-parks' },
      { author: 'J. Okafor', time: 'Jan 10, 2026', text: 'Line one from the applicant\'s email:\n"We can move the camera traps."\nLine three: they cannot move the exclosures.', section: 'compliance' },
      { author: 'Dr. L. Cheng', time: 'Jan 9, 2026', text: 'The <b>1,284</b> egg count is cumulative over five seasons & salvage-only — fine.', section: 'specimens' },
      { author: 'P. Nair', time: 'Jan 8, 2026', text: 'Forwarded the USFWS Section 10(a)(1)(A) status question to bartholomew.fitzgerald@northwind-industries-holdings.example.com, who handles their federal permitting.', section: 'compliance' },
      { author: 'S. Reyna', time: 'Jan 8, 2026', text: 'Mendocino has no plover habitat in scope; I\'ll mark my review complete once the park list is trimmed.', section: 'authorized-parks' },
      { author: 'R. Delgado', time: 'Jan 7, 2026', text: 'Renewal of 21-1284-003. Prior annual report received late (Mar 2026) but complete.', section: 'compliance' },
      { author: 'K. Whitfield', time: 'Jan 6, 2026', text: 'Superintendent sign-off for Tolowa Dunes and Pescadero units, conditional on the 48-hour ranger notice.', section: 'authorized-parks' },
      { author: 'T. Okonkwo', time: 'Jan 5, 2026', text: 'Thirty-one plant taxa at five stems each is proportionate; Layia carnosa and Lasthenia conjugens are federally listed — collection should be photo-voucher only for those two.', section: 'specimens' },
      { author: 'J. Okafor', time: 'Jan 4, 2026', text: 'Paramètres de confidentialité et de sécurité — the applicant pasted French UI text into the data-management answer; asked them to fix it.', section: 'compliance' },
      { author: 'M. Santos', time: 'Jan 3, 2026', text: '👍', section: 'authorized-parks' },
      { author: 'J. Okafor', time: 'Dec 22, 2025', text: 'Assigned. Big one — five seasons, six districts, 40 taxa, 22 attachments. Splitting district reviews by unit.', section: 'compliance' },
    ],
    history,
  },

  researchTeam: {
    organization: {
      name: 'University of California, Santa Barbara — Marine Science Institute, Cheadle Center for Biodiversity and Ecological Restoration',
      phone: '+1 (805) 555-0100 ext. 2',
      email: 'cheadle-center-dune-restoration-program@lifesci.ucsb.example.edu',
      address: 'Marine Science Institute, Building 520 Room 4002, University of California, Santa Barbara, CA 93106-6150',
    } as Contact,
    submitter,
    principalInvestigator: pi,
    fieldLead,
    participants: [
      { name: 'Đặng Thị Ngọc Hân', title: 'Graduate researcher', phone: '(805) 555-0173', email: 'ngochan.dang@ucsb.example.edu', comments: 'Nest-monitoring lead, all five seasons.' },
      { name: 'Jo', title: 'Intern', email: 'jo@ucsb.example.edu', comments: '' },
      { name: '王秀英', title: 'Postdoctoral scholar', phone: '(805) 555-0128', email: 'xiuying.wang@ucsb.example.edu', comments: 'Microplastics extraction and FTIR.' },
      { name: 'Konstantin Oberhauser-Wettstein', title: 'Senior Environmental Scientist (Specialist), Coastal Dune Restoration', phone: '(916) 555-0184', email: 'konstantin.oberhauser-wettstein@wildlife-consulting-partners.example.com', comments: 'Contract biologist; covered by his firm\'s policy, not the university\'s. Certificate of insurance attached under Other.' },
      { name: 'Seán O\'Brien-Ó Súilleabháin', title: 'Field technician', phone: '', email: 'sean.obrien@ucsb.example.edu', comments: '' },
      { name: 'María José de la Cruz y Fernández', title: 'Undergraduate field assistant', phone: '(805) 555-0101', email: 'mj.delacruz+fieldwork@ucsb.example.edu', comments: 'Weekends only, Mar–Aug.' },
      { name: 'نور الهدى عبد الرحمن', title: 'Visiting researcher', email: 'nour.abdelrahman@example.org', comments: 'Visiting from partner institution, 2027 season only.' },
      { name: 'Ólafur Darri Ólafsson', title: 'Drone pilot (FAA Part 107)', phone: '(805) 555-0119', email: 'olafur@example.com', comments: 'Aerial nest surveys; see Beyond simple use.' },
      { name: 'dana', email: 'dana@example.com' },
      { name: 'Theo Lindqvist', title: 'Community volunteer', email: 'tlindqvist@example.org', comments: 'Community volunteer — not covered by university insurance.' },
      ...['Priya Nadar', 'Helena Marsh', 'Marcus Webb', 'Fiona Blake', 'Gabriel Okoro', 'Hannah Lee', 'Ishaan Kapoor', 'Lucía Ramírez', 'Noah Bergström', 'Ama Mensah', 'Wren Calloway', 'Kai Nakamura-Silva', 'Zoë Achterberg', 'Ben Ito'].map((name, i) => ({
        name,
        title: i % 2 ? 'Undergraduate field assistant' : 'Graduate researcher',
        phone: i % 3 ? `(805) 555-01${String(30 + i).padStart(2, '0')}` : '',
        email: `${name.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').replace(/ /g, '.')}@ucsb.example.edu`,
        comments: i % 4 ? '' : 'Field days only.',
      })),
    ] as Participant[],
    personnelInsured: false,
  },

  projectInfo: {
    details: [
      { key: 'Project category', value: 'Cultural & Archaeological Resources (e.g. middens, historic structures, rock art)' },
      { key: 'Project dates', entries: [
        { label: 'Start', value: '02/01/2026' },
        { label: 'End', value: '01/31/2031' },
      ] },
      { key: 'Permit requested dates', entries: [
        { label: 'Start', value: '02/01/2026' },
        { label: 'End', value: '01/31/2031' },
      ] },
      { key: 'Annual report', entries: [
        { label: 'Tentative completion', value: '03/02/2031' },
        { label: 'Due', value: '03/02/2031' },
      ] },
    ] as MetaRow[],
    projectWindow: { startISO: '2026-02-01', startLabel: 'Feb 1, 2026', endISO: '2031-01-31', endLabel: 'Jan 31, 2031' },
    purpose:
      'The Western snowy plover (Charadrius nivosus nivosus) Pacific coast population is listed as ' +
      'threatened under the federal Endangered Species Act and as a species of special concern by the ' +
      'California Department of Fish and Wildlife. Coastal State Park units hold a large share of the ' +
      'remaining breeding habitat, yet nest success varies severalfold between units for reasons that ' +
      'are poorly resolved: predator pressure (common ravens, western gulls, red fox, coyote), human ' +
      'disturbance, habitat loss to invasive European beachgrass (Ammophila arenaria) and iceplant ' +
      '(Carpobrotus edulis), and — a newer concern — ingestion of microplastics by chicks foraging on ' +
      'wrack-associated invertebrates.\n\n' +
      'This five-season study will (1) monitor every plover nest in the authorized units from ' +
      'February through September each year; (2) compare hatching and fledging success between nests ' +
      'protected by small mesh predator exclosures and unprotected nests, controlling for distance to ' +
      'trailheads and raven roosts; (3) quantify microplastic loads in sediment cores, wrack-line ' +
      'invertebrates (Megalorchestia, Emerita) and salvaged non-viable eggs; and (4) relate all three ' +
      'to dune-restoration status, using paired restored and unrestored transects at each unit.\n\n' +
      'Field methods are non-invasive wherever possible. Nests are located by walking transects and ' +
      'by drone survey (Part 107 pilot, altitude ≥ 40 m, never over incubating birds for more than 60 ' +
      'seconds). Exclosures are 3 m diameter, 1.2 m tall, installed within 24 hours of clutch ' +
      'completion and removed within 48 hours of the last chick leaving. Salvage of non-viable eggs ' +
      'occurs only after the nest is confirmed failed or abandoned for at least 7 days. Plant vouchers ' +
      'are limited to five stems per taxon per season; federally listed plants are photo-vouchered ' +
      'only. All data are deposited with the Cheadle Center, CDFW BIOS, and Dryad within 12 months of ' +
      'each season.',
    benefits: 'TBD',
    fieldSessions: worstSessions,
    fieldOccurrences: worstSessions.map(sessionLabel),
    annualReport: {
      tentativeISO: '2031-03-02', tentativeLabel: 'Mar 2, 2031',
      requiredISO: '2031-03-02', requiredLabel: 'Mar 2, 2031',
    },
    demoTodayISO: '2026-08-04',
  },

  studyAreas: {
    districts: [
      { name: 'North Coast Redwoods District',
        coordinator: { name: 'M. Santos', phone: '(707) 555-0119', email: 'm.santos@parks.ca.gov' } as Contact,
        parks: ['Jedediah Smith Redwoods State Park', 'Del Norte Coast Redwoods State Park', 'Prairie Creek Redwoods State Park', 'Tolowa Dunes State Park', 'Humboldt Redwoods State Park', 'Grizzly Creek Redwoods State Park', 'Richardson Grove State Park', 'Sue-meg State Park', 'Benbow State Recreation Area'],
        conditions: [
          'No exclosure, stake, or camera-trap placement within 100 m of a posted cultural-resource buffer at Tolowa Dunes without written concurrence from the District Archaeologist, obtained at least 10 business days before installation, and with a monitor from the Tolowa Dee-ni\' Nation present during installation and removal.',
          'Vehicles restricted to designated lots.',
        ] },
      { name: 'Mendocino District',
        coordinator: { name: 'T. Alvarado', phone: '(707) 555-0164', email: 't.alvarado@parks.ca.gov' } as Contact,
        parks: ['MacKerricher State Park', 'Manchester State Park'],
        conditions: [] },
      { name: 'Sonoma-Mendocino Coast District',
        coordinator: { name: 'Konstantin Oberhauser-Wettstein', email: 'konstantin.oberhauser-wettstein@parks.ca.example.gov' } as Contact,
        parks: ['Salt Point State Park', 'Sonoma Coast State Park', 'Fort Ross State Historic Park', 'Armstrong Redwoods State Natural Reserve', 'Kruse Rhododendron State Natural Reserve'],
        conditions: ['Drone flights prohibited within 300 m of the Fort Ross historic compound.'] },
      { name: 'San Luis Obispo Coast District',
        coordinator: { name: 'Jo', phone: '(805) 555-0150', email: 'jo@parks.ca.example.gov' } as Contact,
        parks: ['Montaña de Oro State Park', 'Morro Bay State Park', 'Hearst San Simeon State Park', 'Pismo State Beach'],
        conditions: ['Oceano Dunes SVRA nesting exclosures are managed by the district; coordinate before every season.', 'No take at Pismo State Beach monarch grove.'] },
      { name: 'Channel Coast District',
        coordinator: { name: 'Đặng Thị Ngọc Hân', phone: '(805) 555-0188', email: 'ngochan.dang@parks.ca.example.gov' } as Contact,
        parks: ['Gaviota State Park', 'Refugio State Beach', 'El Capitán State Beach', 'Emma Wood State Beach', 'McGrath State Beach'],
        conditions: [] },
      { name: 'Orange Coast District',
        coordinator: { name: 'A. Moreno', phone: '(949) 555-0146', email: 'a.moreno@parks.ca.gov' } as Contact,
        parks: ['Bolsa Chica State Beach', 'Huntington State Beach'],
        conditions: ['Least tern colony closures (Apr 1 – Sep 15) apply in addition to plover closures.'] },
    ],
    sites: [
      { name: 'Tolowa Dunes — Lake Earl north transect', coords: '41.8732, -124.2117', note: 'Restored 2019; ravens roost in the adjacent spruce stand.' },
      { name: 'MacKerricher — Ten Mile Dunes', coords: '39.5418, -123.7701', note: '' },
      { name: 'Sonoma Coast — Salmon Creek', coords: '38.3507, -123.0688', note: 'High visitor use year-round; unrestored control.' },
      { name: 'Montaña de Oro — Sand Spit', coords: '35.3051, -120.8768', note: 'Paired restored/unrestored transects 400 m apart.' },
      { name: 'Morro Bay — Morro Strand', coords: '35.4058, -120.8698', note: 'Dog-walking pressure; exclosure vandalism reported 2023.' },
      { name: 'Gaviota', coords: '34.4717, -120.2283', note: 'Pocket beach; small sample expected.' },
      { name: 'McGrath', coords: '34.2201, -119.2617', note: 'Santa Clara River mouth; flood-reset habitat.' },
      { name: 'Bolsa Chica', coords: '33.6950, -118.0464', note: 'Shared colony with California least tern.' },
    ],
  },

  specialConditions: [
    'The signed permit must be carried by field personnel during all activities and presented on request.',
    'Collection is limited to the approved study areas and the taxa and quantities listed under Data Collection.',
    'No collection within posted marine reserve or special-closure boundaries.',
    'All collected specimens are State property and must be curated at the approved facility.',
    'An annual report is due by Mar 2, 2031, 30 days after the permit ends.',
    'Drone operations must comply with FAA Part 107, must not approach within 40 m vertical or 100 m horizontal of an incubating plover or a least-tern colony, must not exceed 60 seconds over any active nest, and must be logged (date, unit, pilot, altitude, duration) in the annual report; any observed flush event ends that day\'s flights at that unit.',
    'Federally listed plants (Layia carnosa, Lasthenia conjugens) — photo voucher only.',
    'Exclosures removed within 48 hours of the last chick leaving the nest.',
    'Notify the district ranger 48 hours before each field session.',
    'No work during posted closures.',
    'Report any dead or injured listed species to USFWS and CDFW within 24 hours.',
    'Camera traps must not record park visitors; reposition or mask any frame that does.',
    'Comply with all conditions of the USFWS and CDFW permits.',
    'Fill all sediment-core holes.',
  ],

  dataCollection: {
    involvesCollection: true,
    involvesLaboratory: true,
    collection: [
      { key: 'Collection rationale', value: 'Answered in study proposal', href: proposalHref },
      { key: 'Curation facility', value: 'Cheadle Center for Biodiversity and Ecological Restoration — Vertebrate Zoology & Herbarium Collections', contactKind: 'facility',
        contact: { name: 'Cheadle Center for Biodiversity and Ecological Restoration — Vertebrate Zoology & Herbarium Collections', address: 'Harder South Building 578, University of California, Santa Barbara, CA 93106-9615' } },
      { key: 'Curation — responsible official', value: `${pi.name} · ${pi.email}`, contact: pi },
    ] as MetaRow[],
    laboratory: [
      { key: 'Laboratory facility', value: 'UCSB Marine Science Institute Analytical Lab', contactKind: 'facility',
        contact: { name: 'UCSB Marine Science Institute Analytical Lab', address: 'Building 520, Santa Barbara, CA 93106' } },
      { key: 'Laboratory — responsible official', value: `${fieldLead.name} · ${fieldLead.phone} · ${fieldLead.email}`, contact: fieldLead },
      { key: 'Lab study window', value: 'Feb 1, 2026 – Jan 31, 2031' },
      { key: 'Study procedures', value: 'Answered in study proposal', href: proposalHref },
      { key: 'Location of data & data products', value: 'Nest records and exclosure outcomes: CDFW BIOS (dataset ds-1284) and Dryad (doi:10.5061/dryad.9f8e7d6c5b4a); microplastic FTIR spectra: Zenodo; voucher specimens: Cheadle Center; drone imagery (≈ 4 TB/season): UCSB Library Research Data Services cold storage, available on request' },
    ] as MetaRow[],
    specimens: specimenRows,
  },

  additionalDocs: {
    additionalPermitsDetails:
      'USFWS Native Endangered and Threatened Species Recovery Permit, Section 10(a)(1)(A), TE-12345B-0 — ' +
      'application pending since Sep 2025. CDFW Scientific Collecting Permit S-192840006 (amendment 3, in hand). ' +
      'California Coastal Commission CDP exemption 4-25-0113-X (in hand). IACUC protocol 2025-0417 (approved).',
    facts: [
      { key: 'Involves soil disturbance', value: 'Yes', boolean: true,
        statements: yesNo.soilDisturbance,
        detail: 'Predator exclosures (3 m diameter, 1.2 m tall, four 1.5 m rebar stakes each, up to 60 per season across all units); 40 sediment cores (5 cm × 10 cm) per unit per season; temporary transect stakes.' },
      { key: 'Requires additional federal/state/local permits', value: 'Yes', boolean: true,
        statements: yesNo.additionalPermits,
        detail: 'USFWS Section 10(a)(1)(A) TE-12345B-0 (pending); CDFW SCP S-192840006 (in hand); Coastal Commission CDP exemption 4-25-0113-X (in hand).' },
      { key: 'Budget', value: 'Answered in study proposal', href: proposalHref },
      { key: 'Literature cited', value: 'Answered in study proposal', href: proposalHref },
      { key: 'Activities beyond simple use (aircraft/drones, diving, trapping, etc.)', value: 'Yes', boolean: true,
        statements: yesNo.beyondSimpleUse,
        detail: 'Drone (DJI Mavic 3 Enterprise, Part 107) nest surveys at ≥ 40 m; 24 motion-triggered camera traps on exclosures; no trapping of animals.' },
    ] as MetaRow[],
    files: worstFiles,
  },

  _dataNote: 'Invented worst-case fixture — not real contact information.',
};

// ── Sparse ──────────────────────────────────────────────────────────────────

const sparseSessions: FieldSession[] = [{ start: '2026-09-12' }];
const lone: Contact = { name: 'Renata Halvorsen', email: 'r.halvorsen@humboldt.edu', cvHref: '/docs/renata-halvorsen-cv.pdf' };

export const sparsePermit = {
  id: '26-635-017',
  name: 'Lichen survey',
  status: { label: 'Waiting for review', kind: 'not-started' },
  category: 'Botanical Resources',
  activeWindow: { start: 'Sep 12, 2026', end: 'Sep 12, 2026', startISO: '2026-09-12', endISO: '2026-09-12' },
  previousPermit: { id: '25-635-017', endISO: '2026-09-11' },
  infoTags: [{ label: 'Botanical Resources', type: 'purple' }] as Badge[],
  flagTags: [] as Badge[],

  overview: {
    analysisTeam: [
      { id: 'okafor', role: 'Responsible analyst', name: 'J. Okafor', detail: 'Natural Resources Division', reviewStatus: 'not-started', when: 'Aug 1, 2026', highlight: true },
    ],
    tagOptions: ['Priority', 'Needs site visit'],
    tags: [] as string[],
    comments: [] as { author: string; time: string; text: string; section: string }[],
    history,
  },

  researchTeam: {
    organization: { name: 'Independent researcher' } as Contact,
    submitter: lone,
    principalInvestigator: lone,
    fieldLead: lone,
    participants: [] as Participant[],
    personnelInsured: true,
  },

  projectInfo: {
    details: [
      { key: 'Project category', value: 'Botanical Resources' },
      { key: 'Project dates', entries: [{ label: 'Start', value: '09/12/2026' }, { label: 'End', value: '09/12/2026' }] },
      { key: 'Permit requested dates', entries: [{ label: 'Start', value: '09/12/2026' }, { label: 'End', value: '09/12/2026' }] },
      { key: 'Annual report', entries: [{ label: 'Tentative completion', value: '10/12/2026' }, { label: 'Due', value: '10/12/2026' }] },
    ] as MetaRow[],
    projectWindow: { startISO: '2026-09-12', startLabel: 'Sep 12, 2026', endISO: '2026-09-12', endLabel: 'Sep 12, 2026' },
    purpose: 'One-day lichen survey.',
    benefits: '',
    fieldSessions: sparseSessions,
    fieldOccurrences: sparseSessions.map(sessionLabel),
    annualReport: { tentativeISO: '2026-10-12', tentativeLabel: 'Oct 12, 2026', requiredISO: '2026-10-12', requiredLabel: 'Oct 12, 2026' },
    demoTodayISO: '2026-08-04',
  },

  studyAreas: {
    districts: [
      { name: 'Mendocino District',
        coordinator: { name: 'T. Alvarado', email: 't.alvarado@parks.ca.gov' } as Contact,
        parks: ['Van Damme State Park'],
        conditions: [] as string[] },
    ],
    sites: [] as { name: string; coords: string; note: string }[],
  },

  specialConditions: ['The signed permit must be carried by field personnel during all activities and presented on request.'],

  dataCollection: {
    involvesCollection: true,
    involvesLaboratory: false,
    collection: [
      { key: 'Collection rationale', value: 'Voucher one specimen.' },
    ] as MetaRow[],
    laboratory: [] as MetaRow[],
    specimens: [{ species: 'Usnea longissima', quantity: '1', portion: 'thallus fragment', condition: '' }],
  },

  additionalDocs: {
    additionalPermitsDetails: '',
    facts: [
      { key: 'Involves soil disturbance', value: 'No', boolean: false, statements: yesNo.soilDisturbance },
      { key: 'Requires additional federal/state/local permits', value: 'No', boolean: false, statements: yesNo.additionalPermits },
      { key: 'Activities beyond simple use (aircraft/drones, diving, trapping, etc.)', value: 'No', boolean: false, statements: yesNo.beyondSimpleUse },
    ] as MetaRow[],
    files: [
      { name: 'proposal.pdf', type: 'Study Proposal', size: '41 KB', pages: 1, by: 'R. Halvorsen', date: 'Aug 1, 2026', href: proposalHref },
    ],
  },

  _dataNote: 'Invented sparse fixture — not real contact information.',
};
