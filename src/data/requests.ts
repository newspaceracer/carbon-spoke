// Prototype-local store for administrative USER MANAGEMENT — the role-change
// requests reviewers submit and the account-role overlay the /users console
// writes when it approves one. This is the single source of truth shared BY KEY
// between the profile page (which SUBMITS a request) and the users console
// (which RESOLVES it), the same localStorage convention the rest of the
// prototype uses. Browser-only: imported from client <script> blocks, never
// Astro frontmatter (localStorage / Date exist only in the browser).
import { directory, publicDirectory, accountRoleMeta } from './user';
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

// 'none' is the roleless sentinel — a verified account that has no reviewer role
// yet (see accountRoleOf). It's never a selectable role, only a display state.
export const NO_ROLE = 'none';

/** Display label for an account-role value (falls back to the raw value). */
export const roleLabel = (value: string) =>
  value === NO_ROLE ? 'No role' : accountRoleMeta(value)?.label ?? value;

/** Full display of a role + its district when scoped, e.g.
 *  "District lead technical reviewer · North Coast Redwoods District". */
export const roleDisplay = (role: string, district?: string): string => {
  if (role === NO_ROLE) return 'No role assigned';
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

/** A user's most recent request of ANY status — drives the pending home's state
 *  (none / pending / denied / granted). */
export const latestRequestForUser = (userId: string): RoleRequest | undefined =>
  loadRequests()
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.requestedAt - a.requestedAt)[0];

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
  if (seed) return { role: seed.accountRole, district: seed.district };
  // A self-registered account with no role overlay is roleless — pending an
  // admin's grant. (Invited users always get an overlay, so they never land here.)
  if (addedUsers().some((u) => u.id === userId)) return { role: NO_ROLE };
  return { role: 'hq-technical' }; // unknown id — legacy fallback
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

/** Whether a user has an actual reviewer role yet — a seeded directory role or an
 *  admin-granted overlay. False for a self-registered account still awaiting one. */
export const hasAssignedRole = (userId: string): boolean =>
  !!loadRoleOverlay()[userId]?.role || directory.some((u) => u.id === userId);

/** A user's current affiliation. The two district-scoped roles are affiliated
 *  with their district; every other role (HQ technical reviewer / admin) is
 *  headquarters, shown as "HQ". Derived from the CURRENT account role, so it
 *  follows a role change immediately. */
export const affiliationOf = (userId: string): string => {
  const { role, district } = accountRoleOf(userId);
  if (role === NO_ROLE) return '—'; // roleless — no affiliation until granted a role
  const scoped = !!accountRoleMeta(role)?.scoped;
  return scoped && district ? districtName(district) : 'HQ';
};

// ── Expertise overlay ──────────────────────────────────────────────────────────
// Areas of expertise (expertiseOptions values) per user — the seeded directory
// value unless an admin has changed it here. HQ technical reviewers must carry ≥1
// (enforced in the /users add + manage flows, not here).
const EXPERTISE_KEY = 'admin-user-expertise';

const loadExpertiseOverlay = (): Record<string, string[]> => {
  try {
    const raw = JSON.parse(localStorage.getItem(EXPERTISE_KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
};

/** A user's current expertise (overlay over the seeded default). */
export const expertiseOf = (userId: string): string[] => {
  const overlay = loadExpertiseOverlay()[userId];
  if (Array.isArray(overlay)) return overlay;
  return directory.find((u) => u.id === userId)?.expertise ?? [];
};

/** Set (admin action) a user's areas of expertise. */
export const setExpertise = (userId: string, values: string[]): void => {
  const overlay = loadExpertiseOverlay();
  overlay[userId] = [...values];
  localStorage.setItem(EXPERTISE_KEY, JSON.stringify(overlay));
};

// ── Added users & invitations ────────────────────────────────────────────────
// Users created from the /users console or a district console. Their identity
// lives here; their role + expertise are written to the overlays above (so
// accountRoleOf / expertiseOf / affiliationOf resolve them the same way they
// resolve seeded users).
//
// A created user starts as an INVITATION — `status: 'invited'` — until they
// accept and become 'active'. This is the account axis of the same "who is
// pending?" visibility the console needs; a district member referencing an
// invited user simply shows as pending there too. Seeded directory users have
// no record here, so they are always active.
const ADDED_KEY = 'admin-added-users';

export type UserStatus = 'invited' | 'active';

export interface AddedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** 'invited' until the user accepts; then 'active'. */
  status: UserStatus;
  /** Epoch ms the invitation was sent (re-stamped on resend). */
  invitedAt: number;
  /** District id this user was invited INTO, when invited from a district
   *  console — context for the pending list. Absent for a plain account invite. */
  invitedTo?: string;
}

/** Normalize a stored record. Records written by an earlier build have no
 *  status/invitedAt — they predate invitations, so they read as already active. */
const normalizeAdded = (u: any): AddedUser | null => {
  if (!u || typeof u.id !== 'string') return null;
  return {
    id: u.id,
    name: u.name ?? '',
    email: u.email ?? '',
    phone: u.phone ?? '',
    status: u.status === 'invited' ? 'invited' : 'active',
    invitedAt: typeof u.invitedAt === 'number' ? u.invitedAt : 0,
    ...(typeof u.invitedTo === 'string' ? { invitedTo: u.invitedTo } : {}),
  };
};

export const addedUsers = (): AddedUser[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(ADDED_KEY) || '[]');
    return Array.isArray(raw) ? (raw.map(normalizeAdded).filter(Boolean) as AddedUser[]) : [];
  } catch {
    return [];
  }
};

