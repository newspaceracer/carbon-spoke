// Review-order document list for the document viewer.
//
// The permit's uploaded files (permit.additionalDocs.files) carry the long,
// form-facing type names ("Additional Permit Supporting Documentation"). The
// viewer's picker shows a SHORT label per type instead, and lists the files in a
// fixed REVIEW order — the documents that inform the special conditions first
// (proposal, study-area map, permit details), then the résumés, then the signed
// forms. Order carries the meaning; there is no "informs conditions" badge.
//
// Used by the review wizard (final-letter.astro) and the review-layout studies so
// every viewer reads the same way.

import type { permit } from './permit';

type UploadedFile = (typeof permit)['additionalDocs']['files'][number];

export interface ReviewDocument {
  href: string;
  /** Short picker label (by document type). */
  label: string;
  /** Original file name — shown beside the picker once a document is chosen. */
  filename: string;
  size?: string;
  pages?: number;
  type?: string;
}

/** Stored document type → short picker label, in review order. */
const REVIEW_ORDER: Array<[type: string, label: string]> = [
  ['Study Proposal', 'Study proposal'],
  ['Study Area Supporting Documentation', 'Study area map'],
  ['Additional Permit Supporting Documentation', 'Permit details'],
  ['Principal Investigator Resume', 'PI résumé'],
  ['Submitter Resume', 'Submitter résumé'],
  ['Standard Conditions Agreement Form', 'Conditions agreement'],
  ['Waiver and Indemnity Agreement Form', 'Waiver agreement'],
  ['Liability Waiver Addendum (DPR65B)', 'Waiver addendum'],
];

const rankOf = (type: string | undefined) => {
  const i = REVIEW_ORDER.findIndex(([t]) => t === type);
  return i === -1 ? REVIEW_ORDER.length : i;
};

/** A stored type (Title Case, e.g. "Principal Investigator Resume") in the app's
 *  sentence case for display. Form codes and acronyms (DPR65B, CEQA) keep theirs. */
export const documentTypeText = (type: string | undefined) =>
  (type ?? '').split(' ').map((w, i) => (i === 0 || /\d|[A-Z]{2,}/.test(w) ? w : w.toLowerCase())).join(' ');

/** Short label for a stored type; unknown types fall back to the type itself. */
export const documentLabel = (type: string | undefined, filename: string) =>
  REVIEW_ORDER.find(([t]) => t === type)?.[1] ?? type ?? filename;

/** The viewer's document list: labeled and in review order (unknown types last, in upload order). */
export function reviewDocuments(files: readonly UploadedFile[]): ReviewDocument[] {
  return files
    .map((f, i) => ({ f, i }))
    .sort((a, b) => rankOf(a.f.type) - rankOf(b.f.type) || a.i - b.i)
    .map(({ f }) => ({
      href: f.href,
      label: documentLabel(f.type, f.name),
      filename: f.name,
      size: f.size,
      pages: f.pages,
      type: f.type,
    }));
}
