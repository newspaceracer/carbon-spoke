// ---------------------------------------------------------------------------
// Permissions — the permit-role layer of the two-layer actor model.
//
// The prototype identity (readIdentity(), maintenance.ts) sets the USER ROLE; this
// module owns the PER-PERMIT permit-role: Responsible Agent, Supporting Agent,
// Second Signer, or Not assigned. A user holds exactly one review permit-role per
// permit, so the demo control that writes it is single-select and CONSTRAINED —
// it offers only the permit-roles the active identity is eligible for on this
// permit's type. That constraint is the eligibility table in
// `docs/permissions-matrix.md` §2 (RA/SA) plus §3 (the second-signer pools),
// encoded once here.
//
// This is the foundation the IR permission resolver (Story 9.1) extends: role ×
// permit-role × status × type → per-section {read | update | disabled | hidden}.
// Prototype-only: the permit-role is a testing hat persisted in localStorage
// (`demo-permit-role-${id}`), the same convention as `permit-review-started-${id}`.
// ---------------------------------------------------------------------------
import type { Identity } from './maintenance';

/** A per-permit review permit-role (plus the second-signer capability + unassigned). */
export type PermitRole = 'responsible' | 'supporting' | 'second-signer' | 'none';

/** A permit's district span. Stored per permit (Story 8); derived from parks today. */
export type PermitType = 'single' | 'multi';

/** Human labels for the demo control + anywhere a permit-role is shown. */
export const permitRoleLabel: Record<PermitRole, string> = {
  responsible: 'Responsible Agent',
  supporting: 'Supporting Agent',
  'second-signer': 'Second Signer',
  none: 'Not assigned',
};

// The four internal reviewer identities. Researcher / pending / anon are not
// reviewers and hold no review permit-role.
const REVIEWER_IDENTITIES: Identity[] = ['admin', 'hq-technical', 'district-lead', 'district-assistant'];
export const isReviewer = (identity: Identity): boolean => REVIEWER_IDENTITIES.includes(identity);

// ── Eligibility (permissions-matrix.md §2) ──────────────────────────────────
// | Role              | Multi-district | Single-district |
// | System Admin      | RA or SA       | RA or SA        |
// | HQ Technical      | RA or SA       | SA only         |
// | District Lead     | SA only        | RA or SA        |
// | District Assistant| SA only        | SA only         |
function canBeResponsible(identity: Identity, type: PermitType): boolean {
  switch (identity) {
    case 'admin': return true;
    case 'hq-technical': return type === 'multi';
    case 'district-lead': return type === 'single';
    default: return false; // district-assistant + non-reviewers: never RA
  }
}

// Every reviewer may be a Supporting Agent, in both permit types.
const canBeSupporting = (identity: Identity): boolean => isReviewer(identity);

// ── Second-signer pools (permissions-matrix.md §3) ──────────────────────────
// Multi-district: an HQ admin or HQ reviewer. Single-district: any district
// member (lead/assistant), or an external person by email (no identity — not
// offered as a hat). System Admin is a super-user, eligible either way. The demo
// control exposes this hat so the signing step can be tested even when the second
// signer isn't otherwise a reviewer on the permit.
function canBeSecondSigner(identity: Identity, type: PermitType): boolean {
  if (identity === 'admin') return true;
  return type === 'multi'
    ? identity === 'hq-technical'
    : identity === 'district-lead' || identity === 'district-assistant';
}

/** The permit-roles the active identity may hold on a permit of this type — the
 *  option set for the constrained demo control (always ends with 'none'). Empty
 *  for non-reviewer identities (they get no permit-role control). */
export function eligiblePermitRoles(identity: Identity, type: PermitType): PermitRole[] {
  if (!isReviewer(identity)) return [];
  const roles: PermitRole[] = [];
  if (canBeResponsible(identity, type)) roles.push('responsible');
  if (canBeSupporting(identity)) roles.push('supporting');
  if (canBeSecondSigner(identity, type)) roles.push('second-signer');
  roles.push('none');
  return roles;
}

// ── Per-permit persistence (prototype-local) ────────────────────────────────
const permitRoleKey = (permitId: string) => `demo-permit-role-${permitId}`;

const isPermitRole = (v: unknown): v is PermitRole =>
  v === 'responsible' || v === 'supporting' || v === 'second-signer' || v === 'none';

/** The active identity's selected permit-role on this permit (default 'none'). */
export function readPermitRole(permitId: string): PermitRole {
  try {
    const v = localStorage.getItem(permitRoleKey(permitId));
    if (isPermitRole(v)) return v;
  } catch {}
  return 'none';
}

export function writePermitRole(permitId: string, role: PermitRole): void {
  try {
    localStorage.setItem(permitRoleKey(permitId), role);
  } catch {}
}