const saveAdded = (list: AddedUser[]) => localStorage.setItem(ADDED_KEY, JSON.stringify(list));

/** Invite a user into the system: store their identity as a PENDING account,
 *  then stamp their role + expertise into the shared overlays so they resolve
 *  everywhere. `invitedTo` records the district an invite came from, if any.
 *  Returns the new user's id. */
export const inviteUser = (input: {
  name: string;
  email: string;
  phone: string;
  role: string;
  district?: string;
  expertise: string[];
  invitedTo?: string;
}): string => {
  const id = `user-${Date.now()}`;
  const list = addedUsers();
  list.push({
    id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    status: 'invited',
    invitedAt: Date.now(),
    ...(input.invitedTo ? { invitedTo: input.invitedTo } : {}),
  });
  saveAdded(list);
  setAccountRole(id, input.role, input.district);
  setExpertise(id, input.expertise);
  return id;
};

/** Self-service registration: a person creates their OWN account with a verified
 *  parks.ca.gov email. Unlike inviteUser, it stamps NO role — the account is
 *  active (email verified) but roleless until an admin approves a role request.
 *  Returns the new user's id. */
export const selfRegister = (input: { name: string; email: string; phone?: string }): string => {
  const id = `user-${Date.now()}`;
  const list = addedUsers();
  list.push({
    id,
    name: input.name,
    email: input.email,
    phone: input.phone ?? '',
    status: 'active', // email verified — but no role (see accountRoleOf → NO_ROLE)
    invitedAt: Date.now(),
  });
  saveAdded(list);
  return id;
};

/** A user's invitation status. Seeded directory users are always active; an
 *  added user carries its own status. */
export const userStatus = (userId: string): UserStatus =>
  addedUsers().find((u) => u.id === userId)?.status ?? 'active';

/** Everyone still pending acceptance — newest invite first. */
export const pendingInvites = (): AddedUser[] =>
  addedUsers()
    .filter((u) => u.status === 'invited')
    .sort((a, b) => b.invitedAt - a.invitedAt);

/** Mark an invitation accepted — the user becomes active. */
export const acceptInvite = (userId: string): void => {
  const list = addedUsers();
  const u = list.find((x) => x.id === userId);
  if (!u || u.status === 'active') return;
  u.status = 'active';
  saveAdded(list);
};

/** Re-send an invitation — re-stamps the sent time. */
export const resendInvite = (userId: string): void => {
  const list = addedUsers();
  const u = list.find((x) => x.id === userId);
  if (!u) return;
  u.invitedAt = Date.now();
  saveAdded(list);
};

/** Revoke an invitation — removes the pending account entirely. A district
 *  member referencing it is dropped on that console's next load (memberOk). */
export const revokeInvite = (userId: string): void => {
  saveAdded(addedUsers().filter((u) => u.id !== userId));
};

