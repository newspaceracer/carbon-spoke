// Prototype-local store for administrative USER MANAGEMENT — the role-change
// requests reviewers submit and the account-role overlay the /users console
// writes when it approves one. This is the single source of truth shared BY KEY
// between the profile page (which SUBMITS a request) and the users console
// (which RESOLVES it), the same localStorage convention the rest of the
// prototype uses. Browser-only: imported from client <script> blocks, never
// Astro frontmatter (localStorage / Date exist only in the browser).
import { directory, accountRoleMeta } from './user';
import { districtName } from './district';

export type RequestStatus = 'pending' | 'approved' | 'denied';

/** A user's current global account role. `district` is present only for a
 *  district-SCOPED role (a district lead/assistant is always OF a district). */
export interface AccountRole {
  role: string; // an accountRoleOptions value
  district?: string; // a districtDirectory id
}

/** One role-change request: a user asking to move into a requestable role. */
export interface RoleRequest {
  /** Stable id. */
  id: string;
  /** The directory user who asked (resolve via findUser). */
  userId: string;
  /** A `requestableRoles` value. */
  role: string;
  /** Target district id — required when the requested role is district-scoped. */
  district?: string;
  /** Optional free-text justification. */
  reason: string;
  status: RequestStatus;
  /** Epoch ms — when submitted (and, once decided, when decided). */
  requestedAt: number;
  decidedAt?: number;
}

const REQUESTS_KEY = 'admin-role-requests';
const ROLES_KEY = 'admin-account-roles';

/** Display label for an account-role value (falls back to the raw value). */
export const roleLabel = (value: string) => accountRoleMeta(value)?.label ?? value;

/** Full display of a role + its district when scoped, e.g.
 *  "District lead technical reviewer · North Coast Redwoods District". */
export const roleDisplay = (role: string, district?: string): string => {
  const meta = accountRoleMeta(role);
  const label = meta?.label ?? role;
  return meta?.scoped && district ? `${label} · ${districtName(district)}` : label;
};

// Seed: a few pending requests so the console opens with real work to do. Fixed
// ids + timestamps keep the build deterministic (no Date at seed time). Every
// person + reason is invented, per the house no-real-data rule.
const seedRequests = (): RoleRequest[] => [
  {
    id: 'req-seed-santos',
    userId: 'm-santos',
    role: 'district-lead',
    district: 'north-coast-redwoods',
    reason:
      'I have led the Prairie Creek reviews for two seasons and would like to formally step into the district lead role.',
    status: 'pending',
    requestedAt: 1_710_000_000_000,
  },
  {
    id: 'req-seed-cho',
    userId: 'd-cho',
    role: 'hq-technical',
    reason: 'Moving to the Office of Scientific Review — I need statewide review access.',
    status: 'pending',
    requestedAt: 1_710_200_000_000,
  },
  {
    id: 'req-seed-tran',
    userId: 'l-tran',
    role: 'district-assistant',
    district: 'north-coast-redwoods',
    reason: 'Joining North Coast Redwoods District as a supporting analyst.',
    status: 'pending',
    requestedAt: 1_710_400_000_000,
  },
];

// ── Requests ────────────────────────────────────────────────────────────────
/** All requests, seeding the store on first-ever access. */
export const loadRequests = (): RoleRequest[] => {
  if (localStorage.getItem(REQUESTS_KEY) === null) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(seedRequests()));
  }
  try {
    const raw = JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

const saveRequests = (list: RoleRequest[]) =>
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));

/** The open inbox — newest first. */
export const pendingRequests = (): RoleRequest[] =>
  loadRequests()
    .filter((r) => r.status === 'pending')
    .sort((a, b) => b.requestedAt - a.requestedAt);

/** A user's open request, if any (a user holds at most one pending at a time). */
export const pendingForUser = (userId: string): RoleRequest | undefined =>
  loadRequests().find((r) => r.userId === userId && r.status === 'pending');

/** Submit a request, replacing any existing pending one for the same user. The
 *  district is retained only for a district-scoped role. */
export const submitRequest = (
  userId: string,
  role: string,
  reason: string,
  district?: string,
): RoleRequest => {
  const scoped = !!accountRoleMeta(role)?.scoped;
  const list = loadRequests().filter((r) => !(r.userId === userId && r.status === 'pending'));
  const req: RoleRequest = {
    id: `req-${userId}-${Date.now()}`,
    userId,
    role,
    ...(scoped && district ? { district } : {}),
    reason,
    status: 'pending',
    requestedAt: Date.now(),
  };
  list.push(req);
  saveRequests(list);
  return req;
};

/** Resolve a request. Approving promotes the user's account role (carrying the
 *  request's district for a scoped role); denying just closes the request. */
export const decideRequest = (id: string, decision: 'approved' | 'denied'): void => {
  const list = loadRequests();
  const req = list.find((r) => r.id === id);
  if (!req) return;
  req.status = decision;
  req.decidedAt = Date.now();
  saveRequests(list);
  if (decision === 'approved') setAccountRole(req.userId, req.role, req.district);
};

// ── Account-role overlay ──────────────────────────────────────────────────────
// A user's *current* account role is the seeded directory value unless an admin
// has changed it here; the overlay is a small userId → AccountRole map.
const loadRoleOverlay = (): Record<string, AccountRole> => {
  try {
    const raw = JSON.parse(localStorage.getItem(ROLES_KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
};

/** A user's current account role (overlay over the seeded default), structured. */
export const accountRoleOf = (userId: string): AccountRole => {
  const overlay = loadRoleOverlay()[userId];
  if (overlay && typeof overlay === 'object' && overlay.role) return overlay;
  const seed = directory.find((u) => u.id === userId);
  return seed ? { role: seed.accountRole, district: seed.district } : { role: 'reviewer' };
};

/** A user's current account role as a display string (with district if scoped). */
export const accountRoleDisplay = (userId: string): string => {
  const { role, district } = accountRoleOf(userId);
  return roleDisplay(role, district);
};

/** Set (admin action) a user's account role — district kept only when scoped. */
export const setAccountRole = (userId: string, role: string, district?: string): void => {
  const scoped = !!accountRoleMeta(role)?.scoped;
  const overlay = loadRoleOverlay();
  overlay[userId] = { role, ...(scoped && district ? { district } : {}) };
  localStorage.setItem(ROLES_KEY, JSON.stringify(overlay));
};