// ═══════════════════════════════════════════════════════════════════════════
// IR permission resolver (Story 9.1) — the single function the whole Internal
// Review enforces from. It returns one Access verdict for an IR section given the
// user's role, permit-role, permit status, and permit type, straight from
// `docs/permissions-matrix.md` §5 (reconciled with the decisions). Every IR
// section (Stories 9.2–9.5) reads this — no section carries its own parallel rules.
// ═══════════════════════════════════════════════════════════════════════════

/** The canonical permit statuses (short labels stay in the UI; this is the typed
 *  axis the resolver keys off). */
export type PermitStatus =
  | 'draft'
  | 'waiting-for-review'
  | 'under-review'
  | 'returned'
  | 'out-for-signature'
  | 'waiting-for-annual-report'
  | 'active'
  | 'expired'
  | 'rejected'
  | 'withdrawn';

/** The IR sections the resolver governs (permissions-matrix.md §5.3). */
export type IRSection =
  | 'form'               // the application
  | 'start-review'       // RA action: Waiting for review → Under review
  | 'supporting-review'  // SA informational start/complete
  | 'responsible-agent'  // RA assignment
  | 'supporting-agents'  // SA assignment
  | 'tags'
  | 'dates-ceqa'
  | 'approve'            // decision → Out for signature
  | 'return'             // decision → Returned to submitter
  | 'reject'             // decision → Rejected
  | 'sign'               // 1st signature (RA) / 2nd signature (second signer)
  | 'documents'          // supporting documents
  | 'internal-notes'
  | 'hq-conditions'
  | 'district-conditions'
  | 'parks';

/** One permission verdict. Update implies Read. Disabled = visible but inert.
 *  Hidden = not rendered. Cannot-access = the whole record isn't reachable. */
export type Access = 'update' | 'read' | 'disabled' | 'hidden' | 'cannot-access';

/** Normalize a status label (current code labels OR the new canonical names) to a
 *  typed PermitStatus. 'Changes requested' is the legacy label for 'Returned to
 *  submitter'. Unknown → 'under-review' (safe: the review-editing default). */
export function normalizeStatus(label: string | null | undefined): PermitStatus {
  switch ((label ?? '').trim()) {
    case 'Draft': return 'draft';
    case 'Waiting for review': return 'waiting-for-review';
    case 'Under review': return 'under-review';
    case 'Returned to submitter':
    case 'Changes requested': return 'returned';
    case 'Out for signature': return 'out-for-signature';
    case 'Waiting for annual report': return 'waiting-for-annual-report';
    case 'Active': return 'active';
    case 'Expired': return 'expired';
    case 'Rejected': return 'rejected';
    case 'Withdrawn': return 'withdrawn';
    default: return 'under-review';
  }
}

export interface ResolveContext {
  identity: Identity;
  permitRole: PermitRole;
  status: PermitStatus;
  type: PermitType;
  section: IRSection;
}

// Sections that are workflow ACTIONS (not content) — hidden in terminal statuses.
const WORKFLOW_ACTIONS = new Set<IRSection>([
  'start-review', 'supporting-review', 'approve', 'return', 'reject', 'sign',
]);
// District reviewers may READ these only when assigned (RA/SA); HQ/Admin read any.
const SCOPED_READ = new Set<IRSection>(['dates-ceqa', 'sign']);

/**
 * Resolve the Access verdict for one IR section. Layered: non-reviewer → CA;
 * global status gates (Draft/Withdrawn/Rejected); the §5.3 core cell conditioned
 * on permit-role; then the role overlays (§5.2).
 */
export function resolveIR(ctx: ResolveContext): Access {
  const { identity, permitRole, status, section } = ctx;

  // §6 — the Internal Review is not accessible to non-reviewers (researcher /
  // pending / anon). Researcher record access is handled separately (Story 11).
  if (!isReviewer(identity)) return 'cannot-access';

  const isAdmin = identity === 'admin';
  const isDistrict = identity === 'district-lead' || identity === 'district-assistant';
  const isRA = permitRole === 'responsible';
  const isSA = permitRole === 'supporting';
  const isSecondSigner = permitRole === 'second-signer';
  const isAssigned = isRA || isSA;

  // Admin is the super-user (Update Any, not bound by permit-role) — treat it as
  // holding both RA and SA for update-gating. Hidden cells stay hidden (you can't
  // resurrect a workflow action a status has closed).
  const raU = isRA || isAdmin;      // "U if RA"
  const saOrRaU = isRA || isSA || isAdmin; // "U if RA · U if SA"

  // ── §5.1 global status gates ───────────────────────────────────────────────
  // Draft is the applicant's — no reviewer can access the IR.
  if (status === 'draft') return 'cannot-access';
  // Withdrawn: district reviewers can't access; HQ/Admin read only.
  if (status === 'withdrawn') return isDistrict ? 'cannot-access' : 'read';
  // Rejected: terminal — content is read-only; decision/action sections are gone.
  if (status === 'rejected') return WORKFLOW_ACTIONS.has(section) ? 'hidden' : 'read';

  // ── §5.3 core cell (WfR..Exp), conditioned on permit-role ──────────────────
  let access = coreCell(section, status, { isRA, isSA, isAdmin, isSecondSigner, raU, saOrRaU });

  // ── §5.2 role overlays ─────────────────────────────────────────────────────
  // District reviewers read Dates/CEQA + signing sections only when assigned; if
  // not assigned those sections aren't even readable.
  if (isDistrict && !isAssigned && SCOPED_READ.has(section) && access !== 'hidden') {
    access = 'hidden';
  }
  // System Admin may edit the application form even once Active (super-user).
  if (isAdmin && section === 'form' &&
      (status === 'active' || status === 'expired' || status === 'waiting-for-annual-report')) {
    access = 'update';
  }

  return access;
}

