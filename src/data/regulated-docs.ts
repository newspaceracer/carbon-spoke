// ---------------------------------------------------------------------------
// Regulated document templates — the official CA State Parks forms (DPR65A /
// DPR65B) that a System Administrator keeps current and researchers download
// during the application flow.
//
// Prototype model, same convention the rest of the spoke uses for uploads: a
// file is DATA — its name plus when it last changed — not bytes. The "current"
// file for each form is a shipped SEED overlaid by any admin replacement stored
// in localStorage, so a replacement made in the admin area is the file every
// download location serves (there is exactly one current version per form, and
// no history — a replacement fully supersedes the previous file).
//
// The top level is pure data (types + seeds), so it is safe to import from Astro
// frontmatter. Every localStorage touch lives inside a function — call those
// only from a client <script>.
// ---------------------------------------------------------------------------

export interface RegulatedDoc {
  /** Stable key used in markup + the download locations. */
  id: string;
  /** Official form number the admin sees, e.g. "DPR65A". Optional — not every
   *  regulated form carries a DPR number; codeless forms show by title. */
  code?: string;
  /** Human name of the form. */
  title: string;
  /** One line of context for the admin table. */
  description: string;
  /** Current file name (DATA, not bytes). */
  filename: string;
  /** ISO instant the current file was last set. */
  updatedAt: string;
}

// The versions "shipped" today. Deterministic dates — a seed never stamps "now".
//
// Form-number mapping confirmed against the SCP email inventory (CSPS-52/16 return
// reasons + CSPS-224 signer routing): DPR65A is the Insurance Addendum and DPR65B
// is the Liability Waiver Addendum. The Standard Condition Agreement and the
// Waiver and Indemnity Agreement are the always-required forms and carry no DPR
// number, so they are codeless here.
export const regulatedDocSeeds: RegulatedDoc[] = [
  {
    id: 'standard-condition',
    title: 'Standard condition agreement form',
    description:
      'Always required — the standard conditions every permittee signs and returns.',
    filename: 'standard-condition-agreement.pdf',
    updatedAt: '2025-11-03T00:00:00.000Z',
  },
  {
    id: 'waiver-indemnity',
    title: 'Waiver and indemnity agreement form',
    description:
      'Always required — the liability waiver and indemnification the organization signs.',
    filename: 'waiver-and-indemnity-agreement.pdf',
    updatedAt: '2025-09-18T00:00:00.000Z',
  },
  {
    id: 'dpr65a',
    code: 'DPR65A',
    title: 'Insurance addendum',
    description:
      'Conditional — required for higher-risk activities, from the Additional documents page.',
    filename: 'DPR65A-insurance-addendum.pdf',
    updatedAt: '2025-08-27T00:00:00.000Z',
  },
  {
    id: 'dpr65b',
    code: 'DPR65B',
    title: 'Liability waiver addendum',
    description:
      'Conditional — the per-participant liability waiver, from the Research team page.',
    filename: 'DPR65B-liability-waiver-addendum.pdf',
    updatedAt: '2025-10-12T00:00:00.000Z',
  },
];

const STORE_KEY = 'admin-regulated-docs';

/** Admin replacements, keyed by doc id. Absent id = still on the seed file. */
type Overlay = Record<string, { filename: string; updatedAt: string }>;

function readOverlay(): Overlay {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    return raw && typeof raw === 'object' ? (raw as Overlay) : {};
  } catch {
    return {};
  }
}

/** The current documents: the seeds with any admin replacement applied. */
export function readRegulatedDocs(): RegulatedDoc[] {
  const overlay = readOverlay();
  return regulatedDocSeeds.map((d) => {
    const o = overlay[d.id];
    return o ? { ...d, filename: o.filename, updatedAt: o.updatedAt } : { ...d };
  });
}

/** One current document by id — used by the researcher download locations. */
export function currentDoc(id: string): RegulatedDoc | undefined {
  return readRegulatedDocs().find((d) => d.id === id);
}

/**
 * Replace a form's file. Writes the new name + a fresh timestamp to the overlay
 * and returns the updated record. Fully supersedes the previous file (no
 * history is kept); the caller only reaches here once a valid PDF is chosen, so
 * a rejected upload never mutates the store — the previous file stays current.
 */
export function replaceRegulatedDoc(
  id: string,
  filename: string,
  at: Date = new Date(),
): RegulatedDoc {
  const overlay = readOverlay();
  overlay[id] = { filename, updatedAt: at.toISOString() };
  localStorage.setItem(STORE_KEY, JSON.stringify(overlay));
  return currentDoc(id)!;
}

// ── PDF-only validation ──────────────────────────────────────────────────
export const PDF_ACCEPT = '.pdf';

/** A replacement must be a PDF; anything else is rejected before the store is touched. */
export function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

/** "Nov 3, 2025" — the "last updated" display, in UTC to match the stored instant. */
export function formatDocDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
