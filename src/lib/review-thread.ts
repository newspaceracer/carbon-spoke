// Review notes on a permit application, as the browser stores them. A prototype has
// no backend, so every store is localStorage, keyed per permit. Two kinds of note:
//
//   • COMMENTS — internal, reviewer ↔ reviewer. The SAME thread the permit detail
//     page and the review wizard (final-letter) read and write: comments under
//     permit-comments-${id} (newest first; seeded ones live in permit.ts), replies
//     under permit-comment-replies-${id} keyed by their parent, and resolved
//     parents under permit-comment-resolved-${id}. A comment may carry the record
//     `section` it's about and an `anchor` (a quoted passage).
//   • ISSUES — researcher-facing: what the applicant must change or provide. The
//     round trip:
//       draft     → a reviewer marked it (a section, maybe a quoted passage)
//       sent      → the application was returned with it (`sentAt`)
//       addressed / not-addressed → the researcher resubmitted, having marked it
//                   addressed or not (`response`, with an optional note)
//       resolved  → a reviewer accepted the fix (`resolvedAt`); "Ask again" sends a
//                   not-quite-fixed issue back to draft for the next return.
//     Returning records the return itself (who, when, an optional message);
//     resubmitting stamps it `resubmittedAt`.
//
// Read by the application-record prototype, the review wizard, the permit header's
// Request changes, and the researcher's revise flow (/apply?revise=…).
// (final-letter and permit.astro still carry their own copies of the comment-store
// code; same keys, same shapes.)

export interface ReviewComment {
  author: string;
  time: string;
  text: string;
  mentions?: string[];
  anchor?: { quote?: string } & Record<string, unknown>;
  section?: string;
}
export interface Reply { author: string; time: string; text: string; mentions?: string[] }
export interface ReviewIssue {
  id: string;
  section: string;
  quote?: string;
  text: string;
  author: string;
  time: string;
  /** Set when the application is returned with this issue. */
  sentAt?: string;
  /** The researcher's answer, saved as they revise. */
  response?: { addressed: boolean; note?: string; at: string };
  /** Set when a reviewer accepts the fix. */
  resolvedAt?: string;
}
export interface ReturnRecord { by: string; at: string; message: string; issueIds: string[]; resubmittedAt?: string }

export type IssueState = 'draft' | 'sent' | 'addressed' | 'not-addressed' | 'resolved';
/** Where an issue stands in the return → revise → resubmit round trip. */
export const issueState = (i: ReviewIssue, ret: ReturnRecord | null): IssueState => {
  if (i.resolvedAt) return 'resolved';
  if (!i.sentAt) return 'draft';
  if (ret?.resubmittedAt && ret.issueIds.includes(i.id)) return i.response?.addressed ? 'addressed' : 'not-addressed';
  return 'sent';
};
export interface RejectRecord { by: string; at: string; reason: string }

/** The record's five sections, by the slug every review surface shares. */
export const RECORD_SECTIONS = [
  { slug: 'project-information', title: 'Project information' },
  { slug: 'research-team', title: 'Research team' },
  { slug: 'study-areas', title: 'Study areas' },
  { slug: 'data-collection', title: 'Data collection' },
  { slug: 'additional-documents', title: 'Additional documents' },
] as const;
export const sectionTitle = (slug?: string | null) =>
  RECORD_SECTIONS.find((s) => s.slug === slug)?.title ?? '';

// The permit detail page tags comments with its own, finer section keys — map them
// onto the record's five (mirrors final-letter's permitSectionAlias).
const SECTION_ALIAS: Record<string, string> = {
  'project-details': 'project-information', schedule: 'project-information',
  'authorized-parks': 'study-areas',
  collection: 'data-collection', laboratory: 'data-collection', specimens: 'data-collection',
  compliance: 'additional-documents', 'uploaded-files': 'additional-documents',
};
/** The record section a comment is about, or null for a general comment. */
export const sectionOf = (c: ReviewComment): string | null => {
  if (!c.section) return null;
  const k = SECTION_ALIAS[c.section] ?? c.section;
  return RECORD_SECTIONS.some((s) => s.slug === k) ? k : null;
};

