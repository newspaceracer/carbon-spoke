// One delegated "copy this email" handler, shared by every surface that renders a
// copy-email affordance (ContactCard, AnalysisTeam, …). Any element carrying a
// `data-copy-email="<address>"` attribute becomes a copy button — click it and the
// address goes to the clipboard with a confirming toast.
//
// The listener installs ONCE per page, so several components can each call
// installEmailCopy() without stacking duplicates (which would fire the toast
// twice per click). The guard is a DOCUMENT flag, not a module-level boolean:
// Astro can bundle the same module into more than one page script, and each copy
// would carry its own `installed = false`.
import { showToast } from './toast';

const FLAG = 'emailCopyInstalled';

export function installEmailCopy(): void {
  const root = document.documentElement as HTMLElement;
  if (root.dataset[FLAG]) return;
  root.dataset[FLAG] = 'true';
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest?.('[data-copy-email]');
    if (!btn) return;
    const email = (btn as HTMLElement).dataset.copyEmail?.trim();
    if (!email) return;
    navigator.clipboard?.writeText(email).then(
      () => showToast('Email copied', email),
      () => showToast('Couldn’t copy the email', 'Select and copy the address manually.', 'error'),
    );
  });
}
