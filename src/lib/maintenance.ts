// ---------------------------------------------------------------------------
// Maintenance mode — the whole client-side model for the admin console feature.
//
// This is a STATIC Astro prototype with no backend, so two things that would
// normally be server truth are simulated in localStorage, the same convention
// the profile edits / permit comments already use:
//
//   1. Site state  — is the site LIVE or in MAINTENANCE, plus the public notice
//      message and when it was posted. Key: `site-maintenance`.
//   2. Identity    — who is "signed in": a System Administrator, a non-admin
//      reviewer, or a logged-out visitor. Key: `demo-identity`. A dev-only
//      switcher (mountIdentitySwitcher) flips this so every role scenario in the
//      ticket is clickable.
//
// The guard (enforceMaintenance) runs from BaseLayout on every page: when the
// site is in maintenance it routes everyone except an admin (on the console/
// login) to the public notice page. decorateShell paints the top banner and
// collapses the nav to the allowed items. All browser-only — never import from
// Astro frontmatter (it touches window/localStorage).
// ---------------------------------------------------------------------------
import { withBase } from './base';

export const PUBLIC_MESSAGE_LIMIT = 500;

// App-absolute routes (pre-base). Compare against location via routePath().
export const ROUTES = {
  notice: '/maintenance',
  console: '/admin/maintenance-mode',
  login: '/login',
  signup: '/signup',
  pending: '/pending',
} as const;

export type SiteStatus = 'live' | 'maintenance';
// 'pending' = signed in with a verified parks.ca.gov account that has NO reviewer
// role yet (awaiting an admin's grant). It's logged in but can reach almost
// nothing internal — see allowedWhilePending / enforcePending.
// 'researcher' = a signed-in member of the public (permit applicant). Logged in,
// non-internal: they own an applicant account/profile and submit applications.
// 'hq-technical' / 'district-lead' / 'district-assistant' = the review-role
// identities that let a prototype exercise role-scoped screens (e.g. the district
// admin console scopes its picker to the districts the role can edit; the special-
// conditions catalog scopes to the districts the role may curate). All three are
// non-admin reviewers, so every guard here treats them the same (non-admin) — they
// only carry a finer role a screen reads via editableDistricts()/curatableDistricts().
export type Identity =
  | 'admin'
  | 'anon'
  | 'pending'
  | 'researcher'
  | 'hq-technical'
  | 'district-lead'
  | 'district-assistant';

export interface SiteState {
  status: SiteStatus;
  /** Public notice shown on the maintenance page. */
  message: string;
  /** ISO instant the notice was posted (for display). */
  postedAt: string | null;
}

const STATE_KEY = 'site-maintenance';
const IDENTITY_KEY = 'demo-identity';
// The directory id of the signed-in PENDING user (a self-registered account
// awaiting a role). Only meaningful while identity === 'pending'.
const PENDING_USER_KEY = 'pending-user-id';

const DEFAULT_STATE: SiteState = { status: 'live', message: '', postedAt: null };

// ── Default public message ──────────────────────────────────────────────────
// Seeded into the message field each time a fresh maintenance window is set, with
// the current instant stamped as `yyyy-mm-dd hr:min:sec UTC` (the ticket's format).
export function formatUtc(d: Date): string {
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return (
    `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ` +
    `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`
  );
}

export function defaultNotice(now: Date = new Date()): string {
  return (
    'The California State Parks Scientific Collecting Permit web application is ' +
    'undergoing maintenance and will be back online soon. Maintenance notice ' +
    `posted at: ${formatUtc(now)}`
  );
}

// ── Site state ────────────────────────────────────────────────────────────
export function readState(): SiteState {
  try {
    const raw = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
    if (raw && typeof raw === 'object' && (raw.status === 'live' || raw.status === 'maintenance')) {
      return {
        status: raw.status,
        message: typeof raw.message === 'string' ? raw.message : '',
        postedAt: typeof raw.postedAt === 'string' ? raw.postedAt : null,
      };
    }
  } catch {}
  return { ...DEFAULT_STATE };
}