/** Build a section→Access accessor bound to one permit's live context. The caller
 *  passes the active identity (from readIdentity, which lives in maintenance.ts to
 *  keep this module free of DOM/runtime deps), the permit id, the banner's
 *  `data-permit-type`, and the current status label. Every IR section on the permit
 *  page resolves through the returned function. */
export function sectionAccessor(
  identity: Identity,
  permitId: string,
  typeAttr?: string | null,
  statusLabel?: string | null,
): (section: IRSection) => Access {
  const permitRole = readPermitRole(permitId);
  const type: PermitType = typeAttr === 'multi' ? 'multi' : 'single';
  const status = normalizeStatus(statusLabel);
  return (section) => resolveIR({ identity, permitRole, status, type, section });
}

interface CellFlags {
  isRA: boolean; isSA: boolean; isAdmin: boolean; isSecondSigner: boolean;
  raU: boolean;      // may update where the cell says "U if RA"
  saOrRaU: boolean;  // may update where the cell says "U if RA · U if SA"
}

// The §5.3 table, one section at a time. Columns: waiting-for-review (WfR),
// under-review (UR), returned (Ret), out-for-signature (OfS),
// waiting-for-annual-report (WfAR), active (Act), expired (Exp).
function coreCell(section: IRSection, status: PermitStatus, f: CellFlags): Access {
  const upd = (cond: boolean, base: Access = 'read'): Access => (cond ? 'update' : base);

  switch (section) {
    case 'form':
      // R everywhere; U if RA only in Under review; Disabled control in Returned.
      if (status === 'under-review') return upd(f.raU);
      if (status === 'returned') return f.raU ? 'disabled' : 'read';
      return 'read';

    case 'start-review':
      // Shown to the RA (or Admin) only in Waiting for review; done/hidden after.
      return status === 'waiting-for-review' ? (f.isRA || f.isAdmin ? 'update' : 'hidden') : 'hidden';

    case 'supporting-review':
      // SA-only informational action, only during Under review.
      return status === 'under-review' && f.isSA ? 'update' : 'hidden';

    case 'responsible-agent':
      return status === 'under-review' ? upd(f.raU) : 'read';

    case 'supporting-agents':
      // U if RA in Under review AND Active; read otherwise.
      return status === 'under-review' || status === 'active' ? upd(f.raU) : 'read';

    case 'tags':
      // Read in Waiting for review; update (any reviewer with access) thereafter.
      return status === 'waiting-for-review' ? 'read' : 'update';

    case 'dates-ceqa':
      if (status === 'under-review') return upd(f.raU);
      if (status === 'returned') return f.raU ? 'disabled' : 'read';
      return 'read';

    case 'approve':
    case 'return':
    case 'reject':
      // Decision actions: shown & updatable by the RA in Under review; disabled for
      // the RA in Returned; hidden for everyone else and in every other status.
      if (status === 'under-review') return f.raU ? 'update' : 'hidden';
      if (status === 'returned') return f.raU ? 'disabled' : 'hidden';
      return 'hidden';

    case 'sign':
      // 1st signature (RA) in Under review; 2nd signature (second signer) in Out
      // for signature; hidden otherwise.
      if (status === 'under-review') return f.raU ? 'update' : 'hidden';
      if (status === 'out-for-signature') return f.isSecondSigner || f.isAdmin ? 'update' : 'hidden';
      return 'hidden';

    case 'documents':
      // R in WfR; RA/SA-gated update in Under review; ungated update thereafter.
      if (status === 'waiting-for-review') return 'read';
      if (status === 'under-review') return upd(f.saOrRaU);
      return 'update';

    case 'internal-notes':
      // R in WfR; update by any reviewer with access thereafter (not role-gated).
      return status === 'waiting-for-review' ? 'read' : 'update';

    case 'hq-conditions':
    case 'district-conditions':
      // RA/SA-gated update during Under review and Returned; read once signing/after.
      if (status === 'under-review' || status === 'returned') return upd(f.saOrRaU);
      return 'read';

    case 'parks':
      if (status === 'under-review') return upd(f.raU); // U if RA or Admin
      if (status === 'returned') return f.raU ? 'disabled' : 'read';
      return 'read';

    default:
      return 'read';
  }
}
