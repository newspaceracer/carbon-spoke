// Shared transient confirmations — ONE success/status pattern across the app.
//
// A Carbon TOAST: floats in the top-right corner, stacks, auto-dismisses, and is
// announced politely to assistive tech (role="status") for a success/info message
// and assertively (role="alert") for a warning/error. This is the Carbon-standard
// placement for time-based feedback — not a bar pinned to the top of the content
// (that's the inline-notification pattern, reserved for persistent page state).
//
// Browser-only: import from a client <script> block (it touches document).
// `cds-toast-notification` is registered globally in src/carbon.ts, so it's
// available on every page without a per-page import.

export type ToastKind = 'success' | 'info' | 'warning' | 'error';

const HOST_ID = 'app-toast-host';

// One fixed host per page, created on first use. Its styles are injected once so
// the utility is self-contained (no per-page CSS to keep in sync).
function ensureHost(): HTMLElement {
  const existing = document.getElementById(HOST_ID);
  if (existing) return existing;

  const host = document.createElement('div');
  host.id = HOST_ID;
  document.body.appendChild(host);

  const style = document.createElement('style');
  style.textContent =
    `#${HOST_ID}{position:fixed;top:1rem;right:1rem;z-index:9000;display:flex;` +
    `flex-direction:column;gap:.5rem;inline-size:min(24rem,calc(100vw - 2rem));` +
    `pointer-events:none;}` +
    `#${HOST_ID} cds-toast-notification{pointer-events:auto;}` +
    `@media (max-width:30rem){#${HOST_ID}{left:1rem;right:1rem;inline-size:auto;}}`;
  document.head.appendChild(style);
  return host;
}

/** Show a transient confirmation toast (top-right, auto-dismissing). Success/info
 *  announce politely; warning/error announce assertively. */
export function showToast(title: string, subtitle = '', kind: ToastKind = 'success'): void {
  const host = ensureHost();
  const t = document.createElement('cds-toast-notification');
  t.setAttribute('kind', kind);
  // Carbon defaults a notification to role="alert" (assertive) — right for a
  // warning, too aggressive for a routine confirmation. Set the role BEFORE append
  // (Carbon only sets it when unset) so success/info announce via role="status".
  t.setAttribute('role', kind === 'warning' || kind === 'error' ? 'alert' : 'status');
  t.setAttribute('low-contrast', '');
  t.setAttribute('title', title);
  if (subtitle) t.setAttribute('subtitle', subtitle);
  t.setAttribute('timeout', '6000'); // auto-dismiss
  host.appendChild(t);
  // Remove on close (X or timeout); backstop cleanup in case the event is missed.
  t.addEventListener('cds-notification-closed', () => t.remove());
  window.setTimeout(() => t.remove(), 6600);
}
