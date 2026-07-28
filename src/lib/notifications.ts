// ---------------------------------------------------------------------------
// Notifications — the SIMULATED email system for the roles/permissions workflow.
//
// This is a prototype: nothing is actually sent. `sendEmail` merges a template and
// appends the result to a localStorage "outbox" (`sim-outbox`) so a tester can see
// exactly what would go out. Templates are editable on Templates & Defaults (Story
// 16, `email-templates`) and optional ones are opt-out on Profile (Story 17,
// `notif-prefs`); regulated researcher-facing emails (EM-C/D/E/H) are always sent.
//
// Canonical copy: docs/email-copy-notifications.md. Keep the two in sync.
// ---------------------------------------------------------------------------

/** Which Profile preference governs an email, or null when it has no toggle
 *  (regulated/always-sent, or the external signer who has no account). */
export type NotifPref = 'assignment' | 'signature' | 'status' | 'decisions' | null;

export interface EmailTemplate {
  id: string;          // 'EM-A' … 'EM-I'
  name: string;        // short admin-facing label
  subject: string;
  body: string;
  regulated: boolean;  // always sent, copy editable but send not optional
  pref: NotifPref;     // the Profile preference that can suppress it
  recipients: string;  // human description of who receives it
  placeholders: string[];
}

const SIG = `Natural Resources Division
California State Parks
(916) 653-6725
nrd.research@parks.ca.gov`;

// The canonical defaults (docs/email-copy-notifications.md).
export const defaultTemplates: EmailTemplate[] = [
  {
    id: 'EM-A', name: 'Second-signer request (internal)', pref: 'signature', regulated: false,
    recipients: 'The configured second signer (system user)',
    placeholders: ['Permit #', 'Project title', 'District(s)', 'Responsible Agent name'],
    subject: 'Signature requested — research permit [Permit #]',
    body: `[First name],

A research permit is ready for your signature as the second signer.

Permit:            [Permit #] — [Project title]
District(s):       [District(s)]
Responsible Agent: [Responsible Agent name] (first signature complete)

Review and sign in DocuSign. The permit becomes active once your
signature is recorded.

[Review and sign]

${SIG}`,
  },
  {
    id: 'EM-B', name: 'Second-signer request (external)', pref: null, regulated: false,
    recipients: "The district's external default signer (email only, no account)",
    placeholders: ['Permit #', 'Project title', 'District(s)'],
    subject: 'Signature requested — California State Parks research permit [Permit #]',
    body: `Hello,

California State Parks has requested your signature on a research permit
as the designated second signer.

Permit:      [Permit #] — [Project title]
District(s): [District(s)]

Use the link below to review and sign in DocuSign. You do not need an
account. The permit takes effect once your signature is recorded.

[Review and sign]

If you were not expecting this request, contact nrd.research@parks.ca.gov.

${SIG}`,
  },
  {
    id: 'EM-C', name: 'Permit issued / active', pref: 'decisions', regulated: true,
    recipients: 'Researcher (submitter), Principal Investigator, PICOF',
    placeholders: ['PI name', 'Permit #', 'Project title', 'Permit start', 'Permit end', 'Park(s)'],
    subject: 'Your research permit [Permit #] is now active',
    body: `[PI name],

Your research permit is now active.

Permit:  [Permit #] — [Project title]
Term:    [Permit start] – [Permit end]
Park(s): [Park(s)]

You may begin the authorized work within the permit term and its
conditions. A copy of the permit is available in your account.

Report any change to your project before it occurs. An annual report is
required as specified in your permit.

${SIG}`,
  },
  {
    id: 'EM-D', name: 'Application returned', pref: 'decisions', regulated: true,
    recipients: 'Researcher (submitter), PI, PICOF',
    placeholders: ['PI name', 'Permit #', 'Project title'],
    subject: 'Action needed — research permit application [Permit #] returned for changes',
    body: `[PI name],

Your research permit application has been returned for changes.

Application: [Permit #] — [Project title]

Review the requested changes, update your application, and resubmit.
Reviewer notes are available in your account.

${SIG}`,
  },
  {
    id: 'EM-E', name: 'Application rejected', pref: 'decisions', regulated: true,
    recipients: 'Researcher (submitter), PI, PICOF',
    placeholders: ['PI name', 'Permit #', 'Project title'],
    subject: 'Decision on your research permit application [Permit #]',
    body: `[PI name],

After review, your research permit application has not been approved.

Application: [Permit #] — [Project title]

The reasons for this decision are available in your account. If you have
questions, contact nrd.research@parks.ca.gov.

${SIG}`,
  },
  {
    id: 'EM-F', name: 'Responsible Agent assigned', pref: 'assignment', regulated: false,
    recipients: 'The new Responsible Agent',
    placeholders: ['First name', 'Permit #', 'Project title', 'Single/Multi', 'Status'],
    subject: 'You are the Responsible Agent for permit [Permit #]',
    body: `[First name],

You are now the Responsible Agent for a research permit.

Permit: [Permit #] — [Project title]
Type:   [Single/Multi]-district
Status: [Status]

As Responsible Agent you lead the review and are the first signer.

[Open permit]

${SIG}`,
  },
  {
    id: 'EM-G', name: 'Responsible Agent unassigned', pref: 'assignment', regulated: false,
    recipients: 'The outgoing Responsible Agent',
    placeholders: ['First name', 'Permit #', 'Project title'],
    subject: 'You are no longer the Responsible Agent for permit [Permit #]',
    body: `[First name],

Your role on permit [Permit #] — [Project title] has changed because the
permit's districts changed. You are no longer the Responsible Agent.

[You remain a Supporting Agent on this permit. / You no longer have a role
on this permit.]

No action is needed.

${SIG}`,
  },
  {
    id: 'EM-H', name: 'Renewal placed on hold', pref: 'decisions', regulated: true,
    recipients: 'Researcher (submitter), PI, PICOF',
    placeholders: ['PI name', 'Permit #', 'Project title'],
    subject: 'Annual report required before permit [Permit #] can be issued',
    body: `[PI name],

Your renewal permit is ready but is on hold. The annual report for your
previous permit has not been received, so the new permit cannot be issued
yet.

Permit: [Permit #] — [Project title]

Submit the outstanding annual report to release the hold. Once it is
received, the permit will be issued.

${SIG}`,
  },
  {
    id: 'EM-I', name: 'Status change (permits you review)', pref: 'status', regulated: false,
    recipients: "The permit's Responsible Agent and Supporting Agents",
    placeholders: ['First name', 'Permit #', 'Project title', 'Status', 'Responsible Agent / Supporting Agent'],
    subject: 'Status update — permit [Permit #] is now [Status]',
    body: `[First name],

A permit you review has changed status.

Permit:     [Permit #] — [Project title]
New status: [Status]
Your role:  [Responsible Agent / Supporting Agent]

[Open permit]

${SIG}`,
  },
];

