// Permit ALERTS — the one registry for page-level state messages on the permit
// detail page (amendment in progress, renewal, report overdue, on hold, …). Each
// alert is a pure rule over the permit's current state: it appears while its
// condition holds and clears when the condition is resolved — never dismissed.
//
// PermitAlerts.astro gathers the context, calls `permitAlerts`, and renders the
// result as one stack under the header: most urgent first (error → warning →
// info), every error plus two warnings/info showing, the rest behind "Show N more".
//
// Tab-specific notices ("Conditions are final" on Special conditions, the Annual
// report tab's own status) stay in their tab — this registry is for state that
// matters whichever tab is open.
//
// To add an alert: append a rule to RULES (registry order breaks severity ties)
// and say who sees it via the audience check inside the rule.

export type AlertKind = 'error' | 'warning' | 'info';
export type Viewer = 'staff' | 'owner' | 'public';

/** What an alert's action does. `go` switches the permit tab; `href` navigates;
 *  `run` is a named command the renderer carries out. */
export interface AlertAction {
  label: string;
  go?: string;
  href?: string;
  run?: 'start-review' | 'lift-block' | 'restore-block' | 'upload-signed-letter';
}

export interface PermitAlert {
  id: string;
  kind: AlertKind;
  title: string;
  subtitle?: string;
  actions?: AlertAction[];
}

/** Everything the rules read — gathered by the renderer from storage + the page. */
export interface AlertContext {
  status: string;
  viewer: Viewer;
  /** Responsible analyst on this permit, or a System Admin. */
  canAct: boolean;
  reviewStarted: boolean;
  /** Days until the permit's end date (negative once ended). */
  daysLeft: number;
  endLabel: string;
  report: {
    state: 'not-due' | 'due' | 'changes-requested' | 'delinquent' | 'submitted' | null;
    due: string;
    sentBack?: { by: string; message: string } | null;
    lifted?: { by: string; at: string } | null;
  };
  /** The researcher's application was returned for changes. */
  returned?: { at: string; count: number; message?: string } | null;
  signedLetterOnFile: boolean;
  /** A renewal whose previous permit's annual report is missing (lib/final-report
   *  priorReport) — overdue once its due date has passed. */
  priorReport?: { permitId: string; due: string; overdue: boolean } | null;
  /** The PI is blocked by an overdue annual report on ANOTHER permit (CSPS-411),
   *  block not lifted. */
  piBlockedBy?: { permitId: string } | null;
  amendmentId?: string | null;
  renewalId?: string | null;
  /** Hrefs the renderer resolves against the site base. */
  links: { revise: string; amend: string; myPermits: string };
}

const RANK: Record<AlertKind, number> = { error: 0, warning: 1, info: 2 };
const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
const RETURNED = ['Returned to submitter', 'Changes requested'];
/** Before the signed letter: a renewal can still be held at activation. */
const PRE_ACTIVATION = ['Waiting for review', 'Under review', ...RETURNED, 'Out for signature'];

type Rule = (c: AlertContext) => PermitAlert | null;

