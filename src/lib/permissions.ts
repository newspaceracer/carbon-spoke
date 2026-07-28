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
