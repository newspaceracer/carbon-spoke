// Review COMPLETE marks — a non-Responsible reviewer on the analysis team marks
// themselves done ("Complete review") so the team knows when they've finished
// adding conditions, comments, and the rest. It records only who and when; it
// never gates the Responsible analyst. Reopening is allowed while the permit is
// Under review.
//
// One map per permit, keyed by the reviewer's email (the analysis-team rosters
// and the account directory use different ids, but share the email). Both
// rosters (PermitHeader's modal, AnalysisTeam) and the header action read it.

import { findUser, activeUser } from '../data/user';
import type { Identity } from './maintenance';
import { sendEmail } from './notifications';

export const REVIEW_COMPLETE_EVENT = 'review-complete-changed';
const key = (permitId: string) => `permit-review-complete-${permitId}`;

export type ReviewCompleteMap = Record<string, { at: string }>;

export function readReviewComplete(permitId: string): ReviewCompleteMap {
  try {
    const v = JSON.parse(localStorage.getItem(key(permitId)) || '{}');
    return v && typeof v === 'object' ? v : {};
  } catch { return {}; }
}

/** The acting identity's email, or '' when they have no account (pending / anon). */
export function actorEmail(identity: Identity): string {
  const me = activeUser(identity);
  return (me && findUser(me.id)?.email) || '';
}

const write = (permitId: string, map: ReviewCompleteMap) => {
  try { localStorage.setItem(key(permitId), JSON.stringify(map)); } catch {}
  window.dispatchEvent(new CustomEvent(REVIEW_COMPLETE_EVENT, { detail: { permitId } }));
};

export function markReviewComplete(permitId: string, email: string): string {
  const at = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  write(permitId, { ...readReviewComplete(permitId), [email]: { at } });
  return at;
}

export function reopenReview(permitId: string, email: string): void {
  const map = readReviewComplete(permitId);
  delete map[email];
  write(permitId, map);
}

export const isReviewComplete = (permitId: string, email: string) =>
  !!email && !!readReviewComplete(permitId)[email];

/** Repaint roster rows from the marks. Each row carries `data-email`; its seeded
 *  status/date are remembered on first paint so a reopen restores them. `set`
 *  writes the row's status (the two rosters use different markup). */
export function paintReviewRows(
  rows: HTMLElement[],
  permitId: string,
  set: (row: HTMLElement, s: { status: string; kind: string; label: string; when: string }) => void,
  readSeed: (row: HTMLElement) => { status: string; kind: string; label: string; when: string },
): void {
  const map = readReviewComplete(permitId);
  rows.forEach((row) => {
    const email = row.dataset.email || '';
    if (!email || row.dataset.lead === 'true' || row.dataset.responsible === 'true') return;
    if (!row.dataset.seedSnapshot) row.dataset.seedSnapshot = JSON.stringify(readSeed(row));
    const mark = map[email];
    set(row, mark
      ? { status: 'complete', kind: 'succeeded', label: 'Complete', when: `Completed ${mark.at}` }
      : JSON.parse(row.dataset.seedSnapshot));
  });
}

/** EM-L — tell the Responsible analyst a Supporting analyst completed or reopened
 *  their review. Call AFTER the mark changes so the roster/meter (read from the
 *  page's header) already reflect it. */
export function notifyResponsibleAgent(permitId: string, identity: Identity, action: 'completed' | 'reopened'): void {
  const banner = document.getElementById('permit-banner');
  const lead = document.querySelector('.review-row[data-lead="true"]');
  const ra = lead?.querySelector('.review-row__name')?.textContent?.trim() || 'Responsible analyst';
  const bar = document.getElementById('analysis-metric-bar') as any;
  sendEmail('EM-L', {
    'First name': ra,
    'Reviewer name': activeUser(identity)?.name ?? 'A reviewer',
    'Action': action,
    'Next step': action === 'completed'
      ? "They're done adding conditions and comments."
      : 'They can change conditions and comments again.',
    'Permit #': permitId,
    'Project title': banner?.dataset.permitName ?? '',
    'Reviews complete': bar ? `${bar.value} of ${bar.max}` : '',
  }, ra);
}