// ── Contact overlay (admin-editable name + phone) ────────────────────────────
// An admin can correct a user's NAME (first + last) and PHONE from the /users
// console — but NEVER their email, which is the identity verified at sign-in.
// (A public user's phone is self-service, so the console only writes phone for
// internal accounts — but the overlay itself is neutral about who it's for.)
// Like the role / expertise overlays, this is a small userId → override map
// layered over the seeded identity, so an edit propagates everywhere resolveUser
// is read (the console tables, district rosters, permit rows).
const CONTACT_KEY = 'admin-user-contact';

interface ContactOverride {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const loadContactOverlay = (): Record<string, ContactOverride> => {
  try {
    const raw = JSON.parse(localStorage.getItem(CONTACT_KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
};

/** Set (admin action) a user's editable contact fields — first/last name and/or
 *  phone. Email is not editable here (it verifies the account at sign-in). */
export const setContact = (
  userId: string,
  contact: { firstName?: string; lastName?: string; phone?: string },
): void => {
  const overlay = loadContactOverlay();
  overlay[userId] = { ...overlay[userId], ...contact };
  localStorage.setItem(CONTACT_KEY, JSON.stringify(overlay));
};

/** A resolved identity — the two editable name parts plus the composed full name. */
export interface ResolvedUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
}

/** Split a legacy single `name` into first + last (first token vs the rest). */
const splitName = (name: string): { firstName: string; lastName: string } => {
  const parts = (name || '').trim().split(/\s+/);
  return parts.length <= 1
    ? { firstName: parts[0] ?? '', lastName: '' }
    : { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

/** Apply any admin contact override (name parts / phone) over a base identity,
 *  recomposing the full name from the resulting first + last. */
const withContact = (base: { id: string; firstName: string; lastName: string; email: string; phone: string }): ResolvedUser => {
  const c = loadContactOverlay()[base.id] ?? {};
  const firstName = c.firstName ?? base.firstName;
  const lastName = c.lastName ?? base.lastName;
  return {
    id: base.id,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email: base.email,
    phone: c.phone ?? base.phone,
  };
};

/** Resolve any user's identity — seeded staff directory, PUBLIC directory, OR an
 *  added user — with any admin contact override applied. */
export const resolveUser = (userId: string): ResolvedUser | undefined => {
  const seed = directory.find((u) => u.id === userId);
  if (seed) return withContact(seed);
  const pub = publicDirectory.find((u) => u.id === userId);
  if (pub) return withContact(pub);
  const added = addedUsers().find((u) => u.id === userId);
  if (added) {
    const { firstName, lastName } = splitName(added.name);
    return withContact({ id: added.id, firstName, lastName, email: added.email, phone: added.phone });
  }
  return undefined;
};

/** Every INTERNAL user the console lists — seeded staff directory plus added
 *  users, with contact overrides applied. Identity only; role / expertise /
 *  affiliation are resolved per row via the accessors. */
export const listUsers = (): { id: string; name: string; email: string }[] =>
  [...directory, ...addedUsers()].map((u) => {
    const r = resolveUser(u.id)!;
    return { id: r.id, name: r.name, email: r.email };
  });

/** Every PUBLIC user the console lists — the applicant/researcher directory,
 *  with contact overrides applied. `role` is the account state (public-user /
 *  inactive); `lastSeen` is the epoch ms of last activity. */
export const listPublicUsers = (): {
  id: string;
  name: string;
  email: string;
  role: string;
  lastSeen: number;
}[] =>
  publicDirectory.map((u) => {
    const r = resolveUser(u.id)!;
    return { id: r.id, name: r.name, email: r.email, role: publicRoleOf(u.id), lastSeen: u.lastSeen };
  });

// ── Public account role overlay (public-user / inactive) ─────────────────────
// A public account holds one of exactly two states. The seeded default lives in
// publicDirectory; an admin's change is layered here, same as the other overlays.
const PUBLIC_ROLE_KEY = 'admin-public-role';

const loadPublicRoleOverlay = (): Record<string, string> => {
  try {
    const raw = JSON.parse(localStorage.getItem(PUBLIC_ROLE_KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
};

/** A public user's current account state (overlay over the seeded default). */
export const publicRoleOf = (userId: string): string =>
  loadPublicRoleOverlay()[userId] ?? publicDirectory.find((u) => u.id === userId)?.role ?? 'public-user';

/** Set (admin action) a public user's account state — 'public-user' or 'inactive'. */
export const setPublicRole = (userId: string, role: string): void => {
  const overlay = loadPublicRoleOverlay();
  overlay[userId] = role;
  localStorage.setItem(PUBLIC_ROLE_KEY, JSON.stringify(overlay));
};

// ── Account status overlay (active / inactive) ───────────────────────────────
// An INTERNAL account can be DEACTIVATED — it keeps its role and history but
// loses access (can't sign in). This is distinct from the reviewer role: a
// deactivated district lead is still a district lead, just switched off. Setting
// it is an admin action (approving a deactivation request, or directly in the
// /users console). Default is active; the overlay records only the exceptions.
const ACCOUNT_STATUS_KEY = 'admin-account-status';

export type AccountStatus = 'active' | 'inactive';

const loadAccountStatusOverlay = (): Record<string, AccountStatus> => {
  try {
    const raw = JSON.parse(localStorage.getItem(ACCOUNT_STATUS_KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
};

/** Whether an internal account is active or deactivated (default active). */
export const accountStatusOf = (userId: string): AccountStatus =>
  loadAccountStatusOverlay()[userId] === 'inactive' ? 'inactive' : 'active';

/** Set (admin action) an internal account's active/inactive status. */
export const setAccountStatus = (userId: string, status: AccountStatus): void => {
  const overlay = loadAccountStatusOverlay();
  if (status === 'active') delete overlay[userId];
  else overlay[userId] = 'inactive';
  localStorage.setItem(ACCOUNT_STATUS_KEY, JSON.stringify(overlay));
};

// ── Account deactivation requests (district lead → admin) ────────────────────
// A district lead can't deactivate an account themselves — account lifecycle is
// admin-held, and deactivation is GLOBAL (it revokes access everywhere, beyond a
// single district's scope). So when a member leaves, the lead REMOVES them from
// the district (that's district-scoped, done in place) and separately REQUESTS
// deactivation of their account. The request lands in the admin inbox on /users;
// approving it flips the account to inactive. Same request/approve shape as the
// role-change RoleRequest.
export interface DeactivationRequest {
  id: string;
  /** The account to deactivate (resolve via resolveUser). */
  userId: string;
  /** Who asked — the requesting lead's user id (resolve via resolveUser). */
  requestedBy: string;
  /** District the request was raised from, for admin context. */
  districtId?: string;
  reason: string;
  status: RequestStatus;
  requestedAt: number;
  decidedAt?: number;
}

const DEACTIVATION_KEY = 'admin-deactivation-requests';

const loadDeactivations = (): DeactivationRequest[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(DEACTIVATION_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

const saveDeactivations = (list: DeactivationRequest[]) =>
  localStorage.setItem(DEACTIVATION_KEY, JSON.stringify(list));

/** The open deactivation inbox — newest first. */
export const pendingDeactivations = (): DeactivationRequest[] =>
  loadDeactivations()
    .filter((r) => r.status === 'pending')
    .sort((a, b) => b.requestedAt - a.requestedAt);

/** A user's open deactivation request, if any (one pending at a time). */
export const pendingDeactivationForUser = (userId: string): DeactivationRequest | undefined =>
  loadDeactivations().find((r) => r.userId === userId && r.status === 'pending');

/** Submit a deactivation request, replacing any existing pending one for the
 *  same user. Callers guard against requesting an already-inactive account. */
export const submitDeactivation = (input: {
  userId: string;
  requestedBy: string;
  districtId?: string;
  reason: string;
}): DeactivationRequest => {
  const list = loadDeactivations().filter((r) => !(r.userId === input.userId && r.status === 'pending'));
  const req: DeactivationRequest = {
    id: `deact-${input.userId}-${Date.now()}`,
    userId: input.userId,
    requestedBy: input.requestedBy,
    ...(input.districtId ? { districtId: input.districtId } : {}),
    reason: input.reason,
    status: 'pending',
    requestedAt: Date.now(),
  };
  list.push(req);
  saveDeactivations(list);
  return req;
};

/** Resolve a deactivation request. Approving deactivates the account; denying
 *  just closes the request. */
export const decideDeactivation = (id: string, decision: 'approved' | 'denied'): void => {
  const list = loadDeactivations();
  const req = list.find((r) => r.id === id);
  if (!req) return;
  req.status = decision;
  req.decidedAt = Date.now();
  saveDeactivations(list);
  if (decision === 'approved') setAccountStatus(req.userId, 'inactive');
};