// ── Template overrides (Story 16) ───────────────────────────────────────────
const TEMPLATES_KEY = 'email-templates';

type Overrides = Record<string, { subject?: string; body?: string }>;
const loadOverrides = (): Overrides => {
  try { const r = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '{}'); return r && typeof r === 'object' ? r : {}; }
  catch { return {}; }
};

/** All templates with any admin overrides applied. */
export function loadTemplates(): EmailTemplate[] {
  const ov = loadOverrides();
  return defaultTemplates.map((t) => ({ ...t, subject: ov[t.id]?.subject ?? t.subject, body: ov[t.id]?.body ?? t.body }));
}
export function getTemplate(id: string): EmailTemplate | undefined {
  return loadTemplates().find((t) => t.id === id);
}
export function saveTemplate(id: string, patch: { subject?: string; body?: string }): void {
  const ov = loadOverrides();
  ov[id] = { ...ov[id], ...patch };
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(ov));
}
export function resetTemplate(id: string): void {
  const ov = loadOverrides();
  delete ov[id];
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(ov));
}

// ── Preferences (Story 17) ──────────────────────────────────────────────────
const PREFS_KEY = 'notif-prefs';
export interface NotifPrefs { assignment: boolean; signature: boolean; status: boolean; }
const DEFAULT_PREFS: NotifPrefs = { assignment: true, signature: true, status: true };

export function loadPrefs(): NotifPrefs {
  try { const r = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); return { ...DEFAULT_PREFS, ...(r && typeof r === 'object' ? r : {}) }; }
  catch { return { ...DEFAULT_PREFS }; }
}
export function savePrefs(p: Partial<NotifPrefs>): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...loadPrefs(), ...p }));
}

/** Whether the current user's preferences allow an email governed by `pref`.
 *  Regulated/no-pref emails are always allowed. */
export function prefAllows(pref: NotifPref): boolean {
  if (pref === null || pref === 'decisions') return true; // always sent
  return loadPrefs()[pref] !== false;
}

// ── Send (simulated) ────────────────────────────────────────────────────────
export interface SentEmail { id: string; to: string; subject: string; body: string; at: string; suppressed: boolean; }
const OUTBOX_KEY = 'sim-outbox';

const merge = (text: string, vars: Record<string, string>) =>
  text.replace(/\[([^\]]+)\]/g, (m, key) => (key in vars ? vars[key] : m));

export function readOutbox(): SentEmail[] {
  try { const r = JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]'); return Array.isArray(r) ? r : []; }
  catch { return []; }
}

/** Simulate sending a template. Merges [placeholders] from `vars`, records it in
 *  the outbox, and flags whether the current user's prefs would suppress their
 *  copy (regulated/no-pref are never suppressed). `to` overrides the recipient
 *  label. Returns the recorded email. Prototype-only — nothing leaves the browser. */
export function sendEmail(id: string, vars: Record<string, string> = {}, to?: string): SentEmail | null {
  const t = getTemplate(id);
  if (!t) return null;
  const at = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const rec: SentEmail = {
    id, to: to ?? t.recipients, subject: merge(t.subject, vars), body: merge(t.body, vars),
    at, suppressed: !prefAllows(t.pref),
  };
  const box = readOutbox();
  box.unshift(rec);
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(box.slice(0, 50)));
  return rec;
}