/** Stable key for a comment — replies and resolution hang off it (seeded comments
 *  included). Same formula as final-letter's replyKey. */
export const commentKey = (c: ReviewComment) => `${c.author}|${c.time}|${c.text.slice(0, 80)}`;

export const todayLabel = () =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const read = <T>(key: string, fallback: T): T => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || 'null');
    return v ?? fallback;
  } catch { return fallback; }
};
const write = (key: string, v: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage unavailable */ }
};

export function reviewStore(permitId: string) {
  const k = {
    comments: `permit-comments-${permitId}`,
    replies: `permit-comment-replies-${permitId}`,
    resolved: `permit-comment-resolved-${permitId}`,
    issues: `permit-issues-${permitId}`,
    returned: `permit-return-${permitId}`,
    rejected: `permit-rejection-${permitId}`,
  };
  return {
    comments: (): ReviewComment[] => { const a = read<unknown>(k.comments, []); return Array.isArray(a) ? a : []; },
    addComment: (c: ReviewComment) => write(k.comments, [c, ...reviewStore(permitId).comments()]),

    replies: (): Record<string, Reply[]> => { const o = read<unknown>(k.replies, {}); return o && typeof o === 'object' ? (o as Record<string, Reply[]>) : {}; },
    addReply: (parent: ReviewComment, r: Reply) => {
      const all = reviewStore(permitId).replies();
      const key = commentKey(parent);
      all[key] = [...(all[key] || []), r];
      write(k.replies, all);
    },

    resolved: (): Set<string> => { const a = read<unknown>(k.resolved, []); return new Set(Array.isArray(a) ? a : []); },
    setResolved: (c: ReviewComment, done: boolean) => {
      const set = reviewStore(permitId).resolved();
      if (done) set.add(commentKey(c)); else set.delete(commentKey(c));
      write(k.resolved, [...set]);
    },

    issues: (): ReviewIssue[] => { const a = read<unknown>(k.issues, []); return Array.isArray(a) ? a : []; },
    saveIssues: (list: ReviewIssue[]) => write(k.issues, list),

    returned: () => read<ReturnRecord | null>(k.returned, null),
    setReturned: (r: ReturnRecord) => write(k.returned, r),
    rejected: () => read<RejectRecord | null>(k.rejected, null),
    setRejected: (r: RejectRecord) => write(k.rejected, r),
  };
}

/** Return the application to the researcher with every draft issue: stamps them
 *  sent, records the return, and sets the status the rest of the app reads
 *  ("Changes requested"). Callers notify the researcher. Returns what was sent. */
export function returnToResearcher(permitId: string, by: string, message: string): ReviewIssue[] {
  const store = reviewStore(permitId);
  const at = todayLabel();
  const drafts = store.issues().filter((i) => !i.sentAt && !i.resolvedAt);
  const ids = new Set(drafts.map((i) => i.id));
  store.saveIssues(store.issues().map((i) => (ids.has(i.id) ? { ...i, sentAt: at, response: undefined } : i)));
  store.setReturned({ by, at, message, issueIds: drafts.map((i) => i.id) });
  try { localStorage.setItem(`permit-status-${permitId}`, 'Changes requested'); } catch {}
  window.dispatchEvent(new CustomEvent('permit-status-changed', { detail: { status: 'Changes requested' } }));
  return drafts;
}

/** The researcher resubmits: stamps the return and puts the application back
 *  under review. */
export function resubmitApplication(permitId: string): void {
  const store = reviewStore(permitId);
  const ret = store.returned();
  if (ret) store.setReturned({ ...ret, resubmittedAt: todayLabel() });
  try { localStorage.setItem(`permit-status-${permitId}`, 'Under review'); } catch {}
  window.dispatchEvent(new CustomEvent('permit-status-changed', { detail: { status: 'Under review' } }));
}
