// ---------------------------------------------------------------------------
// Maintenance mode — shell decoration. Runs on EVERY page (from BaseLayout,
// right after the guard) to reflect the outage in the chrome:
//   • a full-width "Production site in Maintenance Mode" banner above the nav,
//   • the nav collapsed to only what each role may reach during the outage,
//   • the Log out global action wired to end the (simulated) session,
//   • a dev-only identity switcher so every role scenario is demoable.
//
// The guard (enforceMaintenance) owns redirects; this owns appearance. Both read
// the same localStorage-backed state in ./maintenance.
// ---------------------------------------------------------------------------
import { withBase } from './base';
import {
  ROUTES,
  isMaintenance,
  readIdentity,
  writeIdentity,
  routePath,
  type Identity,
} from './maintenance';

const BANNER_ID = 'maintenance-banner';
const SWITCHER_ID = 'demo-identity-switcher';
const RESET_ID = 'demo-permit-reset';

// ── Top banner ──────────────────────────────────────────────────────────
function paintBanner(): void {
  if (document.getElementById(BANNER_ID)) return;
  // carbon-checked: Carbon has no full-bleed fixed status banner component
  // (cds-notification is a boxed inline/toast alert, not a page-spanning bar).
  // This is the sanctioned bespoke "QA-style" strip; styling is token-only.
  const bar = document.createElement('div');
  bar.id = BANNER_ID;
  bar.setAttribute('role', 'status');
  bar.className = 'maintenance-banner';
  bar.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" aria-hidden="true" fill="currentColor">
      <path d="M16 2A14 14 0 1 0 30 16 14 14 0 0 0 16 2Zm-1.1 6h2.2v12h-2.2Zm1.1 19a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 16 27Z"/>
    </svg>
    <span>Production site in Maintenance Mode</span>`;
  document.body.insertBefore(bar, document.body.firstChild);
  document.body.classList.add('has-maintenance-banner');
}

// ── Nav collapse ──────────────────────────────────────────────────────────
// During an outage the top bar drops to essentials. The guard already redirects
// any stray click to the right place, so this is presentation: hide browsing nav
// + search + profile; keep Log out; give an admin a single link back to the
// console. Works against whichever header the page rendered (AppHeader/PermitNav).
function collapseNav(id: Identity): void {
  const header = document.querySelector('cds-header');
  if (!header) return;

  header.querySelectorAll('cds-header-nav, .header__search, cds-side-nav').forEach((el) => {
    (el as HTMLElement).style.display = 'none';
  });
  // Profile is not reachable during maintenance; only Log out stays.
  const profile = header.querySelector('cds-header-global-action[aria-label="Profile"]');
  if (profile) (profile as HTMLElement).style.display = 'none';

  if (id === 'admin' && !header.querySelector('[data-maintenance-nav]')) {
    const nav = document.createElement('cds-header-nav');
    nav.setAttribute('menu-bar-label', 'Maintenance');
    nav.setAttribute('data-maintenance-nav', '');
    nav.innerHTML = `<cds-header-nav-item href="${withBase(ROUTES.console)}">Maintenance mode admin console</cds-header-nav-item>`;
    const name = header.querySelector('cds-header-name');
    if (name && name.parentNode) name.parentNode.insertBefore(nav, name.nextSibling);
  }
}

// ── Log out (simulated) ─────────────────────────────────────────────────────
// The prototype's Log out action ends the session: identity → anon, then land on
// the notice (site down) or the login page (site up). Wired on every page.
function wireLogout(): void {
  document.querySelectorAll('cds-header-global-action[aria-label="Log out"]').forEach((el) => {
    if ((el as any).__mmWired) return;
    (el as any).__mmWired = true;
    el.addEventListener('click', () => {
      writeIdentity('anon');
      location.href = withBase(isMaintenance() ? ROUTES.notice : ROUTES.login);
    });
  });
}

// ── Dev-only identity switcher ──────────────────────────────────────────────
// No auth in a static prototype, so this control stands in for signing in as a
// different kind of user — the switch that makes every role scenario clickable.
function mountIdentitySwitcher(): void {
  if (document.getElementById(SWITCHER_ID)) return;
  const current = readIdentity();
  const options: { value: Identity; label: string }[] = [
    { value: 'admin', label: 'System Administrator' },
    { value: 'user', label: 'Reviewer (non-admin)' },
    { value: 'anon', label: 'Logged out' },
  ];
  // carbon-checked: the panel frame is a dev-only affordance (not product UI);
  // its control is a stock cds-dropdown. Frame styling is token-only.
  const box = document.createElement('div');
  box.id = SWITCHER_ID;
  box.className = 'demo-identity';
  box.innerHTML = `
    <p class="demo-identity__label t-label-01">Prototype identity</p>
    <cds-dropdown value="${current}" size="sm" label="Identity">
      ${options.map((o) => `<cds-dropdown-item value="${o.value}">${o.label}</cds-dropdown-item>`).join('')}
    </cds-dropdown>`;
  document.body.appendChild(box);
  const dd = box.querySelector('cds-dropdown') as any;
  dd?.addEventListener('cds-dropdown-selected', (e: any) => {
    const value = e.detail?.item?.value as Identity | undefined;
    if (value && value !== readIdentity()) {
      writeIdentity(value);
      location.reload();
    }
  });
}

// ── Dev-only permit state reset ─────────────────────────────────────────────
// The whole permit workflow lives in localStorage, spread across several keys — the
// lifecycle status, whether review was started, the wizard's step position, and the
// letter/parks/conditions drafts plus the reviewer comment thread — so a demoed
// permit stays wherever the last transition left it. Resetting must clear EVERY one
// of them: dropping only the status but leaving `permit-review-started-<id>` set
// lands the permit in "Under review + started", so the header reads "Open review"
// and the review gate is already unsealed — never the true "Start review" zero.
// This testing control wipes all of it and returns to the permit detail page at its
// seeded "Under review" stage. It rides in the same dev panel and appears whenever
// there's workflow state to reset, or whenever you're on the permit page — so a
// tester stranded on a downstream view (e.g. the letter) can still get back.
const PERMIT_STATE_PREFIXES = [
  'permit-status-',          // lifecycle status (Under review → Out for signature …)
  'permit-review-started-',  // the "review has begun" gate — the one the old list missed
  'permit-finalize-step-',   // resume position in the finalize wizard
  'permit-amendment-',       // amendment-exists flag
  'permit-final-',           // letter draft (the ② finalize fields)
  'permit-parks-',           // study-area park edits (wizard draft)
  'permit-conditions-',      // applied special conditions (wizard draft)
  'permit-comments-',        // reviewer comment thread — reverts to seed when cleared
];

function permitStateKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && PERMIT_STATE_PREFIXES.some((p) => k.startsWith(p))) keys.push(k);
  }
  return keys;
}

function mountPermitReset(): void {
  if (document.getElementById(RESET_ID)) return;
  const panel = document.getElementById(SWITCHER_ID);
  if (!panel) return; // rides in the same dev panel
  const onPermitPage = !!document.getElementById('permit-banner');
  if (!onPermitPage && permitStateKeys().length === 0) return; // nothing to reset

  const wrap = document.createElement('div');
  wrap.id = RESET_ID;
  wrap.className = 'demo-reset';
  // carbon-checked: dev-only affordance; the control is a stock cds-button.
  wrap.innerHTML = `
    <p class="demo-identity__label t-label-01">Testing</p>
    <cds-button kind="danger--tertiary" size="sm">Reset to Under review</cds-button>`;
  panel.appendChild(wrap);

  wrap.querySelector('cds-button')?.addEventListener('click', () => {
    permitStateKeys().forEach((k) => localStorage.removeItem(k));
    location.href = withBase('/permit');
  });
}

/** Apply all maintenance-aware shell treatments for this page load. */
export function decorateShell(): void {
  const run = () => {
    mountIdentitySwitcher();
    mountPermitReset();
    wireLogout();
    if (isMaintenance()) {
      const id = readIdentity();
      paintBanner();
      // A logged-out visitor on the public notice gets no nav at all (the notice
      // is the whole page); everyone else keeps a collapsed bar.
      if (id === 'anon' && routePath() === ROUTES.notice) {
        const header = document.querySelector('cds-header');
        if (header) (header as HTMLElement).style.display = 'none';
      } else {
        collapseNav(id);
      }
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}
