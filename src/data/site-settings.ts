// ---------------------------------------------------------------------------
// Site-wide settings that a System Administrator edits in Templates & defaults —
// the "& defaults" half of that area, plus the letter identity. These change
// rarely and apply across every permit.
//
// Same prototype convention as regulated-docs.ts: the top level is pure data
// (types + seeds, safe to import from Astro frontmatter); every localStorage
// touch lives inside a function called only from a client <script>. Each domain
// is a seed overlaid by an admin edit stored under its own key.
//
//   1. Letterhead & signatories — the agency identity + default signer on the
//      permit letter (today hardcoded in final-letter.astro).
//   2. Permit defaults — the permit-number format and the default validity /
//      report-due cadence that seed each new permit.
//   3. Notification templates — the system emails applicants receive.
// ---------------------------------------------------------------------------

// ── 1. Letterhead & signatories ────────────────────────────────────────────
export interface Letterhead {
  agency: string;
  governorName: string;
  department: string;
  directorName: string;
  /** The classification pre-filled for the letter signer. */
  defaultSignerClassification: string;
}

export const letterheadSeed: Letterhead = {
  agency: 'Natural Resources Agency',
  governorName: 'Gavin Newsom',
  // Matches the masthead printed on the letter (final-letter.astro:1215).
  department: 'Department of Parks and Recreation',
  directorName: 'Armando Quintero',
  defaultSignerClassification: 'Environmental Scientist',
};

// ── 2. Permit defaults ──────────────────────────────────────────────────────
export interface PermitDefaults {
  /** Permit-number prefix, e.g. "SCP" → SCP-2026-00847. */
  idPrefix: string;
  /** Zero-padded width of the running sequence, e.g. 5 → "00847". */
  sequenceWidth: number;
  /** Default permit length in months, used to seed the valid-through date. */
  validityMonths: number;
  /** How often a summary report is due — seeds the letter's report-due field. */
  reportDueCadence: string;
}

export const permitDefaultsSeed: PermitDefaults = {
  idPrefix: 'SCP',
  sequenceWidth: 5,
  validityMonths: 12,
  reportDueCadence: 'Annually',
};

export const reportDueCadenceOptions = [
  'Annually',
  'Semi-annually',
  'Quarterly',
  'At permit expiration',
] as const;

/** Preview of the current numbering scheme, e.g. "SCP-2026-00847". */
export function permitIdPreview(d: PermitDefaults, year = 2026, seq = 847): string {
  return `${d.idPrefix}-${year}-${String(seq).padStart(d.sequenceWidth, '0')}`;
}

// ── 3. Notification templates ────────────────────────────────────────────────
export interface NotificationTemplate {
  id: string;
  /** Admin-facing name of the moment this email is sent. */
  name: string;
  subject: string;
  body: string;
  /** The exact variable tokens the system fills in when this email is sent.
   *  The editor offers these for insertion and flags any other [token]. */
  variables: string[];
}