const RULES: Rule[] = [
  // ── Annual report: overdue (renewals blocked) ────────────────────────────
  (c) => {
    if (c.viewer === 'public' || c.report.state !== 'delinquent' || c.report.lifted) return null;
    return c.viewer === 'owner'
      ? { id: 'report-overdue', kind: 'error', title: 'Annual report overdue — renewals blocked',
          subtitle: `It was due ${c.report.due}. Upload it to apply for, renew, or amend a permit as PI.`,
          actions: [{ label: 'Upload annual report', go: 'report' }] }
      : { id: 'report-overdue', kind: 'error', title: 'Annual report overdue — renewals blocked',
          subtitle: `It was due ${c.report.due}. The PI can't apply for, renew, or amend a permit until it's in.`,
          // One action per alert (an actionable notification carries one button).
          actions: [c.canAct ? { label: 'Lift renewal block', run: 'lift-block' } : { label: 'View report', go: 'report' }] };
  },

  // ── Application returned to the researcher ───────────────────────────────
  (c) => {
    if (!RETURNED.includes(c.status) || c.viewer === 'public') return null;
    const n = c.returned?.count ?? 0;
    const when = c.returned?.at ? ` on ${c.returned.at}` : '';
    const message = c.returned?.message ? ` “${c.returned.message}”` : '';
    // A return can carry only a message (no marked issues) — never say "0 changes".
    return c.viewer === 'owner'
      ? { id: 'changes-requested', kind: 'warning', title: 'Changes requested',
          subtitle: n
            ? `The review team asked for ${plural(n, 'change')}${when}.${message}`
            : `The review team returned your application${when}.${message}`,
          actions: [{ label: 'Review requested changes', href: c.links.revise }] }
      : { id: 'changes-requested', kind: 'info', title: 'Returned to the researcher',
          subtitle: n
            ? `${plural(n, 'change')} requested${when}. Waiting for them to resubmit.`
            : `Returned${when}. Waiting for them to resubmit.` };
  },

  // ── Annual report: needs changes ─────────────────────────────────────────
  (c) => {
    if (c.viewer === 'public' || c.report.state !== 'changes-requested') return null;
    const sb = c.report.sentBack;
    return c.viewer === 'owner'
      ? { id: 'report-changes', kind: 'warning', title: 'Annual report needs changes',
          subtitle: sb ? `${sb.by}: “${sb.message}”` : undefined,
          actions: [{ label: 'Upload revised report', go: 'report' }] }
      : { id: 'report-changes', kind: 'warning', title: 'Annual report needs changes',
          subtitle: `${sb?.by ?? 'The reviewer'} asked for a revised report. Due ${c.report.due}.`,
          actions: [{ label: 'View report', go: 'report' }] };
  },

  // ── Renewal held for the previous permit's annual report ─────────────────
  (c) => {
    if (c.status !== 'Waiting for annual report' || c.viewer === 'public') return null;
    return c.viewer === 'owner'
      ? { id: 'renewal-hold', kind: 'warning', title: 'Your permit is on hold',
          subtitle: "It's signed, but can't be issued until your previous permit's annual report is in." }
      : { id: 'renewal-hold', kind: 'warning', title: 'On hold for the previous annual report',
          subtitle: "This renewal can't be issued until the previous permit's annual report is in." };
  },

  // ── Renewals blocked by an overdue report on another of the PI's permits ──
  // A warning, not an error: this permit isn't the overdue one (CSPS-413). Before
  // activation, 'prior-report' below already says the same thing, so it yields.
  // Prototype: no page for another permit, so the action goes to My permits.
  (c) => {
    const b = c.piBlockedBy;
    if (!b || c.viewer === 'public' || (c.priorReport && PRE_ACTIVATION.includes(c.status))) return null;
    const title = `Renewals blocked — annual report overdue on ${b.permitId}`;
    const actions = [{ label: 'Go to My permits', href: c.links.myPermits }];
    return c.viewer === 'owner'
      ? { id: 'renewals-blocked', kind: 'warning', title,
          subtitle: 'Upload it to apply for, renew, or amend a permit as PI.', actions }
      : { id: 'renewals-blocked', kind: 'warning', title,
          subtitle: "The PI can't apply for, renew, or amend a permit until it's in.", actions };
  },

  // ── Renewal: the previous permit's annual report is missing ──────────────
  // Before activation, so the review team and the researcher can get it in before
  // the signed letter is uploaded (which holds the renewal without it). Overdue =
  // the previous permit is Delinquent. Once held, 'renewal-hold' above takes over.
  (c) => {
    const p = c.priorReport;
    if (!p || !PRE_ACTIVATION.includes(c.status) || c.viewer === 'public') return null;
    const when = `Permit ${p.permitId} · ${p.overdue ? 'was due' : 'due'} ${p.due}.`;
    return c.viewer === 'owner'
      ? { id: 'prior-report', kind: p.overdue ? 'error' : 'warning',
          title: p.overdue ? "Your previous permit's annual report is overdue" : "Upload your previous permit's annual report",
          subtitle: `${when} If it's still missing when this permit is signed, the permit goes on hold.`,
          actions: [{ label: 'Go to My permits', href: c.links.myPermits }] }
      : { id: 'prior-report', kind: p.overdue ? 'error' : 'warning',
          title: p.overdue ? "Previous permit's annual report is overdue" : "Previous permit's annual report is missing",
          subtitle: `${when} If it's still missing when the signed letter is uploaded, this renewal goes on hold.` };
  },

  // ── Ending soon ──────────────────────────────────────────────────────────
  (c) => {
    if (c.status !== 'Active' || c.daysLeft < 0 || c.daysLeft > 30 || c.viewer === 'public') return null;
    return c.viewer === 'owner'
      ? { id: 'ending-soon', kind: 'warning', title: `Your permit ends in ${plural(c.daysLeft, 'day')}`,
          subtitle: 'Request an amendment to extend it.',
          actions: [{ label: 'Request amendment', href: c.links.amend }] }
      : { id: 'ending-soon', kind: 'info', title: `Permit ends in ${plural(c.daysLeft, 'day')}`,
          subtitle: `Ends ${c.endLabel}.` };
  },

  // ── Signed letter still to upload ────────────────────────────────────────
  (c) => {
    if (c.status !== 'Out for signature' || c.signedLetterOnFile || c.viewer !== 'staff') return null;
    return { id: 'signed-letter', kind: 'info', title: 'Waiting for the signed letter',
      subtitle: c.priorReport
        ? 'When you upload it, choose to hold the permit or activate it.'
        : 'Uploading it activates the permit.',
      actions: c.canAct ? [{ label: 'Upload signed letter', run: 'upload-signed-letter' }] : [] };
  },

  // ── Start the review ─────────────────────────────────────────────────────
  (c) => {
    if (c.status !== 'Waiting for review' || c.reviewStarted || c.viewer !== 'staff' || !c.canAct) return null;
    return { id: 'start-review', kind: 'info', title: 'Start your review',
      subtitle: 'You can browse the whole application first.',
      actions: [{ label: 'Start review', run: 'start-review' }] };
  },

  // ── Annual report: due / block lifted ────────────────────────────────────
  (c) => {
    if (c.viewer === 'public') return null;
    if (c.report.state === 'delinquent' && c.report.lifted) {
      const l = c.report.lifted;
      return c.viewer === 'owner'
        ? { id: 'report-lifted', kind: 'info', title: 'Annual report overdue — renewal block lifted',
            subtitle: `${l.by} lifted the block, so you can apply again. The report is still due.`,
            actions: [{ label: 'Upload annual report', go: 'report' }] }
        : { id: 'report-lifted', kind: 'info', title: 'Annual report overdue — renewal block lifted',
            subtitle: `${l.by} lifted it on ${l.at}. The report is still due.`,
            actions: c.canAct ? [{ label: 'Restore renewal block', run: 'restore-block' }] : [] };
    }
    if (c.report.state !== 'due') return null;
    return c.viewer === 'owner'
      ? { id: 'report-due', kind: 'info', title: `Annual report due ${c.report.due}`,
          subtitle: 'Your permit has ended.', actions: [{ label: 'Upload annual report', go: 'report' }] }
      : { id: 'report-due', kind: 'info', title: `Annual report due ${c.report.due}`,
          subtitle: 'The permit has ended.' };
  },

  // ── Amendment / renewal started from this permit ─────────────────────────
  (c) => c.amendmentId
    ? { id: 'amendment', kind: 'info', title: `Amendment ${c.amendmentId} in progress`,
        actions: c.viewer === 'public' ? [] : [{ label: 'View amendment', href: c.links.amend }] }
    : null,
  (c) => c.renewalId
    ? { id: 'renewal', kind: 'info', title: `Renewed as ${c.renewalId}`,
        subtitle: 'This permit continues under the renewal.' }
    : null,
];

/** The alerts that apply, most urgent first (registry order breaks ties). */
export const permitAlerts = (c: AlertContext): PermitAlert[] =>
  RULES.map((rule, i) => ({ alert: rule(c), i }))
    .filter((x): x is { alert: PermitAlert; i: number } => !!x.alert)
    .sort((a, b) => RANK[a.alert.kind] - RANK[b.alert.kind] || a.i - b.i)
    .map((x) => x.alert);
