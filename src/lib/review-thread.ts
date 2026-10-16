// Review notes on a permit application, as the browser stores them. A prototype has
// no backend, so every store is localStorage, keyed per permit. Two kinds of note:
//
//   • COMMENTS — internal, reviewer ↔ reviewer. The SAME thread the permit detail
//     page and the review wizard (final-letter) read and write: comments under
//     permit-comments-${id} (newest first; seeded ones live in permit.ts), replies
//     under permit-comment-replies-${id} keyed by their parent, and resolved
//     parents under permit-comment-resolved-${id}. A comment may carry the record
//     `section` it's about and an `anchor` (a quoted passage).
//   • ISSUES — researcher-facing: what the applicant must change or provide. Drafts
//     until the application is returned; returning stamps them `sentAt` and records
//     the return itself (who, when, an optional message).
//
// Read by the application-record prototype. (final-letter and permit.astro still
// carry their own copies of the comment-store code; same keys, same shapes.)

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
}
export interface ReturnRecord { by: string; at: string; message: string; issueIds: string[] }
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