// The applicant-facing emails, seeded with the finalized copy from Jira (per the
// SCP email inventory). Tokens in [brackets] are filled at send. The NRD phone is
// the corrected 653-6725 (the inventory flags a 635-6725 typo in one template).
// District, internal, and e-signature-service emails are managed elsewhere.
export const notificationSeeds: NotificationTemplate[] = [
  {
    id: 'submission-confirmation',
    name: 'Application submission confirmation',
    variables: ["[Recipient's Name]", '[Application Title]', '[Submission Date]'],
    subject: 'Permit Application Submission Confirmation: [Application Title]',
    body: `Dear [Recipient's Name],

We are pleased to inform you that your permit application, [Application Title], was successfully submitted on [Submission Date].

You can expect a final decision within 90 days from the submission date. If any additional materials or information are required, you will receive further email notifications like this one to keep you informed.

At this point, no further action is required from you.

Thank you for your interest in performing research in California State Parks.

Best regards,`,
  },
  {
    id: 'returned',
    name: 'Application returned to researcher',
    variables: [
      '[Researcher Name]', '[Application ID]', '[Due Date]',
      '[Predefined Reason 1]', '[Predefined Reason 2]', '[Custom text by reviewer]',
      '[Link to Permit Application]',
    ],
    subject: 'Your Permit Application Has Been Returned for Revisions',
    body: `Dear [Researcher Name],

Your permit application [Application ID] has been returned by the technical reviewer. Please review the required changes and resubmit your application by [Due Date].

Required Changes:
- [Predefined Reason 1]
- [Predefined Reason 2]
- [Custom text by reviewer]

You can access your application and make the necessary changes by clicking on the following link: [Link to Permit Application].

Thank you,
Natural Resources Division
California State Parks
(916) 653-6725
nrd.research@parks.ca.gov`,
  },
  {
    id: 'rejected',
    name: 'Application rejected',
    variables: ["[Researcher's Name]", '[Application ID (Title)]', '[Rejection Reason]'],
    subject: 'Your permit application has been rejected',
    body: `Dear [Researcher's Name],

Your research application, [Application ID (Title)], has been reviewed and has been rejected at this stage.

The following reason was provided by the reviewer:

"[Rejection Reason]"

Please review the feedback provided and ensure that any future submissions address the concerns outlined.

If you have any questions or require further information, feel free to contact our office.

Thank you for your attention to this matter.

Best regards,`,
  },
  {
    id: 'approved',
    name: 'Permit approved',
    variables: ['[Application ID]', '[Direct Application URL]'],
    subject: 'Your permit has been approved',
    body: `Hello,

We are pleased to inform you that your research application, [Application ID], has been approved.

Please proceed with the next steps as outlined in the permit itself. You can review the details of your approved application and any specific conditions by logging into the system and downloading the final approved permit.

Use the following link to access your application directly: [Direct Application URL]

Should you have any questions or need further assistance, please do not hesitate to contact us.

Best regards,
Natural Resources Division
California State Parks
(916) 653-6725
nrd.research@parks.ca.gov`,
  },
  {
    id: 'annual-report-15',
    name: 'Annual report reminder — 15 days before',
    variables: ['[Recipient Name]', '[Permit Number]', '[Expiration Date]', '[Link]'],
    subject: 'CA State Parks SCP - Permit Annual Report Due in 15 days – Action Required',
    body: `Dear [Recipient Name],

We are writing to remind you that the annual report for your permit, [Permit Number] (Title), is due on [Expiration Date]. The submission of this report is mandatory in all cases and must be received before a renewal permit can be issued.

Please ensure that your report is submitted by the due date. You can submit your report by logging into your account and navigating to the permit: [Link] and clicking on the submit annual report button.

If you have any questions or need assistance, feel free to contact us.

Thank you for your prompt attention to this matter.

Best regards,`,
  },
  {
    id: 'annual-report-day',
    name: 'Annual report reminder — due today',
    variables: ['[Recipient Name]', '[Permit Number]', '[Expiration Date]', '[Link]'],
    subject: 'CA State Parks SCP - Permit Annual Report Due Today – Action Required',
    body: `Dear [Recipient Name],

We are writing to remind you that the annual report for your permit, [Permit Number] (Title), is due today: [Expiration Date]. The submission of this report is mandatory in all cases and must be received before a renewal permit can be issued.

Please ensure that your report is submitted by the due date. You can submit your report by logging into your account and navigating to the permit: [Link] and clicking on the submit annual report button.

If you have any questions or need assistance, feel free to contact us.

Thank you for your prompt attention to this matter.

Best regards,`,
  },
];

// ── Generic seed + overlay store ─────────────────────────────────────────────
// Every domain is read the same way: start from the seed, apply the admin edit
// stored under its key. Writing merges a partial over the current value.
function read<T>(key: string, seed: T): T {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || 'null');
    return raw && typeof raw === 'object' ? { ...seed, ...raw } : { ...seed };
  } catch {
    return { ...seed };
  }
}
function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

const LETTERHEAD_KEY = 'admin-letterhead';
const DEFAULTS_KEY = 'admin-permit-defaults';
const NOTIFICATIONS_KEY = 'admin-notifications';

export function readLetterhead(): Letterhead {
  return read(LETTERHEAD_KEY, letterheadSeed);
}
export function saveLetterhead(value: Letterhead): void {
  write(LETTERHEAD_KEY, value);
}

export function readPermitDefaults(): PermitDefaults {
  return read(DEFAULTS_KEY, permitDefaultsSeed);
}
export function savePermitDefaults(value: PermitDefaults): void {
  write(DEFAULTS_KEY, value);
}

/** Notifications overlay is keyed by template id → { subject, body }. */
export function readNotifications(): NotificationTemplate[] {
  let overlay: Record<string, { subject?: string; body?: string }> = {};
  try {
    const raw = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
    if (raw && typeof raw === 'object') overlay = raw;
  } catch {}
  return notificationSeeds.map((t) => ({ ...t, ...(overlay[t.id] || {}) }));
}
export function saveNotification(id: string, subject: string, body: string): void {
  let overlay: Record<string, { subject: string; body: string }> = {};
  try {
    const raw = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
    if (raw && typeof raw === 'object') overlay = raw;
  } catch {}
  overlay[id] = { subject, body };
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(overlay));
}