export function writeState(state: SiteState): void {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export const isMaintenance = (): boolean => readState().status === 'maintenance';

// ── Identity (prototype role simulation) ─────────────────────────────────────
export function readIdentity(): Identity {
  const v = localStorage.getItem(IDENTITY_KEY);
  return v === 'admin' || v === 'anon' || v === 'pending' ||
    v === 'researcher' || v === 'hq-technical' || v === 'district-lead' ||
    v === 'district-assistant'
    ? v
    : 'admin';
}

export function writeIdentity(id: Identity): void {
  localStorage.setItem(IDENTITY_KEY, id);
}

export const isAdmin = (): boolean => readIdentity() === 'admin';
export const isLoggedIn = (): boolean => readIdentity() !== 'anon';
export const isPending = (): boolean => readIdentity() === 'pending';

// ── Pending-user session (the self-registered account's directory id) ─────────
export function readPendingUserId(): string | null {
  return localStorage.getItem(PENDING_USER_KEY);
}
export function writePendingUserId(id: string): void {
  localStorage.setItem(PENDING_USER_KEY, id);
}
export function clearPendingUserId(): void {
  localStorage.removeItem(PENDING_USER_KEY);
}

// ── Path helpers ─────────────────────────────────────────────────────────
/** The current app-absolute path with the deploy base stripped and no trailing
 *  slash — so it lines up with the keys in ROUTES regardless of the /base/. */
export function routePath(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  let p = location.pathname;
  if (base && p.startsWith(base)) p = p.slice(base.length) || '/';
  p = p.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (p.length > 1) p = p.replace(/\/$/, '');
  return p || '/';
}

const isRoute = (route: string, at = routePath()): boolean =>
  at === route || at === `${route}/`;

/**
 * Where the current visitor is allowed to be while the site is in maintenance.
 * Everything else routes to the public notice.
 *   admin → console + login (works on the app during the outage)
 *   user  → the notice only (nav shows just Log out)
 *   anon  → the notice + login (can sign in from the outage screen)
 */
export function allowedDuringMaintenance(id: Identity, at = routePath()): boolean {
  if (isRoute(ROUTES.notice, at)) return true;
  if (id === 'admin') return isRoute(ROUTES.console, at) || isRoute(ROUTES.login, at);
  if (id === 'anon') return isRoute(ROUTES.login, at);
  return false; // logged-in non-admin: notice only
}

// ── Guard ────────────────────────────────────────────────────────────────
/** Redirect to the maintenance notice (or, for an admin, the console) when the
 *  site is down and this page isn't allowed for the current role. Returns true
 *  if it redirected, so callers can stop initializing the page. */
export function enforceMaintenance(): boolean {
  if (!isMaintenance()) return false;
  const id = readIdentity();
  if (allowedDuringMaintenance(id)) return false;
  const target = id === 'admin' ? ROUTES.console : ROUTES.notice;
  location.replace(withBase(target));
  return true;
}

// ── Pending-role guard ──────────────────────────────────────────────────────
// A signed-in-but-roleless user (strict least privilege) can reach only their
// pending home, the public applicant/register surfaces, and the auth pages.
// Everything internal (reviewer + admin) routes back to /pending.
const PENDING_ALLOWED = [
  ROUTES.pending,
  ROUTES.signup,
  ROUTES.login,
  ROUTES.notice,
  '/landing',
  '/apply',
  '/search',
];

export function allowedWhilePending(at = routePath()): boolean {
  return PENDING_ALLOWED.some((r) => isRoute(r, at));
}

/** Redirect a pending (roleless) user to their pending home when they land on
 *  any page they can't reach yet. Returns true if it redirected. */
export function enforcePending(): boolean {
  if (readIdentity() !== 'pending') return false;
  if (allowedWhilePending()) return false;
  location.replace(withBase(ROUTES.pending));
  return true;
}
